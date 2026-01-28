import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import {
  PomodoroContextType,
  PomodoroMode,
  TimerStatus,
  PomodoroSession,
  MoodEntry,
} from "../types";
import { useAuth } from "./AuthContext";
import firestoreService from "../services/firestore.service";

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined,
);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  // Estados principais
  const [currentMode, setCurrentMode] = useState<PomodoroMode>(
    PomodoroMode.WORK,
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [interruptions, setInterruptions] = useState<number>(0);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Preferências do usuário (valores padrão)
  const preferences = user?.preferences || {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    enableNotifications: true,
    enableSounds: true,
    enableHaptics: true,
  };

  // Inicializar tempo baseado no modo
  useEffect(() => {
    if (status === TimerStatus.IDLE) {
      const duration = getDurationForMode(currentMode);
      setTimeRemaining(duration * 60); // converter para segundos
    }
  }, [currentMode, status]);

  // Atualizar tempo quando as preferências do usuário mudarem
  useEffect(() => {
    if (status === TimerStatus.IDLE && user?.preferences) {
      const duration = getDurationForMode(currentMode);
      setTimeRemaining(duration * 60);
      console.log(
        "PomodoroContext: Preferências atualizadas, novo tempo:",
        duration,
      );
    }
  }, [
    user?.preferences?.workDuration,
    user?.preferences?.shortBreakDuration,
    user?.preferences?.longBreakDuration,
  ]);

  // Carregar dados do Firestore quando o usuário logar
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        console.log("PomodoroContext: Carregando sessões do Firestore...");
        const userSessions = await firestoreService.getUserSessions(user.id);
        setSessions(userSessions);
        console.log(
          "PomodoroContext: Sessões carregadas:",
          userSessions.length,
          "primeiras 3:",
          userSessions
            .slice(0, 3)
            .map((s) => ({ id: s.id, mode: s.mode, duration: s.duration })),
        );

        console.log("PomodoroContext: Carregando histórico de humor...");
        const userMoodHistory = await firestoreService.getUserMoodEntries(
          user.id,
        );
        setMoodHistory(userMoodHistory);
        console.log(
          "PomodoroContext: Humor carregado:",
          userMoodHistory.length,
        );
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
  }, [user?.id]);

  // Log quando sessions ou moodHistory mudarem
  useEffect(() => {
    console.log("=== PomodoroContext: ESTADO ATUALIZADO ===", {
      sessionsCount: sessions.length,
      moodHistoryCount: moodHistory.length,
      primeiras2Sessions: sessions
        .slice(0, 2)
        .map((s) => ({ id: s.id, mode: s.mode })),
    });
  }, [sessions, moodHistory]);

  // Função para obter duração baseada no modo
  const getDurationForMode = (mode: PomodoroMode): number => {
    switch (mode) {
      case PomodoroMode.WORK:
        return preferences.workDuration;
      case PomodoroMode.SHORT_BREAK:
        return preferences.shortBreakDuration;
      case PomodoroMode.LONG_BREAK:
        return preferences.longBreakDuration;
      default:
        return preferences.workDuration;
    }
  };

  // Timer principal
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  // Iniciar timer
  const startTimer = async () => {
    if (status === TimerStatus.IDLE) {
      startTimeRef.current = Date.now();
    }

    setStatus(TimerStatus.RUNNING);

    if (preferences.enableHaptics) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Pausar timer
  const pauseTimer = async () => {
    setStatus(TimerStatus.PAUSED);
    setInterruptions((prev) => prev + 1);

    if (preferences.enableHaptics) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Resetar timer
  const resetTimer = async () => {
    setStatus(TimerStatus.IDLE);
    const duration = getDurationForMode(currentMode);
    setTimeRemaining(duration * 60);
    setInterruptions(0);

    if (preferences.enableHaptics) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  // Pular para próximo timer
  const skipTimer = async () => {
    await handleTimerComplete();

    if (preferences.enableHaptics) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  // Mudar modo manualmente
  const switchMode = (mode: PomodoroMode) => {
    setCurrentMode(mode);
    setStatus(TimerStatus.IDLE);
    setInterruptions(0);
    const duration = getDurationForMode(mode);
    setTimeRemaining(duration * 60);
  };

  // Completar timer
  const handleTimerComplete = async () => {
    console.log("PomodoroContext: Timer completado!", {
      mode: currentMode,
      hasUser: !!user,
      willSaveSession: currentMode === PomodoroMode.WORK && !!user,
    });
    setStatus(TimerStatus.COMPLETED);

    // Tocar som
    if (preferences.enableSounds) {
      await playCompletionSound();
    }

    // Haptic feedback (não funciona na web)
    if (preferences.enableHaptics && Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Enviar notificação
    if (preferences.enableNotifications) {
      await sendCompletionNotification();
    }

    // Salvar sessão se for de trabalho
    if (currentMode === PomodoroMode.WORK && user) {
      console.log("PomodoroContext: Salvando sessão de trabalho...");
      const duration = getDurationForMode(currentMode);
      await saveSession(duration);
      setCompletedSessions((prev) => prev + 1);
      console.log(
        "PomodoroContext: Sessão salva! Total:",
        completedSessions + 1,
      );
      console.log(
        "PomodoroContext: Verificando sessions array após salvar:",
        sessions.length,
      );
    } else {
      console.warn("PomodoroContext: NÃO salvando sessão porque:", {
        isWorkMode: currentMode === PomodoroMode.WORK,
        hasUser: !!user,
        currentMode,
      });
    }

    // Mudar para próximo modo automaticamente
    setTimeout(() => {
      switchToNextMode();
    }, 2000);
  };

  // Mudar para próximo modo
  const switchToNextMode = () => {
    if (currentMode === PomodoroMode.WORK) {
      const shouldTakeLongBreak =
        (completedSessions + 1) % preferences.sessionsUntilLongBreak === 0;
      const nextMode = shouldTakeLongBreak
        ? PomodoroMode.LONG_BREAK
        : PomodoroMode.SHORT_BREAK;
      switchMode(nextMode);
    } else {
      switchMode(PomodoroMode.WORK);
    }
  };

  // Tocar som de conclusão
  const playCompletionSound = async () => {
    try {
      // Usando URL direta enquanto não temos arquivo local
      const { sound } = await Audio.Sound.createAsync(
        { uri: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" },
        { shouldPlay: true },
      );
      soundRef.current = sound;

      // Descarregar som após tocar
      setTimeout(() => {
        sound.unloadAsync();
      }, 5000);
    } catch (error) {
      console.log("Erro ao tocar som:", error);
    }
  };

  // Enviar notificação
  const sendCompletionNotification = async () => {
    // Notificações não funcionam na web
    if (Platform.OS === "web") {
      console.log(
        "PomodoroContext: Notificações não suportadas na web, pulando...",
      );
      return;
    }

    try {
      let title = "";
      let body = "";

      if (currentMode === PomodoroMode.WORK) {
        title = "🎉 Sessão concluída!";
        body = "Ótimo trabalho! Hora de fazer uma pausa.";
      } else {
        title = "⏰ Pausa concluída!";
        body = "Vamos voltar ao trabalho focado?";
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Enviar imediatamente
      });
    } catch (error) {
      console.log("Erro ao enviar notificação:", error);
    }
  };

  // Salvar sessão no Firestore
  const saveSession = async (duration: number) => {
    if (!user) {
      console.error(
        "PomodoroContext: ERRO - Tentando salvar sessão sem usuário!",
      );
      return;
    }

    try {
      console.log("PomodoroContext: Salvando sessão no Firestore...", {
        userId: user.id,
        mode: currentMode,
        duration: duration * 60,
      });

      const sessionData = {
        userId: user.id,
        mode: currentMode,
        duration: duration * 60, // em segundos
        completedAt: new Date(),
        interruptions,
      };

      console.log(
        "PomodoroContext: Chamando firestoreService.savePomodoroSession...",
      );
      const sessionId = await firestoreService.savePomodoroSession(sessionData);
      console.log("PomodoroContext: SessionId retornado:", sessionId);

      // Criar objeto completo com o ID retornado
      const newSession: PomodoroSession = {
        id: sessionId,
        ...sessionData,
      };

      console.log(
        "PomodoroContext: Atualizando estado local com nova sessão...",
      );
      // Atualizar estado local
      setSessions((prevSessions) => {
        const updated = [newSession, ...prevSessions];
        console.log(
          "PomodoroContext: Sessão salva com sucesso!",
          sessionId,
          "Total agora:",
          updated.length,
        );
        return updated;
      });
    } catch (error) {
      console.error("PomodoroContext: ERRO ao salvar sessão:", error);
      console.error("PomodoroContext: Stack trace:", error.stack);
    }
  };

  // Função para adicionar mood entry
  const addMoodEntry = (newMood: MoodEntry) => {
    setMoodHistory((prevMoods) => [newMood, ...prevMoods]);
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const value: PomodoroContextType = {
    currentMode,
    timeRemaining,
    status,
    completedSessions,
    sessions,
    moodHistory,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
    addMoodEntry,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro deve ser usado dentro de um PomodoroProvider");
  }
  return context;
};
