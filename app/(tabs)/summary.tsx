import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { EXERCISE_LABELS } from '../../utils/assessment';
import { getStoredWellnessData } from '../../utils/storage';
import { buildWellnessDataExport, buildWellnessSummary, WellnessData, WellnessSummary } from '../../utils/wellnessReport';

const EMPTY_DATA: WellnessData = {
  emotionHistory: [],
  completedExercises: [],
  surveyAssessments: [],
  exerciseFollowUps: []
};

const formatMetric = (value: number | null) => (value === null ? 'Sin datos' : String(value));

const formatDate = (value: string | null) => {
  if (!value) return 'Sin datos';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SummaryScreen() {
  const router = useRouter();
  const [data, setData] = useState<WellnessData>(EMPTY_DATA);
  const [summary, setSummary] = useState<WellnessSummary>(() => buildWellnessSummary(EMPTY_DATA));

  useEffect(() => {
    const loadData = async () => {
      const stored = await getStoredWellnessData();
      setData(stored);
      setSummary(buildWellnessSummary(stored));
    };

    loadData().catch(() => {
      Alert.alert('No se pudo cargar el resumen', 'Intenta abrir esta pantalla nuevamente.');
    });
  }, []);

  const exportData = async () => {
    await Share.share({
      title: 'Resumen de seguimiento emocional',
      message: buildWellnessDataExport(data)
    });
  };

  const mostUsedExercise = summary.mostUsedExerciseId
    ? EXERCISE_LABELS[summary.mostUsedExerciseId]
    : 'Sin datos';
  const recentFollowUps = data.exerciseFollowUps.slice(0, 5);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumen de seguimiento</Text>
      <Text style={styles.subtitle}>
        Vista simple para revisar uso, utilidad percibida y cambio inmediato antes/después de las intervenciones.
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Cambio promedio inmediato</Text>
        <Text style={styles.heroValue}>{formatMetric(summary.averageDelta)}</Text>
        <Text style={styles.heroText}>
          Se calcula como malestar posterior menos malestar inicial. Un número negativo indica reducción inmediata.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Indicadores principales</Text>
        <SummaryRow label="Autoevaluaciones" value={summary.totalAssessments} />
        <SummaryRow label="Seguimientos post-ejercicio" value={summary.totalFollowUps} />
        <SummaryRow label="Malestar antes promedio" value={formatMetric(summary.averageDistressBefore)} />
        <SummaryRow label="Malestar después promedio" value={formatMetric(summary.averageDistressAfter)} />
        <SummaryRow label="Utilidad percibida promedio" value={formatMetric(summary.averageHelpfulRating)} />
        <SummaryRow label="Ejercicio más utilizado" value={mostUsedExercise} />
        <SummaryRow label="Nivel más reciente" value={summary.mostRecentLevel ?? 'Sin datos'} />
        <SummaryRow label="Última emoción registrada" value={summary.lastEmotion ?? 'Sin datos'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actividad reciente</Text>
        <SummaryRow label="Última autoevaluación" value={formatDate(summary.lastAssessmentAt)} />
        <SummaryRow label="Último seguimiento" value={formatDate(summary.lastFollowUpAt)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimos ejercicios guardados</Text>
        {recentFollowUps.length === 0 ? (
          <Text style={styles.emptyText}>Aún no hay seguimientos post-ejercicio.</Text>
        ) : (
          recentFollowUps.map((item) => (
            <View key={`${item.createdAt}-${item.exerciseId}`} style={styles.followUpItem}>
              <Text style={styles.followUpTitle}>{EXERCISE_LABELS[item.exerciseId]}</Text>
              <Text style={styles.followUpText}>
                Antes {item.distressBefore}/10 · Después {item.distressAfter}/10 · Cambio {item.delta}
              </Text>
              {item.helpfulRating && (
                <Text style={styles.followUpText}>Utilidad percibida: {item.helpfulRating}/5</Text>
              )}
            </View>
          ))
        )}
      </View>

      <PrimaryButton
        title="Exportar resumen y datos"
        onPress={exportData}
        style={styles.primaryButton}
        accessibilityHint="Abre opciones para compartir el resumen y los datos de seguimiento."
      />
      <PrimaryButton
        title="Realizar autoevaluación"
        onPress={() => router.push('/survey')}
        variant="secondary"
        style={styles.secondaryButton}
        accessibilityHint="Inicia una evaluación breve de tu estado emocional."
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
  title: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 28,
    marginBottom: SIZES.base
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: SIZES.padding
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius + 4,
    marginBottom: SIZES.base * 2,
    padding: 18
  },
  heroLabel: {
    color: '#EAF6FF',
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: 8
  },
  heroValue: {
    color: COLORS.card,
    fontFamily: FONTS.bold,
    fontSize: 42,
    marginBottom: 8
  },
  heroText: {
    color: '#EAF6FF',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: SIZES.base * 2,
    padding: 16
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: 10
  },
  summaryRow: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingVertical: 9
  },
  rowLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 13,
    marginBottom: 2
  },
  rowValue: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22
  },
  followUpItem: {
    backgroundColor: '#F5F8FB',
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    padding: 12
  },
  followUpTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 15,
    marginBottom: 4
  },
  followUpText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.base
  },
  secondaryButton: {
    marginBottom: 0
  }
});
