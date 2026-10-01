import type { DistressLevel, SafetyAnswer } from '../../utils/assessment';

export type CrisisReason = 'safety' | 'high_distress' | 'severe_level' | 'worsening_follow_up';

export interface CrisisRoutingInput {
  safetyAnswer?: SafetyAnswer | null;
  distressBefore?: number | null;
  distressAfter?: number | null;
  level?: DistressLevel | null;
}

export function getCrisisReasons(input: CrisisRoutingInput): CrisisReason[] {
  const reasons: CrisisReason[] = [];

  if (input.safetyAnswer === 'unsafe' || input.safetyAnswer === 'unsure') {
    reasons.push('safety');
  }

  if (typeof input.distressBefore === 'number' && input.distressBefore >= 9) {
    reasons.push('high_distress');
  }

  if (input.level === 'severo') {
    reasons.push('severe_level');
  }

  if (
    typeof input.distressBefore === 'number' &&
    typeof input.distressAfter === 'number' &&
    input.distressAfter > input.distressBefore
  ) {
    reasons.push('worsening_follow_up');
  }

  return reasons;
}

export function shouldRouteToCrisis(input: CrisisRoutingInput) {
  return getCrisisReasons(input).length > 0;
}

export function getCrisisRouteForSurvey(input: CrisisRoutingInput) {
  return shouldRouteToCrisis(input) ? '/crisis' : null;
}

export function getCrisisRouteForResult(input: CrisisRoutingInput) {
  return shouldRouteToCrisis(input) ? '/crisis' : null;
}

export function getCrisisRouteForExerciseFollowUp(input: CrisisRoutingInput) {
  return shouldRouteToCrisis(input) ? '/crisis' : null;
}
