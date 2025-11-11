import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function StatsScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    topTopics: [],
    topSubjects: [],
    weekActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Carregar todos os dados de estudo
      const keys = await AsyncStorage.getAllKeys();
      const studyKeys = keys.filter(key => key.startsWith('study_'));
      const studyData = await AsyncStorage.multiGet(studyKeys);

      let totalTime = 0;
      const topicsMap = {};
      const subjectsMap = {
        'Matemática': 0,
        'Ciências': 0,
        'História': 0,
        'Geografia': 0,
        'Português': 0,
        'Inglês': 0,
        'Física': 0,
        'Química': 0,
        'Biologia': 0,
        'Outros': 0,
      };

      studyData.forEach(([key, value]) => {
        if (value) {
          const data = JSON.parse(value);
          const topic = key.replace('study_', '');
          
          totalTime += data.time || 0;
          topicsMap[topic] = (topicsMap[topic] || 0) + (data.time || 0);

          // Categorizar por matéria (heurística simples)
          let category = 'Outros';
          if (topic.match(/matemática|cálculo|álgebra|geometria/i)) category = 'Matemática';
          else if (topic.match(/ciência|experimento|laboratório/i)) category = 'Ciências';
          else if (topic.match(/história|guerra|revolução|civilização/i)) category = 'História';
          else if (topic.match(/geografia|país|continente|clima/i)) category = 'Geografia';
          else if (topic.match(/português|gramática|redação|literatura/i)) category = 'Português';
          else if (topic.match(/inglês|english|verb|vocabulary/i)) category = 'Inglês';
          else if (topic.match(/física|força|energia|movimento/i)) category = 'Física';
          else if (topic.match(/química|átomo|elemento|reação/i)) category = 'Química';
          else if (topic.match(/biologia|célula|dna|evolução/i)) category = 'Biologia';

          subjectsMap[category] += data.time || 0;
        }
      });

      // Top 5 tópicos
      const topTopics = Object.entries(topicsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, time]) => ({
          name: topic,
          time: time,
          percentage: totalTime > 0 ? Math.round((time / totalTime) * 100) : 0,
        }));

      // Top 5 matérias
      const topSubjects = Object.entries(subjectsMap)
        .filter(([_, time]) => time > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([subject, time]) => ({
          name: subject,
          time: time,
          percentage: totalTime > 0 ? Math.round((time / totalTime) * 100) : 0,
        }));

      setStats({
        totalStudyTime: totalTime,
        topTopics,
        topSubjects,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSubjectEmoji = (subject) => {
    const emojis = {
      'Matemática': '🔢',
      'Ciências': '🔬',
      'História': '📜',
      'Geografia': '🌍',
      'Português': '📖',
      'Inglês': '🇬🇧',
      'Física': '⚛️',
      'Química': '🧪',
      'Biologia': '🧬',
      'Outros': '📚',
    };
    return emojis[subject] || '📚';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 50) return '#ff9800';
    if (percentage >= 30) return '#2196f3';
    return '#9c27b0';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando estatísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.gradient1, COLORS.gradient2]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Estatísticas</Text>
          <View style={styles.backBtn} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de tempo total */}
        <View style={styles.totalCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.totalCardGradient}
          >
            <Text style={styles.totalLabel}>⏱️ Tempo Total de Estudo</Text>
            <Text style={styles.totalTime}>{formatTime(stats.totalStudyTime)}</Text>
            <Text style={styles.totalSubtitle}>Continue assim! 🚀</Text>
          </LinearGradient>
        </View>

        {/* Top Matérias */}
        {stats.topSubjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Matérias Mais Estudadas</Text>
            {stats.topSubjects.map((subject, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemEmoji}>{getSubjectEmoji(subject.name)}</Text>
                    <View>
                      <Text style={styles.itemName}>{subject.name}</Text>
                      <Text style={styles.itemTime}>{formatTime(subject.time)}</Text>
                    </View>
                  </View>
                  <View style={styles.itemPercentage}>
                    <Text style={styles.percentageText}>{subject.percentage}%</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${subject.percentage}%`,
                        backgroundColor: getProgressColor(subject.percentage),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Tópicos */}
        {stats.topTopics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Tópicos Mais Estudados</Text>
            {stats.topTopics.map((topic, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemLeft}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {topic.name}
                      </Text>
                      <Text style={styles.itemTime}>{formatTime(topic.time)}</Text>
                    </View>
                  </View>
                  <View style={styles.itemPercentage}>
                    <Text style={styles.percentageText}>{topic.percentage}%</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${topic.percentage}%`,
                        backgroundColor: getProgressColor(topic.percentage),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Mensagem se não houver dados */}
        {stats.topTopics.length === 0 && stats.topSubjects.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyTitle}>Ainda não há dados</Text>
            <Text style={styles.emptyText}>
              Comece a estudar para ver suas estatísticas aqui!
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  totalCard: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.strong,
  },
  totalCardGradient: {
    padding: 30,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  totalTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  totalSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemPercentage: {
    backgroundColor: COLORS.primary + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 40,
  },
});
