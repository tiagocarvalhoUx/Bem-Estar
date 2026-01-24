# 📱 Guia Mobile - Bem-Estar App

## 🚀 3 Formas de Usar no Celular

---

## 1️⃣ Expo Go (Mais Rápido - Recomendado)

### ✅ Vantagens:
- ⚡ Instantâneo (0 configuração)
- 🔄 Hot reload ao vivo
- 🆓 Completamente grátis
- 🌐 Funciona em qualquer celular

### 📲 Passo a Passo:

#### No Celular:
1. Baixe o **Expo Go**:
   - **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
   - **iOS**: https://apps.apple.com/app/expo-go/id982107779

#### No Computador:
2. Abra o terminal no projeto:
```bash
npm start
```

3. **Escaneie o QR Code** que aparecer:
   - **Android**: Abra o Expo Go → "Scan QR Code"
   - **iOS**: Use a Câmera nativa do iPhone

4. **Pronto!** O app abrirá no seu celular 🎉

---

## 2️⃣ APK Android (Instalável)

### ✅ Vantagens:
- 📦 Arquivo .apk instalável
- 🚫 Não precisa de Expo Go
- 📴 Funciona offline
- 🎁 Pode compartilhar o arquivo

### 📲 Passo a Passo:

1. **Instale o EAS CLI** (se ainda não tem):
```bash
npm install -g eas-cli
```

2. **Faça login no Expo**:
```bash
eas login
```
- Se não tem conta: https://expo.dev/signup

3. **Configure o projeto** (primeira vez):
```bash
eas build:configure
```

4. **Gere o APK**:
```bash
eas build -p android --profile preview
```

5. **Aguarde** (5-10 minutos)
   - Você verá o progresso no terminal
   - Ou acompanhe em: https://expo.dev/accounts/[seu-usuario]/projects/pomodoroai/builds

6. **Baixe o APK**:
   - Link aparecerá no terminal
   - Ou acesse: https://expo.dev → Seu projeto → Builds
   - Clique em "Download" no build concluído

7. **Instale no Android**:
   - Transfira o APK pro celular
   - Abra o arquivo
   - Permita "Instalar de fontes desconhecidas" se pedir
   - Instale e use! 🎉

---

## 3️⃣ IPA iOS (iPhone/iPad)

### ✅ Vantagens:
- 📦 App nativo iOS
- 🚫 Não precisa de Expo Go
- 📴 Funciona offline

### 📲 Passo a Passo:

1. **Gere o IPA**:
```bash
eas build -p ios --profile preview
```

2. **Aguarde** (10-15 minutos)

3. **Instale via TestFlight**:
   - Você precisa de uma conta Apple Developer (US$99/ano)
   - Ou use "Ad Hoc" distribution para testar

4. **Alternativa Grátis**: Use Expo Go (Opção 1)

---

## 📊 Comparação

| Método | Tempo | Custo | Facilidade | Offline |
|--------|-------|-------|------------|---------|
| **Expo Go** | 2 min | 🆓 | ⭐⭐⭐⭐⭐ | ❌ |
| **APK Android** | 10 min | 🆓 | ⭐⭐⭐⭐ | ✅ |
| **IPA iOS** | 15 min | 💰 | ⭐⭐⭐ | ✅ |

---

## 🎯 Recomendação

### Para Testar/Desenvolver:
👉 **Use Expo Go** (Opção 1)
- Mais rápido
- Sem complicação
- Ideal para demonstrações

### Para Distribuir:
👉 **Android: APK** (Opção 2)
- Qualquer pessoa pode instalar
- Não precisa Google Play

👉 **iOS: TestFlight** (Opção 3)
- Precisa de Apple Developer
- Ou continue com Expo Go

---

## 🐛 Problemas Comuns

### "Não consigo escanear o QR Code"
**Solução:**
- Certifique-se que celular e PC estão na mesma rede Wi-Fi
- Ou use: `npx expo start --tunnel`

### "Build failed no EAS"
**Solução:**
- Verifique se está logado: `eas whoami`
- Tente novamente: `eas build -p android --profile preview --clear-cache`

### "Expo Go não abre o app"
**Solução:**
- Atualize o Expo Go para última versão
- Reinicie o servidor: `npm start`

---

## 📦 Publicar na Loja

### Google Play Store (Android)

1. **Gere AAB**:
```bash
eas build -p android --profile production
```

2. **Configure credenciais**:
```bash
eas credentials
```

3. **Submit**:
```bash
eas submit -p android
```

### Apple App Store (iOS)

1. **Gere IPA**:
```bash
eas build -p ios --profile production
```

2. **Submit**:
```bash
eas submit -p ios
```

---

## 💡 Dicas

- 🔄 Builds ficam salvos em https://expo.dev por 6 meses
- 📱 Você pode gerar builds ilimitados (grátis)
- 🎯 Use `--profile preview` para testes
- 🚀 Use `--profile production` para produção
- 📊 Monitore builds em tempo real no dashboard

---

## 🆘 Ajuda

- 📚 Documentação EAS: https://docs.expo.dev/build/introduction/
- 💬 Discord Expo: https://discord.gg/expo
- 🐛 Issues: https://github.com/tiagocarvalhoUx/Bem-Estar/issues

---

**Qualquer dúvida, consulte este guia ou abra uma issue no GitHub!** 🚀
