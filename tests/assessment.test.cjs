/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.assessment-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

rmSync(outDir, { recursive: true, force: true });
execFileSync(
  process.execPath,
  [
    tscBin,
    '--target',
    'es2020',
    '--module',
    'commonjs',
    '--moduleResolution',
    'node',
    '--esModuleInterop',
    '--skipLibCheck',
    '--outDir',
    outDir,
    'utils/assessment.ts',
    'utils/psychoeducation.ts',
    'utils/emotionScale.ts',
    'utils/wellnessReport.ts',
    'utils/safetyPlan.ts',
    'constants/design.ts'
  ],
  { cwd: rootDir, stdio: 'inherit' }
);

const assessment = require(path.join(outDir, 'utils', 'assessment.js'));
const psychoeducation = require(path.join(outDir, 'utils', 'psychoeducation.js'));
const emotionScale = require(path.join(outDir, 'utils', 'emotionScale.js'));
const wellnessReport = require(path.join(outDir, 'utils', 'wellnessReport.js'));
const safetyPlan = require(path.join(outDir, 'utils', 'safetyPlan.js'));
const design = require(path.join(outDir, 'constants', 'design.js'));

test('classifies PHQ-4 totals using minimum, mild, moderate, and severe cutoffs', () => {
  assert.equal(assessment.getPhq4Level(0), 'minimo');
  assert.equal(assessment.getPhq4Level(2), 'minimo');
  assert.equal(assessment.getPhq4Level(3), 'leve');
  assert.equal(assessment.getPhq4Level(6), 'moderado');
  assert.equal(assessment.getPhq4Level(9), 'severo');
  assert.equal(assessment.getPhq4Level(12), 'severo');
});

test('routes to emergency when the safety answer is not safe regardless of PHQ-4 score', () => {
  const result = assessment.assessSurvey({
    safetyAnswer: 'unsafe',
    distressBefore: 1,
    phq4Answers: [0, 0, 0, 0],
    primaryNeed: 'calma'
  });

  assert.equal(result.emergency, true);
  assert.deepEqual(result.recommendedExerciseIds, ['ayuda', 'grounding', 'respiracion']);
});

test('prioritizes the user primary need when recommending exercises', () => {
  const result = assessment.assessSurvey({
    safetyAnswer: 'safe',
    distressBefore: 6,
    phq4Answers: [1, 1, 1, 0],
    primaryNeed: 'conexion'
  });

  assert.equal(result.level, 'leve');
  assert.equal(result.recommendedExerciseIds[0], 'ayuda');
  assert.equal(new Set(result.recommendedExerciseIds).size, result.recommendedExerciseIds.length);
});

