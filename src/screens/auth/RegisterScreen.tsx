import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types";
import authService from "../../services/auth.service";
import { LinearGradient } from "expo-linear-gradient";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Register"
>;

interface PasswordRequirement {
  label: string;
  met: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  // Responsive states
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  // Estados principais
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusedField, setFocusedField] = useState<string>("");

  // Estados de erro em tempo real
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validação de email robusta
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }, []);

  // Requisitos de senha melhorados
  const passwordRequirements = useMemo((): PasswordRequirement[] => {
    return [
      {
        label: "Mínimo 8 caracteres",
        met: password.length >= 8,
        icon: "text",
      },
      {
        label: "Uma letra maiúscula",
        met: /[A-Z]/.test(password),
        icon: "arrow-up",
      },
      {
        label: "Uma letra minúscula",
        met: /[a-z]/.test(password),
        icon: "arrow-down",
      },
      {
        label: "Um número",
        met: /\d/.test(password),
        icon: "keypad",
      },
      {
        label: "Um caractere especial",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        icon: "star",
      },
    ];
  }, [password]);

  // Cálculo de força da senha
  const passwordStrength = useMemo(() => {
    if (password.length === 0)
      return { label: "", color: "", width: 0, score: 0 };

    const metRequirements = passwordRequirements.filter(
      (req) => req.met,
    ).length;
    const score = (metRequirements / passwordRequirements.length) * 100;

    if (score < 40)
      return { label: "Muito Fraca", color: "#dc2626", width: 25, score };
    if (score < 60)
      return { label: "Fraca", color: "#ef4444", width: 40, score };
    if (score < 80)
      return { label: "Média", color: "#f59e0b", width: 60, score };
    if (score < 100)
      return { label: "Boa", color: "#22c55e", width: 80, score };
    return { label: "Excelente", color: "#10b981", width: 100, score };
  }, [password, passwordRequirements]);

  // Validação em tempo real
  const validateField = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case "name":
          if (value.length > 0 && value.length < 3) {
            setErrors((prev) => ({
              ...prev,
              name: "Nome deve ter pelo menos 3 caracteres",
            }));
          } else {
            setErrors((prev) => ({ ...prev, name: "" }));
          }
          break;
        case "email":
          if (value && !validateEmail(value)) {
            setErrors((prev) => ({ ...prev, email: "Email inválido" }));
          } else {
            setErrors((prev) => ({ ...prev, email: "" }));
          }
          break;
        case "password":
          if (value && value.length < 8) {
            setErrors((prev) => ({ ...prev, password: "Mínimo 8 caracteres" }));
          } else {
            setErrors((prev) => ({ ...prev, password: "" }));
          }
          break;
        case "confirmPassword":
          if (value && value !== password) {
            setErrors((prev) => ({
              ...prev,
              confirmPassword: "As senhas não coincidem",
            }));
          } else {
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }
          break;
      }
    },
    [password, validateEmail],
  );

  // Handler de mudança de campo
  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case "name":
          setName(value);
          break;
        case "email":
          setEmail(value);
          break;
        case "password":
          setPassword(value);
          break;
        case "confirmPassword":
          setConfirmPassword(value);
          break;
      }
      validateField(field, value);
    },
    [validateField],
  );

  // Handler de registro
  const handleRegister = async () => {
    console.log("RegisterScreen: handleRegister iniciado");

    // Validações completas
    if (!name || !email || !password || !confirmPassword) {
      console.log("RegisterScreen: Campos vazios");
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos");
      return;
    }

    if (name.length < 3) {
      console.log("RegisterScreen: Nome muito curto");
      Alert.alert("Nome inválido", "O nome deve ter pelo menos 3 caracteres");
      return;
    }

    if (!validateEmail(email)) {
      console.log("RegisterScreen: Email inválido");
      Alert.alert("Email inválido", "Por favor, insira um email válido");
      return;
    }

    if (password !== confirmPassword) {
      console.log("RegisterScreen: Senhas não coincidem");
      Alert.alert("Senhas não coincidem", "As senhas digitadas não são iguais");
      return;
    }

    if (passwordStrength.score < 60) {
      console.log(
        "RegisterScreen: Senha fraca, score:",
        passwordStrength.score,
      );
      Alert.alert(
        "Senha fraca",
        "Sua senha deve atender a pelo menos 3 dos 5 requisitos de segurança",
      );
      return;
    }

    if (!agreedToTerms) {
      console.log("RegisterScreen: Termos não aceitos");
      Alert.alert(
        "Termos de uso",
        "Você precisa concordar com os termos de uso",
      );
      return;
    }

    console.log(
      "RegisterScreen: Todas validações passaram, iniciando registro...",
    );

    try {
      setLoading(true);
      console.log("RegisterScreen: Chamando authService.register...");
      const user = await authService.register(email, password, name);
      console.log(
        "RegisterScreen: Registro concluído com sucesso! User:",
        user.email,
      );
      // O AuthContext detectará automaticamente o novo usuário autenticado
      // e navegará para o app. Aguardando onAuthStateChanged...
    } catch (error: any) {
      console.error("RegisterScreen: Erro ao criar conta:", error);
      const errorMessage = error.message || "Tente novamente";

      if (Platform.OS === "web") {
        window.alert(`Erro ao criar conta: ${errorMessage}`);
      } else {
        Alert.alert("Erro ao criar conta", errorMessage);
      }
    } finally {
      setLoading(false);
      console.log("RegisterScreen: Loading finalizado");
    }
  };

  // Handler de cadastro com Google
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const result = await authService.signInWithGoogle();
      // Se for redirect, result pode ser null
      if (!result) {
        console.log("RegisterScreen: Aguardando redirect do Google...");
        return;
      }
      // A navegação automática será feita pelo AuthContext
      // Não precisa do Alert pois vai direto para o app
    } catch (error: any) {
      console.error("RegisterScreen: Erro no cadastro com Google:", error);
      if (
        error.message !== "Login cancelado" &&
        error.message !== "Login cancelado pelo usuário"
      ) {
        const errorMsg =
          Platform.OS === "web"
            ? "Erro ao fazer cadastro com Google. Tente novamente ou use email e senha."
            : error.message;
        Alert.alert("Erro ao fazer cadastro com Google", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Componente de requisitos de senha
  const PasswordRequirementsDisplay = () => (
    <View className="mt-3 bg-slate-50 rounded-xl p-4">
      <Text className="text-xs font-bold text-slate-600 mb-3">
        Requisitos de senha:
      </Text>
      {passwordRequirements.map((req, index) => (
        <View key={index} className="flex-row items-center mb-2">
          <View
            className="w-5 h-5 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: req.met ? "#10b981" : "#e2e8f0" }}
          >
            {req.met ? (
              <Ionicons name="checkmark" size={12} color="white" />
            ) : (
              <View className="w-2 h-2 rounded-full bg-slate-400" />
            )}
          </View>
          <Text
            className="text-xs flex-1"
            style={{ color: req.met ? "#10b981" : "#64748b" }}
          >
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );

  // Container responsivo para web/mobile
  const getContainerStyle = () => {
    if (isDesktop) {
      return {
        flexDirection: "row" as const,
        height: "100vh",
      };
    }
    return {};
  };

  const getFormContainerStyle = () => {
    if (isDesktop) {
      return {
        flex: 1,
        maxWidth: 600,
      };
    }
    if (isTablet) {
      return {
        maxWidth: 500,
        marginHorizontal: "auto" as const,
        width: "100%",
      };
    }
    return {};
  };

  // Desktop Hero Component
  const DesktopHero = () => (
    <View style={{ flex: 1, minHeight: height }}>
      <LinearGradient
        colors={["#0ea5e9", "#3b82f6", "#6366f1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 64, justifyContent: "center" }}
      >
        <View style={{ maxWidth: 500 }}>
          {/* Logo e título */}
          <View style={{ marginBottom: 48 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Ionicons name="timer" size={48} color="white" />
            </View>
            <Text
              style={{
                fontSize: 48,
                fontWeight: "bold",
                color: "white",
                marginBottom: 16,
              }}
            >
              Junte-se a nós{"\n"}PomodoroAI
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 28,
              }}
            >
              Milhares de profissionais já melhoraram sua produtividade. Comece
              sua jornada hoje!
            </Text>
          </View>

          {/* Features */}
          <View style={{ gap: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Ionicons name="rocket" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  Comece em 30 segundos
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 20,
                  }}
                >
                  Cadastro rápido e fácil. Sem cartão de crédito necessário
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Ionicons name="people" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  Comunidade Ativa
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 20,
                  }}
                >
                  Junte-se a mais de 10 mil usuários que já transformaram sua
                  rotina
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Ionicons name="shield-checkmark" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  100% Seguro
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 20,
                  }}
                >
                  Seus dados protegidos com criptografia de ponta a ponta
                </Text>
              </View>
            </View>
          </View>

          {/* Social Proof */}
          <View
            style={{
              flexDirection: "row",
              gap: 32,
              marginTop: 48,
              paddingTop: 32,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.2)",
            }}
          >
            <View>
              <Text
                style={{ fontSize: 32, fontWeight: "bold", color: "white" }}
              >
                10k+
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                Usuários ativos
              </Text>
            </View>
            <View>
              <Text
                style={{ fontSize: 32, fontWeight: "bold", color: "white" }}
              >
                4.9★
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                Avaliação
              </Text>
            </View>
            <View>
              <Text
                style={{ fontSize: 32, fontWeight: "bold", color: "white" }}
              >
                Grátis
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                Para sempre
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: "white" }, getContainerStyle()]}>
      {/* Desktop Hero - Lado esquerdo */}
      {isDesktop && <DesktopHero />}

      {/* Form Container - Lado direito (desktop) ou tela completa (mobile) */}
      <View style={[{ flex: 1 }, getFormContainerStyle()]}>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                padding: isDesktop ? 64 : isTablet ? 48 : 24,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Mobile Header - Apenas quando não é desktop */}
              {!isDesktop && (
                <LinearGradient
                  colors={["#0ea5e9", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    marginHorizontal: -24,
                    marginTop: -24,
                    paddingTop: 48,
                    paddingBottom: 32,
                    paddingHorizontal: 24,
                    marginBottom: 24,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    <Ionicons name="arrow-back" size={20} color="white" />
                  </TouchableOpacity>

                  <View style={{ alignItems: "center", marginBottom: 16 }}>
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="timer" size={32} color="white" />
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "white",
                      marginBottom: 8,
                    }}
                  >
                    Criar Conta
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}
                  >
                    Junte-se a milhares de usuários produtivos
                  </Text>
                </LinearGradient>
              )}

              {/* Desktop Form Title */}
              {isDesktop && (
                <View style={{ marginBottom: 40 }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#1e293b",
                      marginBottom: 8,
                    }}
                  >
                    Criar sua conta
                  </Text>
                  <Text style={{ fontSize: 16, color: "#64748b" }}>
                    Comece sua jornada de produtividade
                  </Text>
                </View>
              )}

              {/* Form Section */}
              <View>
                {/* Card do Formulário */}
                <View
                  style={
                    !isDesktop
                      ? {
                          backgroundColor: "white",
                          borderRadius: 24,
                          padding: 24,
                          marginBottom: 24,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 20,
                          elevation: 10,
                        }
                      : {}
                  }
                >
                  {/* Name Input */}
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                      Nome completo
                    </Text>
                    <View
                      className="flex-row items-center rounded-xl px-4 border-2"
                      style={{
                        backgroundColor:
                          focusedField === "name" ? "#f0f9ff" : "white",
                        borderColor:
                          focusedField === "name"
                            ? "#0ea5e9"
                            : errors.name
                              ? "#ef4444"
                              : "#e2e8f0",
                      }}
                    >
                      <Ionicons
                        name="person"
                        size={20}
                        color={focusedField === "name" ? "#0ea5e9" : "#94a3b8"}
                      />
                      <TextInput
                        className="flex-1 py-4 px-3 text-base text-slate-900"
                        placeholder="Como você se chama?"
                        placeholderTextColor="#94a3b8"
                        value={name}
                        onChangeText={(value) =>
                          handleFieldChange("name", value)
                        }
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("name", name);
                        }}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                      {name.length > 0 && (
                        <TouchableOpacity onPress={() => setName("")}>
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#94a3b8"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    {errors.name ? (
                      <Text className="text-xs text-red-500 mt-1.5 ml-1">
                        {errors.name}
                      </Text>
                    ) : null}
                  </View>

                  {/* Email Input */}
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                      Email
                    </Text>
                    <View
                      className="flex-row items-center rounded-xl px-4 border-2"
                      style={{
                        backgroundColor:
                          focusedField === "email" ? "#f0f9ff" : "white",
                        borderColor:
                          focusedField === "email"
                            ? "#0ea5e9"
                            : errors.email
                              ? "#ef4444"
                              : "#e2e8f0",
                      }}
                    >
                      <Ionicons
                        name="mail"
                        size={20}
                        color={focusedField === "email" ? "#0ea5e9" : "#94a3b8"}
                      />
                      <TextInput
                        className="flex-1 py-4 px-3 text-base text-slate-900"
                        placeholder="seu@email.com"
                        placeholderTextColor="#94a3b8"
                        value={email}
                        onChangeText={(value) =>
                          handleFieldChange("email", value)
                        }
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("email", email);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                      />
                      {email.length > 0 && (
                        <TouchableOpacity onPress={() => setEmail("")}>
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#94a3b8"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    {errors.email ? (
                      <Text className="text-xs text-red-500 mt-1.5 ml-1">
                        {errors.email}
                      </Text>
                    ) : null}
                  </View>

                  {/* Password Input */}
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                      Senha
                    </Text>
                    <View
                      className="flex-row items-center rounded-xl px-4 border-2"
                      style={{
                        backgroundColor:
                          focusedField === "password" ? "#f0f9ff" : "white",
                        borderColor:
                          focusedField === "password"
                            ? "#0ea5e9"
                            : errors.password
                              ? "#ef4444"
                              : "#e2e8f0",
                      }}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={
                          focusedField === "password" ? "#0ea5e9" : "#94a3b8"
                        }
                      />
                      <TextInput
                        className="flex-1 py-4 px-3 text-base text-slate-900"
                        placeholder="Mínimo 8 caracteres"
                        placeholderTextColor="#94a3b8"
                        value={password}
                        onChangeText={(value) =>
                          handleFieldChange("password", value)
                        }
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("password", password);
                        }}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        returnKeyType="next"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#94a3b8"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <View className="mt-3">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-xs text-slate-500">
                            Força da senha:
                          </Text>
                          <Text
                            className="text-xs font-bold"
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.label}
                          </Text>
                        </View>
                        <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <View
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${passwordStrength.width}%`,
                              backgroundColor: passwordStrength.color,
                            }}
                          />
                        </View>

                        {/* Requisitos de Senha */}
                        {focusedField === "password" && (
                          <PasswordRequirementsDisplay />
                        )}
                      </View>
                    )}
                  </View>

                  {/* Confirm Password Input */}
                  <View className="mb-6">
                    <Text className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                      Confirmar senha
                    </Text>
                    <View
                      className="flex-row items-center rounded-2xl px-5 border-2"
                      style={{
                        backgroundColor:
                          focusedField === "confirmPassword"
                            ? "#f0f9ff"
                            : "#f8fafc",
                        borderColor:
                          focusedField === "confirmPassword"
                            ? "#0ea5e9"
                            : errors.confirmPassword
                              ? "#ef4444"
                              : "#e2e8f0",
                      }}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={24}
                        color={
                          focusedField === "confirmPassword"
                            ? "#0ea5e9"
                            : "#94a3b8"
                        }
                      />
                      <TextInput
                        className="flex-1 py-5 px-4 text-lg text-slate-800"
                        placeholder="Digite a senha novamente"
                        placeholderTextColor="#94a3b8"
                        value={confirmPassword}
                        onChangeText={(value) =>
                          handleFieldChange("confirmPassword", value)
                        }
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("confirmPassword", confirmPassword);
                        }}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        returnKeyType="done"
                        onSubmitEditing={handleRegister}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#94a3b8"
                        />
                      </TouchableOpacity>
                    </View>
                    {confirmPassword.length > 0 &&
                      password !== confirmPassword && (
                        <View className="flex-row items-center mt-1.5 ml-1">
                          <Ionicons
                            name="close-circle"
                            size={12}
                            color="#ef4444"
                          />
                          <Text className="text-xs text-red-500 ml-1">
                            As senhas não coincidem
                          </Text>
                        </View>
                      )}
                    {confirmPassword.length > 0 &&
                      password === confirmPassword &&
                      password.length >= 8 && (
                        <View className="flex-row items-center mt-1.5 ml-1">
                          <Ionicons
                            name="checkmark-circle"
                            size={12}
                            color="#10b981"
                          />
                          <Text className="text-xs text-green-600 ml-1">
                            Senhas coincidem
                          </Text>
                        </View>
                      )}
                  </View>

                  {/* Terms Checkbox */}
                  <View className="mb-6">
                    <TouchableOpacity
                      onPress={() => setAgreedToTerms(!agreedToTerms)}
                      className="flex-row items-center"
                      activeOpacity={0.7}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderWidth: 2,
                          borderRadius: 0,
                          borderColor: agreedToTerms ? "#10b981" : "#cbd5e1",
                          backgroundColor: "white",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {agreedToTerms && (
                          <Ionicons name="checkmark" size={18} color="#10b981" />
                        )}
                      </View>
                      <Text className="flex-1 text-sm text-slate-700 leading-5">
                        Concordo com os{" "}
                        <Text className="text-sky-600 font-semibold">
                          Termos de Uso
                        </Text>{" "}
                        e{" "}
                        <Text className="text-sky-600 font-semibold">
                          Política de Privacidade
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Register Button */}
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#0ea5e9", "#3b82f6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="rounded-2xl py-5 items-center"
                      style={{
                        shadowColor: "#0ea5e9",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 10,
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <View className="flex-row items-center">
                          <Text className="text-white text-lg font-bold mr-2">
                            Criar Conta
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={22}
                            color="white"
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View className="flex-row items-center mb-6 mt-2">
                  <View className="flex-1 h-px bg-slate-200" />
                  <Text className="px-4 text-xs font-semibold text-slate-400 uppercase">
                    ou cadastre-se com
                  </Text>
                  <View className="flex-1 h-px bg-slate-200" />
                </View>

                {/* Social Buttons */}
                <View className="flex-row gap-3 mb-8">
                  <TouchableOpacity
                    className="flex-1 bg-white border-2 border-slate-200 rounded-2xl py-4 items-center"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                    onPress={handleGoogleSignUp}
                    disabled={loading}
                  >
                    <Ionicons name="logo-google" size={24} color="#EA4335" />
                    <Text className="text-xs font-bold text-slate-700 mt-1">
                      Google
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-white border-2 border-slate-200 rounded-2xl py-4 items-center"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                      opacity: 0.5,
                    }}
                    onPress={() =>
                      Alert.alert(
                        "Em breve",
                        "Cadastro com Apple será implementado em breve",
                      )
                    }
                  >
                    <Ionicons name="logo-apple" size={24} color="#000000" />
                    <Text className="text-xs font-bold text-slate-700 mt-1">
                      Apple
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Link */}
              <View className="flex-row items-center justify-center pb-6 pt-4">
                <Text className="text-base text-slate-600">
                  Já tem uma conta?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text className="text-base font-bold text-sky-600">
                    Fazer login
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Trust Indicators */}
              <View className="items-center pb-8">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                  <Text className="text-sm text-slate-500">
                    Seus dados estão protegidos
                  </Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default RegisterScreen;
