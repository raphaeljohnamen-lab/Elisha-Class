import React, { useState, useEffect } from 'react';
import { Language, Theme, AppMode, Student, Servant, AnswerTimingLog, GoogleSheetConfig } from './types/quiz';
import { dbStore } from './services/dbStore';
import { Header } from './components/Header';
import { StudentLogin } from './components/StudentLogin';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { LeaderboardView } from './components/LeaderboardView';
import { ServantGate } from './components/ServantGate';
import { ServantPanel } from './components/ServantPanel';
import { GoogleSheetModal } from './components/GoogleSheetModal';

interface QuizResultState {
  score: number;
  correctCount: number;
  totalQuestions: number;
  timingLogs: Omit<AnswerTimingLog, 'logId' | 'sessionId' | 'studentId' | 'studentName'>[];
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('dark');
  const [mode, setMode] = useState<AppMode>('student');
  const [activeServant, setActiveServant] = useState<Servant | null>(null);
  const [showServantGate, setShowServantGate] = useState(false);
  const [showGoogleSheetModal, setShowGoogleSheetModal] = useState(false);

  // Student quiz flow
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [screen, setScreen] = useState<'login' | 'quiz' | 'result' | 'leaderboard'>('login');
  const [lastResult, setLastResult] = useState<QuizResultState | null>(null);

  // Reactive state from dbStore
  const [, setDbVersion] = useState(0);
  useEffect(() => {
    const unsub = dbStore.subscribe(() => {
      setDbVersion(v => v + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  const students = dbStore.getStudents();
  const questions = dbStore.getQuestions(lang);
  const leaderboard = dbStore.getLeaderboard();
  const sheetConfig: GoogleSheetConfig = dbStore.getSheetConfig();

  // Sync document direction and theme class
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  // Handle switching to Servant mode
  const handleSelectMode = (newMode: AppMode) => {
    if (newMode === 'servant') {
      if (!activeServant) {
        setShowServantGate(true);
      } else {
        setMode('servant');
      }
    } else {
      setMode('student');
    }
  };

  const handleServantGateSuccess = (servant: Servant) => {
    setActiveServant(servant);
    setShowServantGate(false);
    setMode('servant');
  };

  const handleServantLogout = () => {
    setActiveServant(null);
    setMode('student');
  };

  // Student Quiz Actions
  const handleStudentLoginSuccess = (student: Student) => {
    setCurrentStudent(student);
    setScreen('quiz');
  };

  const handleFinishQuiz = async (
    score: number,
    correctCount: number,
    timingLogs: Omit<AnswerTimingLog, 'logId' | 'sessionId' | 'studentId' | 'studentName'>[]
  ) => {
    if (!currentStudent) return;

    // Record in database (with Answer_Timings and Scores tables)
    await dbStore.recordQuizAttempt(
      currentStudent,
      score,
      correctCount,
      questions.length,
      timingLogs,
      lang
    );

    setLastResult({
      score,
      correctCount,
      totalQuestions: questions.length,
      timingLogs,
    });
    setScreen('result');
  };

  const handleRestartQuiz = () => {
    setScreen('quiz');
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Decorative stars / ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <Header
          lang={lang}
          theme={theme}
          mode={mode}
          sheetConfig={sheetConfig}
          onToggleLang={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))}
          onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          onSelectMode={handleSelectMode}
        />

        {/* Main Body */}
        <main className="flex-1 flex flex-col justify-center">
          {mode === 'servant' && activeServant ? (
            <ServantPanel
              servant={activeServant}
              lang={lang}
              onLogout={handleServantLogout}
              onOpenGoogleSheetModal={() => setShowGoogleSheetModal(true)}
            />
          ) : (
            <div className="w-full flex justify-center">
              {screen === 'login' && (
                <StudentLogin
                  lang={lang}
                  students={students}
                  onLoginSuccess={handleStudentLoginSuccess}
                  onViewLeaderboard={() => setScreen('leaderboard')}
                />
              )}

              {screen === 'quiz' && currentStudent && (
                <QuizView
                  lang={lang}
                  student={currentStudent}
                  questions={questions}
                  onFinishQuiz={handleFinishQuiz}
                />
              )}

              {screen === 'result' && currentStudent && lastResult && (
                <ResultView
                  lang={lang}
                  student={currentStudent}
                  score={lastResult.score}
                  correctCount={lastResult.correctCount}
                  totalQuestions={lastResult.totalQuestions}
                  timingLogs={lastResult.timingLogs}
                  sheetConfig={sheetConfig}
                  onViewLeaderboard={() => setScreen('leaderboard')}
                  onRestart={handleRestartQuiz}
                />
              )}

              {screen === 'leaderboard' && (
                <LeaderboardView
                  lang={lang}
                  entries={leaderboard}
                  currentStudent={currentStudent}
                  onBack={() => setScreen(currentStudent ? 'result' : 'login')}
                />
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-[var(--muted2)] mt-8 py-3 border-t border-[#d8b45c]/10">
          <p className="m-0 font-medium">
            {lang === 'ar'
              ? 'كنيسة الشهيد العظيم مارمرقس بمصر الجديدة — أسرة أنبياء (فصل أليشع)'
              : 'St. Mark Coptic Orthodox Church, Heliopolis — Prophets Family (Elisha Class)'}
          </p>
        </footer>
      </div>

      {/* Modals */}
      {showServantGate && (
        <ServantGate
          lang={lang}
          onSuccess={handleServantGateSuccess}
          onCancel={() => setShowServantGate(false)}
        />
      )}

      {showGoogleSheetModal && (
        <GoogleSheetModal
          lang={lang}
          onClose={() => setShowGoogleSheetModal(false)}
        />
      )}
    </div>
  );
};

export default App;
