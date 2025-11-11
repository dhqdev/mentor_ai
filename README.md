# 🧠 MentorIA - Seu Professor Inteligente

**Slogan:** *"Aprenda qualquer coisa, do seu jeito."*

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)
![AI](https://img.shields.io/badge/AI-Gemini-orange.svg)

## 🎯 Sobre o Projeto

MentorIA é um aplicativo educacional revolucionário que usa Inteligência Artificial para ensinar qualquer tema de forma personalizada. Adapta a linguagem, gera explicações claras, cria quizzes inteligentes e até narra o conteúdo com voz natural!

## ✨ Funcionalidades Principais

### 📚 Explicação Personalizada com Mapa Mental 🧠
- Digite ou fale o tema que deseja aprender
- Escolha o nível (criança, adolescente, adulto)
- Selecione o estilo (didático, simples, técnico, divertido)
- Receba explicação completa, resumo e pontos-chave
- **NOVO:** Visualize em Mapa Mental interativo!
- Alterne entre modo Texto e Mapa Mental

### 🎙️ Voz Natural
- Narração em português brasileiro
- Velocidade e tom ajustáveis
- Pausar/retomar a qualquer momento
- **NOVO:** Botões flutuantes (FAB) para acesso rápido

### 🎯 Quiz Inteligente
- Geração automática de perguntas
- 4 perguntas de múltipla escolha
- Feedback imediato com explicações
- Sistema de pontuação

### 📊 Histórico & Estatísticas
- Todas as explicações salvas localmente
- Favoritos para acesso rápido
- Estatísticas de aprendizado
- Temas mais estudados

### 👑 Sistema Premium
- **Gratuito**: 5 explicações por dia
- **Premium (R$ 14,90/mês)**: 
  - Explicações ilimitadas
  - Voz premium
  - Imagens HD
  - Estatísticas avançadas
  - Sem anúncios

## 🛠️ Tecnologias Utilizadas

```javascript
{
  "frontend": "React Native (Expo)",
  "navegacao": "React Navigation",
  "armazenamento": "AsyncStorage",
  "ia_texto": "Google Gemini API",
  "ia_voz": "Expo Speech (TTS)",
  "animacoes": "React Native Animatable",
  "design": "Linear Gradient, Custom UI"
}
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Expo Go (app no celular)

### Instalação

```bash
# Clone o repositório (ou já está na pasta)
cd mentor_ai

# Instalar dependências (já instaladas)
npm install

# Iniciar o projeto
npm start
```

### ⚠️ Correção Aplicada

Se você encontrou o erro `TypeError: expected dynamic type 'boolean'`, ele já foi corrigido!

**Para recarregar o app:**
- Pressione `r` no terminal Expo
- Ou sacuda o dispositivo e selecione "Reload"

### Executar no Dispositivo

1. **Android**: Pressione `a` ou escaneie o QR code com Expo Go
2. **iOS**: Pressione `i` ou escaneie o QR code com a câmera
3. **Web**: Pressione `w` para abrir no navegador

## 📱 Estrutura do Projeto

```
mentor_ai/
├── App.js                      # Entrada principal
├── src/
│   ├── screens/               # Telas do app
│   │   ├── HomeScreen.js      # Tela inicial
│   │   ├── ExplanationScreen.js  # Explicação detalhada
│   │   ├── QuizScreen.js      # Quiz interativo
│   │   ├── HistoryScreen.js   # Histórico e favoritos
│   │   └── ProfileScreen.js   # Perfil e premium
│   ├── navigation/
│   │   └── AppNavigation.js   # Configuração de rotas
│   ├── services/
│   │   ├── geminiService.js   # Integração Gemini AI
│   │   ├── ttsService.js      # Text-to-Speech
│   │   └── storageService.js  # Persistência local
│   ├── contexts/
│   │   └── AppContext.js      # Estado global
│   └── utils/
│       └── theme.js           # Cores e estilos
```

## 🎨 Design System

### Cores

```javascript
PRIMARY: '#6C63FF'      // Azul/Roxo principal
SECONDARY: '#A78BFA'    // Lilás
ACCENT: '#EC4899'       // Rosa/Magenta
BACKGROUND: '#F8F9FF'   // Fundo suave
```

### Tipografia

- **Headers**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Small**: 12px

## 🔑 API Keys

O app usa a API do Google Gemini. A chave está configurada em:

```javascript
// src/services/geminiService.js
const API_KEY = 'AIzaSyCd7DtnbtYgGOk0iFsbN72j7fFyYcEldE0';
```

⚠️ **Importante**: Em produção, use variáveis de ambiente!

## 📋 Roadmap Futuro

- [ ] 🎮 Gamificação (XP, medalhas, níveis)
- [ ] 👥 Desafios entre amigos
- [ ] 🖼️ Geração de imagens educativas (DALL·E)
- [ ] 🔊 Reconhecimento de voz
- [ ] 🌐 Modo offline
- [ ] 📱 Notificações de estudo
- [ ] 🎯 Modo "Explicador de Provas"
- [ ] 🥽 AR/VR para conceitos 3D

## 🧪 Testando Recursos

### Testar Premium (Demo)

1. Vá em **Perfil**
2. Clique em **"Assinar Premium"**
3. Selecione **"Ativar Demo"**
4. Agora você tem acesso ilimitado!

### Exemplos de Temas

- "Explique a Revolução Francesa"
- "Como funciona a fotossíntese?"
- "O que é React Native?"
- "História do Brasil resumida"

## 📄 Licença

MIT License - Livre para uso educacional e comercial

## 👨‍💻 Desenvolvedor

Criado com ❤️ usando Inteligência Artificial

---

### 🎉 Comece agora!

```bash
npm start
```

Abra o Expo Go no celular e escaneie o QR code!

**Aprenda qualquer coisa, do seu jeito! 🚀**
