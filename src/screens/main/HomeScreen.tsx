import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { useAuth } from '../../contexts/AuthContext';
import TimerCircle from '../../components/TimerCircle';
import TimerControls from '../../components/TimerControls';
import ModeSelector from '../../components/ModeSelector';
import SessionCounter from '../../components/SessionCounter';
import { PomodoroMode, TimerStatus } from '../../types';

const HomeScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const { user } = useAuth();
  const {
    currentMode,
    timeRemaining,
    status,
    completedSessions,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
  } = usePomodoro();

  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const preferences = user?.preferences || {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  };

  useEffect(() => {
    // Entrada animada suave
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animação de pulso quando o timer está rodando
    if (status === TimerStatus.RUNNING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status]);

  const getTotalTime = () => {
    switch (currentMode) {
      case PomodoroMode.WORK:
        return preferences.workDuration * 60;
      case PomodoroMode.SHORT_BREAK:
        return preferences.shortBreakDuration * 60;
      case PomodoroMode.LONG_BREAK:
        return preferences.longBreakDuration * 60;
      default:
        return preferences.workDuration * 60;
    }
  };

  const handleReset = () => {
    if (status === TimerStatus.RUNNING) {
      Alert.alert(
        'Resetar Timer',
        'Tem certeza que deseja resetar o timer em andamento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Resetar', onPress: resetTimer, style: 'destructive' },
        ]
      );
    } else {
      resetTimer();
    }
  };

  const handleSkip = () => {
    Alert.alert('Pular Timer', 'Deseja pular para o próximo timer?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Pular', onPress: skipTimer },
    ]);
  };

  const getMotivationalMessage = () => {
    const messages = {
      [PomodoroMode.WORK]: {
        text: 'Foco total! Você consegue.',
        emoji: '💪',
        subtitle: 'Mantenha a concentração',
      },
      [PomodoroMode.SHORT_BREAK]: {
        text: 'Relaxe e recarregue.',
        emoji: '☕',
        subtitle: 'Momento de descanso',
      },
      [PomodoroMode.LONG_BREAK]: {
        text: 'Ótimo trabalho! Descanse.',
        emoji: '🌟',
        subtitle: 'Você merece',
      },
    };
    return messages[currentMode];
  };

  const getModeColors = () => {
    switch (currentMode) {
      case PomodoroMode.WORK:
        return {
          gradient: ['#fecdd3', '#fda4af', '#fb7185'],
          primary: '#f43f5e',
          light: '#fff1f2',
          dark: '#be123c',
          glow: 'rgba(244, 63, 94, 0.3)',
        };
      case PomodoroMode.SHORT_BREAK:
        return {
          gradient: ['#a7f3d0', '#6ee7b7', '#34d399'],
          primary: '#10b981',
          light: '#f0fdf4',
          dark: '#047857',
          glow: 'rgba(16, 185, 129, 0.3)',
        };
      case PomodoroMode.LONG_BREAK:
        return {
          gradient: ['#bae6fd', '#7dd3fc', '#38bdf8'],
          primary: '#0ea5e9',
          light: '#f0f9ff',
          dark: '#0369a1',
          glow: 'rgba(14, 165, 233, 0.3)',
        };
      default:
        return {
          gradient: ['#bae6fd', '#7dd3fc', '#38bdf8'],
          primary: '#0ea5e9',
          light: '#f0f9ff',
          dark: '#0369a1',
          glow: 'rgba(14, 165, 233, 0.3)',
        };
    }
  };

  const colors = getModeColors();
  const motivational = getMotivationalMessage();

  const StatCard = ({ icon, value, label, color, delay }: { icon: any; value: string; label: string; color: string; delay: number }) => {
    const [cardAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        delay,
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
              { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              { scale: cardAnim },
            ],
            opacity: cardAnim,
          },
        ]}
      >
        <LinearGradient
          colors={['#ffffff', '#fafafa']}
          style={styles.statCardGradient}
        >
          <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
          <View style={[styles.statGlow, { backgroundColor: color, opacity: 0.1 }]} />
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <LinearGradient
        colors={[colors.light, '#ffffff']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Header Premium */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
                },
              ]}
            >
              <LinearGradient
                colors={['#ffffff', 'rgba(255, 255, 255, 0.95)']}
                style={styles.headerGradient}
              >
                <View style={[styles.headerContent, { maxWidth: isDesktop ? 1200 : '100%', marginHorizontal: isDesktop ? 'auto' : 0, width: '100%' }]}>
                  <View style={styles.headerLeft}>
                    <LinearGradient
                      colors={colors.gradient as any}
                      style={[styles.avatarContainer, { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }]}
                    >
                      <Ionicons name="timer-outline" size={28} color="#ffffff" />
                    </LinearGradient>
                    <View style={styles.headerTextContainer}>
                      <Text style={styles.headerGreeting}>
                        Olá, {user?.displayName?.split(' ')[0] || 'Usuário'} 👋
                      </Text>
                      <Text style={styles.headerTitle}>Pomodoro AI</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.settingsButton}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#f8fafc', '#f1f5f9']}
                      style={styles.settingsButtonGradient}
                    >
                      <Ionicons name="settings-outline" size={22} color="#64748b" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Main Content */}
            <View style={{ paddingHorizontal: isDesktop ? 0 : 20, maxWidth: isDesktop ? 1200 : '100%', marginHorizontal: isDesktop ? 'auto' : 0, width: '100%' }}>
              {isDesktop ? (
                /* Desktop Layout */
                <View style={styles.desktopContainer}>
                  {/* Left Column - Timer */}
                  <Animated.View
                    style={[
                      styles.desktopLeft,
                      {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    {/* Motivational Card */}
                    <LinearGradient
                      colors={[colors.light, colors.gradient[0]]}
                      style={styles.motivationalCard}
                    >
                      <View style={styles.motivationalContent}>
                        <Animated.Text
                          style={[
                            styles.motivationalEmoji,
                            {
                              transform: [{ scale: pulseAnim }],
                            },
                          ]}
                        >
                          {motivational.emoji}
                        </Animated.Text>
                        <View style={styles.motivationalTextContainer}>
                          <Text style={[styles.motivationalText, { color: colors.primary }]}>
                            {motivational.text}
                          </Text>
                          <Text style={styles.motivationalSubtitle}>
                            {motivational.subtitle}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    {/* Mode Selector */}
                    <View style={{ marginBottom: 24 }}>
                      <ModeSelector
                        currentMode={currentMode}
                        status={status}
                        onModeChange={switchMode}
                      />
                    </View>

                    {/* Timer Circle */}
                    <Animated.View
                      style={[
                        styles.timerContainer,
                        {
                          transform: [{ scale: pulseAnim }],
                        },
                      ]}
                    >
                      <TimerCircle
                        timeRemaining={timeRemaining}
                        totalTime={getTotalTime()}
                        mode={currentMode}
                        status={status}
                      />
                    </Animated.View>

                    {/* Controls */}
                    <View style={{ marginTop: 32, marginBottom: 24 }}>
                      <TimerControls
                        status={status}
                        mode={currentMode}
                        onStart={startTimer}
                        onPause={pauseTimer}
                        onReset={handleReset}
                        onSkip={handleSkip}
                      />
                    </View>

                    {/* Session Counter */}
                    {completedSessions > 0 && (
                      <View style={{ marginTop: 16 }}>
                        <SessionCounter
                          completedSessions={completedSessions}
                          sessionsUntilLongBreak={preferences.sessionsUntilLongBreak}
                        />
                      </View>
                    )}
                  </Animated.View>

                  {/* Right Column - Stats & Tips */}
                  <View style={styles.desktopRight}>
                    {/* Quick Stats */}
                    <Animated.View
                      style={[
                        styles.statsContainer,
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={['#ffffff', '#fafafa']}
                        style={styles.statsCard}
                      >
                        <View style={styles.statsHeader}>
                          <Ionicons name="stats-chart" size={24} color={colors.primary} />
                          <Text style={styles.statsTitle}>Estatísticas</Text>
                        </View>

                        <View style={styles.statsGrid}>
                          <View style={styles.statRow}>
                            <View style={[styles.statIconBg, { backgroundColor: colors.primary + '15' }]}>
                              <Ionicons name="trending-up" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.statContent}>
                              <Text style={styles.statNumber}>12h 30m</Text>
                              <Text style={styles.statText}>Esta semana</Text>
                            </View>
                          </View>

                          <View style={styles.divider} />

                          <View style={styles.statRow}>
                            <View style={[styles.statIconBg, { backgroundColor: '#10b98115' }]}>
                              <Ionicons name="calendar-outline" size={20} color="#10b981" />
                            </View>
                            <View style={styles.statContent}>
                              <Text style={styles.statNumber}>28 dias</Text>
                              <Text style={styles.statText}>Sequência atual</Text>
                            </View>
                          </View>

                          <View style={styles.divider} />

                          <View style={styles.statRow}>
                            <View style={[styles.statIconBg, { backgroundColor: '#f59e0b15' }]}>
                              <Ionicons name="happy-outline" size={20} color="#f59e0b" />
                            </View>
                            <View style={styles.statContent}>
                              <Text style={styles.statNumber}>89%</Text>
                              <Text style={styles.statText}>Taxa de conclusão</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </Animated.View>

                    {/* Tip Card */}
                    <Animated.View
                      style={[
                        { marginTop: 24 },
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={['#fffbeb', '#fef3c7']}
                        style={styles.tipCard}
                      >
                        <View style={styles.tipHeader}>
                          <Text style={styles.tipEmoji}>💡</Text>
                          <Text style={styles.tipTitle}>Dica do dia</Text>
                        </View>
                        <Text style={styles.tipText}>
                          {currentMode === PomodoroMode.WORK
                            ? 'Elimine distrações: coloque seu celular no modo avião e use fones para focar melhor.'
                            : 'Use este tempo para se alongar, beber água ou fazer exercícios de respiração.'}
                        </Text>
                      </LinearGradient>
                    </Animated.View>

                    {/* Activity Timeline */}
                    <Animated.View
                      style={[
                        { marginTop: 24 },
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={['#ffffff', '#fafafa']}
                        style={styles.timelineCard}
                      >
                        <View style={styles.timelineHeader}>
                          <Ionicons name="time-outline" size={22} color={colors.primary} />
                          <Text style={styles.timelineTitle}>Atividade Hoje</Text>
                        </View>

                        <View style={styles.timelineList}>
                          <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#f43f5e' }]} />
                            <Text style={styles.timelineText}>3 sessões de trabalho completas</Text>
                            <Text style={styles.timelineTime}>75 min</Text>
                          </View>
                          <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]} />
                            <Text style={styles.timelineText}>2 pausas curtas realizadas</Text>
                            <Text style={styles.timelineTime}>10 min</Text>
                          </View>
                          <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#0ea5e9' }]} />
                            <Text style={styles.timelineText}>1 pausa longa realizada</Text>
                            <Text style={styles.timelineTime}>15 min</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </Animated.View>
                  </View>
                </View>
              ) : (
                /* Mobile Layout */
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  }}
                >
                  {/* Motivational Card */}
                  <LinearGradient
                    colors={[colors.light, colors.gradient[0]]}
                    style={[styles.motivationalCard, { marginTop: 20 }]}
                  >
                    <View style={styles.motivationalContent}>
                      <Animated.Text
                        style={[
                          styles.motivationalEmoji,
                          {
                            transform: [{ scale: pulseAnim }],
                          },
                        ]}
                      >
                        {motivational.emoji}
                      </Animated.Text>
                      <View style={styles.motivationalTextContainer}>
                        <Text style={[styles.motivationalText, { color: colors.primary }]}>
                          {motivational.text}
                        </Text>
                        <Text style={styles.motivationalSubtitle}>
                          {motivational.subtitle}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Mode Selector */}
                  <View style={{ marginTop: 20 }}>
                    <ModeSelector
                      currentMode={currentMode}
                      status={status}
                      onModeChange={switchMode}
                    />
                  </View>

                  {/* Timer Circle */}
                  <Animated.View
                    style={[
                      styles.timerContainer,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <TimerCircle
                      timeRemaining={timeRemaining}
                      totalTime={getTotalTime()}
                      mode={currentMode}
                      status={status}
                    />
                  </Animated.View>

                  {/* Controls */}
                  <View style={{ marginTop: 32, marginBottom: 24 }}>
                    <TimerControls
                      status={status}
                      mode={currentMode}
                      onStart={startTimer}
                      onPause={pauseTimer}
                      onReset={handleReset}
                      onSkip={handleSkip}
                    />
                  </View>

                  {/* Session Counter */}
                  {completedSessions > 0 && (
                    <View style={{ marginTop: 16, marginBottom: 24 }}>
                      <SessionCounter
                        completedSessions={completedSessions}
                        sessionsUntilLongBreak={preferences.sessionsUntilLongBreak}
                      />
                    </View>
                  )}

                  {/* Quick Stats */}
                  <View style={styles.mobileStatsGrid}>
                    <StatCard
                      icon="trending-up"
                      value="12h"
                      label="Esta semana"
                      color="#f43f5e"
                      delay={100}
                    />
                    <StatCard
                      icon="calendar-outline"
                      value="28"
                      label="Dias ativos"
                      color="#10b981"
                      delay={200}
                    />
                    <StatCard
                      icon="happy-outline"
                      value="89%"
                      label="Conclusão"
                      color="#f59e0b"
                      delay={300}
                    />
                  </View>

                  {/* Tip Card */}
                  <LinearGradient
                    colors={['#fffbeb', '#fef3c7']}
                    style={[styles.tipCard, { marginTop: 24 }]}
                  >
                    <View style={styles.tipHeader}>
                      <Text style={styles.tipEmoji}>💡</Text>
                      <Text style={styles.tipTitle}>Dica do dia</Text>
                    </View>
                    <Text style={styles.tipText}>
                      {currentMode === PomodoroMode.WORK
                        ? 'Elimine distrações: coloque seu celular no modo avião e use fones para focar melhor.'
                        : 'Use este tempo para se alongar, beber água ou fazer exercícios de respiração.'}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerGreeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopContainer: {
    flexDirection: 'row',
    gap: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  desktopLeft: {
    flex: 1,
  },
  desktopRight: {
    width: 400,
  },
  motivationalCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  motivationalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivationalEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  motivationalTextContainer: {
    flex: 1,
  },
  motivationalText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  motivationalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  timerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  statsContainer: {
    marginTop: 0,
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  statsGrid: {
    gap: 0,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  tipCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#fde68a',
    ...Platform.select({
      ios: {
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: -0.2,
  },
  tipText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 22,
    fontWeight: '500',
  },
  timelineCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  timelineList: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  timelineText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  mobileStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  statGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 20,
  },
});

export default HomeScreen;
