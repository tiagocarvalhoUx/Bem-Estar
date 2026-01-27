// Tipos principais do aplicativo

export enum PomodoroMode {
  WORK = "work",
  SHORT_BREAK = "shortBreak",
  LONG_BREAK = "longBreak",
}

export enum TimerStatus {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
}

export interface PomodoroSession {
  id: string;
  userId: string;
  mode: PomodoroMode;
  duration: number; // em segundos
  completedAt: Date;
  interruptions: number;
  moodBefore?: MoodLevel;
  moodAfter?: MoodLevel;
  productivity?: number; // 1-5
  tags?: string[];
  notes?: string;
}

export enum MoodLevel {
  VERY_BAD = 1,
  BAD = 2,
  NEUTRAL = 3,
  GOOD = 4,
  VERY_GOOD = 5,
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  workDuration: number; // em minutos
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  enableHaptics: boolean;
  darkMode?: boolean;
  weeklyGoal?: number; // número de sessões
  // Acessibilidade para neurodivergentes
  visualAlerts?: boolean;
  customColors?: {
    work?: string;
    shortBreak?: string;
    longBreak?: string;
  };
  reminderIntervals?: number[]; // lembretes em minutos
}

export interface UserStatistics {
  totalSessions: number;
  totalFocusTime: number; // em minutos (renomeado de totalWorkTime para consistência)
  currentStreak: number; // dias consecutivos
  longestStreak: number;
  averageProductivity?: number;
  lastSessionDate?: Date;
  weeklyProgress?: number; // porcentagem do objetivo semanal
}

export interface AISuggestion {
  id: string;
  userId: string;
  type: SuggestionType;
  message: string;
  suggestedTime?: Date;
  confidence: number; // 0-1
  reasons: string[];
  createdAt: Date;
  dismissed: boolean;
  accepted?: boolean;
}

export enum SuggestionType {
  OPTIMAL_TIME = "optimalTime",
  BREAK_REMINDER = "breakReminder",
  PRODUCTIVITY_TIP = "productivityTip",
  MOOD_CHECK = "moodCheck",
  GOAL_ADJUSTMENT = "goalAdjustment",
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodLevel;
  energy: number; // 1-5
  stress: number; // 1-5
  notes?: string;
  timestamp: Date;
  context?: {
    beforePomodoro?: boolean;
    afterPomodoro?: boolean;
    sessionId?: string;
  };
}

export interface AIAnalysis {
  userId: string;
  optimalWorkHours: number[]; // horas do dia (0-23)
  productivityPatterns: {
    hour: number;
    averageProductivity: number;
    sessionCount: number;
  }[];
  moodCorrelations: {
    mood: MoodLevel;
    averageProductivity: number;
  }[];
  recommendations: string[];
  lastAnalyzed: Date;
}

// AI Insights Types
export interface ProductivityPattern {
  bestTimeOfDay: string;
  averageSessionsPerDay: number;
  mostProductiveDay: string;
  productivityTrend: "improving" | "stable" | "declining";
}

export interface BurnoutRisk {
  risk: "low" | "medium" | "high";
  reasons: string[];
  suggestions?: string[];
}

export interface AIInsights {
  patterns: ProductivityPattern;
  burnoutRisk: BurnoutRisk;
  optimalDuration: number;
  nextSessionTime: Date | null;
  generatedAt: Date;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Statistics: undefined;
  AIInsights: undefined;
  Planner: undefined;
  Mood: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Context Types
export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface PomodoroContextType {
  currentMode: PomodoroMode;
  timeRemaining: number;
  status: TimerStatus;
  completedSessions: number;
  sessions: PomodoroSession[];
  moodHistory: MoodEntry[];
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  switchMode: (mode: PomodoroMode) => void;
  addMoodEntry: (mood: MoodEntry) => void;
}

// Firebase Types
export interface FirestoreUser {
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: any; // Firestore Timestamp
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface FirestorePomodoroSession {
  userId: string;
  mode: PomodoroMode;
  duration: number;
  completedAt: any; // Firestore Timestamp
  interruptions: number;
  moodBefore?: MoodLevel;
  moodAfter?: MoodLevel;
  productivity?: number;
  tags?: string[];
  notes?: string;
}
