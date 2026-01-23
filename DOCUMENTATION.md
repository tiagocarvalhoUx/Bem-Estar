# 📖 Documentação Técnica - Bem-Estar

## 🏗️ Arquitetura

### Estrutura de Pastas

```
bem-estar/
├── src/
│   ├── components/      # Componentes reutilizáveis de UI
│   ├── contexts/        # React Context para estado global
│   ├── firebase/        # Configuração e inicialização do Firebase
│   ├── hooks/          # Custom hooks para lógica reutilizável
│   ├── navigation/     # Configuração de navegação
│   ├── screens/        # Telas do aplicativo
│   ├── services/       # Lógica de negócio e APIs
│   ├── types/          # Definições de tipos TypeScript
│   └── utils/          # Funções utilitárias
```

## 🔄 Fluxo de Dados

### Autenticação
```
Usuario → LoginScreen → AuthService → Firebase Auth
                                          ↓
                                    AuthContext
                                          ↓
                                  RootNavigator
```

### Timer Pomodoro
```
HomeScreen → PomodoroContext → Timer Logic
                 ↓
          Notifications + Haptics
                 ↓
          FirestoreService → Firebase
```

### Sistema de IA
```
UserData → AIService.analyzePatterns() → Insights
                 ↓
         useAI() hook → Suggestions
                 ↓
         HomeScreen/StatisticsScreen
```

## 📦 Principais Módulos

### 1. Contexts

#### AuthContext
**Arquivo**: `src/contexts/AuthContext.tsx`

Gerencia autenticação e perfil do usuário.

**Estado**:
- `user`: Perfil completo do usuário
- `loading`: Estado de carregamento

**Métodos**:
- `signIn(email, password)`: Login
- `signUp(email, password, displayName)`: Registro
- `signOut()`: Logout
- `resetPassword(email)`: Recuperar senha

#### PomodoroContext
**Arquivo**: `src/contexts/PomodoroContext.tsx`

Gerencia timer Pomodoro e sessões.

**Estado**:
- `currentMode`: Modo atual (work/shortBreak/longBreak)
- `timeRemaining`: Tempo restante em segundos
- `status`: Status do timer (idle/running/paused/completed)
- `completedSessions`: Contador de sessões

**Métodos**:
- `startTimer()`: Iniciar timer
- `pauseTimer()`: Pausar timer
- `resetTimer()`: Resetar timer
- `skipTimer()`: Pular para próximo
- `switchMode(mode)`: Mudar modo

### 2. Services

#### AuthService
**Arquivo**: `src/services/auth.service.ts`

Gerencia autenticação com Firebase.

**Métodos principais**:
```typescript
- login(email, password): Promise<User>
- register(email, password, displayName): Promise<User>
- signInWithGoogle(): Promise<User>
- resetPassword(email): Promise<void>
- updateUserProfile(userId, data): Promise<void>
```

#### FirestoreService
**Arquivo**: `src/services/firestore.service.ts`

Gerencia operações com Firestore.

**Métodos principais**:
```typescript
- savePomodoroSession(session): Promise<string>
- getUserSessions(userId, limit): Promise<PomodoroSession[]>
- saveMoodEntry(mood): Promise<string>
- getUserMoodEntries(userId, limit): Promise<MoodEntry[]>
- updateUserPreferences(userId, prefs): Promise<void>
- updateUserStatistics(userId, stats): Promise<void>
```

#### AIService
**Arquivo**: `src/services/ai.service.ts`

Sistema de inteligência artificial para análise e sugestões.

**Métodos principais**:
```typescript
- analyzeProductivityPatterns(sessions): ProductivityPattern
- generateSuggestions(user, sessions, moods): AISuggestion[]
- suggestOptimalSessionDuration(sessions): number
- predictBestTimeForNextSession(sessions): Date | null
- detectBurnoutRisk(sessions, moods): BurnoutRisk
```

### 3. Hooks Personalizados

#### useAI
**Arquivo**: `src/hooks/useAI.ts`

Hook para usar funcionalidades de IA.

**Retorno**:
```typescript
{
  suggestions: AISuggestion[]      // Sugestões ativas
  loading: boolean                  // Estado de carregamento
  burnoutRisk: BurnoutRisk | null  // Risco de burnout
  generateSuggestions(): void      // Gerar novas sugestões
  dismissSuggestion(id): void      // Descartar sugestão
  acceptSuggestion(id): void       // Aceitar sugestão
  getOptimalDuration(): number     // Duração ideal
  predictNextSessionTime(): Date   // Melhor horário
  analyzePatterns(): Pattern       // Análise de padrões
}
```

#### useProductivityAnalysis
**Arquivo**: `src/hooks/useAI.ts`

Hook para análise de produtividade.

