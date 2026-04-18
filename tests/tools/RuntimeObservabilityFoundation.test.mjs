/*
Toolbox Aid
David Quesenberry
04/18/2026
RuntimeObservabilityFoundation.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..', '..');

export function run() {
  const enginePath = path.join(REPO_ROOT, 'src', 'engine', 'core', 'Engine.js');
  const shellPath = path.join(REPO_ROOT, 'tools', 'shared', 'platformShell.js');
  const runtimeHooksPath = path.join(REPO_ROOT, 'src', 'engine', 'runtime', 'RuntimeMonitoringHooks.js');

  const engineSource = fs.readFileSync(enginePath, 'utf8');
  const shellSource = fs.readFileSync(shellPath, 'utf8');
  const hooksSource = fs.readFileSync(runtimeHooksPath, 'utf8');

  assert.match(engineSource, /createRuntimeMonitoringHooks/, 'Engine should wire runtime monitoring hooks.');
  assert.match(
    engineSource,
    /emitPerformanceSample\?\.\('load'/,
    'Engine should emit load timing performance samples from runtime entry point.'
  );

  assert.match(shellSource, /createRuntimeMonitoringHooks/, 'Tools platform shell should wire runtime monitoring hooks.');
  assert.match(
    shellSource,
    /emitPerformanceSample\("load"/,
    'Tools platform shell should emit load timing performance samples.'
  );

  assert.match(
    hooksSource,
    /resolvePerformanceLogLevel/,
    'Runtime monitoring hooks should define performance log-level mapping.'
  );
  assert.match(
    hooksSource,
    /runtime\.monitoring\.performance/,
    'Runtime monitoring hooks should emit standardized performance log events.'
  );
}
