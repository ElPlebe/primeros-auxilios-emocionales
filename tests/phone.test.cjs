/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.phone-test-dist');
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
    'utils/phone.ts'
  ],
  { cwd: rootDir, stdio: 'inherit' }
);

const phone = require(path.join(outDir, 'phone.js'));

test('normalizes Mexican 10-digit phone numbers for tel and WhatsApp links', () => {
  assert.deepEqual(phone.normalizeMexicoPhoneForLinks('5512345678'), {
    dialPhone: '+525512345678',
    whatsappPhone: '525512345678'
  });
});

test('keeps already internationalized Mexico phone numbers normalized', () => {
  assert.deepEqual(phone.normalizeMexicoPhoneForLinks('+52 55 1234 5678'), {
    dialPhone: '+525512345678',
    whatsappPhone: '525512345678'
  });
});

test('rejects unsupported phone values', () => {
  assert.equal(phone.normalizeMexicoPhoneForLinks('123'), null);
  assert.equal(phone.normalizeMexicoPhoneForLinks('abc'), null);
});
