import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";
import {
  GAME_JOURNEY_COMPLETION_METRICS_SCHEMA_SQL,
  GAME_JOURNEY_COMPLETION_METRICS_TABLE,
} from "./game-journey-completion-metrics-store.mjs";
import { createPostgresConnectionClient } from "./postgres-connection-client.mjs";

export const DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_SQLITE_PATH = path.join(
  process.cwd(),
  "tmp",
  "local-api",
  "game-journey-completion-metrics.sqlite",
);
export const DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_ARCHIVE_DIR = path.join(
  process.cwd(),
  "tmp",
  "local-api",
  "legacy-migrated",
);

const LEGACY_TABLE = GAME_JOURNEY_COMPLETION_METRICS_TABLE;
const EXPECTED_COLUMNS = Object.freeze([
  "key",
  "bucketKey",
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
  "updatedBy",
]);

const PYTHON_SQLITE_EXPORT_SCRIPT = String.raw`
import json
import sqlite3
import sys

db_path = sys.argv[1]
connection = sqlite3.connect(db_path)
connection.row_factory = sqlite3.Row
try:
    schema_objects = [
        dict(row)
        for row in connection.execute(
            "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger', 'view') ORDER BY type, name"
        ).fetchall()
    ]
    columns = [
        dict(row)
        for row in connection.execute("PRAGMA table_info(game_journey_completion_metrics)").fetchall()
    ]
    rows = [
        dict(row)
        for row in connection.execute(
            'SELECT * FROM "game_journey_completion_metrics" ORDER BY "bucketOrder", "bucketKey"'
        ).fetchall()
    ]
    print(json.dumps({
        "schema": {
            "columns": columns,
            "objects": schema_objects,
        },
        "rows": rows,
    }))
finally:
    connection.close()
`;

export class GameJourneyCompletionMetricsMigrationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "GameJourneyCompletionMetricsMigrationError";
    this.details = details;
  }
}

function asText(value) {
  return String(value ?? "").trim();
}

function normalizeCount(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new GameJourneyCompletionMetricsMigrationError(`Invalid legacy ${label}: ${value}.`);
  }
  return Math.trunc(parsed);
}

function normalizeBoolean(value, label) {
  if (value === true || value === 1 || value === "1" || value === "true" || value === "active") {
    return true;
  }
  if (value === false || value === 0 || value === "0" || value === "false" || value === "inactive") {
    return false;
  }
  throw new GameJourneyCompletionMetricsMigrationError(`Invalid legacy ${label}: ${value}.`);
}

function requireText(row, key) {
  const value = asText(row?.[key]);
  if (!value) {
    throw new GameJourneyCompletionMetricsMigrationError(`Legacy row is missing required ${key}.`);
  }
  return value;
}

function normalizeStatus(row, active) {
  const status = asText(row?.status) || (active ? "active" : "inactive");
  if (!["active", "inactive"].includes(status)) {
    throw new GameJourneyCompletionMetricsMigrationError(`Invalid legacy status: ${status}.`);
  }
  return status;
}

export function normalizeLegacyCompletionMetric(row) {
  const plannedCount = normalizeCount(row?.plannedCount, "plannedCount");
  const completedCount = normalizeCount(row?.completedCount, "completedCount");
  if (completedCount > plannedCount) {
    throw new GameJourneyCompletionMetricsMigrationError(
      `Legacy completedCount ${completedCount} exceeds plannedCount ${plannedCount} for ${asText(row?.bucketKey) || "(missing bucketKey)"}.`,
    );
  }
  const active = normalizeBoolean(row?.active, "active");
  return {
    active,
    bucketKey: requireText(row, "bucketKey"),
    bucketName: requireText(row, "bucketName"),
    bucketOrder: normalizeCount(row?.bucketOrder, "bucketOrder"),
    canSkip: normalizeBoolean(row?.canSkip, "canSkip"),
    completedCount,
    createdAt: requireText(row, "createdAt"),
    createdBy: requireText(row, "createdBy"),
    friendlyDescription: requireText(row, "friendlyDescription"),
    key: requireText(row, "key"),
    plannedCount,
    requiredForMvp: normalizeBoolean(row?.requiredForMvp, "requiredForMvp"),
    status: normalizeStatus(row, active),
    updatedAt: requireText(row, "updatedAt"),
    updatedBy: requireText(row, "updatedBy"),
  };
}

function validateLegacySchema(exported) {
  const table = exported?.schema?.objects?.find((object) => object.type === "table" && object.name === LEGACY_TABLE);
  if (!table) {
    throw new GameJourneyCompletionMetricsMigrationError(`Legacy SQLite file does not contain ${LEGACY_TABLE}.`);
  }
  const columns = new Set((exported?.schema?.columns || []).map((column) => String(column.name || "")));
  const missingColumns = EXPECTED_COLUMNS.filter((column) => !columns.has(column));
  if (missingColumns.length) {
    throw new GameJourneyCompletionMetricsMigrationError(
      `Legacy SQLite ${LEGACY_TABLE} is missing required columns: ${missingColumns.join(", ")}.`,
      { missingColumns },
    );
  }
}

