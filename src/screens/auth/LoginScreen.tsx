import React, { useState, useCallback, useEffect } from "react";
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
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types";
import authService from "../../services/auth.service";
import { LinearGradient } from "expo-linear-gradient";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Validação de email
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }, []);

  // Validação em tempo real
  const validateField = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case "email":
          if (value && !validateEmail(value)) {
            setErrors((prev) => ({ ...prev, email: "Email inválido" }));
          } else {
            setErrors((prev) => ({ ...prev, email: "" }));
          }
          break;
        case "password":
          if (value && value.length < 6) {
            setErrors((prev) => ({ ...prev, password: "Senha muito curta" }));
          } else {
            setErrors((prev) => ({ ...prev, password: "" }));
          }
          break;
      }
    },
    [validateEmail],
  );

  // Handler de mudança de campo
  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      if (field === "email") {
        setEmail(value);
      } else if (field === "password") {
        setPassword(value);
      }
      validateField(field, value);
    },
    [validateField],
  );

  // Handler de login
  const handleLogin = async () => {
    console.log("LoginScreen: handleLogin iniciado");
    console.log("LoginScreen: Email:", email);
    console.log("LoginScreen: Password length:", password.length);
    
    // Limpar erros anteriores
    setErrors({ email: "", password: "" });

    // Validações
    if (!email || !password) {
      console.log("LoginScreen: Campos vazios");
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos");
      return;
    }

    if (!validateEmail(email)) {
      console.log("LoginScreen: Email inválido");
      Alert.alert("Email inválido", "Por favor, insira um email válido");
      return;
    }

    if (password.length < 6) {
      console.log("LoginScreen: Senha muito curta");
      Alert.alert("Senha inválida", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    console.log("LoginScreen: Validações passaram, chamando authService.login...");
    
    try {
      setLoading(true);
      const user = await authService.login(email, password);
      console.log("LoginScreen: Login bem-sucedido! User:", user.email);
      // Navegação automática será feita pelo AuthContext
    } catch (error: any) {
      console.error("LoginScreen: Erro no login:", error);
      // Tratamento de erros mais específico
      let errorMessage = "Tente novamente";

      if (
        error.message.includes("usuário não encontrado") ||
        error.message.includes("senha incorreta") ||
        error.message.includes("Credenciais inválidas")
      ) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message.includes("muitas tentativas")) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos";
      } else if (error.message.includes("conexão")) {
        errorMessage = "Verifique sua conexão com a internet";
      } else {
        errorMessage = error.message;
      }

      if (Platform.OS === "web") {
        window.alert(`Erro ao fazer login: ${errorMessage}`);
      } else {
        Alert.alert("Erro ao fazer login", errorMessage);
      }
    } finally {
      setLoading(false);
      console.log("LoginScreen: Loading finalizado");
    }
  };

  // Handler de login com Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await authService.signInWithGoogle();
      // Se for redirect, result pode ser null
      if (!result) {
        console.log("LoginScreen: Aguardando redirect do Google...");
        return;
      }
      // Navegação automática será feita pelo AuthContext
    } catch (error: any) {
      console.error("LoginScreen: Erro no login com Google:", error);
      if (
        error.message !== "Login cancelado" &&
        error.message !== "Login cancelado pelo usuário"
      ) {
        const errorMsg =
          Platform.OS === "web"
            ? "Erro ao fazer login com Google. Tente novamente ou use email e senha."
            : error.message;
        Alert.alert("Erro ao fazer login com Google", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

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
              Bem-vindo ao{"\n"}PomodoroAI
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 28,
              }}
            >
              Aumente sua produtividade com inteligência artificial e técnicas
              comprovadas de foco.
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
                <Ionicons name="sparkles" size={24} color="white" />
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
                  IA Personalizada
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 20,
                  }}
                >
                  Sugestões inteligentes baseadas nos seus padrões de trabalho e
                  produtividade
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
                <Ionicons name="stats-chart" size={24} color="white" />
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
                  Análise Detalhada
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 20,
                  }}
                >
                  Acompanhe seu progresso com relatórios e gráficos em tempo
                  real
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
                <Ionicons name="sunny" size={24} color="white" />
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
                  Bem-estar Mental
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 20,
                  }}
                >
                  Prevenção de burnout e dicas para manter seu bem-estar
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
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
                50k+
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                Sessões/mês
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
              {/* Mobile Header */}
              {!isDesktop && (
                <View style={{ marginBottom: 32, alignItems: "center" }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: "#0ea5e9",
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Ionicons name="timer" size={32} color="white" />
                  </View>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "bold",
                      color: "#1e293b",
                    }}
                  >
                    PomodoroAI
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}
                  >
                    Sua jornada de produtividade começa aqui
                  </Text>
                </View>
              )}

              {/* Form Title */}
              <View style={{ marginBottom: isDesktop ? 40 : 32 }}>
                <Text
                  style={{
                    fontSize: isDesktop ? 32 : 24,
                    fontWeight: "bold",
                    color: "#1e293b",
                    marginBottom: 8,
                  }}
                >
                  Entrar na conta
                </Text>
                <Text style={{ fontSize: 16, color: "#64748b" }}>
                  Continue de onde parou
                </Text>
              </View>

              {/* Form Title */}
              <View style={{ marginBottom: isDesktop ? 40 : 32 }}>
                <Text
                  style={{
                    fontSize: isDesktop ? 32 : 24,
                    fontWeight: "bold",
                    color: "#1e293b",
                    marginBottom: 8,
                  }}
                >
                  Entrar na conta
                </Text>
                <Text style={{ fontSize: 16, color: "#64748b" }}>
                  Continue de onde parou
                </Text>
              </View>

              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: 8,
                  }}
                >
                  Email
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    borderWidth: 2,
                    backgroundColor: emailFocused ? "#f0f9ff" : "#f8fafc",
                    borderColor: emailFocused
                      ? "#0ea5e9"
                      : errors.email
                        ? "#ef4444"
                        : "#e2e8f0",
                  }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={emailFocused ? "#0ea5e9" : "#94a3b8"}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      paddingHorizontal: 12,
                      fontSize: 16,
                      color: "#1e293b",
                      outlineStyle: "none" as any,
                    }}
                    placeholder="seu@email.com"
                    placeholderTextColor="#cbd5e1"
                    value={email}
                    onChangeText={(value) => handleFieldChange("email", value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => {
                      setEmailFocused(false);
                      validateField("email", email);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  {email.length > 0 && (
                    <TouchableOpacity onPress={() => setEmail("")}>
                      <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
                {errors.email ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text
                      style={{ fontSize: 13, color: "#ef4444", marginLeft: 4 }}
                    >
                      {errors.email}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: 8,
                  }}
                >
                  Senha
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    borderWidth: 2,
                    backgroundColor: passwordFocused ? "#f0f9ff" : "#f8fafc",
                    borderColor: passwordFocused
                      ? "#0ea5e9"
                      : errors.password
                        ? "#ef4444"
                        : "#e2e8f0",
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passwordFocused ? "#0ea5e9" : "#94a3b8"}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      paddingHorizontal: 12,
                      fontSize: 16,
                      color: "#1e293b",
                      outlineStyle: "none" as any,
                    }}
                    placeholder="••••••••"
                    placeholderTextColor="#cbd5e1"
                    value={password}
                    onChangeText={(value) =>
                      handleFieldChange("password", value)
                    }
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false);
                      validateField("password", password);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text
                      style={{ fontSize: 13, color: "#ef4444", marginLeft: 4 }}
                    >
                      {errors.password}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Remember Me & Forgot Password */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <Pressable
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 2,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                      borderColor: rememberMe ? "#0ea5e9" : "#cbd5e1",
                      backgroundColor: rememberMe ? "#0ea5e9" : "transparent",
                    }}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: "#64748b" }}>
                    Lembrar-me
                  </Text>
                </Pressable>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#0ea5e9",
                    }}
                  >
                    Esqueceu a senha?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={{ marginBottom: 16 }}
              >
                <LinearGradient
                  colors={["#0ea5e9", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "600",
                          marginRight: 8,
                        }}
                      >
                        Entrar
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Demo Access (DEV only) */}
              {__DEV__ && (
                <TouchableOpacity
                  onPress={() => {
                    setEmail("demo@pomodoroai.com");
                    setPassword("demo123");
                  }}
                  style={{
                    padding: 12,
                    backgroundColor: "#fef3c7",
                    borderRadius: 8,
                    marginBottom: 24,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="code-slash" size={16} color="#d97706" />
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#92400e",
                        marginLeft: 6,
                        fontWeight: "500",
                      }}
                    >
                      Preencher dados demo
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Divider */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#e2e8f0" }}
                />
                <Text
                  style={{
                    paddingHorizontal: 16,
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: "500",
                  }}
                >
                  OU CONTINUE COM
                </Text>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#e2e8f0" }}
                />
              </View>

              {/* Social Login Buttons */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    borderWidth: 2,
                    borderColor: "#e2e8f0",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  <Ionicons name="logo-google" size={20} color="#EA4335" />
                  {isDesktop && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1e293b",
                        marginLeft: 8,
                      }}
                    >
                      Google
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    borderWidth: 2,
                    borderColor: "#e2e8f0",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    opacity: 0.5,
                  }}
                  onPress={() =>
                    Alert.alert("Em breve", "Login com Apple em breve")
                  }
                >
                  <Ionicons name="logo-apple" size={20} color="#000000" />
                  {isDesktop && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1e293b",
                        marginLeft: 8,
                      }}
                    >
                      Apple
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Register Link */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 16,
                }}
              >
                <Text style={{ fontSize: 15, color: "#64748b" }}>
                  Não tem uma conta?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#0ea5e9",
                    }}
                  >
                    Cadastre-se grátis
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Trust Indicators */}
              {!isDesktop && (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 24,
                    borderTopWidth: 1,
                    borderTopColor: "#f1f5f9",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#10b981"
                    />
                    <Text
                      style={{ fontSize: 13, color: "#64748b", marginLeft: 6 }}
                    >
                      Seus dados estão seguros e criptografados
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      marginTop: 8,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#fbbf24",
                        }}
                      >
                        ★★★★★
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          marginLeft: 4,
                        }}
                      >
                        4.9
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: "#cbd5e1" }}>•</Text>
                    <Text style={{ fontSize: 13, color: "#64748b" }}>
                      10k+ usuários
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default LoginScreen;
