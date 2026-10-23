import React, { useState } from 'react';
import { Servant, Language } from '../types/quiz';
import { DatabaseInspector } from './DatabaseInspector';
import { QuestionEditor } from './QuestionEditor';
import { dbStore } from '../services/dbStore';
import { t } from '../data/translations';
import {
  ShieldCheck,
  Database,
  HelpCircle,
  RotateCcw,
  LogOut,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

interface ServantPanelProps {
  servant: Servant;
  lang: Language;
  onLogout: () => void;
  onOpenGoogleSheetModal: () => void;
}

export const ServantPanel: React.FC<ServantPanelProps> = ({
  servant,
  lang,
  onLogout,
  onOpenGoogleSheetModal,
}) => {
  const [subView, setSubView] = useState<'database' | 'questions'>('database');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetScores = () => {
    dbStore.resetLeaderboard();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Servant Banner */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-navy-950 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-cinzel">
                {servant.name}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider font-semibold">
                {t('servantPortal', lang)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'إدارة قاعدة بيانات المسابقة، سجلات التوقيت، وجداول بيانات Google Sheets'
                : 'Manage quiz database, answer timing logs, question bank, and Google Sheets synchronization'}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenGoogleSheetModal}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('linkGoogleSheet', lang)}</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            title="Reset student scores and timings"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('resetLeaderboard', lang)}</span>
          </button>

          <button
            onClick={onLogout}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout', lang)}</span>
          </button>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-semibold animate-fadeIn">
          {lang === 'ar' ? 'تمت إعادة ضبط النتائج وسجلات التوقيت بنجاح' : 'Leaderboard and timing records reset successfully'}
        </div>
      )}

      {/* Sub Navigation */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-2">
        <button
          onClick={() => setSubView('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subView === 'database'
              ? 'bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{lang === 'ar' ? 'مستعرض قاعدة البيانات (5 جداول)' : 'Database Inspector (5 Tables)'}</span>
        </button>

        <button
          onClick={() => setSubView('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subView === 'questions'
              ? 'bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{lang === 'ar' ? 'محرر بنك الأسئلة' : 'Question Bank Editor'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {subView === 'database' ? (
        <DatabaseInspector lang={lang} onOpenGoogleSheetModal={onOpenGoogleSheetModal} />
      ) : (
        <QuestionEditor lang={lang} />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-rose-500/40 animate-scaleIn space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'تأكيد تصفير النتائج' : 'Confirm Reset Leaderboard'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'هل أنت متأكد من مسح جميع محاولات الطلاب وسجلات التوقيت الحالية؟ (لا يمكن التراجع عن هذا الإجراء إلا باستعادة النسخة الاحتياطية من Google Sheets)'
                : 'Are you sure you want to clear all current student quiz attempts and timing logs?'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={handleResetScores}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {lang === 'ar' ? 'نعم، مسح السجلات' : 'Yes, Reset All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
