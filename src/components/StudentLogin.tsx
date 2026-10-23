import React, { useState } from 'react';
import { Language, Student } from '../types/quiz';
import { TRANSLATIONS } from '../data/translations';
import { verifyStudentCredentials } from '../services/auth';
import { Trophy, KeyRound, UserCheck, HelpCircle } from 'lucide-react';

interface StudentLoginProps {
  lang: Language;
  students: Student[];
  onLoginSuccess: (student: Student) => void;
  onViewLeaderboard: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  lang,
  students,
  onLoginSuccess,
  onViewLeaderboard,
}) => {
  const t = TRANSLATIONS[lang];
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRosterHint, setShowRosterHint] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) return;

    // Check credentials against the database
    const matched = verifyStudentCredentials(students, identifier, password);
    if (matched) {
      setErrorMsg('');
      onLoginSuccess(matched);
    } else {
      setErrorMsg(t.loginError);
    }
  };

  const handleSelectQuickFill = (s: Student) => {
    setIdentifier(s.username);
    setPassword(s.password);
    setShowRosterHint(false);
  };

  return (
    <div className="login-box text-center">
      <div className="inline-flex p-3 rounded-2xl bg-[#d8b45c]/10 text-[#d8b45c] mb-3">
        <UserCheck size={28} />
      </div>

      <h2 className={`text-xl sm:text-2xl font-bold mb-1.5 text-[#f0dfa6] ${
        lang === 'ar' ? 'font-aref' : 'font-cormorant'
      }`}>
        {t.loginTitle}
      </h2>
      <p className="text-sm text-[var(--muted)] mb-5">
        {t.loginSub}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
        <div>
          <label className="block text-xs font-semibold text-[#d8b45c] mb-1.5 px-1 text-inherit">
            {lang === 'ar' ? 'اسم المستخدم / الرقم التعريفي' : 'Username / Student ID'}
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setErrorMsg('');
            }}
            placeholder={t.usernamePlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-[#d8b45c]/35 bg-[rgba(247,240,220,0.05)] text-[var(--parchment)] placeholder-[var(--muted2)] focus:outline-none focus:border-[#d8b45c] text-sm text-center"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#d8b45c] mb-1.5 px-1 text-inherit">
            {lang === 'ar' ? 'كلمة المرور' : 'Password'}
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder={t.passwordPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-[#d8b45c]/35 bg-[rgba(247,240,220,0.05)] text-[var(--parchment)] placeholder-[var(--muted2)] focus:outline-none focus:border-[#d8b45c] text-sm text-center"
            />
            <KeyRound size={16} className="absolute right-3.5 top-3.5 text-[var(--muted2)] pointer-events-none opacity-40" />
          </div>
        </div>

        {errorMsg && (
          <div className="text-xs text-[var(--fb-bad)] bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={!identifier.trim() || !password.trim()}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-base bg-[#d8b45c] text-[#0a1230] hover:bg-[#e4c473] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.99] mt-2"
        >
          {t.startBtn}
        </button>
      </form>

      <div className="mt-4 pt-3 border-t border-[#d8b45c]/15">
        <button
          type="button"
          onClick={() => setShowRosterHint(!showRosterHint)}
          className="text-xs text-[#d8b45c] hover:underline flex items-center justify-center gap-1 mx-auto mb-2"
        >
          <HelpCircle size={13} />
          <span>{lang === 'ar' ? 'عرض قائمة الطلاب للتجربة السريعة' : 'Quick Demo Student Select'}</span>
        </button>

        {showRosterHint && (
          <div className="bg-black/40 border border-[#d8b45c]/30 rounded-xl p-2.5 my-2 max-h-40 overflow-y-auto text-xs text-left">
            <p className="text-[10px] text-[var(--muted2)] mb-1 text-center font-mono">
              {lang === 'ar' ? 'اضغط على أي طالب لتعبئة البيانات تلقائياً:' : 'Click any student to auto-fill:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {students.slice(0, 8).map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectQuickFill(s)}
                  className="px-2 py-1 bg-white/5 hover:bg-[#d8b45c]/20 border border-white/10 rounded flex justify-between items-center text-left"
                >
                  <span className="font-semibold text-[#f0dfa6]">{s.firstName} {s.lastName}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{s.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onViewLeaderboard}
          className="w-full py-2.5 px-4 rounded-xl border border-[#d8b45c]/50 text-[#f0dfa6] hover:bg-[#d8b45c]/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Trophy size={16} />
          <span>{t.viewBoardBtn}</span>
        </button>
      </div>
    </div>
  );
};
