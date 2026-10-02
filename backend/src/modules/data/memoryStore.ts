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

export class MemoryWellnessDataStore implements WellnessDataStore {
  kind = 'memory' as const;

  listAssessments(userId: string) {
    return Promise.resolve(listForUser(memoryStore.assessments, userId));
  }

  saveAssessment(record: AssessmentRecord) {
    const records = listForUser(memoryStore.assessments, record.userId);
    const saved = upsertByClientId(records, record);
    memoryStore.assessments.set(record.userId, records);
    return Promise.resolve(saved);
  }

  listFollowUps(userId: string) {
    return Promise.resolve(listForUser(memoryStore.followUps, userId));
  }

  saveFollowUp(record: FollowUpRecord) {
    const records = listForUser(memoryStore.followUps, record.userId);
    const saved = upsertByClientId(records, record);
    memoryStore.followUps.set(record.userId, records);
    return Promise.resolve(saved);
  }

  listEmotionLogs(userId: string) {
    return Promise.resolve(listForUser(memoryStore.emotionLogs, userId));
  }

  saveEmotionLog(record: EmotionLogRecord) {
    const records = listForUser(memoryStore.emotionLogs, record.userId);
    const saved = upsertByClientId(records, record);
    memoryStore.emotionLogs.set(record.userId, records);
    return Promise.resolve(saved);
  }

  getSafetyPlan(userId: string) {
    return Promise.resolve(memoryStore.safetyPlans.get(userId) ?? null);
  }

  saveSafetyPlan(record: SafetyPlanRecord) {
    memoryStore.safetyPlans.set(record.userId, record);
    return Promise.resolve(record);
  }

  getTrustedContact(userId: string) {
    return Promise.resolve(memoryStore.trustedContacts.get(userId) ?? null);
  }

  saveTrustedContact(record: TrustedContactRecord) {
    memoryStore.trustedContacts.set(record.userId, record);
    return Promise.resolve(record);
  }

  listExportEvents(userId: string) {
    return Promise.resolve(listForUser(memoryStore.exportEvents, userId));
  }

  saveExportEvent(record: EventRecord) {
    const records = listForUser(memoryStore.exportEvents, record.userId);
    records.unshift(record);
    memoryStore.exportEvents.set(record.userId, records);
    return Promise.resolve(record);
  }

  listDeletionRequests(userId: string) {
    return Promise.resolve(listForUser(memoryStore.deletionRequests, userId));
  }

  saveDeletionRequest(record: DeletionRequestRecord) {
    const records = listForUser(memoryStore.deletionRequests, record.userId);
    records.unshift(record);
    memoryStore.deletionRequests.set(record.userId, records);
    return Promise.resolve(record);
  }

  recordConsent(userId: string, scope: string) {
    const scopes = consentScopes.get(userId) ?? new Set<string>();
    scopes.add(scope);
    consentScopes.set(userId, scopes);
    return Promise.resolve();
  }

  hasConsent(userId: string, scope: string) {
    return Promise.resolve(consentScopes.get(userId)?.has(scope) ?? false);
  }
}

const consentScopes = new Map<string, Set<string>>();

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

export interface WellnessDataStore {
  kind: 'memory' | 'prisma';
  listAssessments(userId: string): Promise<AssessmentRecord[]>;
  saveAssessment(record: AssessmentRecord): Promise<AssessmentRecord>;
  listFollowUps(userId: string): Promise<FollowUpRecord[]>;
  saveFollowUp(record: FollowUpRecord): Promise<FollowUpRecord>;
  listEmotionLogs(userId: string): Promise<EmotionLogRecord[]>;
  saveEmotionLog(record: EmotionLogRecord): Promise<EmotionLogRecord>;
  getSafetyPlan(userId: string): Promise<SafetyPlanRecord | null>;
  saveSafetyPlan(record: SafetyPlanRecord): Promise<SafetyPlanRecord>;
  getTrustedContact(userId: string): Promise<TrustedContactRecord | null>;
  saveTrustedContact(record: TrustedContactRecord): Promise<TrustedContactRecord>;
  listExportEvents(userId: string): Promise<EventRecord[]>;
  saveExportEvent(record: EventRecord): Promise<EventRecord>;
  listDeletionRequests(userId: string): Promise<DeletionRequestRecord[]>;
  saveDeletionRequest(record: DeletionRequestRecord): Promise<DeletionRequestRecord>;
  recordConsent(userId: string, scope: string, version: string): Promise<void>;
  hasConsent(userId: string, scope: string): Promise<boolean>;
}
