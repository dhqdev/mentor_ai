import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

export default function HistoryScreen({ navigation }) {
  const { history, favorites, stats } = useApp();
  const [activeTab, setActiveTab] = useState('history');
  const [searchText, setSearchText] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const diff = new Date() - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Agora há pouco';
    if (hours < 24) return `Há ${hours}h`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `Há ${days} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Aplicar filtros
  let dataToShow = activeTab === 'history' ? history : favorites;
  
  // Filtrar por busca
  if (searchText) {
    dataToShow = dataToShow.filter(item => 
      item.topic.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  
  // Ordenar por mais recentes
  dataToShow = [...dataToShow].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.gradient1, COLORS.gradient2]} style={styles.header}>
        <Text style={styles.headerTitle}>📚 Meu Aprendizado</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalExplanations || 0}</Text>
            <Text style={styles.statLabel}>Explicações</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.daysUsed?.length || 0}</Text>
            <Text style={styles.statLabel}>Dias</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Object.keys(stats.topics || {}).length}</Text>
            <Text style={styles.statLabel}>Temas</Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.tabActive]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>📖 Histórico ({history.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'favorites' && styles.tabActive]} onPress={() => setActiveTab('favorites')}>
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>❤️ Favoritos ({favorites.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tópicos..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {dataToShow.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{searchText ? '🔍' : activeTab === 'history' ? '📚' : '❤️'}</Text>
            <Text style={styles.emptyTitle}>
              {searchText 
                ? 'Nenhum resultado encontrado' 
                : activeTab === 'history' ? 'Nenhuma explicação ainda' : 'Nenhum favorito ainda'}
            </Text>
            {!searchText && activeTab === 'history' && (
              <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.emptyButtonText}>🚀 Começar Agora</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          dataToShow.map((item, index) => (
            <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => navigation.navigate('Explanation', { topic: item.topic, explanation: item.explanation, ageLevel: item.ageLevel, style: item.style })}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.topic}</Text>
                <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
              </View>
              {item.explanation?.resumo && <Text style={styles.cardDescription} numberOfLines={2}>{item.explanation.resumo}</Text>}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#FFF', opacity: 0.9, textAlign: 'center' },
  tabsContainer: { flexDirection: 'row', backgroundColor: COLORS.cardBackground, marginHorizontal: 20, marginTop: -20, borderRadius: 12, padding: 4, ...SHADOWS.medium },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: '#FFF' },
  
  // Busca
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBackground, marginHorizontal: 20, marginTop: 16, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, ...SHADOWS.light },
  searchIcon: { fontSize: 20, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  clearIcon: { fontSize: 20, color: COLORS.textLight, paddingHorizontal: 8 },
  
  content: { flex: 1, padding: 20 },
  historyCard: { backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 16, marginBottom: 12, ...SHADOWS.light },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1, marginRight: 12 },
  cardDate: { fontSize: 12, color: COLORS.textLight },
  cardDescription: { fontSize: 14, color: COLORS.textLight, lineHeight: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 24, textAlign: 'center' },
  emptyButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  emptyButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
