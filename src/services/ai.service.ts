import {
  PomodoroSession,
  MoodEntry,
  AISuggestion,
  SuggestionType,
  MoodLevel,
  UserProfile,
} from "../types";
import { isSameDay, getStartOfDay } from "../utils/timeHelpers";
import { calculateAverageMood } from "../utils/statisticsHelpers";

/**
 * Serviço de IA para análise de padrões e sugestões personalizadas
 */
class AIService {
  /**
   * Analisa padrões de produtividade do usuário
   */
  analyzeProductivityPatterns(sessions: PomodoroSession[]): {
    bestTimeOfDay: string;
    averageSessionsPerDay: number;
    mostProductiveDay: string;
    productivityTrend: "improving" | "stable" | "declining";
  } {
    if (sessions.length === 0) {
      return {
        bestTimeOfDay: "morning",
        averageSessionsPerDay: 0,
        mostProductiveDay: "Monday",
        productivityTrend: "stable",
      };
    }

    // Análise de horário
    const timeOfDayScores: Record<
      string,
      { count: number; totalProductivity: number }
    > = {
      morning: { count: 0, totalProductivity: 0 },
      afternoon: { count: 0, totalProductivity: 0 },
      evening: { count: 0, totalProductivity: 0 },
      night: { count: 0, totalProductivity: 0 },
    };

    // Análise de dia da semana
    const dayOfWeekScores: Record<
      string,
      { count: number; totalProductivity: number }
    > = {
      Sunday: { count: 0, totalProductivity: 0 },
      Monday: { count: 0, totalProductivity: 0 },
      Tuesday: { count: 0, totalProductivity: 0 },
      Wednesday: { count: 0, totalProductivity: 0 },
      Thursday: { count: 0, totalProductivity: 0 },
      Friday: { count: 0, totalProductivity: 0 },
      Saturday: { count: 0, totalProductivity: 0 },
    };

    sessions.forEach((session) => {
      const hour = session.completedAt.getHours();
      const dayName = session.completedAt.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const productivity = session.productivity || 3;

      // Categorizar horário
      let timeOfDay: string;
      if (hour >= 6 && hour < 12) timeOfDay = "morning";
      else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
      else if (hour >= 18 && hour < 22) timeOfDay = "evening";
      else timeOfDay = "night";

      timeOfDayScores[timeOfDay].count++;
      timeOfDayScores[timeOfDay].totalProductivity += productivity;

      dayOfWeekScores[dayName].count++;
      dayOfWeekScores[dayName].totalProductivity += productivity;
    });

    // Encontrar melhor horário
    let bestTimeOfDay = "morning";
    let bestTimeScore = 0;
    Object.entries(timeOfDayScores).forEach(([time, data]) => {
      if (data.count > 0) {
        const avgScore = data.totalProductivity / data.count;
        if (avgScore > bestTimeScore) {
          bestTimeScore = avgScore;
          bestTimeOfDay = time;
        }
      }
    });

    // Encontrar melhor dia
    let mostProductiveDay = "Monday";
    let bestDayScore = 0;
    Object.entries(dayOfWeekScores).forEach(([day, data]) => {
      if (data.count > 0) {
        const avgScore = data.totalProductivity / data.count;
        if (avgScore > bestDayScore) {
          bestDayScore = avgScore;
          mostProductiveDay = day;
        }
      }
    });

    // Calcular média de sessões por dia
    const uniqueDays = new Set(
      sessions.map((s) => getStartOfDay(s.completedAt).toISOString()),
    ).size;
    const averageSessionsPerDay =
      Math.round((sessions.length / uniqueDays) * 10) / 10;

    // Analisar tendência de produtividade
    const recentSessions = sessions.slice(0, Math.min(10, sessions.length));
    const olderSessions = sessions.slice(
      Math.min(10, sessions.length),
      Math.min(20, sessions.length),
    );

    const recentAvg =
      recentSessions.reduce((acc, s) => acc + (s.productivity || 3), 0) /
      recentSessions.length;
    const olderAvg =
      olderSessions.length > 0
        ? olderSessions.reduce((acc, s) => acc + (s.productivity || 3), 0) /
          olderSessions.length
        : recentAvg;

    let productivityTrend: "improving" | "stable" | "declining";
    if (recentAvg > olderAvg + 0.3) productivityTrend = "improving";
    else if (recentAvg < olderAvg - 0.3) productivityTrend = "declining";
    else productivityTrend = "stable";

    return {
      bestTimeOfDay,
      averageSessionsPerDay,
      mostProductiveDay,
      productivityTrend,
    };
  }

