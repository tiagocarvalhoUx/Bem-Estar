import { useState, useEffect } from 'react';
import { AISuggestion, PomodoroSession, MoodEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import aiService from '../services/ai.service';
import firestoreService from '../services/firestore.service';

/**
 * Hook personalizado para gerenciar sugestões de IA
 */
export const useAI = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [burnoutRisk, setBurnoutRisk] = useState<{
    risk: 'low' | 'medium' | 'high';
    reasons: string[];
  } | null>(null);

  /**
   * Gerar sugestões baseadas em IA
   */
  const generateSuggestions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar dados necessários
      const [sessions, moodEntries] = await Promise.all([
        firestoreService.getUserSessions(user.id, 50),
        firestoreService.getUserMoodEntries(user.id, 30),
      ]);

      // Gerar sugestões
      const newSuggestions = aiService.generateSuggestions(user, sessions, moodEntries);
      setSuggestions(newSuggestions);

      // Detectar risco de burnout
      const burnout = aiService.detectBurnoutRisk(sessions, moodEntries);
      setBurnoutRisk(burnout);
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descartar sugestão
   */
  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, dismissed: true } : s))
    );
  };

  /**
   * Aceitar sugestão
   */
  const acceptSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, accepted: true, dismissed: true } : s))
    );
  };

  /**
   * Obter sugestões ativas (não descartadas)
   */
  const getActiveSuggestions = () => {
    return suggestions.filter((s) => !s.dismissed);
  };

  /**
   * Obter duração ideal sugerida pela IA
   */
  const getOptimalDuration = async (): Promise<number> => {
    if (!user) return 25;

    try {
      const sessions = await firestoreService.getUserSessions(user.id, 20);
      return aiService.suggestOptimalSessionDuration(sessions);
    } catch (error) {
      console.error('Erro ao calcular duração ideal:', error);
      return 25;
    }
  };

  /**
   * Prever melhor horário para próxima sessão
   */
  const predictNextSessionTime = async (): Promise<Date | null> => {
    if (!user) return null;

    try {
      const sessions = await firestoreService.getUserSessions(user.id, 30);
      return aiService.predictBestTimeForNextSession(sessions);
    } catch (error) {
      console.error('Erro ao prever horário:', error);
      return null;
    }
  };

  /**
   * Analisar padrões de produtividade
   */
  const analyzePatterns = async () => {
    if (!user) return null;

    try {
      const sessions = await firestoreService.getUserSessions(user.id, 50);
      return aiService.analyzeProductivityPatterns(sessions);
    } catch (error) {
      console.error('Erro ao analisar padrões:', error);
      return null;
    }
  };

  // Gerar sugestões ao montar o componente
  useEffect(() => {
    if (user) {
      generateSuggestions();
    }
  }, [user]);

  return {
    suggestions: getActiveSuggestions(),
    allSuggestions: suggestions,
    loading,
    burnoutRisk,
    generateSuggestions,
    dismissSuggestion,
    acceptSuggestion,
    getOptimalDuration,
    predictNextSessionTime,
    analyzePatterns,
  };
};

/**
 * Hook para análise de produtividade
 */
export const useProductivityAnalysis = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<{
    bestTimeOfDay: string;
    averageSessionsPerDay: number;
    mostProductiveDay: string;
    productivityTrend: 'improving' | 'stable' | 'declining';
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const sessions = await firestoreService.getUserSessions(user.id, 50);
      const analysis = aiService.analyzeProductivityPatterns(sessions);
      setPatterns(analysis);
    } catch (error) {
      console.error('Erro ao analisar produtividade:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      analyze();
    }
  }, [user]);

  return {
    patterns,
    loading,
    refresh: analyze,
  };
};
