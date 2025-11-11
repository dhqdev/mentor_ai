import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@mentor_ia_history';
const FAVORITES_KEY = '@mentor_ia_favorites';
const STATS_KEY = '@mentor_ia_stats';
const DAILY_COUNT_KEY = '@mentor_ia_daily_count';
const PREMIUM_KEY = '@mentor_ia_premium';

// Histórico de explicações
export const saveToHistory = async (item) => {
  try {
    const history = await getHistory();
    const newItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [newItem, ...history].slice(0, 50); // Mantém últimas 50
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Atualiza estatísticas
    await updateStats(item.topic);
    
    return newItem;
  } catch (error) {
    console.error('Erro ao salvar no histórico:', error);
    throw error;
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
  }
};

// Favoritos
export const addToFavorites = async (item) => {
  try {
    const favorites = await getFavorites();
    const exists = favorites.find(f => f.id === item.id);
    
    if (!exists) {
      const updatedFavorites = [item, ...favorites];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
  }
};

export const removeFromFavorites = async (itemId) => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(f => f.id !== itemId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
  }
};

export const getFavorites = async () => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao obter favoritos:', error);
    return [];
  }
};

export const isFavorite = async (itemId) => {
  try {
    const favorites = await getFavorites();
    return favorites.some(f => f.id === itemId);
  } catch (error) {
    return false;
  }
};

// Estatísticas
export const updateStats = async (topic) => {
  try {
    const stats = await getStats();
    const today = new Date().toDateString();
    
    stats.totalExplanations = (stats.totalExplanations || 0) + 1;
    stats.lastAccess = new Date().toISOString();
    
    // Temas estudados
    if (!stats.topics) stats.topics = {};
    stats.topics[topic] = (stats.topics[topic] || 0) + 1;
    
    // Dias de uso
    if (!stats.daysUsed) stats.daysUsed = [];
    if (!stats.daysUsed.includes(today)) {
      stats.daysUsed.push(today);
    }
    
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
};

export const getStats = async () => {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : {
      totalExplanations: 0,
      topics: {},
      daysUsed: [],
      lastAccess: null
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalExplanations: 0,
      topics: {},
      daysUsed: [],
      lastAccess: null
    };
  }
};

// Controle diário (limite grátis)
export const incrementDailyCount = async () => {
  try {
    const today = new Date().toDateString();
    const data = await AsyncStorage.getItem(DAILY_COUNT_KEY);
    const dailyData = data ? JSON.parse(data) : { date: today, count: 0 };
    
    // Reset se for outro dia
    if (dailyData.date !== today) {
      dailyData.date = today;
      dailyData.count = 0;
    }
    
    dailyData.count += 1;
    await AsyncStorage.setItem(DAILY_COUNT_KEY, JSON.stringify(dailyData));
    
    return dailyData.count;
  } catch (error) {
    console.error('Erro ao incrementar contador diário:', error);
    return 0;
  }
};

export const getDailyCount = async () => {
  try {
    const today = new Date().toDateString();
    const data = await AsyncStorage.getItem(DAILY_COUNT_KEY);
    const dailyData = data ? JSON.parse(data) : { date: today, count: 0 };
    
    // Reset se for outro dia
    if (dailyData.date !== today) {
      return 0;
    }
    
    return dailyData.count;
  } catch (error) {
    console.error('Erro ao obter contador diário:', error);
    return 0;
  }
};

export const canUseFeature = async () => {
  try {
    const isPremium = await isPremiumUser();
    if (isPremium) return { allowed: true, remaining: -1 };
    
    const count = await getDailyCount();
    const maxFree = 5;
    
    return {
      allowed: count < maxFree,
      remaining: Math.max(0, maxFree - count),
      limit: maxFree
    };
  } catch (error) {
    return { allowed: true, remaining: 5 };
  }
};

// Premium
export const setPremiumStatus = async (isPremium) => {
  try {
    await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(isPremium));
  } catch (error) {
    console.error('Erro ao definir status premium:', error);
  }
};

export const isPremiumUser = async () => {
  try {
    const data = await AsyncStorage.getItem(PREMIUM_KEY);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error('Erro ao verificar status premium:', error);
    return false;
  }
};
