export const CONSENT_VERSION = '2026-10-02-mx-local-sync-readiness';

export const CONSENT_SCOPES = [
  'app_scope',
  'local_storage',
  'backend_sync',
  'sensitive_data',
  'emergency_limits'
] as const;

export type ConsentScope = (typeof CONSENT_SCOPES)[number];

export interface ConsentRecord {
  acceptedAt: string;
  version: string;
  scopes: readonly ConsentScope[];
}

export const CONSENT_COPY = {
  appScope: {
    title: 'Apoyo inicial, no diagnostico',
    body:
      'La app ofrece orientacion educativa y ejercicios breves para primeros auxilios emocionales. No diagnostica, no reemplaza psicoterapia y no sustituye una valoracion profesional.'
  },
  localStorage: {
    title: 'Datos locales',
    body:
      'Tu historial emocional, autoevaluaciones, seguimientos, ejercicios completados y plan breve de seguridad se guardan localmente en este dispositivo.'
  },
  backendSync: {
    title: 'Sincronizacion con cuenta',
    body:
      'La sincronizacion con backend sera opcional y solo iniciara cuando exista inicio de sesion, cuenta de usuario y consentimiento para sincronizar datos sensibles.'
  },
  sensitiveData: {
    title: 'Datos sensibles',
    body:
      'Las respuestas sobre malestar, seguridad, emociones y ejercicios pueden considerarse datos sensibles. Deben manejarse con cuidado y revisarse antes de exportarse o compartirse.'
  },
  emergencyLimits: {
    title: 'Limites en emergencia',
    body:
      'Si hay peligro inmediato o riesgo de hacerse dano, usa el modo crisis, llama al 911 o contacta Linea de la Vida. Esta app no reemplaza servicios de emergencia.'
  }
} as const;

export const CONSENT_POINTS = [
  CONSENT_COPY.appScope,
  CONSENT_COPY.localStorage,
  CONSENT_COPY.backendSync,
  CONSENT_COPY.emergencyLimits
] as const;

export function createConsentRecord(acceptedAt = new Date().toISOString()): ConsentRecord {
  return {
    acceptedAt,
    version: CONSENT_VERSION,
    scopes: CONSENT_SCOPES
  };
}

export function normalizeConsentRecord(stored: string | null): ConsentRecord | null {
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ConsentRecord>;
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      typeof parsed.acceptedAt === 'string' &&
      typeof parsed.version === 'string' &&
      Array.isArray(parsed.scopes)
    ) {
      return {
        acceptedAt: parsed.acceptedAt,
        version: parsed.version,
        scopes: parsed.scopes.filter((scope): scope is ConsentScope =>
          CONSENT_SCOPES.includes(scope as ConsentScope)
        )
      };
    }
  } catch {
    // Legacy consent was stored as a plain ISO timestamp string.
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(stored) && !Number.isNaN(Date.parse(stored))) {
    return createConsentRecord(stored);
  }

  return null;
}
