const SAFETY_ANSWERS = ['safe', 'unsafe', 'unsure'];
const SUPPORT_NEEDS = ['seguridad', 'calma', 'claridad', 'conexion', 'esperanza'];
const DISTRESS_LEVELS = ['minimo', 'leve', 'moderado', 'severo'];

type Body = Record<string, unknown>;

export function asBody(value: unknown): Body {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Body) : {};
}

export function badRequest(message: string): never {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = 400;
  throw error;
}

export function requireString(body: Body, key: string, maxLength = 160) {
  const value = body[key];
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
    badRequest(`Invalid ${key}`);
  }
  return value;
}

export function optionalString(body: Body, key: string, maxLength = 500) {
  const value = body[key];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string' || value.length > maxLength) {
    badRequest(`Invalid ${key}`);
  }
  return value;
}

export function requireBoolean(body: Body, key: string) {
  const value = body[key];
  if (typeof value !== 'boolean') {
    badRequest(`Invalid ${key}`);
  }
  return value;
}

export function requireIntegerInRange(body: Body, key: string, min: number, max: number) {
  const value = body[key];
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    badRequest(`Invalid ${key}`);
  }
  return value as number;
}

export function optionalIntegerInRange(body: Body, key: string, min: number, max: number) {
  const value = body[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    badRequest(`Invalid ${key}`);
  }
  return value as number;
}

export function requireEnum(body: Body, key: string, allowed: readonly string[]) {
  const value = requireString(body, key);
  if (!allowed.includes(value)) {
    badRequest(`Invalid ${key}`);
  }
  return value;
}

export function requireSafetyAnswer(body: Body) {
  return requireEnum(body, 'safetyAnswer', SAFETY_ANSWERS);
}

export function requireSupportNeed(body: Body) {
  return requireEnum(body, 'primaryNeed', SUPPORT_NEEDS);
}

export function requireDistressLevel(body: Body) {
  return requireEnum(body, 'level', DISTRESS_LEVELS);
}

export function requireMexicoPhoneE164(body: Body) {
  const value = requireString(body, 'phoneE164', 20);
  if (!/^\+52\d{10}$/.test(value)) {
    badRequest('Invalid phoneE164');
  }
  return value;
}
