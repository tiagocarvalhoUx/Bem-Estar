# 🔒 Configurar Regras de Segurança do Firestore

## Problema

O app está travando ao tentar salvar sessões no Firestore porque as **regras de segurança** estão bloqueando a escrita.

## Solução

### 1. Acesse o Firebase Console

1. Vá para: https://console.firebase.google.com
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)

### 2. Configure as Regras

Substitua as regras existentes por estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Regras para sessões Pomodoro
    match /pomodoro_sessions/{session} {
      // Usuários autenticados podem ler e escrever suas próprias sessões
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Regras para registros de humor
    match /mood_entries/{mood} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Regras para perfis de usuário
    match /users/{userId} {
      // Usuários podem ler e editar apenas seu próprio perfil
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regras para sugestões de IA
    match /ai_suggestions/{suggestion} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Publique as Regras

1. Clique em **Publicar** (Publish)
2. Confirme a publicação

### 4. Teste Novamente

1. Volte ao app
2. Recarregue a página (Ctrl+R ou Cmd+R)
3. Complete uma sessão de 2 minutos
4. Verifique se aparece: `"FirestoreService: addDoc concluído! ID: xxx"`

## 🚨 Regras para Desenvolvimento (APENAS PARA TESTES)

**ATENÇÃO:** Use estas regras APENAS durante o desenvolvimento. **NUNCA em produção!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Verificação

Após configurar, você deve ver estes logs no console:

✅ `FirestoreService: Objeto preparado, chamando addDoc...`  
✅ `FirestoreService: addDoc concluído! ID: xxxxxxxxx`  
✅ `PomodoroContext: SessionId retornado: xxxxxxxxx`  
✅ `PomodoroContext: Sessão salva com sucesso!`  
✅ `AIInsights: Chamando aiService.generateSuggestions...`  
✅ `AIService: Criando sugestão de boas-vindas`

## Problemas Comuns

### Erro: "permission-denied"

- As regras estão bloqueando a operação
- Verifique se o usuário está autenticado
- Confirme que o `userId` no documento corresponde ao `request.auth.uid`

### Timeout após 10 segundos

- Problema de conexão com Firebase
- Verifique se as credenciais no `.env` estão corretas
- Confirme que o projeto Firebase está ativo

### Dados não aparecem após salvar

- Verifique no Firebase Console → Firestore Database → Data
- Se os dados estão lá mas não aparecem no app, o problema é no carregamento (regras de leitura)
