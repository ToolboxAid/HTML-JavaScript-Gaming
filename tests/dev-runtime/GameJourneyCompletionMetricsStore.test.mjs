import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import {
  GAME_JOURNEY_COMPLETION_METRICS_TABLE,
  createGameJourneyCompletionMetricsStore,
} from "../../src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs";
import { createGameJourneyCompletionMetricsPostgresClientStub } from "../helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs";

const ACTIVE_RUNTIME_ROOTS = Object.freeze(["src", "assets", "toolbox"]);
const ACTIVE_RUNTIME_ALLOWED_FILES = new Set([
  path.normalize("src/dev-runtime/persistence/game-journey-completion-metrics-migration.mjs"),
]);
const RUNTIME_FORBIDDEN_PATTERNS = Object.freeze([
  /sqlite/i,
  /\.sqlite/i,
  /better-sqlite/i,
  /game-journey-completion-metrics\.sqlite/i,
  /tmp\/local-api/i,
]);

async function activeRuntimeJavaScriptFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await activeRuntimeJavaScriptFiles(child));
      continue;
    }
    if (entry.isFile() && /\.(?:mjs|js)$/i.test(entry.name)) {
      files.push(child);
    }
  }
  return files;
}

test("active Game Journey metrics ignore the retired default legacy SQLite path", async () => {
  const originalCwd = process.cwd();
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "gfs-game-journey-metrics-store-"));
  const retiredLegacyPath = path.join(directory, "tmp", "local-api", "game-journey-completion-metrics.sqlite");
  const retiredLegacyContents = "retired legacy sqlite placeholder";

  try {
    await fs.mkdir(path.dirname(retiredLegacyPath), { recursive: true });
    await fs.writeFile(retiredLegacyPath, retiredLegacyContents);
    process.chdir(directory);

    const postgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
    const store = createGameJourneyCompletionMetricsStore({ postgresClient });
    const metrics = await store.listMetrics();
    const snapshot = await store.snapshot();

    assert.equal(Object.hasOwn(store, "legacyDbPath"), false);
    assert.equal(Object.hasOwn(snapshot, "legacySqlitePath"), false);
    assert.equal(metrics.length, 14);
    assert.equal(postgresClient.dumpTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE).length, 14);
    assert.equal(await fs.readFile(retiredLegacyPath, "utf8"), retiredLegacyContents);
  } finally {
    process.chdir(originalCwd);
    await fs.rm(directory, { force: true, recursive: true });
  }
});

test("active runtime JS and MJS do not contain SQLite or tmp local metrics references", async () => {
  const files = [];
  for (const root of ACTIVE_RUNTIME_ROOTS) {
    files.push(...await activeRuntimeJavaScriptFiles(root));
  }

  const findings = [];
  for (const file of files) {
    const normalized = path.normalize(file);
    if (ACTIVE_RUNTIME_ALLOWED_FILES.has(normalized)) {
      continue;
    }
    const contents = await fs.readFile(file, "utf8");
    RUNTIME_FORBIDDEN_PATTERNS.forEach((pattern) => {
      if (pattern.test(contents)) {
        findings.push(`${file}: ${pattern}`);
      }
    });
  }

  assert.deepEqual(findings, []);
});
