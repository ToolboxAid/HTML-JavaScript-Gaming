import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SAMPLES_ROOT = path.join(REPO_ROOT, "samples");
const ALLOWED_FULLSCREEN_ROOT = path.join(SAMPLES_ROOT, "phase-07", "0713");
const SOURCE_FILE_PATTERN = /\.(js|mjs|cjs|html|json)$/i;
const FULLSCREEN_PATTERNS = [
  /engine\.fullscreen/g,
  /requestFullscreen/g,
  /fullscreenPreferred/g,
  /settings-fullscreen/g,
];

function toRepoPath(targetPath) {
  return path.relative(REPO_ROOT, targetPath).replace(/\\/g, "/");
}

function walkSampleFiles(rootPath, output = []) {
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "metadata" || entry.name === "shared" || entry.name === "_shared") {
        continue;
      }
      walkSampleFiles(fullPath, output);
      continue;
    }
    if (SOURCE_FILE_PATTERN.test(entry.name)) {
      output.push(fullPath);
    }
  }
  return output;
}

export function run() {
  const sampleFiles = walkSampleFiles(SAMPLES_ROOT);
  const violations = [];
  let allowedUsageCount = 0;

  for (const filePath of sampleFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    const hasFullscreenUsage = FULLSCREEN_PATTERNS.some((pattern) => pattern.test(source));
    if (!hasFullscreenUsage) {
      continue;
    }

    const normalized = path.resolve(filePath);
    if (normalized.startsWith(path.resolve(ALLOWED_FULLSCREEN_ROOT))) {
      allowedUsageCount += 1;
      continue;
    }

    violations.push(toRepoPath(filePath));
  }

  assert.equal(allowedUsageCount > 0, true, "Expected fullscreen usage in sample 0713.");
  assert.deepEqual(
    violations,
    [],
    `Unauthorized fullscreen usage detected outside sample 0713:\n${violations.join("\n")}`
  );
}
