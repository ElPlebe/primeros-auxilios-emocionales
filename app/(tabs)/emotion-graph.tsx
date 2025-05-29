import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';



interface EmotionLog {
  date: string;
  emotion: string;
}

const emotionToValue: Record<string, number> = {
  Bien: 5,
  Tranquilo: 4,
  Neutral: 3,
  Ansioso: 2,
  Triste: 1
};

const valueToEmotion = (val: number): string =>
  Object.keys(emotionToValue).find((key) => emotionToValue[key] === val) || '';

export default function EmotionGraphScreen() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const isDarkMode = scheme === 'dark';

  const [history, setHistory] = useState<EmotionLog[]>([]);
  const [filtered, setFiltered] = useState<EmotionLog[]>([]);
  const [filter, setFilter] = useState<'week' | 'month'>('week');
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [history, filter]);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem('emotionHistory');
    if (stored) {
      const parsed: EmotionLog[] = JSON.parse(stored);
      const sorted = parsed.sort((a, b) => (a.date > b.date ? 1 : -1));
      setHistory(sorted);
    }
  };

  const applyFilter = () => {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() - (filter === 'week' ? 7 : 30));
    const filtered = history.filter((item) => new Date(item.date) >= limit);
    setFiltered(filtered);
  };

  const getStats = () => {
    if (filtered.length === 0) return { max: null, min: null, avg: null };
    const sorted = [...filtered].sort((a, b) => emotionToValue[b.emotion] - emotionToValue[a.emotion]);
    const sum = filtered.reduce((acc: number, cur: { date: string; emotion: string }) => acc + emotionToValue[cur.emotion], 0);
    const avg = sum / filtered.length;
    return { max: sorted[0], min: sorted[sorted.length - 1], avg: parseFloat(avg.toFixed(2)) };
  };

  const stats = getStats();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Evolución emocional</Text>

      <View style={styles.toggle}>
        <TouchableOpacity style={[styles.toggleButton, filter === 'week' && styles.activeButton]} onPress={() => setFilter('week')}>
          <Text style={[styles.toggleText, filter === 'week' && styles.activeText]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, filter === 'month' && styles.activeButton]} onPress={() => setFilter('month')}>
          <Text style={[styles.toggleText, filter === 'month' && styles.activeText]}>Mes</Text>
        </TouchableOpacity>
      </View>

      {filtered.length > 1 ? (
        <>
          <LineChart
            data={{
              labels: filtered.map(item => item.date.slice(5)),
              datasets: [{ data: filtered.map(item => emotionToValue[item.emotion]) }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.background,
              backgroundGradientFrom: COLORS.background,
              backgroundGradientTo: COLORS.background,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
              propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />

          <View style={styles.statsContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Día más alto</Text>
              <Text style={styles.cardValue}>{stats.max?.date || '—'} - {stats.max?.emotion || ''}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Día más bajo</Text>
              <Text style={styles.cardValue}>{stats.min?.date || '—'} - {stats.min?.emotion || ''}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Promedio</Text>
              <Text style={styles.cardValue}>{stats.avg ? `${stats.avg} (${valueToEmotion(Math.round(stats.avg))})` : '—'}</Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Recomendación emocional</Text>
            {(() => {
              const lowDays = filtered.filter((e: { emotion: string }) => emotionToValue[e.emotion] <= 2).length;
              const avg = stats.avg ?? 0;

              if (lowDays >= 3) {
                return (
                  <>
                    <Text style={styles.recommendationText}>Has tenido varios días bajos. Te recomendamos practicar respiración guiada o grounding. También podrías contactar a tu persona de confianza.</Text>
                    <PrimaryButton title="Ejercicio calmante" onPress={() => router.push('/exercises/respiracion')} style={{ marginTop: SIZES.base }} />
                    <PrimaryButton title="Contacto de confianza" onPress={() => router.push('../trusted-contact')} style={{ marginTop: SIZES.base }} />
                  </>
                );
              }

              if (avg >= 4) {
                return (
                  <>
                    <Text style={styles.recommendationText}>Tu semana ha sido emocionalmente estable. ¡Sigue con tus buenos hábitos!</Text>
                    <PrimaryButton title="Ver más ejercicios" onPress={() => router.push('/exercises')} style={{ marginTop: SIZES.base }} />
                  </>
                );
              }

              if (avg < 3) {
                return (
                  <>
                    <Text style={styles.recommendationText}>Tu promedio emocional está algo bajo. Prueba con afirmaciones o escritura emocional.</Text>
                    <PrimaryButton title="Ver ejercicios sugeridos" onPress={() => router.push('/exercises')} style={{ marginTop: SIZES.base }} />
                  </>
                );
              }

              return (
                <>
                  <Text style={styles.recommendationText}>Tu estado emocional es intermedio. Revisa ejercicios si necesitas apoyo extra.</Text>
                  <PrimaryButton title="Explorar ejercicios" onPress={() => router.push('/exercises')} style={{ marginTop: SIZES.base }} />
                </>
              );
            })()}
          </View>
        </>
      ) : (
        <Text style={styles.empty}>No hay suficientes datos para mostrar la gráfica.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.base
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E0E6ED',
    marginHorizontal: 4
  },
  activeButton: {
    backgroundColor: COLORS.primary
  },
  toggleText: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted
  },
  activeText: {
    color: '#fff',
    fontFamily: FONTS.bold
  },
  statsContainer: {
    marginTop: SIZES.padding,
    gap: 12
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: SIZES.radius
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4
  },
  cardValue: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: 16
  },
  empty: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SIZES.padding
  },
  recommendationBox: {
    backgroundColor: '#F0F4F8',
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding
  },
  recommendationTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 6
  },
  recommendationText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted
  }
});
