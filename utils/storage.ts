import AsyncStorage from '@react-native-async-storage/async-storage';
import { createConsentRecord, normalizeConsentRecord } from '../features/privacy/consentContent';
import {
  createSyncQueueRecord,
  enqueueOrUpdateRecord,
  type SyncQueueRecord,
  type SyncRecordType
} from '../services/sync/syncQueue';
import type { ExerciseFollowUp, SurveyAssessmentResult } from './assessment';
import { parseJsonArray, parseJsonObject } from './localJson';
import { createInitialSafetyPlanStatus } from './safetyPlan';
import type { SafetyPlanStatus } from './safetyPlan';
import type { StoredSurveyAssessment, WellnessData, WellnessEmotionLog } from './wellnessReport';

const COMPLETED_EXERCISES_KEY = 'completedExercises';
const SURVEY_ASSESSMENTS_KEY = 'surveyAssessmentHistory';
const EXERCISE_FOLLOW_UPS_KEY = 'exerciseFollowUps';
const EMOTION_HISTORY_KEY = 'emotionHistory';
const CONSENT_ACCEPTED_KEY = 'consentAcceptedAt';
const SAFETY_PLAN_STATUS_KEY = 'safetyPlanStatus';
const SYNC_QUEUE_KEY = 'syncQueue';

export const acceptConsent = async () => {
  const consent = createConsentRecord();
  await AsyncStorage.setItem(CONSENT_ACCEPTED_KEY, JSON.stringify(consent));
  await queueSyncRecord('consent', {
    scope: 'backend_sync',
    version: consent.version
  });
};

export const getConsentAcceptedAt = async () => AsyncStorage.getItem(CONSENT_ACCEPTED_KEY);

export const getConsentRecord = async () => normalizeConsentRecord(await getConsentAcceptedAt());

export const hasAcceptedConsent = async () => {
  const consent = await getConsentRecord();
  return Boolean(consent);
};

export const getSafetyPlanStatus = async (): Promise<SafetyPlanStatus> => {
  try {
    const stored = await AsyncStorage.getItem(SAFETY_PLAN_STATUS_KEY);
    return {
      ...createInitialSafetyPlanStatus(),
      ...parseJsonObject<SafetyPlanStatus>(stored, createInitialSafetyPlanStatus())
    };
  } catch (error) {
    console.error('Error leyendo plan de seguridad:', error);
    return createInitialSafetyPlanStatus();
  }
};

export const saveSafetyPlanStatus = async (status: SafetyPlanStatus) => {
  await AsyncStorage.setItem(SAFETY_PLAN_STATUS_KEY, JSON.stringify(status));
  await queueSyncRecord('safety_plan', status);
};

export const saveCompletedExercise = async (exerciseId: string) => {
  try {
    const existing = await AsyncStorage.getItem(COMPLETED_EXERCISES_KEY);
    const parsed = parseJsonArray<string>(existing);
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
    return parseJsonArray<string>(stored);
  } catch (error) {
    console.error('Error leyendo ejercicios completados:', error);
    return [];
  }
};

export const saveSurveyAssessment = async (assessment: SurveyAssessmentResult) => {
  try {
    const existing = await AsyncStorage.getItem(SURVEY_ASSESSMENTS_KEY);
    const parsed = parseJsonArray<StoredSurveyAssessment>(existing);
    const syncRecord = createSyncQueueRecord('assessment', assessment);
    const record = { ...assessment, clientId: syncRecord.clientId, createdAt: new Date().toISOString() };
    const next = [record, ...parsed].slice(0, 50);

    await AsyncStorage.setItem(SURVEY_ASSESSMENTS_KEY, JSON.stringify(next));
    await queueSyncRecord('assessment', record, record.clientId);
  } catch (error) {
    console.error('Error guardando evaluación:', error);
    throw error;
  }
};

export const getSurveyAssessments = async (): Promise<StoredSurveyAssessment[]> => {
  try {
    const stored = await AsyncStorage.getItem(SURVEY_ASSESSMENTS_KEY);
    return parseJsonArray<StoredSurveyAssessment>(stored);
  } catch (error) {
    console.error('Error leyendo evaluaciones:', error);
    return [];
  }
};

export const saveExerciseFollowUp = async (followUp: ExerciseFollowUp) => {
  try {
    const existing = await AsyncStorage.getItem(EXERCISE_FOLLOW_UPS_KEY);
    const parsed = parseJsonArray<ExerciseFollowUp>(existing);
    const syncRecord = createSyncQueueRecord('exercise_follow_up', followUp);
    const record = { ...followUp, clientId: syncRecord.clientId };
    const next = [record, ...parsed].slice(0, 100);

    await AsyncStorage.setItem(EXERCISE_FOLLOW_UPS_KEY, JSON.stringify(next));
    await queueSyncRecord('exercise_follow_up', record, record.clientId);
  } catch (error) {
    console.error('Error guardando seguimiento:', error);
    throw error;
  }
};

export const getExerciseFollowUps = async (): Promise<ExerciseFollowUp[]> => {
  try {
    const stored = await AsyncStorage.getItem(EXERCISE_FOLLOW_UPS_KEY);
    return parseJsonArray<ExerciseFollowUp>(stored);
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
    emotionHistory: parseJsonArray<WellnessEmotionLog>(emotionHistory),
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

export const getSyncQueue = async (): Promise<SyncQueueRecord[]> => {
  const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  return parseJsonArray<SyncQueueRecord>(stored);
};

export const saveSyncQueue = async (queue: SyncQueueRecord[]) => {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

export const queueSyncRecord = async (
  recordType: SyncRecordType,
  payload: Record<string, unknown>,
  clientId?: string
) => {
  const queue = await getSyncQueue();
  const record = createSyncQueueRecord(recordType, payload, clientId);
  enqueueOrUpdateRecord(queue, record);
  await saveSyncQueue(queue);
  return record;
};
