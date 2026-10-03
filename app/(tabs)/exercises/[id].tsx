import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import ValidationMessage from '../../../components/ValidationMessage';
import { COLORS, FONTS, SIZES } from '../../../constants/theme';
import { getCrisisRouteForExerciseFollowUp } from '../../../features/crisis/crisisRouting';
import type { ExerciseId, HelpfulRating } from '../../../utils/assessment';
import {
  DISTRESS_OPTIONS,
  HELPFUL_RATING_OPTIONS,
  buildExerciseFollowUp,
  getDistressDelta,
  isExerciseId,
  normalizeDistressLevel,
  normalizeDistressValue,
  shouldRequireHelpfulRating
} from '../../../utils/assessment';
import { EXERCISE_CATALOG } from '../../../utils/exerciseCatalog';
import { saveCompletedExercise, saveExerciseFollowUp } from '../../../utils/storage';

const imageForExercise: Record<ExerciseId, any> = {
  respiracion: require('../../../assets/images/respiracion-decorativa.png'),
  grounding: require('../../../assets/images/grounding.png'),
  afirmaciones: require('../../../assets/images/afirmaciones-positivas.png'),
  escritura: require('../../../assets/images/escritura-emocional.png'),
  escucha: require('../../../assets/images/escucha-consciente.png'),
  ayuda: require('../../../assets/images/contacto-ayuda.png'),
  afirmacionesAnsiedad: require('../../../assets/images/afirmaciones-ansiedad.png'),
  visualizacion: require('../../../assets/images/visualizacion-calmante.png'),
  movimiento: require('../../../assets/images/ejercicio-fisico-suave.png'),
  relajacion: require('../../../assets/images/respiracion.png')
};

