import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SAMPLES_METADATA_PATH = path.join(REPO_ROOT, "samples", "metadata", "samples.index.metadata.json");

const MIGRATED_SAMPLES = Object.freeze([
  { id: "1212", toolId: "vector-map-editor", toolPath: "/tools/Vector%20Map%20Editor/index.html" },
  { id: "1213", toolId: "vector-map-editor", toolPath: "/tools/Vector%20Map%20Editor/index.html" },
  { id: "1214", toolId: "vector-map-editor", toolPath: "/tools/Vector%20Map%20Editor/index.html" },
  { id: "1215", toolId: "vector-asset-studio", toolPath: "/tools/Vector%20Asset%20Studio/index.html" },
  { id: "1216", toolId: "vector-asset-studio", toolPath: "/tools/Vector%20Asset%20Studio/index.html" },
  { id: "1217", toolId: "vector-asset-studio", toolPath: "/tools/Vector%20Asset%20Studio/index.html" },
  { id: "1218", toolId: "parallax-editor", toolPath: "/tools/Parallax%20Scene%20Studio/index.html" },
  { id: "1219", toolId: "parallax-editor", toolPath: "/tools/Parallax%20Scene%20Studio/index.html" },
  { id: "1220", toolId: "parallax-editor", toolPath: "/tools/Parallax%20Scene%20Studio/index.html" }
]);

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function extractLaunchUrl(indexHtmlText) {
  const match = indexHtmlText.match(/window\.location\.replace\(("|')(.+?)\1\)/);
  assert.ok(match, "Expected sample index to include window.location.replace launch URL.");
  return match[2];
}

function assertToolSampleControlsRemoved() {
  const vectorMapHtml = readText(path.join(REPO_ROOT, "tools", "Vector Map Editor", "index.html"));
  assert.equal(vectorMapHtml.includes('id="sampleSelect"'), false, "Vector Map Editor sample select should be removed.");
  assert.equal(vectorMapHtml.includes('id="loadSampleButton"'), false, "Vector Map Editor sample load button should be removed.");

  const vectorAssetHtml = readText(path.join(REPO_ROOT, "tools", "Vector Asset Studio", "index.html"));
  assert.equal(vectorAssetHtml.includes('id="sampleSelect"'), false, "Vector Asset Studio sample select should be removed.");
  assert.equal(vectorAssetHtml.includes('id="loadSampleButton"'), false, "Vector Asset Studio sample load button should be removed.");
  assert.equal(vectorAssetHtml.includes('id="refreshSamplesButton"'), false, "Vector Asset Studio sample refresh button should be removed.");

  const parallaxHtml = readText(path.join(REPO_ROOT, "tools", "Parallax Scene Studio", "index.html"));
  assert.equal(parallaxHtml.includes('id="sampleSelect"'), false, "Parallax Scene Studio sample select should be removed.");
  assert.equal(parallaxHtml.includes('id="loadSampleButton"'), false, "Parallax Scene Studio sample load button should be removed.");
}

function assertExplicitPresetInputSupportRetained() {
  const vectorMapJs = readText(path.join(REPO_ROOT, "tools", "Vector Map Editor", "editor", "VectorMapEditorApp.js"));
  const vectorAssetJs = readText(path.join(REPO_ROOT, "tools", "Vector Asset Studio", "main.js"));
  const parallaxJs = readText(path.join(REPO_ROOT, "tools", "Parallax Scene Studio", "main.js"));

  assert.match(vectorMapJs, /samplePresetPath/, "Vector Map Editor must retain samplePresetPath support.");
  assert.match(vectorMapJs, /tryLoadPresetFromQuery\(/, "Vector Map Editor must retain query preset loader.");

  assert.match(vectorAssetJs, /samplePresetPath/, "Vector Asset Studio must retain samplePresetPath support.");
  assert.match(vectorAssetJs, /tryLoadPresetFromQuery\(/, "Vector Asset Studio must retain query preset loader.");

  assert.match(parallaxJs, /samplePresetPath/, "Parallax Scene Studio must retain samplePresetPath support.");
  assert.match(parallaxJs, /tryLoadPresetFromQuery\(/, "Parallax Scene Studio must retain query preset loader.");
}

function assertMigratedSamplesIndexedAndLaunchable() {
  const metadata = readJson(SAMPLES_METADATA_PATH);
  const metadataRows = Array.isArray(metadata?.samples) ? metadata.samples : [];

  MIGRATED_SAMPLES.forEach((sample) => {
    const sampleDir = path.join(REPO_ROOT, "samples", "phase-12", sample.id);
    const sampleIndexPath = path.join(sampleDir, "index.html");
    const samplePresetPath = path.join(sampleDir, `sample-${sample.id}-${sample.toolId}.json`);

    assert.equal(fs.existsSync(sampleDir), true, `Missing migrated sample directory for ${sample.id}.`);
    assert.equal(fs.existsSync(sampleIndexPath), true, `Missing migrated sample index for ${sample.id}.`);
    assert.equal(fs.existsSync(samplePresetPath), true, `Missing migrated preset payload for ${sample.id}.`);

    const metadataRow = metadataRows.find((row) => row?.id === sample.id);
    assert.ok(metadataRow, `Sample ${sample.id} must be present in samples metadata.`);
    assert.equal(metadataRow.phase, "12", `Sample ${sample.id} phase must be 12.`);
    assert.equal(metadataRow.href, `./phase-12/${sample.id}/index.html`, `Sample ${sample.id} href mismatch.`);

    const presetRows = Array.isArray(metadataRow.roundtripToolPresets) ? metadataRow.roundtripToolPresets : [];
    const matchingPreset = presetRows.find((row) => row?.toolId === sample.toolId);
    assert.ok(matchingPreset, `Sample ${sample.id} must include roundtrip preset for ${sample.toolId}.`);
    assert.equal(matchingPreset.presetPath, `/samples/phase-12/${sample.id}/sample-${sample.id}-${sample.toolId}.json`);

    const indexHtmlText = readText(sampleIndexPath);
    const launchUrl = extractLaunchUrl(indexHtmlText);
    assert.ok(launchUrl.startsWith(sample.toolPath), `Sample ${sample.id} launch URL must target ${sample.toolPath}.`);

    const parsedLaunchUrl = new URL(`https://example.test${launchUrl}`);
    assert.equal(parsedLaunchUrl.searchParams.get("sampleId"), sample.id, `Sample ${sample.id} launch sampleId mismatch.`);
    assert.equal(
      parsedLaunchUrl.searchParams.get("samplePresetPath"),
      `/samples/phase-12/${sample.id}/sample-${sample.id}-${sample.toolId}.json`,
      `Sample ${sample.id} launch samplePresetPath mismatch.`
    );
  });
}

export function run() {
  assertMigratedSamplesIndexedAndLaunchable();
  assertToolSampleControlsRemoved();
  assertExplicitPresetInputSupportRetained();
}