  /**
   * Gera sugestões personalizadas baseadas em IA
   */
  generateSuggestions(
    user: UserProfile,
    sessions: PomodoroSession[],
    moodEntries: MoodEntry[],
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const patterns = this.analyzeProductivityPatterns(sessions);
    const recentSessions = sessions.slice(0, 5);
    const recentMoods = moodEntries.slice(0, 5).map((m) => m.mood);

    console.log("AIService: Gerando sugestões...", {
      sessionsCount: sessions.length,
      moodCount: moodEntries.length,
    });

    // Sugestão inicial para primeiros passos (1-5 sessões)
    if (sessions.length >= 1 && sessions.length < 5) {
      console.log(
        "AIService: Criando sugestão de boas-vindas para",
        sessions.length,
        "sessão(ões)",
      );
      suggestions.push({
        id: `suggestion-${Date.now()}-welcome`,
        userId: user.id,
        type: SuggestionType.PRODUCTIVITY_TIP,
        message: `🎯 Ótimo começo! Você completou ${sessions.length} sessão${sessions.length > 1 ? "ões" : ""}. Continue assim para desbloquear insights mais detalhados sobre seus padrões de produtividade!`,
        confidence: 0.95,
        reasons: [
          `Primeira${sessions.length > 1 ? "s" : ""} sessão${sessions.length > 1 ? "ões" : ""} completada${sessions.length > 1 ? "s" : ""}`,
          "Continue praticando para análises mais precisas",
        ],
        createdAt: new Date(),
        dismissed: false,
      });
    }

    // Sugestão de horário ótimo (ajustado para 5+ sessões)
    if (sessions.length >= 5) {
      suggestions.push({
        id: `suggestion-${Date.now()}-1`,
        userId: user.id,
        type: SuggestionType.OPTIMAL_TIME,
        message: `Seus dados mostram que você é mais produtivo(a) durante a ${this.translateTimeOfDay(patterns.bestTimeOfDay)}. Que tal agendar suas tarefas mais importantes nesse período?`,
        confidence: sessions.length >= 10 ? 0.85 : 0.65,
        reasons: [
          `${patterns.bestTimeOfDay} é seu período mais produtivo`,
          `Baseado em ${sessions.length} sessões analisadas`,
        ],
        createdAt: new Date(),
        dismissed: false,
      });
    }

    // Sugestão de pausa baseada em mood
    const avgMood = calculateAverageMood(recentMoods);
    if (avgMood < MoodLevel.NEUTRAL && recentSessions.length > 3) {
      suggestions.push({
        id: `suggestion-${Date.now()}-2`,
        userId: user.id,
        type: SuggestionType.BREAK_REMINDER,
        message:
          "Percebi que você pode estar se sentindo cansado(a). Que tal fazer uma pausa mais longa para relaxar?",
        confidence: 0.75,
        reasons: [
          "Humor abaixo da média nos últimos registros",
          "Várias sessões consecutivas detectadas",
        ],
        createdAt: new Date(),
        dismissed: false,
      });
    }

    // Sugestão de produtividade baseada em tendência
    if (patterns.productivityTrend === "improving") {
      suggestions.push({
        id: `suggestion-${Date.now()}-3`,
        userId: user.id,
        type: SuggestionType.PRODUCTIVITY_TIP,
        message:
          "🎉 Sua produtividade está melhorando! Continue com esse ritmo, você está no caminho certo!",
        confidence: 0.9,
        reasons: [
          "Tendência de produtividade em alta",
          "Consistência nas sessões",
        ],
        createdAt: new Date(),
        dismissed: false,
      });
    } else if (patterns.productivityTrend === "declining") {
      suggestions.push({
        id: `suggestion-${Date.now()}-4`,
        userId: user.id,
        type: SuggestionType.PRODUCTIVITY_TIP,
        message:
          "Parece que você está se sentindo menos produtivo(a) ultimamente. Tente começar com sessões mais curtas e aumente gradualmente.",
        confidence: 0.7,
        reasons: [
          "Tendência de produtividade em queda",
          "Sugestão de ajuste no ritmo",
        ],
        createdAt: new Date(),
        dismissed: false,
      });
    }

    // Sugestão de check-in de humor
    const lastMoodEntry = moodEntries[0];
    const hoursSinceLastMood = lastMoodEntry
      ? (Date.now() - lastMoodEntry.timestamp.getTime()) / (1000 * 60 * 60)
      : 999;

    // Parabéns por registrar humor (primeiros registros)
    if (
      moodEntries.length >= 1 &&
      moodEntries.length < 5 &&
      hoursSinceLastMood < 24
    ) {
      const moodEmoji = this.getMoodEmoji(lastMoodEntry.mood);
      suggestions.push({
        id: `suggestion-${Date.now()}-mood-celebrate`,
        userId: user.id,
        type: SuggestionType.MOOD_CHECK,
        message: `${moodEmoji} Ótimo! Você registrou seu humor. Continue fazendo isso regularmente para entender melhor seus padrões emocionais e produtividade!`,
        confidence: 0.9,
        reasons: [
          "Primeiro registro de humor completado",
          "Check-ins regulares melhoram autoconhecimento",
        ],
        createdAt: new Date(),
        dismissed: false,
      });
    }

    if (hoursSinceLastMood > 4 && sessions.length >= 3) {
      suggestions.push({
        id: `suggestion-${Date.now()}-5`,
        userId: user.id,
        type: SuggestionType.MOOD_CHECK,
        message:
          "Como você está se sentindo agora? Registrar seu humor ajuda a entender seus padrões de produtividade.",
        confidence: 0.8,
        reasons: [
          "Faz tempo desde o último registro de humor",
          "Check-in regular melhora a autoconhecimento",
        ],
        createdAt: new Date(),
        dismissed: false,
      });
    }

    // Sugestão de ajuste de meta
    if (patterns.averageSessionsPerDay > 0) {
      const currentGoal = user.preferences.weeklyGoal || 21; // 3 por dia
      const suggestedGoal = Math.round(patterns.averageSessionsPerDay * 7);

      if (Math.abs(suggestedGoal - currentGoal) > 5) {
        suggestions.push({
          id: `suggestion-${Date.now()}-6`,
          userId: user.id,
          type: SuggestionType.GOAL_ADJUSTMENT,
          message: `Baseado no seu histórico, você completa em média ${patterns.averageSessionsPerDay} sessões por dia. Que tal ajustar sua meta semanal para ${suggestedGoal} sessões?`,
          confidence: 0.75,
          reasons: [
            `Média atual: ${patterns.averageSessionsPerDay} sessões/dia`,
            `Meta sugerida mais realista: ${suggestedGoal} sessões/semana`,
          ],
          createdAt: new Date(),
          dismissed: false,
        });
      }
    }

    console.log("AIService: Sugestões geradas:", suggestions.length);
    return suggestions;
  }

