import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import gamificationService from '../services/gamificationService';
import { COLORS, SHADOWS } from '../utils/theme';

export default function ProfileScreen({ navigation }) {
  const { history, resetApp } = useApp();
  const [profile, setProfile] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [badges, setBadges] = useState([]);
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    loadGamification();
  }, []);

  const loadGamification = async () => {
    const userProfile = await gamificationService.getUserProfile();
    setProfile(userProfile);
    setPersonality(gamificationService.getPersonality(userProfile.level));
    setBadges(gamificationService.getAllBadges());
    const userRanking = await gamificationService.getRanking(userProfile.userId);
    setRanking(userRanking);
  };

  const progressPercent = profile ? ((profile.xp % 100) / 100) * 100 : 0;
  const xpToNext = profile ? 100 - (profile.xp % 100) : 100;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header com AI Personality */}
        <LinearGradient colors={[COLORS.gradient1, COLORS.gradient2]} style={styles.header}>
          <Text style={styles.aiEmoji}>{personality?.emoji || '🌱'}</Text>
          <Text style={styles.aiName}>{personality?.name || 'Aprendiz'}</Text>
          <Text style={styles.headerLevel}>Nível {profile?.level || 1}</Text>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.xpText}>{profile?.xp || 0} / {Math.ceil((profile?.xp || 0) / 100) * 100} XP</Text>
          </View>
          <Text style={styles.xpToNext}>Faltam {xpToNext} XP para o próximo nível!</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{profile?.streak || 0}</Text>
            <Text style={styles.statLabel}>Dias Seguidos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{profile?.badges?.length || 0}</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statValue}>{history?.length || 0}</Text>
            <Text style={styles.statLabel}>Temas Aprendidos</Text>
          </View>
        </View>

        {/* Botão de Estatísticas */}
        <TouchableOpacity 
          style={styles.statsButton}
          onPress={() => navigation.navigate('Stats')}
        >
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.statsButtonGradient}
          >
            <Text style={styles.statsButtonIcon}>📊</Text>
            <View style={styles.statsButtonTextContainer}>
              <Text style={styles.statsButtonTitle}>Ver Estatísticas Detalhadas</Text>
              <Text style={styles.statsButtonSubtitle}>Matérias e tópicos mais estudados</Text>
            </View>
            <Text style={styles.statsButtonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Ranking */}
        {ranking && (
          <View style={styles.rankingCard}>
            <Text style={styles.sectionTitle}>🎖️ Seu Ranking</Text>
            <Text style={styles.rankingPosition}>#{ranking.position}</Text>
            <Text style={styles.rankingDesc}>entre todos os usuários</Text>
          </View>
        )}

        {/* AI Personality Evolution */}
        <View style={styles.evolutionCard}>
          <Text style={styles.sectionTitle}>🧬 Evolução do Mentor</Text>
          <View style={styles.evolutionTimeline}>
            {[
              { level: 1, emoji: '🌱', name: 'Aprendiz' },
              { level: 10, emoji: '📚', name: 'Estudante' },
              { level: 25, emoji: '🧙', name: 'Sábio' },
              { level: 50, emoji: '👑', name: 'Mestre' },
              { level: 100, emoji: '🏆', name: 'Lenda' }
            ].map((stage, i) => (
              <View key={i} style={styles.evolutionStage}>
                <View style={[styles.evolutionIcon, (profile?.level || 0) >= stage.level && styles.evolutionIconActive]}>
                  <Text style={styles.evolutionEmoji}>{stage.emoji}</Text>
                </View>
                <Text style={[styles.evolutionName, (profile?.level || 0) >= stage.level && styles.evolutionNameActive]}>{stage.name}</Text>
                <Text style={styles.evolutionLevel}>Nv {stage.level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>🏆 Conquistas ({profile?.badges?.length || 0}/{badges.length})</Text>
          <View style={styles.badgesGrid}>
            {badges.map((badge, i) => {
              const unlocked = profile?.badges?.includes(badge.id);
              return (
                <TouchableOpacity key={i} style={[styles.badgeCard, !unlocked && styles.badgeLocked]}>
                  <Text style={[styles.badgeIcon, !unlocked && styles.badgeIconLocked]}>{badge.icon}</Text>
                  <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}>{badge.name}</Text>
                  {unlocked && <Text style={styles.badgeXP}>+{badge.xp} XP</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>⚠️ Zona de Perigo</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={() => {
            Alert.alert('Resetar Progresso', 'Isso apagará TODO o seu progresso, XP, badges, histórico e você terá que inserir seu nome novamente. Tem certeza?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sim, resetar', style: 'destructive', onPress: async () => {
                await gamificationService.resetProgress();
                await resetApp();
                // Recarregar o app para voltar à tela de Onboarding
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding' }],
                });
              }}
            ]);
          }}>
            <Text style={styles.dangerButtonText}>Resetar Progresso</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  aiEmoji: { fontSize: 80, marginBottom: 8 },
  aiName: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  headerLevel: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 20 },
  xpBarContainer: { width: '100%', marginBottom: 8 },
  xpBar: { height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  xpBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 5 },
  xpText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  xpToNext: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center' },
  
  statsGrid: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: -30, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 16, alignItems: 'center', ...SHADOWS.medium },
  statEmoji: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textLight, textAlign: 'center' },
  
  statsButton: { marginHorizontal: 20, marginBottom: 20, borderRadius: 20, overflow: 'hidden', ...SHADOWS.medium },
  statsButtonGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, },
  statsButtonIcon: { fontSize: 32, marginRight: 16 },
  statsButtonTextContainer: { flex: 1 },
  statsButtonTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  statsButtonSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  statsButtonArrow: { fontSize: 24, color: '#FFF', marginLeft: 12 },
  
  rankingCard: { backgroundColor: COLORS.cardBackground, borderRadius: 20, padding: 24, marginHorizontal: 20, marginBottom: 20, alignItems: 'center', ...SHADOWS.medium },
  rankingPosition: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary, marginVertical: 8 },
  rankingDesc: { fontSize: 14, color: COLORS.textLight },
  
  evolutionCard: { backgroundColor: COLORS.cardBackground, borderRadius: 20, padding: 20, marginHorizontal: 20, marginBottom: 20, ...SHADOWS.medium },
  evolutionTimeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  evolutionStage: { alignItems: 'center', flex: 1 },
  evolutionIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 3, borderColor: COLORS.textLight },
  evolutionIconActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(124, 58, 237, 0.1)' },
  evolutionEmoji: { fontSize: 28 },
  evolutionName: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', marginBottom: 2 },
  evolutionNameActive: { color: COLORS.text, fontWeight: 'bold' },
  evolutionLevel: { fontSize: 10, color: COLORS.textLight },
  
  badgesSection: { marginHorizontal: 20, marginBottom: 20 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '22%', aspectRatio: 1, backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 8, alignItems: 'center', justifyContent: 'center', ...SHADOWS.light },
  badgeLocked: { opacity: 0.4 },
  badgeIcon: { fontSize: 32, marginBottom: 4 },
  badgeIconLocked: { opacity: 0.3 },
  badgeName: { fontSize: 9, color: COLORS.text, fontWeight: 'bold', textAlign: 'center' },
  badgeNameLocked: { color: COLORS.textLight },
  badgeXP: { fontSize: 8, color: COLORS.primary, fontWeight: 'bold', marginTop: 2 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  
  premiumCard: { backgroundColor: COLORS.cardBackground, borderRadius: 20, padding: 24, marginHorizontal: 20, marginBottom: 20, alignItems: 'center', ...SHADOWS.medium },
  premiumEmoji: { fontSize: 64, marginBottom: 12 },
  premiumTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  premiumDesc: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  premiumPrice: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
  premiumButton: { width: '100%', borderRadius: 12, overflow: 'hidden', ...SHADOWS.medium },
  premiumGradient: { paddingVertical: 16, alignItems: 'center' },
  premiumButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  dangerZone: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 20, borderWidth: 2, borderColor: COLORS.error },
  dangerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.error, marginBottom: 12, textAlign: 'center' },
  dangerButton: { backgroundColor: COLORS.error, paddingVertical: 12, borderRadius: 8, ...SHADOWS.light },
  dangerButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }
});
