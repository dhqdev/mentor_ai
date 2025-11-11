import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);

  const steps = [
    {
      emoji: '🎓',
      title: 'Aprenda Qualquer Coisa',
      description: 'Explicações personalizadas com Inteligência Artificial para você dominar qualquer assunto',
      features: [
        '🤖 IA que adapta ao seu nível',
        '🧠 Mapas mentais visuais',
        '💬 Chat inteligente com contexto',
        '📈 Acompanhe sua evolução',
      ],
    },
    {
      emoji: '🚀',
      title: 'Estude Mais Eficiente',
      description: 'Ferramentas poderosas para turbinar seus estudos',
      features: [
        '🌱 Progresso visual por tema',
        '📝 Anotações organizadas',
        '🎯 Foco no que importa',
        '🏆 Sistema de conquistas',
      ],
    },
  ];

  const goals = [
    { id: 'school', label: '📚 Estudar para a escola', icon: '📚' },
    { id: 'college', label: '🎓 Preparar para vestibular', icon: '🎓' },
    { id: 'work', label: '💼 Aprender para o trabalho', icon: '💼' },
    { id: 'hobby', label: '✨ Curiosidade pessoal', icon: '✨' },
    { id: 'languages', label: '🌍 Aprender idiomas', icon: '🌍' },
    { id: 'tech', label: '💻 Programação e Tech', icon: '💻' },
  ];

  const toggleGoal = (goalId) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    if (!userName.trim()) {
      Alert.alert('Ops!', 'Por favor, digite seu nome');
      return;
    }

    if (!userAge.trim() || isNaN(userAge) || parseInt(userAge) < 5 || parseInt(userAge) > 100) {
      Alert.alert('Ops!', 'Por favor, digite uma idade válida');
      return;
    }

    if (selectedGoals.length === 0) {
      Alert.alert('Ops!', 'Selecione pelo menos um objetivo');
      return;
    }

    try {
      const userProfile = {
        name: userName.trim(),
        age: parseInt(userAge),
        goals: selectedGoals,
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('onboardingCompleted', 'true');

      navigation.replace('Main');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu perfil. Tente novamente.');
    }
  };

  const renderOnboardingStep = () => {
    const step = steps[currentStep];
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepEmoji}>{step.emoji}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>

        <View style={styles.featuresContainer}>
          {step.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentStep === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={[COLORS.gradient1, COLORS.gradient2]}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProfileForm = () => {
    return (
      <ScrollView 
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.formEmoji}>👤</Text>
        <Text style={styles.formTitle}>Vamos nos conhecer!</Text>
        <Text style={styles.formSubtitle}>Crie seu perfil em segundos</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📝 Qual é o seu nome?</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor={COLORS.textLight}
            value={userName}
            onChangeText={setUserName}
            maxLength={50}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>🎂 Quantos anos você tem?</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua idade"
            placeholderTextColor={COLORS.textLight}
            value={userAge}
            onChangeText={setUserAge}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>

        <View style={styles.goalsContainer}>
          <Text style={styles.goalsTitle}>🎯 Quais são seus objetivos?</Text>
          <Text style={styles.goalsSubtitle}>Selecione um ou mais</Text>

          <View style={styles.goalsGrid}>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoals.includes(goal.id) && styles.goalCardSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text style={[
                  styles.goalLabel,
                  selectedGoals.includes(goal.id) && styles.goalLabelSelected,
                ]}>
                  {goal.label.replace(goal.icon + ' ', '')}
                </Text>
                {selectedGoals.includes(goal.id) && (
                  <View style={styles.goalCheck}>
                    <Text style={styles.goalCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <LinearGradient
            colors={[COLORS.gradient1, COLORS.gradient2]}
            style={styles.finishButtonGradient}
          >
            <Text style={styles.finishButtonText}>Começar a estudar! 🚀</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#f8f9fa', '#ffffff']}
        style={styles.gradient}
      >
        {currentStep < steps.length ? renderOnboardingStep() : renderProfileForm()}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  stepEmoji: {
    fontSize: 100,
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 50,
  },
  featureItem: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 30,
  },
  nextButton: {
    width: '100%',
    marginBottom: 20,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  formEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  formSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    ...SHADOWS.light,
  },
  goalsContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  goalsSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.light,
  },
  goalCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  goalLabelSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  goalCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCheckText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  finishButton: {
    width: '100%',
    marginTop: 20,
  },
  finishButtonGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    ...SHADOWS.strong,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});