  /**
   * Sugere duração ideal de sessão baseada em histórico
   */
  suggestOptimalSessionDuration(sessions: PomodoroSession[]): number {
    if (sessions.length < 5) {
      return 25; // Padrão Pomodoro
    }

    // Filtrar sessões completadas com alta produtividade
    const productiveSessions = sessions.filter(
      (s) => (s.productivity || 0) >= 4,
    );

    if (productiveSessions.length === 0) {
      return 25;
    }

    // Calcular média de duração das sessões produtivas
    const avgDuration =
      productiveSessions.reduce((acc, s) => acc + s.duration, 0) /
      productiveSessions.length;
    const durationInMinutes = Math.round(avgDuration / 60);

    // Ajustar para valores comuns (20, 25, 30, 45, 50)
    const commonDurations = [20, 25, 30, 45, 50];
    const closest = commonDurations.reduce((prev, curr) =>
      Math.abs(curr - durationInMinutes) < Math.abs(prev - durationInMinutes)
        ? curr
        : prev,
    );

    return closest;
  }

  /**
   * Prevê melhor horário para próxima sessão
   */
  predictBestTimeForNextSession(sessions: PomodoroSession[]): Date | null {
    if (sessions.length < 5) {
      return null;
    }

    const patterns = this.analyzeProductivityPatterns(sessions);
    const now = new Date();
    const suggestedTime = new Date();

    // Definir horário baseado no melhor período
    switch (patterns.bestTimeOfDay) {
      case "morning":
        suggestedTime.setHours(9, 0, 0, 0);
        break;
      case "afternoon":
        suggestedTime.setHours(14, 0, 0, 0);
        break;
      case "evening":
        suggestedTime.setHours(19, 0, 0, 0);
        break;
      case "night":
        suggestedTime.setHours(21, 0, 0, 0);
        break;
    }

    // Se o horário já passou hoje, sugerir para amanhã
    if (suggestedTime <= now) {
      suggestedTime.setDate(suggestedTime.getDate() + 1);
    }

    return suggestedTime;
  }

