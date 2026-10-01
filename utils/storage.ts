import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExerciseFollowUp, SurveyAssessmentResult } from './assessment';
import { createInitialSafetyPlanStatus } from './safetyPlan';
import type { SafetyPlanStatus } from './safetyPlan';
import type { StoredSurveyAssessment, WellnessData, WellnessEmotionLog } from './wellnessReport';

const COMPLETED_EXERCISES_KEY = 'completedExercises';
const SURVEY_ASSESSMENTS_KEY = 'surveyAssessmentHistory';
const EXERCISE_FOLLOW_UPS_KEY = 'exerciseFollowUps';
const EMOTION_HISTORY_KEY = 'emotionHistory';
const CONSENT_ACCEPTED_KEY = 'consentAcceptedAt';
const SAFETY_PLAN_STATUS_KEY = 'safetyPlanStatus';

const parseStoredArray = <T>(stored: string | null): T[] => {
  if (!stored) return [];

  const parsed = JSON.parse(stored);
  return Array.isArray(parsed) ? parsed : [];
};

export const acceptConsent = async () => {
  await AsyncStorage.setItem(CONSENT_ACCEPTED_KEY, new Date().toISOString());
};

export const getConsentAcceptedAt = async () => AsyncStorage.getItem(CONSENT_ACCEPTED_KEY);

export const hasAcceptedConsent = async () => {
  const acceptedAt = await getConsentAcceptedAt();
  return Boolean(acceptedAt);
};

export const getSafetyPlanStatus = async (): Promise<SafetyPlanStatus> => {
  try {
    const stored = await AsyncStorage.getItem(SAFETY_PLAN_STATUS_KEY);
    return stored ? { ...createInitialSafetyPlanStatus(), ...JSON.parse(stored) } : createInitialSafetyPlanStatus();
  } catch (error) {
    console.error('Error leyendo plan de seguridad:', error);
    return createInitialSafetyPlanStatus();
  }
};

export const saveSafetyPlanStatus = async (status: SafetyPlanStatus) => {
  await AsyncStorage.setItem(SAFETY_PLAN_STATUS_KEY, JSON.stringify(status));
};

export const saveCompletedExercise = async (exerciseId: string) => {
  try {
    const existing = await AsyncStorage.getItem(COMPLETED_EXERCISES_KEY);
    const parsed = parseStoredArray<string>(existing);
    if (!parsed.includes(exerciseId)) {
      parsed.push(exerciseId);
      await AsyncStorage.setItem(COMPLETED_EXERCISES_KEY, JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Error guardando ejercicio:', error);
    throw error;
  }
};

export const getCompletedExercises = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(COMPLETED_EXERCISES_KEY);
    return parseStoredArray<string>(stored);
  } catch (error) {
    console.error('Error leyendo ejercicios completados:', error);
    return [];
  }
};

export const saveSurveyAssessment = async (assessment: SurveyAssessmentResult) => {
  try {
    const existing = await AsyncStorage.getItem(SURVEY_ASSESSMENTS_KEY);
    const parsed = parseStoredArray<StoredSurveyAssessment>(existing);
    const next = [{ ...assessment, createdAt: new Date().toISOString() }, ...parsed].slice(0, 50);

    await AsyncStorage.setItem(SURVEY_ASSESSMENTS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Error guardando evaluación:', error);
    throw error;
  }
};

export const getSurveyAssessments = async (): Promise<StoredSurveyAssessment[]> => {
  try {
    const stored = await AsyncStorage.getItem(SURVEY_ASSESSMENTS_KEY);
    return parseStoredArray<StoredSurveyAssessment>(stored);
  } catch (error) {
    console.error('Error leyendo evaluaciones:', error);
    return [];
  }
};

export const saveExerciseFollowUp = async (followUp: ExerciseFollowUp) => {
  try {
    const existing = await AsyncStorage.getItem(EXERCISE_FOLLOW_UPS_KEY);
    const parsed = parseStoredArray<ExerciseFollowUp>(existing);
    const next = [followUp, ...parsed].slice(0, 100);

    await AsyncStorage.setItem(EXERCISE_FOLLOW_UPS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Error guardando seguimiento:', error);
    throw error;
  }
};

export const getExerciseFollowUps = async (): Promise<ExerciseFollowUp[]> => {
  try {
    const stored = await AsyncStorage.getItem(EXERCISE_FOLLOW_UPS_KEY);
    return parseStoredArray<ExerciseFollowUp>(stored);
  } catch (error) {
    console.error('Error leyendo seguimiento:', error);
    return [];
  }
};

export const getStoredWellnessData = async (): Promise<WellnessData> => {
  const [emotionHistory, completedExercises, surveyAssessments, exerciseFollowUps] = await Promise.all([
    AsyncStorage.getItem(EMOTION_HISTORY_KEY),
    getCompletedExercises(),
    getSurveyAssessments(),
    getExerciseFollowUps()
  ]);

  return {
    emotionHistory: parseStoredArray<WellnessEmotionLog>(emotionHistory),
    completedExercises,
    surveyAssessments,
    exerciseFollowUps
  };
};

export const clearWellnessHistory = async () => {
  await AsyncStorage.multiRemove([
    EMOTION_HISTORY_KEY,
    COMPLETED_EXERCISES_KEY,
    SURVEY_ASSESSMENTS_KEY,
    EXERCISE_FOLLOW_UPS_KEY,
    SAFETY_PLAN_STATUS_KEY
  ]);
};
