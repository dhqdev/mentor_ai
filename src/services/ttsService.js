import * as Speech from 'expo-speech';

export const speak = async (text, options = {}) => {
  try {
    const {
      voice = 'pt-BR',
      rate = 1.0,
      pitch = 1.0,
      onDone = () => {},
      onStart = () => {}
    } = options;

    await Speech.speak(text, {
      language: voice,
      rate,
      pitch,
      onDone,
      onStart
    });
  } catch (error) {
    console.error('Erro ao falar:', error);
  }
};

export const stopSpeaking = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Erro ao parar fala:', error);
  }
};

export const isSpeaking = async () => {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('Erro ao verificar fala:', error);
    return false;
  }
};

export const getAvailableVoices = async () => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.filter(v => v.language.startsWith('pt'));
  } catch (error) {
    console.error('Erro ao obter vozes:', error);
    return [];
  }
};
