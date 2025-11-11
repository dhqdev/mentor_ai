import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../contexts/AppContext';
import { speak, stopSpeaking } from '../services/ttsService';
import OpenAI from 'openai';
import gamificationService from '../services/gamificationService';
import InteractiveMindMap from '../components/InteractiveMindMap';
import { COLORS, SHADOWS } from '../utils/theme';
import config from '../config/env';

// API Key do ChatGPT (OpenAI) - Modelo GPT-4o-mini (mais barato)
const OPENAI_API_KEY = config.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Necessário para React Native
});

export default function ExplanationScreen({ route, navigation }) {
  const { topic, explanation, ageLevel, style } = route.params;
  
  const [speaking, setSpeaking] = useState(false);
  const [viewMode, setViewMode] = useState('text');
  
  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Notes
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Plant
  const [plantStage, setPlantStage] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const growthAnim = useRef(new Animated.Value(0)).current;
  
  // Mind Map
  const [mindMapData, setMindMapData] = useState(null);

  useEffect(() => {
    loadNotes();
    loadStudyProgress();
    generateMindMap();
    
    const interval = setInterval(() => {
      setStudyTime(prev => {
        const newTime = prev + 1;
        if (newTime % 30 === 0 && plantStage < 5) {
          setPlantStage(p => Math.min(p + 1, 5));
          saveStudyProgress(plantStage + 1, newTime);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.spring(growthAnim, {
      toValue: plantStage,
      useNativeDriver: true,
      tension: 20,
      friction: 7,
    }).start();
  }, [plantStage]);

  const loadNotes = async () => {
    try {
      const saved = await AsyncStorage.getItem(`notes_${topic}`);
      if (saved) setNotes(saved);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await AsyncStorage.setItem(`notes_${topic}`, notes);
      Alert.alert('✅ Salvo!', 'Suas anotações foram salvas.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSavingNotes(false);
    }
  };

  const loadStudyProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(`study_${topic}`);
      if (saved) {
        const data = JSON.parse(saved);
        setPlantStage(data.stage || 0);
        setStudyTime(data.time || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const saveStudyProgress = async (stage, time) => {
    try {
      await AsyncStorage.setItem(`study_${topic}`, JSON.stringify({ stage, time }));
      if (stage === 5) {
        await gamificationService.recordAction('explanation');
        Alert.alert('🌳 Planta Completa!', 'Você dominou este tema! +10 XP');
      }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const generateMindMap = () => {
    const text = typeof explanation === 'string' ? explanation : (explanation.explicacao || '');
    const sentences = text.split('.').filter(s => s.trim().length > 30);
    
    const colors = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#30cfd0', '#330867']
    ];
    
    const nodes = sentences.slice(0, 6).map((sentence, i) => ({
      id: i,
      title: sentence.trim().substring(0, 50),
      colors: colors[i],
    }));

    setMindMapData(nodes);
  };

  const handleSpeak = async () => {
    try {
      if (speaking) {
        await stopSpeaking();
        setSpeaking(false);
      } else {
        setSpeaking(true);
        const textToSpeak = typeof explanation === 'string' ? explanation : (explanation.explicacao || '');
        await speak(textToSpeak, {
          onDone: () => setSpeaking(false),
          rate: 0.9,
        });
      }
    } catch (error) {
      setSpeaking(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', text: chatInput.trim() };
    const currentInput = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Preparar contexto do tema
      const explText = typeof explanation === 'string' ? explanation : (explanation.explicacao || '');
      
      // Montar histórico de conversa para o ChatGPT
      const messages = [
        {
          role: 'system',
          content: `Você é um mentor educacional especializado. O usuário está estudando sobre "${topic}".

Conteúdo do tema:
${explText}

Responda de forma didática, clara e conversacional. Use exemplos quando apropriado. Mantenha respostas concisas mas completas.`
        },
        // Adicionar histórico de mensagens anteriores
        ...chatMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        // Adicionar nova pergunta do usuário
        {
          role: 'user',
          content: currentInput
        }
      ];

      // Chamar API do ChatGPT (GPT-4o-mini - mais econômico)
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo mais barato e rápido
        messages: messages,
        max_tokens: 500, // Limitar resposta para economizar tokens
        temperature: 0.7, // Criatividade moderada
      });

      const aiText = completion.choices[0].message.content;
      const aiMessage = { role: 'ai', text: aiText };
      
      setChatMessages(prev => [...prev, aiMessage]);
      await gamificationService.recordAction('explanation');
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.error('Erro no chat:', error);
      
      // Mensagem de erro mais específica
      let errorMsg = 'Não foi possível obter resposta.';
      if (error.message && error.message.includes('API key')) {
        errorMsg = 'API Key inválida. Verifique a configuração.';
      } else if (error.message && error.message.includes('network')) {
        errorMsg = 'Erro de conexão. Verifique sua internet.';
      } else if (error.message && error.message.includes('quota')) {
        errorMsg = 'Limite de uso atingido. Tente novamente mais tarde.';
      }
      
      const errorMessage = { 
        role: 'ai', 
        text: `❌ ${errorMsg}\n\nTente novamente ou reformule sua pergunta.` 
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      '🗑️ Limpar Conversa',
      'Deseja limpar todas as mensagens desta conversa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: () => {
            setChatMessages([]);
            Alert.alert('✅', 'Conversa limpa!');
          }
        }
      ]
    );
  };

  const renderPlant = () => {
    const plantEmojis = ['🌱', '🌿', '🪴', '🌳', '🌲', '🎄'];
    const plantDescriptions = ['Semente', 'Broto', 'Muda', 'Árvore Jovem', 'Árvore Madura', 'Árvore Completa'];

    return (
      <View style={styles.plantContainer}>
        <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.plantCard}>
          <Text style={styles.plantTitle}>🌱 Seu Progresso no Tema</Text>
          <Animated.View style={[
            styles.plantIconContainer,
            {
              transform: [{
                scale: growthAnim.interpolate({
                  inputRange: [0, 5],
                  outputRange: [0.5, 1.5],
                })
              }]
            }
          ]}>
            <Text style={styles.plantIcon}>{plantEmojis[plantStage]}</Text>
          </Animated.View>
          <Text style={styles.plantStage}>{plantDescriptions[plantStage]}</Text>
          <View style={styles.plantProgress}>
            <View style={[styles.plantProgressFill, { width: `${(plantStage / 5) * 100}%` }]} />
          </View>
          <Text style={styles.plantTime}>⏱️ {Math.floor(studyTime / 60)}:{String(studyTime % 60).padStart(2, '0')}</Text>
          {plantStage === 5 && <Text style={styles.plantComplete}>🎉 Tema Dominado!</Text>}
        </LinearGradient>
      </View>
    );
  };


  const renderMindMap = () => {
    return <InteractiveMindMap topic={topic} explanation={explanation} />;
  };

  const renderChat = () => {
    return (
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Botão para Limpar Conversa */}
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.chatClearBtn}
            onPress={handleClearChat}
          >
            <Text style={styles.chatClearIcon}>🗑️</Text>
            <Text style={styles.chatClearText}>Limpar Conversa</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatMessages}
          contentContainerStyle={styles.chatMessagesContent}
        >
          <View style={styles.chatWelcome}>
            <Text style={styles.chatWelcomeEmoji}>💬</Text>
            <Text style={styles.chatWelcomeText}>Converse sobre "{topic}"</Text>
            <Text style={styles.chatWelcomeHint}>Faça perguntas, peça exemplos!</Text>
          </View>

          {chatMessages.map((msg, index) => (
            <View key={index} style={[
              styles.chatBubble,
              msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAI
            ]}>
              <Text style={[
                styles.chatBubbleText,
                msg.role === 'user' && styles.chatBubbleTextUser
              ]}>{msg.text}</Text>
            </View>
          ))}

          {chatLoading && (
            <View style={[styles.chatBubble, styles.chatBubbleAI]}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          )}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Digite sua pergunta..."
            placeholderTextColor={COLORS.textLight}
            value={chatInput}
            onChangeText={setChatInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.chatSendBtn, !chatInput.trim() && styles.chatSendBtnDisabled]}
            onPress={sendChatMessage}
            disabled={!chatInput.trim() || chatLoading}
          >
            <Text style={styles.chatSendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  const renderNotes = () => {
    return (
      <View style={styles.notesContainer}>
        <View style={styles.notesHeader}>
          <Text style={styles.notesTitle}>📝 Minhas Anotações</Text>
          <TouchableOpacity 
            style={styles.notesSaveBtn}
            onPress={saveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.notesSaveBtnText}>💾 Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.notesInput}
          placeholder="Escreva suas anotações...\n\n• Ponto 1\n• Ponto 2"
          placeholderTextColor={COLORS.textLight}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />
        
        <Text style={styles.notesHint}>💡 Salvo localmente</Text>
      </View>
    );
  };

  const renderContent = () => {
    const explText = typeof explanation === 'string' ? explanation : (explanation.explicacao || '');
    const pontosChave = explanation.pontosChave || [];
    
    switch (viewMode) {
      case 'mindmap':
        return renderMindMap();
      case 'chat':
        return renderChat();
      case 'notes':
        return renderNotes();
      default:
        return (
          <ScrollView style={styles.textContent} contentContainerStyle={styles.textContentPadding}>
            {renderPlant()}
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📚 Explicação</Text>
              <Text style={styles.cardText}>{explText}</Text>
            </View>

            {pontosChave.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🎯 Pontos-Chave</Text>
                {pontosChave.map((ponto, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{ponto}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.gradient1, COLORS.gradient2]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{topic}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {[
            { id: 'text', label: '📄 Texto' },
            { id: 'mindmap', label: '🧠 Mapa' },
            { id: 'chat', label: '💬 Chat' },
            { id: 'notes', label: '📝 Notas' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, viewMode === tab.id && styles.tabActive]}
              onPress={() => setViewMode(tab.id)}
            >
              <Text style={[styles.tabText, viewMode === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#FFF' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginHorizontal: 8 },
  speakBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  speakIcon: { fontSize: 20 },
  
  tabs: { paddingHorizontal: 16 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabActive: { backgroundColor: '#FFF' },
  tabText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  tabTextActive: { color: COLORS.primary },
  
  textContent: { flex: 1 },
  textContentPadding: { padding: 20, paddingBottom: 40 },
  
  plantContainer: { marginBottom: 20 },
  plantCard: { borderRadius: 20, padding: 24, alignItems: 'center', ...SHADOWS.medium },
  plantTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 16 },
  plantIconContainer: { marginVertical: 12 },
  plantIcon: { fontSize: 80 },
  plantStage: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  plantProgress: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 8 },
  plantProgressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  plantTime: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  plantComplete: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginTop: 8 },
  
  card: { backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 20, marginBottom: 16, ...SHADOWS.light },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  cardText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },
  bulletPoint: { flexDirection: 'row', marginBottom: 8 },
  bullet: { fontSize: 20, color: COLORS.primary, marginRight: 12, marginTop: -2 },
  bulletText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  
  mindMapContainer: { flex: 1, padding: 20 },
  mindMapTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 24 },
  mindMapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  mindMapCard: { width: '47%', marginBottom: 16 },
  mindMapCardGradient: { borderRadius: 20, padding: 20, minHeight: 150, justifyContent: 'space-between', ...SHADOWS.strong },
  mindMapCardNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  mindMapCardNumberText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  mindMapCardText: { fontSize: 14, color: '#FFF', lineHeight: 20, fontWeight: '600' },
  
  chatContainer: { flex: 1 },
  chatHeader: { 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight + '20',
    alignItems: 'center',
  },
  chatClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    ...SHADOWS.light,
  },
  chatClearIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  chatClearText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  chatMessages: { flex: 1, paddingHorizontal: 16 },
  chatMessagesContent: { paddingVertical: 20, paddingBottom: 40 },
  chatWelcome: { alignItems: 'center', marginBottom: 24 },
  chatWelcomeEmoji: { fontSize: 48, marginBottom: 12 },
  chatWelcomeText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  chatWelcomeHint: { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  chatBubble: { maxWidth: '80%', marginBottom: 12, padding: 16, borderRadius: 20, ...SHADOWS.light },
  chatBubbleUser: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  chatBubbleAI: { alignSelf: 'flex-start', backgroundColor: COLORS.cardBackground },
  chatBubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  chatBubbleTextUser: { color: '#FFF' },
  chatInputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: COLORS.cardBackground, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.textLight + '30', 
    alignItems: 'flex-end',
  },
  chatInput: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    paddingTop: 10,
    fontSize: 15, 
    color: COLORS.text, 
    maxHeight: 100, 
    marginRight: 8,
  },
  chatSendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
  chatSendBtnDisabled: { opacity: 0.5 },
  chatSendIcon: { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
  
  notesContainer: { flex: 1, padding: 20 },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notesTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  notesSaveBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, ...SHADOWS.medium },
  notesSaveBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  notesInput: { flex: 1, backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 20, fontSize: 15, color: COLORS.text, lineHeight: 24, ...SHADOWS.light },
  notesHint: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
});
