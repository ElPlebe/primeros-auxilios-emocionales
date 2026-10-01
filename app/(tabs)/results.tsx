import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EmotionMessage from '../../components/EmotionMessage';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getCrisisRouteForResult } from '../../features/crisis/crisisRouting';
import type { ExerciseId } from '../../utils/assessment';
import {
  EXERCISE_LABELS,
  RESULT_CONTENT,
  getExerciseRecommendations,
  isExerciseId,
  normalizeDistressLevel,
  normalizeDistressValue,
  normalizeSupportNeed
} from '../../utils/assessment';

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const parseRecommendations = (value: string | string[] | undefined): ExerciseId[] => {
  const rawValue = firstParam(value);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(isExerciseId) : [];
  } catch {
    return [];
  }
};

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const level = normalizeDistressLevel(firstParam(params.level));
  const primaryNeed = normalizeSupportNeed(firstParam(params.primaryNeed)) ?? 'calma';
  const distressBefore = normalizeDistressValue(firstParam(params.distressBefore));
  const phq4Score = firstParam(params.phq4Score);
  const anxietyScore = firstParam(params.anxietyScore);
  const depressionScore = firstParam(params.depressionScore);
  const parsedRecommendations = parseRecommendations(params.recommendedExerciseIds);
  const recommendations = parsedRecommendations.length > 0
    ? parsedRecommendations
    : getExerciseRecommendations(level, primaryNeed);
  const { emotionType, emotionTitle, message } = RESULT_CONTENT[level];
  const crisisRoute = getCrisisRouteForResult({ level, distressBefore });

  const openExercise = (exerciseId: ExerciseId) => {
    router.push({
      pathname: '/exercises/[id]',
      params: {
        id: exerciseId,
        distressBefore: distressBefore === null ? undefined : String(distressBefore),
        assessmentLevel: level
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>Resultado emocional</Text>

      <EmotionMessage
        title={emotionTitle}
        message={message}
        type={emotionType}
      />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Tamizaje PHQ-4: {phq4Score ?? 'sin dato'} / 12
        </Text>
        <Text style={styles.summaryText}>
          Ansiedad: {anxietyScore ?? 'sin dato'} / 6 · Depresión: {depressionScore ?? 'sin dato'} / 6
        </Text>
        <Text style={styles.summaryText}>
          Malestar actual: {distressBefore ?? 'sin dato'} / 10
        </Text>
      </View>

      <Text style={styles.disclaimer}>
        Esta orientación no es un diagnóstico. Sirve para elegir un ejercicio breve y decidir si conviene buscar apoyo profesional.
      </Text>

      {crisisRoute && (
        <View style={styles.crisisBox}>
          <Text style={styles.crisisTitle}>Prioriza apoyo inmediato</Text>
          <Text style={styles.crisisText}>
            Por la intensidad reportada, conviene revisar primero opciones de ayuda y contacto.
          </Text>
          <PrimaryButton
            title="Abrir modo crisis"
            onPress={() => router.push(crisisRoute)}
            variant="danger"
            style={styles.crisisButton}
          />
        </View>
      )}

      <Text style={styles.subtitle}>Ejercicios sugeridos</Text>
      {recommendations.map((exerciseId) => (
        <PrimaryButton
          key={exerciseId}
          title={EXERCISE_LABELS[exerciseId]}
          onPress={() => openExercise(exerciseId)}
          style={exerciseId === 'ayuda' ? styles.urgentExerciseButton : styles.exerciseButton}
          textStyle={exerciseId === 'ayuda' ? undefined : styles.exerciseButtonText}
        />
      ))}

      {level === 'severo' && !crisisRoute && (
        <PrimaryButton
          title="Ver opciones de ayuda urgente"
          onPress={() => router.push('/crisis')}
          style={styles.emergencyButton}
        />
      )}

      <PrimaryButton
        title="Ver todos los ejercicios"
        onPress={() => router.push('/exercises')}
        style={styles.secondaryButton}
        textStyle={styles.secondaryButtonText}
      />

      <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/')}>
        <Text style={styles.linkText}>Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  summaryBox: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: SIZES.base * 2
  },
  summaryText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 4
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.padding
  },
  crisisBox: {
    backgroundColor: '#FDECEA',
    borderColor: COLORS.error,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: SIZES.padding,
    padding: 14
  },
  crisisTitle: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
    fontSize: 17,
    marginBottom: 4
  },
  crisisText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SIZES.base
  },
  crisisButton: {
    marginTop: 0
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  exerciseButton: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: SIZES.base
  },
  exerciseButtonText: {
    color: COLORS.text
  },
  urgentExerciseButton: {
    backgroundColor: COLORS.error,
    marginBottom: SIZES.base
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    marginTop: SIZES.base,
    marginBottom: SIZES.base
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    marginTop: SIZES.base
  },
  secondaryButtonText: {
    color: COLORS.text
  },
  linkButton: {
    marginTop: SIZES.base * 2,
    alignItems: 'center'
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular
  }
});
