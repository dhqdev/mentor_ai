import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../utils/theme';

export default function InteractiveMindMap({ topic, explanation }) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Gerar nós do mapa mental baseado na explicação
  const generateNodes = () => {
    const text = typeof explanation === 'string' ? explanation : (explanation?.explicacao || '');
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
      title: sentence.trim().substring(0, 60) + (sentence.trim().length > 60 ? '...' : ''),
      fullText: sentence.trim(),
      colors: colors[i % colors.length],
    }));

    return nodes;
  };

  const nodes = generateNodes();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Mapa Mental</Text>
        <Text style={styles.subtitle}>{topic}</Text>
      </View>

      <View style={styles.grid}>
        {nodes.map((node) => (
          <TouchableOpacity
            key={node.id}
            style={styles.nodeWrapper}
            onPress={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={node.colors}
              style={[
                styles.node,
                selectedNode === node.id && styles.nodeSelected
              ]}
            >
              <View style={styles.nodeNumber}>
                <Text style={styles.nodeNumberText}>{node.id + 1}</Text>
              </View>
              <Text style={styles.nodeTitle} numberOfLines={selectedNode === node.id ? 10 : 3}>
                {selectedNode === node.id ? node.fullText : node.title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.hint}>
        <Text style={styles.hintText}>💡 Toque nos cards para expandir</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nodeWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  node: {
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
    justifyContent: 'space-between',
    ...SHADOWS.strong,
  },
  nodeSelected: {
    minHeight: 200,
    ...SHADOWS.extraStrong,
  },
  nodeNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nodeNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  nodeTitle: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
    fontWeight: '600',
  },
  hint: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
