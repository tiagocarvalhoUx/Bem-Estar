import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
  Animated,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  dueDate?: Date;
  estimatedPomodoros?: number;
  aiSuggested?: boolean;
  category?: string;
}

const PlannerScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Revisar apresentação do projeto',
      description: 'Preparar slides e ensaiar apresentação',
      priority: 'high',
      completed: false,
      estimatedPomodoros: 4,
      aiSuggested: true,
      category: 'Trabalho',
    },
    {
      id: '2',
      title: 'Estudar React Native avançado',
      description: 'Capítulos 5-7 do curso',
      priority: 'medium',
      completed: false,
      estimatedPomodoros: 3,
      category: 'Estudo',
    },
    {
      id: '3',
      title: 'Exercício físico',
      description: '30 minutos de caminhada',
      priority: 'medium',
      completed: true,
      estimatedPomodoros: 1,
      category: 'Saúde',
    },
    {
      id: '4',
      title: 'Ligar para dentista',
      description: 'Agendar consulta de rotina',
      priority: 'low',
      completed: false,
      estimatedPomodoros: 1,
      category: 'Pessoal',
    },
  ]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'work' | 'study' | 'personal'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([
    { id: 's1', text: 'Fazer pausas a cada 25 minutos', icon: '⏰' },
    { id: 's2', text: 'Priorizar tarefas da manhã', icon: '🌅' },
    { id: 's3', text: 'Dividir tarefas grandes em menores', icon: '📝' },
  ]);

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

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return { color: '#dc2626', bg: '#fef2f2', border: '#fee2e2' };
      case 'high':
        return { color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' };
      case 'medium':
        return { color: '#3b82f6', bg: '#eff6ff', border: '#dbeafe' };
      case 'low':
        return { color: '#10b981', bg: '#f0fdf4', border: '#dcfce7' };
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => setTasks(tasks.filter(task => task.id !== taskId)),
          style: 'destructive' 
        },
      ]
    );
  };

  const TaskCard = ({ task, index }) => {
    const [cardAnim] = useState(new Animated.Value(0));
    const [swipeAnim] = useState(new Animated.Value(0));
    const colors = getPriorityColor(task.priority);

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
            { translateX: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
            { scale: cardAnim },
          ],
          opacity: cardAnim,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onLongPress={() => deleteTask(task.id)}
        >
          <LinearGradient
            colors={task.completed ? ['#f8fafc', '#f1f5f9'] : ['#ffffff', '#fafafa']}
            style={[
              styles.taskCard,
              {
                borderLeftWidth: 4,
                borderLeftColor: colors.color,
                opacity: task.completed ? 0.6 : 1,
              },
            ]}
          >
            {/* Left: Checkbox */}
            <TouchableOpacity
              onPress={() => toggleTask(task.id)}
              style={styles.checkbox}
              activeOpacity={0.7}
            >
              {task.completed ? (
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.checkboxChecked}
                >
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                </LinearGradient>
              ) : (
                <View style={[styles.checkboxUnchecked, { borderColor: colors.color }]} />
              )}
            </TouchableOpacity>

            {/* Middle: Content */}
            <View style={styles.taskContent}>
              <View style={styles.taskHeader}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                {task.aiSuggested && (
                  <View style={styles.aiSuggestionBadge}>
                    <Text style={styles.aiSuggestionText}>AI ✨</Text>
                  </View>
                )}
              </View>

              {task.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              )}

              <View style={styles.taskFooter}>
                {task.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.categoryText, { color: colors.color }]}>
                      {task.category}
                    </Text>
                  </View>
                )}
                {task.estimatedPomodoros && (
                  <View style={styles.pomodorosBadge}>
                    <Ionicons name="timer-outline" size={14} color="#64748b" />
                    <Text style={styles.pomodorosText}>
                      {task.estimatedPomodoros} pomodoros
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Right: Priority */}
            <View style={styles.taskRight}>
              <View style={[styles.priorityBadge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.priorityText, { color: colors.color }]}>
                  {getPriorityLabel(task.priority)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalPomodoros = tasks.reduce((sum, t) => sum + (t.estimatedPomodoros || 0), 0);
  const completedPomodoros = completedTasks.reduce((sum, t) => sum + (t.estimatedPomodoros || 0), 0);

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
                    <Ionicons name="calendar" size={28} color="#ffffff" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.headerTitle}>Planejador</Text>
                    <Text style={styles.headerSubtitle}>Organize suas tarefas com AI</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    style={styles.addButton}
                  >
                    <Ionicons name="add" size={24} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View style={{ paddingHorizontal: isDesktop ? 0 : 20, maxWidth: isDesktop ? 1200 : '100%', marginHorizontal: isDesktop ? 'auto' : 0, width: '100%' }}>
              {/* AI Insights Card */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <LinearGradient
                  colors={['#fffbeb', '#fef3c7']}
                  style={styles.aiInsightsCard}
                >
                  <View style={styles.aiHeader}>
                    <Text style={styles.aiEmoji}>🤖</Text>
                    <Text style={styles.aiTitle}>Insights da AI</Text>
                  </View>
                  <Text style={styles.aiMainText}>
                    Você está 23% mais produtivo pela manhã. Considere agendar suas tarefas prioritárias entre 9h e 12h.
                  </Text>
                  <View style={styles.aiSuggestionsList}>
                    {aiSuggestions.map((suggestion, index) => (
                      <View key={suggestion.id} style={styles.aiSuggestionItem}>
                        <Text style={styles.aiSuggestionIcon}>{suggestion.icon}</Text>
                        <Text style={styles.aiSuggestionText}>{suggestion.text}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.aiActionButton} activeOpacity={0.7}>
                    <Text style={styles.aiActionText}>Otimizar meu dia com AI</Text>
                    <Ionicons name="sparkles" size={16} color="#92400e" />
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>

              {/* Progress Stats */}
              <Animated.View
                style={[
                  styles.progressContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Progresso de Hoje</Text>
                    <Text style={styles.progressPercentage}>
                      {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.progressStats}>
                    <View style={styles.progressStat}>
                      <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                      <Text style={styles.progressStatText}>
                        {completedTasks.length}/{tasks.length} tarefas
                      </Text>
                    </View>
                    <View style={styles.progressStat}>
                      <Ionicons name="timer-outline" size={18} color="#3b82f6" />
                      <Text style={styles.progressStatText}>
                        {completedPomodoros}/{totalPomodoros} pomodoros
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Tasks Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                {/* Pending Tasks */}
                {incompleteTasks.length > 0 && (
                  <View style={{ marginBottom: 24 }}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="list-outline" size={22} color="#0f172a" />
                      <Text style={styles.sectionTitle}>
                        Pendentes ({incompleteTasks.length})
                      </Text>
                    </View>
                    {incompleteTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </View>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <View>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="checkmark-done-outline" size={22} color="#10b981" />
                      <Text style={[styles.sectionTitle, { color: '#10b981' }]}>
                        Concluídas ({completedTasks.length})
                      </Text>
                    </View>
                    {completedTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </View>
                )}

                {/* Empty State */}
                {tasks.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📝</Text>
                    <Text style={styles.emptyTitle}>Nenhuma tarefa ainda</Text>
                    <Text style={styles.emptyText}>
                      Adicione sua primeira tarefa para começar a organizar seu dia!
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAddModal(true)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#f59e0b', '#d97706']}
                        style={styles.emptyButton}
                      >
                        <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
                        <Text style={styles.emptyButtonText}>Adicionar Tarefa</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>

              {/* Quick Actions */}
              <Animated.View
                style={[
                  styles.quickActionsContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
                    <LinearGradient
                      colors={['#3b82f6', '#1e40af']}
                      style={styles.quickActionGradient}
                    >
                      <Ionicons name="sparkles-outline" size={24} color="#ffffff" />
                      <Text style={styles.quickActionText}>Sugerir tarefas</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.quickActionGradient}
                    >
                      <Ionicons name="analytics-outline" size={24} color="#ffffff" />
                      <Text style={styles.quickActionText}>Ver análise</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#64748b" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Título da tarefa..."
              placeholderTextColor="#94a3b8"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <TouchableOpacity
              onPress={() => {
                if (newTaskTitle.trim()) {
                  const newTask: Task = {
                    id: Date.now().toString(),
                    title: newTaskTitle,
                    priority: 'medium',
                    completed: false,
                    estimatedPomodoros: 2,
                  };
                  setTasks([...tasks, newTask]);
                  setNewTaskTitle('');
                  setShowAddModal(false);
                }
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  aiInsightsCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
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
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: -0.3,
  },
  aiMainText: {
    fontSize: 15,
    color: '#78350f',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  aiSuggestionsList: {
    gap: 12,
    marginBottom: 16,
  },
  aiSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 12,
    borderRadius: 12,
  },
  aiSuggestionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  aiSuggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  aiActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: -0.5,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressStatText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
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
  checkbox: {
    marginRight: 12,
  },
  checkboxChecked: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  aiSuggestionBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  aiSuggestionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
  },
  taskDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pomodorosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pomodorosText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  taskRight: {
    marginLeft: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  quickActionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
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
  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default PlannerScreen;
