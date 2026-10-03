export type SafetyAnswer = 'safe' | 'unsafe' | 'unsure';
export type DistressLevel = 'minimo' | 'leve' | 'moderado' | 'severo';
export type SupportNeed = 'seguridad' | 'calma' | 'claridad' | 'conexion' | 'esperanza';
export type Phq4Answer = 0 | 1 | 2 | 3;
export type HelpfulRating = 1 | 2 | 3 | 4 | 5;

export type ExerciseId =
  | 'respiracion'
  | 'grounding'
  | 'afirmaciones'
  | 'escritura'
  | 'escucha'
  | 'ayuda'
  | 'afirmacionesAnsiedad'
  | 'visualizacion'
  | 'movimiento'
  | 'relajacion';

export interface SurveyAssessmentInput {
  safetyAnswer: SafetyAnswer;
  distressBefore: number;
  phq4Answers: [Phq4Answer, Phq4Answer, Phq4Answer, Phq4Answer];
  primaryNeed: SupportNeed;
}

export interface SurveyAssessmentResult {
  emergency: boolean;
  level: DistressLevel;
  distressBefore: number;
  phq4Score: number;
  anxietyScore: number;
  depressionScore: number;
  primaryNeed: SupportNeed;
  recommendedExerciseIds: ExerciseId[];
}

export interface ExerciseFollowUpInput {
  exerciseId: ExerciseId;
  distressBefore: number;
  distressAfter: number;
  helpfulRating?: HelpfulRating;
  helpfulComment?: string;
  assessmentLevel?: DistressLevel;
}

export interface HelpfulRatingRequirementInput {
  assessmentLevel?: DistressLevel;
  source?: string | null;
  distressBefore: number;
  distressAfter: number;
}

export interface ExerciseFollowUp extends ExerciseFollowUpInput {
  delta: number;
  createdAt: string;
}

export const DISTRESS_OPTIONS = Array.from({ length: 11 }, (_, value) => value);

export const SAFETY_OPTIONS: { value: SafetyAnswer; label: string; description: string }[] = [
  {
    value: 'safe',
    label: 'Estoy a salvo',
    description: 'Puedo continuar con la evaluación breve.'
  },
  {
    value: 'unsure',
    label: 'No estoy seguro/a',
    description: 'Necesito ver opciones de ayuda inmediata.'
  },
  {
    value: 'unsafe',
    label: 'Estoy en riesgo',
    description: 'Necesito ayuda urgente ahora.'
  }
];

export const PHQ4_OPTIONS: { value: Phq4Answer; label: string }[] = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad' },
  { value: 3, label: 'Casi diario' }
];

export const PHQ4_ITEMS: { id: string; text: string; area: 'ansiedad' | 'depresion' }[] = [
  {
    id: 'nervios',
    text: 'Me he sentido nervioso/a, ansioso/a o con los nervios de punta.',
    area: 'ansiedad'
  },
  {
    id: 'preocupacion',
    text: 'No he podido parar o controlar la preocupación.',
    area: 'ansiedad'
  },
  {
    id: 'desanimo',
    text: 'Me he sentido decaído/a, deprimido/a o sin esperanza.',
    area: 'depresion'
  },
  {
    id: 'interes',
    text: 'He tenido poco interés o placer en hacer cosas.',
    area: 'depresion'
  }
];

export const SUPPORT_NEEDS: { value: SupportNeed; label: string; description: string }[] = [
  {
    value: 'seguridad',
    label: 'Sentirme más seguro/a',
    description: 'Ubicar apoyo y pasos inmediatos.'
  },
  {
    value: 'calma',
    label: 'Calmar mi cuerpo',
    description: 'Bajar la activación con respiración o grounding.'
  },
  {
    value: 'claridad',
    label: 'Entender lo que siento',
    description: 'Nombrar emociones y pensamientos sin juicio.'
  },
  {
    value: 'conexion',
    label: 'Conectar con alguien',
    description: 'Recordar que no tengo que atravesarlo solo/a.'
  },
  {
    value: 'esperanza',
    label: 'Saber qué hacer después',
    description: 'Elegir un siguiente paso pequeño y posible.'
  }
];

export const HELPFUL_RATING_OPTIONS: { value: HelpfulRating; label: string }[] = [
  { value: 1, label: 'Nada' },
  { value: 2, label: 'Poco' },
  { value: 3, label: 'Algo' },
  { value: 4, label: 'Mucho' },
  { value: 5, label: 'Muchísimo' }
];

export const EXERCISE_LABELS: Record<ExerciseId, string> = {
  respiracion: 'Respiración guiada',
  grounding: 'Grounding 5-4-3-2-1',
  afirmaciones: 'Autocompasión breve',
  escritura: 'Escritura emocional',
  escucha: 'Escucha consciente',
  ayuda: 'Contacto con ayuda urgente',
  afirmacionesAnsiedad: 'Afirmaciones para ansiedad',
  visualizacion: 'Visualización calmante',
  movimiento: 'Movimiento suave',
  relajacion: 'Relajación muscular progresiva'
};

const RECOMMENDATIONS_BY_LEVEL: Record<DistressLevel, ExerciseId[]> = {
  minimo: ['respiracion', 'afirmaciones', 'escucha'],
  leve: ['respiracion', 'escritura', 'visualizacion'],
  moderado: ['grounding', 'respiracion', 'relajacion'],
  severo: ['ayuda', 'grounding', 'respiracion']
};

