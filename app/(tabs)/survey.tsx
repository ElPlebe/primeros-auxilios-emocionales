import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import ValidationMessage from '../../components/ValidationMessage';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import type { Phq4Answer, SafetyAnswer, SupportNeed } from '../../utils/assessment';
import {
  DISTRESS_OPTIONS,
  PHQ4_ITEMS,
  PHQ4_OPTIONS,
  SAFETY_OPTIONS,
  SUPPORT_NEEDS,
  assessSurvey,
  hasEmergencyRisk
} from '../../utils/assessment';
import { saveSurveyAssessment } from '../../utils/storage';

const createEmptyPhq4Answers = () => Array(PHQ4_ITEMS.length).fill(null) as (Phq4Answer | null)[];

export default function SurveyScreen() {
  const router = useRouter();
  const [safetyAnswer, setSafetyAnswer] = useState<SafetyAnswer | null>(null);
  const [distressBefore, setDistressBefore] = useState<number | null>(null);
  const [phq4Answers, setPhq4Answers] = useState<(Phq4Answer | null)[]>(createEmptyPhq4Answers);
  const [primaryNeed, setPrimaryNeed] = useState<SupportNeed | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePhq4Select = (questionIndex: number, value: Phq4Answer) => {
    const updated = [...phq4Answers];
    updated[questionIndex] = value;
    setPhq4Answers(updated);
  };

  const phq4Complete = phq4Answers.every((answer) => answer !== null);
  const isComplete = safetyAnswer === 'safe' && distressBefore !== null && phq4Complete && primaryNeed !== null;

  const handleSubmit = async () => {
    if (!safetyAnswer) {
      Alert.alert('Falta una respuesta', 'Indica primero si te encuentras a salvo.');
      return;
    }

    if (hasEmergencyRisk(safetyAnswer)) {
      router.replace('/emergency');
      return;
    }

    if (!phq4Complete || !primaryNeed || distressBefore === null) {
      Alert.alert('Faltan respuestas', 'Completa la evaluación breve para mostrar una orientación.');
      return;
    }

    const result = assessSurvey({
      safetyAnswer,
      distressBefore,
      phq4Answers: phq4Answers as [Phq4Answer, Phq4Answer, Phq4Answer, Phq4Answer],
      primaryNeed
    });

    setSubmitted(true);

    try {
      await saveSurveyAssessment(result);
    } catch {
      Alert.alert('Aviso', 'No se pudo guardar la evaluación, pero puedes continuar con tu resultado.');
    }

    setTimeout(() => {
      router.push({
        pathname: '/results',
        params: {
          level: result.level,
          distressBefore: String(result.distressBefore),
          phq4Score: String(result.phq4Score),
          anxietyScore: String(result.anxietyScore),
          depressionScore: String(result.depressionScore),
          primaryNeed: result.primaryNeed,
          recommendedExerciseIds: JSON.stringify(result.recommendedExerciseIds)
        }
      });
    }, 900);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!submitted ? (
        <>
          <Text style={styles.title}>Evaluación breve</Text>
          <Text style={styles.subtitle}>
            Esta evaluación orienta el tipo de apoyo inicial. No sustituye una valoración psicológica, psicoterapia ni atención de emergencia.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Seguridad inmediata</Text>
            <Text style={styles.helperText}>Antes de seguir, ubica si estás en una situación que requiere ayuda urgente.</Text>

            {SAFETY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                accessibilityHint="Toca dos veces para seleccionar esta respuesta."
                accessibilityLabel={`${option.label}. ${option.description}${
                  safetyAnswer === option.value ? ' Seleccionado.' : ''
                }`}
                accessibilityRole="radio"
                accessibilityState={{ selected: safetyAnswer === option.value }}
                style={[
                  styles.choiceButton,
                  safetyAnswer === option.value && styles.choiceSelected,
                  option.value !== 'safe' && styles.riskChoice
                ]}
                onPress={() => setSafetyAnswer(option.value)}
              >
                <Text style={[styles.choiceTitle, safetyAnswer === option.value && styles.choiceTextSelected]}>
                  {option.label}
                </Text>
                <Text style={[styles.choiceDescription, safetyAnswer === option.value && styles.choiceTextSelected]}>
                  {option.description}
                </Text>
                {safetyAnswer === option.value && <Text style={styles.selectedChoiceText}>Seleccionado</Text>}
              </TouchableOpacity>
            ))}

            {safetyAnswer && hasEmergencyRisk(safetyAnswer) && (
              <View style={styles.emergencyBox}>
                <Text style={styles.emergencyTitle}>Prioricemos tu seguridad.</Text>
                <Text style={styles.emergencyText}>
                  Si estás en riesgo o no te sientes seguro/a, busca apoyo inmediato antes de continuar.
                </Text>
                <PrimaryButton
                  title="Ir a ayuda urgente"
                  onPress={() => router.replace('/emergency')}
                  variant="danger"
                  style={styles.emergencyButton}
                  accessibilityHint="Abre opciones de ayuda urgente."
                />
              </View>
            )}
          </View>

          {safetyAnswer === 'safe' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Malestar actual</Text>
                <Text style={styles.helperText}>Del 0 al 10, ¿qué tan intenso es tu malestar en este momento?</Text>
                <View style={styles.scaleGrid}>
                  {DISTRESS_OPTIONS.map((value) => (
                    <TouchableOpacity
                      key={value}
                      accessibilityHint="Toca dos veces para seleccionar este nivel."
                      accessibilityLabel={`Nivel de malestar ${value} de 10${
                        distressBefore === value ? ', seleccionado' : ''
                      }`}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: distressBefore === value }}
                      style={[styles.scaleButton, distressBefore === value && styles.scaleSelected]}
                      onPress={() => setDistressBefore(value)}
                    >
                      <Text style={[styles.scaleText, distressBefore === value && styles.scaleTextSelected]}>
                        {distressBefore === value ? `${value}✓` : value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Tamizaje PHQ-4</Text>
                <Text style={styles.helperText}>Durante las últimas dos semanas, ¿con qué frecuencia te ha pasado lo siguiente?</Text>

                {PHQ4_ITEMS.map((question, questionIndex) => (
                  <View key={question.id} style={styles.questionBlock}>
                    <Text style={styles.question}>{question.text}</Text>
                    <View style={styles.optionsRow}>
                      {PHQ4_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          accessibilityHint="Toca dos veces para seleccionar esta frecuencia."
                          accessibilityLabel={`${question.text} Respuesta: ${option.label}${
                            phq4Answers[questionIndex] === option.value ? ', seleccionada' : ''
                          }`}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: phq4Answers[questionIndex] === option.value }}
                          style={[
                            styles.optionButton,
                            phq4Answers[questionIndex] === option.value && styles.optionSelected
                          ]}
                          onPress={() => handlePhq4Select(questionIndex, option.value)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              phq4Answers[questionIndex] === option.value && styles.optionTextSelected
                            ]}
                          >
                            {option.label}
                          </Text>
                          {phq4Answers[questionIndex] === option.value && (
                            <Text style={styles.selectedOptionText}>Elegido</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Necesidad principal</Text>
                <Text style={styles.helperText}>Elige qué te ayudaría primero. Esta parte sigue la lógica de observar, escuchar y conectar.</Text>

                {SUPPORT_NEEDS.map((need) => (
                  <TouchableOpacity
                    key={need.value}
                    accessibilityHint="Toca dos veces para seleccionar esta necesidad principal."
                    accessibilityLabel={`${need.label}. ${need.description}${
                      primaryNeed === need.value ? ' Seleccionado.' : ''
                    }`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: primaryNeed === need.value }}
                    style={[styles.choiceButton, primaryNeed === need.value && styles.choiceSelected]}
                    onPress={() => setPrimaryNeed(need.value)}
                  >
                    <Text style={[styles.choiceTitle, primaryNeed === need.value && styles.choiceTextSelected]}>
                      {need.label}
                    </Text>
                    <Text style={[styles.choiceDescription, primaryNeed === need.value && styles.choiceTextSelected]}>
                      {need.description}
                    </Text>
                    {primaryNeed === need.value && <Text style={styles.selectedChoiceText}>Seleccionado</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              {isComplete ? (
                <PrimaryButton
                  title="Ver orientación"
                  onPress={handleSubmit}
                  accessibilityHint="Muestra una orientación breve basada en tus respuestas."
                />
              ) : (
                <Text style={styles.incompleteText}>Completa las secciones para recibir una orientación.</Text>
              )}
            </>
          )}
        </>
      ) : (
        <ValidationMessage
          title="Evaluación registrada"
          message="Gracias por darte este momento. Preparando una orientación breve y no diagnóstica."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.padding
  },
  section: {
    marginBottom: SIZES.padding
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 6
  },
  helperText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.base
  },
  choiceButton: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    minHeight: 56,
    padding: 14,
    marginBottom: SIZES.base
  },
  choiceSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  riskChoice: {
    borderColor: '#F5B7B1'
  },
  choiceTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2
  },
  choiceDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted
  },
  choiceTextSelected: {
    color: '#fff'
  },
  selectedChoiceText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginTop: 6
  },
  emergencyBox: {
    backgroundColor: '#FDECEA',
    borderLeftColor: COLORS.error,
    borderLeftWidth: 5,
    borderRadius: SIZES.radius,
    padding: 14,
    marginTop: SIZES.base
  },
  emergencyTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.error,
    marginBottom: 4
  },
  emergencyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  emergencyButton: {
    marginTop: 0
  },
  scaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  scaleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E6ED'
  },
  scaleSelected: {
    backgroundColor: COLORS.primary
  },
  scaleText: {
    color: COLORS.text,
    fontFamily: FONTS.bold
  },
  scaleTextSelected: {
    color: '#fff'
  },
  questionBlock: {
    marginBottom: SIZES.padding
  },
  question: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#E0E6ED',
    borderRadius: 8,
    marginBottom: 8
  },
  optionSelected: {
    backgroundColor: COLORS.primary
  },
  optionText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 13
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: FONTS.bold
  },
  selectedOptionText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center'
  },
  incompleteText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    marginTop: SIZES.base
  }
});
