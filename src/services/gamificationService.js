import AsyncStorage from '@react-native-async-storage/async-storage';

// Sistema de XP e Níveis
const XP_PER_LEVEL = 100;
const XP_REWARDS = {
  explanation: 10,
  quiz_complete: 25,
  quiz_perfect: 50,
  daily_streak: 15,
  favorite: 5,
  voice_input: 8,
  share: 12,
};

// Badges/Conquistas
const BADGES = {
  first_steps: { id: 'first_steps', name: 'Primeiros Passos', icon: '👣', description: 'Complete sua primeira explicação', xp: 0 },
  curious: { id: 'curious', name: 'Curioso', icon: '🔍', description: 'Leia 10 explicações', xp: 10 },
  scholar: { id: 'scholar', name: 'Estudioso', icon: '📚', description: 'Leia 50 explicações', xp: 50 },
  quiz_master: { id: 'quiz_master', name: 'Mestre dos Quizzes', icon: '🎯', description: 'Complete 20 quizzes', xp: 20 },
  perfect_score: { id: 'perfect_score', name: 'Nota 10', icon: '💯', description: 'Acerte 100% em um quiz', xp: 4 },
  streak_7: { id: 'streak_7', name: 'Consistente', icon: '🔥', description: 'Estude 7 dias seguidos', xp: 7 },
  streak_30: { id: 'streak_30', name: 'Dedicado', icon: '⭐', description: 'Estude 30 dias seguidos', xp: 30 },
  voice_pioneer: { id: 'voice_pioneer', name: 'Voz Ativa', icon: '🎤', description: 'Use comando de voz 10 vezes', xp: 10 },
  social_butterfly: { id: 'social_butterfly', name: 'Social', icon: '🦋', description: 'Compartilhe 5 explicações', xp: 5 },
  night_owl: { id: 'night_owl', name: 'Coruja', icon: '🦉', description: 'Estude depois da meia-noite', xp: 1 },
  early_bird: { id: 'early_bird', name: 'Madrugador', icon: '🐦', description: 'Estude antes das 6h', xp: 1 },
  speed_demon: { id: 'speed_demon', name: 'Relâmpago', icon: '⚡', description: 'Complete 5 temas em 1 hora', xp: 5 },
  collector: { id: 'collector', name: 'Colecionador', icon: '💎', description: 'Tenha 25 favoritos', xp: 25 },
};

// Personalidades da IA Mentor (DIFERENCIAL ÚNICO!)
const AI_PERSONALITIES = {
  rookie: { level: 1, name: 'Aprendiz', emoji: '🌱', messages: ['Vamos aprender juntos!', 'Cada dúvida é uma oportunidade!', 'Você está indo bem!'] },
  scholar: { level: 10, name: 'Estudante', emoji: '📚', messages: ['Seu progresso é incrível!', 'Continue explorando!', 'Conhecimento é poder!'] },
  sage: { level: 25, name: 'Sábio', emoji: '🧙', messages: ['Você domina muitos temas!', 'Sua mente está expandindo!', 'Impressionante!'] },
  master: { level: 50, name: 'Mestre', emoji: '👑', messages: ['Você é extraordinário!', 'Poucos chegam tão longe!', 'Continue inspirando!'] },
  legend: { level: 100, name: 'Lenda', emoji: '🏆', messages: ['Você é uma lenda viva!', 'Seu conhecimento é vasto!', 'Parabéns, campeão!'] },
};

class GamificationService {
  // Obter perfil do usuário
  async getUserProfile() {
    const profile = await AsyncStorage.getItem('user_profile');
    return profile ? JSON.parse(profile) : {
      xp: 0,
      level: 1,
      badges: [],
      streak: 0,
      lastStudyDate: null,
      totalExplanations: 0,
      totalQuizzes: 0,
      perfectScores: 0,
      voiceCommands: 0,
      shares: 0,
      favorites: 0,
    };
  }

  // Salvar perfil
  async saveUserProfile(profile) {
    await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
  }

