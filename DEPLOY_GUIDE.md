# 🚀 Guia de Deploy na Vercel - Bem-Estar App

## 📋 Pré-requisitos Completos

Antes de fazer o deploy, certifique-se de ter:

✅ Conta na Vercel (https://vercel.com)
✅ Repositório GitHub conectado
✅ Credenciais do Firebase prontas

---

## 🔧 Passo a Passo Completo

### 1️⃣ Acesse a Vercel

- Vá para https://vercel.com
- Faça login com sua conta GitHub

### 2️⃣ Importe o Projeto

1. Clique em **"Add New Project"**
2. Clique em **"Import Git Repository"**
3. Selecione o repositório **"Bem-Estar"**
4. Clique em **"Import"**

### 3️⃣ Configure o Projeto

**Framework Preset:** Deixe como "Other" ou "Vite"

**Build Command:**

```
npx expo export:web
```

**Output Directory:**

```
dist
```

**Install Command:**

```
npm install
```

### 4️⃣ Adicione as Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBWvE5YqpZ7by0hEktfnf5XPVUzQh_8EEM
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=bem-star-eb9a0.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=bem-star-eb9a0
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=bem-star-eb9a0.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=766082419555
EXPO_PUBLIC_FIREBASE_APP_ID=1:766082419555:web:70cb51d8fb5be9fa488844
```

**⚠️ IMPORTANTE:**

- Selecione **"Production"**, **"Preview"** e **"Development"** para todas as variáveis
- Clique em **"Add"** para cada variável

### 5️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde a build (pode levar 3-5 minutos)
3. Se der erro, vá para o próximo passo

---

## 🔧 Se o Build Falhar

### Opção A: Ajustar Configurações na Vercel

1. Vá em **Settings** → **General**
2. **Framework Preset:** Other
3. **Build Command:** `npx expo export --platform web`
4. **Output Directory:** `dist`
5. Clique em **Save**
6. Vá em **Deployments** → Clique nos 3 pontos → **Redeploy**

### Opção B: Via CLI (Mais Confiável)

1. Instale a Vercel CLI:

```bash
npm i -g vercel
```

2. Faça login:

```bash
vercel login
```

3. No diretório do projeto, execute:

```bash
vercel
```

4. Responda as perguntas:

- Set up and deploy? **Y**
- Which scope? (sua conta)
- Link to existing project? **N**
- Project name? **bem-estar**
- In which directory? **.**
- Override settings? **Y**
  - Build Command? `npx expo export --platform web`
  - Output Directory? `dist`
  - Development Command? `npm run web`

5. Para produção:

```bash
vercel --prod
```

---

## 📊 Monitorando o Deploy

Depois do deploy, você verá:

- ✅ **Status:** Ready
- 🌐 **URL:** https://bem-estar-xyz.vercel.app
- 📊 **Logs:** Clique em "View Deployment" para ver logs

---

## 🐛 Troubleshooting

### Erro: "Command failed: npx expo export:web"

**Solução:** Use `npx expo export --platform web` ao invés

### Erro: "FIREBASE_API_KEY is not defined"

**Solução:** Verifique se todas as variáveis de ambiente foram adicionadas com o prefixo `EXPO_PUBLIC_`

### Erro 404 após deploy

**Solução:**

1. Verifique se o `vercel.json` está commitado
2. Verifique se o output directory está como `dist`
3. Redeploy o projeto

### Build trava em "Building..."

**Solução:**

1. Cancele o deploy
2. Use a Vercel CLI (método mais estável)

---

## ✅ Verificação Final

Depois do deploy bem-sucedido:

1. ✅ Acesse a URL fornecida
2. ✅ Teste o login
3. ✅ Verifique se o Firebase está conectado
4. ✅ Teste as funcionalidades principais

---

## 🎉 Deploy Automático

Após o primeiro deploy:

- ✅ Cada `git push` na branch `main` dispara deploy automático
- ✅ Pull requests geram preview deployments
- ✅ Rollback fácil através do dashboard

---

## 📞 Suporte

Se continuar com problemas:

1. Verifique os logs no dashboard da Vercel
2. Verifique se o Firebase está configurado corretamente
3. Entre em contato com suporte da Vercel: https://vercel.com/support

---

**Boa sorte com o deploy! 🚀**