function assertUniqueLegacyRows(rows) {
  const seenKeys = new Set();
  const seenBucketKeys = new Set();
  rows.forEach((row) => {
    if (seenKeys.has(row.key)) {
      throw new GameJourneyCompletionMetricsMigrationError(`Duplicate legacy key detected before migration: ${row.key}.`);
    }
    if (seenBucketKeys.has(row.bucketKey)) {
      throw new GameJourneyCompletionMetricsMigrationError(`Duplicate legacy bucketKey detected before migration: ${row.bucketKey}.`);
    }
    seenKeys.add(row.key);
    seenBucketKeys.add(row.bucketKey);
  });
}

function comparableRow(row) {
  const normalized = normalizeLegacyCompletionMetric(row);
  return EXPECTED_COLUMNS.reduce((record, key) => {
    record[key] = normalized[key];
    return record;
  }, {});
}

function rowsMatch(left, right) {
  const normalizedLeft = comparableRow(left);
  const normalizedRight = comparableRow(right);
  return EXPECTED_COLUMNS.every((key) => normalizedLeft[key] === normalizedRight[key]);
}

function differingColumns(left, right) {
  const normalizedLeft = comparableRow(left);
  const normalizedRight = comparableRow(right);
  return EXPECTED_COLUMNS.filter((key) => normalizedLeft[key] !== normalizedRight[key]);
}

export function classifyLegacyCompletionMetricRows({ existingRows = [], legacyRows = [] } = {}) {
  const existingByKey = new Map(existingRows.map((row) => [String(row.key || ""), row]));
  const existingByBucketKey = new Map(existingRows.map((row) => [String(row.bucketKey || ""), row]));
  const duplicates = [];
  const conflicts = [];
  const inserts = [];
  const timestampPatches = [];
  legacyRows.forEach((legacyRow) => {
    const existing = existingByKey.get(legacyRow.key) || existingByBucketKey.get(legacyRow.bucketKey);
    if (!existing) {
      inserts.push(legacyRow);
      return;
    }
    if (rowsMatch(legacyRow, existing)) {
      duplicates.push({
        bucketKey: legacyRow.bucketKey,
        key: legacyRow.key,
        reason: "already present in Postgres with matching data",
      });
      return;
    }
    const diffs = differingColumns(legacyRow, existing);
    if (diffs.every((column) => column === "createdAt" || column === "updatedAt")) {
      timestampPatches.push({
        bucketKey: legacyRow.bucketKey,
        createdAt: legacyRow.createdAt,
        key: legacyRow.key,
        reason: "Postgres row matched legacy data except timestamps; preserving legacy createdAt/updatedAt.",
        updatedAt: legacyRow.updatedAt,
      });
      return;
    }
    conflicts.push({
      bucketKey: legacyRow.bucketKey,
      existingKey: String(existing.key || ""),
      key: legacyRow.key,
      reason: `Postgres already contains a different row for this key or bucketKey (${diffs.join(", ")} differ).`,
    });
  });
  return { conflicts, duplicates, inserts, timestampPatches };
}

function spawnPythonExport({ legacyDbPath, pythonCommand }) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonCommand, ["-", legacyDbPath], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new GameJourneyCompletionMetricsMigrationError(
        `Python SQLite export failed with exit code ${code}. ${stderr.trim()}`,
        { stderr: stderr.trim() },
      ));
    });
    child.stdin.end(PYTHON_SQLITE_EXPORT_SCRIPT);
  });
}

