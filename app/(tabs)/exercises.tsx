import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import type { ExerciseId } from '../../utils/assessment';
import { EXERCISE_LIST, PRIMARY_EXERCISES } from '../../utils/exerciseCatalog';

const CATEGORY_ORDER = [
  'Seguridad y crisis',
  'Calmar el cuerpo',
  'Volver al presente',
  'Activación breve',
  'Claridad emocional',
  'Autocompasión'
];

const MODALITY_LABELS = {
  audio: 'audio',
  texto: 'texto',
  cuerpo: 'cuerpo',
  contacto: 'contacto'
};

function getExercisesByCategory(categoryLabel: string) {
  return EXERCISE_LIST.filter((exercise) => exercise.categoryLabel === categoryLabel);
}

export default function ExercisesScreen() {
  const router = useRouter();

  const openExercise = (id: ExerciseId) => {
    router.push({
      pathname: '/exercises/[id]',
      params: { id }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ejercicios emocionales</Text>
      <Text style={styles.subtitle}>
        Elige el apoyo según lo que necesitas ahora. Si hay riesgo o no puedes mantenerte a salvo, prioriza ayuda urgente.
      </Text>

      <PrimaryButton
        title="Necesito ayuda urgente"
        onPress={() => router.push('/crisis')}
        variant="danger"
        style={styles.topAction}
        accessibilityHint="Abre opciones de emergencia, Línea de la Vida y contacto de confianza."
      />
      <PrimaryButton
        title="Guíame ahora"
        onPress={() => openExercise('grounding')}
        variant="secondary"
        style={styles.topAction}
        accessibilityHint="Abre un ejercicio de grounding breve para volver al presente."
      />

      <Text style={styles.sectionTitle}>Recomendados para crisis y regulación</Text>
      <View style={styles.quickGrid}>
        {PRIMARY_EXERCISES.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            accessibilityRole="button"
            accessibilityLabel={`${exercise.title}. ${exercise.durationMinutes} minutos. ${exercise.categoryLabel}.`}
            activeOpacity={0.84}
            style={styles.quickCard}
            onPress={() => openExercise(exercise.id)}
          >
            <Text style={styles.cardTitle}>{exercise.title}</Text>
            <Text style={styles.cardMeta}>
              {exercise.durationMinutes} min · {exercise.modalities.map((modality) => MODALITY_LABELS[modality]).join(', ')}
            </Text>
            <Text style={styles.cardText}>{exercise.goal}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {CATEGORY_ORDER.map((categoryLabel) => {
        const exercises = getExercisesByCategory(categoryLabel);
        if (exercises.length === 0) return null;

        return (
          <View key={categoryLabel} style={styles.categorySection}>
            <Text style={styles.sectionTitle}>{categoryLabel}</Text>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                accessibilityRole="button"
                accessibilityLabel={`${exercise.title}. ${exercise.durationMinutes} minutos. ${exercise.description}`}
                activeOpacity={0.84}
                style={styles.exerciseRow}
                onPress={() => openExercise(exercise.id)}
              >
                <View style={styles.exerciseTextWrap}>
                  <Text style={styles.rowTitle}>{exercise.title}</Text>
                  <Text style={styles.rowDescription}>{exercise.description}</Text>
                  <Text style={styles.cardMeta}>
                    {exercise.durationMinutes} min · {exercise.modalities.map((modality) => MODALITY_LABELS[modality]).join(', ')}
                  </Text>
                </View>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
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
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 23,
    marginBottom: SIZES.padding
  },
  topAction: {
    marginBottom: SIZES.base
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base
  },
  quickGrid: {
    gap: SIZES.base
  },
  quickCard: {
    backgroundColor: '#EAF6FF',
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 14
  },
  categorySection: {
    marginBottom: SIZES.base
  },
  exerciseRow: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: SIZES.base,
    minHeight: 84,
    padding: 14
  },
  exerciseTextWrap: {
    flex: 1
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 4
  },
  rowTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 3
  },
  rowDescription: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6
  },
  cardText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20
  },
  cardMeta: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  rowArrow: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 28,
    marginLeft: SIZES.base
  }
});
