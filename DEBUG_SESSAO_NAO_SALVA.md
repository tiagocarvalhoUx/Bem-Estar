# 🐛 Debug: Sessão não sendo salva

## ❌ Problema Identificado

Após completar 25 minutos do timer, o console mostra:

```
totalSessions: 0  ❌ (deveria ser 1)
totalMoods: 1     ✅ (funcionando)
```

A sessão foi completada mas **NÃO foi salva no Firebase**.

---

## 🔍 Logs Adicionados

Acabei de adicionar logs detalhados no `PomodoroContext` para rastrear exatamente onde o problema está:

### 1. Ao completar timer:

```javascript
"PomodoroContext: Timer completado! {
  mode: "WORK",
  hasUser: true/false,
  willSaveSession: true/false
}"
```

### 2. Se NÃO salvar:

```javascript
"PomodoroContext: NÃO salvando sessão porque: {
  isWorkMode: true/false,
  hasUser: true/false,
  currentMode: "..."
}"
```

### 3. Se salvar (passo a passo):

```javascript
"PomodoroContext: Salvando sessão de trabalho...";
"PomodoroContext: Salvando sessão no Firestore... { userId, mode, duration }";
"PomodoroContext: Chamando firestoreService.savePomodoroSession...";
"PomodoroContext: SessionId retornado: abc123";
"PomodoroContext: Atualizando estado local com nova sessão...";
"PomodoroContext: Sessão salva com sucesso! abc123 Total agora: 1";
```

### 4. Se houver ERRO:

```javascript
"PomodoroContext: ERRO ao salvar sessão: [mensagem de erro]";
"PomodoroContext: Stack trace: ...";
```

---

## 🧪 Como Testar Agora

### Passo 1: Limpar cache e reiniciar

```powershell
# No terminal:
npx expo start -c
```

### Passo 2: Abrir Console

1. Abra o app no navegador (pressione `w`)
2. Abra DevTools (F12)
3. Vá para aba "Console"
4. Limpe o console (botão 🚫)

### Passo 3: Completar uma sessão

1. Vá para a aba Timer
2. Inicie o timer (modo WORK)
3. Aguarde completar OU clique em "Pular"
4. **OBSERVE O CONSOLE ATENTAMENTE**

### Passo 4: Analisar os logs

**Cenário A - Usuário não autenticado:**

```
❌ "PomodoroContext: NÃO salvando sessão porque: { hasUser: false }"
```

**Solução**: Você precisa fazer login!

**Cenário B - Modo incorreto:**

```
❌ "PomodoroContext: NÃO salvando sessão porque: { isWorkMode: false, currentMode: "SHORT_BREAK" }"
```

**Solução**: Certifique-se de que o timer está em modo "Trabalho" (WORK)

**Cenário C - Erro no Firebase:**

```
❌ "PomodoroContext: ERRO ao salvar sessão: [erro]"
```

**Solução**: Veja a mensagem de erro específica

**Cenário D - Tudo funcionou:**

```
✅ "PomodoroContext: Sessão salva com sucesso! abc123 Total agora: 1"
```

Mas ainda mostra `totalSessions: 0` → Problema de sincronização entre contextos

---

## 🔧 Possíveis Causas

### 1. Usuário não está autenticado

**Como verificar:**

- O console mostra `hasUser: false`
- Tente fazer logout e login novamente

### 2. Modo do timer não é WORK

**Como verificar:**

- O console mostra `isWorkMode: false`
- Certifique-se de iniciar em modo "Trabalho" (ícone vermelho)

### 3. Erro de permissões do Firebase

**Como verificar:**

- O console mostra erro do Firebase
- Verifique as regras do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pomodoro_sessions/{sessionId} {
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Erro na função savePomodoroSession

**Como verificar:**

- O console mostra erro no firestoreService
- Possível problema: Timestamp conversion

### 5. Sessions array não atualiza na UI

**Como verificar:**

- Console mostra "Sessão salva com sucesso!"
- Mas `totalSessions: 0` continua
- **Causa**: As telas estão lendo `sessions` antes da atualização

---

## 🎯 Próximos Passos

### Se o erro for "hasUser: false":

```typescript
// Verificar no console:
console.log("User:", user);
```

Se `user` for `null`, você precisa fazer login.

### Se o erro for de Firebase:

```typescript
// Erro comum: "Missing or insufficient permissions"
// Solução: Atualizar regras do Firestore (veja acima)
```

### Se a sessão salvar mas não aparecer:

```typescript
// Problema de timing
// As telas calculam stats ANTES do contexto atualizar
// Solução: Adicionar useEffect para escutar mudanças
```

---

## 📊 Verificação no Firebase Console

Após completar a sessão:

1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Firestore Database
4. Collection `pomodoro_sessions`
5. **Procure um documento novo com:**
   - `userId`: seu user id
   - `mode`: "WORK"
   - `completedAt`: timestamp de agora
   - `duration`: 1500 (25 min em segundos)

**Se o documento EXISTE:**
✅ Salvamento funcionou!
❌ Problema é na leitura/sincronização

**Se o documento NÃO EXISTE:**
❌ Salvamento falhou
→ Veja os logs de erro no console

---

## 🚨 IMPORTANTE

Depois de completar a sessão com os novos logs, **COPIE E COLE AQUI:**

1. Todos os logs que começam com "PomodoroContext:"
2. Qualquer erro em vermelho
3. Screenshot do Firebase Console (collection pomodoro_sessions)

Com essas informações, posso identificar EXATAMENTE onde está o problema! 🎯
