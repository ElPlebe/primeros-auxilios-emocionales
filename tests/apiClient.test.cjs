/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.api-client-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

function compileApiClient() {
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
      'services/api/client.ts'
    ],
    { cwd: rootDir, stdio: 'inherit' }
  );

  return require(path.join(outDir, 'client.js'));
}

test('deleteTrustedContact sends an authenticated DELETE and accepts 204 responses', async () => {
  const { createApiClient } = compileApiClient();
  const calls = [];
  const apiClient = createApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'access-token',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 204,
        json: async () => {
          throw new Error('204 response should not parse JSON');
        }
      };
    }
  });

  const result = await apiClient.deleteTrustedContact();

  assert.deepEqual(result, {});
  assert.equal(calls[0].url, 'https://api.example.test/me/trusted-contact');
  assert.equal(calls[0].init.method, 'DELETE');
  assert.equal(calls[0].init.headers.authorization, 'Bearer access-token');
});
