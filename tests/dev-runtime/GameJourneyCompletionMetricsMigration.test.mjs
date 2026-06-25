import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  GAME_JOURNEY_COMPLETION_METRICS_TABLE,
} from "../../src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs";
import {
  migrateLegacyCompletionMetricRowsToPostgres,
} from "../../src/dev-runtime/persistence/game-journey-completion-metrics-migration.mjs";
import { createGameJourneyCompletionMetricsPostgresClientStub } from "../helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs";

const LEGACY_ROW = Object.freeze({
  active: 1,
  bucketKey: "002-create",
  bucketName: "Create",
  bucketOrder: 2,
  canSkip: 0,
  completedCount: 3,
  createdAt: "2026-06-20T01:52:14.797Z",
  createdBy: "01K2GFSJ0Y0000000000000054",
  friendlyDescription: "Set up your game and crew",
  key: "01K2GFSJ0Y0000000000006002",
  plannedCount: 5,
  requiredForMvp: 1,
  status: "active",
  updatedAt: "2026-06-21T03:04:05.000Z",
  updatedBy: "01K2GFSJ0Y0000000000000054",
});

async function tempLegacyFile() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "gfs-game-journey-migration-"));
  const legacyDbPath = path.join(directory, "game-journey-completion-metrics.sqlite");
  const archiveDir = path.join(directory, "legacy-migrated");
  await fs.writeFile(legacyDbPath, "legacy sqlite placeholder");
  return { archiveDir, directory, legacyDbPath };
}

test("Game Journey completion metrics migration inserts valid rows and archives legacy SQLite after success", async () => {
  const postgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const paths = await tempLegacyFile();
  try {
    const result = await migrateLegacyCompletionMetricRowsToPostgres({
      archiveDir: paths.archiveDir,
      legacyDbPath: paths.legacyDbPath,
      now: new Date("2026-06-25T12:00:00.000Z"),
      postgresClient,
      rows: [LEGACY_ROW],
    });

    assert.equal(result.status, "PASS");
    assert.equal(result.insertedCount, 1);
    assert.equal(result.duplicateCount, 0);
    assert.equal(result.archive.archived, true);
    assert.equal(await fs.stat(paths.legacyDbPath).then(() => true, () => false), false);
    assert.equal(await fs.stat(result.archive.archivePath).then(() => true, () => false), true);
    assert.match(result.archive.archivePath, /legacy-migrated[\\/]+game-journey-completion-metrics-20260625T120000Z\.sqlite$/);
    assert.deepEqual(postgresClient.dumpTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE), [
      {
        ...LEGACY_ROW,
        active: true,
        canSkip: false,
        requiredForMvp: true,
      },
    ]);
  } finally {
    await fs.rm(paths.directory, { force: true, recursive: true });
  }
});

test("Game Journey completion metrics migration detects Postgres conflicts without moving legacy SQLite", async () => {
  const postgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const paths = await tempLegacyFile();
  await postgresClient.requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
    body: {
      ...LEGACY_ROW,
      active: true,
      canSkip: false,
      completedCount: 1,
      requiredForMvp: true,
    },
    method: "POST",
  });

  try {
    await assert.rejects(
      () => migrateLegacyCompletionMetricRowsToPostgres({
        archiveDir: paths.archiveDir,
        legacyDbPath: paths.legacyDbPath,
        postgresClient,
        rows: [LEGACY_ROW],
      }),
      /migration blocked by 1 Postgres conflict/,
    );
    assert.equal(await fs.stat(paths.legacyDbPath).then(() => true, () => false), true);
  } finally {
    await fs.rm(paths.directory, { force: true, recursive: true });
  }
});

test("Game Journey completion metrics migration archives when legacy rows are already present unchanged", async () => {
  const postgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const paths = await tempLegacyFile();
  await postgresClient.requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
    body: {
      ...LEGACY_ROW,
      active: true,
      canSkip: false,
      requiredForMvp: true,
    },
    method: "POST",
  });

  try {
    const result = await migrateLegacyCompletionMetricRowsToPostgres({
      archiveDir: paths.archiveDir,
      legacyDbPath: paths.legacyDbPath,
      postgresClient,
      rows: [LEGACY_ROW],
    });

    assert.equal(result.insertedCount, 0);
    assert.equal(result.duplicateCount, 1);
    assert.equal(result.archive.archived, true);
    assert.equal(await fs.stat(paths.legacyDbPath).then(() => true, () => false), false);
  } finally {
    await fs.rm(paths.directory, { force: true, recursive: true });
  }
});

test("Game Journey completion metrics migration preserves legacy timestamps for otherwise matching Postgres rows", async () => {
  const postgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const paths = await tempLegacyFile();
  await postgresClient.requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
    body: {
      ...LEGACY_ROW,
      active: true,
      canSkip: false,
      createdAt: "2026-06-25T00:00:00.000Z",
      requiredForMvp: true,
      updatedAt: "2026-06-25T00:00:00.000Z",
    },
    method: "POST",
  });

  try {
    const result = await migrateLegacyCompletionMetricRowsToPostgres({
      archiveDir: paths.archiveDir,
      legacyDbPath: paths.legacyDbPath,
      postgresClient,
      rows: [LEGACY_ROW],
    });

    assert.equal(result.insertedCount, 0);
    assert.equal(result.duplicateCount, 0);
    assert.equal(result.timestampPatchCount, 1);
    assert.equal(result.archive.archived, true);
    assert.deepEqual(postgresClient.dumpTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE)[0], {
      ...LEGACY_ROW,
      active: true,
      canSkip: false,
      requiredForMvp: true,
    });
  } finally {
    await fs.rm(paths.directory, { force: true, recursive: true });
  }
});

test("Game Journey completion metrics migration rejects duplicate legacy bucket keys before writing", async () => {
  const postgresClient = createGameJourneyCompletionMetricsPostgresClientStub();
  const paths = await tempLegacyFile();
  try {
    await assert.rejects(
      () => migrateLegacyCompletionMetricRowsToPostgres({
        archiveDir: paths.archiveDir,
        legacyDbPath: paths.legacyDbPath,
        postgresClient,
        rows: [
          LEGACY_ROW,
          {
            ...LEGACY_ROW,
            key: "01K2GFSJ0Y0000000000006999",
          },
        ],
      }),
      /Duplicate legacy bucketKey/,
    );
    assert.equal(postgresClient.dumpTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE).length, 0);
    assert.equal(await fs.stat(paths.legacyDbPath).then(() => true, () => false), true);
  } finally {
    await fs.rm(paths.directory, { force: true, recursive: true });
  }
});