test('builds follow-up records with immediate distress change', () => {
  const followUp = assessment.buildExerciseFollowUp({
    exerciseId: 'respiracion',
    distressBefore: 8,
    distressAfter: 5,
    assessmentLevel: 'severo'
  });

  assert.equal(followUp.delta, -3);
  assert.equal(followUp.exerciseId, 'respiracion');
  assert.equal(followUp.assessmentLevel, 'severo');
  assert.match(followUp.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('stores post-exercise helpfulness feedback in follow-up records', () => {
  const followUp = assessment.buildExerciseFollowUp({
    exerciseId: 'grounding',
    distressBefore: 7,
    distressAfter: 4,
    helpfulRating: 5,
    helpfulComment: 'Me ayudó a volver al presente',
    assessmentLevel: 'moderado'
  });

  assert.equal(followUp.helpfulRating, 5);
  assert.equal(followUp.helpfulComment, 'Me ayudó a volver al presente');
  assert.throws(
    () =>
      assessment.buildExerciseFollowUp({
        exerciseId: 'grounding',
        distressBefore: 7,
        distressAfter: 4,
        helpfulRating: 6
      }),
    /utilidad percibida/i
  );
});

test('does not require helpfulness rating for severe or crisis-origin exercise follow-up', () => {
  assert.equal(
    assessment.shouldRequireHelpfulRating({
      assessmentLevel: 'moderado',
      source: 'crisis',
      distressBefore: 7,
      distressAfter: 5
    }),
    false
  );
  assert.equal(
    assessment.shouldRequireHelpfulRating({
      assessmentLevel: 'severo',
      distressBefore: 7,
      distressAfter: 5
    }),
    false
  );
  assert.equal(
    assessment.shouldRequireHelpfulRating({
      assessmentLevel: 'moderado',
      distressBefore: 5,
      distressAfter: 7
    }),
    false
  );
  assert.equal(
    assessment.shouldRequireHelpfulRating({
      assessmentLevel: 'moderado',
      distressBefore: 7,
      distressAfter: 5
    }),
    true
  );
});

test('defines the required psychoeducation sections for the MVP', () => {
  const sectionIds = psychoeducation.PSYCHOEDUCATION_SECTIONS.map((section) => section.id);

  assert.deepEqual(sectionIds, [
    'scope',
    'psychological-first-aid',
    'humanistic-approach',
    'screening',
    'exercises',
    'exercise-evidence',
    'urgent-help'
  ]);
  assert.match(psychoeducation.HOME_DISCLAIMER, /no sustituye/i);
  assert.ok(
    psychoeducation.PSYCHOEDUCATION_SECTIONS.some((section) =>
      section.body.some((paragraph) => paragraph.includes('seguridad, calma, autoeficacia, conexión y esperanza'))
    )
  );
});

test('uses compact emotion labels while keeping legacy history values valid', () => {
  assert.deepEqual(
    emotionScale.EMOTION_OPTIONS.map((emotion) => emotion.label),
    ['Bien', 'Calma', 'Neutral', 'Ansiedad', 'Tristeza']
  );
  assert.equal(emotionScale.getEmotionValue('Calma'), 4);
  assert.equal(emotionScale.getEmotionValue('Tranquilo'), 4);
  assert.equal(emotionScale.getEmotionValue('Ansioso'), 2);
  assert.equal(emotionScale.getEmotionDisplayLabel('Ansioso'), 'Ansiedad');
});

test('builds a thesis-friendly wellness summary and data export', () => {
  const wellnessData = {
    emotionHistory: [
      { date: '2026-09-02', emotion: 'Bien' },
      { date: '2026-09-01', emotion: 'Ansiedad' }
    ],
    completedExercises: ['respiracion'],
    surveyAssessments: [
      {
        safetyAnswer: 'safe',
        distressBefore: 8,
        phq4Score: 6,
        level: 'moderado',
        primaryNeed: 'calma',
        emergency: false,
        recommendedExerciseIds: ['respiracion', 'grounding'],
        createdAt: '2026-09-02T09:00:00.000Z'
      }
    ],
    exerciseFollowUps: [
      {
        exerciseId: 'respiracion',
        distressBefore: 8,
        distressAfter: 5,
        delta: -3,
        helpfulRating: 5,
        createdAt: '2026-09-02T09:10:00.000Z'
      },
      {
        exerciseId: 'respiracion',
        distressBefore: 6,
        distressAfter: 4,
        delta: -2,
        helpfulRating: 4,
        createdAt: '2026-09-02T18:15:00.000Z'
      }
    ]
  };

  const summary = wellnessReport.buildWellnessSummary(wellnessData);

  assert.equal(summary.totalEmotionLogs, 2);
  assert.equal(summary.totalAssessments, 1);
  assert.equal(summary.totalFollowUps, 2);
  assert.equal(summary.averageDistressBefore, 7);
  assert.equal(summary.averageDistressAfter, 4.5);
  assert.equal(summary.averageDelta, -2.5);
  assert.equal(summary.averageHelpfulRating, 4.5);
  assert.equal(summary.mostUsedExerciseId, 'respiracion');

  const exported = JSON.parse(
    wellnessReport.buildWellnessDataExport(wellnessData, '2026-09-02T00:00:00.000Z')
  );

  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.exportedAt, '2026-09-02T00:00:00.000Z');
  assert.equal(exported.summary.totalFollowUps, 2);
});

test('defines a brief crisis-oriented safety plan with measurable progress', () => {
  assert.deepEqual(
    safetyPlan.SAFETY_PLAN_STEPS.map((step) => step.id),
    ['warningSigns', 'internalCoping', 'safePeoplePlaces', 'trustedContact', 'professionalHelp', 'saferEnvironment']
  );

  const initial = safetyPlan.createInitialSafetyPlanStatus();
  assert.deepEqual(safetyPlan.getSafetyPlanProgress(initial), {
    completed: 0,
    total: 6,
    isComplete: false
  });

  const partial = safetyPlan.updateSafetyPlanStep(initial, 'warningSigns', true);
  const ready = safetyPlan.updateSafetyPlanStep(partial, 'professionalHelp', true);

  assert.equal(safetyPlan.getSafetyPlanProgress(ready).completed, 2);
  assert.throws(
    () => safetyPlan.updateSafetyPlanStep(initial, 'unknownStep', true),
    /paso de seguridad/i
  );
});

test('keeps design tokens accessible enough for primary interactions', () => {
  assert.ok(design.ACCESSIBILITY.minTouchTarget >= 48);
  assert.ok(design.TYPOGRAPHY.body.fontSize >= 16);
  assert.ok(design.TYPOGRAPHY.body.lineHeight > design.TYPOGRAPHY.body.fontSize);
  assert.deepEqual(Object.keys(design.BUTTON_VARIANTS), ['primary', 'secondary', 'danger', 'ghost']);
  assert.notEqual(
    design.BUTTON_VARIANTS.primary.container.backgroundColor,
    design.BUTTON_VARIANTS.danger.container.backgroundColor
  );
});
