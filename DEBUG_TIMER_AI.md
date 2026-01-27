# 🐛 Debug - Timer não aparece na aba AI

## ✅ Correções Aplicadas

### 1. Logs Detalhados Adicionados

- **PomodoroContext**: Logs ao carregar e salvar sessões com detalhes completos
- **AIInsightsScreen**: Logs dos dados recebidos do contexto
- **Debug Card Visual**: Card amarelo na aba AI mostrando dados em tempo real

### 2. O que foi verificado

✅ PomodoroContext salva sessões corretamente quando timer completa (modo WORK)
✅ PomodoroContext carrega sessões do Firestore ao fazer login
✅ AIInsightsScreen lê `sessions` do contexto
✅ AIInsightsScreen atualiza quando `sessions` muda

---

## 🧪 Como Testar Agora

### Passo 1: Abrir o Console

1. Abra o app no navegador (pressione `w` no terminal Expo)
2. Abra o DevTools do navegador (F12)
3. Vá para a aba "Console"
4. Deixe o console aberto durante todos os testes

### Passo 2: Fazer Login

1. Faça login no app
2. **Verifique no console:**
   ```
   PomodoroContext: Carregando sessões do Firestore...
   PomodoroContext: Sessões carregadas: X primeiras 3: [...]
   ```
3. Anote quantas sessões foram carregadas

### Passo 3: Verificar Aba AI (ANTES)

1. Vá para a aba "AI"
2. **Procure o card amarelo de debug** no topo
3. O card deve mostrar:
   ```
   🐛 DEBUG - Dados do Contexto
   Sessões: X
   Humores: Y
   Usuário: [seu user id]
   Última sessão: [dados se existir]
   ```
4. **Verifique no console:**
   ```
   AIInsightsScreen: Renderizando
   sessionsLength: X
   sessionsData: [...]
   ```

### Passo 4: Completar uma Sessão Pomodoro

1. Vá para a aba "Timer" (Home)
2. **Inicie um timer de trabalho** (25 min)
3. **Opção A - Deixe completar** (aguarde 25 min)
4. **Opção B - Pule** (clique nos 3 pontos → Pular sessão)
5. **Verifique no console imediatamente:**
   ```
   PomodoroContext: Timer completado!
   mode: WORK
   willSaveSession: true
   PomodoroContext: Salvando sessão de trabalho...
   PomodoroContext: Salvando sessão no Firestore...
   PomodoroContext: Sessão salva com sucesso! [id] Total agora: X+1
   ```

### Passo 5: Verificar Aba AI (DEPOIS)

1. Vá para a aba "AI"
2. **Verifique o card de debug:**
   - O número de sessões deve ter aumentado em 1
   - Deve mostrar a última sessão completada
3. **Verifique no console:**
   ```
   AIInsightsScreen: Renderizando
   sessionsLength: X+1 (deve ser maior que antes)
   AIInsights: Gerando sugestões com IA...
   sessionsCount: X+1
   ```
4. **Os insights devem mudar:**
   - Se tinha 0 sessões antes: deve sair dos "insights de exemplo" para "insights personalizados"
   - Se já tinha sessões: deve atualizar os insights com a nova sessão

---

## 📊 O que Verificar no Console

### ✅ Comportamento Esperado

**Ao fazer login:**

```javascript
PomodoroContext: Carregando sessões do Firestore...
PomodoroContext: Sessões carregadas: 5 primeiras 3: [
  { id: "abc123", mode: "WORK", duration: 1500 },
  { id: "def456", mode: "WORK", duration: 1500 },
  { id: "ghi789", mode: "SHORT_BREAK", duration: 300 }
]
```

**Ao completar timer:**

```javascript
PomodoroContext: Timer completado! { mode: "WORK", hasUser: true, willSaveSession: true }
PomodoroContext: Salvando sessão de trabalho...
PomodoroContext: Salvando sessão no Firestore...
PomodoroContext: Sessão salva com sucesso! xyz123 Total agora: 6
```

**Na aba AI:**

```javascript
AIInsightsScreen: Renderizando {
  hasUser: true,
  sessionsLength: 6,
  sessionsData: [
    { id: "xyz123", mode: "WORK", duration: 1500, completedAt: "2026-01-27T..." }
  ]
}
AIInsights: Gerando sugestões com IA... {
  sessionsCount: 6,
  moodHistoryCount: 3,
  primeiras3Sessions: [...]
}
```

