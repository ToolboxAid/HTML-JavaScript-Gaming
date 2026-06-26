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

    assert.equal(store.legacyDbPath, "");
    assert.equal(metrics.length, 14);
    assert.equal(postgresClient.dumpTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE).length, 14);
    assert.equal(await fs.readFile(retiredLegacyPath, "utf8"), retiredLegacyContents);
  } finally {
    process.chdir(originalCwd);
    await fs.rm(directory, { force: true, recursive: true });
  }
});
