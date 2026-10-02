export interface AssessmentRecord {
  id: string;
  userId: string;
  clientId: string;
  safetyAnswer: string;
  distressBefore: number;
  phq4Score: number;
  anxietyScore: number;
  depressionScore: number;
  primaryNeed: string;
  level: string;
  emergency: boolean;
  createdAt: string;
}

export interface FollowUpRecord {
  id: string;
  userId: string;
  clientId: string;
  exerciseId: string;
  assessmentId?: string;
  distressBefore: number;
  distressAfter: number;
  delta: number;
  helpfulRating?: number;
  helpfulComment?: string;
  createdAt: string;
}

export interface EmotionLogRecord {
  id: string;
  userId: string;
  clientId: string;
  logDate: string;
  emotion: string;
  createdAt: string;
}

export interface SafetyPlanRecord {
  userId: string;
  safePlace: boolean;
  canContact: boolean;
  trustedContact: boolean;
  urgentHelp: boolean;
  updatedAt: string;
}

export interface TrustedContactRecord {
  userId: string;
  name: string;
  phoneE164: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRecord {
  id: string;
  userId: string;
  createdAt: string;
}

export interface DeletionRequestRecord {
  id: string;
  userId: string;
  status: string;
  requestedAt: string;
  completedAt: string | null;
}

export const memoryStore = {
  assessments: new Map<string, AssessmentRecord[]>(),
  followUps: new Map<string, FollowUpRecord[]>(),
  emotionLogs: new Map<string, EmotionLogRecord[]>(),
  safetyPlans: new Map<string, SafetyPlanRecord>(),
  trustedContacts: new Map<string, TrustedContactRecord>(),
  exportEvents: new Map<string, EventRecord[]>(),
  deletionRequests: new Map<string, DeletionRequestRecord[]>()
};

export function listForUser<T>(records: Map<string, T[]>, userId: string): T[] {
  return records.get(userId) ?? [];
}

export function upsertByClientId<T extends { clientId: string }>(records: T[], next: T): T {
  const existingIndex = records.findIndex((record) => record.clientId === next.clientId);
  if (existingIndex >= 0) {
    records[existingIndex] = { ...records[existingIndex], ...next };
    return records[existingIndex];
  }
  records.unshift(next);
  return next;
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
