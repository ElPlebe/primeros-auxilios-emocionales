import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { CARD_STYLES, SCREEN_STYLES, SPACING, TYPOGRAPHY } from '../../constants/design';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import {
  createInitialSafetyPlanStatus,
  getSafetyPlanProgress,
  SAFETY_PLAN_STEPS,
  SafetyPlanStepId,
  SafetyPlanStatus,
  updateSafetyPlanStep
} from '../../utils/safetyPlan';
import { getSafetyPlanStatus, saveSafetyPlanStatus } from '../../utils/storage';

export default function SafetyPlanScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<SafetyPlanStatus>(() => createInitialSafetyPlanStatus());

  useEffect(() => {
    getSafetyPlanStatus()
      .then(setStatus)
      .catch(() => {
        Alert.alert('No se pudo cargar', 'Intenta abrir el plan de seguridad nuevamente.');
      });
  }, []);

  const toggleStep = async (stepId: SafetyPlanStepId) => {
    const nextStatus = updateSafetyPlanStep(status, stepId, !status[stepId]);
    setStatus(nextStatus);
    await saveSafetyPlanStatus(nextStatus);
  };

  const progress = getSafetyPlanProgress(status);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Plan de seguridad breve</Text>
      <Text style={styles.subtitle}>
        Una guía rápida para organizar tus próximos pasos cuando el malestar se siente intenso.
      </Text>

      <View style={styles.urgentCard}>
        <Text style={styles.urgentTitle}>Si hay peligro inmediato</Text>
        <Text style={styles.urgentText}>
          Prioriza llamar a emergencias o buscar una persona que pueda acompañarte ahora. Este plan no reemplaza atención profesional.
        </Text>
        <PrimaryButton
          title="Llamar o ver ayuda urgente"
          onPress={() => router.push('../emergency')}
          variant="danger"
          accessibilityHint="Abre la pantalla con opciones de emergencia y líneas de apoyo."
        />
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          Progreso del plan: {progress.completed} de {progress.total}
        </Text>
        <Text style={styles.progressHelper}>
          Marca solo lo que sea cierto en este momento. Puedes volver a cambiarlo cuando quieras.
        </Text>
      </View>

      {SAFETY_PLAN_STEPS.map((step, index) => {
        const isComplete = status[step.id];

        return (
          <TouchableOpacity
            key={step.id}
            accessibilityHint="Toca dos veces para marcar o desmarcar este paso."
            accessibilityLabel={`${step.title}. Estado: ${isComplete ? 'listo' : 'pendiente'}.`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isComplete }}
            activeOpacity={0.82}
            onPress={() => {
              void toggleStep(step.id);
            }}
            style={[styles.stepCard, isComplete && styles.stepCardComplete]}
          >
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, isComplete && styles.stepBadgeComplete]}>
                <Text style={[styles.stepBadgeText, isComplete && styles.stepBadgeTextComplete]}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.stepTitleWrap}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={[styles.stepState, isComplete && styles.stepStateComplete]}>
                  {isComplete ? 'Listo' : 'Pendiente'}
                </Text>
              </View>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <Text style={styles.stepAction}>{step.actionLabel}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.actions}>
        <PrimaryButton
          title="Revisar contacto de confianza"
          onPress={() => router.push('../trusted-contact')}
          variant="secondary"
          accessibilityHint="Abre la pantalla para guardar o revisar tu contacto de confianza."
        />
        <PrimaryButton
          title="Volver al inicio"
          onPress={() => router.replace('/')}
          variant="ghost"
          style={styles.secondaryAction}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...SCREEN_STYLES.padded
  },
  title: {
    ...TYPOGRAPHY.screenTitle,
    marginBottom: SPACING.xs
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.lg
  },
  urgentCard: {
    ...CARD_STYLES.urgent,
    marginBottom: SPACING.md
  },
  urgentTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.error,
    marginBottom: 6
  },
  urgentText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  progressCard: {
    ...CARD_STYLES.softInfo,
    marginBottom: SPACING.md
  },
  progressText: {
    ...TYPOGRAPHY.bodyStrong
  },
  progressHelper: {
    ...TYPOGRAPHY.caption,
    marginTop: 4
  },
  stepCard: {
    ...CARD_STYLES.default,
    marginBottom: SPACING.sm
  },
  stepCardComplete: {
    borderColor: COLORS.success
  },
  stepHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  stepBadge: {
    alignItems: 'center',
    backgroundColor: '#E0E6ED',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  stepBadgeComplete: {
    backgroundColor: COLORS.success
  },
  stepBadgeText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16
  },
  stepBadgeTextComplete: {
    color: COLORS.card
  },
  stepTitleWrap: {
    flex: 1
  },
  stepTitle: {
    ...TYPOGRAPHY.bodyStrong
  },
  stepState: {
    ...TYPOGRAPHY.caption
  },
  stepStateComplete: {
    color: COLORS.success,
    fontFamily: FONTS.bold
  },
  stepDescription: {
    ...TYPOGRAPHY.body,
    marginBottom: 8
  },
  stepAction: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    gap: SIZES.base,
    marginTop: SPACING.sm
  },
  secondaryAction: {
    marginTop: 0
  }
});
