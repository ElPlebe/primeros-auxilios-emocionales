/* global __dirname */
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const crisisScreenPath = path.join(rootDir, 'app', 'crisis', 'index.tsx');
const crisisCopyPath = path.join(rootDir, 'features', 'crisis', 'crisisCopy.ts');
const crisisResourcesPath = path.join(rootDir, 'features', 'crisis', 'crisisResources.ts');

test('crisis route exists and presents immediate Mexico support actions', () => {
  assert.equal(existsSync(crisisScreenPath), true);

  const screen = readFileSync(crisisScreenPath, 'utf8');
  const copy = readFileSync(crisisCopyPath, 'utf8');
  const resources = readFileSync(crisisResourcesPath, 'utf8');
  const combined = `${screen}\n${copy}\n${resources}`;

  for (const text of [
    'Llamar al 911',
    'Llamar a Linea de la Vida',
    'Contacto de confianza',
    'Ubica si puedes mantenerte a salvo',
    'Guíame ahora con grounding',
    'tel:911',
    'tel:+528009112000'
  ]) {
    assert.match(combined, new RegExp(text.replace(/[+]/g, '\\$&')));
  }
});
