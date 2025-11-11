import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

export default function QuizScreen({ route, navigation }) {
  const { quiz, topic } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const question = quiz.perguntas[currentQuestion];
  const totalQuestions = quiz.perguntas.length;

  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === question.respostaCorreta;
    setAnswers([...answers, { question: question.pergunta, selected: selectedAnswer, correct: question.respostaCorreta, isCorrect }]);
    if (isCorrect) setScore(score + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  if (quizFinished) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.gradient1, COLORS.gradient2]} style={styles.finishHeader}>
          <Text style={styles.finishEmoji}>{score === totalQuestions ? '🏆' : score >= totalQuestions/2 ? '🎉' : '💪'}</Text>
          <Text style={styles.finishTitle}>Quiz Concluído!</Text>
          <Text style={styles.finishScore}>{score} de {totalQuestions}</Text>
        </LinearGradient>
        <ScrollView style={styles.content}>
          {answers.map((answer, index) => (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.resultText}>Pergunta {index + 1}: {answer.isCorrect ? '✅' : '❌'}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeButton}>
            <Text style={styles.homeButtonText}>🏠 Voltar ao Início</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.gradient1, COLORS.gradient2]} style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Pergunta {currentQuestion + 1} de {totalQuestions}</Text>
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.pergunta}</Text>
          {question.opcoes.map((opcao, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.respostaCorreta;
            const showCorrect = showExplanation && isCorrect;
            const showWrong = showExplanation && isSelected && !isCorrect;
            return (
              <TouchableOpacity key={index} style={[styles.optionCard, isSelected && !showExplanation && styles.optionSelected, showCorrect && styles.optionCorrect, showWrong && styles.optionWrong]} onPress={() => !showExplanation && setSelectedAnswer(index)} disabled={showExplanation}>
                <Text style={styles.optionText}>{String.fromCharCode(65 + index)}. {opcao}</Text>
              </TouchableOpacity>
            );
          })}
          {showExplanation && (
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>{selectedAnswer === question.respostaCorreta ? '🎉 Correto!' : '📚 Explicação'}</Text>
              <Text style={styles.explanationText}>{question.explicacao}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={showExplanation ? handleNext : handleConfirm}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{showExplanation ? (currentQuestion < totalQuestions - 1 ? 'Próxima →' : 'Ver Resultado') : 'Confirmar'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  closeButtonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerText: { color: '#FFF', fontSize: 16 },
  content: { flex: 1, padding: 20 },
  questionCard: { backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 20, marginBottom: 20, ...SHADOWS.medium },
  questionText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  optionCard: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: COLORS.border },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
  optionCorrect: { borderColor: COLORS.success, backgroundColor: `${COLORS.success}10` },
  optionWrong: { borderColor: COLORS.error, backgroundColor: `${COLORS.error}10` },
  optionText: { fontSize: 15, color: COLORS.text },
  explanationCard: { marginTop: 20, padding: 16, backgroundColor: `${COLORS.primary}10`, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  explanationTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  explanationText: { fontSize: 14, color: COLORS.text },
  confirmButton: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.medium, marginBottom: 20 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  finishHeader: { paddingTop: 80, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  finishEmoji: { fontSize: 80, marginBottom: 16 },
  finishTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  finishScore: { fontSize: 48, fontWeight: 'bold', color: '#FFF' },
  resultCard: { backgroundColor: COLORS.cardBackground, borderRadius: 12, padding: 16, marginBottom: 12, ...SHADOWS.light },
  resultText: { fontSize: 14, color: COLORS.text },
  homeButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  homeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