  /**
   * Traduz período do dia
   */
  private translateTimeOfDay(timeOfDay: string): string {
    const translations: Record<string, string> = {
      morning: "manhã",
      afternoon: "tarde",
      evening: "noite",
      night: "madrugada",
    };
    return translations[timeOfDay] || timeOfDay;
  }

  /**
   * Retorna emoji correspondente ao humor
   */
  private getMoodEmoji(mood: MoodLevel): string {
    const emojis: Record<MoodLevel, string> = {
      [MoodLevel.VERY_SAD]: "😔",
      [MoodLevel.SAD]: "😕",
      [MoodLevel.NEUTRAL]: "😐",
      [MoodLevel.HAPPY]: "😊",
      [MoodLevel.VERY_HAPPY]: "🤩",
    };
    return emojis[mood] || "😊";
  }

  /**
   * Detecta se o usuário está em risco de burnout
   */
  detectBurnoutRisk(
    sessions: PomodoroSession[],
    moodEntries: MoodEntry[],
  ): {
    risk: "low" | "medium" | "high";
    reasons: string[];
  } {
    const recentSessions = sessions.slice(0, 14); // Últimas 2 semanas
    const recentMoods = moodEntries.slice(0, 14);

    const reasons: string[] = [];
    let riskScore = 0;

    // Verificar excesso de sessões sem pausas adequadas
    const last7Days = sessions.slice(0, 7);
    const avgInterruptions =
      last7Days.reduce((acc, s) => acc + s.interruptions, 0) / last7Days.length;

    if (avgInterruptions > 3) {
      riskScore += 2;
      reasons.push("Alta taxa de interrupções nas sessões");
    }

    // Verificar mood em declínio
    const avgMood = calculateAverageMood(recentMoods.map((m) => m.mood));
    if (avgMood < MoodLevel.NEUTRAL) {
      riskScore += 2;
      reasons.push("Humor abaixo da média");
    }

    // Verificar muitas sessões consecutivas
    const sessionsPerDay = recentSessions.length / 7;
    if (sessionsPerDay > 8) {
      riskScore += 1;
      reasons.push("Volume muito alto de sessões");
    }

    // Verificar queda de produtividade
    const patterns = this.analyzeProductivityPatterns(sessions);
    if (patterns.productivityTrend === "declining") {
      riskScore += 1;
      reasons.push("Produtividade em declínio");
    }

    let risk: "low" | "medium" | "high";
    if (riskScore >= 4) risk = "high";
    else if (riskScore >= 2) risk = "medium";
    else risk = "low";

    return { risk, reasons };
  }
}

export default new AIService();
