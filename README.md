# 🧘 Bem-Estar - Pomodoro AI

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)

**Um aplicativo de produtividade e bem-estar com IA integrada**

[Características](#-características) • [Tecnologias](#-tecnologias) • [Instalação](#-instalação) • [Estrutura](#-estrutura-do-projeto) • [Licença](#-licença)

</div>

---

## 📖 Sobre o Projeto

**Bem-Estar** é um aplicativo moderno de gestão de tempo e produtividade que combina a técnica Pomodoro com recursos de bem-estar emocional e inteligência artificial. O app ajuda você a manter o foco, gerenciar tarefas, monitorar seu humor e analisar sua produtividade ao longo do tempo.

### 🎯 Objetivo

Proporcionar uma experiência completa de produtividade que não apenas gerencia seu tempo, mas também cuida do seu bem-estar mental e emocional.

---

## ✨ Características

### 🍅 Timer Pomodoro Inteligente
- ⏱️ Timer configurável (trabalho, pausa curta, pausa longa)
- 🎨 Gradientes dinâmicos baseados no modo atual
- 💫 Animações suaves e micro-interações
- 📊 Contador de sessões automático
- 🔔 Notificações de término (em desenvolvimento)

### 📈 Estatísticas Avançadas
- 📊 Gráficos interativos (Bar Chart, Donut, Radar, Heatmap)
- 📅 Análise semanal, mensal e anual
- 🔥 Mapa de calor estilo GitHub
- 🏆 Sistema de conquistas e gamificação
- 📉 Indicadores de tendência

### 😊 Registro de Humor
- 🎭 5 estados emocionais (Muito Feliz, Feliz, Neutro, Triste, Muito Triste)
- ⚡ Slider de nível de energia (1-5)
- 😰 Slider de nível de estresse (1-5)
- 📝 Notas opcionais sobre o dia
- 📊 Visualização de padrões emocionais

### 📋 Planejador de Tarefas
- ✅ Gestão completa de tarefas
- 🎯 Sistema de prioridades (Urgente, Alta, Média, Baixa)
- 🏷️ Categorias personalizadas
- ⏱️ Estimativa de pomodoros por tarefa
- 🤖 Sugestões de tarefas com IA (em desenvolvimento)

### 👤 Perfil e Gamificação
- 🏆 Sistema de conquistas
- 📊 Estatísticas de uso
- 🔥 Sistema de streaks (sequências)
- ⚙️ Configurações personalizáveis
- 🎨 Interface moderna e intuitiva

### 🔐 Autenticação
- 📧 Login com email e senha
- 🔒 Registro de novos usuários
- 🔄 Recuperação de senha
- 👤 Gerenciamento de perfil

---

## 🛠️ Tecnologias

### Frontend
- **React Native** - Framework mobile multiplataforma
- **TypeScript** - Tipagem estática
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **NativeWind** - Tailwind CSS para React Native

### Backend & Serviços
- **Firebase Authentication** - Autenticação de usuários
- **Firebase Firestore** - Banco de dados NoSQL
- **Context API** - Gerenciamento de estado

### UI/UX
- **Expo Linear Gradient** - Gradientes suaves
- **Expo Vector Icons** - Biblioteca de ícones
- **React Native SVG** - Gráficos customizados
- **Animated API** - Animações nativas

### Desenvolvimento
- **Babel** - Transpilador JavaScript
- **Metro** - Bundler do React Native
- **ESLint** - Linter de código

---

## 🚀 Instalação

### Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta Firebase (para configuração)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/tiagocarvalhoUx/Bem-Estar.git
cd Bem-Estar
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure o Firebase**

Crie um arquivo `.env` na raiz do projeto:
```env
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_auth_domain
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_STORAGE_BUCKET=seu_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
```

4. **Inicie o projeto**
```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

---

## 🌐 Deploy na Vercel

### Deploy Automático

1. **Acesse [Vercel](https://vercel.com)** e faça login com sua conta GitHub

2. **Clique em "Add New Project"**

3. **Importe o repositório** `Bem-Estar`

4. **Configure as variáveis de ambiente:**
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

5. **Clique em "Deploy"**

### Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Fazer deploy
vercel --prod
```

---

## 📂 Estrutura do Projeto

```
bem-estar/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── AnimatedProgress.tsx
│   │   ├── BarChart.tsx
│   │   ├── HeatmapCalendar.tsx
│   │   └── ...
│   ├── contexts/          # Contextos React (Estado Global)
│   │   ├── AuthContext.tsx
│   │   └── PomodoroContext.tsx
│   ├── firebase/          # Configuração Firebase
│   │   └── config.ts
│   ├── hooks/             # Custom Hooks
│   │   └── useAI.ts
│   ├── navigation/        # Navegação
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/           # Telas do aplicativo
│   │   ├── auth/          # Telas de autenticação
│   │   └── main/          # Telas principais
│   ├── services/          # Serviços e APIs
│   │   ├── ai.service.ts
│   │   ├── auth.service.ts
│   │   └── firestore.service.ts
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts
│   └── utils/             # Utilitários
│       ├── helpers.ts
│       └── statisticsHelpers.ts
├── assets/                # Imagens e recursos
├── App.tsx                # Componente raiz
└── package.json           # Dependências
```

---

## 🎨 Design System

### Cores Principais
- **Azul**: `#3b82f6` - Foco e produtividade
- **Roxo**: `#8b5cf6` - Criatividade
- **Verde**: `#10b981` - Sucesso e conquistas
- **Laranja**: `#f59e0b` - Energia e ação
- **Vermelho**: `#f43f5e` - Alertas importantes

### Tipografia
- **Pesos**: 400 (Regular), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Letter-spacing**: -0.5px para títulos

### Animações
- **Fade in**: 800ms com easing suave
- **Spring**: Tension 50, Friction 8
- **Staggered**: Delay progressivo de 80-100ms

---

## 🔮 Roadmap

### Em Desenvolvimento
- [ ] Integração completa com IA para sugestões inteligentes
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Sincronização multi-dispositivo

### Planejado
- [ ] Export de relatórios (PDF/CSV)
- [ ] Integração com calendário
- [ ] Widget para tela inicial
- [ ] Aplicativo desktop (Electron)
- [ ] Análise preditiva de produtividade
- [ ] Internacionalização (i18n)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Tiago Carvalho**

- GitHub: [@tiagocarvalhoUx](https://github.com/tiagocarvalhoUx)
- Email: tiago_carvalho07@yahoo.com.br

---

## 🙏 Agradecimentos

- Comunidade React Native
- Expo Team
- Firebase
- Todos os contribuidores open-source

---

<div align="center">

**Feito com ❤️ e ☕ por Tiago Carvalho**

⭐ Dê uma estrela se este projeto te ajudou!

</div>
