import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "samples", "metadata", "samples.index.metadata.json");
const LEGACY_PATH = path.join(ROOT, "samples", "metadata", "samples.curriculum.validation.json");
const TARGET_DIR = path.join(ROOT, "tests", "validation");
const TARGET_PATH = path.join(TARGET_DIR, "samples.curriculum.validation.json");
const PHASE_ORDER = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

function loadBasePayload() {
  if (fs.existsSync(TARGET_PATH)) {
    return readJson(TARGET_PATH);
  }
  if (fs.existsSync(LEGACY_PATH)) {
    return readJson(LEGACY_PATH);
  }
  return {
    version: 1,
    progression: {},
    conceptModel: {},
    overlaps: {
      adjacentTopicOverlaps: [],
      duplicateTitles: [],
      unresolvedAdjacentOverlaps: 0
    },
    samples: []
  };
}

function main() {
  const indexMetadata = readJson(INDEX_PATH);
  const totalSamples = Array.isArray(indexMetadata?.samples) ? indexMetadata.samples.length : 0;
  const payload = loadBasePayload();

  payload.progression = payload.progression && typeof payload.progression === "object"
    ? payload.progression
    : {};
  payload.progression.phaseOrder = [...PHASE_ORDER];
  payload.progression.totalSamples = totalSamples;

  writeJson(TARGET_PATH, payload);
  console.log(`OK wrote ${path.relative(ROOT, TARGET_PATH).replaceAll("\\", "/")} totalSamples=${totalSamples}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`FAIL ${message}`);
  process.exit(1);
}
