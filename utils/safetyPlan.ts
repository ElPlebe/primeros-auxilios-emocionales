export type SafetyPlanStepId = 'safePlace' | 'canContact' | 'trustedContact' | 'urgentHelp';

export type SafetyPlanStatus = Record<SafetyPlanStepId, boolean>;

export interface SafetyPlanStep {
  id: SafetyPlanStepId;
  title: string;
  description: string;
  actionLabel: string;
}

export const SAFETY_PLAN_STEPS: SafetyPlanStep[] = [
  {
    id: 'safePlace',
    title: 'Estoy en un lugar seguro',
    description: 'Si puedes, aléjate de objetos, lugares o situaciones que aumenten el riesgo.',
    actionLabel: 'Ubicarme en un lugar seguro'
  },
  {
    id: 'canContact',
    title: 'Puedo contactar a alguien',
    description: 'Identifica una persona cercana, familiar, amistad o profesional que pueda acompañarte.',
    actionLabel: 'Elegir a quién contactar'
  },
  {
    id: 'trustedContact',
    title: 'Tengo mi contacto de confianza',
    description: 'Ten a la mano el número de alguien que pueda responder si necesitas apoyo inmediato.',
    actionLabel: 'Revisar contacto de confianza'
  },
  {
    id: 'urgentHelp',
    title: 'Sé cómo llamar a ayuda urgente',
    description: 'Si el riesgo aumenta o hay peligro inmediato, usa servicios de emergencia o una línea de apoyo.',
    actionLabel: 'Ver ayuda urgente'
  }
];

const STEP_IDS = new Set<SafetyPlanStepId>(SAFETY_PLAN_STEPS.map((step) => step.id));

export function createInitialSafetyPlanStatus(): SafetyPlanStatus {
  return {
    safePlace: false,
    canContact: false,
    trustedContact: false,
    urgentHelp: false
  };
}

export function updateSafetyPlanStep(
  currentStatus: SafetyPlanStatus,
  stepId: string,
  isComplete: boolean
): SafetyPlanStatus {
  if (!STEP_IDS.has(stepId as SafetyPlanStepId)) {
    throw new Error('El paso de seguridad no existe.');
  }

  return {
    ...currentStatus,
    [stepId]: isComplete
  };
}

export function getSafetyPlanProgress(status: SafetyPlanStatus) {
  const total = SAFETY_PLAN_STEPS.length;
  const completed = SAFETY_PLAN_STEPS.filter((step) => status[step.id]).length;

  return {
    completed,
    total,
    isComplete: completed === total
  };
}
