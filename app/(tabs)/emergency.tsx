import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';
import EmotionMessage from '../../components/EmotionMessage';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export default function EmergencyScreen() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const isDarkMode = scheme === 'dark';

  const router = useRouter();

  const callHelpLine = () => {
    Linking.openURL('tel:8009112000'); // Línea de la Vida - México
  };

  const sendWhatsAppMessage = () => {
    const message = encodeURIComponent("Hola, necesito hablar con alguien. Estoy pasando por un momento difícil.");
    const phone = "525500000000"; // Cambiar por número real con código de país
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  const openYouTubeRelaxation = () => {
    Linking.openURL('https://www.youtube.com/watch?v=inpok4MKVLM'); // Video de respiración guiada (The Honest Guys)
  };

  const openPDFGuide = () => {
    Linking.openURL('https://www.who.int/publications/i/item/9789240030787'); // Guía OMS primeros auxilios psicológicos
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ayuda urgente</Text>

      <EmotionMessage
        title="No estás solo/a"
        message="Sabemos que este momento puede ser abrumador. Respira. Aquí tienes algunas opciones para recibir ayuda inmediata."
        type="high"
      />

      <PrimaryButton title="Llamar a la línea de ayuda" onPress={callHelpLine} />

      <PrimaryButton
        title="Enviar mensaje por WhatsApp"
        onPress={sendWhatsAppMessage}
        style={{ backgroundColor: '#25D366', marginTop: SIZES.base }}
      />

      <PrimaryButton
        title="Contactar a persona de confianza"
        onPress={() => router.push('../trusted-contact')}
        style={{ backgroundColor: COLORS.secondary, marginTop: SIZES.base }}
        textStyle={{ color: COLORS.text }}
      />

      <Text style={styles.subtitle}>También puedes intentar:</Text>

      <PrimaryButton
        title="Hacer respiración guiada (video)"
        onPress={openYouTubeRelaxation}
        style={{ backgroundColor: COLORS.primary, marginTop: SIZES.base, marginVertical: 6 }}
      />

      <PrimaryButton
        title="Ver guía de primeros auxilios"
        onPress={openPDFGuide}
        style={{ backgroundColor: COLORS.primary, marginTop: SIZES.base, marginVertical: 6 }}
      />

      <Text style={styles.footer}>
        Si estás en riesgo inminente, acude a urgencias o contacta con alguien de confianza.
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
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base
  },
  footer: {
    marginTop: SIZES.padding,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'column',
    rowGap: 12 // mejora visual del espaciado entre botones
  }
});