const RECOMMENDATIONS_BY_NEED: Record<SupportNeed, ExerciseId[]> = {
  seguridad: ['ayuda', 'grounding', 'respiracion'],
  calma: ['respiracion', 'grounding', 'relajacion'],
  claridad: ['escritura', 'grounding'],
  conexion: ['ayuda', 'grounding', 'escucha'],
  esperanza: ['movimiento', 'respiracion', 'escritura']
};

export const RESULT_CONTENT: Record<
  DistressLevel,
  { emotionType: 'low' | 'moderate' | 'high'; emotionTitle: string; message: string }
> = {
  minimo: {
    emotionType: 'low',
    emotionTitle: 'Malestar mínimo',
    message: 'Tus respuestas sugieren bajo malestar en este momento. Aun así, puedes practicar un ejercicio breve para seguir cuidándote.'
  },
  leve: {
    emotionType: 'low',
    emotionTitle: 'Malestar leve',
    message: 'Hay señales de malestar, pero también espacio para hacer una pausa y regularte con una intervención breve.'
  },
  moderado: {
    emotionType: 'moderate',
    emotionTitle: 'Malestar moderado',
    message: 'Parece que estás atravesando un momento emocionalmente cargado. Probemos un ejercicio de estabilización y vuelve a observar cómo te sientes.'
  },
  severo: {
    emotionType: 'high',
    emotionTitle: 'Malestar alto',
    message: 'Tus respuestas indican malestar intenso. No es un diagnóstico, pero sí una señal para priorizar calma, seguridad y apoyo cercano o profesional.'
  }
};

export function hasEmergencyRisk(answer: SafetyAnswer, distressBefore?: number | null) {
  return answer !== 'safe' || (typeof distressBefore === 'number' && distressBefore >= 9);
}

export function getPhq4Level(total: number): DistressLevel {
  if (!Number.isInteger(total) || total < 0 || total > 12) {
    throw new Error('El puntaje PHQ-4 debe ser un entero entre 0 y 12.');
  }

  if (total <= 2) return 'minimo';
  if (total <= 5) return 'leve';
  if (total <= 8) return 'moderado';
  return 'severo';
}

export function normalizeDistressLevel(value: unknown): DistressLevel {
  if (value === 'minimo' || value === 'leve' || value === 'moderado' || value === 'severo') {
    return value;
  }

  return 'leve';
}

export function normalizeSupportNeed(value: unknown): SupportNeed | undefined {
  if (
    value === 'seguridad' ||
    value === 'calma' ||
    value === 'claridad' ||
    value === 'conexion' ||
    value === 'esperanza'
  ) {
    return value;
  }

  return undefined;
}

export function normalizeDistressValue(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10) {
    return null;
  }

  return parsed;
}

export function normalizeHelpfulRating(value: unknown): HelpfulRating | null {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }

  return parsed as HelpfulRating;
}

export function isExerciseId(value: unknown): value is ExerciseId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(EXERCISE_LABELS, value);
}

export function getExerciseRecommendations(level: DistressLevel, primaryNeed: SupportNeed) {
  if (level === 'severo') {
    return RECOMMENDATIONS_BY_LEVEL.severo;
  }

  const ordered = [...RECOMMENDATIONS_BY_NEED[primaryNeed], ...RECOMMENDATIONS_BY_LEVEL[level]];
  return Array.from(new Set(ordered)).slice(0, 3);
}

export function assessSurvey(input: SurveyAssessmentInput): SurveyAssessmentResult {
  const distressBefore = normalizeDistressValue(input.distressBefore);

  if (distressBefore === null) {
    throw new Error('El malestar inicial debe estar entre 0 y 10.');
  }

  const phq4Score = input.phq4Answers.reduce<number>((sum, answer) => sum + answer, 0);
  const level = getPhq4Level(phq4Score);
  const emergency = hasEmergencyRisk(input.safetyAnswer, distressBefore);
  const highDistressRecommendations: ExerciseId[] = ['grounding', 'respiracion', 'ayuda'];

  return {
    emergency,
    level,
    distressBefore,
    phq4Score,
    anxietyScore: input.phq4Answers[0] + input.phq4Answers[1],
    depressionScore: input.phq4Answers[2] + input.phq4Answers[3],
    primaryNeed: input.primaryNeed,
    recommendedExerciseIds:
      input.safetyAnswer !== 'safe'
        ? ['ayuda', 'grounding', 'respiracion']
        : distressBefore >= 9
          ? highDistressRecommendations
          : getExerciseRecommendations(level, input.primaryNeed)
  };
}

export function getDistressDelta(distressBefore: number, distressAfter: number) {
  return distressAfter - distressBefore;
}

export function buildExerciseFollowUp(input: ExerciseFollowUpInput): ExerciseFollowUp {
  const distressBefore = normalizeDistressValue(input.distressBefore);
  const distressAfter = normalizeDistressValue(input.distressAfter);
  const helpfulRating =
    input.helpfulRating === undefined ? undefined : normalizeHelpfulRating(input.helpfulRating);
  const helpfulComment = input.helpfulComment?.trim();

  if (distressBefore === null || distressAfter === null) {
    throw new Error('Los valores de malestar deben estar entre 0 y 10.');
  }

  if (helpfulRating === null) {
    throw new Error('La utilidad percibida debe estar entre 1 y 5.');
  }

  return {
    ...input,
    distressBefore,
    distressAfter,
    helpfulRating,
    helpfulComment: helpfulComment || undefined,
    delta: getDistressDelta(distressBefore, distressAfter),
    createdAt: new Date().toISOString()
  };
}

export function shouldRequireHelpfulRating(input: HelpfulRatingRequirementInput) {
  if (input.assessmentLevel === 'severo') return false;
  if (input.source === 'crisis') return false;
  return input.distressAfter <= input.distressBefore;
}
