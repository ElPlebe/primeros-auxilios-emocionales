
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import EmotionMessage from '../../components/EmotionMessage';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export default function ResultsScreen() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const isDarkMode = scheme === 'dark';

  const { level } = useLocalSearchParams();
  const router = useRouter();

  const getContent = (level: string | string[] | undefined) => {
    switch (level) {
      case 'leve':
        return {
          emotionType: 'low' as const,
          emotionTitle: 'Estás bien por ahora',
          message: 'Parece que hoy estás emocionalmente estable. ¡Qué bueno saberlo!',
          exercises: ['Respiración consciente', 'Afirmaciones positivas']
        };
      case 'moderado':
        return {
          emotionType: 'moderate' as const,
          emotionTitle: 'Te estás cuidando',
          message: 'Sabemos que no siempre es fácil. Estás haciendo lo correcto al cuidarte.',
          exercises: ['Grounding 5-4-3-2-1', 'Escritura emocional']
        };
      case 'grave':
      default:
        return {
          emotionType: 'high' as const,
          emotionTitle: 'No estás solo/a',
          message: 'Estás pasando por algo difícil. El hecho de que estés aquí ya es un paso importante.',
          exercises: ['Respiración guiada', 'Escucha consciente', 'Ayuda urgente']
        };
    }
  };

  const { emotionType, emotionTitle, message, exercises } = getContent(level);

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Resultado emocional</Text>

      <EmotionMessage
        title={emotionTitle}
        message={message}
        type={emotionType}
      />

      <Text style={styles.subtitle}>Te sugerimos estos ejercicios:</Text>
      {exercises.map((e, idx) => (
        <Text key={idx} style={styles.exercise}>• {e}</Text>
      ))}

      <PrimaryButton
        title="Ver ejercicios"
        onPress={() => router.push('/exercises')}
      />

      <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/')}>
        <Text style={styles.linkText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flex: 1
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  exercise: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 6
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
