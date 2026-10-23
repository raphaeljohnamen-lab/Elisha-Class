import { Student, Question, AnswerTimingLog, QuizScore, LeaderboardEntry } from '../types/quiz';

export interface DatabaseSnapshot {
  students: Student[];
  questions: { ar: Question[]; en: Question[] };
  timings: AnswerTimingLog[];
  scores: QuizScore[];
  leaderboard: LeaderboardEntry[];
}

export const createQuizSpreadsheet = async (
  accessToken: string,
  snapshot: DatabaseSnapshot,
  customTitle = "Elisha Class - Luke 1 Quiz Database"
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const requestBody = {
    properties: {
      title: customTitle,
    },
    sheets: [
      { properties: { title: "Students", gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: "Questions", gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: "Answer_Timings", gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: "Scores", gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: "Leaderboard", gridProperties: { frozenRowCount: 1 } } },
    ],
  };

  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Populate all initial tabs with data
  await populateSpreadsheet(accessToken, spreadsheetId, snapshot);

  return { spreadsheetId, spreadsheetUrl };
};

export const populateSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  snapshot: DatabaseSnapshot
) => {
  // Students tab data
  const studentsValues = [
    ["StudentID", "Username", "Password", "FirstName", "LastName", "Class", "Role"],
    ...snapshot.students.map(s => [s.id, s.username, s.password, s.firstName, s.lastName, s.className, "Student"]),
  ];

  // Questions tab data
  const allQuestions = [...snapshot.questions.ar, ...snapshot.questions.en];
  const questionsValues = [
    ["ID", "Language", "QuestionText", "OptionA", "OptionB", "OptionC", "OptionD", "CorrectIndex"],
    ...allQuestions.map(q => [
      q.id,
      q.lang,
      q.q,
      q.choices[0] || "",
      q.choices[1] || "",
      q.choices[2] || "",
      q.choices[3] || "",
      q.correct,
    ]),
  ];

  // Answer timings tab data
  const timingsValues = [
    ["LogID", "SessionID", "StudentID", "StudentName", "QuestionIndex", "QuestionSnippet", "SelectedChoice", "CorrectChoice", "IsCorrect", "TimeSpentSeconds", "PointsEarned", "Timestamp"],
    ...snapshot.timings.map(t => [
      t.logId,
      t.sessionId,
      t.studentId,
      t.studentName,
      t.questionIndex,
      t.questionSnippet.replace(/\n/g, " "),
      t.selectedChoice,
      t.correctChoice,
      t.isCorrect ? "TRUE" : "FALSE",
      t.timeSpentSec,
      t.pointsEarned,
      t.timestamp,
    ]),
  ];

  // Scores tab data
  const scoresValues = [
    ["SessionID", "StudentID", "StudentName", "Score", "CorrectCount", "TotalQuestions", "AvgTimePerQuestionSec", "Language", "CompletedAt"],
    ...snapshot.scores.map(s => [
      s.sessionId,
      s.studentId,
      s.studentName,
      s.score,
      s.correct,
      s.total,
      s.avgTimePerQ,
      s.lang,
      s.date,
    ]),
  ];

  // Leaderboard tab data
  const leaderboardValues = [
    ["Rank", "StudentName", "StudentID", "HighScore", "AttemptsCount", "LastPlayed"],
    ...snapshot.leaderboard.map((l, i) => [
      i + 1,
      l.studentName,
      l.studentId,
      l.highScore,
      l.attemptsCount,
      l.lastPlayed,
    ]),
  ];

  const batchData = [
    { range: "Students!A1", values: studentsValues },
    { range: "Questions!A1", values: questionsValues },
    { range: "Answer_Timings!A1", values: timingsValues },
    { range: "Scores!A1", values: scoresValues },
    { range: "Leaderboard!A1", values: leaderboardValues },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: batchData,
      }),
    }
  );

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    console.error("Batch update failed:", errorText);
  }
};

export const appendScoreAndTimings = async (
  accessToken: string,
  spreadsheetId: string,
  score: QuizScore,
  timings: AnswerTimingLog[]
) => {
  // 1. Append to Scores
  const scoreRow = [
    score.sessionId,
    score.studentId,
    score.studentName,
    score.score,
    score.correct,
    score.total,
    score.avgTimePerQ,
    score.lang,
    score.date,
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Scores!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [scoreRow] }),
    }
  );

  // 2. Append to Answer_Timings
  if (timings.length > 0) {
    const timingRows = timings.map(t => [
      t.logId,
      t.sessionId,
      t.studentId,
      t.studentName,
      t.questionIndex,
      t.questionSnippet.replace(/\n/g, " "),
      t.selectedChoice,
      t.correctChoice,
      t.isCorrect ? "TRUE" : "FALSE",
      t.timeSpentSec,
      t.pointsEarned,
      t.timestamp,
    ]);

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Answer_Timings!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: timingRows }),
      }
    );
  }
};

// CSV Export Utilities for immediate offline inspection
export const exportTableToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map(r => r.map(escapeCsv).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
