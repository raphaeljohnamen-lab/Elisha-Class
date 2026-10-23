import React, { useState } from 'react';
import { dbStore } from '../services/dbStore';
import { exportTableToCSV } from '../services/googleSheets';
import { Language, Student } from '../types/quiz';
import { t } from '../data/translations';
import {
  Database,
  Users,
  Clock,
  Award,
  HelpCircle,
  Trophy,
  Download,
  ExternalLink,
  Search,
  KeyRound,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface DatabaseInspectorProps {
  lang: Language;
  onOpenGoogleSheetModal: () => void;
}

type TabType = 'students' | 'questions' | 'timings' | 'scores' | 'leaderboard';

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  lang,
  onOpenGoogleSheetModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('timings');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const students = dbStore.getStudents();
  const questionsAr = dbStore.getQuestions('ar');
  const questionsEn = dbStore.getQuestions('en');
  const timings = dbStore.getTimings();
  const scores = dbStore.getScores();
  const leaderboard = dbStore.getLeaderboard();
  const sheetConfig = dbStore.getSheetConfig();

  // Export current active table as CSV
  const handleExportCurrent = () => {
    switch (activeTab) {
      case 'students':
        exportTableToCSV(
          'Elisha_Students_Database',
          ['StudentID', 'Username', 'Password', 'FirstName', 'LastName', 'Class', 'Role', 'LastActive'],
          students.map(s => [s.id, s.username, s.password, s.firstName, s.lastName, s.className, 'Student', s.lastActive || ''])
        );
        break;
      case 'questions':
        exportTableToCSV(
          'Elisha_Questions_Database',
          ['ID', 'Language', 'QuestionText', 'Choice1', 'Choice2', 'Choice3', 'Choice4', 'CorrectIndex'],
          [
            ...questionsAr.map(q => [q.id, 'ar', q.q, q.choices[0] || '', q.choices[1] || '', q.choices[2] || '', q.choices[3] || '', q.correct]),
            ...questionsEn.map(q => [q.id, 'en', q.q, q.choices[0] || '', q.choices[1] || '', q.choices[2] || '', q.choices[3] || '', q.correct]),
          ]
        );
        break;
      case 'timings':
        exportTableToCSV(
          'Elisha_Answer_Timings_Log',
          ['LogID', 'SessionID', 'StudentID', 'StudentName', 'QuestionIndex', 'Question', 'SelectedChoice', 'CorrectChoice', 'IsCorrect', 'TimeSpentSeconds', 'PointsEarned', 'Timestamp'],
          timings.map(t => [t.logId, t.sessionId, t.studentId, t.studentName, t.questionIndex, t.questionSnippet, t.selectedChoice, t.correctChoice, t.isCorrect ? 'TRUE' : 'FALSE', t.timeSpentSec, t.pointsEarned, t.timestamp])
        );
        break;
      case 'scores':
        exportTableToCSV(
          'Elisha_Quiz_Scores',
          ['SessionID', 'StudentID', 'StudentName', 'Score', 'Correct', 'Total', 'AvgTimePerQSeconds', 'Language', 'Date'],
          scores.map(s => [s.sessionId, s.studentId, s.studentName, s.score, s.correct, s.total, s.avgTimePerQ, s.lang, s.date])
        );
        break;
      case 'leaderboard':
        exportTableToCSV(
          'Elisha_Class_Leaderboard',
          ['Rank', 'StudentName', 'StudentID', 'HighScore', 'AttemptsCount', 'LastPlayed'],
          leaderboard.map(l => [l.rank || '', l.studentName, l.studentId, l.highScore, l.attemptsCount, l.lastPlayed])
        );
        break;
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent && newPassword.trim()) {
      dbStore.updateStudentPassword(editingStudent.id, newPassword.trim());
      setSaveSuccessMsg(lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
      setTimeout(() => {
        setSaveSuccessMsg(null);
        setEditingStudent(null);
      }, 1500);
    }
  };

  // Filtered queries
  const term = searchTerm.toLowerCase().trim();

  const filteredStudents = students.filter(
    s =>
      s.firstName.toLowerCase().includes(term) ||
      s.lastName.toLowerCase().includes(term) ||
      s.username.toLowerCase().includes(term) ||
      s.id.includes(term)
  );

  const filteredTimings = timings.filter(
    t =>
      t.studentName.toLowerCase().includes(term) ||
      t.questionSnippet.toLowerCase().includes(term) ||
      t.selectedChoice.toLowerCase().includes(term)
  );

  const filteredScores = scores.filter(
    s =>
      s.studentName.toLowerCase().includes(term) ||
      s.studentId.includes(term) ||
      s.sessionId.includes(term)
  );

  const tabs: { id: TabType; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'timings', label: t('tabTimings', lang), count: timings.length, icon: <Clock className="w-4 h-4" /> },
    { id: 'students', label: t('tabStudents', lang), count: students.length, icon: <Users className="w-4 h-4" /> },
    { id: 'scores', label: t('tabScores', lang), count: scores.length, icon: <Award className="w-4 h-4" /> },
    { id: 'leaderboard', label: t('tabLeaderboard', lang), count: leaderboard.length, icon: <Trophy className="w-4 h-4" /> },
    { id: 'questions', label: t('tabQuestions', lang), count: questionsAr.length + questionsEn.length, icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Google Sheets status */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
              <span>{t('databaseTitle', lang)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans">
                5 Tables Online
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'قاعدة بيانات شاملة لبيانات الطلاب، أوقات الإجابات، بنك الأسئلة والنتائج'
                : 'Full relational database for student credentials, question answer timings, question bank, and results.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {sheetConfig.isConnected && sheetConfig.spreadsheetUrl ? (
            <a
              href={sheetConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('openGoogleSheets', lang)}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={onOpenGoogleSheetModal}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('linkGoogleSheet', lang)}</span>
            </button>
          )}

          <button
            onClick={handleExportCurrent}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold transition-all"
            title="Download current table as CSV"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-navy-950/30 text-navy-950 font-mono' : 'bg-white/10 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3.5 left-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={
            lang === 'ar'
              ? `بحث في ${tabs.find(t => t.id === activeTab)?.label}...`
              : `Search in ${tabs.find(t => t.id === activeTab)?.label}...`
          }
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute top-2.5 right-3 text-xs text-slate-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Table 1: Answer Timings */}
      {activeTab === 'timings' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t('tabTimings', lang)}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({filteredTimings.length} {lang === 'ar' ? 'إجابة مسجلة' : 'answers logged'})
              </span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {lang === 'ar' ? 'دقة القياس بالثواني وأجزائها' : 'Precision timing in seconds'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-slate-300 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{t('studentLabel', lang)}</th>
                  <th className="p-3">{lang === 'ar' ? 'السؤال' : 'Question'}</th>
                  <th className="p-3">{lang === 'ar' ? 'الإجابة المختارة' : 'Selected Answer'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'النتيجة' : 'Result'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'الوقت المستغرق' : 'Time Spent'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'النقاط' : 'Points'}</th>
                  <th className="p-3">{lang === 'ar' ? 'التوقيت' : 'Time'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredTimings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                      {lang === 'ar' ? 'لا توجد بيانات أوقات مطابقة' : 'No timing records found'}
                    </td>
                  </tr>
                ) : (
                  filteredTimings.map((log, i) => (
                    <tr key={log.logId || i} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-slate-400">{i + 1}</td>
                      <td className="p-3 font-semibold text-white font-sans">{log.studentName}</td>
                      <td className="p-3 max-w-[200px] truncate text-slate-300 font-sans" title={log.questionSnippet}>
                        Q{log.questionIndex}: {log.questionSnippet}
                      </td>
                      <td className="p-3 max-w-[180px] truncate font-sans text-slate-300" title={log.selectedChoice}>
                        {log.selectedChoice}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {log.isCorrect ? (lang === 'ar' ? 'صحيحة' : 'CORRECT') : (lang === 'ar' ? 'خاطئة' : 'WRONG')}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-300">
                        {log.timeSpentSec.toFixed(1)}s
                      </td>
                      <td className="p-3 text-center text-emerald-400 font-bold">
                        +{log.pointsEarned}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 2: Students Credentials */}
      {activeTab === 'students' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{t('tabStudents', lang)}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({filteredStudents.length} {lang === 'ar' ? 'طالب مسجل' : 'students enrolled'})
              </span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {lang === 'ar' ? 'حسابات الطلاب وكلمات المرور الخاصة بهم' : 'Student IDs, Usernames & Passwords'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-slate-300 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">{lang === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th className="p-3">{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</th>
                  <th className="p-3">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</th>
                  <th className="p-3">{lang === 'ar' ? 'الفصل' : 'Class'}</th>
                  <th className="p-3">{lang === 'ar' ? 'آخر نشاط' : 'Last Active'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                      {lang === 'ar' ? 'لا يوجد طلاب مطابقون' : 'No students found'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-amber-400 font-bold">{student.id}</td>
                      <td className="p-3 font-semibold text-white font-sans">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="p-3 text-slate-300">{student.username}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-amber-200">
                          {student.password}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-sans">{student.className}</td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setNewPassword(student.password);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-sans inline-flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 3: Scores */}
      {activeTab === 'scores' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{t('tabScores', lang)}</span>
              <span className="text-xs text-slate-400 font-normal">({filteredScores.length})</span>
            </h4>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-slate-300 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{t('studentLabel', lang)}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'النقاط' : 'Score'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'الإجابات الصحيحة' : 'Correct'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'متوسط وقت السؤال' : 'Avg Time / Q'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'اللغة' : 'Language'}</th>
                  <th className="p-3">{lang === 'ar' ? 'تاريخ الإكمال' : 'Completed At'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                      {lang === 'ar' ? 'لا توجد نتائج مسجلة حتى الآن' : 'No scores recorded yet'}
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((score, i) => (
                    <tr key={score.sessionId} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-slate-400">{i + 1}</td>
                      <td className="p-3 font-semibold text-white font-sans">{score.studentName}</td>
                      <td className="p-3 text-center font-bold text-amber-300 text-sm">
                        {score.score.toLocaleString()}
                      </td>
                      <td className="p-3 text-center text-emerald-300 font-bold">
                        {score.correct} / {score.total}
                      </td>
                      <td className="p-3 text-center text-slate-300">
                        {score.avgTimePerQ}s
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded uppercase text-[10px] bg-white/10 text-slate-300">
                          {score.lang}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(score.date).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 4: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{t('tabLeaderboard', lang)}</span>
            </h4>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-slate-300 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-3 text-center">Rank</th>
                  <th className="p-3">{t('studentLabel', lang)}</th>
                  <th className="p-3">ID</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'أعلى نقطة' : 'High Score'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'عدد المحاولات' : 'Attempts'}</th>
                  <th className="p-3">{lang === 'ar' ? 'آخر مشاركة' : 'Last Played'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      {lang === 'ar' ? 'قائمة الشرف فارغة حالياً' : 'Leaderboard is currently empty'}
                    </td>
                  </tr>
                ) : (
                  leaderboard.map(entry => (
                    <tr key={entry.studentId} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-center font-bold">
                        {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : `#${entry.rank}`}
                      </td>
                      <td className="p-3 font-semibold text-white font-sans">{entry.studentName}</td>
                      <td className="p-3 text-slate-400">{entry.studentId}</td>
                      <td className="p-3 text-center font-bold text-amber-300 text-sm">
                        {entry.highScore.toLocaleString()}
                      </td>
                      <td className="p-3 text-center text-slate-300">
                        {entry.attemptsCount}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(entry.lastPlayed).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 5: Questions Bank */}
      {activeTab === 'questions' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{t('tabQuestions', lang)}</span>
            </h4>
          </div>

          <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {lang === 'ar' ? 'الأسئلة باللغة العربية' : 'Arabic Questions'} ({questionsAr.length})
              </h5>
              {questionsAr.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white">
                      #{idx + 1}. {q.q}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                      {q.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {q.choices.map((choice, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-2 rounded-lg text-[11px] border ${
                          cIdx === q.correct
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-black/30 border-white/5 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + cIdx)}. {choice}
                        {cIdx === q.correct && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {lang === 'ar' ? 'الأسئلة باللغة الإنجليزية' : 'English Questions'} ({questionsEn.length})
              </h5>
              {questionsEn.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white">
                      #{idx + 1}. {q.q}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                      {q.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {q.choices.map((choice, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-2 rounded-lg text-[11px] border ${
                          cIdx === q.correct
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-black/30 border-white/5 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + cIdx)}. {choice}
                        {cIdx === q.correct && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-amber-500/30 animate-scaleIn">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>{lang === 'ar' ? 'تعديل كلمة المرور' : 'Update Password'}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {editingStudent.firstName} {editingStudent.lastName} ({editingStudent.username})
            </p>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold"
                >
                  {lang === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
