/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase18OverlayCssUiNormalizationSlice.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const overlaySampleIds = ['1708', '1709', '1710', '1711', '1712', '1713'];

function readOverlaySampleIndex(sampleId) {
  return fs.readFileSync(
    path.join(repoRoot, 'samples', 'phase-17', sampleId, 'index.html'),
    'utf8'
  );
}

function assertSharedOverlayCssClasses(sampleId) {
  const text = readOverlaySampleIndex(sampleId);
  assert.equal(
    text.includes('../shared/overlaySampleLayout.css'),
    true,
    `Sample ${sampleId} should include shared overlay sample stylesheet.`
  );
  assert.equal(
    text.includes('class="overlay-sample-main"'),
    true,
    `Sample ${sampleId} should use normalized main container class.`
  );
  assert.equal(
    text.includes('class="overlay-sample-summary"'),
    true,
    `Sample ${sampleId} should use normalized summary class.`
  );
  assert.equal(
    text.includes('class="overlay-sample-canvas"'),
    true,
    `Sample ${sampleId} should use normalized canvas class.`
  );
  assert.equal(
    text.includes('class="overlay-sample-engine-section"'),
    true,
    `Sample ${sampleId} should use normalized engine section class.`
  );
  assert.equal(
    text.includes('class="overlay-sample-engine-list"'),
    true,
    `Sample ${sampleId} should use normalized engine list class.`
  );
}

function assertSharedOverlayCssFile() {
  const cssPath = path.join(repoRoot, 'samples', 'phase-17', 'shared', 'overlaySampleLayout.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  const requiredTokens = [
    '.overlay-sample-main',
    '.overlay-sample-title',
    '.overlay-sample-summary',
    '.overlay-sample-canvas',
    '.overlay-sample-engine-section',
    '.overlay-sample-engine-title',
    '.overlay-sample-engine-list',
  ];
  for (const token of requiredTokens) {
    assert.equal(
      css.includes(token),
      true,
      `Shared overlay sample stylesheet should define ${token}.`
    );
  }
}

export function run() {
  assertSharedOverlayCssFile();
  for (const sampleId of overlaySampleIds) {
    assertSharedOverlayCssClasses(sampleId);
  }
}
