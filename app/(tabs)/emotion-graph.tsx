import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import {
  MIN_EMOTION_LOGS_FOR_GRAPH,
  emotionToValue,
  getEmotionDisplayLabel,
  getEmotionValue,
  valueToEmotion
} from '../../utils/emotionScale';
import {
  EmotionLog,
  getAverageEmotionValue,
  getEmotionHistory
} from '../../utils/emotionUtils';

export default function EmotionGraphScreen() {
  const [history, setHistory] = useState<EmotionLog[]>([]);
  const [filtered, setFiltered] = useState<EmotionLog[]>([]);
  const [filter, setFilter] = useState<'week' | 'month'>('week');
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const data = await getEmotionHistory();
      const sorted = data.sort((a, b) => a.date.localeCompare(b.date));
      setHistory(sorted);
    };
    loadData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() - (filter === 'week' ? 7 : 30));
    setFiltered(history.filter((item) => new Date(item.date) >= limit));
  }, [history, filter]);

  const getStats = () => {
    if (filtered.length === 0) return { max: null, min: null, avg: null };
    const sorted = [...filtered].sort((a, b) => getEmotionValue(b.emotion) - getEmotionValue(a.emotion));
    const avg = getAverageEmotionValue(filtered, emotionToValue);
    return { max: sorted[0], min: sorted[sorted.length - 1], avg };
  };

  const stats = getStats();
  const hasEnoughData = filtered.length >= MIN_EMOTION_LOGS_FOR_GRAPH;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Evolución emocional</Text>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleButton, filter === 'week' && styles.activeButton]}
          onPress={() => setFilter('week')}
        >
          <Text style={[styles.toggleText, filter === 'week' && styles.activeText]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, filter === 'month' && styles.activeButton]}
          onPress={() => setFilter('month')}
        >
          <Text style={[styles.toggleText, filter === 'month' && styles.activeText]}>Mes</Text>
        </TouchableOpacity>
      </View>

      {hasEnoughData ? (
        <>
          <LineChart
            data={{
              labels: filtered.map((item) => item.date.slice(5)),
              datasets: [{ data: filtered.map((item) => getEmotionValue(item.emotion)) }]
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
            style={styles.chart}
          />

          <View style={styles.statsContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Día más alto</Text>
              <Text style={styles.cardValue}>
                {stats.max?.date || '-'} · {stats.max ? getEmotionDisplayLabel(stats.max.emotion) : ''}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Día más bajo</Text>
              <Text style={styles.cardValue}>
                {stats.min?.date || '-'} · {stats.min ? getEmotionDisplayLabel(stats.min.emotion) : ''}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Promedio</Text>
              <Text style={styles.cardValue}>
                {stats.avg ? `${stats.avg} (${valueToEmotion(Math.round(stats.avg))})` : '-'}
              </Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Recomendación emocional</Text>
            {(() => {
              const lowDays = filtered.filter((e) => getEmotionValue(e.emotion) <= 2).length;
              const avg = stats.avg ?? 0;

              if (lowDays >= 3) {
                return (
                  <>
                    <Text style={styles.recommendationText}>
                      Has tenido varios días bajos. Te recomendamos practicar respiración guiada o grounding. También podrías contactar a tu persona de confianza.
                    </Text>
                    <PrimaryButton title="Ejercicio calmante" onPress={() => router.push('/exercises/respiracion')} style={{ marginTop: SIZES.base }} />
                    <PrimaryButton title="Contacto de confianza" onPress={() => router.push('../trusted-contact')} style={{ marginTop: SIZES.base }} />
                  </>
                );
              }

              if (avg >= 4) {
                return (
                  <>
                    <Text style={styles.recommendationText}>
                      Tu semana ha sido emocionalmente estable. Sigue con tus hábitos de cuidado.
                    </Text>
                    <PrimaryButton title="Ver más ejercicios" onPress={() => router.push('/exercises')} style={{ marginTop: SIZES.base }} />
                  </>
                );
              }

              if (avg < 3) {
                return (
                  <>
                    <Text style={styles.recommendationText}>
                      Tu promedio emocional está algo bajo. Prueba con afirmaciones o escritura emocional.
                    </Text>
                    <PrimaryButton title="Ver ejercicios sugeridos" onPress={() => router.push('/exercises')} style={{ marginTop: SIZES.base }} />
                  </>
                );
              }

              return (
                <>
                  <Text style={styles.recommendationText}>
                    Tu estado emocional es intermedio. Revisa ejercicios si necesitas apoyo extra.
                  </Text>
                  <PrimaryButton title="Explorar ejercicios" onPress={() => router.push('/exercises')} style={{ marginTop: SIZES.base }} />
                </>
              );
            })()}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aún falta información</Text>
          <Text style={styles.empty}>
            Registra al menos {MIN_EMOTION_LOGS_FOR_GRAPH} emociones en este periodo para mostrar una tendencia.
          </Text>
          <PrimaryButton
            title="Registrar emoción ahora"
            onPress={() => router.push('../daily-checkin')}
            style={styles.emptyButton}
          />
        </View>
      )}
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
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.padding
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: '#E0E6ED',
    marginHorizontal: 4
  },
  activeButton: {
    backgroundColor: COLORS.primary
  },
  toggleText: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: 15
  },
  activeText: {
    color: '#fff',
    fontFamily: FONTS.bold
  },
  chart: {
    marginVertical: 8,
    borderRadius: SIZES.radius
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
  emptyState: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.padding
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center'
  },
  empty: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SIZES.padding
  },
  emptyButton: {
    alignSelf: 'stretch'
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
