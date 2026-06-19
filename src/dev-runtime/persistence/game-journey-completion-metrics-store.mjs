import { mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import { SEED_DB_KEYS, makeSeedUlid } from "../seed/seed-db-keys.mjs";

export const GAME_JOURNEY_COMPLETION_METRICS_TABLE = "game_journey_completion_metrics";

function makeCompletionBucket({ order, ...bucket }) {
  return Object.freeze({
    key: makeSeedUlid(6000 + order),
    order,
    ...bucket,
  });
}

export const GAME_JOURNEY_COMPLETION_BUCKETS = Object.freeze([
  makeCompletionBucket({ bucketKey: "001-idea", order: 1, bucketName: "Idea", friendlyDescription: "Dream, brainstorm, and explore", requiredForMvp: false, canSkip: true, plannedCount: 4, completedCount: 0, active: false }),
  makeCompletionBucket({ bucketKey: "002-create", order: 2, bucketName: "Create", friendlyDescription: "Set up your game and crew", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "003-design", order: 3, bucketName: "Design", friendlyDescription: "Shape the player experience", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "004-graphics", order: 4, bucketName: "Graphics", friendlyDescription: "Create the look of your game", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "005-audio", order: 5, bucketName: "Audio", friendlyDescription: "Bring your world to life with sound", requiredForMvp: false, canSkip: true, plannedCount: 4, completedCount: 0, active: false }),
  makeCompletionBucket({ bucketKey: "006-objects", order: 6, bucketName: "Objects", friendlyDescription: "Build things players can interact with", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "007-worlds", order: 7, bucketName: "Worlds", friendlyDescription: "Design places to explore", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "008-interface", order: 8, bucketName: "Interface", friendlyDescription: "Create what players see and use", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "009-controls", order: 9, bucketName: "Controls", friendlyDescription: "Define how players play", requiredForMvp: true, canSkip: false, plannedCount: 4, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "010-rules", order: 10, bucketName: "Rules", friendlyDescription: "Make your game come alive", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "011-progression", order: 11, bucketName: "Progression", friendlyDescription: "Reward players and keep them engaged", requiredForMvp: false, canSkip: true, plannedCount: 4, completedCount: 0, active: false }),
  makeCompletionBucket({ bucketKey: "012-play-test", order: 12, bucketName: "Play Test", friendlyDescription: "See how your game feels", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "013-publish", order: 13, bucketName: "Publish", friendlyDescription: "Prepare your game for launch", requiredForMvp: true, canSkip: false, plannedCount: 5, completedCount: 0, active: true }),
  makeCompletionBucket({ bucketKey: "014-share", order: 14, bucketName: "Share", friendlyDescription: "Grow your community", requiredForMvp: false, canSkip: true, plannedCount: 5, completedCount: 0, active: false }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultDatabasePath() {
  const configured = String(process.env.GAMEFOUNDRY_GAME_JOURNEY_METRICS_DB_PATH || "").trim();
  if (configured) {
    return path.resolve(configured);
  }
  return path.join(process.cwd(), "tmp", "local-api", "game-journey-completion-metrics.sqlite");
}

function normalizeCount(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.trunc(parsed));
}

function normalizeActive(value, fallback = true) {
  if (value === true || value === 1 || value === "1" || value === "active") {
    return true;
  }
  if (value === false || value === 0 || value === "0" || value === "inactive") {
    return false;
  }
  return fallback;
}

function percentComplete(completedCount, plannedCount) {
  if (!plannedCount) {
    return 0;
  }
  return Math.round((completedCount / plannedCount) * 100);
}

function normalizeMetric(row, fallback = {}) {
  const plannedCount = normalizeCount(row?.plannedCount, fallback.plannedCount || 0);
  const completedCount = Math.min(normalizeCount(row?.completedCount, fallback.completedCount || 0), plannedCount);
  const active = normalizeActive(row?.active, fallback.active !== false);
  return {
    key: String(row?.key || fallback.key || ""),
    bucketKey: String(row?.bucketKey || fallback.bucketKey || ""),
    bucketName: String(row?.bucketName || fallback.bucketName || ""),
    bucketOrder: normalizeCount(row?.bucketOrder, fallback.order || fallback.bucketOrder || 0),
    friendlyDescription: String(row?.friendlyDescription || fallback.friendlyDescription || ""),
    requiredForMvp: Boolean(normalizeActive(row?.requiredForMvp, fallback.requiredForMvp === true)),
    canSkip: Boolean(normalizeActive(row?.canSkip, fallback.canSkip === true)),
    plannedCount,
    completedCount,
    percentComplete: percentComplete(completedCount, plannedCount),
    active,
    status: active ? "active" : "inactive",
    createdAt: String(row?.createdAt || ""),
    updatedAt: String(row?.updatedAt || ""),
    createdBy: String(row?.createdBy || SEED_DB_KEYS.users.forgeBot),
    updatedBy: String(row?.updatedBy || SEED_DB_KEYS.users.forgeBot),
  };
}

function addMissingColumn(database, columns, name, ddl) {
  if (!columns.has(name)) {
    database.exec(`ALTER TABLE ${GAME_JOURNEY_COMPLETION_METRICS_TABLE} ADD COLUMN ${ddl}`);
  }
}

function ensureMetricColumns(database) {
  const columns = new Set(
    database.prepare(`PRAGMA table_info(${GAME_JOURNEY_COMPLETION_METRICS_TABLE})`)
      .all()
      .map((column) => column.name),
  );
  addMissingColumn(database, columns, "status", "\"status\" TEXT NOT NULL DEFAULT 'active'");
  addMissingColumn(database, columns, "createdBy", `"createdBy" TEXT NOT NULL DEFAULT '${SEED_DB_KEYS.users.forgeBot}'`);
  addMissingColumn(database, columns, "updatedBy", `"updatedBy" TEXT NOT NULL DEFAULT '${SEED_DB_KEYS.users.forgeBot}'`);
  addMissingColumn(database, columns, "key", `"key" TEXT NOT NULL DEFAULT '${makeSeedUlid(6000)}'`);
}

function openDatabase(dbPath) {
  mkdirSync(path.dirname(dbPath), { recursive: true });
  const database = new DatabaseSync(dbPath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS ${GAME_JOURNEY_COMPLETION_METRICS_TABLE} (
      "key" TEXT PRIMARY KEY,
      "bucketKey" TEXT NOT NULL UNIQUE,
      "bucketOrder" INTEGER NOT NULL,
      "bucketName" TEXT NOT NULL,
      "friendlyDescription" TEXT NOT NULL,
      "requiredForMvp" INTEGER NOT NULL DEFAULT 0,
      "canSkip" INTEGER NOT NULL DEFAULT 0,
      "plannedCount" INTEGER NOT NULL DEFAULT 0,
      "completedCount" INTEGER NOT NULL DEFAULT 0,
      "active" INTEGER NOT NULL DEFAULT 1,
      "status" TEXT NOT NULL DEFAULT 'active',
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL,
      "createdBy" TEXT NOT NULL,
      "updatedBy" TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_game_journey_completion_metrics_active
      ON ${GAME_JOURNEY_COMPLETION_METRICS_TABLE} ("active");
  `);
  ensureMetricColumns(database);
  return database;
}

function seedDefaultBuckets(database, buckets) {
  const now = new Date().toISOString();
  const statement = database.prepare(`
    INSERT INTO ${GAME_JOURNEY_COMPLETION_METRICS_TABLE} (
      "bucketKey",
      "key",
      "bucketOrder",
      "bucketName",
      "friendlyDescription",
      "requiredForMvp",
      "canSkip",
      "plannedCount",
      "completedCount",
      "active",
      "status",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy"
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT("bucketKey") DO UPDATE SET
      "bucketOrder" = excluded."bucketOrder",
      "bucketName" = excluded."bucketName",
      "friendlyDescription" = excluded."friendlyDescription",
      "requiredForMvp" = excluded."requiredForMvp",
      "canSkip" = excluded."canSkip"
  `);
  buckets.forEach((bucket) => {
    statement.run(
      bucket.bucketKey,
      bucket.key,
      bucket.order,
      bucket.bucketName,
      bucket.friendlyDescription,
      bucket.requiredForMvp ? 1 : 0,
      bucket.canSkip ? 1 : 0,
      bucket.plannedCount,
      bucket.completedCount,
      bucket.active ? 1 : 0,
      bucket.active ? "active" : "inactive",
      now,
      now,
      SEED_DB_KEYS.users.forgeBot,
      SEED_DB_KEYS.users.forgeBot,
    );
  });
}

function readMetrics(database, buckets) {
  seedDefaultBuckets(database, buckets);
  const rows = database.prepare(`
    SELECT
      "bucketKey",
      "key",
      "bucketOrder",
      "bucketName",
      "friendlyDescription",
      "requiredForMvp",
      "canSkip",
      "plannedCount",
      "completedCount",
      "active",
      "status",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy"
    FROM ${GAME_JOURNEY_COMPLETION_METRICS_TABLE}
    ORDER BY "bucketOrder" ASC
  `).all();
  const fallbackByKey = new Map(buckets.map((bucket) => [bucket.bucketKey, bucket]));
  return rows.map((row) => normalizeMetric(row, fallbackByKey.get(row.bucketKey) || {}));
}

export function createGameJourneyCompletionMetricsStore(options = {}) {
  const dbPath = path.resolve(options.dbPath || defaultDatabasePath());
  const bucketSeeds = Object.freeze((options.buckets || GAME_JOURNEY_COMPLETION_BUCKETS).map(clone));

  function withDatabase(callback) {
    const database = openDatabase(dbPath);
    try {
      return callback(database);
    } finally {
      database.close();
    }
  }

  function listMetrics() {
    return withDatabase((database) => readMetrics(database, bucketSeeds));
  }

  function updateMetric(bucketKey, updates = {}) {
    const key = String(bucketKey || updates.bucketKey || "").trim();
    if (!key) {
      throw new Error("Game Journey completion metric update requires a bucketKey.");
    }
    return withDatabase((database) => {
      const current = readMetrics(database, bucketSeeds).find((metric) => metric.bucketKey === key);
      if (!current) {
        throw new Error(`Unknown Game Journey completion metric bucket: ${key}.`);
      }
      const plannedCount = updates.plannedCount === undefined
        ? current.plannedCount
        : normalizeCount(updates.plannedCount, current.plannedCount);
      const completedCount = Math.min(
        updates.completedCount === undefined
          ? current.completedCount
          : normalizeCount(updates.completedCount, current.completedCount),
        plannedCount,
      );
      const active = updates.active === undefined && updates.status === undefined
        ? current.active
        : normalizeActive(updates.active ?? updates.status, current.active);
      const updatedAt = new Date().toISOString();
      database.prepare(`
        UPDATE ${GAME_JOURNEY_COMPLETION_METRICS_TABLE}
        SET
          "plannedCount" = ?,
          "completedCount" = ?,
          "active" = ?,
          "status" = ?,
          "updatedAt" = ?
        WHERE "bucketKey" = ?
      `).run(plannedCount, completedCount, active ? 1 : 0, active ? "active" : "inactive", updatedAt, key);
      return readMetrics(database, bucketSeeds).find((metric) => metric.bucketKey === key);
    });
  }

  function snapshot() {
    const metrics = listMetrics();
    const activeCount = metrics.filter((metric) => metric.active).length;
    const plannedCount = metrics.reduce((total, metric) => total + metric.plannedCount, 0);
    const completedCount = metrics.reduce((total, metric) => total + metric.completedCount, 0);
    return {
      api: "Local API",
      database: "Local DB",
      databaseEngine: "SQLite",
      databasePath: dbPath,
      serviceContract: "Web UI -> Local API/Service Contract -> Local DB",
      source: GAME_JOURNEY_COMPLETION_METRICS_TABLE,
      tableName: GAME_JOURNEY_COMPLETION_METRICS_TABLE,
      activeCount,
      inactiveCount: metrics.length - activeCount,
      plannedCount,
      completedCount,
      percentComplete: percentComplete(completedCount, plannedCount),
      records: metrics,
    };
  }

  return {
    dbPath,
    listMetrics,
    snapshot,
    updateMetric,
  };
}
