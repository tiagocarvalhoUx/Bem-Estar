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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

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

  const achievements: Achievement[] = [
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

  const stats = [
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
        delay: index * 80,
        tension: 50,
        friction: 7,
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
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement ||
          (showArrow && (
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          ))}
      </TouchableOpacity>
    );
  };

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;
  const achievementProgress = (unlockedAchievements / totalAchievements) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <LinearGradient colors={["#dbeafe", "#ffffff"]} style={{ flex: 1 }}>
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
                      <Text style={styles.levelText}>12</Text>
                    </View>
                  </View>
                  <Text style={styles.profileName}>
                    {user?.displayName || "Usuário"}
                  </Text>
                  <Text style={styles.profileEmail}>{user?.email}</Text>

                  {/* XP Progress */}
                  <View style={styles.xpContainer}>
                    <View style={styles.xpBar}>
                      <View style={[styles.xpFill, { width: "75%" }]} />
                    </View>
                    <Text style={styles.xpText}>3,750 / 5,000 XP</Text>
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
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={styles.sectionCard}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="trophy" size={24} color="#f59e0b" />
                      <Text style={styles.sectionTitle}>Conquistas</Text>
                    </View>
                    <Text style={styles.achievementProgress}>
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
                </LinearGradient>
              </Animated.View>

              {/* Settings Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                }}
              >
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={styles.sectionCard}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="settings" size={24} color="#3b82f6" />
                      <Text style={styles.sectionTitle}>Configurações</Text>
                    </View>
                  </View>

                  <View style={styles.settingsList}>
                    <SettingRow
                      icon="notifications"
                      title="Notificações"
                      subtitle="Receber lembretes e alertas"
                      color="#f59e0b"
                      showArrow={false}
                      rightElement={
                        <Switch
                          value={notificationsEnabled}
                          onValueChange={setNotificationsEnabled}
                          trackColor={{ false: "#e2e8f0", true: "#f59e0b" }}
                          thumbColor="#ffffff"
                        />
                      }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                      icon="volume-high"
                      title="Sons"
                      subtitle="Tocar sons no app"
                      color="#10b981"
                      showArrow={false}
                      rightElement={
                        <Switch
                          value={soundEnabled}
                          onValueChange={setSoundEnabled}
                          trackColor={{ false: "#e2e8f0", true: "#10b981" }}
                          thumbColor="#ffffff"
                        />
                      }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                      icon="moon"
                      title="Modo Escuro"
                      subtitle="Tema escuro do aplicativo"
                      color="#8b5cf6"
                      showArrow={false}
                      rightElement={
                        <Switch
                          value={darkModeEnabled}
                          onValueChange={setDarkModeEnabled}
                          trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
                          thumbColor="#ffffff"
                        />
                      }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                      icon="time"
                      title="Duração do Pomodoro"
                      subtitle="Personalizar tempos"
                      color="#3b82f6"
                      onPress={() =>
                        Alert.alert(
                          "Em breve",
                          "Esta funcionalidade estará disponível em breve",
                        )
                      }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                      icon="person"
                      title="Editar Perfil"
                      subtitle="Alterar nome e foto"
                      color="#f43f5e"
                      onPress={() =>
                        Alert.alert(
                          "Em breve",
                          "Esta funcionalidade estará disponível em breve",
                        )
                      }
                    />
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Account Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                }}
              >
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={styles.sectionCard}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons
                        name="shield-checkmark"
                        size={24}
                        color="#10b981"
                      />
                      <Text style={styles.sectionTitle}>Conta</Text>
                    </View>
                  </View>

                  <View style={styles.settingsList}>
                    <SettingRow
                      icon="help-circle"
                      title="Ajuda e Suporte"
                      color="#3b82f6"
                      onPress={() =>
                        Alert.alert(
                          "Suporte",
                          "Entre em contato conosco através do email: suporte@pomoai.com",
                        )
                      }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                      icon="document-text"
                      title="Termos de Uso"
                      color="#64748b"
                      onPress={() =>
                        Alert.alert(
                          "Em breve",
                          "Esta funcionalidade estará disponível em breve",
                        )
                      }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                      icon="shield"
                      title="Privacidade"
                      color="#64748b"
                      onPress={() =>
                        Alert.alert(
                          "Em breve",
                          "Esta funcionalidade estará disponível em breve",
                        )
                      }
                    />
                  </View>
                </LinearGradient>
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
              <Text style={styles.versionText}>Versão 1.0.0</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
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
