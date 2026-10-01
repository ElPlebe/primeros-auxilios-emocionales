import type { DistressLevel, ExerciseFollowUp, ExerciseId, SurveyAssessmentResult } from './assessment';

export interface StoredSurveyAssessment extends SurveyAssessmentResult {
  createdAt: string;
}

export interface WellnessEmotionLog {
  date: string;
  emotion: string;
}

export interface WellnessData {
  emotionHistory: WellnessEmotionLog[];
  completedExercises: string[];
  surveyAssessments: StoredSurveyAssessment[];
  exerciseFollowUps: ExerciseFollowUp[];
}

export interface WellnessSummary {
  totalEmotionLogs: number;
  totalCompletedExercises: number;
  totalAssessments: number;
  totalFollowUps: number;
  averageDistressBefore: number | null;
  averageDistressAfter: number | null;
  averageDelta: number | null;
  averageHelpfulRating: number | null;
  mostUsedExerciseId: ExerciseId | null;
  mostRecentLevel: DistressLevel | null;
  lastEmotion: string | null;
  lastAssessmentAt: string | null;
  lastFollowUpAt: string | null;
}

const average = (values: number[]) => {
  if (values.length === 0) return null;

  const result = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Number(result.toFixed(2));
};

const getMostUsedExerciseId = (followUps: ExerciseFollowUp[], completedExercises: string[]) => {
  const counts: Partial<Record<ExerciseId, number>> = {};

  followUps.forEach((item) => {
    counts[item.exerciseId] = (counts[item.exerciseId] ?? 0) + 1;
  });

  completedExercises.forEach((id) => {
    const exerciseId = id as ExerciseId;
    counts[exerciseId] = (counts[exerciseId] ?? 0) + 1;
  });

  const sorted = Object.entries(counts).sort(([, countA], [, countB]) => countB - countA);
  return (sorted[0]?.[0] as ExerciseId | undefined) ?? null;
};

export function buildWellnessSummary(data: WellnessData): WellnessSummary {
  const sortedAssessments = [...data.surveyAssessments].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
  const sortedFollowUps = [...data.exerciseFollowUps].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
  const sortedEmotions = [...data.emotionHistory].sort((a, b) => (a.date < b.date ? 1 : -1));
  const ratings = data.exerciseFollowUps
    .map((item) => item.helpfulRating)
    .filter((rating): rating is NonNullable<ExerciseFollowUp['helpfulRating']> => rating !== undefined);

  return {
    totalEmotionLogs: data.emotionHistory.length,
    totalCompletedExercises: data.completedExercises.length,
    totalAssessments: data.surveyAssessments.length,
    totalFollowUps: data.exerciseFollowUps.length,
    averageDistressBefore: average(data.exerciseFollowUps.map((item) => item.distressBefore)),
    averageDistressAfter: average(data.exerciseFollowUps.map((item) => item.distressAfter)),
    averageDelta: average(data.exerciseFollowUps.map((item) => item.delta)),
    averageHelpfulRating: average(ratings),
    mostUsedExerciseId: getMostUsedExerciseId(data.exerciseFollowUps, data.completedExercises),
    mostRecentLevel: sortedAssessments[0]?.level ?? null,
    lastEmotion: sortedEmotions[0]?.emotion ?? null,
    lastAssessmentAt: sortedAssessments[0]?.createdAt ?? null,
    lastFollowUpAt: sortedFollowUps[0]?.createdAt ?? null
  };
}

export function buildWellnessDataExport(data: WellnessData, exportedAt = new Date().toISOString()) {
  return JSON.stringify(
    {
      schemaVersion: 1,
      exportedAt,
      summary: buildWellnessSummary(data),
      data
    },
    null,
    2
  );
}
