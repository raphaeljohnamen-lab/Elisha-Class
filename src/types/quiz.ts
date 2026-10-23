export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
export type AppMode = 'student' | 'servant';

export interface Student {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  className: string;
  lastActive?: string;
}

export interface Servant {
  name: string;
  pin: string;
}

export interface Question {
  id: string;
  lang: Language;
  q: string;
  choices: string[];
  correct: number;
}

export interface AnswerTimingLog {
  logId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  questionIndex: number;
  questionSnippet: string;
  selectedChoice: string;
  correctChoice: string;
  isCorrect: boolean;
  timeSpentSec: number;
  pointsEarned: number;
  timestamp: string;
}

export interface QuizScore {
  sessionId: string;
  studentId: string;
  studentName: string;
  score: number;
  correct: number;
  total: number;
  avgTimePerQ: number;
  lang: Language;
  date: string;
}

export interface LeaderboardEntry {
  rank?: number;
  studentName: string;
  studentId: string;
  highScore: number;
  attemptsCount: number;
  lastPlayed: string;
}

export interface GoogleSheetConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  isConnected: boolean;
  connectedAt: string | null;
  accountEmail?: string | null;
}
