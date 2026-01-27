import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  useWindowDimensions,
  Animated,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { usePomodoro } from "../../contexts/PomodoroContext";
import { PomodoroMode } from "../../types";
import firestoreService from "../../services/firestore.service";

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
  color: string;
}

const ProfileScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const { user, signOut } = useAuth();
  const { sessions, moodHistory } = usePomodoro();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Estados das configurações baseados nas preferências do usuário
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.enableNotifications ?? true,
  );
  const [soundEnabled, setSoundEnabled] = useState(
    user?.preferences?.enableSounds ?? true,
  );
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    user?.preferences?.darkMode ?? false,
  );

  // Estados para modais
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPomodoroSettingsModal, setShowPomodoroSettingsModal] =
    useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || "");
  const [workDuration, setWorkDuration] = useState(
    user?.preferences?.workDuration || 25,
  );
  const [shortBreakDuration, setShortBreakDuration] = useState(
    user?.preferences?.shortBreakDuration || 5,
  );
  const [longBreakDuration, setLongBreakDuration] = useState(
    user?.preferences?.longBreakDuration || 15,
  );

  // Sincronizar estados com preferências do usuário quando mudar
  useEffect(() => {
    if (user?.preferences) {
      setNotificationsEnabled(user.preferences.enableNotifications ?? true);
      setSoundEnabled(user.preferences.enableSounds ?? true);
      setDarkModeEnabled(user.preferences.darkMode ?? false);
    }
  }, [user?.preferences]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calcular estatísticas reais baseadas nas sessões
  const calculateRealStats = () => {
    // Total de horas
    const totalMinutes =
      sessions?.reduce((total, session) => total + session.duration / 60, 0) ||
      0;
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Total de pomodoros (sessões WORK)
    const pomodoroCount =
      sessions?.filter((s) => s.mode === PomodoroMode.WORK).length || 0;

    // Sequência atual
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(checkDate);
      nextDay.setDate(checkDate.getDate() + 1);

      const hasSessions = sessions?.some((session) => {
        const sessionDate = new Date(session.completedAt);
        return sessionDate >= checkDate && sessionDate < nextDay;
      });

      if (hasSessions) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Taxa de sucesso (100% porque só gravamos sessões completadas)
    const successRate = sessions?.length > 0 ? 100 : 0;

    return {
      totalHours: `${totalHours}h`,
      pomodoroCount: pomodoroCount.toString(),
      streak: `${streak} ${streak === 1 ? "dia" : "dias"}`,
      successRate: `${successRate}%`,
    };
  };

  // Calcular nível e XP baseado nas sessões
  const calculateLevelAndXP = () => {
    const totalSessions = sessions?.length || 0;
    const totalMoods = moodHistory?.length || 0;

    // XP = sessões * 10 + humores * 5
    const totalXP = totalSessions * 10 + totalMoods * 5;

    // Nível = XP / 500 (cada nível requer 500 XP)
    const level = Math.floor(totalXP / 500) + 1;

    // XP no nível atual
    const currentLevelXP = totalXP % 500;
    const nextLevelXP = 500;
    const xpProgress = (currentLevelXP / nextLevelXP) * 100;

    return {
      level,
      currentXP: currentLevelXP,
      nextLevelXP,
      totalXP,
      xpProgress: Math.round(xpProgress),
    };
  };

  // Calcular conquistas dinâmicas
  const calculateAchievements = (): Achievement[] => {
    const workSessions =
      sessions?.filter((s) => s.mode === PomodoroMode.WORK).length || 0;
    const totalMoods = moodHistory?.length || 0;

    // Calcular sequência
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(checkDate);
      nextDay.setDate(checkDate.getDate() + 1);

      const hasSessions = sessions?.some((session) => {
        const sessionDate = new Date(session.completedAt);
        return sessionDate >= checkDate && sessionDate < nextDay;
      });

      if (hasSessions) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return [
      {
        id: "1",
        icon: "🔥",
        title: "Sequência de 7 dias",
        description: "Use o app por 7 dias consecutivos",
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        total: 7,
        color: "#f59e0b",
      },
      {
        id: "2",
        icon: "⚡",
        title: "50 Pomodoros",
        description: "Complete 50 sessões de pomodoro",
        unlocked: workSessions >= 50,
        progress: Math.min(workSessions, 50),
        total: 50,
        color: "#f59e0b",
      },
      {
        id: "3",
        icon: "🎯",
        title: "10 Pomodoros",
        description: "Complete 10 sessões de pomodoro",
        unlocked: workSessions >= 10,
        progress: Math.min(workSessions, 10),
        total: 10,
        color: "#10b981",
      },
      {
        id: "4",
        icon: "💪",
        title: "Maratonista",
        description: "Complete 100 pomodoros",
        unlocked: workSessions >= 100,
        progress: Math.min(workSessions, 100),
        total: 100,
        color: "#3b82f6",
      },
      {
        id: "5",
        icon: "🏆",
        title: "Campeão",
        description: "Sequência de 30 dias",
        unlocked: streak >= 30,
        progress: Math.min(streak, 30),
        total: 30,
        color: "#8b5cf6",
      },
      {
        id: "6",
        icon: "🌟",
        title: "Estrela",
        description: "Registre 50 humores",
        unlocked: totalMoods >= 50,
        progress: Math.min(totalMoods, 50),
        total: 50,
        color: "#f43f5e",
      },
    ];
  };

  const realStats = calculateRealStats();
  const levelInfo = calculateLevelAndXP();
  const achievements = calculateAchievements();

  console.log("ProfileScreen: Dados calculados", {
    totalSessions: sessions?.length || 0,
    totalMoods: moodHistory?.length || 0,
    level: levelInfo.level,
    totalXP: levelInfo.totalXP,
    achievements: achievements.filter((a) => a.unlocked).length,
  });

  const achievementsOLD: Achievement[] = [
    {
      id: "1",
      icon: "🔥",
      title: "Sequência de 7 dias",
      description: "Use o app por 7 dias consecutivos",
      unlocked: true,
      color: "#f59e0b",
    },
    {
      id: "2",
      icon: "⚡",
      title: "50 Pomodoros",
      description: "Complete 50 sessões de pomodoro",
      unlocked: true,
      color: "#f59e0b",
    },
    {
      id: "3",
      icon: "🎯",
      title: "Meta Semanal",
      description: "Atinja sua meta semanal 4 vezes",
      unlocked: true,
      color: "#10b981",
    },
    {
      id: "4",
      icon: "💪",
      title: "Maratonista",
      description: "Complete 100 pomodoros",
      unlocked: false,
      progress: 76,
      total: 100,
      color: "#3b82f6",
    },
    {
      id: "5",
      icon: "🏆",
      title: "Campeão",
      description: "Sequência de 30 dias",
      unlocked: false,
      progress: 15,
      total: 30,
      color: "#8b5cf6",
    },
    {
      id: "6",
      icon: "🌟",
      title: "Estrela",
      description: "Registre 50 humores",
      unlocked: false,
      progress: 32,
      total: 50,
      color: "#f43f5e",
    },
  ];

  const statsOLD = [
    {
      label: "Total de Horas",
      value: "124.5h",
      icon: "time-outline",
      color: "#3b82f6",
    },
    {
      label: "Pomodoros",
      value: "298",
      icon: "timer-outline",
      color: "#f59e0b",
    },
    {
      label: "Sequência",
      value: "15 dias",
      icon: "flame-outline",
      color: "#f43f5e",
    },
    {
      label: "Taxa de Sucesso",
      value: "89%",
      icon: "trending-up-outline",
      color: "#10b981",
    },
  ];

  // Stats reais calculados
  const stats = [
    {
      label: "Total de Horas",
      value: realStats.totalHours,
      icon: "time-outline",
      color: "#3b82f6",
    },
    {
      label: "Pomodoros",
      value: realStats.pomodoroCount,
      icon: "timer-outline",
      color: "#f59e0b",
    },
    {
      label: "Sequência",
      value: realStats.streak,
      icon: "flame-outline",
      color: "#f43f5e",
    },
    {
      label: "Taxa de Sucesso",
      value: realStats.successRate,
      icon: "trending-up-outline",
      color: "#10b981",
    },
  ];

  // Funções para atualizar preferências no Firebase
  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (user?.id) {
      try {
        await firestoreService.updateUserPreferences(user.id, {
          ...user.preferences,
          enableNotifications: value,
        });
        console.log("Preferência de notificações atualizada:", value);
      } catch (error) {
        console.error("Erro ao atualizar notificações:", error);
        setNotificationsEnabled(!value); // Reverter em caso de erro
        Alert.alert("Erro", "Não foi possível salvar a configuração");
      }
    }
  };

  const handleToggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    if (user?.id) {
      try {
        await firestoreService.updateUserPreferences(user.id, {
          ...user.preferences,
          enableSounds: value,
        });
        console.log("Preferência de sons atualizada:", value);
      } catch (error) {
        console.error("Erro ao atualizar sons:", error);
        setSoundEnabled(!value); // Reverter em caso de erro
        Alert.alert("Erro", "Não foi possível salvar a configuração");
      }
    }
  };

  const handleToggleDarkMode = async (value: boolean) => {
    setDarkModeEnabled(value);
    if (user?.id) {
      try {
        await firestoreService.updateUserPreferences(user.id, {
          ...user.preferences,
          darkMode: value,
        });
        console.log("Preferência de modo escuro atualizada:", value);
        Alert.alert(
          "Modo Escuro",
          value
            ? "Modo escuro ativado! Esta funcionalidade está em desenvolvimento e será aprimorada em breve."
            : "Modo escuro desativado.",
          [{ text: "OK" }],
        );
      } catch (error) {
        console.error("Erro ao atualizar modo escuro:", error);
        setDarkModeEnabled(!value); // Reverter em caso de erro
        Alert.alert("Erro", "Não foi possível salvar a configuração");
      }
    }
  };

  const handleEditProfile = () => {
    setEditedName(user?.displayName || "");
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert("Erro", "Por favor, digite um nome");
      return;
    }

    try {
      // Atualizar nome no Firebase Auth e Firestore
      await firestoreService.updateUserProfile(user!.id, {
        displayName: editedName.trim(),
      });

      setShowEditProfileModal(false);

      // Recarregar página para atualizar o contexto
      if (Platform.OS === "web") {
        Alert.alert("Sucesso", "Perfil atualizado!");
        setTimeout(() => window.location.reload(), 500);
      } else {
        Alert.alert(
          "Sucesso",
          "Perfil atualizado! Reabra o app para ver as mudanças.",
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", "Não foi possível atualizar o perfil");
    }
  };

  const handlePomodoroSettings = () => {
    setWorkDuration(user?.preferences?.workDuration || 25);
    setShortBreakDuration(user?.preferences?.shortBreakDuration || 5);
    setLongBreakDuration(user?.preferences?.longBreakDuration || 15);
    setShowPomodoroSettingsModal(true);
  };

  const handleSavePomodoroSettings = async () => {
    if (workDuration < 1 || workDuration > 60) {
      Alert.alert(
        "Erro",
        "Duração do trabalho deve estar entre 1 e 60 minutos",
      );
      return;
    }
    if (shortBreakDuration < 1 || shortBreakDuration > 30) {
      Alert.alert(
        "Erro",
        "Duração da pausa curta deve estar entre 1 e 30 minutos",
      );
      return;
    }
    if (longBreakDuration < 1 || longBreakDuration > 60) {
      Alert.alert(
        "Erro",
        "Duração da pausa longa deve estar entre 1 e 60 minutos",
      );
      return;
    }

    try {
      await firestoreService.updateUserPreferences(user!.id, {
        ...user!.preferences,
        workDuration,
        shortBreakDuration,
        longBreakDuration,
      });

      setShowPomodoroSettingsModal(false);
      Alert.alert("Sucesso", "Configurações de Pomodoro atualizadas!");
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      Alert.alert("Erro", "Não foi possível salvar as configurações");
    }
  };

  const handleLogout = async () => {
    console.log("ProfileScreen: handleLogout foi chamado!");

    // Usar window.confirm para funcionar na web
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Tem certeza que deseja sair da sua conta?")
        : await new Promise((resolve) => {
            Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
              {
                text: "Cancelar",
                style: "cancel",
                onPress: () => resolve(false),
              },
              {
                text: "Sair",
                style: "destructive",
                onPress: () => resolve(true),
              },
            ]);
          });

    if (!confirmed) {
      console.log("ProfileScreen: Logout cancelado pelo usuário");
      return;
    }

    try {
      console.log("ProfileScreen: Iniciando processo de logout...");
      await signOut();
      console.log("ProfileScreen: Logout finalizado");
    } catch (error) {
      console.error("ProfileScreen: Erro ao fazer logout:", error);
      if (Platform.OS === "web") {
        window.alert("Erro: Não foi possível fazer logout. Tente novamente.");
      } else {
        Alert.alert("Erro", "Não foi possível fazer logout. Tente novamente.");
      }
    }
  };

  const AchievementCard = ({ achievement, index }) => {
    const [cardAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        delay: index * 250,
        tension: 20,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          transform: [
            {
              translateX: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            { scale: cardAnim },
          ],
          opacity: cardAnim,
        }}
      >
        <LinearGradient
          colors={
            achievement.unlocked
              ? ["#ffffff", "#fafafa"]
              : ["#f8fafc", "#f1f5f9"]
          }
          style={[
            styles.achievementCard,
            !achievement.unlocked && { opacity: 0.7 },
          ]}
        >
          <View style={styles.achievementIcon}>
            <Text
              style={{ fontSize: 40, opacity: achievement.unlocked ? 1 : 0.5 }}
            >
              {achievement.icon}
            </Text>
            {achievement.unlocked && (
              <View
                style={[
                  styles.unlockedBadge,
                  { backgroundColor: achievement.color },
                ]}
              >
                <Ionicons name="checkmark" size={12} color="#ffffff" />
              </View>
            )}
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
            {!achievement.unlocked &&
              achievement.progress &&
              achievement.total && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(achievement.progress / achievement.total) * 100}%`,
                          backgroundColor: achievement.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                </View>
              )}
          </View>
          {achievement.unlocked && (
            <Ionicons name="lock-open" size={20} color={achievement.color} />
          )}
          {!achievement.unlocked && (
            <Ionicons name="lock-closed" size={20} color="#94a3b8" />
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const StatCard = ({ stat, index }) => {
    const [cardAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        delay: index * 80,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
              { scale: cardAnim },
            ],
            opacity: cardAnim,
          },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#fafafa"]}
          style={styles.statCardGradient}
        >
          <View
            style={[styles.statIcon, { backgroundColor: stat.color + "15" }]}
          >
            <Ionicons name={stat.icon} size={24} color={stat.color} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    color,
    onPress,
    showArrow = true,
    rightElement,
    theme: rowTheme,
  }) => {
    return (
      <TouchableOpacity
        style={styles.settingRow}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={[styles.settingIcon, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.settingContent}>
          <Text
            style={[styles.settingTitle, rowTheme && { color: rowTheme.text }]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                rowTheme && { color: rowTheme.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {rightElement ||
          (showArrow && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={rowTheme ? rowTheme.textTertiary : "#94a3b8"}
            />
          ))}
      </TouchableOpacity>
    );
  };

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;
  const achievementProgress = (unlockedAchievements / totalAchievements) * 100;

  // Tema dinâmico baseado no modo escuro
  const theme = {
    background: darkModeEnabled ? "#0f172a" : "#f8fafc",
    card: darkModeEnabled ? "#1e293b" : "#ffffff",
    cardSecondary: darkModeEnabled ? "#334155" : "#fafafa",
    text: darkModeEnabled ? "#f1f5f9" : "#1e293b",
    textSecondary: darkModeEnabled ? "#cbd5e1" : "#64748b",
    border: darkModeEnabled ? "#475569" : "#e2e8f0",
    inputBg: darkModeEnabled ? "#334155" : "#f8fafc",
    gradient1: darkModeEnabled ? "#1e293b" : "#dbeafe",
    gradient2: darkModeEnabled ? "#0f172a" : "#ffffff",
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={[theme.gradient1, theme.gradient2]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["#3b82f6", "#1e40af"]}
                style={styles.headerGradient}
              >
                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={["#60a5fa", "#3b82f6"]}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {user?.displayName?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </LinearGradient>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{levelInfo.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.profileName}>
                    {user?.displayName || "Usuário"}
                  </Text>
                  <Text style={styles.profileEmail}>{user?.email}</Text>

                  {/* XP Progress */}
                  <View style={styles.xpContainer}>
                    <View style={styles.xpBar}>
                      <View
                        style={[
                          styles.xpFill,
                          { width: `${levelInfo.xpProgress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.xpText}>
                      {levelInfo.currentXP.toLocaleString()} /{" "}
                      {levelInfo.nextLevelXP.toLocaleString()} XP
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            <View
              style={{
                paddingHorizontal: isDesktop ? 0 : 20,
                maxWidth: isDesktop ? 1200 : "100%",
                marginHorizontal: isDesktop ? "auto" : 0,
                width: "100%",
              }}
            >
              {/* Stats Grid */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: -40,
                  marginBottom: 24,
                }}
              >
                <View style={styles.statsGrid}>
                  {stats.map((stat, index) => (
                    <StatCard key={index} stat={stat} index={index} />
                  ))}
                </View>
              </Animated.View>

              {/* Achievements Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <View
                  style={[styles.sectionCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="trophy" size={24} color="#f59e0b" />
                      <Text
                        style={[styles.sectionTitle, { color: theme.text }]}
                      >
                        Conquistas
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.achievementProgress,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {unlockedAchievements}/{totalAchievements}
                    </Text>
                  </View>

                  <View style={styles.achievementProgressBar}>
                    <View style={styles.achievementProgressBg}>
                      <LinearGradient
                        colors={["#f59e0b", "#d97706"]}
                        style={[
                          styles.achievementProgressFill,
                          { width: `${achievementProgress}%` },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.achievementsList}>
                    {achievements.map((achievement, index) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        index={index}
                      />
                    ))}
                  </View>
                </View>
              </Animated.View>

              {/* Settings Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                }}
              >
                <View
                  style={[styles.sectionCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="settings" size={24} color="#3b82f6" />
                      <Text
                        style={[styles.sectionTitle, { color: theme.text }]}
                      >
                        Configurações
                      </Text>
                    </View>
                  </View>

                  <View style={styles.settingsList}>
                    <SettingRow
                      icon="notifications"
                      title="Notificações"
                      subtitle="Receber lembretes e alertas"
                      color="#f59e0b"
                      theme={theme}
                      showArrow={false}
                      rightElement={
                        <Switch
                          value={notificationsEnabled}
                          onValueChange={handleToggleNotifications}
                          trackColor={{ false: "#e2e8f0", true: "#f59e0b" }}
                          thumbColor="#ffffff"
                        />
                      }
                    />
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                    <SettingRow
                      icon="volume-high"
                      title="Sons"
                      subtitle="Tocar sons no app"
                      color="#10b981"
                      theme={theme}
                      showArrow={false}
                      rightElement={
                        <Switch
                          value={soundEnabled}
                          onValueChange={handleToggleSound}
                          trackColor={{ false: "#e2e8f0", true: "#10b981" }}
                          thumbColor="#ffffff"
                        />
                      }
                    />
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                    <SettingRow
                      icon="moon"
                      title="Modo Escuro"
                      subtitle="Tema escuro do aplicativo"
                      color="#8b5cf6"
                      theme={theme}
                      showArrow={false}
                      rightElement={
                        <Switch
                          value={darkModeEnabled}
                          onValueChange={handleToggleDarkMode}
                          trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
                          thumbColor="#ffffff"
                        />
                      }
                    />
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                    <SettingRow
                      icon="time"
                      title="Duração do Pomodoro"
                      subtitle="Personalizar tempos"
                      color="#3b82f6"
                      theme={theme}
                      onPress={handlePomodoroSettings}
                    />
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                    <SettingRow
                      icon="person"
                      title="Editar Perfil"
                      subtitle="Alterar nome e foto"
                      color="#f43f5e"
                      theme={theme}
                      onPress={handleEditProfile}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Account Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                }}
              >
                <View
                  style={[styles.sectionCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons
                        name="shield-checkmark"
                        size={24}
                        color="#10b981"
                      />
                      <Text
                        style={[styles.sectionTitle, { color: theme.text }]}
                      >
                        Conta
                      </Text>
                    </View>
                  </View>

                  <View style={styles.settingsList}>
                    <SettingRow
                      icon="help-circle"
                      title="Ajuda e Suporte"
                      color="#3b82f6"
                      theme={theme}
                      onPress={() =>
                        Alert.alert(
                          "Suporte",
                          "Entre em contato conosco através do email: suporte@pomoai.com",
                        )
                      }
                    />
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                    <SettingRow
                      icon="document-text"
                      title="Termos de Uso"
                      color="#64748b"
                      theme={theme}
                      onPress={() =>
                        Alert.alert(
                          "Em breve",
                          "Esta funcionalidade estará disponível em breve",
                        )
                      }
                    />
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                    <SettingRow
                      icon="shield"
                      title="Privacidade"
                      color="#64748b"
                      theme={theme}
                      onPress={() =>
                        Alert.alert(
                          "Em breve",
                          "Esta funcionalidade estará disponível em breve",
                        )
                      }
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Logout Button */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
                  <LinearGradient
                    colors={["#f43f5e", "#dc2626"]}
                    style={styles.logoutButton}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={24}
                      color="#ffffff"
                    />
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Version */}
              <Text
                style={[styles.versionText, { color: theme.textSecondary }]}
              >
                Versão 1.0.0
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Modal Editar Perfil */}
      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: 24,
              }}
            >
              Editar Perfil
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Nome
            </Text>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Seu nome"
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1e293b",
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            />

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => setShowEditProfileModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#f1f5f9",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#64748b" }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={{
                  flex: 1,
                  backgroundColor: "#0ea5e9",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "white" }}
                >
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Configurações Pomodoro */}
      <Modal
        visible={showPomodoroSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPomodoroSettingsModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: 24,
              }}
            >
              Duração do Pomodoro
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Tempo de Trabalho (minutos)
            </Text>
            <TextInput
              value={String(workDuration)}
              onChangeText={(text) => setWorkDuration(parseInt(text) || 25)}
              keyboardType="numeric"
              placeholder="25"
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1e293b",
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Pausa Curta (minutos)
            </Text>
            <TextInput
              value={String(shortBreakDuration)}
              onChangeText={(text) =>
                setShortBreakDuration(parseInt(text) || 5)
              }
              keyboardType="numeric"
              placeholder="5"
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1e293b",
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Pausa Longa (minutos)
            </Text>
            <TextInput
              value={String(longBreakDuration)}
              onChangeText={(text) =>
                setLongBreakDuration(parseInt(text) || 15)
              }
              keyboardType="numeric"
              placeholder="15"
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1e293b",
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            />

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => setShowPomodoroSettingsModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#f1f5f9",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#64748b" }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSavePomodoroSettings}
                style={{
                  flex: 1,
                  backgroundColor: "#0ea5e9",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "white" }}
                >
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 80,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff",
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#f59e0b",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  levelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#bfdbfe",
    fontWeight: "500",
    marginBottom: 20,
  },
  xpContainer: {
    width: "100%",
    maxWidth: 300,
  },
  xpBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  xpFill: {
    height: "100%",
    backgroundColor: "#fbbf24",
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: "#bfdbfe",
    fontWeight: "600",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
  },
  statCardGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  sectionCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  achievementProgress: {
    fontSize: 16,
    fontWeight: "800",
    color: "#f59e0b",
  },
  achievementProgressBar: {
    marginBottom: 20,
  },
  achievementProgressBg: {
    height: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 5,
    overflow: "hidden",
  },
  achievementProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  achievementIcon: {
    position: "relative",
    marginRight: 16,
  },
  unlockedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
  },
  settingsList: {
    gap: 0,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#f43f5e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  versionText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 24,
    fontWeight: "500",
  },
});

export default ProfileScreen;
