/* global __dirname */
const assert = require('node:assert/strict');
const { existsSync, readFileSync, rmSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.exercise-catalog-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

function compileCatalog() {
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
      'utils/exerciseCatalog.ts'
    ],
    { cwd: rootDir, stdio: 'inherit' }
  );

  return {
    assessment: require(path.join(outDir, 'assessment.js')),
    catalog: require(path.join(outDir, 'exerciseCatalog.js'))
  };
}

test('clinical exercise catalog exposes complete metadata and valid local assets', () => {
  const { catalog } = compileCatalog();
  const items = catalog.EXERCISE_LIST;
  const ids = items.map((item) => item.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('visualizacion'));
  assert.ok(ids.includes('movimiento'));
  assert.ok(ids.includes('relajacion'));

  for (const item of items) {
    assert.equal(typeof item.title, 'string');
    assert.ok(item.title.length > 0);
    assert.ok(item.description.length > 0);
    assert.ok(item.goal.length > 0);
    assert.ok(item.recommendedWhen.length > 0);
    assert.ok(item.avoidWhen.length > 0);
    assert.ok(Number.isInteger(item.durationMinutes));
    assert.ok(item.durationMinutes > 0);
    assert.ok(item.steps.length >= 3);
    assert.ok(item.evidence.length > 0);
    assert.ok(existsSync(path.join(rootDir, item.imageAsset)), `${item.id} image missing`);
    if (item.audioAsset) {
      assert.ok(existsSync(path.join(rootDir, item.audioAsset)), `${item.id} audio missing`);
    }
  }
});

test('recommendations prioritize crisis safety, body regulation, and activation over generic affirmations', () => {
  const { assessment } = compileCatalog();

  assert.deepEqual(
    assessment.assessSurvey({
      safetyAnswer: 'unsafe',
      distressBefore: 1,
      phq4Answers: [0, 0, 0, 0],
      primaryNeed: 'calma'
    }).recommendedExerciseIds,
    ['ayuda', 'grounding', 'respiracion']
  );

  assert.deepEqual(
    assessment.assessSurvey({
      safetyAnswer: 'safe',
      distressBefore: 9,
      phq4Answers: [0, 0, 0, 0],
      primaryNeed: 'claridad'
    }).recommendedExerciseIds,
    ['grounding', 'respiracion', 'ayuda']
  );

  assert.deepEqual(
    assessment.assessSurvey({
      safetyAnswer: 'safe',
      distressBefore: 6,
      phq4Answers: [2, 2, 1, 1],
      primaryNeed: 'calma'
    }).recommendedExerciseIds,
    ['respiracion', 'grounding', 'relajacion']
  );

  assert.deepEqual(
    assessment.assessSurvey({
      safetyAnswer: 'safe',
      distressBefore: 6,
      phq4Answers: [3, 3, 2, 2],
      primaryNeed: 'calma'
    }).recommendedExerciseIds,
    ['ayuda', 'grounding', 'respiracion']
  );

  assert.deepEqual(
    assessment.assessSurvey({
      safetyAnswer: 'safe',
      distressBefore: 6,
      phq4Answers: [0, 0, 2, 2],
      primaryNeed: 'esperanza'
    }).recommendedExerciseIds,
    ['movimiento', 'respiracion', 'escritura']
  );
});

test('exercise screens expose category groups, immediate guidance, and audio controls', () => {
  const listScreen = readFileSync(path.join(rootDir, 'app', '(tabs)', 'exercises.tsx'), 'utf8');
  const detailScreen = readFileSync(path.join(rootDir, 'app', '(tabs)', 'exercises', '[id].tsx'), 'utf8');

  assert.match(listScreen, /Gu[ií]ame ahora/);
  assert.match(listScreen, /Necesito ayuda urgente/);
  assert.match(listScreen, /categoryLabel/);
  assert.match(listScreen, /durationMinutes/);

  assert.match(detailScreen, /Paso \{currentStepIndex \+ 1\}/);
  assert.match(detailScreen, /Pausar audio/);
  assert.match(detailScreen, /Detener audio/);
  assert.match(detailScreen, /recommendedWhen/);
  assert.match(detailScreen, /avoidWhen/);
});
