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
import { saveCompletedExercise, saveExerciseFollowUp } from '../../../utils/storage';

type ExerciseContent = {
  title: string;
  description: string;
  steps: string[];
};

const exerciseData: Record<ExerciseId, ExerciseContent> = {
  respiracion: {
    title: 'Respiración guiada',
    description: 'Esta técnica te ayuda a calmar el cuerpo mediante respiraciones lentas y controladas.',
    steps: [
      'Siéntate en un lugar tranquilo y apoya ambos pies en el suelo.',
      'Inhala por la nariz durante 4 segundos.',
      'Sostén el aire durante 4 segundos si te resulta cómodo.',
      'Exhala lentamente por la boca durante 6 segundos.',
      'Repite por al menos 5 ciclos y observa si algo cambia en tu cuerpo.'
    ]
  },
  grounding: {
    title: 'Grounding 5-4-3-2-1',
    description: 'Una técnica para volver al presente usando tus sentidos cuando la emoción se siente muy intensa.',
    steps: [
      'Mira y nombra 5 cosas que puedes ver.',
      'Toca 4 objetos cercanos y describe su textura.',
      'Escucha 3 sonidos distintos, cercanos o lejanos.',
      'Detecta 2 olores o sensaciones corporales.',
      'Piensa en 1 cosa que puedas saborear o una acción pequeña que puedas hacer ahora.'
    ]
  },
  afirmaciones: {
    title: 'Afirmaciones positivas',
    description: 'Frases breves de autocompasión para responderte con más cuidado y menos juicio.',
    steps: [
      'Cierra los ojos o baja la mirada si eso te ayuda.',
      'Respira profundo una vez antes de empezar.',
      'Repite: "Estoy haciendo lo mejor que puedo en este momento".',
      'Repite: "Esto que siento es difícil, pero no tengo que resolverlo todo ahora".',
      'Elige una frase propia y repítela lentamente tres veces.'
    ]
  },
  escritura: {
    title: 'Escritura emocional',
    description: 'Escribir ayuda a ordenar la experiencia: situación, pensamiento, emoción y siguiente paso.',
    steps: [
      'Abre una nota o toma papel.',
      'Escribe qué ocurrió o qué parece haber detonado este malestar.',
      'Anota qué pensamiento apareció con más fuerza.',
      'Nombra la emoción principal y ponle intensidad del 0 al 10.',
      'Escribe una interpretación alternativa o un paso pequeño y realista para las próximas horas.'
    ]
  },
  escucha: {
    title: 'Escucha consciente',
    description: 'Un ejercicio breve para dirigir tu atención a sonidos presentes y bajar la sensación de aislamiento.',
    steps: [
      'Ponte audífonos si los tienes a la mano.',
      'Escoge un audio relajante de tu preferencia.',
      'Cierra los ojos si te resulta cómodo.',
      'Cuando tu mente se vaya a otro tema, vuelve suavemente al sonido.',
      'Hazlo por al menos 5 minutos.'
    ]
  },
  ayuda: {
    title: 'Contacto con ayuda urgente',
    description: 'Si te sientes en riesgo o necesitas apoyo inmediato, prioriza contactar a una persona o servicio de ayuda.',
    steps: [
      'Si hay peligro inmediato, llama a emergencias.',
      'Si puedes, avisa a una persona de confianza dónde estás y qué necesitas.',
      'Usa una línea de apoyo emocional de tu país si necesitas hablar con alguien ahora.',
      'Permanece en un lugar acompañado o visible si no te sientes seguro/a.',
      'Buscar ayuda es una decisión de cuidado, no una falla personal.'
    ]
  },
  afirmacionesAnsiedad: {
    title: 'Afirmaciones para ansiedad',
    description: 'Una guía auditiva para calmar tu mente y reenfocar tus pensamientos en momentos de ansiedad.',
    steps: [
      'Busca un lugar tranquilo y sin distracciones.',
      'Colócate cómodo y cierra los ojos si lo deseas.',
      'Escucha el audio con atención y respira profundo.',
      'Permite que cada afirmación entre en tu mente sin juzgar.',
      'Repite este ejercicio cuando lo necesites.'
    ]
  }
};

const imageForExercise: Record<ExerciseId, any> = {
  respiracion: require('../../../assets/images/respiracion-decorativa.png'),
  grounding: require('../../../assets/images/grounding.png'),
  afirmaciones: require('../../../assets/images/afirmaciones-positivas.png'),
  escritura: require('../../../assets/images/escritura-emocional.png'),
  escucha: require('../../../assets/images/escucha-consciente.png'),
  ayuda: require('../../../assets/images/contacto-ayuda.png'),
  afirmacionesAnsiedad: require('../../../assets/images/afirmaciones-ansiedad.png')
};

const audioForExercise: Partial<Record<ExerciseId, any>> = {
  respiracion: require('../../../assets/audios/respiracion-guiada.mp3'),
  afirmaciones: require('../../../assets/audios/afirmaciones-positivas.mp3'),
  escucha: require('../../../assets/audios/escucha-consciente.mp3'),
  afirmacionesAnsiedad: require('../../../assets/audios/afirmaciones-ansiedad.mp3')
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
  const [distressBeforeValue, setDistressBeforeValue] = useState<number | null>(() =>
    normalizeDistressValue(firstParam(distressBefore))
  );
  const [distressAfterValue, setDistressAfterValue] = useState<number | null>(null);
  const [helpfulRating, setHelpfulRating] = useState<HelpfulRating | null>(null);
  const [helpfulComment, setHelpfulComment] = useState('');

  const exerciseId = firstParam(id);
  const content = isExerciseId(exerciseId) ? exerciseData[exerciseId] : null;
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
        const { sound: createdSound } = await Audio.Sound.createAsync(audioForExercise[exerciseId]);
        setSound(createdSound);
        await createdSound.playAsync();
      } else {
        Alert.alert('Audio no disponible', 'Este ejercicio no tiene audio asociado.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo reproducir el audio.');
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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
              <PrimaryButton title="Reproducir audio" onPress={playAudio} style={{ marginVertical: 8 }} />
            )}
          </View>

          <Text style={styles.stepsTitle}>Pasos:</Text>
          {content.steps.map((step, index) => (
            <Text key={index} style={styles.step}>• {step}</Text>
          ))}

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
  }
});
