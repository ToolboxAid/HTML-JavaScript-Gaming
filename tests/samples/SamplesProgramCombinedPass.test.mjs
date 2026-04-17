/*
Toolbox Aid
David Quesenberry
04/14/2026
SamplesProgramCombinedPass.test.mjs
*/
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SAMPLES_ROOT = path.join(REPO_ROOT, "samples");
const METADATA_ROOT = path.join(SAMPLES_ROOT, "metadata");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getExpectedPhases() {
  const discovered = listPhaseDirectories()
    .map((phaseDir) => Number.parseInt(phaseDir.slice("phase-".length), 10))
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => a - b);
  const maxPhase = discovered.length > 0 ? discovered[discovered.length - 1] : 0;
  const phases = [];
  for (let i = 1; i <= maxPhase; i += 1) {
    phases.push(String(i).padStart(2, "0"));
  }
  return phases;
}

function listPhaseDirectories() {
  return fs.readdirSync(SAMPLES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^phase-\d{2}$/.test(name))
    .sort();
}

function assertPhaseGrouping() {
  const expected = getExpectedPhases().map((phase) => `phase-${phase}`);
  const actual = listPhaseDirectories();
  assert.deepEqual(actual, expected);

  for (const phaseDirName of actual) {
    const phase = phaseDirName.slice("phase-".length);
    const phaseDirPath = path.join(SAMPLES_ROOT, phaseDirName);
    const sampleDirs = fs.readdirSync(phaseDirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => /^\d{4}$/.test(name));

    for (const sampleId of sampleDirs) {
      assert.equal(sampleId.slice(0, 2), phase, `Sample ${sampleId} must remain in ${phaseDirName}`);
    }
  }
}

function assertSamplesSharedBoundary() {
  const canonicalSharedFiles = [
    "README.md",
    "debugConfigUtils.js",
    "lateSampleBootstrap.js",
    "networkDebugUtils.js",
    "numberUtils.js",
    "platformerHelpers.js",
    "sampleBaseLayout.css",
    "sampleDetailPageEnhancement.js",
    "snapshotCloneUtils.js",
    "worldGameStateSystem.js",
    "worldSystems.js",
  ];

  for (const fileName of canonicalSharedFiles) {
    const fullPath = path.join(SAMPLES_ROOT, "shared", fileName);
    assert.equal(fs.existsSync(fullPath), true, `Missing canonical shared sample file: ${fileName}`);
  }

  const compatibilityShimsDir = path.join(SAMPLES_ROOT, "_shared");
  if (fs.existsSync(compatibilityShimsDir)) {
    const compatibilityShims = [
      "debugConfigUtils.js",
      "lateSampleBootstrap.js",
      "networkDebugUtils.js",
      "numberUtils.js",
      "platformerHelpers.js",
      "sampleDetailPageEnhancement.js",
      "snapshotCloneUtils.js",
    ];
    for (const fileName of compatibilityShims) {
      const shimPath = path.join(compatibilityShimsDir, fileName);
      const content = fs.readFileSync(shimPath, "utf8");
      assert.match(content, /\.\.\/shared\//, `${fileName} must proxy to samples/shared`);
    }

    const cssShimPath = path.join(compatibilityShimsDir, "sampleBaseLayout.css");
    const cssShim = fs.readFileSync(cssShimPath, "utf8");
    assert.match(cssShim, /\/samples\/shared\/sampleBaseLayout\.css/);
  }

  let sharedReferenceCount = 0;
  function walk(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!/\.(js|mjs|html|css)$/i.test(entry.name)) {
        continue;
      }
      const text = fs.readFileSync(fullPath, "utf8");
      if (text.includes("/samples/shared/") || text.includes("../shared/")) {
        sharedReferenceCount += 1;
      }
    }
  }
  walk(SAMPLES_ROOT);
  assert.equal(sharedReferenceCount > 0, true, "Expected samples/shared boundary usage references.");
}

function assertSampleEngineDependencyBoundary() {
  const report = readJson(path.join(METADATA_ROOT, "samples.shared.boundaries.report.json"));
  assert.equal(report?.summary?.engineBoundaryViolations, 0);
  assert.match(String(report?.engineBoundary?.rule || ""), /\/src\/engine\/\*\/index\.js/);
}

function assertCurriculumProgression() {
  const curriculum = readJson(path.join(METADATA_ROOT, "samples.curriculum.validation.json"));
  const indexMetadata = readJson(path.join(METADATA_ROOT, "samples.index.metadata.json"));
  const expectedPhases = getExpectedPhases();
  const curriculumPhaseOrder = curriculum?.progression?.phaseOrder || [];

  for (const phase of curriculumPhaseOrder) {
    assert.equal(expectedPhases.includes(String(phase)), true, `Unexpected curriculum phase: ${phase}`);
  }
  assert.deepEqual(
    curriculumPhaseOrder.map((phase) => String(phase)),
    [...curriculumPhaseOrder].map((phase) => String(phase)).sort()
  );
  assert.equal(curriculum?.progression?.hasDuplicateSampleIds, false);
  assert.equal(
    Number(curriculum?.progression?.totalSamples) || 0,
    Array.isArray(indexMetadata?.samples) ? indexMetadata.samples.length : -1
  );

  const sampleRows = Array.isArray(indexMetadata?.samples) ? indexMetadata.samples : [];
  const sorted = [...sampleRows].sort((a, b) => {
    const phaseDiff = String(a.phase).localeCompare(String(b.phase));
    if (phaseDiff !== 0) return phaseDiff;
    return String(a.id).localeCompare(String(b.id));
  });
  assert.deepEqual(sampleRows.map((row) => row.id), sorted.map((row) => row.id));
}

export function run() {
  assertPhaseGrouping();
  assertSamplesSharedBoundary();
  assertSampleEngineDependencyBoundary();
  assertCurriculumProgression();
}
