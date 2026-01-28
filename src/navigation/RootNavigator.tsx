import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { RootStackParamList } from "../types";

// Importar navigators
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

// Components de carregamento
import { View, ActivityIndicator } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  // Log para debug
  React.useEffect(() => {
    console.log(
      "RootNavigator: Estado do usuário:",
      user ? "LOGADO" : "DESLOGADO",
    );
    console.log("RootNavigator: Loading:", loading);
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  console.log("RootNavigator: Renderizando tela:", user ? "Main" : "Auth");

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default RootNavigator;
