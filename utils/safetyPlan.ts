export type SafetyPlanStepId =
  | 'warningSigns'
  | 'internalCoping'
  | 'safePeoplePlaces'
  | 'trustedContact'
  | 'professionalHelp'
  | 'saferEnvironment';

export type SafetyPlanStatus = Record<SafetyPlanStepId, boolean>;

export interface SafetyPlanStep {
  id: SafetyPlanStepId;
  title: string;
  description: string;
  actionLabel: string;
  example: string;
}

export const SAFETY_PLAN_STEPS: SafetyPlanStep[] = [
  {
    id: 'warningSigns',
    title: 'Reconozco señales de alerta',
    description: 'Identifica cambios que avisan que necesitas apoyo antes de que el malestar suba más.',
    actionLabel: 'Nombrar mis señales',
    example: 'Ej. pensamientos acelerados, ganas de aislarme, impulso de hacerme daño.'
  },
  {
    id: 'internalCoping',
    title: 'Tengo una estrategia interna',
    description: 'Elige una acción breve que puedas intentar por tu cuenta sin ponerte en riesgo.',
    actionLabel: 'Elegir estrategia breve',
    example: 'Ej. grounding, respiración suave, música segura, caminar en casa.'
  },
  {
    id: 'safePeoplePlaces',
    title: 'Tengo personas o lugares que ayudan',
    description: 'Ubica a quién o dónde podrías acercarte para no estar solo/a con el riesgo.',
    actionLabel: 'Ubicar apoyo cercano',
    example: 'Ej. sala, tienda cercana, familiar, amistad, vecino, campus o recepción.'
  },
  {
    id: 'trustedContact',
    title: 'Tengo mi contacto de confianza',
    description: 'Ten a la mano el número de alguien que pueda responder si necesitas apoyo inmediato.',
    actionLabel: 'Revisar contacto de confianza',
    example: 'Ej. guardar teléfono y enviar mensaje: necesito hablar contigo ahora.'
  },
  {
    id: 'professionalHelp',
    title: 'Sé cómo pedir ayuda profesional o urgente',
    description: 'Define servicios que puedes usar si el riesgo aumenta o no puedes mantenerte a salvo.',
    actionLabel: 'Ver 911 y Línea de la Vida',
    example: 'En México: 911 para emergencia y Línea de la Vida 800 911 2000.'
  },
  {
    id: 'saferEnvironment',
    title: 'Puedo hacer mi ambiente más seguro',
    description: 'Reduce acceso a objetos, lugares o situaciones que puedan aumentar el riesgo.',
    actionLabel: 'Hacer un cambio seguro',
    example: 'Ej. salir a un área común, alejar objetos de riesgo, pedir compañía.'
  }
];

const STEP_IDS = new Set<SafetyPlanStepId>(SAFETY_PLAN_STEPS.map((step) => step.id));

export function createInitialSafetyPlanStatus(): SafetyPlanStatus {
  return {
    warningSigns: false,
    internalCoping: false,
    safePeoplePlaces: false,
    trustedContact: false,
    professionalHelp: false,
    saferEnvironment: false
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