const audioForExercise: Partial<Record<ExerciseId, any>> = {
  respiracion: require('../../../assets/audios/respiracion-guiada.mp3'),
  afirmaciones: require('../../../assets/audios/afirmaciones-positivas.mp3'),
  escucha: require('../../../assets/audios/escucha-consciente.mp3'),
  afirmacionesAnsiedad: require('../../../assets/audios/afirmaciones-ansiedad.mp3'),
  visualizacion: require('../../../assets/audios/visualizacion-calmante.mp3'),
  movimiento: require('../../../assets/audios/ejercicio-fisico-suave.mp3')
};

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function DistressSelector({
  selected,
  onSelect
}: {
  selected: number | null;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.scaleGrid}>
      {DISTRESS_OPTIONS.map((value) => (
        <TouchableOpacity
          key={value}
          accessibilityHint="Toca dos veces para seleccionar este nivel."
          accessibilityLabel={`Nivel de malestar ${value} de 10${selected === value ? ', seleccionado' : ''}`}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === value }}
          style={[styles.scaleButton, selected === value && styles.scaleSelected]}
          onPress={() => onSelect(value)}
        >
          <Text style={[styles.scaleText, selected === value && styles.scaleTextSelected]}>
            {selected === value ? `${value}✓` : value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function HelpfulRatingSelector({
  selected,
  onSelect
}: {
  selected: HelpfulRating | null;
  onSelect: (value: HelpfulRating) => void;
}) {
  return (
    <View style={styles.ratingGrid}>
      {HELPFUL_RATING_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          accessibilityHint="Toca dos veces para seleccionar esta calificación."
          accessibilityLabel={`Utilidad percibida ${option.value} de 5, ${option.label}${
            selected === option.value ? ', seleccionada' : ''
          }`}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === option.value }}
          style={[styles.ratingButton, selected === option.value && styles.ratingSelected]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[styles.ratingValue, selected === option.value && styles.ratingValueSelected]}>
            {option.value}
          </Text>
          <Text style={[styles.ratingLabel, selected === option.value && styles.ratingLabelSelected]}>
            {option.label}
          </Text>
          {selected === option.value && <Text style={styles.ratingSelectedText}>Elegido</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const getChangeMessage = (delta: number) => {
  if (delta < 0) {
    const points = Math.abs(delta);
    return `Tu malestar bajó ${points} ${points === 1 ? 'punto' : 'puntos'} después del ejercicio.`;
  }

  if (delta === 0) {
    return 'Tu malestar se mantuvo igual. A veces regularse toma más de un intento; puedes probar otro ejercicio o buscar apoyo.';
  }

  return 'Tu malestar subió. Considera contactar a alguien de confianza o revisar las opciones de ayuda urgente.';
};

export default function ExerciseDetailScreen() {
  const { id, distressBefore, assessmentLevel, source } = useLocalSearchParams();
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distressBeforeValue, setDistressBeforeValue] = useState<number | null>(() =>
    normalizeDistressValue(firstParam(distressBefore))
  );
  const [distressAfterValue, setDistressAfterValue] = useState<number | null>(null);
  const [helpfulRating, setHelpfulRating] = useState<HelpfulRating | null>(null);
  const [helpfulComment, setHelpfulComment] = useState('');

  const exerciseId = firstParam(id);
  const content = isExerciseId(exerciseId) ? EXERCISE_CATALOG[exerciseId] : null;
  const assessmentLevelParam = firstParam(assessmentLevel);
  const normalizedAssessmentLevel = assessmentLevelParam ? normalizeDistressLevel(assessmentLevelParam) : undefined;
  const sourceParam = firstParam(source);
  const distressDelta = distressBeforeValue !== null && distressAfterValue !== null
    ? getDistressDelta(distressBeforeValue, distressAfterValue)
    : null;
  const crisisRoute = distressBeforeValue !== null && distressAfterValue !== null
    ? getCrisisRouteForExerciseFollowUp({
        distressBefore: distressBeforeValue,
        distressAfter: distressAfterValue
      })
    : null;

  const playAudio = async () => {
    try {
      if (isExerciseId(exerciseId) && audioForExercise[exerciseId]) {
        if (sound) {
          await sound.playAsync();
          setIsAudioPlaying(true);
          return;
        }

        const { sound: createdSound } = await Audio.Sound.createAsync(audioForExercise[exerciseId]);
        createdSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setIsAudioPlaying(status.isPlaying);
          }
        });
        setSound(createdSound);
        await createdSound.playAsync();
        setIsAudioPlaying(true);
      } else {
        Alert.alert('Audio no disponible', 'Este ejercicio no tiene audio asociado.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo reproducir el audio.');
    }
  };

  const pauseAudio = async () => {
    if (!sound) return;
    await sound.pauseAsync();
    setIsAudioPlaying(false);
  };

  const stopAudio = async () => {
    if (!sound) return;
    await sound.stopAsync();
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [exerciseId]);

  if (!content || !isExerciseId(exerciseId)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ejercicio no encontrado</Text>
        <PrimaryButton title="Volver a ejercicios" onPress={() => router.back()} style={{ marginVertical: 6 }} />
      </View>
    );
  }

  const handleComplete = () => {
    if (distressBeforeValue === null) {
      Alert.alert('Antes de finalizar', 'Selecciona tu nivel de malestar inicial para poder comparar el cambio.');
      return;
    }

    setCompleted(true);
  };

  const currentStep = content?.steps[currentStepIndex];

  const handleSaveProgress = async () => {
    if (distressBeforeValue === null || distressAfterValue === null) {
      Alert.alert('Falta la reevaluación', 'Selecciona cómo está tu malestar después del ejercicio.');
      return;
    }

    if (
      helpfulRating === null &&
      shouldRequireHelpfulRating({
        assessmentLevel: normalizedAssessmentLevel,
        source: sourceParam,
        distressBefore: distressBeforeValue,
        distressAfter: distressAfterValue
      })
    ) {
      Alert.alert('Falta tu opinión', 'Selecciona del 1 al 5 qué tanto te ayudó este ejercicio.');
      return;
    }

    try {
      await saveCompletedExercise(exerciseId);
      await saveExerciseFollowUp(buildExerciseFollowUp({
        exerciseId,
        distressBefore: distressBeforeValue,
        distressAfter: distressAfterValue,
        helpfulRating: helpfulRating ?? undefined,
        helpfulComment,
        assessmentLevel: normalizedAssessmentLevel
      }));
      setSaved(true);
      Alert.alert('Seguimiento guardado', 'Se registró cómo te sentías antes y después del ejercicio.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar tu seguimiento. Intenta nuevamente.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!completed ? (
        <>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.description}>{content.description}</Text>
          <Text style={styles.metaText}>
            {content.categoryLabel} · {content.durationMinutes} minutos
          </Text>

          <View style={styles.followUpBox}>
            <Text style={styles.followUpTitle}>Antes de empezar</Text>
            <Text style={styles.followUpText}>Del 0 al 10, ¿qué tan intenso es tu malestar ahora?</Text>
            <DistressSelector selected={distressBeforeValue} onSelect={setDistressBeforeValue} />
          </View>

          <View style={styles.visualContainer}>
            <Image
              source={imageForExercise[exerciseId]}
              style={styles.image}
              resizeMode="contain"
            />
            {audioForExercise[exerciseId] && (
              <View style={styles.audioControls}>
                <PrimaryButton
                  title={isAudioPlaying ? 'Audio reproduciéndose' : 'Reproducir audio'}
                  onPress={playAudio}
                  disabled={isAudioPlaying}
                  style={styles.audioButton}
                  accessibilityHint="Reproduce la guía auditiva de este ejercicio."
                />
                <PrimaryButton
                  title="Pausar audio"
                  onPress={pauseAudio}
                  disabled={!sound || !isAudioPlaying}
                  variant="secondary"
                  style={styles.audioButton}
                  accessibilityHint="Pausa la guía auditiva."
                />
                <PrimaryButton
                  title="Detener audio"
                  onPress={stopAudio}
                  disabled={!sound}
                  variant="ghost"
                  style={styles.audioButton}
                  accessibilityHint="Detiene la guía auditiva y vuelve al inicio del audio."
                />
              </View>
            )}
          </View>

          <View style={styles.guidanceBox}>
            <Text style={styles.stepsTitle}>Cuándo usarlo</Text>
            <Text style={styles.step}>{content.recommendedWhen}</Text>
            <Text style={styles.stepsTitle}>Cuándo pausar o cambiar</Text>
            <Text style={styles.step}>{content.avoidWhen}</Text>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepsTitle}>Paso {currentStepIndex + 1} de {content.steps.length}</Text>
            <Text style={styles.currentStep}>{currentStep}</Text>
            <View style={styles.stepControls}>
              <PrimaryButton
                title="Anterior"
                onPress={() => setCurrentStepIndex((value) => Math.max(0, value - 1))}
                disabled={currentStepIndex === 0}
                variant="ghost"
                style={styles.stepButton}
              />
              <PrimaryButton
                title={currentStepIndex === content.steps.length - 1 ? 'Último paso' : 'Siguiente'}
                onPress={() => setCurrentStepIndex((value) => Math.min(content.steps.length - 1, value + 1))}
                disabled={currentStepIndex === content.steps.length - 1}
                variant="secondary"
                style={styles.stepButton}
              />
            </View>
          </View>

          <Text style={styles.evidenceText}>{content.evidence}</Text>

          <PrimaryButton
            title="Finalizar ejercicio"
            onPress={handleComplete}
            style={{ marginTop: SIZES.padding, marginBottom: SIZES.base, marginVertical: 6 }}
          />
        </>
      ) : (
        <>
          <ValidationMessage
            title="Ejercicio completado"
            message="Has dado un paso importante para regular tus emociones y cuidarte."
          />

          <View style={styles.followUpBox}>
            <Text style={styles.followUpTitle}>Después del ejercicio</Text>
            <Text style={styles.followUpText}>Del 0 al 10, ¿cómo está tu malestar ahora?</Text>
            <DistressSelector
              selected={distressAfterValue}
              onSelect={(value) => {
                setDistressAfterValue(value);
                setSaved(false);
              }}
            />

            {distressDelta !== null && (
              <Text style={styles.deltaText}>{getChangeMessage(distressDelta)}</Text>
            )}

            {crisisRoute && (
              <View style={styles.crisisBox}>
                <Text style={styles.crisisText}>
                  Si tu malestar subió, puede ayudarte contactar a alguien o revisar ayuda inmediata.
                </Text>
                <PrimaryButton
                  title="Abrir modo crisis"
                  onPress={() => router.push(crisisRoute)}
                  variant="danger"
                  style={styles.crisisButton}
                />
              </View>
            )}
          </View>

          <View style={styles.followUpBox}>
            <Text style={styles.followUpTitle}>¿Qué tanto te ayudó?</Text>
            <Text style={styles.followUpText}>
              Esta respuesta ayuda a entender qué ejercicios funcionan mejor para ti.
            </Text>
            <HelpfulRatingSelector
              selected={helpfulRating}
              onSelect={(value) => {
                setHelpfulRating(value);
                setSaved(false);
              }}
            />

            <Text style={styles.inputLabel}>Comentario opcional</Text>
            <TextInput
              value={helpfulComment}
              onChangeText={(text) => {
                setHelpfulComment(text);
                setSaved(false);
              }}
              placeholder="Ej. me ayudó a respirar más lento, pero aún necesito hablar con alguien"
              placeholderTextColor={COLORS.textMuted}
              multiline
              style={styles.commentInput}
            />
          </View>

          <PrimaryButton
            title={saved ? 'Seguimiento guardado' : 'Guardar seguimiento'}
            onPress={saved ? () => Alert.alert('Listo', 'Este seguimiento ya fue guardado.') : handleSaveProgress}
            style={{ marginVertical: 6, backgroundColor: saved ? COLORS.success : COLORS.primary }}
          />

          <PrimaryButton
            title="Ver más ejercicios"
            onPress={() => router.replace('/exercises')}
            style={{ marginVertical: 6 }}
          />

          <PrimaryButton
            title="Volver al inicio"
            onPress={() => router.replace('/')}
            style={{ marginVertical: 6 }}
          />
        </>
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
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.padding
  },
  metaText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 13,
    marginBottom: SIZES.base,
    textTransform: 'uppercase'
  },
  followUpBox: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: SIZES.padding
  },
  followUpTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4
  },
  followUpText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.base
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
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SIZES.base * 1.5
  },
  ratingButton: {
    alignItems: 'center',
    backgroundColor: '#E0E6ED',
    borderRadius: SIZES.radius,
    flexBasis: '18%',
    flexGrow: 1,
    minHeight: 58,
    justifyContent: 'center',
    padding: 8
  },
  ratingSelected: {
    backgroundColor: COLORS.primary
  },
  ratingValue: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16
  },
  ratingValueSelected: {
    color: '#fff'
  },
  ratingLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center'
  },
  ratingLabelSelected: {
    color: '#fff'
  },
  ratingSelectedText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 10,
    marginTop: 2
  },
  inputLabel: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: 6
  },
  commentInput: {
    backgroundColor: '#F5F8FB',
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 15,
    minHeight: 88,
    padding: 12,
    textAlignVertical: 'top'
  },
  deltaText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginTop: SIZES.base * 1.5
  },
  crisisBox: {
    backgroundColor: '#FDECEA',
    borderColor: COLORS.error,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginTop: SIZES.base * 1.5,
    padding: 12
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
  stepsTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  step: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 6
  },
  visualContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10
  },
  audioControls: {
    gap: SIZES.base,
    width: '100%'
  },
  audioButton: {
    marginVertical: 0
  },
  guidanceBox: {
    backgroundColor: '#F0F4F8',
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 5,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    padding: 14
  },
  stepCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: SIZES.padding,
    padding: 16
  },
  currentStep: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: SIZES.base * 2
  },
  stepControls: {
    flexDirection: 'row',
    gap: SIZES.base
  },
  stepButton: {
    flex: 1
  },
  evidenceText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SIZES.base
  }
});
