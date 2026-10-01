import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { CRISIS_COPY } from '../../features/crisis/crisisCopy';
import { MEXICO_CRISIS_RESOURCES } from '../../features/crisis/crisisResources';

export default function CrisisScreen() {
  const router = useRouter();
  const [trustedName, setTrustedName] = useState('');
  const [trustedPhone, setTrustedPhone] = useState('');

  useEffect(() => {
    const loadTrustedContact = async () => {
      const [savedName, savedPhone] = await Promise.all([
        AsyncStorage.getItem('trustedName'),
        AsyncStorage.getItem('trustedPhone')
      ]);

      setTrustedName(savedName ?? '');
      setTrustedPhone(savedPhone ?? '');
    };

    loadTrustedContact().catch(() => {
      setTrustedName('');
      setTrustedPhone('');
    });
  }, []);

  const openUrl = async (url: string, fallbackMessage: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No se pudo abrir', fallbackMessage);
    }
  };

  const callTrustedContact = () => {
    if (!trustedPhone) {
      router.push('/trusted-contact');
      return;
    }

    void openUrl(`tel:${trustedPhone}`, `Intenta llamar a ${trustedName || 'tu contacto de confianza'} manualmente.`);
  };

  const messageTrustedContact = () => {
    if (!trustedPhone) {
      router.push('/trusted-contact');
      return;
    }

    const name = trustedName || 'estoy pasando por un momento dificil';
    const text = encodeURIComponent(`Hola ${name}, necesito hablar contigo. Estoy pasando por un momento dificil.`);
    void openUrl(`https://wa.me/${trustedPhone}?text=${text}`, 'Intenta escribir a tu contacto de confianza manualmente.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{CRISIS_COPY.title}</Text>
      <Text style={styles.subtitle}>{CRISIS_COPY.subtitle}</Text>

      <View style={styles.actionGroup}>
        <PrimaryButton
          title={CRISIS_COPY.actions.callEmergency}
          onPress={() =>
            void openUrl(MEXICO_CRISIS_RESOURCES.emergency.phoneUrl, 'Si hay peligro inmediato, marca 911.')
          }
          variant="danger"
          accessibilityHint="Inicia una llamada al numero de emergencias 911."
        />
        <PrimaryButton
          title={CRISIS_COPY.actions.callLifeLine}
          onPress={() =>
            void openUrl(
              MEXICO_CRISIS_RESOURCES.lifeLine.phoneUrl,
              `Puedes llamar a Linea de la Vida al ${MEXICO_CRISIS_RESOURCES.lifeLine.displayPhone}.`
            )
          }
          style={styles.spacedButton}
          accessibilityHint="Inicia una llamada a Linea de la Vida."
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{CRISIS_COPY.actions.trustedContact}</Text>
        <Text style={styles.cardText}>
          {trustedPhone
            ? `Contacto guardado: ${trustedName || trustedPhone}`
            : 'Si puedes, agrega o revisa una persona que pueda acompanarte ahora.'}
        </Text>
        <PrimaryButton
          title={trustedPhone ? 'Llamar a contacto' : 'Configurar contacto'}
          onPress={callTrustedContact}
          variant="secondary"
        />
        {trustedPhone && (
          <PrimaryButton
            title="Enviar WhatsApp"
            onPress={messageTrustedContact}
            variant="secondary"
            style={styles.spacedButton}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pasos inmediatos</Text>
        {CRISIS_COPY.checklist.map((item) => (
          <Text key={item} style={styles.checkItem}>
            - {item}
          </Text>
        ))}
      </View>

      <PrimaryButton
        title={CRISIS_COPY.actions.grounding}
        onPress={() => router.push('/exercises/grounding')}
        variant="secondary"
        style={styles.spacedButton}
      />

      <Text style={styles.disclaimer}>{CRISIS_COPY.disclaimer}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    padding: SIZES.padding
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
    fontSize: 17,
    lineHeight: 24,
    marginBottom: SIZES.padding
  },
  actionGroup: {
    marginBottom: SIZES.padding
  },
  spacedButton: {
    marginTop: SIZES.base
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: SIZES.padding,
    padding: 16
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: 6
  },
  cardText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SIZES.base
  },
  checkItem: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6
  },
  disclaimer: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: SIZES.padding,
    textAlign: 'center'
  }
});
