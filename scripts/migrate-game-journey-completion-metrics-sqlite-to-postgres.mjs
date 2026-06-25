import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_ARCHIVE_DIR,
  DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_SQLITE_PATH,
  migrateLegacyCompletionMetricsSqliteToPostgres,
  readLegacyCompletionMetricsSqlite,
} from "../src/dev-runtime/persistence/game-journey-completion-metrics-migration.mjs";

const ENV_FILE = ".env";

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function loadRuntimeEnv() {
  const envPath = path.resolve(process.cwd(), ENV_FILE);
  if (!fs.existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: [],
      path: envPath,
    };
  }
  const loadedKeys = [];
  fs.readFileSync(envPath, "utf8").split(/\r?\n/u).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }
    const key = normalized.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key) || process.env[key] !== undefined) {
      return;
    }
    process.env[key] = parseEnvValue(normalized.slice(separatorIndex + 1));
    loadedKeys.push(key);
  });
  return {
    loaded: true,
    loadedKeys: loadedKeys.sort(),
    path: envPath,
  };
}

function parseArgs(argv) {
  const options = {
    archiveDir: DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_ARCHIVE_DIR,
    dryRun: false,
    inspectOnly: false,
    legacyDbPath: DEFAULT_GAME_JOURNEY_COMPLETION_METRICS_SQLITE_PATH,
    pythonCommand: "python",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--inspect-only") {
      options.inspectOnly = true;
      continue;
    }
    if (arg === "--legacy-db") {
      options.legacyDbPath = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--archive-dir") {
      options.archiveDir = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--python") {
      options.pythonCommand = argv[index + 1] || "python";
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function printSummary(summary) {
  Object.entries(summary).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const envLoad = loadRuntimeEnv();
  const exported = await readLegacyCompletionMetricsSqlite({
    legacyDbPath: options.legacyDbPath,
    pythonCommand: options.pythonCommand,
  });
  printSummary({
    "Legacy SQLite": exported.legacyDbPath,
    "Schema objects": exported.schema.objects.length,
    "Valid rows": exported.rowCount,
  });
  if (options.inspectOnly) {
    console.log("PASS: inspect-only completed; no Postgres writes or file moves were attempted.");
    return;
  }
  if (!String(process.env.GAMEFOUNDRY_DATABASE_URL || "").trim()) {
    console.error("BLOCKED: GAMEFOUNDRY_DATABASE_URL is missing; migration did not run and the legacy SQLite file was not moved.");
    console.error("Run after configuring Postgres, for example:");
    console.error("  node --use-system-ca scripts/migrate-game-journey-completion-metrics-sqlite-to-postgres.mjs");
    process.exitCode = 2;
    return;
  }
  if (!String(process.env.GAMEFOUNDRY_DATABASE_SSL || "").trim()) {
    console.error("BLOCKED: GAMEFOUNDRY_DATABASE_SSL is missing; migration did not run and the legacy SQLite file was not moved.");
    console.error("Set GAMEFOUNDRY_DATABASE_SSL=disable for local Postgres or require for TLS Postgres.");
    process.exitCode = 2;
    return;
  }
  const result = await migrateLegacyCompletionMetricsSqliteToPostgres({
    archiveDir: options.archiveDir,
    dryRun: options.dryRun,
    env: process.env,
    legacyDbPath: exported.legacyDbPath,
    pythonCommand: options.pythonCommand,
  });
  printSummary({
    "Env file": envLoad.loaded ? `${envLoad.path} (${envLoad.loadedKeys.length} key(s) loaded)` : "not found",
    "Legacy rows": result.legacyRowCount,
    "Rows inserted": result.insertedCount,
    "Rows already present": result.duplicateCount,
    "Rows timestamp-patched": result.timestampPatchCount,
    "Rows that would insert": result.wouldInsertCount,
    "Rows that would patch timestamps": result.wouldPatchTimestampCount,
    "Archive": result.archive.archived ? result.archive.archivePath : result.archive.message,
    "Status": result.status,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error || "Unknown migration failure."));
  if (error?.details?.conflicts) {
    console.error(JSON.stringify({ conflicts: error.details.conflicts }, null, 2));
  }
  process.exitCode = 1;
});
