/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.crisis-routing-test-dist');
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
    'features/crisis/crisisRouting.ts',
    'features/crisis/crisisResources.ts',
    'features/crisis/crisisCopy.ts',
    'utils/assessment.ts'
  ],
  { cwd: rootDir, stdio: 'inherit' }
);

const routing = require(path.join(outDir, 'features', 'crisis', 'crisisRouting.js'));
const resources = require(path.join(outDir, 'features', 'crisis', 'crisisResources.js'));
const copy = require(path.join(outDir, 'features', 'crisis', 'crisisCopy.js'));

test('routes immediate safety, severe distress, and worsening follow-up to crisis support', () => {
  assert.equal(routing.shouldRouteToCrisis({ safetyAnswer: 'unsafe' }), true);
  assert.equal(routing.shouldRouteToCrisis({ safetyAnswer: 'unsure' }), true);
  assert.equal(routing.shouldRouteToCrisis({ safetyAnswer: 'safe', distressBefore: 9 }), true);
  assert.equal(routing.shouldRouteToCrisis({ safetyAnswer: 'safe', level: 'severo' }), true);
  assert.equal(routing.shouldRouteToCrisis({ safetyAnswer: 'safe', distressBefore: 6, distressAfter: 8 }), true);
  assert.equal(routing.shouldRouteToCrisis({ safetyAnswer: 'safe', distressBefore: 4, level: 'leve' }), false);
});

test('returns crisis reasons in stable priority order', () => {
  assert.deepEqual(
    routing.getCrisisReasons({
      safetyAnswer: 'unsure',
      distressBefore: 10,
      distressAfter: 10,
      level: 'severo'
    }),
    ['safety', 'high_distress', 'severe_level']
  );
});

test('defines Mexico crisis resources and advisor-reviewable copy', () => {
  assert.deepEqual(resources.MEXICO_CRISIS_RESOURCES.emergency, {
    label: 'Emergencias 911',
    phone: '911',
    phoneUrl: 'tel:911'
  });
  assert.equal(resources.MEXICO_CRISIS_RESOURCES.lifeLine.displayPhone, '800 911 2000');
  assert.equal(resources.MEXICO_CRISIS_RESOURCES.lifeLine.phoneUrl, 'tel:+528009112000');
  assert.match(copy.CRISIS_COPY.actions.callEmergency, /911/);
  assert.match(copy.CRISIS_COPY.actions.callLifeLine, /Linea de la Vida/);
});