  // Adicionar XP
  async addXP(amount, reason) {
    const profile = await this.getUserProfile();
    profile.xp += amount;
    
    // Calcular novo nível
    const newLevel = Math.floor(profile.xp / XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > profile.level;
    profile.level = newLevel;

    await this.saveUserProfile(profile);

    return {
      xp: amount,
      totalXP: profile.xp,
      level: profile.level,
      leveledUp,
      reason,
      nextLevelXP: newLevel * XP_PER_LEVEL,
      personality: this.getPersonality(profile.level),
    };
  }

  // Obter personalidade da IA baseada no nível
  getPersonality(level) {
    if (level >= 100) return AI_PERSONALITIES.legend;
    if (level >= 50) return AI_PERSONALITIES.master;
    if (level >= 25) return AI_PERSONALITIES.sage;
    if (level >= 10) return AI_PERSONALITIES.scholar;
    return AI_PERSONALITIES.rookie;
  }

  // Mensagem motivacional aleatória da IA
  getMotivationalMessage(level) {
    const personality = this.getPersonality(level);
    const messages = personality.messages;
    return `${personality.emoji} ${messages[Math.floor(Math.random() * messages.length)]}`;
  }

  // Verificar e conceder badges
  async checkAndAwardBadges() {
    const profile = await this.getUserProfile();
    const newBadges = [];

    // Verificar cada badge
    if (profile.totalExplanations >= 1 && !profile.badges.includes('first_steps')) {
      newBadges.push(BADGES.first_steps);
    }
    if (profile.totalExplanations >= 10 && !profile.badges.includes('curious')) {
      newBadges.push(BADGES.curious);
    }
    if (profile.totalExplanations >= 50 && !profile.badges.includes('scholar')) {
      newBadges.push(BADGES.scholar);
    }
    if (profile.totalQuizzes >= 20 && !profile.badges.includes('quiz_master')) {
      newBadges.push(BADGES.quiz_master);
    }
    if (profile.perfectScores >= 1 && !profile.badges.includes('perfect_score')) {
      newBadges.push(BADGES.perfect_score);
    }
    if (profile.streak >= 7 && !profile.badges.includes('streak_7')) {
      newBadges.push(BADGES.streak_7);
    }
    if (profile.streak >= 30 && !profile.badges.includes('streak_30')) {
      newBadges.push(BADGES.streak_30);
    }
    if (profile.voiceCommands >= 10 && !profile.badges.includes('voice_pioneer')) {
      newBadges.push(BADGES.voice_pioneer);
    }
    if (profile.shares >= 5 && !profile.badges.includes('social_butterfly')) {
      newBadges.push(BADGES.social_butterfly);
    }
    if (profile.favorites >= 25 && !profile.badges.includes('collector')) {
      newBadges.push(BADGES.collector);
    }

    // Adicionar novos badges
    if (newBadges.length > 0) {
      profile.badges.push(...newBadges.map(b => b.id));
      let totalXP = 0;
      newBadges.forEach(b => totalXP += b.xp);
      profile.xp += totalXP;
      await this.saveUserProfile(profile);
    }

    return newBadges;
  }

  // Registrar ação
  async recordAction(action, data = {}) {
    const profile = await this.getUserProfile();
    let xpGained = 0;

    switch (action) {
      case 'explanation':
        profile.totalExplanations++;
        xpGained = XP_REWARDS.explanation;
        break;
      case 'quiz_complete':
        profile.totalQuizzes++;
        xpGained = XP_REWARDS.quiz_complete;
        break;
      case 'quiz_perfect':
        profile.perfectScores++;
        xpGained = XP_REWARDS.quiz_perfect;
        break;
      case 'voice_input':
        profile.voiceCommands++;
        xpGained = XP_REWARDS.voice_input;
        break;
      case 'share':
        profile.shares++;
        xpGained = XP_REWARDS.share;
        break;
      case 'favorite':
        profile.favorites++;
        xpGained = XP_REWARDS.favorite;
        break;
    }

    await this.saveUserProfile(profile);
    const result = await this.addXP(xpGained, action);
    const newBadges = await this.checkAndAwardBadges();

    return { ...result, newBadges };
  }

  // Atualizar streak
  async updateStreak() {
    const profile = await this.getUserProfile();
    const today = new Date().toDateString();
    
    if (profile.lastStudyDate === today) {
      return profile.streak; // Já estudou hoje
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (profile.lastStudyDate === yesterday.toDateString()) {
      profile.streak++;
    } else {
      profile.streak = 1; // Reset streak
    }

    profile.lastStudyDate = today;
    await this.saveUserProfile(profile);

    if (profile.streak % 7 === 0) {
      await this.addXP(XP_REWARDS.daily_streak, 'streak');
    }

    return profile.streak;
  }

  // Obter ranking (simulado)
  async getRanking() {
    const profile = await this.getUserProfile();
    // Em produção, isso viria de um backend
    return {
      position: Math.max(1, Math.floor(Math.random() * 100)),
      totalPlayers: 1000,
      topPlayers: [
        { name: 'Você', xp: profile.xp, level: profile.level },
        { name: 'Ana Silva', xp: profile.xp + 50, level: profile.level + 1 },
        { name: 'Pedro Costa', xp: profile.xp + 30, level: profile.level },
      ],
    };
  }
}

export default new GamificationService();
export { BADGES, AI_PERSONALITIES, XP_REWARDS };
