import { PomodoroSession, MoodLevel, UserStatistics } from '../types';
import { isSameDay, getStartOfDay } from './timeHelpers';

/**
 * Calcula estatísticas do usuário baseadas nas sessões
 */
export const calculateUserStatistics = (sessions: PomodoroSession[]): Partial<UserStatistics> => {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalFocusTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageProductivity: 0,
    };
  }

  const totalSessions = sessions.length;
  const totalFocusTime = sessions.reduce((acc, session) => acc + session.duration / 60, 0); // em minutos

  // Calcular produtividade média
  const sessionsWithProductivity = sessions.filter((s) => s.productivity !== undefined);
  const averageProductivity = sessionsWithProductivity.length > 0
    ? sessionsWithProductivity.reduce((acc, s) => acc + (s.productivity || 0), 0) / sessionsWithProductivity.length
    : 0;

  // Calcular streaks
  const { currentStreak, longestStreak } = calculateStreaks(sessions);

  return {
    totalSessions,
    totalFocusTime: Math.round(totalFocusTime),
    currentStreak,
    longestStreak,
    averageProductivity: Math.round(averageProductivity * 100) / 100,
  };
};

/**
 * Calcula streaks (dias consecutivos)
 */
export const calculateStreaks = (sessions: PomodoroSession[]): { currentStreak: number; longestStreak: number } => {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Ordenar por data
  const sortedSessions = [...sessions].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  // Obter dias únicos
  const uniqueDays = new Set<string>();
  sortedSessions.forEach((session) => {
    const dayKey = getStartOfDay(session.completedAt).toISOString();
    uniqueDays.add(dayKey);
  });

  const daysArray = Array.from(uniqueDays).sort().reverse();

  // Calcular streak atual
  let currentStreak = 0;
  const today = getStartOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (let i = 0; i < daysArray.length; i++) {
    const day = new Date(daysArray[i]);
    const expectedDay = new Date(today);
    expectedDay.setDate(expectedDay.getDate() - i);

    if (isSameDay(day, expectedDay) || (i === 0 && isSameDay(day, yesterday))) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calcular longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < daysArray.length; i++) {
    const prevDay = new Date(daysArray[i - 1]);
    const currDay = new Date(daysArray[i]);
    const diff = Math.floor((prevDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
};

/**
 * Calcula progresso semanal
 */
export const calculateWeeklyProgress = (sessions: PomodoroSession[], weeklyGoal: number): number => {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);

  const weekSessions = sessions.filter((session) => session.completedAt >= startOfWeek);

  return weeklyGoal > 0 ? Math.round((weekSessions.length / weeklyGoal) * 100) : 0;
};

/**
 * Obtém início da semana (domingo)
 */
const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day;
  newDate.setDate(diff);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Agrupa sessões por dia
 */
export const groupSessionsByDay = (sessions: PomodoroSession[]): Record<string, PomodoroSession[]> => {
  const grouped: Record<string, PomodoroSession[]> = {};

  sessions.forEach((session) => {
    const dayKey = getStartOfDay(session.completedAt).toISOString();
    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }
    grouped[dayKey].push(session);
  });

  return grouped;
};

/**
 * Calcula média de mood
 */
export const calculateAverageMood = (moods: MoodLevel[]): number => {
  if (moods.length === 0) return 0;
  const sum = moods.reduce((acc, mood) => acc + mood, 0);
  return Math.round((sum / moods.length) * 100) / 100;
};

/**
 * Determina se o usuário está tendo um bom dia baseado no mood
 */
export const isGoodDay = (averageMood: number): boolean => {
  return averageMood >= MoodLevel.GOOD;
};

/**
 * Gera mensagem motivacional baseada no progresso
 */
export const getMotivationalMessage = (statistics: UserStatistics): string => {
  const messages = {
    lowSessions: [
      'Todo grande projeto começa com um único passo. Vamos começar?',
      'Você tem potencial incrível! Que tal uma sessão de foco?',
      'Comece pequeno, sonhe grande. Sua jornada começa aqui.',
    ],
    goodProgress: [
      'Você está indo muito bem! Continue assim!',
      'Impressionante! Seu foco está ficando cada vez melhor.',
      'Que progresso incrível! Você está arrasando!',
    ],
    highStreak: [
      `🔥 ${statistics.currentStreak} dias seguidos! Você é imparável!`,
      'Sua consistência é inspiradora! Continue brilhando!',
      'Você está construindo hábitos incríveis! Parabéns!',
    ],
  };

  if (statistics.currentStreak >= 7) {
    return messages.highStreak[Math.floor(Math.random() * messages.highStreak.length)];
  } else if (statistics.totalSessions >= 10) {
    return messages.goodProgress[Math.floor(Math.random() * messages.goodProgress.length)];
  } else {
    return messages.lowSessions[Math.floor(Math.random() * messages.lowSessions.length)];
  }
};
