import { useRouter } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import EmotionMessage from '../../components/EmotionMessage';
import PrimaryButton from '../../components/PrimaryButton';
import { CARD_STYLES, SPACING, TYPOGRAPHY } from '../../constants/design';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export default function EmergencyScreen() {
  const router = useRouter();

  const openUrl = async (url: string, fallbackMessage: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No se pudo abrir', fallbackMessage);
    }
  };

  const callEmergencyServices = () => {
    void openUrl('tel:911', 'Si hay peligro inmediato, marca 911 desde tu teléfono.');
  };

  const callLifeLine = () => {
    void openUrl('tel:+528009112000', 'Puedes llamar a Línea de la Vida al 800 911 2000.');
  };

  const openOfficialLifeLine = () => {
    void openUrl(
      'https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000',
      'Busca "Línea de la Vida 800 911 2000" en el sitio oficial de gob.mx.'
    );
  };

  const openPDFGuide = () => {
    void openUrl(
      'https://www.who.int/es/publications/i/item/9789241548205',
      'Busca "Primera ayuda psicológica guía para trabajadores de campo OMS".'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ayuda urgente</Text>

      <EmotionMessage
        title="Tu seguridad va primero"
        message="Si estás en peligro inmediato o sientes que podrías hacerte daño, contacta servicios de emergencia o busca a una persona que pueda acompañarte ahora."
        type="high"
      />

      <PrimaryButton
        title="Abrir modo crisis"
        onPress={() => router.replace('/crisis')}
        variant="danger"
        accessibilityHint="Abre una pantalla simple con 911, Linea de la Vida y contacto de confianza."
        style={styles.primaryCrisisButton}
      />

      <PrimaryButton
        title="Llamar a emergencias 911"
        onPress={callEmergencyServices}
        variant="danger"
        accessibilityHint="Inicia una llamada al número de emergencias 911."
      />

      <PrimaryButton
        title="Llamar a Línea de la Vida"
        onPress={callLifeLine}
        accessibilityHint="Inicia una llamada a Línea de la Vida al 800 911 2000."
        style={{ marginTop: SIZES.base }}
      />

      <PrimaryButton
        title="Contactar a persona de confianza"
        onPress={() => router.push('../trusted-contact')}
        variant="secondary"
        accessibilityHint="Abre tu contacto de confianza guardado."
        style={{ marginTop: SIZES.base }}
      />

      <Text style={styles.subtitle}>Si no estás en peligro inmediato</Text>

      <View style={styles.safetyPlanCard}>
        <Text style={styles.cardTitle}>Organizar un plan breve</Text>
        <Text style={styles.cardText}>
          Si puedes continuar unos minutos, revisa cuatro pasos simples: lugar seguro, contacto disponible,
          contacto de confianza y ayuda urgente.
        </Text>
        <PrimaryButton
          title="Abrir plan de seguridad breve"
          onPress={() => router.push('../safety-plan')}
          variant="secondary"
          accessibilityHint="Abre una guía breve para organizar pasos de seguridad."
        />
      </View>

      <PrimaryButton
        title="Ver sitio oficial de Línea de la Vida"
        onPress={openOfficialLifeLine}
        variant="ghost"
        style={{ marginTop: SIZES.base }}
      />

      <PrimaryButton
        title="Ver guía OMS de primeros auxilios"
        onPress={openPDFGuide}
        variant="ghost"
        style={{ marginTop: SIZES.base }}
      />

      <Text style={styles.footer}>
        Esta app ofrece orientación inicial. No reemplaza atención médica, psicológica ni servicios de emergencia.
      </Text>
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
  primaryCrisisButton: {
    marginBottom: SIZES.padding
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base
  },
  safetyPlanCard: {
    ...CARD_STYLES.default,
    marginBottom: SPACING.sm
  },
  cardTitle: {
    ...TYPOGRAPHY.sectionTitle,
    marginBottom: 6
  },
  cardText: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.sm
  },
  footer: {
    marginTop: SIZES.padding,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center'
  }
});
