import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

class VoiceService {
  constructor() {
    this.isListening = false;
    this.recording = null;
  }

  // Inicializar permissões de áudio
  async requestPermissions() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  }

  // Iniciar gravação
  async startListening() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permissão de microfone negada');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      return false;
    }
  }

  // Parar gravação
  async stopListening() {
    try {
      if (!this.recording) return null;

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isListening = false;

      return uri;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      return null;
    }
  }

  // Simular reconhecimento de voz (em produção, usar API de Speech-to-Text)
  async recognizeSpeech(audioUri) {
    // Simulação - em produção, enviar para Google Speech API ou similar
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions = [
          'Explique a Revolução Francesa',
          'Como funciona a fotossíntese',
          'O que é React Native',
          'História do Brasil',
          'Matemática básica',
        ];
        resolve(suggestions[Math.floor(Math.random() * suggestions.length)]);
      }, 1000);
    });
  }

  // Comandos de voz especiais
  async processVoiceCommand(text) {
    const lowerText = text.toLowerCase();
    
    // Comandos especiais
    if (lowerText.includes('ok mentor') || lowerText.includes('ei mentor')) {
      return { type: 'wake', response: 'Sim? Como posso ajudar?' };
    }
    
    if (lowerText.includes('explique') || lowerText.includes('o que é')) {
      const topic = lowerText.replace(/explique|o que é|me fale sobre/gi, '').trim();
      return { type: 'explain', topic };
    }
    
    if (lowerText.includes('quiz') || lowerText.includes('teste')) {
      return { type: 'quiz' };
    }
    
    if (lowerText.includes('histórico') || lowerText.includes('minhas explicações')) {
      return { type: 'history' };
    }
    
    if (lowerText.includes('perfil') || lowerText.includes('meu nível')) {
      return { type: 'profile' };
    }
    
    // Tema direto
    return { type: 'explain', topic: text };
  }

  // Feedback de voz da IA
  async speakWithPersonality(text, personality) {
    const voices = await Speech.getAvailableVoicesAsync();
    const portugueseVoice = voices.find(v => v.language.includes('pt'));

    await Speech.speak(text, {
      language: 'pt-BR',
      pitch: personality.level >= 50 ? 0.9 : 1.1, // Voz mais grave para níveis altos
      rate: personality.level >= 25 ? 0.95 : 1.0,
      voice: portugueseVoice?.identifier,
    });
  }
}

export default new VoiceService();
