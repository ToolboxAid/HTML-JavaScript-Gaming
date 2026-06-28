import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  GAME_JOURNEY_COMPLETION_METRICS_TABLE,
  createGameJourneyCompletionMetricsStore,
} from "../../../api/persistence/game-journey-completion-metrics-store.mjs";
import { createGameJourneyCompletionMetricsPostgresClientStub } from "../helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs";

const IMPLEMENTATION_ROOTS = Object.freeze(["src", "assets", "toolbox", "scripts", "tests"]);
const RETIRED_FILE_DB_TOKEN = "sql" + "ite";
const RETIRED_METRICS_FILE = `game-journey-completion-metrics.${RETIRED_FILE_DB_TOKEN}`;
const RETIRED_LOCAL_RUNTIME_PATH = ["tmp", "local-api"].join("/");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const FORBIDDEN_IMPLEMENTATION_PATTERNS = Object.freeze([
  new RegExp(RETIRED_FILE_DB_TOKEN, "i"),
  new RegExp(`\\.${RETIRED_FILE_DB_TOKEN}`, "i"),
  new RegExp(`better-${RETIRED_FILE_DB_TOKEN}`, "i"),
  new RegExp(escapeRegExp(RETIRED_METRICS_FILE), "i"),
  new RegExp(escapeRegExp(RETIRED_LOCAL_RUNTIME_PATH), "i"),
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

test("Game Journey completion metrics use the database client only", async () => {
  const postgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const store = createGameJourneyCompletionMetricsStore({ postgresClient });
  const metrics = await store.listMetrics();
  const snapshot = await store.snapshot();
  const snapshotText = JSON.stringify(snapshot);

  assert.equal(metrics.length, 14);
  assert.equal(postgresClient.dumpTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE).length, 14);
  assert.equal(snapshot.api, "Local API");
  assert.equal(snapshot.tableName, GAME_JOURNEY_COMPLETION_METRICS_TABLE);
  for (const pattern of FORBIDDEN_IMPLEMENTATION_PATTERNS) {
    assert.equal(pattern.test(snapshotText), false);
  }
});

test("implementation and validation JS/MJS do not contain retired file DB metrics references", async () => {
  const files = [];
  for (const root of IMPLEMENTATION_ROOTS) {
    files.push(...await activeRuntimeJavaScriptFiles(root));
  }

  const findings = [];
  for (const file of files) {
    const contents = await fs.readFile(file, "utf8");
    FORBIDDEN_IMPLEMENTATION_PATTERNS.forEach((pattern) => {
      if (pattern.test(contents)) {
        findings.push(`${file}: ${pattern}`);
      }
    });
  }

  assert.deepEqual(findings, []);
});
