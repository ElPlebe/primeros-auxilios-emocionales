import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export default function ExercisesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejercicios emocionales</Text>
      <Text style={styles.subtitle}>
        Selecciona un ejercicio que te ayude a regular tus emociones
      </Text>

      <View style={styles.buttonGroup}>
        <PrimaryButton
          title="Respiración guiada"
          onPress={() => router.push('/exercises/respiracion')}
        />
        <PrimaryButton
          title="Grounding 5-4-3-2-1"
          onPress={() => router.push('/exercises/grounding')}
        />
        <PrimaryButton
          title="Afirmaciones positivas"
          onPress={() => router.push('/exercises/afirmaciones')}
        />
        <PrimaryButton
          title="Escritura emocional"
          onPress={() => router.push('/exercises/escritura')}
        />
        <PrimaryButton
          title="Escucha consciente (audio)"
          onPress={() => router.push('/exercises/escucha')}
        />
        <PrimaryButton
          title="Contacto con ayuda urgente"
          onPress={() => router.push('/exercises/ayuda')}
        />
        <PrimaryButton
          title="Afirmaciones para ansiedad"
          onPress={() => router.push('/exercises/afirmacionesAnsiedad')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flex: 1
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
    marginBottom: SIZES.padding
  },
  buttonGroup: {
    gap: 10, // Espacio entre botones
    paddingBottom: SIZES.padding * 2
  }
});
