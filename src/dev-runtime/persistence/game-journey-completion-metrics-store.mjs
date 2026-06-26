import { createPostgresConnectionClient } from "./postgres-connection-client.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../seed/seed-db-keys.mjs";

export const GAME_JOURNEY_COMPLETION_METRICS_TABLE = "game_journey_completion_metrics";

export const GAME_JOURNEY_COMPLETION_METRICS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS game_journey_completion_metrics (
  key text PRIMARY KEY,
  "bucketKey" text NOT NULL UNIQUE,
  "bucketOrder" integer NOT NULL DEFAULT 0,
  "bucketName" text NOT NULL,
  "friendlyDescription" text NOT NULL,
  "requiredForMvp" boolean NOT NULL DEFAULT false,
  "canSkip" boolean NOT NULL DEFAULT false,
  "plannedCount" integer NOT NULL DEFAULT 0,
  "completedCount" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "status" text NOT NULL DEFAULT 'active',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE INDEX IF NOT EXISTS idx_game_journey_completion_metrics_active ON game_journey_completion_metrics ("active");
CREATE INDEX IF NOT EXISTS idx_game_journey_completion_metrics_status ON game_journey_completion_metrics ("status");
CREATE INDEX IF NOT EXISTS idx_game_journey_completion_metrics_createdby ON game_journey_completion_metrics ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_journey_completion_metrics_updatedby ON game_journey_completion_metrics ("updatedBy");
`;

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

function normalizeCount(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.trunc(parsed));
}

function normalizeActive(value, fallback = true) {
  if (value === true || value === 1 || value === "1" || value === "true" || value === "active") {
    return true;
  }
  if (value === false || value === 0 || value === "0" || value === "false" || value === "inactive") {
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

function queryForBucketKey(bucketKey) {
  return `select=*&bucketKey=eq.${encodeURIComponent(bucketKey)}`;
}

function sortByBucketOrder(left, right) {
  return Number(left.bucketOrder) - Number(right.bucketOrder)
    || String(left.bucketKey).localeCompare(String(right.bucketKey));
}

function bucketSeedRow(bucket, now) {
  return {
    active: bucket.active,
    bucketKey: bucket.bucketKey,
    bucketName: bucket.bucketName,
    bucketOrder: bucket.order,
    canSkip: bucket.canSkip,
    completedCount: bucket.completedCount,
    createdAt: now,
    createdBy: SEED_DB_KEYS.users.forgeBot,
    friendlyDescription: bucket.friendlyDescription,
    key: bucket.key,
    plannedCount: bucket.plannedCount,
    requiredForMvp: bucket.requiredForMvp,
    status: bucket.active ? "active" : "inactive",
    updatedAt: now,
    updatedBy: SEED_DB_KEYS.users.forgeBot,
  };
}

export function createGameJourneyCompletionMetricsStore(options = {}) {
  const env = options.env || process.env;
  const bucketSeeds = Object.freeze((options.buckets || GAME_JOURNEY_COMPLETION_BUCKETS).map(clone));
  let postgresClient = options.postgresClient || null;
  let readyPromise = null;

  function client() {
    if (postgresClient) {
      return postgresClient;
    }
    try {
      postgresClient = createPostgresConnectionClient({ env });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "Unknown Postgres configuration error.");
      throw new Error(`Game Journey completion metrics Postgres storage is not configured. ${message}`);
    }
    return postgresClient;
  }

  async function tableRows() {
    const rows = await client().requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
      method: "GET",
      query: "select=*",
    });
    return Array.isArray(rows) ? clone(rows) : [];
  }

  async function rowByBucketKey(bucketKey) {
    const rows = await client().requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
      method: "GET",
      query: queryForBucketKey(bucketKey),
    });
    return clone(Array.isArray(rows) ? rows[0] || null : null);
  }

  async function upsertRow(row) {
    const rows = await client().requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
      body: row,
      method: "POST",
    });
    return clone(Array.isArray(rows) ? rows[0] || row : row);
  }

  async function patchRow(bucketKey, row) {
    const rows = await client().requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
      body: row,
      method: "PATCH",
      query: queryForBucketKey(bucketKey),
    });
    return clone(Array.isArray(rows) ? rows[0] || null : null);
  }

  async function seedDefaultBuckets() {
    const now = new Date().toISOString();
    const existingByBucketKey = new Map((await tableRows()).map((row) => [row.bucketKey, row]));
    for (const bucket of bucketSeeds) {
      const existing = existingByBucketKey.get(bucket.bucketKey);
      if (!existing) {
        await upsertRow(bucketSeedRow(bucket, now));
        continue;
      }
      await patchRow(bucket.bucketKey, {
        bucketName: bucket.bucketName,
        bucketOrder: bucket.order,
        canSkip: bucket.canSkip,
        friendlyDescription: bucket.friendlyDescription,
        requiredForMvp: bucket.requiredForMvp,
      });
    }
  }

  async function ensureReady() {
    if (!readyPromise) {
      readyPromise = (async () => {
        await client().query(GAME_JOURNEY_COMPLETION_METRICS_SCHEMA_SQL);
        await seedDefaultBuckets();
      })();
    }
    return readyPromise;
  }

  async function listMetrics() {
    await ensureReady();
    const fallbackByKey = new Map(bucketSeeds.map((bucket) => [bucket.bucketKey, bucket]));
    return (await tableRows())
      .map((row) => normalizeMetric(row, fallbackByKey.get(row.bucketKey) || {}))
      .sort(sortByBucketOrder);
  }

  async function updateMetric(bucketKey, updates = {}) {
    await ensureReady();
    const key = String(bucketKey || updates.bucketKey || "").trim();
    if (!key) {
      throw new Error("Game Journey completion metric update requires a bucketKey.");
    }
    const current = (await listMetrics()).find((metric) => metric.bucketKey === key);
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
    const row = await patchRow(key, {
      active,
      completedCount,
      plannedCount,
      status: active ? "active" : "inactive",
      updatedAt,
      updatedBy: current.updatedBy || SEED_DB_KEYS.users.forgeBot,
    });
    return normalizeMetric(row || {
      ...current,
      active,
      completedCount,
      plannedCount,
      status: active ? "active" : "inactive",
      updatedAt,
    }, current);
  }

  async function snapshot() {
    const metrics = await listMetrics();
    const activeCount = metrics.filter((metric) => metric.active).length;
    const plannedCount = metrics.reduce((total, metric) => total + metric.plannedCount, 0);
    const completedCount = metrics.reduce((total, metric) => total + metric.completedCount, 0);
    return {
      api: "Local API",
      database: "Postgres",
      databaseConfigKey: "GAMEFOUNDRY_DATABASE_URL",
      databaseEngine: "Postgres",
      databasePath: "GAMEFOUNDRY_DATABASE_URL",
      serviceContract: "Web UI -> Local API/Service Contract -> Postgres",
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
    listMetrics,
    snapshot,
    updateMetric,
  };
}
