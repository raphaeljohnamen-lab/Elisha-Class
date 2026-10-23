import React from 'react';
import { Language, LeaderboardEntry, Student } from '../types/quiz';
import { TRANSLATIONS } from '../data/translations';
import { Trophy, ArrowLeft, ArrowRight, User } from 'lucide-react';

interface LeaderboardViewProps {
  lang: Language;
  entries: LeaderboardEntry[];
  currentStudent: Student | null;
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  lang,
  entries,
  currentStudent,
  onBack,
}) => {
  const t = TRANSLATIONS[lang];
  const medals = ['🥇', '🥈', '🥉'];
  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="leaderboard-container">
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`text-2xl font-bold text-[#f0dfa6] flex items-center gap-2 ${
            lang === 'ar' ? 'font-aref' : 'font-cormorant'
          }`}
        >
          <Trophy className="text-[#d8b45c]" size={22} />
          <span>{t.boardTitle}</span>
        </h2>
        <span className="text-xs text-[var(--muted2)] px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          {entries.length} {lang === 'ar' ? 'متسابق' : 'Players'}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted2)] text-sm border border-[#d8b45c]/20 rounded-xl bg-black/20 my-4">
          <p>{t.boardEmpty}</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6 max-h-[380px] overflow-y-auto pr-1">
          {entries.map((entry, idx) => {
            const isMe = currentStudent && currentStudent.id === entry.studentId;
            return (
              <div
                key={entry.studentId}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-sm ${
                  isMe
                    ? 'border-[#d8b45c] bg-[#d8b45c]/15 shadow-sm'
                    : 'border-[#d8b45c]/20 bg-[rgba(247,240,220,0.04)] hover:border-[#d8b45c]/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 text-center font-extrabold text-[#d8b45c] shrink-0 text-base">
                    {medals[idx] || (idx + 1)}
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-[var(--parchment)] flex items-center gap-1.5 truncate">
                      {isMe && <User size={13} className="text-[#d8b45c] shrink-0" />}
                      <span className="truncate">{entry.studentName}</span>
                    </span>
                    <span className="text-[10px] text-[var(--muted2)] block">
                      ID: {entry.studentId} · {entry.attemptsCount} {lang === 'ar' ? 'محاولات' : 'attempts'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-[#d8b45c] font-mono tabular-nums">
                    {entry.highScore}
                  </span>
                  <span className="text-[10px] text-[var(--muted2)] block">
                    {lang === 'ar' ? 'نقطة' : 'pts'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full py-2.5 px-4 rounded-xl border border-[#d8b45c]/50 text-[#f0dfa6] hover:bg-[#d8b45c]/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
      >
        <BackIcon size={16} />
        <span>{t.backBtn}</span>
      </button>
    </div>
  );
};
