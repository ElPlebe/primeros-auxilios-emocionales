import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { CONSENT_POINTS } from '../../features/privacy/consentContent';
import { acceptConsent } from '../../utils/storage';

export default function ConsentScreen() {
  const router = useRouter();

  const handleAccept = async (nextRoute: '/' | '/account') => {
    await acceptConsent();
    router.replace(nextRoute);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Primeros Auxilios Emocionales</Text>
      <Text style={styles.title}>Antes de empezar</Text>
      <Text style={styles.subtitle}>
        Puedes usar ayuda urgente y ejercicios sin cuenta. Si inicias sesión con Google, la app podrá guardar tu progreso
        y sincronizarlo cuando aceptes compartir esos datos.
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
        title="Necesito ayuda urgente"
        onPress={() => router.replace('/crisis')}
        variant="danger"
        style={styles.urgentButton}
        accessibilityHint="Abre opciones de emergencia y apoyo inmediato."
      />
      <PrimaryButton
        title="Iniciar sesión con Google"
        onPress={() => handleAccept('/account')}
        style={styles.primaryButton}
        accessibilityHint="Acepta el aviso inicial y abre el inicio de sesión para guardar tu progreso."
      />
      <PrimaryButton
        title="Continuar sin cuenta"
        onPress={() => handleAccept('/')}
        variant="secondary"
        style={styles.secondaryButton}
        accessibilityHint="Acepta el aviso inicial y usa la app guardando datos solo en este dispositivo."
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
