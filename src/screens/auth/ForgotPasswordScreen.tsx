import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import authService from '../../services/auth.service';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira seu email');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar o email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 justify-center">
          {/* Success Icon */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-emerald-100 items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text className="text-3xl font-bold text-slate-800 mb-3 text-center">
              Email Enviado!
            </Text>
            <Text className="text-base text-slate-600 text-center leading-6">
              Enviamos as instruções para redefinir sua senha para{' '}
              <Text className="font-semibold text-slate-800">{email}</Text>
            </Text>
          </View>

          {/* Info Card */}
          <View className="bg-sky-50 rounded-2xl p-6 mb-8 border-2 border-sky-200">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#0ea5e9" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-sky-900 mb-2">
                  Próximos passos:
                </Text>
                <Text className="text-sm text-sky-800 leading-5">
                  1. Verifique sua caixa de entrada{'\n'}
                  2. Clique no link do email{'\n'}
                  3. Crie uma nova senha{'\n'}
                  4. Faça login novamente
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl py-4 mb-3"
            style={{
              shadowColor: '#0ea5e9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-center text-base font-bold">
              Voltar para Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEmailSent(false)}
            className="py-4"
          >
            <Text className="text-sky-600 text-center text-sm font-semibold">
              Reenviar email
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-8 pb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mb-6"
            >
              <Ionicons name="arrow-back" size={20} color="#475569" />
            </TouchableOpacity>
            <View className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-500 items-center justify-center mb-6">
              <Ionicons name="key" size={32} color="white" />
            </View>
            <Text className="text-4xl font-bold text-slate-800 mb-2">
              Esqueceu a senha?
            </Text>
            <Text className="text-base text-slate-500">
              Sem problemas! Digite seu email e enviaremos instruções para redefinir sua senha
            </Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-700 mb-2">
                Email
              </Text>
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border-2 border-slate-200">
                <Ionicons name="mail-outline" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-slate-800"
                  placeholder="seu@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            </View>

            {/* Info Card */}
            <View className="bg-amber-50 rounded-2xl p-4 mb-6 border-2 border-amber-200">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
                <Text className="flex-1 ml-3 text-sm text-amber-800 leading-5">
                  Você receberá um email com um link seguro para redefinir sua senha. 
                  O link expira em 1 hora.
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl py-4 mb-4"
              style={{
                shadowColor: '#0ea5e9',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-base font-bold">
                  Enviar Instruções
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="flex-row items-center justify-center py-6"
            >
              <Ionicons name="arrow-back" size={16} color="#0ea5e9" />
              <Text className="ml-2 text-sm font-semibold text-sky-600">
                Voltar para Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;