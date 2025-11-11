import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import { explainTopic } from '../services/geminiService';
import gamificationService from '../services/gamificationService';
import { COLORS, SHADOWS } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const { addToHistory, history } = useApp();
  const [topic, setTopic] = useState('');
  const [ageLevel, setAgeLevel] = useState('adulto');
  const [style, setStyle] = useState('didático');
  const [loading, setLoading] = useState(false);
  
  // Gamificação
  const [profile, setProfile] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  
  const ageLevels = ['criança', 'adolescente', 'adulto'];
  const styles_options = ['didático', 'simples', 'técnico', 'divertido'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await gamificationService.getUserProfile();
    setProfile(userProfile);
    setPersonality(gamificationService.getPersonality(userProfile.level));
  };

  const handleExplain = async () => {
    if (!topic.trim()) {
      Alert.alert('Atenção', 'Digite um tema para aprender!');
      return;
    }

    setLoading(true);
    try {
      const explanation = await explainTopic(topic, ageLevel, style);
      await addToHistory({ topic, explanation, ageLevel, style, timestamp: new Date().toISOString() });
      
      // Gamificação: XP por explicação
      const result = await gamificationService.recordAction('explanation');
      await gamificationService.updateStreak();
      
      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      if (result.newBadges.length > 0) {
        setNewBadges(result.newBadges);
      }
      await loadProfile();
      
      navigation.navigate('Explanation', { topic, explanation, ageLevel, style });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar a explicação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = profile ? ((profile.xp % 100) / 100) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header com IA Personificada */}
        <LinearGradient colors={[COLORS.gradient1, COLORS.gradient2]} style={styles.header}>
          <View style={styles.aiMentorCard}>
            <Text style={styles.aiEmoji}>{personality?.emoji || '🌱'}</Text>
            <View style={styles.aiInfo}>
              <Text style={styles.aiName}>{personality?.name || 'Aprendiz'}</Text>
              <Text style={styles.aiLevel}>Nível {profile?.level || 1}</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.profileBtnText}>👤</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerTitle}>🧠 MentorIA</Text>
          <Text style={styles.headerSubtitle}>Aprenda qualquer coisa, do seu jeito</Text>
          
          {/* Barra de XP */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.xpText}>{profile?.xp || 0} XP • {Math.floor(100 - progressPercent)}XP para Nível {(profile?.level || 1) + 1}</Text>
          </View>
        </LinearGradient>

        {/* Input */}
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>💡</Text>
            <TextInput
              style={styles.input}
              placeholder="O que você quer aprender?"
              placeholderTextColor={COLORS.textLight}
              value={topic}
              onChangeText={setTopic}
              multiline={true}
            />
          </View>
        </View>

        {/* Nível de Explicação */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Nível de explicação</Text>
          <View style={styles.optionsRow}>
            {ageLevels.map((level) => (
              <TouchableOpacity key={level} style={[styles.optionBtn, ageLevel === level && styles.optionBtnActive]} onPress={() => setAgeLevel(level)}>
                <Text style={[styles.optionText, ageLevel === level && styles.optionTextActive]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estilo de Ensino */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎨 Estilo de ensino</Text>
          <View style={styles.optionsRow}>
            {styles_options.map((s) => (
              <TouchableOpacity key={s} style={[styles.optionBtn, style === s && styles.optionBtnActive]} onPress={() => setStyle(s)}>
                <Text style={[styles.optionText, style === s && styles.optionTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botão Aprender */}
        <TouchableOpacity style={styles.learnButton} onPress={handleExplain} disabled={loading}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.learnGradient}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="large" />
            ) : (
              <>
                <Text style={styles.learnIcon}>🚀</Text>
                <Text style={styles.learnText}>Aprender Agora!</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Mensagem Motivacional da IA */}
        {personality && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>{gamificationService.getMotivationalMessage(profile.level)}</Text>
          </View>
        )}

        {/* Dashboard de Progresso */}
        <Text style={styles.sectionTitle}>📊 Seu Progresso:</Text>
        <View style={styles.dashboardGrid}>
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardEmoji}>⏱️</Text>
            <Text style={styles.dashboardValue}>{history.length}h</Text>
            <Text style={styles.dashboardLabel}>Tempo Total</Text>
          </View>
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardEmoji}>🔥</Text>
            <Text style={styles.dashboardValue}>{profile?.streak || 0}</Text>
            <Text style={styles.dashboardLabel}>Dias Seguidos</Text>
          </View>
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardEmoji}>📚</Text>
            <Text style={styles.dashboardValue}>{history.length}</Text>
            <Text style={styles.dashboardLabel}>Tópicos</Text>
          </View>
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardEmoji}>🏆</Text>
            <Text style={styles.dashboardValue}>{profile?.badges?.length || 0}</Text>
            <Text style={styles.dashboardLabel}>Conquistas</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Level Up */}
      <Modal visible={showLevelUp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.levelUpCard}>
            <Text style={styles.levelUpEmoji}>🎉</Text>
            <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
            <Text style={styles.levelUpLevel}>Nível {profile?.level}</Text>
            <Text style={styles.levelUpText}>{personality?.name}</Text>
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal Badges */}
      <Modal visible={newBadges.length > 0} transparent animationType="slide" onRequestClose={() => setNewBadges([])}>
        <View style={styles.modalOverlay}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeTitle}>🎉 Novas Conquistas!</Text>
            {newBadges.map((badge, i) => (
              <View key={i} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                  <Text style={styles.badgeXP}>+{badge.xp} XP</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setNewBadges([])}>
              <Text style={styles.closeBtnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  aiMentorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 12, marginBottom: 20 },
  aiEmoji: { fontSize: 36, marginRight: 12 },
  aiInfo: { flex: 1 },
  aiName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  aiLevel: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  profileBtnText: { fontSize: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 20 },
  xpContainer: { marginBottom: 16 },
  xpBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  xpBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  xpText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  inputCard: { backgroundColor: COLORS.cardBackground, borderRadius: 20, padding: 16, marginHorizontal: 20, marginTop: -20, ...SHADOWS.strong },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputIcon: { fontSize: 24 },
  input: { flex: 1, fontSize: 15, color: COLORS.text, maxHeight: 80 },
  card: { backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 16, marginHorizontal: 20, marginTop: 16, ...SHADOWS.light },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.textLight },
  optionBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  optionTextActive: { color: '#FFF' },
  learnButton: { marginHorizontal: 20, marginTop: 24, borderRadius: 16, overflow: 'hidden', ...SHADOWS.strong },
  learnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
  learnIcon: { fontSize: 28 },
  learnText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  motivationCard: { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 12, padding: 16, marginHorizontal: 20, marginTop: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  motivationText: { fontSize: 14, color: COLORS.text, fontStyle: 'italic', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 20, marginBottom: 8 },
  dashboardCard: { flex: 1, minWidth: '22%', backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 16, alignItems: 'center', ...SHADOWS.medium },
  dashboardEmoji: { fontSize: 32, marginBottom: 8 },
  dashboardValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  dashboardLabel: { fontSize: 11, color: COLORS.textLight, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  levelUpCard: { padding: 40, borderRadius: 24, alignItems: 'center', ...SHADOWS.strong },
  levelUpEmoji: { fontSize: 64, marginBottom: 16 },
  levelUpTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  levelUpLevel: { fontSize: 48, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  levelUpText: { fontSize: 20, color: 'rgba(255,255,255,0.9)' },
  badgeCard: { backgroundColor: COLORS.cardBackground, borderRadius: 24, padding: 24, width: '90%', maxWidth: 400, ...SHADOWS.strong },
  badgeTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 20 },
  badgeItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 16, padding: 16, marginBottom: 12 },
  badgeIcon: { fontSize: 48, marginRight: 16 },
  badgeInfo: { flex: 1 },
  badgeName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  badgeDesc: { fontSize: 13, color: COLORS.textLight, marginBottom: 8 },
  badgeXP: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  closeBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, marginTop: 12 },
  closeBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});
