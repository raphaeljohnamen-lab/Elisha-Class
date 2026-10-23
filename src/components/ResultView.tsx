import React from 'react';
import { Language, Student, AnswerTimingLog, GoogleSheetConfig } from '../types/quiz';
import { TRANSLATIONS } from '../data/translations';
import { Trophy, RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface ResultViewProps {
  lang: Language;
  student: Student;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timingLogs: Omit<AnswerTimingLog, 'logId' | 'sessionId' | 'studentId' | 'studentName'>[];
  sheetConfig: GoogleSheetConfig;
  onViewLeaderboard: () => void;
  onRestart: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  lang,
  student,
  score,
  correctCount,
  totalQuestions,
  timingLogs,
  sheetConfig,
  onViewLeaderboard,
  onRestart,
}) => {
  const t = TRANSLATIONS[lang];
  const studentFullName = `${student.firstName} ${student.lastName}`;

  let medal = '⭐';
  let message = t.msgTryAgain;
  if (correctCount === totalQuestions) {
    medal = '🏆';
    message = t.msgPerfect;
  } else if (correctCount >= totalQuestions - 1) {
    medal = '🌟';
    message = t.msgGreat;
  }

  const totalTime = timingLogs.reduce((acc, curr) => acc + curr.timeSpentSec, 0);
  const avgTime = timingLogs.length ? totalTime / timingLogs.length : 0;

  return (
    <div className="result-container text-center">
      <div className="text-5xl mb-2 animate-bounce">{medal}</div>

      <h2
        className={`text-2xl font-bold text-[#f0dfa6] mb-1 ${
          lang === 'ar' ? 'font-aref' : 'font-cormorant'
        }`}
      >
        {t.resultTitle}
      </h2>

      <div className="text-xl font-extrabold text-[#d8b45c] mb-0.5">
        {t.scoreLine(studentFullName, score)}
      </div>

      <div className="text-xs sm:text-sm text-[var(--muted)] mb-2 font-medium">
        {t.scoreSub(correctCount, totalQuestions)}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-[#d8b45c]/25 text-xs text-[#f0dfa6] mb-3">
        <Clock size={13} className="text-[#d8b45c]" />
        <span>{t.avgTimeText(avgTime)}</span>
      </div>

      <p className="text-sm text-[var(--parchment)] mb-4 px-2">{message}</p>

      {/* Breakdown of answer timings for this attempt */}
      <div className="bg-black/30 border border-[#d8b45c]/20 rounded-xl p-3 mb-5 text-left text-xs">
        <div className="text-[11px] font-bold text-[#d8b45c] mb-2 flex items-center justify-between">
          <span>{lang === 'ar' ? 'تفاصيل الإجابات وسرعة الحل:' : 'Answer Timing Breakdown:'}</span>
          <span>{lang === 'ar' ? 'المجموع: ' : 'Total: '} {totalTime.toFixed(1)}s</span>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {timingLogs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 px-2 rounded bg-white/5 border border-white/5 text-[11px]"
            >
              <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                {log.isCorrect ? (
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={13} className="text-red-400 shrink-0" />
                )}
                <span className="truncate text-gray-300">Q{log.questionIndex}: {log.questionSnippet}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                <span className="text-[#f0dfa6]">{log.timeSpentSec}s</span>
                <span className={log.pointsEarned > 0 ? "text-emerald-400 font-bold" : "text-gray-500"}>
                  +{log.pointsEarned}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync status notification */}
      <div className="text-xs text-emerald-400 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg py-2 px-3">
        {sheetConfig.isConnected ? (
          <span>{t.saved} &amp; Google Sheets</span>
        ) : (
          <span>{t.saved}</span>
        )}
      </div>

      <div className="space-y-2.5">
        <button
          onClick={onViewLeaderboard}
          className="w-full py-3 px-4 rounded-xl font-bold text-base bg-[#d8b45c] text-[#0a1230] hover:bg-[#e4c473] transition-all flex items-center justify-center gap-2 shadow"
        >
          <Trophy size={18} />
          <span>{t.boardBtn}</span>
        </button>

        <button
          onClick={onRestart}
          className="w-full py-2.5 px-4 rounded-xl border border-[#d8b45c]/50 text-[#f0dfa6] hover:bg-[#d8b45c]/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          <span>{t.restartBtn}</span>
        </button>
      </div>
    </div>
  );
};
