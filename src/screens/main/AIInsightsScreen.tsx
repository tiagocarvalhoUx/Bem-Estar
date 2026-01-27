import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { usePomodoro } from "../../contexts/PomodoroContext";
import aiService from "../../services/ai.service";
import { AISuggestion, SuggestionType } from "../../types";

const AIInsightsScreen: React.FC = () => {
  const { user } = useAuth();
  const { sessions, moodHistory } = usePomodoro();

  console.log("AIInsightsScreen: Renderizando", {
    hasUser: !!user,
    sessionsType: typeof sessions,
    sessionsIsArray: Array.isArray(sessions),
    sessionsLength: sessions?.length,
    sessionsData: sessions?.slice(0, 2).map((s) => ({
      id: s.id,
      mode: s.mode,
      duration: s.duration,
      completedAt: s.completedAt,
    })),
    moodHistoryType: typeof moodHistory,
    moodHistoryIsArray: Array.isArray(moodHistory),
    moodHistoryLength: moodHistory?.length,
    moodData: moodHistory?.slice(0, 2).map((m) => ({
      id: m.id,
      mood: m.mood,
      timestamp: m.timestamp,
    })),
  });

  const [insights, setInsights] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = Dimensions.get("window");
  const isDesktop = width >= 1024;

  // Log imediato para debug
  console.log("🔍 AIInsightsScreen: Estado atual antes do useEffect", {
    hasUser: !!user,
    sessionsLength: sessions?.length,
    moodLength: moodHistory?.length,
    insightsLength: insights.length,
  });

  // Gerar insights com IA
  const generateInsights = async () => {
    try {
      setLoading(true);

      console.log("=== AIInsightsScreen: INÍCIO generateInsights ===");
      console.log("AIInsights: user existe?", !!user);
      console.log("AIInsights: user.id:", user?.id);
      console.log("AIInsights: sessions:", sessions);
      console.log("AIInsights: sessions é array?", Array.isArray(sessions));
      console.log("AIInsights: sessions.length:", sessions?.length);
      console.log("AIInsights: moodHistory:", moodHistory);
      console.log("AIInsights: moodHistory.length:", moodHistory?.length);

      // Verificar se temos dados e usuário
      if (!user) {
        console.log("AIInsights: Usuário não autenticado");
        setInsights([]);
        setLoading(false);
        return;
      }

      console.log("AIInsights: Gerando sugestões com IA...", {
        sessionsCount: sessions?.length || 0,
        moodHistoryCount: moodHistory?.length || 0,
        primeiras3Sessions: sessions
          ?.slice(0, 3)
          .map((s) => ({ id: s.id, mode: s.mode })),
        primeiros3Moods: moodHistory
          ?.slice(0, 3)
          .map((m) => ({ id: m.id, mood: m.mood })),
      });

      // Se não houver dados suficientes, mostrar insights de exemplo
      // Apenas requer sessões, humor é opcional
      console.log("AIInsights: Verificando condição de sessões...", {
        sessionsTruthy: !!sessions,
        sessionsLength: sessions?.length,
        condicaoSessionsVazia: !sessions || sessions.length === 0,
      });

      if (!sessions || sessions.length === 0) {
        console.log("AIInsights: Gerando insights de exemplo (sem sessões)");
        const exampleInsights: AISuggestion[] = [
          {
            id: "example-1",
            userId: user.id,
            type: SuggestionType.PRODUCTIVITY_TIP,
            message:
              "🎯 Bem-vindo! Complete algumas sessões Pomodoro para receber insights personalizados sobre sua produtividade.",
            confidence: 1,
            reasons: ["Primeiro acesso", "Aguardando dados históricos"],
            createdAt: new Date(),
            dismissed: false,
          },
          {
            id: "example-2",
            userId: user.id,
            type: SuggestionType.MOOD_CHECK,
            message:
              "💭 Registre seu humor regularmente para que eu possa entender melhor seus padrões de bem-estar.",
            confidence: 1,
            reasons: ["Check-in de humor ajuda no autoconhecimento"],
            createdAt: new Date(),
            dismissed: false,
          },
          {
            id: "example-3",
            userId: user.id,
            type: SuggestionType.OPTIMAL_TIME,
            message:
              "⏰ Após completar algumas sessões, vou identificar seus períodos mais produtivos do dia.",
            confidence: 1,
            reasons: ["Análise de padrões em desenvolvimento"],
            createdAt: new Date(),
            dismissed: false,
          },
        ];

        setInsights(exampleInsights);
        setLoading(false);
        return;
      }

      // Obter sugestões personalizadas da IA
      console.log("AIInsights: Chamando aiService.generateSuggestions...", {
        userId: user.id,
        sessionsCount: sessions.length,
        moodCount: moodHistory?.length || 0,
      });
      const aiSuggestions = await aiService.generateSuggestions(
        user,
        sessions,
        moodHistory,
      );

      console.log("AIInsights: Sugestões geradas:", aiSuggestions.length);
      if (aiSuggestions.length > 0) {
        console.log("AIInsights: Primeira sugestão:", aiSuggestions[0].message);
      }
      setInsights(aiSuggestions);
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("=== AIInsightsScreen: useEffect disparado ===", {
      hasUser: !!user,
      sessionsUndefined: sessions === undefined,
      moodHistoryUndefined: moodHistory === undefined,
      sessionsLength: sessions?.length,
      moodHistoryLength: moodHistory?.length,
    });

    if (user && sessions !== undefined && moodHistory !== undefined) {
      console.log(
        "AIInsights: Condições atendidas, chamando generateInsights()",
      );
      generateInsights();
    } else {
      console.log("AIInsights: Condições NÃO atendidas, aguardando...");
    }
  }, [user, sessions, moodHistory]);

  // Atualização automática periódica dos insights a cada 5 minutos
  useEffect(() => {
    if (!user || sessions === undefined || moodHistory === undefined) {
      return;
    }

    console.log(
      "AIInsights: Configurando atualização automática a cada 5 minutos",
    );

    // Atualizar insights automaticamente
    const intervalId = setInterval(
      () => {
        console.log("AIInsights: Atualizando insights automaticamente...");
        generateInsights();
      },
      5 * 60 * 1000,
    ); // 5 minutos

    // Limpar interval quando componente desmontar
    return () => {
      console.log("AIInsights: Limpando interval de atualização automática");
      clearInterval(intervalId);
    };
  }, [user, sessions, moodHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await generateInsights();
    setRefreshing(false);
  };

  // Ícone por tipo de sugestão
  const getIconForType = (type: SuggestionType) => {
    switch (type) {
      case SuggestionType.PRODUCTIVITY_TIP:
        return "trending-up";
      case SuggestionType.MOOD_CHECK:
        return "heart";
      case SuggestionType.OPTIMAL_TIME:
        return "time";
      case SuggestionType.BREAK_REMINDER:
        return "cafe";
      case SuggestionType.GOAL_ADJUSTMENT:
        return "flag";
      default:
        return "bulb";
    }
  };

  // Cor por tipo
  const getColorForType = (type: SuggestionType) => {
    switch (type) {
      case SuggestionType.PRODUCTIVITY_TIP:
        return "#3b82f6";
      case SuggestionType.MOOD_CHECK:
        return "#ef4444";
      case SuggestionType.OPTIMAL_TIME:
        return "#8b5cf6";
      case SuggestionType.BREAK_REMINDER:
        return "#10b981";
      case SuggestionType.GOAL_ADJUSTMENT:
        return "#f59e0b";
      default:
        return "#0ea5e9";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <LinearGradient
        colors={["#0ea5e9", "#3b82f6", "#6366f1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: isDesktop ? 48 : 24,
          paddingVertical: isDesktop ? 32 : 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Ionicons name="sparkles" size={28} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "white" }}>
              AI Insights
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 4,
              }}
            >
              Sugestões personalizadas para você
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: isDesktop ? 48 : 24,
          maxWidth: isDesktop ? 1200 : undefined,
          width: "100%",
          alignSelf: "center",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={{ marginTop: 16, color: "#64748b", fontSize: 16 }}>
              Analisando seus dados...
            </Text>
          </View>
        ) : insights.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#e0f2fe",
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="bulb-outline" size={40} color="#0ea5e9" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Nenhum insight ainda
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#64748b",
                textAlign: "center",
                maxWidth: 300,
              }}
            >
              Complete mais sessões e registre seu humor para receber sugestões
              personalizadas
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {insights.map((insight, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: getColorForType(insight.type) + "20",
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={getIconForType(insight.type) as any}
                      size={24}
                      color={getColorForType(insight.type)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          backgroundColor: getColorForType(insight.type) + "15",
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: getColorForType(insight.type),
                            textTransform: "uppercase",
                          }}
                        >
                          {insight.type === SuggestionType.PRODUCTIVITY_TIP &&
                            "Produtividade"}
                          {insight.type === SuggestionType.MOOD_CHECK &&
                            "Bem-estar"}
                          {insight.type === SuggestionType.OPTIMAL_TIME &&
                            "Horário"}
                          {insight.type === SuggestionType.BREAK_REMINDER &&
                            "Descanso"}
                          {insight.type === SuggestionType.GOAL_ADJUSTMENT &&
                            "Meta"}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#1e293b",
                        lineHeight: 22,
                        marginBottom: 12,
                        fontWeight: "500",
                      }}
                    >
                      {insight.message}
                    </Text>
                    {insight.reasons && insight.reasons.length > 0 && (
                      <View
                        style={{
                          backgroundColor: "#f0f9ff",
                          padding: 12,
                          borderRadius: 12,
                          borderLeftWidth: 3,
                          borderLeftColor: getColorForType(insight.type),
                        }}
                      >
                        {insight.reasons.map((reason, idx) => (
                          <Text
                            key={idx}
                            style={{
                              fontSize: 12,
                              color: "#0c4a6e",
                              marginBottom:
                                idx < insight.reasons.length - 1 ? 4 : 0,
                            }}
                          >
                            • {reason}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Estatísticas Rápidas */}
        {!loading && insights.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: 16,
              }}
            >
              Seus Dados
            </Text>
            <View
              style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Ionicons name="timer" size={24} color="#0ea5e9" />
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#1e293b",
                    marginTop: 8,
                  }}
                >
                  {sessions?.length || 0}
                </Text>
                <Text style={{ fontSize: 14, color: "#64748b" }}>
                  Sessões Completadas
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Ionicons name="happy" size={24} color="#10b981" />
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#1e293b",
                    marginTop: 8,
                  }}
                >
                  {moodHistory?.length || 0}
                </Text>
                <Text style={{ fontSize: 14, color: "#64748b" }}>
                  Registros de Humor
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Info sobre IA */}
        <View
          style={{
            marginTop: 32,
            backgroundColor: "#f0f9ff",
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#bae6fd",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="information-circle" size={20} color="#0284c7" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#0c4a6e",
                marginLeft: 8,
              }}
            >
              Como funciona?
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: "#0c4a6e", lineHeight: 20 }}>
            Nossa IA analisa seus padrões de produtividade, humor e hábitos para
            fornecer sugestões personalizadas em tempo real. Quanto mais você
            usar o app, mais precisas serão as recomendações.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AIInsightsScreen;
