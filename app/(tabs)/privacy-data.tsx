import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { buildWellnessDataExport, buildWellnessSummary, WellnessData, WellnessSummary } from '../../utils/wellnessReport';
import { clearWellnessHistory, getStoredWellnessData } from '../../utils/storage';

const EMPTY_DATA: WellnessData = {
  emotionHistory: [],
  completedExercises: [],
  surveyAssessments: [],
  exerciseFollowUps: []
};

const formatMetric = (value: number | null) => (value === null ? 'Sin datos' : String(value));

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function PrivacyDataScreen() {
  const router = useRouter();
  const [data, setData] = useState<WellnessData>(EMPTY_DATA);
  const [summary, setSummary] = useState<WellnessSummary>(() => buildWellnessSummary(EMPTY_DATA));

  const loadData = async () => {
    const stored = await getStoredWellnessData();
    setData(stored);
    setSummary(buildWellnessSummary(stored));
  };

  useEffect(() => {
    loadData().catch(() => {
      Alert.alert('No se pudieron cargar los datos', 'Intenta abrir esta pantalla nuevamente.');
    });
  }, []);

  const exportData = async () => {
    await Share.share({
      title: 'Datos de seguimiento emocional',
      message: buildWellnessDataExport(data)
    });
  };

  const confirmClearHistory = () => {
    Alert.alert(
      '¿Borrar historial de seguimiento?',
      'Se eliminarán emociones registradas, autoevaluaciones, ejercicios completados, seguimientos y el plan de seguridad breve guardados en este dispositivo. Tu contacto de confianza no se eliminará.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar historial',
          style: 'destructive',
          onPress: async () => {
            await clearWellnessHistory();
            setData(EMPTY_DATA);
            setSummary(buildWellnessSummary(EMPTY_DATA));
            Alert.alert('Historial borrado', 'Los datos de seguimiento fueron eliminados.');
          }
        }
      ]
    );
  };

  const hasData =
    summary.totalEmotionLogs +
      summary.totalCompletedExercises +
      summary.totalAssessments +
      summary.totalFollowUps >
    0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacidad y datos</Text>
      <Text style={styles.subtitle}>
        Tu información de seguimiento y plan de seguridad se guarda localmente en este dispositivo. Puedes revisarla,
        exportarla o borrarla cuando lo necesites.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos guardados</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="emociones" value={summary.totalEmotionLogs} />
          <MetricCard label="autoevaluaciones" value={summary.totalAssessments} />
          <MetricCard label="seguimientos" value={summary.totalFollowUps} />
          <MetricCard label="ejercicios" value={summary.totalCompletedExercises} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen inmediato</Text>
        <Text style={styles.rowText}>Malestar antes promedio: {formatMetric(summary.averageDistressBefore)}</Text>
        <Text style={styles.rowText}>Malestar después promedio: {formatMetric(summary.averageDistressAfter)}</Text>
        <Text style={styles.rowText}>Cambio promedio: {formatMetric(summary.averageDelta)}</Text>
        <Text style={styles.rowText}>Utilidad percibida promedio: {formatMetric(summary.averageHelpfulRating)}</Text>
      </View>

      {!hasData && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aún no hay historial</Text>
          <Text style={styles.emptyText}>
            Cuando registres emociones, realices autoevaluaciones o guardes un ejercicio, aquí aparecerán tus datos.
          </Text>
        </View>
      )}

      <PrimaryButton
        title="Ver resumen para tesis/clínica"
        onPress={() => router.push('../summary')}
        style={styles.primaryButton}
        accessibilityHint="Abre un resumen con indicadores de seguimiento para revisión académica."
      />
      <PrimaryButton
        title="Exportar datos"
        onPress={exportData}
        variant="secondary"
        style={styles.secondaryButton}
        accessibilityHint="Abre las opciones para compartir una exportación de tus datos locales."
      />
      <PrimaryButton
        title="Borrar historial"
        onPress={confirmClearHistory}
        variant="danger"
        style={styles.dangerButton}
        accessibilityHint="Elimina el historial de seguimiento guardado en este dispositivo."
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
    marginBottom: 12
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  metricCard: {
    backgroundColor: '#F5F8FB',
    borderRadius: SIZES.radius,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 12
  },
  metricValue: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 24,
    marginBottom: 2
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 13
  },
  rowText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 23
  },
  emptyCard: {
    backgroundColor: '#EAF6FF',
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    padding: 16
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 4
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.base
  },
  secondaryButton: {
    marginBottom: SIZES.base
  },
  dangerButton: {
    marginBottom: 0
  }
});
