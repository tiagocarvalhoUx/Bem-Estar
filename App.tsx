/**
 * App.tsx
 * 
 * Componente raiz do aplicativo Bem-Estar
 * Configura providers, notificações e navegação principal
 */

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/contexts/AuthContext';
import { PomodoroProvider } from './src/contexts/PomodoroContext';
import RootNavigator from './src/navigation/RootNavigator';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    // Solicitar permissões de notificação ao iniciar
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de notificação negada');
      }
    };

    requestPermissions();
  }, []);

  return (
    <AuthProvider>
      <PomodoroProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </PomodoroProvider>
    </AuthProvider>
  );
}