### ❌ Problemas Possíveis

#### Problema 1: Sessões não são salvas

**Console mostra:**

```javascript
PomodoroContext: Timer completado! { willSaveSession: false }
```

**Causa:** Usuário não está logado ou mode não é WORK
**Solução:** Verifique se está logado e se o timer está em modo "Trabalho"

#### Problema 2: Erro ao salvar no Firestore

**Console mostra:**

```javascript
Erro ao salvar sessão: [error message]
```

**Causas possíveis:**

- Firebase não configurado corretamente
- Permissões do Firestore bloqueando escrita
- Conexão com internet offline

**Solução:** Verifique:

1. Arquivo `.env` com credenciais Firebase
2. Regras do Firestore permitem `create` em `pomodoro_sessions`
3. Conexão com internet ativa

#### Problema 3: AIInsightsScreen não atualiza

**Console mostra:**

```javascript
AIInsightsScreen: Renderizando { sessionsLength: 5 }
// (mesmo após salvar nova sessão)
```

**Causa:** Contexto não está propagando mudanças
**Debug adicional:**

1. Adicione `console.log` no `setSessions` do PomodoroContext
2. Verifique se `usePomodoro()` está sendo chamado no AIInsightsScreen

#### Problema 4: Sessões aparecem mas insights não mudam

**Console mostra:**

```javascript
AIInsightsScreen: sessionsLength: 6(correto);
// Mas ainda mostra "Complete algumas sessões..."
```

**Causa:** Condição no código verificando `sessions.length === 0` mesmo com sessões
**Solução:** Verifique linha 61-64 do AIInsightsScreen

---

## 🔍 Debug Adicional no Firebase Console

### Verificar dados no Firestore:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Firestore Database**
4. Procure a collection `pomodoro_sessions`
5. Verifique se há documentos com:
   - `userId`: seu user id
   - `mode`: "WORK"
   - `completedAt`: timestamp recente
   - `duration`: 1500 (25 min em segundos)

### Verificar regras do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir que usuários autenticados salvem suas sessões
    match /pomodoro_sessions/{sessionId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /mood_entries/{entryId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🎯 Resultados Esperados

### Após completar 1 sessão WORK:

✅ Console mostra "Sessão salva com sucesso"
✅ Card de debug na aba AI mostra +1 sessão
✅ Insights mudam ou aparecem pela primeira vez
✅ Firestore console mostra novo documento

### Após completar 3+ sessões:

✅ AI gera insights personalizados reais (não exemplos)
✅ Insights mencionam padrões de produtividade
✅ Estatísticas refletem sessões completadas

---

## 🚨 Se AINDA não funcionar

### 1. Verificar estado do contexto:

Adicione no PomodoroContext após `setSessions`:

```typescript
console.log("PomodoroContext: Estado atualizado", {
  sessionsCount: sessions.length,
  ultimaSessao: sessions[0],
});
```

### 2. Verificar renderizações do AI:

O `useEffect` na linha 127 do AIInsightsScreen deve disparar quando `sessions` muda.
Adicione:

```typescript
useEffect(() => {
  console.log("AIInsights: useEffect disparado!", {
    sessionsLength: sessions?.length,
  });
  if (user && sessions !== undefined && moodHistory !== undefined) {
    generateInsights();
  }
}, [user, sessions, moodHistory]);
```

### 3. Verificar se o timer realmente está em modo WORK:

No HomeScreen, verifique se o modo está correto:

```typescript
console.log("Timer: Modo atual", currentMode);
```

### 4. Forçar refresh na aba AI:

- Puxe para baixo (pull-to-refresh) na aba AI
- Deve recarregar os insights

---

## 📝 Próximos Passos

Após testar com os logs, me envie:

1. **Screenshots** do card de debug na aba AI (antes e depois de completar sessão)
2. **Cópia do console** com os logs completos
3. **Confirme:**
   - Quantas sessões apareciam antes?
   - Quantas aparecem depois de completar uma?
   - Os insights mudaram?

Com essas informações, posso identificar exatamente onde está o problema! 🎯
