import React, { useState, useEffect, useRef } from 'react';
import { Language, Student, Question, AnswerTimingLog } from '../types/quiz';
import { TRANSLATIONS } from '../data/translations';

const TIME_LIMIT = 30;
const MAX_POINTS = 1000;
const MIN_POINTS = 300;

interface QuizViewProps {
  lang: Language;
  student: Student;
  questions: Question[];
  onFinishQuiz: (
    score: number,
    correctCount: number,
    timings: Omit<AnswerTimingLog, 'logId' | 'sessionId' | 'studentId' | 'studentName'>[]
  ) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  lang,
  student,
  questions,
  onFinishQuiz,
}) => {
  const t = TRANSLATIONS[lang];
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    status: 'ok' | 'bad' | 'timeout' | null;
    points?: number;
    timeSec?: number;
  }>({ status: null });

  const timingLogsRef = useRef<Omit<AnswerTimingLog, 'logId' | 'sessionId' | 'studentId' | 'studentName'>[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const studentFullName = `${student.firstName} ${student.lastName}`;
  const currentQuestion = questions[current];
  const optionLetters = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];

  // Start timer for current question
  useEffect(() => {
    setTimeLeft(TIME_LIMIT);
    setIsAnswered(false);
    setSelectedIdx(null);
    setFeedback({ status: null });

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleAnswer(-1, 0); // Timeout
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, questions]);

  const handleAnswer = (choiceIdx: number, remainingTime = timeLeft) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedIdx(choiceIdx);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const timeSpentSec = Number((TIME_LIMIT - remainingTime).toFixed(1));
    const isCorrect = choiceIdx === currentQuestion.correct;
    const points = isCorrect
      ? Math.max(MIN_POINTS, Math.round(MAX_POINTS * (remainingTime / TIME_LIMIT)))
      : 0;

    if (isCorrect) {
      setTotalScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      setFeedback({ status: 'ok', points, timeSec: timeSpentSec });
    } else if (choiceIdx === -1) {
      setFeedback({ status: 'timeout', points: 0, timeSec: TIME_LIMIT });
    } else {
      setFeedback({ status: 'bad', points: 0, timeSec: timeSpentSec });
    }

    // Save timing telemetry
    timingLogsRef.current.push({
      questionIndex: current + 1,
      questionSnippet: currentQuestion.q.slice(0, 60),
      selectedChoice: choiceIdx >= 0 ? currentQuestion.choices[choiceIdx] : "(انتهى الوقت / Timeout)",
      correctChoice: currentQuestion.choices[currentQuestion.correct],
      isCorrect,
      timeSpentSec,
      pointsEarned: points,
      timestamp: new Date().toISOString(),
    });
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      // Finished all questions
      onFinishQuiz(totalScore, correctCount, timingLogsRef.current);
    }
  };

  // Timer warning levels
  const timerBadgeClass =
    timeLeft <= 2 ? 'border-[var(--bad)] text-[var(--fb-bad)]' :
    timeLeft <= 5 ? 'border-[var(--warn)] text-[var(--warn)]' :
    'border-[#d8b45c] text-[#f0dfa6]';

  const timerFillClass =
    timeLeft <= 2 ? 'bg-[var(--bad)]' :
    timeLeft <= 5 ? 'bg-[var(--warn)]' :
    'bg-[#d8b45c]';

  const fillPercent = Math.max(0, (timeLeft / TIME_LIMIT) * 100);

  return (
    <div className="quiz-container">
      {/* Progress indicators */}
      <div className="flex gap-1.5 mb-4">
        {questions.map((_, idx) => {
          const isDone = idx < current;
          const isCurr = idx === current;
          return (
            <div
              key={idx}
              className="flex-1 h-1.5 rounded-full bg-[#d8b45c]/20 overflow-hidden relative"
            >
              {isDone && <div className="absolute inset-0 bg-[#d8b45c]" />}
              {isCurr && <div className="absolute inset-0 bg-[#f0dfa6]" />}
            </div>
          );
        })}
      </div>

      {/* Header bar: Student label & Circular timer */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-semibold text-[#d8b45c]">
          {t.qLabel(studentFullName, current + 1, questions.length)}
        </span>
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm tabular-nums transition-colors ${timerBadgeClass}`}
          >
            {Math.ceil(timeLeft)}
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-1.5 rounded-full bg-[#d8b45c]/20 overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-100 linear ${timerFillClass}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {/* Question Prompt */}
      <p
        className={`text-lg sm:text-xl leading-relaxed mb-5 text-[var(--parchment)] whitespace-pre-line font-medium ${
          lang === 'ar' ? 'font-aref' : 'font-cormorant'
        }`}
      >
        {currentQuestion.q}
      </p>

      {/* Choices List */}
      <div className="flex flex-col gap-2.5">
        {currentQuestion.choices.map((choice, i) => {
          let btnStyle = "bg-[rgba(247,240,220,0.04)] border-[#d8b45c]/30 text-[var(--parchment)] hover:border-[#d8b45c]";
          
          if (isAnswered) {
            if (i === currentQuestion.correct) {
              btnStyle = "bg-emerald-500/25 border-emerald-500 text-emerald-200 font-bold";
            } else if (i === selectedIdx) {
              btnStyle = "bg-red-500/25 border-red-500 text-red-200";
            } else {
              btnStyle = "opacity-40 border-gray-600/30 text-gray-400";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base transition-all duration-150 flex items-start gap-2.5 ${btnStyle}`}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <span className="font-bold text-[#d8b45c] shrink-0">
                {optionLetters[i]})
              </span>
              <span className="flex-1 text-inherit">{choice}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback area */}
      <div className="min-h-12 mt-4 text-center">
        {feedback.status === 'ok' && (
          <div className="text-emerald-400 text-sm font-bold animate-fadeIn">
            {t.correctFb}
            <div>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#d8b45c]/15 text-[#f0dfa6] text-xs font-bold">
                {t.pointsPill(feedback.points || 0, feedback.timeSec || 0)}
              </span>
            </div>
          </div>
        )}
        {feedback.status === 'bad' && (
          <div className="text-red-400 text-sm font-semibold animate-fadeIn">
            {t.wrongFb}
          </div>
        )}
        {feedback.status === 'timeout' && (
          <div className="text-amber-400 text-sm font-semibold animate-fadeIn">
            {t.timeoutFb}
          </div>
        )}
      </div>

      {/* Next button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold text-base bg-[#d8b45c] text-[#0a1230] hover:bg-[#e4c473] transition-all shadow-md transform active:scale-[0.99] animate-fadeIn"
        >
          {current + 1 < questions.length ? t.nextBtn : t.resultTitle}
        </button>
      )}
    </div>
  );
};
