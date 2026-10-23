import { Student, Question, AnswerTimingLog, QuizScore, LeaderboardEntry, GoogleSheetConfig, Language } from '../types/quiz';
import { INITIAL_STUDENTS } from '../data/students';
import { DEFAULT_QUESTIONS_AR, DEFAULT_QUESTIONS_EN } from '../data/questions';
import { appendScoreAndTimings, DatabaseSnapshot } from './googleSheets';
import { getAccessToken } from './auth';

const STORAGE_KEYS = {
  STUDENTS: 'elisha_quiz_students_v1',
  QUESTIONS_AR: 'elisha_quiz_questions_ar_v1',
  QUESTIONS_EN: 'elisha_quiz_questions_en_v1',
  SCORES: 'elisha_quiz_scores_v1',
  TIMINGS: 'elisha_quiz_timings_v1',
  SHEET_CONFIG: 'elisha_quiz_sheet_config_v1',
};

// Seed sample timing & score records so Database Inspector is informative right away
const INITIAL_SCORES: QuizScore[] = [
  {
    sessionId: "sess_sample_1",
    studentId: "120",
    studentName: "Raphael John",
    score: 4620,
    correct: 5,
    total: 5,
    avgTimePerQ: 4.8,
    lang: "ar",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    sessionId: "sess_sample_2",
    studentId: "101",
    studentName: "Antoni Nagi",
    score: 4180,
    correct: 5,
    total: 5,
    avgTimePerQ: 5.4,
    lang: "ar",
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    sessionId: "sess_sample_3",
    studentId: "105",
    studentName: "Chris Michael",
    score: 3850,
    correct: 4,
    total: 5,
    avgTimePerQ: 6.1,
    lang: "en",
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const INITIAL_TIMINGS: AnswerTimingLog[] = [
  {
    logId: "log_samp_1",
    sessionId: "sess_sample_1",
    studentId: "120",
    studentName: "Raphael John",
    questionIndex: 1,
    questionSnippet: "مريم قالت: «هوذا أنا أمة الرب»...",
    selectedChoice: "الطاعة والثقة في ربنا حتى لو مش عارفين كل التفاصيل",
    correctChoice: "الطاعة والثقة في ربنا حتى لو مش عارفين كل التفاصيل",
    isCorrect: true,
    timeSpentSec: 3.8,
    pointsEarned: 924,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    logId: "log_samp_2",
    sessionId: "sess_sample_1",
    studentId: "120",
    studentName: "Raphael John",
    questionIndex: 2,
    questionSnippet: "أليصابات قالت لمريم: «مباركة أنت في النساء»...",
    selectedChoice: "أليصابات",
    correctChoice: "أليصابات",
    isCorrect: true,
    timeSpentSec: 4.2,
    pointsEarned: 916,
    timestamp: new Date(Date.now() - 3600000 * 2 + 15000).toISOString(),
  },
  {
    logId: "log_samp_3",
    sessionId: "sess_sample_2",
    studentId: "101",
    studentName: "Antoni Nagi",
    questionIndex: 1,
    questionSnippet: "مريم قالت: «هوذا أنا أمة الرب»...",
    selectedChoice: "الطاعة والثقة في ربنا حتى لو مش عارفين كل التفاصيل",
    correctChoice: "الطاعة والثقة في ربنا حتى لو مش عارفين كل التفاصيل",
    isCorrect: true,
    timeSpentSec: 5.1,
    pointsEarned: 898,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

class DatabaseStore {
  private students: Student[];
  private questions: { ar: Question[]; en: Question[] };
  private scores: QuizScore[];
  private timings: AnswerTimingLog[];
  private sheetConfig: GoogleSheetConfig;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.students = this.load(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    this.questions = {
      ar: this.load(STORAGE_KEYS.QUESTIONS_AR, DEFAULT_QUESTIONS_AR),
      en: this.load(STORAGE_KEYS.QUESTIONS_EN, DEFAULT_QUESTIONS_EN),
    };
    this.scores = this.load(STORAGE_KEYS.SCORES, INITIAL_SCORES);
    this.timings = this.load(STORAGE_KEYS.TIMINGS, INITIAL_TIMINGS);
    this.sheetConfig = this.load(STORAGE_KEYS.SHEET_CONFIG, {
      spreadsheetId: null,
      spreadsheetUrl: null,
      isConnected: false,
      connectedAt: null,
      accountEmail: null,
    });
  }

  private memoryStore: Record<string, string> = {};

  private load<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage read fallback for", key);
    }
    if (this.memoryStore[key]) {
      try {
        return JSON.parse(this.memoryStore[key]);
      } catch (e) {}
    }
    return fallback;
  }

  private save(key: string, data: any) {
    const serialized = JSON.stringify(data);
    this.memoryStore[key] = serialized;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
      }
    } catch (e) {
      console.warn("Storage write fallback for", key);
    }
    this.notify();
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // Getters
  public getStudents(): Student[] {
    return this.students;
  }

  public getQuestions(lang: Language): Question[] {
    return this.questions[lang];
  }

  public getAllQuestions() {
    return this.questions;
  }

  public getScores(): QuizScore[] {
    return this.scores;
  }

  public getTimings(): AnswerTimingLog[] {
    return this.timings;
  }

  public getSheetConfig(): GoogleSheetConfig {
    return this.sheetConfig;
  }

  public getLeaderboard(): LeaderboardEntry[] {
    const studentMap = new Map<string, { highScore: number; count: number; name: string; last: string }>();

    this.scores.forEach(s => {
      const current = studentMap.get(s.studentId) || { highScore: 0, count: 0, name: s.studentName, last: s.date };
      current.highScore = Math.max(current.highScore, s.score);
      current.count += 1;
      if (new Date(s.date) > new Date(current.last)) {
        current.last = s.date;
      }
      studentMap.set(s.studentId, current);
    });

    const entries: LeaderboardEntry[] = Array.from(studentMap.entries())
      .map(([id, info]) => ({
        studentId: id,
        studentName: info.name,
        highScore: info.highScore,
        attemptsCount: info.count,
        lastPlayed: info.last,
      }))
      .sort((a, b) => b.highScore - a.highScore)
      .map((e, index) => ({ ...e, rank: index + 1 }));

    return entries;
  }

  public getDatabaseSnapshot(): DatabaseSnapshot {
    return {
      students: this.students,
      questions: this.questions,
      timings: this.timings,
      scores: this.scores,
      leaderboard: this.getLeaderboard(),
    };
  }

  // Actions
  public async recordQuizAttempt(
    student: Student,
    score: number,
    correctCount: number,
    totalQuestions: number,
    timingLogs: Omit<AnswerTimingLog, 'logId' | 'sessionId' | 'studentId' | 'studentName'>[],
    lang: Language
  ): Promise<QuizScore> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const studentName = `${student.firstName} ${student.lastName}`;
    const timestamp = new Date().toISOString();

    const fullTimingLogs: AnswerTimingLog[] = timingLogs.map((log, i) => ({
      ...log,
      logId: `log_${Date.now()}_${i}`,
      sessionId,
      studentId: student.id,
      studentName,
    }));

    const totalSeconds = timingLogs.reduce((acc, curr) => acc + curr.timeSpentSec, 0);
    const avgTimePerQ = timingLogs.length ? Number((totalSeconds / timingLogs.length).toFixed(1)) : 0;

    const newScore: QuizScore = {
      sessionId,
      studentId: student.id,
      studentName,
      score,
      correct: correctCount,
      total: totalQuestions,
      avgTimePerQ,
      lang,
      date: timestamp,
    };

    // Update students lastActive
    this.students = this.students.map(s => s.id === student.id ? { ...s, lastActive: timestamp } : s);
    this.save(STORAGE_KEYS.STUDENTS, this.students);

    this.scores = [newScore, ...this.scores];
    this.save(STORAGE_KEYS.SCORES, this.scores);

    this.timings = [...fullTimingLogs, ...this.timings];
    this.save(STORAGE_KEYS.TIMINGS, this.timings);

    // If connected to Google Sheets and have access token, push rows
    if (this.sheetConfig.isConnected && this.sheetConfig.spreadsheetId) {
      try {
        const token = await getAccessToken();
        if (token) {
          await appendScoreAndTimings(token, this.sheetConfig.spreadsheetId, newScore, fullTimingLogs);
        }
      } catch (err) {
        console.warn("Could not sync attempt to Google Sheets:", err);
      }
    }

    return newScore;
  }

  public updateQuestions(lang: Language, newQuestions: Question[]) {
    this.questions[lang] = newQuestions;
    const key = lang === 'ar' ? STORAGE_KEYS.QUESTIONS_AR : STORAGE_KEYS.QUESTIONS_EN;
    this.save(key, newQuestions);
  }

  public resetQuestions(lang: Language) {
    const defaults = lang === 'ar' ? DEFAULT_QUESTIONS_AR : DEFAULT_QUESTIONS_EN;
    this.updateQuestions(lang, defaults);
  }

  public resetLeaderboard() {
    this.scores = [];
    this.timings = [];
    this.save(STORAGE_KEYS.SCORES, this.scores);
    this.save(STORAGE_KEYS.TIMINGS, this.timings);
  }

  public updateStudentPassword(studentId: string, newPass: string) {
    this.students = this.students.map(s => s.id === studentId ? { ...s, password: newPass } : s);
    this.save(STORAGE_KEYS.STUDENTS, this.students);
  }

  public connectGoogleSheet(spreadsheetId: string, spreadsheetUrl: string, accountEmail?: string | null) {
    this.sheetConfig = {
      spreadsheetId,
      spreadsheetUrl,
      isConnected: true,
      connectedAt: new Date().toISOString(),
      accountEmail: accountEmail || null,
    };
    this.save(STORAGE_KEYS.SHEET_CONFIG, this.sheetConfig);
  }

  public disconnectGoogleSheet() {
    this.sheetConfig = {
      spreadsheetId: null,
      spreadsheetUrl: null,
      isConnected: false,
      connectedAt: null,
      accountEmail: null,
    };
    this.save(STORAGE_KEYS.SHEET_CONFIG, this.sheetConfig);
  }
}

export const dbStore = new DatabaseStore();
