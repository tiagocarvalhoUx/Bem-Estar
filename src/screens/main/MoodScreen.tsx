import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Mood {
  emoji: string;
  label: string;
  value: number;
  color: string;
  gradient: string[];
}

interface MoodEntry {
  id: string;
  date: Date;
  mood: Mood;
  note?: string;
  energy: number;
  stress: number;
}

const MoodScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [showNoteInput, setShowNoteInput] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const moods: Mood[] = [
    {
      emoji: '😄',
      label: 'Ótimo',
      value: 5,
      color: '#10b981',
      gradient: ['#a7f3d0', '#34d399'],
    },
    {
      emoji: '😊',
      label: 'Bem',
      value: 4,
      color: '#3b82f6',
      gradient: ['#bfdbfe', '#60a5fa'],
    },
    {
      emoji: '😐',
      label: 'Neutro',
      value: 3,
      color: '#f59e0b',
      gradient: ['#fde68a', '#fbbf24'],
    },
    {
      emoji: '😔',
      label: 'Triste',
      value: 2,
      color: '#f43f5e',
      gradient: ['#fecdd3', '#fb7185'],
    },
    {
      emoji: '😫',
      label: 'Péssimo',
      value: 1,
      color: '#dc2626',
      gradient: ['#fecaca', '#f87171'],
    },
  ];

  const recentEntries: MoodEntry[] = [
    {
      id: '1',
      date: new Date(),
      mood: moods[1],
      note: 'Dia produtivo de trabalho!',
      energy: 4,
      stress: 2,
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000),
      mood: moods[0],
      note: 'Consegui completar todos os objetivos',
      energy: 5,
      stress: 1,
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000),
      mood: moods[2],
      note: 'Dia normal, nada especial',
      energy: 3,
      stress: 3,
    },
  ];

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

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setShowNoteInput(true);
  };

  const handleSave = () => {
    // Aqui salvaria no backend
    console.log('Salvando humor:', { selectedMood, note, energy, stress });
    setSelectedMood(null);
    setNote('');
    setEnergy(3);
    setStress(2);
    setShowNoteInput(false);
  };

  const MoodButton = ({ mood, index }: { mood: Mood; index: number }) => {
    const [scaleAnim] = useState(new Animated.Value(0));
    const [bounceAnim] = useState(new Animated.Value(1));

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, []);

    const handlePress = () => {
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 0.85,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
      handleMoodSelect(mood);
    };

    const isSelected = selectedMood?.value === mood.value;

    return (
      <Animated.View
        style={{
          flex: 1,
          minWidth: isDesktop ? 140 : 0,
          transform: [
            { scale: Animated.multiply(scaleAnim, bounceAnim) },
          ],
          opacity: scaleAnim,
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={{ width: '100%' }}
        >
          <LinearGradient
            colors={isSelected ? mood.gradient : ['#ffffff', '#fafafa']}
            style={[
              styles.moodButton,
              isSelected && styles.moodButtonSelected,
              {
                borderColor: isSelected ? mood.color : '#e2e8f0',
              },
            ]}
          >
            <Text style={[styles.moodEmoji, isSelected && { transform: [{ scale: 1.2 }] }]}>
              {mood.emoji}
            </Text>
            <Text style={[styles.moodLabel, isSelected && { color: mood.color, fontWeight: '800' }]}>
              {mood.label}
            </Text>
            {isSelected && (
              <View style={[styles.selectedIndicator, { backgroundColor: mood.color }]}>
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const SliderInput = ({ label, value, onChange, icon, color }: { label: string; value: number; onChange: (val: number) => void; icon: any; color: string }) => {
    const [sliderAnim] = useState(new Animated.Value(value));

    useEffect(() => {
      Animated.spring(sliderAnim, {
        toValue: value,
        tension: 40,
        friction: 7,
        useNativeDriver: false,
      }).start();
    }, [value]);

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={styles.sliderLabel}>{label}</Text>
          <Text style={[styles.sliderValue, { color }]}>{value}/5</Text>
        </View>
        <View style={styles.sliderTrack}>
          <Animated.View
            style={[
              styles.sliderFill,
              {
                width: sliderAnim.interpolate({
                  inputRange: [0, 5],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <View style={styles.sliderButtons}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => onChange(level)}
              style={[
                styles.sliderButton,
                value === level && { backgroundColor: color + '20', borderColor: color },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sliderButtonText,
                  value === level && { color, fontWeight: '700' },
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const MoodEntryCard = ({ entry, index }: { entry: MoodEntry; index: number }) => {
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

    const formatDate = (date: Date) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
      } else {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      }
    };

    return (
      <Animated.View
        style={{
          transform: [
            { translateX: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
            { scale: cardAnim },
          ],
          opacity: cardAnim,
          marginBottom: 12,
        }}
      >
        <LinearGradient
          colors={entry.mood.gradient}
          style={styles.entryCard}
        >
          <View style={styles.entryHeader}>
            <Text style={styles.entryEmoji}>{entry.mood.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryMoodLabel}>{entry.mood.label}</Text>
              <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
            </View>
            <View style={styles.entryStats}>
              <View style={styles.entryStat}>
                <Ionicons name="flash" size={14} color={entry.mood.color} />
                <Text style={[styles.entryStatText, { color: entry.mood.color }]}>
                  {entry.energy}
                </Text>
              </View>
              <View style={styles.entryStat}>
                <Ionicons name="alert-circle" size={14} color={entry.mood.color} />
                <Text style={[styles.entryStatText, { color: entry.mood.color }]}>
                  {entry.stress}
                </Text>
              </View>
            </View>
          </View>
          {entry.note && (
            <Text style={styles.entryNote} numberOfLines={2}>
              "{entry.note}"
            </Text>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const moodDistribution = {
    great: 35,
    good: 40,
    neutral: 15,
    sad: 7,
    bad: 3,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <LinearGradient colors={['#fef3c7', '#ffffff']} style={{ flex: 1 }}>
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
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    style={styles.headerIcon}
                  >
                    <Ionicons name="happy" size={28} color="#ffffff" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.headerTitle}>Registro de Humor</Text>
                    <Text style={styles.headerSubtitle}>Como você está se sentindo?</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <View style={{ paddingHorizontal: isDesktop ? 0 : 20, maxWidth: isDesktop ? 1200 : '100%', marginHorizontal: isDesktop ? 'auto' : 0, width: '100%' }}>
              {/* Mood Selector */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <LinearGradient
                  colors={['#ffffff', '#fafafa']}
                  style={styles.moodSelectorCard}
                >
                  <Text style={styles.sectionTitle}>Como está seu humor agora?</Text>
                  <View style={styles.moodGrid}>
                    {moods.map((mood, index) => (
                      <MoodButton key={mood.value} mood={mood} index={index} />
                    ))}
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Additional Info (shown when mood selected) */}
              {showNoteInput && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <LinearGradient
                    colors={['#ffffff', '#fafafa']}
                    style={[styles.additionalInfoCard, { marginTop: 20 }]}
                  >
                    <Text style={styles.sectionTitle}>Conte-nos mais</Text>

                    {/* Energy Level */}
                    <SliderInput
                      label="Nível de Energia"
                      value={energy}
                      onChange={setEnergy}
                      icon="flash"
                      color="#f59e0b"
                    />

                    {/* Stress Level */}
                    <SliderInput
                      label="Nível de Estresse"
                      value={stress}
                      onChange={setStress}
                      icon="alert-circle"
                      color="#f43f5e"
                    />

                    {/* Note Input */}
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteLabel}>Adicionar nota (opcional)</Text>
                      <TextInput
                        style={styles.noteInput}
                        placeholder="O que aconteceu hoje?"
                        placeholderTextColor="#94a3b8"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
                      <LinearGradient
                        colors={selectedMood ? (selectedMood.gradient as any) : ['#3b82f6', '#1e40af']}
                        style={styles.saveButton}
                      >
                        <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                        <Text style={styles.saveButtonText}>Salvar Registro</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </Animated.View>
              )}

              {/* Mood Overview Stats */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                }}
              >
                <LinearGradient
                  colors={['#fffbeb', '#fef3c7']}
                  style={styles.overviewCard}
                >
                  <View style={styles.overviewHeader}>
                    <Ionicons name="analytics" size={24} color="#f59e0b" />
                    <Text style={styles.overviewTitle}>Visão Geral - Esta Semana</Text>
                  </View>
                  <View style={styles.overviewStats}>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatEmoji}>😄</Text>
                      <Text style={styles.overviewStatValue}>{moodDistribution.great}%</Text>
                      <Text style={styles.overviewStatLabel}>Ótimo</Text>
                    </View>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatEmoji}>😊</Text>
                      <Text style={styles.overviewStatValue}>{moodDistribution.good}%</Text>
                      <Text style={styles.overviewStatLabel}>Bem</Text>
                    </View>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatEmoji}>😐</Text>
                      <Text style={styles.overviewStatValue}>{moodDistribution.neutral}%</Text>
                      <Text style={styles.overviewStatLabel}>Neutro</Text>
                    </View>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatEmoji}>😔</Text>
                      <Text style={styles.overviewStatValue}>{moodDistribution.sad}%</Text>
                      <Text style={styles.overviewStatLabel}>Triste</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Recent Entries */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                }}
              >
                <View style={styles.recentHeader}>
                  <Ionicons name="time-outline" size={22} color="#0f172a" />
                  <Text style={styles.recentTitle}>Registros Recentes</Text>
                </View>
                {recentEntries.map((entry, index) => (
                  <MoodEntryCard key={entry.id} entry={entry} index={index} />
                ))}
              </Animated.View>

              {/* Insights */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 24,
                }}
              >
                <LinearGradient
                  colors={['#dbeafe', '#bfdbfe']}
                  style={styles.insightsCard}
                >
                  <View style={styles.insightsHeader}>
                    <Text style={styles.insightsEmoji}>💡</Text>
                    <Text style={styles.insightsTitle}>Insights</Text>
                  </View>
                  <Text style={styles.insightsText}>
                    Seu humor está 15% melhor comparado à semana passada! Continue mantendo seus hábitos saudáveis.
                  </Text>
                  <View style={styles.insightsList}>
                    <View style={styles.insightItem}>
                      <Ionicons name="trending-up" size={18} color="#1e40af" />
                      <Text style={styles.insightItemText}>
                        Você se sente melhor após exercícios físicos
                      </Text>
                    </View>
                    <View style={styles.insightItem}>
                      <Ionicons name="sunny" size={18} color="#1e40af" />
                      <Text style={styles.insightItemText}>
                        Suas manhãs são mais produtivas
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  moodSelectorCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
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
  moodButtonSelected: {
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalInfoCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
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
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sliderLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  sliderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  noteContainer: {
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 100,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  overviewCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
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
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: -0.3,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  overviewStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: '#78350f',
    fontWeight: '600',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  entryCard: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  entryMoodLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.8)',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
  },
  entryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  entryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryStatText: {
    fontSize: 13,
    fontWeight: '700',
  },
  entryNote: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  insightsCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#93c5fd',
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: -0.3,
  },
  insightsText: {
    fontSize: 15,
    color: '#1e3a8a',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  insightItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
});

export default MoodScreen;
