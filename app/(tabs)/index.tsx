import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getEmotionDisplayLabel, getEmotionValue } from '../../utils/emotionScale';
import { parseJsonArray } from '../../utils/localJson';
import { HOME_DISCLAIMER } from '../../utils/psychoeducation';
import { hasAcceptedConsent } from '../../utils/storage';

type StoredEmotionLog = { date: string; emotion: string };

const getLabel = (value: number) => {
  if (value >= 4.5) return 'Muy positivo';
  if (value >= 3.5) return 'Estable';
  if (value >= 2.5) return 'Variable';
  return 'Bajo';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

export default function HomeScreen() {
  const router = useRouter();
  const [avgEmotion, setAvgEmotion] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const accepted = await hasAcceptedConsent();
      if (!accepted) {
        router.replace('../consent');
        return;
      }

      const stored = await AsyncStorage.getItem('emotionHistory');
      const history = parseJsonArray<StoredEmotionLog>(stored);
      if (history.length > 0) {
        if (history.length >= 1) {
          setLastEmotion(history[0].emotion);
        }
        if (history.length >= 3) {
          const sum = history.reduce(
            (acc: number, cur) => acc + getEmotionValue(cur.emotion),
            0
          );
          setAvgEmotion(parseFloat((sum / history.length).toFixed(2)));

          const lowDays = history.filter((e) => getEmotionValue(e.emotion) <= 2).length;
          setShowAlert(lowDays >= 3);
        }
      }
    };

    loadData();
  }, [router]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <Text style={styles.title}>¿Qué necesitas ahora?</Text>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>{HOME_DISCLAIMER}</Text>
      </View>

      <PrimaryButton
        title="Necesito ayuda urgente"
        onPress={() => router.push('/crisis')}
        variant="danger"
        style={styles.urgentButton}
        accessibilityHint="Abre opciones para llamar a emergencias o buscar apoyo inmediato."
      />

      <PrimaryButton
        title="Realizar autoevaluación"
        style={styles.primaryAction}
        onPress={() => router.push('/survey')}
        accessibilityHint="Inicia una evaluación breve para orientar ejercicios de apoyo."
      />

      {lastEmotion && (
        <View style={styles.lastEmotionBox}>
          <Text style={styles.lastEmotionText}>
            Hoy registraste: <Text style={styles.lastEmotionHighlight}>{getEmotionDisplayLabel(lastEmotion)}</Text>
          </Text>
        </View>
      )}

      {showAlert && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>Has tenido varios días difíciles</Text>
          <Text style={styles.alertText}>
            Puede ayudarte hacer una pausa breve o contactar a alguien de confianza.
          </Text>
          <PrimaryButton
            title="Hacer grounding"
            onPress={() => router.push('/exercises/grounding')}
            style={{ marginTop: SIZES.base }}
          />
        </View>
      )}

      {avgEmotion !== null && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen emocional</Text>
          <Text style={styles.summaryText}>
            Promedio reciente: {avgEmotion} · {getLabel(avgEmotion)}
          </Text>
          <TouchableOpacity onPress={() => router.push('../emotion-graph')}>
            <Text style={styles.linkText}>Ver evolución emocional</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Apoyo rápido</Text>
      <View style={styles.actionRow}>
        <PrimaryButton
          title="Ejercicios"
          onPress={() => router.push('/exercises')}
          variant="secondary"
          style={styles.secondaryAction}
          accessibilityHint="Abre la lista de ejercicios de regulación emocional."
        />
        <PrimaryButton
          title="Registrar emoción"
          variant="secondary"
          style={styles.secondaryAction}
          onPress={() => router.push('/(tabs)/daily-checkin')}
          accessibilityHint="Abre el registro rápido de emociones."
        />
      </View>

      <Text style={styles.sectionTitle}>Más opciones</Text>
      <PrimaryButton
        title="Cuenta y sincronización"
        onPress={() => router.push('/account')}
        variant="secondary"
        style={styles.tertiaryAction}
        accessibilityHint="Abre el inicio de sesión con Auth0 y el estado de sincronización."
      />
      <PrimaryButton
        title="Plan de seguridad breve"
        onPress={() => router.push('../safety-plan')}
        variant="secondary"
        style={styles.tertiaryAction}
        accessibilityHint="Abre una guía breve de seguridad ante malestar intenso."
      />
      <PrimaryButton
        title="Información y psicoeducación"
        onPress={() => router.push('../info')}
        variant="ghost"
        style={styles.tertiaryAction}
      />
      <PrimaryButton
        title="Privacidad y datos"
        onPress={() => router.push('../privacy-data')}
        variant="ghost"
        style={styles.tertiaryAction}
      />
      <PrimaryButton
        title="Resumen para tesis/clínica"
        onPress={() => router.push('../summary')}
        variant="ghost"
        style={styles.tertiaryAction}
      />
      <PrimaryButton
        title="Contacto de confianza"
        onPress={() => router.push('../trusted-contact')}
        variant="ghost"
        style={styles.tertiaryAction}
      />
      <PrimaryButton
        title="Historial emocional"
        onPress={() => router.push('../profile')}
        variant="ghost"
        style={styles.tertiaryAction}
      />
      <PrimaryButton
        title="Estadísticas emocionales"
        onPress={() => router.push('../emotion-graph')}
        variant="ghost"
        style={styles.tertiaryAction}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  greeting: {
    fontSize: 18,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: 2
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.padding
  },
  disclaimerBox: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: SIZES.base
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 20
  },
  urgentButton: {
    marginBottom: SIZES.base
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.padding
  },
  lastEmotionBox: {
    backgroundColor: '#EAF6FF',
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding
  },
  lastEmotionText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.text
  },
  lastEmotionHighlight: {
    fontFamily: FONTS.bold,
    color: COLORS.primary
  },
  alertBox: {
    backgroundColor: '#FDECEA',
    borderLeftWidth: 5,
    borderLeftColor: COLORS.error,
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.error,
    marginBottom: 4
  },
  alertText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text
  },
  summaryBox: {
    backgroundColor: '#F0F4F8',
    padding: 16,
    borderRadius: SIZES.radius,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    marginBottom: SIZES.padding
  },
  summaryTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 6
  },
  summaryText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted
  },
  linkText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SIZES.padding
  },
  secondaryAction: {
    flex: 1
  },
  tertiaryAction: {
    marginBottom: SIZES.base
  }
});
