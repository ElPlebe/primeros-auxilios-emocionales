import type {
  AssessmentRecord,
  DeletionRequestRecord,
  EmotionLogRecord,
  EventRecord,
  FollowUpRecord,
  SafetyPlanRecord,
  TrustedContactRecord,
  WellnessDataStore
} from './memoryStore.js';

type PrismaClientLike = any;

export class PrismaWellnessDataStore implements WellnessDataStore {
  kind = 'prisma' as const;
  private clientPromise: Promise<PrismaClientLike> | null = null;

  private async client() {
    if (!this.clientPromise) {
      this.clientPromise = import('@prisma/client').then((clientModule) => {
        const { PrismaClient } = clientModule as unknown as { PrismaClient: new () => PrismaClientLike };
        return new PrismaClient();
      });
    }
    return this.clientPromise;
  }

  private async ensureUser(userId: string) {
    const prisma = await this.client();
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: `${userId}@user.local`
      },
      update: {}
    });
  }

  async listAssessments(userId: string): Promise<AssessmentRecord[]> {
    const prisma = await this.client();
    return prisma.surveyAssessment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async saveAssessment(record: AssessmentRecord): Promise<AssessmentRecord> {
    await this.ensureUser(record.userId);
    const prisma = await this.client();
    return prisma.surveyAssessment.upsert({
      where: { userId_clientId: { userId: record.userId, clientId: record.clientId } },
      create: record,
      update: record
    });
  }

  async listFollowUps(userId: string): Promise<FollowUpRecord[]> {
    const prisma = await this.client();
    return prisma.exerciseFollowUp.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async saveFollowUp(record: FollowUpRecord): Promise<FollowUpRecord> {
    await this.ensureUser(record.userId);
    const prisma = await this.client();
    return prisma.exerciseFollowUp.upsert({
      where: { userId_clientId: { userId: record.userId, clientId: record.clientId } },
      create: record,
      update: record
    });
  }

  async listEmotionLogs(userId: string): Promise<EmotionLogRecord[]> {
    const prisma = await this.client();
    return prisma.emotionLog.findMany({ where: { userId }, orderBy: { logDate: 'desc' } });
  }

  async saveEmotionLog(record: EmotionLogRecord): Promise<EmotionLogRecord> {
    await this.ensureUser(record.userId);
    const prisma = await this.client();
    return prisma.emotionLog.upsert({
      where: { userId_clientId: { userId: record.userId, clientId: record.clientId } },
      create: record,
      update: record
    });
  }

  async getSafetyPlan(userId: string): Promise<SafetyPlanRecord | null> {
    const prisma = await this.client();
    return prisma.safetyPlanStatus.findUnique({ where: { userId } });
  }

  async saveSafetyPlan(record: SafetyPlanRecord): Promise<SafetyPlanRecord> {
    await this.ensureUser(record.userId);
    const prisma = await this.client();
    return prisma.safetyPlanStatus.upsert({
      where: { userId: record.userId },
      create: record,
      update: record
    });
  }

  async getTrustedContact(userId: string): Promise<TrustedContactRecord | null> {
    const prisma = await this.client();
    return prisma.trustedContact.findUnique({ where: { userId } });
  }

  async saveTrustedContact(record: TrustedContactRecord): Promise<TrustedContactRecord> {
    await this.ensureUser(record.userId);
    const prisma = await this.client();
    return prisma.trustedContact.upsert({
      where: { userId: record.userId },
      create: record,
      update: record
    });
  }

  async listExportEvents(userId: string): Promise<EventRecord[]> {
    const prisma = await this.client();
    return prisma.dataExportEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async saveExportEvent(record: EventRecord): Promise<EventRecord> {
    await this.ensureUser(record.userId);
    const prisma = await this.client();
    return prisma.dataExportEvent.create({ data: record });
  }

  async listDeletionRequests(userId: string): Promise<DeletionRequestRecord[]> {
    const prisma = await this.client();
    return prisma.dataDeletionRequest.findMany({ where: { userId }, orderBy: { requestedAt: 'desc' } });
  }

  async saveDeletionRequest(record: DeletionRequestRecord): Promise<DeletionRequestRecord> {
    await this.ensureUser(record.userId);
    const prisma = await this.client();
    return prisma.dataDeletionRequest.create({ data: record });
  }

  async recordConsent(userId: string, scope: string, version: string) {
    await this.ensureUser(userId);
    const prisma = await this.client();
    const consentVersion = await prisma.consentVersion.upsert({
      where: { version },
      create: {
        version,
        bodyHash: version,
        publishedAt: new Date()
      },
      update: {}
    });
    await prisma.userConsent.upsert({
      where: {
        userId_consentVersionId_scope: {
          userId,
          consentVersionId: consentVersion.id,
          scope
        }
      },
      create: {
        userId,
        consentVersionId: consentVersion.id,
        scope
      },
      update: {}
    });
  }

  async hasConsent(userId: string, scope: string) {
    const prisma = await this.client();
    const count = await prisma.userConsent.count({ where: { userId, scope } });
    return count > 0;
  }
}