**Retorno**:
```typescript
{
  patterns: {
    bestTimeOfDay: string
    averageSessionsPerDay: number
    mostProductiveDay: string
    productivityTrend: 'improving' | 'stable' | 'declining'
  }
  loading: boolean
  refresh(): void
}
```

## 🎯 Principais Funcionalidades

### Timer Pomodoro

**Ciclo completo**:
1. Trabalho (25 min padrão)
2. Pausa curta (5 min)
3. Após 4 ciclos → Pausa longa (15 min)

**Recursos**:
- Contagem regressiva precisa
- Notificações ao completar
- Feedback háptico
- Som de conclusão
- Salvamento automático no Firestore

### Sistema de IA

**Análise de Padrões**:
```typescript
// Identifica:
- Melhor horário do dia (manhã/tarde/noite/madrugada)
- Média de sessões por dia
- Dia mais produtivo da semana
- Tendência de produtividade
```

**Tipos de Sugestões**:
1. **OPTIMAL_TIME**: Horários ideais baseados em histórico
2. **BREAK_REMINDER**: Lembretes de pausa quando necessário
3. **PRODUCTIVITY_TIP**: Dicas baseadas em tendências
4. **MOOD_CHECK**: Check-in de humor
5. **GOAL_ADJUSTMENT**: Ajuste de metas realistas

**Detecção de Burnout**:
```typescript
Analisa:
- Taxa de interrupções
- Humor médio
- Volume de sessões
- Tendência de produtividade

Classifica risco: low | medium | high
```

## 🔐 Segurança

### Variáveis de Ambiente
- Credenciais Firebase em `.env` (não commitado)
- Carregadas via `expo-constants`
- Template em `.env.example`

### Regras Firestore
```javascript
// Usuários só acessam seus próprios dados
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Sessões verificam ownership
match /pomodoro_sessions/{sessionId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}
```

## 📊 Tipos TypeScript

### Principais Interfaces

```typescript
// Usuário
interface UserProfile {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
  preferences: UserPreferences
  statistics: UserStatistics
}

// Sessão Pomodoro
interface PomodoroSession {
  id: string
  userId: string
  mode: PomodoroMode
  duration: number
  completedAt: Date
  interruptions: number
  productivity?: number
  moodBefore?: MoodLevel
  moodAfter?: MoodLevel
}

// Sugestão de IA
interface AISuggestion {
  id: string
  userId: string
  type: SuggestionType
  message: string
  confidence: number
  reasons: string[]
  createdAt: Date
  dismissed: boolean
  accepted?: boolean
}
```

## 🎨 Styling

### NativeWind (TailwindCSS)

Uso de classes CSS diretamente nos componentes:

```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-800">
    Título
  </Text>
</View>
```

**Cores customizadas** em `tailwind.config.js`:
- `primary`: Cor principal do app
- `pomodoro.work`: Sessões de trabalho
- `pomodoro.shortBreak`: Pausas curtas
- `pomodoro.longBreak`: Pausas longas

## 🧪 Testes (Futuro)

### Estrutura sugerida
```
src/
├── __tests__/
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── firestore.service.test.ts
│   │   └── ai.service.test.ts
│   ├── hooks/
│   │   └── useAI.test.ts
│   └── utils/
│       ├── timeHelpers.test.ts
│       └── statisticsHelpers.test.ts
```

## 📈 Métricas e Analytics

### Dados coletados
- Sessões completadas
- Tempo total de foco
- Streaks (dias consecutivos)
- Humor médio
- Produtividade média
- Padrões de uso

### Análises disponíveis
- Melhor horário do dia
- Dia mais produtivo
- Tendências ao longo do tempo
- Correlação humor x produtividade

## 🚀 Performance

### Otimizações implementadas
- Lazy loading de componentes
- Memoização com `useMemo` e `useCallback`
- Debounce em buscas e inputs
- Paginação em listas grandes
- Cache de dados do Firestore

### Boas práticas
- Evitar re-renders desnecessários
- Usar FlatList para listas
- Otimizar imagens
- Minimizar cálculos pesados

## 🔄 Atualizações Futuras

### Roadmap
- [ ] Push notifications programadas
- [ ] Integração com calendário
- [ ] Sincronização offline
- [ ] Temas customizados
- [ ] Widgets para home screen
- [ ] Apple Watch / Wear OS
- [ ] Análise avançada de IA com ML
- [ ] Gamificação e conquistas
- [ ] Compartilhamento social
- [ ] Exportar dados (PDF, CSV)

## 📚 Recursos Adicionais

### Documentação Externa
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Firebase](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)

### Comunidade
- Stack Overflow
- Discord da comunidade React Native
- GitHub Issues

## 🤝 Contribuindo

### Como contribuir
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de código
- Use TypeScript strict mode
- Siga as convenções ESLint
- Documente funções complexas
- Escreva testes quando possível
- Use commits semânticos

---

**Desenvolvido com ❤️ para produtividade e bem-estar**
