import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { useAuth } from "../../contexts/AuthContext";
import { usePomodoro } from "../../contexts/PomodoroContext";
import { PomodoroMode } from "../../types";

const StatisticsScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("week");
  const [selectedCategory, setSelectedCategory] = useState<
    "focus" | "mood" | "productivity"
  >("focus");

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { user } = useAuth();
  const { sessions, moodHistory } = usePomodoro();

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

  // Calcular dados reais baseados nas sessões do usuário
  const calculateWeeklyData = () => {
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);

    const weekData = daysOfWeek.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);

      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      // Filtrar sessões deste dia
      const daySessions =
        sessions?.filter((session) => {
          const sessionDate = new Date(session.completedAt);
          return sessionDate >= dayDate && sessionDate < nextDay;
        }) || [];

      // Calcular total de minutos
      const totalMinutes = daySessions.reduce(
        (total, session) => total + session.duration / 60,
        0,
      );
      const hours = totalMinutes / 60;

      return {
        day,
        value: parseFloat(hours.toFixed(1)),
        label: `${hours.toFixed(1)}h`,
      };
    });

    return weekData;
  };

  const calculateMoodData = () => {
    if (!moodHistory || moodHistory.length === 0) {
      return [
        { mood: "😊", value: 0, label: "Feliz", color: "#10b981" },
        { mood: "😐", value: 0, label: "Neutro", color: "#f59e0b" },
        { mood: "😔", value: 0, label: "Triste", color: "#f43f5e" },
        { mood: "😄", value: 0, label: "Ótimo", color: "#0ea5e9" },
      ];
    }

    const moodCounts = {
      VERY_GOOD: 0,
      GOOD: 0,
      NEUTRAL: 0,
      BAD: 0,
      VERY_BAD: 0,
    };

    moodHistory.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const total = moodHistory.length;

    return [
      {
        mood: "😄",
        value: Math.round((moodCounts.VERY_GOOD / total) * 100),
        label: "Ótimo",
        color: "#0ea5e9",
      },
      {
        mood: "😊",
        value: Math.round((moodCounts.GOOD / total) * 100),
        label: "Feliz",
        color: "#10b981",
      },
      {
        mood: "😐",
        value: Math.round((moodCounts.NEUTRAL / total) * 100),
        label: "Neutro",
        color: "#f59e0b",
      },
      {
        mood: "😔",
        value: Math.round(
          (moodCounts.BAD / total) * 100 + (moodCounts.VERY_BAD / total) * 100,
        ),
        label: "Triste",
        color: "#f43f5e",
      },
    ].filter((item) => item.value > 0); // Remover valores zerados
  };

  const calculateProductivityData = () => {
    if (!sessions || sessions.length === 0) {
      return [
        { label: "Foco", value: 0 },
        { label: "Energia", value: 0 },
        { label: "Motivação", value: 0 },
        { label: "Consistência", value: 0 },
        { label: "Descanso", value: 0 },
      ];
    }

    const workSessions = sessions.filter((s) => s.mode === PomodoroMode.WORK);
    const breakSessions = sessions.filter(
      (s) =>
        s.mode === PomodoroMode.SHORT_BREAK ||
        s.mode === PomodoroMode.LONG_BREAK,
    );

    // Calcular sequência (dias consecutivos)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(checkDate);
      nextDay.setDate(checkDate.getDate() + 1);

      const hasSessions = sessions.some((session) => {
        const sessionDate = new Date(session.completedAt);
        return sessionDate >= checkDate && sessionDate < nextDay;
      });

      if (hasSessions) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calcular média de energia dos humores
    const avgEnergy =
      moodHistory?.length > 0
        ? Math.round(
            (moodHistory.reduce((sum, m) => sum + (m.energy || 3), 0) /
              moodHistory.length) *
              20,
          )
        : 0;

    // Calcular motivação baseada em sessões recentes
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentSessions = sessions.filter(
      (s) => new Date(s.completedAt) >= last7Days,
    );
    const motivation = Math.min(100, (recentSessions.length / 14) * 100); // 2 sessões/dia = 100%

    // Consistência baseada na sequência
    const consistency = Math.min(100, (streak / 30) * 100); // 30 dias = 100%

    // Descanso baseado na proporção de breaks
    const breakRatio =
      sessions.length > 0 ? (breakSessions.length / sessions.length) * 100 : 0;
    const rest = Math.min(100, breakRatio * 3); // 33% breaks = 100%

    return [
      { label: "Foco", value: Math.min(100, workSessions.length * 5) },
      { label: "Energia", value: avgEnergy },
      { label: "Motivação", value: Math.round(motivation) },
      { label: "Consistência", value: Math.round(consistency) },
      { label: "Descanso", value: Math.round(rest) },
    ];
  };

  // Calcular dados reais
  const weeklyData = calculateWeeklyData();
  const moodData = calculateMoodData();
  const productivityData = calculateProductivityData();

  console.log("StatisticsScreen: Dados calculados", {
    totalSessions: sessions?.length || 0,
    totalMoods: moodHistory?.length || 0,
    weeklyData,
    moodData,
  });

  // Calcular estatísticas para os cards do topo
  const calculateTopStats = () => {
    // Tempo total focado (todas as sessões)
    const totalMinutes =
      sessions?.reduce((total, session) => total + session.duration / 60, 0) ||
      0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const totalTime = `${hours}h ${minutes}m`;

    // Dias ativos (dias únicos com sessões)
    const uniqueDays = new Set(
      sessions?.map((session) => {
        const date = new Date(session.completedAt);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      }),
    );
    const activeDays = uniqueDays.size;

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

    // Taxa de sucesso (assumindo que todas as sessões gravadas foram completadas)
    const successRate = sessions?.length > 0 ? 100 : 0;

    return {
      totalTime,
      activeDays,
      streak,
      successRate,
    };
  };

  const topStats = calculateTopStats();

  // Calcular conquistas dinâmicas baseadas em dados reais
  const calculateAchievements = () => {
    const achievements = [];

    // Conquista: Primeira sessão
    if (sessions && sessions.length >= 1) {
      achievements.push({
        icon: "🎉",
        name: "Primeira Sessão",
        desc: "Parabéns pelo início!",
        unlocked: true,
      });
    }

    // Conquista: Sequência
    if (topStats.streak >= 3) {
      achievements.push({
        icon: "🔥",
        name: `Sequência de ${topStats.streak} dias`,
        desc:
          topStats.streak >= 7 ? "Incrível consistência!" : "Mantenha o ritmo!",
        unlocked: true,
      });
    }

    // Conquista: Tempo total
    const totalHours =
      sessions?.reduce((total, s) => total + s.duration, 0) / 3600 || 0;
    if (totalHours >= 100) {
      achievements.push({
        icon: "⏰",
        name: "100 horas focadas",
        desc: "Incrível dedicação!",
        unlocked: true,
      });
    } else if (totalHours >= 50) {
      achievements.push({
        icon: "⏰",
        name: "50 horas focadas",
        desc: "Ótimo progresso!",
        unlocked: true,
      });
    } else if (totalHours >= 10) {
      achievements.push({
        icon: "⏰",
        name: "10 horas focadas",
        desc: "Continue assim!",
        unlocked: true,
      });
    }

    // Conquista: Sessões completadas
    const workSessions =
      sessions?.filter((s) => s.mode === PomodoroMode.WORK).length || 0;
    if (workSessions >= 100) {
      achievements.push({
        icon: "💯",
        name: "100 sessões completadas",
        desc: "Você é uma máquina!",
        unlocked: true,
      });
    } else if (workSessions >= 50) {
      achievements.push({
        icon: "💯",
        name: "50 sessões completadas",
        desc: "Produtividade em alta!",
        unlocked: true,
      });
    } else if (workSessions >= 10) {
      achievements.push({
        icon: "🎯",
        name: "10 sessões completadas",
        desc: "Bom começo!",
        unlocked: true,
      });
    }

    // Conquista: Humor registrado
    if (moodHistory && moodHistory.length >= 10) {
      achievements.push({
        icon: "💭",
        name: "Autoconhecimento",
        desc: `${moodHistory.length} humores registrados`,
        unlocked: true,
      });
    }

    // Se não tem nenhuma conquista, mostrar mensagem motivacional
    if (achievements.length === 0) {
      return [
        {
          icon: "🚀",
          name: "Comece sua jornada",
          desc: "Complete sua primeira sessão!",
          unlocked: false,
        },
      ];
    }

    // Limitar a 3 conquistas mais recentes
    return achievements.slice(0, 3);
  };

  const achievements = calculateAchievements();

  // Dados mockados - em produção viriam do backend
  const weeklyDataOLD = [
    { day: "Seg", value: 4.5, label: "4.5h" },
    { day: "Ter", value: 6.2, label: "6.2h" },
    { day: "Qua", value: 5.8, label: "5.8h" },
    { day: "Qui", value: 7.1, label: "7.1h" },
    { day: "Sex", value: 5.3, label: "5.3h" },
    { day: "Sáb", value: 3.2, label: "3.2h" },
    { day: "Dom", value: 2.5, label: "2.5h" },
  ];

  const moodDataOLD = [
    { mood: "😊", value: 45, label: "Feliz", color: "#10b981" },
    { mood: "😐", value: 30, label: "Neutro", color: "#f59e0b" },
    { mood: "😔", value: 15, label: "Triste", color: "#f43f5e" },
    { mood: "😄", value: 10, label: "Ótimo", color: "#0ea5e9" },
  ];

  const productivityDataOLD = [
    { label: "Foco", value: 85 },
    { label: "Energia", value: 72 },
    { label: "Motivação", value: 90 },
    { label: "Consistência", value: 78 },
    { label: "Descanso", value: 65 },
  ];

  // Heatmap data (últimos 90 dias) - DADOS REAIS
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Começar de 13 semanas atrás
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 13 * 7);

    for (let week = 0; week < 13; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const nextDay = new Date(currentDate);
        nextDay.setDate(currentDate.getDate() + 1);

        // Contar sessões deste dia
        const daySessions =
          sessions?.filter((session) => {
            const sessionDate = new Date(session.completedAt);
            return sessionDate >= currentDate && sessionDate < nextDay;
          }) || [];

        // Calcular nível de intensidade (0-4)
        let intensity = 0;
        if (daySessions.length >= 8) intensity = 4;
        else if (daySessions.length >= 6) intensity = 3;
        else if (daySessions.length >= 4) intensity = 2;
        else if (daySessions.length >= 1) intensity = 1;

        weekData.push(intensity);
      }
      data.push(weekData);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (value: number) => {
    const colors = ["#f1f5f9", "#bfdbfe", "#60a5fa", "#3b82f6", "#1e40af"];
    return colors[value] || colors[0];
  };

  // Componente de Gráfico de Barras Inline
  const BarChart = ({
    data,
    height = 200,
  }: {
    data: any[];
    height?: number;
  }) => {
    const [animations] = useState(data.map(() => new Animated.Value(0)));
    const maxValue = Math.max(...data.map((d) => d.value));
    const barWidth = (width - (isDesktop ? 120 : 80)) / data.length;
    const chartWidth = barWidth * data.length;

    useEffect(() => {
      const animationsConfig = animations.map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 100,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      );
      Animated.stagger(50, animationsConfig).start();
    }, []);

    return (
      <View style={{ height, justifyContent: "flex-end", paddingTop: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: height - 40,
          }}
        >
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            return (
              <View key={index} style={{ alignItems: "center", flex: 1 }}>
                <Animated.View
                  style={{
                    width: barWidth - 16,
                    height: barHeight,
                    transform: [
                      {
                        scaleY: animations[index],
                      },
                    ],
                    marginBottom: 8,
                  }}
                >
                  <LinearGradient
                    colors={["#3b82f6", "#1e40af"]}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      justifyContent: "flex-start",
                      paddingTop: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                    >
                      {item.label}
                    </Text>
                  </LinearGradient>
                </Animated.View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#64748b",
                    marginTop: 4,
                  }}
                >
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Componente de Gráfico de Pizza (Donut) Inline
  const DonutChart = ({ data, size = 200 }: { data: any[]; size?: number }) => {
    const [animations] = useState(data.map(() => new Animated.Value(0)));
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = size / 2 - 20;
    const strokeWidth = 30;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
      animations.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 150,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }).start();
      });
    }, []);

    let currentAngle = -90;

    return (
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        <Svg width={size} height={size}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = size / 2 + radius * Math.cos(startRad);
            const y1 = size / 2 + radius * Math.sin(startRad);
            const x2 = size / 2 + radius * Math.cos(endRad);
            const y2 = size / 2 + radius * Math.sin(endRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${size / 2} ${size / 2}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            return (
              <Path key={index} d={pathData} fill={item.color} opacity={0.9} />
            );
          })}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth}
            fill="#ffffff"
          />
        </Svg>

        <View
          style={{
            marginTop: 24,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {data.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 8,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 28, marginRight: 4 }}>{item.mood}</Text>
              <Text
                style={{ fontSize: 13, color: "#64748b", fontWeight: "600" }}
              >
                {item.value}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Componente de Radar Chart Inline
  const RadarChart = ({ data, size = 280 }: { data: any[]; size?: number }) => {
    const [scaleAnim] = useState(new Animated.Value(0));
    const center = size / 2;
    const maxRadius = size / 2 - 40;
    const levels = 5;
    const angleStep = (2 * Math.PI) / data.length;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, []);

    const getPoint = (value: number, index: number) => {
      const angle = angleStep * index - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    };

    const getLabelPoint = (index: number) => {
      const angle = angleStep * index - Math.PI / 2;
      const radius = maxRadius + 30;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    };

    const polygonPoints = data
      .map((item, index) => {
        const point = getPoint(item.value, index);
        return `${point.x},${point.y}`;
      })
      .join(" ");

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        }}
      >
        <Svg width={size} height={size}>
          {/* Grid circles */}
          {[...Array(levels)].map((_, i) => {
            const r = ((i + 1) / levels) * maxRadius;
            return (
              <Circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                stroke="#e2e8f0"
                strokeWidth="1"
                fill="none"
              />
            );
          })}

          {/* Axis lines */}
          {data.map((_, index) => {
            const point = getPoint(100, index);
            return (
              <Path
                key={index}
                d={`M ${center} ${center} L ${point.x} ${point.y}`}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <Polygon
            points={polygonPoints}
            fill="rgba(59, 130, 246, 0.3)"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const point = getPoint(item.value, index);
            return (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}

          {/* Labels */}
          {data.map((item, index) => {
            const labelPoint = getLabelPoint(index);
            return (
              <SvgText
                key={index}
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize="12"
                fontWeight="600"
                fill="#475569"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            );
          })}
        </Svg>
      </Animated.View>
    );
  };

  // Componente de Heatmap Calendar Inline
  const HeatmapCalendar = () => {
    const cellSize = isDesktop ? 14 : 10;
    const gap = isDesktop ? 4 : 3;
    const width = (cellSize + gap) * 13;
    const height = (cellSize + gap) * 7 + 40;

    return (
      <View style={{ paddingVertical: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              <View style={{ width: 30 }} />
              <View style={{ flexDirection: "row", gap }}>
                {["Jan", "Fev", "Mar"].map((month, i) => (
                  <Text
                    key={i}
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "600",
                      width: (cellSize + gap) * 4,
                      textAlign: "center",
                    }}
                  >
                    {month}
                  </Text>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View style={{ width: 30, justifyContent: "space-around" }}>
                {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => (
                  <Text
                    key={i}
                    style={{
                      fontSize: 10,
                      color: "#94a3b8",
                      fontWeight: "600",
                      height: cellSize,
                      lineHeight: cellSize,
                    }}
                  >
                    {day}
                  </Text>
                ))}
              </View>

              <View style={{ flexDirection: "row", gap }}>
                {heatmapData.map((week, weekIndex) => (
                  <View key={weekIndex} style={{ gap }}>
                    {week.map((value, dayIndex) => (
                      <TouchableOpacity
                        key={dayIndex}
                        activeOpacity={0.7}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getHeatmapColor(value),
                          borderRadius: 3,
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.05)",
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
                gap: 8,
              }}
            >
              <Text
                style={{ fontSize: 11, color: "#64748b", fontWeight: "600" }}
              >
                Menos
              </Text>
              {[0, 1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getHeatmapColor(level),
                    borderRadius: 3,
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.05)",
                  }}
                />
              ))}
              <Text
                style={{ fontSize: 11, color: "#64748b", fontWeight: "600" }}
              >
                Mais
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const StatCard = ({
    icon,
    value,
    label,
    trend,
    color,
    delay,
  }: {
    icon: any;
    value: string;
    label: string;
    trend?: number;
    color: string;
    delay: number;
  }) => {
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
        style={{
          flex: 1,
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
        }}
      >
        <LinearGradient colors={["#ffffff", "#fafafa"]} style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: color + "15" }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Text style={styles.statCardValue}>{value}</Text>
          <Text style={styles.statCardLabel}>{label}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons
                name={trend > 0 ? "trending-up" : "trending-down"}
                size={14}
                color={trend > 0 ? "#10b981" : "#f43f5e"}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trend > 0 ? "#10b981" : "#f43f5e" },
                ]}
              >
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <LinearGradient colors={["#eff6ff", "#ffffff"]} style={{ flex: 1 }}>
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
                    colors={["#3b82f6", "#1e40af"]}
                    style={styles.headerIcon}
                  >
                    <Ionicons name="stats-chart" size={28} color="#ffffff" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.headerTitle}>Estatísticas</Text>
                    <Text style={styles.headerSubtitle}>
                      Análise completa do seu progresso
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <View
              style={{
                paddingHorizontal: isDesktop ? 0 : 20,
                maxWidth: isDesktop ? 1200 : "100%",
                marginHorizontal: isDesktop ? "auto" : 0,
                width: "100%",
              }}
            >
              {/* Period Selector */}
              <Animated.View
                style={[
                  styles.periodSelector,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {(["week", "month", "year"] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    activeOpacity={0.7}
                    style={{ flex: 1 }}
                  >
                    {selectedPeriod === period ? (
                      <LinearGradient
                        colors={["#3b82f6", "#1e40af"]}
                        style={styles.periodButtonActive}
                      >
                        <Text style={styles.periodTextActive}>
                          {period === "week"
                            ? "Semana"
                            : period === "month"
                              ? "Mês"
                              : "Ano"}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.periodButton}>
                        <Text style={styles.periodText}>
                          {period === "week"
                            ? "Semana"
                            : period === "month"
                              ? "Mês"
                              : "Ano"}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </Animated.View>

              {/* Quick Stats Grid */}
              <View style={styles.statsGrid}>
                <StatCard
                  icon="timer-outline"
                  value={topStats.totalTime}
                  label="Tempo focado"
                  color="#3b82f6"
                  delay={100}
                />
                <StatCard
                  icon="calendar-outline"
                  value={topStats.activeDays.toString()}
                  label="Dias ativos"
                  color="#10b981"
                  delay={200}
                />
                <StatCard
                  icon="flame-outline"
                  value={topStats.streak.toString()}
                  label="Sequência"
                  color="#f59e0b"
                  delay={300}
                />
                <StatCard
                  icon="trophy-outline"
                  value={`${topStats.successRate}%`}
                  label="Taxa de sucesso"
                  color="#8b5cf6"
                  delay={400}
                />
              </View>

              {/* Charts Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                {/* Weekly Progress Chart */}
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={styles.chartCard}
                >
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                      <Ionicons
                        name="bar-chart-outline"
                        size={24}
                        color="#3b82f6"
                      />
                      <Text style={styles.chartTitle}>Progresso Semanal</Text>
                    </View>
                    <Text style={styles.chartSubtitle}>Total: 34.6 horas</Text>
                  </View>
                  <BarChart data={weeklyData} height={220} />
                </LinearGradient>

                {/* Mood Distribution */}
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={[styles.chartCard, { marginTop: 24 }]}
                >
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                      <Ionicons
                        name="happy-outline"
                        size={24}
                        color="#10b981"
                      />
                      <Text style={styles.chartTitle}>
                        Distribuição de Humor
                      </Text>
                    </View>
                    <Text style={styles.chartSubtitle}>Últimos 30 dias</Text>
                  </View>
                  <DonutChart data={moodData} size={isDesktop ? 240 : 200} />
                </LinearGradient>

                {/* Productivity Radar */}
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={[styles.chartCard, { marginTop: 24 }]}
                >
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                      <Ionicons
                        name="analytics-outline"
                        size={24}
                        color="#8b5cf6"
                      />
                      <Text style={styles.chartTitle}>
                        Análise de Produtividade
                      </Text>
                    </View>
                    <Text style={styles.chartSubtitle}>Pontuação média</Text>
                  </View>
                  <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <RadarChart
                      data={productivityData}
                      size={isDesktop ? 300 : 260}
                    />
                  </View>
                </LinearGradient>

                {/* Activity Heatmap */}
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={[styles.chartCard, { marginTop: 24 }]}
                >
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                      <Ionicons name="grid-outline" size={24} color="#0ea5e9" />
                      <Text style={styles.chartTitle}>Mapa de Atividades</Text>
                    </View>
                    <Text style={styles.chartSubtitle}>Últimos 90 dias</Text>
                  </View>
                  <HeatmapCalendar />
                </LinearGradient>

                {/* Achievements */}
                <LinearGradient
                  colors={["#fffbeb", "#fef3c7"]}
                  style={[styles.achievementCard, { marginTop: 24 }]}
                >
                  <View style={styles.achievementHeader}>
                    <Text style={styles.achievementEmoji}>🏆</Text>
                    <Text style={styles.achievementTitle}>
                      Conquistas Recentes
                    </Text>
                  </View>
                  <View style={styles.achievementList}>
                    {achievements.map((achievement, index) => (
                      <View key={index} style={styles.achievementItem}>
                        <Text style={styles.achievementIcon}>
                          {achievement.icon}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.achievementName}>
                            {achievement.name}
                          </Text>
                          <Text style={styles.achievementDesc}>
                            {achievement.desc}
                          </Text>
                        </View>
                        <Ionicons
                          name={
                            achievement.unlocked
                              ? "checkmark-circle"
                              : "lock-closed"
                          }
                          size={24}
                          color={achievement.unlocked ? "#10b981" : "#94a3b8"}
                        />
                      </View>
                    ))}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
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
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 24,
    marginHorizontal: 20,
  },
  periodButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  periodButtonActive: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  periodTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
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
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statCardLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
  },
  chartCard: {
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
  chartHeader: {
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  chartSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  achievementCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: "#fde68a",
    ...Platform.select({
      ios: {
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  achievementEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#92400e",
    letterSpacing: -0.3,
  },
  achievementList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#78350f",
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "500",
  },
});

export default StatisticsScreen;
