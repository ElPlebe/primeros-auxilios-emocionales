import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const emotionToValue: Record<string, number> = {
  Bien: 5,
  Tranquilo: 4,
  Neutral: 3,
  Ansioso: 2,
  Triste: 1
};

const getLabel = (value: number) => {
  if (value >= 4.5) return 'Muy positivo';
  if (value >= 3.5) return 'Estable';
  if (value >= 2.5) return 'Inestable';
  return 'Bajo';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

export default function HomeScreen() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const isDarkMode = scheme === 'dark';

  const router = useRouter();
  const [avgEmotion, setAvgEmotion] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const stored = await AsyncStorage.getItem('emotionHistory');
      if (stored) {
        const history = JSON.parse(stored);
        if (history.length >= 1) {
          setLastEmotion(history[0].emotion);
        }
        if (history.length >= 3) {
          const sum = history.reduce((acc: number, cur: { date: string; emotion: string }) => acc + (emotionToValue[cur.emotion] || 0), 0);
          setAvgEmotion(parseFloat((sum / history.length).toFixed(2)));

          const lowDays = history.filter((e: { date: string; emotion: string }) => emotionToValue[e.emotion] <= 2).length;
          setShowAlert(lowDays >= 3);
        }
      }
    };

    loadData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{getGreeting()}, bienvenido</Text>

      {lastEmotion && (
        <View style={styles.lastEmotionBox}>
          <Text style={styles.lastEmotionText}>Hoy registraste: <Text style={styles.lastEmotionHighlight}>{lastEmotion}</Text></Text>
        </View>
      )}

      {showAlert && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>¿Te has sentido bajoneado últimamente?</Text>
          <Text style={styles.alertText}>
            Hemos notado varios días emocionalmente difíciles. ¿Te gustaría hacer una pausa con un ejercicio calmante?
          </Text>
          <PrimaryButton
            title="Hacer ejercicio ahora"
            onPress={() => router.push('/exercises/respiracion')}
            style={{ marginTop: 8 }}
          />
        </View>
      )}

      {avgEmotion !== null && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen emocional</Text>
          <Text style={styles.summaryText}>
            Tu promedio emocional reciente es {avgEmotion} – {getLabel(avgEmotion)}
          </Text>
          <TouchableOpacity onPress={() => router.push('../emotion-graph')}>
            <Text style={styles.linkText}>Ver gráfico completo →</Text>
          </TouchableOpacity>
        </View>
      )}

      <PrimaryButton title="Realizar autoevaluación" onPress={() => router.push('/survey')} />
      <PrimaryButton
        title="Ver ejercicios"
        onPress={() => router.push('/exercises')}
        style={{ backgroundColor: COLORS.secondary, marginTop: SIZES.base, marginVertical: 6 }}
        textStyle={{ color: COLORS.text }}
      />
      <PrimaryButton
        title="Ver historial emocional"
        onPress={() => router.push('../profile')}
        style={{ backgroundColor: COLORS.card, marginTop: SIZES.base, marginVertical: 6 }}
        textStyle={{ color: COLORS.text }}
      />

      <PrimaryButton
        title="Contacto de confianza"
        onPress={() => router.push('../trusted-contact')}
        style={{ backgroundColor: COLORS.secondary, marginTop: SIZES.base, marginVertical: 6 }}
        textStyle={{ color: COLORS.text }}
      />

      <PrimaryButton
        title="Ver estadísticas emocionales"
        onPress={() => router.push('../emotion-graph')}
        style={{ backgroundColor: COLORS.secondary, marginTop: SIZES.base, marginVertical: 6 }}
        textStyle={{ color: COLORS.text }}
      />

      <PrimaryButton
        title="Necesito ayuda urgente"
        onPress={() => router.push('../emergency')}
        style={{ backgroundColor: '#e74c3c', marginTop: 24, marginVertical: 6 }}
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
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.padding
  },
  summaryBox: {
    backgroundColor: '#F0F4F8',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    marginBottom: SIZES.base * 2
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
  alertBox: {
    backgroundColor: '#FDECEA',
    borderLeftWidth: 5,
    borderLeftColor: '#D9534F',
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#D9534F',
    marginBottom: 4
  },
  alertText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text
  },
  lastEmotionBox: {
    backgroundColor: '#eaf6ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: SIZES.base * 2
  },
  lastEmotionText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.text
  },
  lastEmotionHighlight: {
    fontFamily: FONTS.bold,
    color: COLORS.primary
  }
});