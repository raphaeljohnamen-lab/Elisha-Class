import React from 'react';
import { Language, Theme, AppMode, GoogleSheetConfig } from '../types/quiz';
import { TRANSLATIONS } from '../data/translations';
import { ExternalLink } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  theme: Theme;
  mode: AppMode;
  sheetConfig: GoogleSheetConfig;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onSelectMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  theme,
  mode,
  sheetConfig,
  onToggleLang,
  onToggleTheme,
  onSelectMode,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="text-center mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        {/* Mode switcher: Student / Servant */}
        <div className="flex border border-[#d8b45c]/40 rounded-full overflow-hidden p-0.5 bg-black/20">
          <button
            onClick={() => onSelectMode('student')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
              mode === 'student'
                ? 'bg-[#d8b45c] text-[#0a1230] shadow-sm'
                : 'text-[var(--muted2)] hover:text-[#d8b45c]'
            }`}
          >
            {t.studentTab}
          </button>
          <button
            onClick={() => onSelectMode('servant')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
              mode === 'servant'
                ? 'bg-[#d8b45c] text-[#0a1230] shadow-sm'
                : 'text-[var(--muted2)] hover:text-[#d8b45c]'
            }`}
          >
            {t.servantTab}
          </button>
        </div>

        {/* Theme and Language toggles */}
        <div className="flex gap-2 items-center">
          {sheetConfig.isConnected && sheetConfig.spreadsheetUrl && (
            <a
              href={sheetConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Google Sheet"
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <span>Sheet</span>
              <ExternalLink size={10} />
            </a>
          )}
          <button
            onClick={onToggleTheme}
            className="border border-[#d8b45c]/30 hover:border-[#d8b45c] rounded-lg px-2.5 py-1 text-xs text-[#f0dfa6] transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onToggleLang}
            className="border border-[#d8b45c]/30 hover:border-[#d8b45c] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#f0dfa6] transition-colors"
          >
            {t.langToggle}
          </button>
        </div>
      </div>

      <div className="text-[#d8b45c] text-sm font-semibold tracking-wide mb-1">
        {t.eyebrow}
      </div>

      <h1 className={`text-2xl sm:text-3xl font-bold mb-1.5 text-[#f0dfa6] drop-shadow-sm ${
        lang === 'ar' ? 'font-aref' : 'font-cormorant'
      }`}>
        {t.title}
      </h1>

      <p className="text-xs sm:text-sm text-[var(--muted)] m-0">
        {t.sub}
      </p>
    </header>
  );
};
