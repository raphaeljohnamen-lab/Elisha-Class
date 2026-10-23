import React, { useState } from 'react';
import { dbStore } from '../services/dbStore';
import { googleSignIn, getAccessToken } from '../services/auth';
import { createQuizSpreadsheet, populateSpreadsheet } from '../services/googleSheets';
import { Language } from '../types/quiz';
import { t } from '../data/translations';
import {
  FileSpreadsheet,
  X,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Link2,
  Unlink,
  AlertCircle
} from 'lucide-react';

interface GoogleSheetModalProps {
  lang: Language;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ lang, onClose }) => {
  const [config, setConfig] = useState(dbStore.getSheetConfig());
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [customSheetId, setCustomSheetId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleCopyLink = () => {
    if (config.spreadsheetUrl) {
      navigator.clipboard.writeText(config.spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateAndLinkSheet = async () => {
    try {
      setLoading(true);
      setStatusMsg({
        type: 'info',
        text: lang === 'ar' ? 'جاري تسجيل الدخول بحساب Google وإنشاء جدول البيانات...' : 'Signing in with Google and creating spreadsheet...',
      });

      // 1. Google OAuth Sign-in for sheets & drive.file scopes
      const authResult = await googleSignIn();
      if (!authResult || !authResult.accessToken) {
        throw new Error('Google sign-in was not completed.');
      }

      const { user, accessToken } = authResult;

      // 2. Create the 5-tab spreadsheet with students, timings, questions, scores, leaderboard
      setStatusMsg({
        type: 'info',
        text: lang === 'ar' ? 'جاري تجهيز الصفحات الخمس وتعبئة البيانات الأولية...' : 'Creating 5 database tabs and populating data...',
      });

      const snapshot = dbStore.getDatabaseSnapshot();
      const result = await createQuizSpreadsheet(accessToken, snapshot, 'Elisha Class - Luke 1 Quiz Database');

      // 3. Store in dbStore
      dbStore.connectGoogleSheet(result.spreadsheetId, result.spreadsheetUrl, user.email);
      setConfig(dbStore.getSheetConfig());

      setStatusMsg({
        type: 'success',
        text: lang === 'ar'
          ? 'تم إنشاء جدول البيانات وربطه بنجاح!'
          : 'Google Sheet database created and linked successfully!',
      });
    } catch (err: any) {
      console.error('Error linking sheet:', err);
      setStatusMsg({
        type: 'error',
        text: err?.message || (lang === 'ar' ? 'فشل الربط بجداول بيانات Google' : 'Failed to link Google Sheet'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (!config.spreadsheetId) return;

    try {
      setLoading(true);
      setStatusMsg({
        type: 'info',
        text: lang === 'ar' ? 'جاري مزامنة كافة الجداول مع Google Sheets...' : 'Syncing all 5 tables to Google Sheets...',
      });

      let token = await getAccessToken();
      if (!token) {
        const authResult = await googleSignIn();
        token = authResult?.accessToken || null;
      }

      if (!token) {
        throw new Error('Please sign in to Google to sync.');
      }

      const snapshot = dbStore.getDatabaseSnapshot();
      await populateSpreadsheet(token, config.spreadsheetId, snapshot);

      setStatusMsg({
        type: 'success',
        text: lang === 'ar' ? 'تمت مزامنة كافة الجداول بنجاح!' : 'All 5 tables synced successfully!',
      });
    } catch (err: any) {
      console.error('Sync error:', err);
      setStatusMsg({
        type: 'error',
        text: err?.message || (lang === 'ar' ? 'فشلت المزامنة' : 'Sync failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectExisting = () => {
    const cleanId = customSheetId.trim();
    if (!cleanId) return;

    // Handle full URL or plain ID
    let sheetId = cleanId;
    const match = cleanId.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
    dbStore.connectGoogleSheet(sheetId, url);
    setConfig(dbStore.getSheetConfig());
    setShowManualInput(false);
    setStatusMsg({
      type: 'success',
      text: lang === 'ar' ? 'تم حفظ معرف جدول البيانات بنجاح' : 'Spreadsheet ID saved successfully',
    });
  };

  const handleDisconnect = () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء ربط جدول البيانات؟' : 'Disconnect Google Sheet?')) {
      dbStore.disconnectGoogleSheet();
      setConfig(dbStore.getSheetConfig());
      setStatusMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-xl p-6 sm:p-8 rounded-2xl border border-amber-500/30 shadow-2xl relative animate-scaleIn space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cinzel">
                {t('googleSheetsIntegration', lang)}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'ربط قاعدة بيانات المسابقة بجداول Google Sheets الرسمية'
                  : 'Sync student credentials, answer timings & scores with Google Sheets'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : statusMsg.type === 'error'
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
            }`}
          >
            {statusMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : statusMsg.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            )}
            <span className="flex-1">{statusMsg.text}</span>
          </div>
        )}

        {/* Connected state */}
        {config.isConnected && config.spreadsheetUrl ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {t('connectedToSheet', lang)}
                </span>
                {config.accountEmail && (
                  <span className="text-[11px] text-slate-300 font-mono">
                    {config.accountEmail}
                  </span>
                )}
              </div>

              {/* Direct Link Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'رابط جدول البيانات المباشر:' : 'Direct Google Spreadsheet Link:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={config.spreadsheetUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-xs select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs transition-colors shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={config.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>{lang === 'ar' ? 'فتح الجدول' : 'Open'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500">{lang === 'ar' ? 'معرف الجدول:' : 'Spreadsheet ID:'}</span>{' '}
                  <span className="font-mono text-slate-300">{config.spreadsheetId}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">{lang === 'ar' ? 'الصفحات المدمجة:' : 'Tabs:'}</span>{' '}
                  <span className="text-amber-300 font-medium">5 Tabs (Students, Timings, Scores, Leaderboard, Questions)</span>
                </div>
              </div>
            </div>

            {/* Sync actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncNow}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{lang === 'ar' ? 'مزامنة كافة الجداول الآن' : 'Sync All 5 Tables Now'}</span>
              </button>

              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Unlink className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إلغاء الربط' : 'Disconnect'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not connected state */
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'ar'
                    ? 'إنشاء قاعدة بيانات Google Sheets متكاملة'
                    : '1-Click Create & Link Google Spreadsheet'}
                </span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'سيتم تسجيل الدخول بحساب Google وإنشاء ملف Google Sheets متكامل بخمس صفحات لأسماء الطلاب، كلمات المرور، أوقات الإجابات بالثانية، الأسئلة والنتائج تلقائياً.'
                  : 'Uses authorized Google OAuth to create a dedicated spreadsheet with 5 formatted sheets (Students, Answer_Timings, Scores, Leaderboard, Questions) and seeds all existing class data.'}
              </p>

              <button
                onClick={handleCreateAndLinkSheet}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>
                  {loading
                    ? (lang === 'ar' ? 'جاري الاتصال والإنشاء...' : 'Creating Spreadsheet...')
                    : (lang === 'ar' ? 'إنشاء وربط جدول البيانات بحساب Google' : 'Create & Link Google Spreadsheet Database')}
                </span>
              </button>
            </div>

            {/* Manual Sheet ID option */}
            <div className="pt-2 border-t border-white/10">
              {!showManualInput ? (
                <button
                  onClick={() => setShowManualInput(true)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar'
                      ? 'أو اربط جدول بيانات موجود مسبقاً بواسطة المعرف (Spreadsheet ID)'
                      : 'Or link an existing Google Sheet by ID'}
                  </span>
                </button>
              ) : (
                <div className="space-y-3 p-3 rounded-xl bg-black/30 border border-white/10">
                  <label className="block text-xs text-slate-300">
                    {lang === 'ar' ? 'أدخل معرّف أو رابط جدول بيانات Google:' : 'Enter Google Sheet ID or URL:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSheetId}
                      onChange={e => setCustomSheetId(e.target.value)}
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleConnectExisting}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs"
                    >
                      {lang === 'ar' ? 'ربط' : 'Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-[11px] text-slate-400 border-t border-white/10 pt-4 flex items-center justify-between">
          <span>{lang === 'ar' ? 'أسرة إيليا النبي - كنيسة العذراء والأنبا بيشوي' : 'Elisha Sunday School Class'}</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
