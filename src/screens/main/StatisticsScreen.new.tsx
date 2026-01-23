import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from '../../components/BarChart';
import { RadarChart } from '../../components/RadarChart';
import { HeatmapCalendar } from '../../components/HeatmapCalendar';
import { AnimatedProgress } from '../../components/AnimatedProgress';

type TimePeriod = 'week' | 'month' | 'year';

const StatisticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // Mock data
  const stats = {
    week: {
      totalTime: 750,
      sessions: 24,
      completion: 89,
      streak: 7,
      weekData: [
        { label: 'Dom', value: 45, sublabel: '2s', color: '#f43f5e' },
        { label: 'Seg', value: 120, sublabel: '4s', color: '#f43f5e' },
        { label: 'Ter', value: 135, sublabel: '5s', color: '#f43f5e' },
        { label: 'Qua', value: 105, sublabel: '4s', color: '#f43f5e' },
        { label: 'Qui', value: 150, sublabel: '6s', color: '#f43f5e' },
        { label: 'Sex', value: 120, sublabel: '5s', color: '#f43f5e' },
        { label: 'Sáb', value: 75, sublabel: '3s', color: '#f43f5e' },
      ],
    },
    month: {
      totalTime: 3200,
      sessions: 102,
      completion: 87,
      streak: 28,
    },
    year: {
      totalTime: 38400,
      sessions: 1224,
      completion: 85,
      streak: 156,
    },
  };

  const radarData = [
    { label: 'Foco', value: 85 },
    { label: 'Energia', value: 78 },
    { label: 'Humor', value: 82 },
    { label: 'Produtiv.', value: 89 },
    { label: 'Consistência', value: 92 },
    { label: 'Qualidade', value: 88 },
  ];

  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    for (let i = 0; i < 84; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const value = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
      data.push({ date, value });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();
  const currentStats = stats[selectedPeriod];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const PeriodButton: React.FC<{ period: TimePeriod; label: string }> = ({ period, label }) => (
    <TouchableOpacity
      onPress={() => setSelectedPeriod(period)}
      className={`flex-1 py-3 px-4 rounded-xl ${
        selectedPeriod === period ? 'bg-rose-500' : 'bg-slate-100'
      }`}
    >
      <Text
        className={`text-center font-semibold ${
          selectedPeriod === period ? 'text-white' : 'text-slate-600'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatCard: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    subtitle: string;
    color: string;
    bgColor: string;
  }> = ({ icon, title, value, subtitle, color, bgColor }) => (
    <View
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      style={{ flex: isDesktop ? undefined : 1, minWidth: isDesktop ? 280 : undefined }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-slate-700">{title}</Text>
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>
      <Text className="text-3xl font-bold text-slate-900 mb-1">{value}</Text>
      <Text className="text-sm text-slate-500">{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#fdf2f8', '#ffffff']}
          className="border-b border-slate-200 px-6 py-4 lg:py-6"
        >
          <View
            style={{
              maxWidth: isDesktop ? 1200 : undefined,
              marginHorizontal: isDesktop ? 'auto' : undefined,
              width: isDesktop ? '100%' : undefined,
            }}
          >
            <View className="flex-row items-center">
              <LinearGradient
                colors={['#ec4899', '#f43f5e']}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl items-center justify-center mr-3"
              >
                <Ionicons name="stats-chart" size={isDesktop ? 28 : 24} color="white" />
              </LinearGradient>
              <View>
                <Text className="text-sm lg:text-base text-slate-500">Seu Progresso</Text>
                <Text className="text-xl lg:text-2xl font-bold text-slate-800">Estatísticas</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View
          style={{
            maxWidth: isDesktop ? 1200 : undefined,
            marginHorizontal: isDesktop ? 'auto' : undefined,
            width: isDesktop ? '100%' : undefined,
            paddingHorizontal: isDesktop ? 24 : 0,
          }}
        >
          {/* Period Selector */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row gap-3">
              <PeriodButton period="week" label="Semana" />
              <PeriodButton period="month" label="Mês" />
              <PeriodButton period="year" label="Ano" />
            </View>
          </View>

          {/* Stats Cards */}
          <View className="px-6 py-4">
            <View className={isDesktop ? 'flex-row gap-4' : 'flex-col gap-4'}>
              <StatCard
                icon="time-outline"
                title="Tempo Total"
                value={formatTime(currentStats.totalTime)}
                subtitle={`Em ${selectedPeriod === 'week' ? 'esta semana' : selectedPeriod === 'month' ? 'este mês' : 'este ano'}`}
                color="#f43f5e"
                bgColor="#ffe4e6"
              />
              <StatCard
                icon="checkmark-circle-outline"
                title="Sessões"
                value={currentStats.sessions.toString()}
                subtitle="Sessões completas"
                color="#10b981"
                bgColor="#d1fae5"
              />
              <StatCard
                icon="trending-up-outline"
                title="Conclusão"
                value={`${currentStats.completion}%`}
                subtitle="Taxa de sucesso"
                color="#f59e0b"
                bgColor="#fef3c7"
              />
              <StatCard
                icon="flame-outline"
                title="Sequência"
                value={`${currentStats.streak} dias`}
                subtitle="Dias consecutivos"
                color="#8b5cf6"
                bgColor="#ede9fe"
              />
            </View>
          </View>

          {/* Week View */}
          {selectedPeriod === 'week' && (
            <View className="px-6 py-4">
              {/* Bar Chart */}
              <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-lg font-bold text-slate-800">Atividade Semanal</Text>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-rose-500 mr-2" />
                    <Text className="text-sm text-slate-600">Minutos</Text>
                  </View>
                </View>
                <BarChart
                  data={stats.week.weekData}
                  height={220}
                  barColor="#f43f5e"
                  showValues={true}
                  animated={true}
                />
              </View>

              {/* Radar Chart */}
              <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-2">Análise Multidimensional</Text>
                <Text className="text-sm text-slate-600 mb-6">
                  Avaliação de diferentes aspectos da produtividade
                </Text>
                <View className="items-center py-4">
                  <RadarChart
                    data={radarData}
                    size={isDesktop ? 300 : 280}
                    levels={5}
                    fillColor="#f43f5e"
                    strokeColor="#f43f5e"
                    fillOpacity={0.25}
                  />
                </View>
              </View>

              {/* Heatmap */}
              <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-2">Calendário de Atividade</Text>
                <Text className="text-sm text-slate-600 mb-6">Últimas 12 semanas de consistência</Text>
                <HeatmapCalendar
                  data={heatmapData}
                  weeks={12}
                  colors={['#f1f5f9', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e']}
                />
              </View>
            </View>
          )}

          {/* Month View */}
          {selectedPeriod === 'month' && (
            <View className="px-6 py-4">
              <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-6">Progresso do Mês</Text>

                <View className="space-y-6">
                  <View>
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-sm font-semibold text-slate-700">Tempo Focado</Text>
                      <Text className="text-sm font-bold text-rose-600">
                        {formatTime(currentStats.totalTime)}
                      </Text>
                    </View>
                    <AnimatedProgress progress={75} height={12} color="#f43f5e" />
                  </View>

                  <View>
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-sm font-semibold text-slate-700">Sessões Completas</Text>
                      <Text className="text-sm font-bold text-emerald-600">
                        {currentStats.sessions}/120
                      </Text>
                    </View>
                    <AnimatedProgress progress={85} height={12} color="#10b981" />
                  </View>

                  <View>
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-sm font-semibold text-slate-700">Taxa de Conclusão</Text>
                      <Text className="text-sm font-bold text-amber-600">{currentStats.completion}%</Text>
                    </View>
                    <AnimatedProgress progress={currentStats.completion} height={12} color="#f59e0b" />
                  </View>

                  <View>
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-sm font-semibold text-slate-700">Sequência</Text>
                      <Text className="text-sm font-bold text-purple-600">{currentStats.streak} dias</Text>
                    </View>
                    <AnimatedProgress progress={93} height={12} color="#8b5cf6" />
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-4">Calendário Mensal</Text>
                <HeatmapCalendar
                  data={heatmapData}
                  weeks={12}
                  colors={['#f1f5f9', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e']}
                />
              </View>
            </View>
          )}

          {/* Year View */}
          {selectedPeriod === 'year' && (
            <View className="px-6 py-4">
              <LinearGradient
                colors={['#fdf4ff', '#fce7f3']}
                className="rounded-2xl p-8 border-2 border-purple-200 mb-6"
              >
                <View className="items-center">
                  <Text className="text-6xl font-bold text-purple-600 mb-2">
                    {Math.floor(currentStats.totalTime / 60)}h
                  </Text>
                  <Text className="text-lg font-semibold text-slate-700 mb-6">
                    de foco intenso em {new Date().getFullYear()}
                  </Text>

                  <View className="flex-row justify-around w-full">
                    <View className="items-center">
                      <Text className="text-3xl font-bold text-purple-600">{currentStats.sessions}</Text>
                      <Text className="text-sm text-slate-600 mt-1">Sessões</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-3xl font-bold text-pink-600">{currentStats.completion}%</Text>
                      <Text className="text-sm text-slate-600 mt-1">Conclusão</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-3xl font-bold text-rose-600">{currentStats.streak}</Text>
                      <Text className="text-sm text-slate-600 mt-1">Melhor Sequência</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-2">Atividade Anual</Text>
                <Text className="text-sm text-slate-600 mb-6">
                  Sua jornada de produtividade em {new Date().getFullYear()}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ width: isDesktop ? 1100 : 800 }}>
                    <HeatmapCalendar
                      data={heatmapData}
                      weeks={52}
                      colors={['#f1f5f9', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e']}
                    />
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Insights */}
          <View className="px-6 py-4 mb-6">
            <LinearGradient
              colors={['#fffbeb', '#fef3c7']}
              className="rounded-2xl p-6 border-2 border-amber-200"
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text className="text-lg font-bold text-amber-900 ml-2">Insights IA</Text>
              </View>

              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3 mt-1">
                    <Ionicons name="checkmark" size={16} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-800 mb-1">
                      Excelente progresso! 🎉
                    </Text>
                    <Text className="text-sm text-slate-600 leading-5">
                      Você completou {currentStats.completion}% das suas sessões. Continue assim!
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-amber-200" />

                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3 mt-1">
                    <Ionicons name="time-outline" size={16} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-800 mb-1">
                      Melhor horário
                    </Text>
                    <Text className="text-sm text-slate-600 leading-5">
                      Seus picos de produtividade são entre 9h-11h e 14h-16h.
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-amber-200" />

                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3 mt-1">
                    <Ionicons name="trophy" size={16} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-800 mb-1">
                      Conquista desbloqueada
                    </Text>
                    <Text className="text-sm text-slate-600 leading-5">
                      {currentStats.streak} dias consecutivos! Você está construindo um ótimo hábito.
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticsScreen;
