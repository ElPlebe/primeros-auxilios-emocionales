import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import ValidationMessage from '../../../components/ValidationMessage';
import { COLORS, FONTS, SIZES } from '../../../constants/theme';
import { saveCompletedExercise } from '../../../utils/storage';

const exerciseData: Record<
  string,
  { title: string; description: string; steps: string[] }
> = {
  respiracion: {
    title: 'Respiración guiada',
    description: 'Esta técnica te ayudará a calmar tu sistema nervioso mediante respiraciones controladas.',
    steps: [
      'Siéntate en un lugar tranquilo.',
      'Inhala por la nariz durante 4 segundos.',
      'Sostén el aire durante 4 segundos.',
      'Exhala lentamente por la boca durante 6 segundos.',
      'Repite por al menos 5 ciclos.'
    ]
  },
  grounding: {
    title: 'Grounding 5-4-3-2-1',
    description: 'Una técnica para anclarte al presente usando tus sentidos.',
    steps: [
      'Mira y nombra 5 cosas que puedes ver.',
      'Toca 4 objetos cercanos y describe su textura.',
      'Escucha 3 sonidos distintos (cercanos o lejanos).',
      'Detecta 2 olores e intenta nombrarlos.',
      'Piensa en 1 cosa que puedas saborear o por la que estás agradecido.'
    ]
  },
  afirmaciones: {
    title: 'Afirmaciones positivas',
    description: 'Repetir frases positivas te ayuda a redirigir tu pensamiento.',
    steps: [
      'Cierra los ojos y respira profundamente.',
      'Repite frases como: "Estoy haciendo lo mejor que puedo", "Esto también pasará", "Soy más fuerte de lo que creo".',
      'Puedes escribir tus propias afirmaciones y leerlas en voz alta.'
    ]
  },
  escritura: {
    title: 'Escritura emocional',
    description: 'Escribir tus pensamientos y emociones ayuda a procesarlos con claridad.',
    steps: [
      'Toma papel o abre una nota digital.',
      'Escribe cómo te sientes sin juzgarte.',
      'No busques escribir bonito, solo sé honesto.',
      'Al final, agradece por darte este espacio.'
    ]
  },
  escucha: {
    title: 'Escucha consciente (audio)',
    description: 'Escucha sonidos relajantes y enfócate en el presente.',
    steps: [
      'Ponte audífonos en un lugar tranquilo.',
      'Escoge un audio relajante de tu preferencia.',
      'Cierra los ojos y enfócate solo en lo que escuchas.',
      'Respira profundamente mientras lo haces.',
      'Hazlo por al menos 5 minutos.'
    ]
  },
  ayuda: {
    title: 'Contacto con ayuda urgente',
    description: 'Si te sientes en riesgo o necesitas ayuda urgente, estas opciones pueden asistirte rápidamente.',
    steps: [
      'Llama a una línea de apoyo emocional de tu país.',
      'Habla con alguien de confianza que pueda acompañarte.',
      'Respira profundo. Buscar ayuda es un acto de fortaleza.'
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

const imageForExercise: Record<string, any> = {
  respiracion: require('../../../assets/images/respiracion-decorativa.png'),
  grounding: require('../../../assets/images/grounding.png'),
  afirmaciones: require('../../../assets/images/afirmaciones-positivas.png'),
  escritura: require('../../../assets/images/escritura-emocional.png'),
  escucha: require('../../../assets/images/escucha-consciente.png'),
  ayuda: require('../../../assets/images/contacto-ayuda.png'),
  afirmacionesAnsiedad: require('../../../assets/images/afirmaciones-ansiedad.png')
};

const audioForExercise: Record<string, any> = {
  respiracion: require('../../../assets/audios/respiracion-guiada.mp3'),
  afirmaciones: require('../../../assets/audios/afirmaciones-positivas.mp3'),
  escucha: require('../../../assets/audios/escucha-consciente.mp3'),
  afirmacionesAnsiedad: require('../../../assets/audios/afirmaciones-ansiedad.mp3')
};

export default function ExerciseDetailScreen() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const content = id && typeof id === 'string' ? exerciseData[id] : null;

  const playAudio = async () => {
    try {
      if (id && typeof id === 'string' && audioForExercise[id]) {
        const { sound } = await Audio.Sound.createAsync(audioForExercise[id]);
        setSound(sound);
        await sound.playAsync();
      } else {
        Alert.alert('Error', 'No hay audio disponible para este ejercicio.');
      }
    } catch (_) {
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

  if (!content || typeof id !== 'string') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ejercicio no encontrado</Text>
        <PrimaryButton title="Volver a ejercicios" onPress={() => router.back()} style={{ marginVertical: 6 }} />
      </View>
    );
  }

  const handleSaveProgress = async () => {
    await saveCompletedExercise(String(id));
    Alert.alert('Progreso guardado', 'Tu avance ha sido registrado con éxito.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!completed ? (
        <>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.description}>{content.description}</Text>

          {imageForExercise[id] && (
            <View style={styles.visualContainer}>
              <Image
                source={imageForExercise[id]}
                style={styles.image}
                resizeMode="contain"
              />
              {audioForExercise[id] && (
                <PrimaryButton title="Reproducir audio" onPress={playAudio} style={{ marginVertical: 8 }} />
              )}
            </View>
          )}

          <Text style={styles.stepsTitle}>Pasos:</Text>
          {content.steps.map((step, index) => (
            <Text key={index} style={styles.step}>• {step}</Text>
          ))}

          <PrimaryButton
            title="Finalizar ejercicio"
            onPress={() => setCompleted(true)}
            style={{ marginTop: SIZES.padding, marginBottom: SIZES.base, marginVertical: 6 }}
          />
        </>
      ) : (
        <>
          <ValidationMessage
            title="¡Ejercicio completado!"
            message="Has dado un paso importante para regular tus emociones y cuidarte."
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

          <PrimaryButton
            title="Guardar progreso"
            onPress={handleSaveProgress}
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