export async function readLegacyCompletionMetricsSqlite({ legacyDbPath, pythonCommand = "python" } = {}) {
  const resolvedPath = path.resolve(legacyDbPath || DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_SQLITE_PATH);
  if (!existsSync(resolvedPath)) {
    throw new GameJourneyCompletionMetricsMigrationError(`Legacy SQLite file was not found: ${resolvedPath}.`);
  }
  const stdout = await spawnPythonExport({ legacyDbPath: resolvedPath, pythonCommand });
  let exported;
  try {
    exported = JSON.parse(stdout);
  } catch (error) {
    throw new GameJourneyCompletionMetricsMigrationError(
      `Python SQLite export did not return valid JSON: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }
  validateLegacySchema(exported);
  const rows = (exported.rows || []).map(normalizeLegacyCompletionMetric);
  assertUniqueLegacyRows(rows);
  return {
    legacyDbPath: resolvedPath,
    rowCount: rows.length,
    rows,
    schema: exported.schema,
  };
}

async function nextArchivePath({ archiveDir, legacyDbPath, now = new Date() }) {
  await fs.mkdir(archiveDir, { recursive: true });
  const parsed = path.parse(legacyDbPath);
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  for (let index = 0; index < 100; index += 1) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const candidate = path.join(archiveDir, `${parsed.name}-${stamp}${suffix}${parsed.ext || ".sqlite"}`);
    if (!existsSync(candidate)) {
      return candidate;
    }
  }
  throw new GameJourneyCompletionMetricsMigrationError(`Could not allocate archive path in ${archiveDir}.`);
}

export async function archiveLegacyCompletionMetricsSqlite({ archiveDir, legacyDbPath, now = new Date() } = {}) {
  const resolvedLegacyPath = path.resolve(legacyDbPath || DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_SQLITE_PATH);
  const resolvedArchiveDir = path.resolve(archiveDir || DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_ARCHIVE_DIR);
  if (!existsSync(resolvedLegacyPath)) {
    return {
      archived: false,
      archivePath: "",
      legacyDbPath: resolvedLegacyPath,
      message: "Legacy SQLite file was already absent.",
    };
  }
  const archivePath = await nextArchivePath({
    archiveDir: resolvedArchiveDir,
    legacyDbPath: resolvedLegacyPath,
    now,
  });
  await fs.rename(resolvedLegacyPath, archivePath);
  return {
    archived: true,
    archivePath,
    legacyDbPath: resolvedLegacyPath,
    message: `Legacy SQLite file moved to ${archivePath}.`,
  };
}

export async function migrateLegacyCompletionMetricRowsToPostgres({
  archiveDir,
  dryRun = false,
  env = process.env,
  legacyDbPath,
  now = new Date(),
  postgresClient = null,
  rows = [],
} = {}) {
  const legacyRows = rows.map(normalizeLegacyCompletionMetric);
  assertUniqueLegacyRows(legacyRows);
  const client = postgresClient || createPostgresConnectionClient({ env });
  await client.query(GAME_JOURNEY_COMPLETION_METRICS_SCHEMA_SQL);
  const existingRows = await client.requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
    method: "GET",
    query: "select=*",
  });
  const classified = classifyLegacyCompletionMetricRows({
    existingRows: Array.isArray(existingRows) ? existingRows : [],
    legacyRows,
  });
  if (classified.conflicts.length) {
    throw new GameJourneyCompletionMetricsMigrationError(
      `Game Journey completion metrics migration blocked by ${classified.conflicts.length} Postgres conflict(s). No data was moved.`,
      { conflicts: classified.conflicts },
    );
  }
  if (!dryRun && classified.inserts.length) {
    await client.requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
      body: classified.inserts,
      method: "POST",
      query: "on_conflict=key",
    });
  }
  if (!dryRun) {
    for (const patch of classified.timestampPatches) {
      await client.requestTable(GAME_JOURNEY_COMPLETION_METRICS_TABLE, {
        body: {
          createdAt: patch.createdAt,
          updatedAt: patch.updatedAt,
        },
        method: "PATCH",
        query: `bucketKey=eq.${encodeURIComponent(patch.bucketKey)}`,
      });
    }
  }
  const archive = dryRun
    ? {
      archived: false,
      archivePath: "",
      legacyDbPath: path.resolve(legacyDbPath || DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_SQLITE_PATH),
      message: "Dry run did not move the legacy SQLite file.",
    }
    : await archiveLegacyCompletionMetricsSqlite({ archiveDir, legacyDbPath, now });
  return {
    archive,
    duplicateCount: classified.duplicates.length,
    duplicates: classified.duplicates,
    insertedCount: dryRun ? 0 : classified.inserts.length,
    legacyRowCount: legacyRows.length,
    status: dryRun ? "DRY_RUN" : "PASS",
    timestampPatchCount: dryRun ? 0 : classified.timestampPatches.length,
    timestampPatches: classified.timestampPatches,
    wouldInsertCount: classified.inserts.length,
    wouldPatchTimestampCount: classified.timestampPatches.length,
  };
}

export async function migrateLegacyCompletionMetricsSqliteToPostgres({
  archiveDir,
  dryRun = false,
  env = process.env,
  legacyDbPath,
  now = new Date(),
  postgresClient = null,
  pythonCommand = "python",
} = {}) {
  const exported = await readLegacyCompletionMetricsSqlite({ legacyDbPath, pythonCommand });
  const result = await migrateLegacyCompletionMetricRowsToPostgres({
    archiveDir,
    dryRun,
    env,
    legacyDbPath: exported.legacyDbPath,
    now,
    postgresClient,
    rows: exported.rows,
  });
  return {
    ...result,
    legacyDbPath: exported.legacyDbPath,
    schemaObjectCount: exported.schema.objects.length,
  };
}
