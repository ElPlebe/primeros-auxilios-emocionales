import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { HOME_DISCLAIMER } from '../../utils/psychoeducation';
import { acceptConsent } from '../../utils/storage';

const CONSENT_POINTS = [
  {
    title: 'Apoyo inicial, no diagnóstico',
    body: HOME_DISCLAIMER
  },
  {
    title: 'Datos locales',
    body: 'La app guarda en este dispositivo tu historial emocional, autoevaluaciones y seguimiento de ejercicios para que puedas revisar tu progreso.'
  },
  {
    title: 'Ayuda urgente visible',
    body: 'Si estás en peligro inmediato, podrías hacerte daño o necesitas atención urgente, usa la opción de emergencia en lugar de continuar con ejercicios.'
  }
];

export default function ConsentScreen() {
  const router = useRouter();

  const handleAccept = async () => {
    await acceptConsent();
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Bienvenida/o</Text>
      <Text style={styles.title}>Antes de usar la app</Text>
      <Text style={styles.subtitle}>
        Queremos que uses esta herramienta con claridad, cuidado y expectativas realistas.
      </Text>

      <View style={styles.card}>
        {CONSENT_POINTS.map((point) => (
          <View key={point.title} style={styles.point}>
            <Text style={styles.pointTitle}>{point.title}</Text>
            <Text style={styles.pointBody}>{point.body}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        title="Acepto y continuar"
        onPress={handleAccept}
        style={styles.primaryButton}
        accessibilityHint="Acepta el aviso de alcance y abre el inicio de la aplicación."
      />
      <PrimaryButton
        title="Necesito ayuda urgente"
        onPress={() => router.replace('/emergency')}
        variant="danger"
        style={styles.urgentButton}
        accessibilityHint="Abre opciones de emergencia y apoyo inmediato."
      />
      <PrimaryButton
        title="Ver privacidad y datos"
        onPress={() => router.push('../privacy-data')}
        variant="ghost"
        style={styles.secondaryButton}
        accessibilityHint="Abre información sobre los datos que guarda la aplicación."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    padding: SIZES.padding
  },
  kicker: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 30,
    marginBottom: SIZES.base
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: SIZES.padding
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius + 4,
    borderWidth: 1,
    marginBottom: SIZES.padding,
    padding: 18
  },
  point: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    marginBottom: 14,
    paddingBottom: 14
  },
  pointTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 17,
    marginBottom: 6
  },
  pointBody: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.base
  },
  urgentButton: {
    marginBottom: SIZES.base
  },
  secondaryButton: {
    marginBottom: 0
  }
});
