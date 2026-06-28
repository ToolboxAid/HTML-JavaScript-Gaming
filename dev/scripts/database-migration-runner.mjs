import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createPostgresConnectionClient, databaseSslMode } from "../../api/persistence/postgres-connection-client.mjs";

const ENV_FILE = ".env";
const PREFERRED_GROUP_ORDER = Object.freeze([
  "account.sql",
  "admin.sql",
  "game-workspace.sql",
  "asset.sql",
  "objects.sql",
  "controls.sql",
  "game-design.sql",
  "game-configuration.sql",
  "game-journey.sql",
  "palette.sql",
  "tags.sql",
  "tool-metadata.sql",
  "tool-planning.sql",
  "toolbox-votes.sql",
  "support-tickets.sql",
]);

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
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
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
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return;
    }
    if (process.env[key] !== undefined) {
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

function envValue(key) {
  return String(process.env[key] || "").trim();
}

function parseDatabaseUrl() {
  const value = envValue("GAMEFOUNDRY_DATABASE_URL");
  if (!value) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL is required to apply database migrations.");
  }
  const databaseUrl = new URL(value);
  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must use postgres:// or postgresql://.");
  }
  return {
    database: decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "") || "postgres"),
    host: databaseUrl.hostname,
    password: decodeURIComponent(databaseUrl.password || ""),
    port: Number(databaseUrl.port || 5432),
    sslMode: databaseSslMode(),
    user: decodeURIComponent(databaseUrl.username || ""),
  };
}

function databaseDiagnostic(config) {
  return `host=${config.host}; port=${config.port}; database=${config.database}`;
}

function connectionModeDiagnostic(config) {
  return config.sslMode === "disable" ? "plain TCP" : "TLS";
}

function migrationOrder(fileName) {
  const index = PREFERRED_GROUP_ORDER.indexOf(fileName);
  return index === -1 ? PREFERRED_GROUP_ORDER.length : index;
}

function sqlLiteral(value) {
  return `'${String(value ?? "").replace(/'/g, "''")}'`;
}

function migrationChecksum(sql) {
  return crypto.createHash("sha256").update(sql, "utf8").digest("hex");
}

function migrationKey(migration) {
  return `${migration.type}:${migration.filePath}`;
}

function readMigrationFiles(migrationDirs) {
  return migrationDirs.flatMap(({ directory, type }) => {
    const absoluteDirectory = path.resolve(process.cwd(), directory);
    return fs.readdirSync(absoluteDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
      .sort((left, right) => migrationOrder(left.name) - migrationOrder(right.name) || left.name.localeCompare(right.name))
      .map((entry) => {
        const filePath = `${directory}/${entry.name}`;
        const sql = fs.readFileSync(path.join(absoluteDirectory, entry.name), "utf8");
        return {
          checksum: migrationChecksum(sql),
          fileName: entry.name,
          filePath,
          key: `${type}:${filePath}`,
          migrationName: entry.name,
          sql: `\n-- Begin ${filePath}\n${sql}\n-- End ${filePath}\n`,
          type,
        };
      });
  });
}

async function schemaMigrationColumns(client) {
  const rows = await client.query(`
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'schema_migrations';
`);
  return new Set(rows.map((row) => String(row.column_name || "")));
}

async function ensureSchemaMigrations(client) {
  await client.query(`
CREATE TABLE IF NOT EXISTS schema_migrations (
  key text PRIMARY KEY,
  "migrationName" text NOT NULL,
  "migrationType" text NOT NULL CHECK ("migrationType" IN ('DDL', 'DML')),
  checksum text NOT NULL,
  "appliedAt" timestamptz NOT NULL DEFAULT now(),
  "appliedBy" text NOT NULL
);
`);
  let columns = await schemaMigrationColumns(client);
  if (!columns.has("migrationName")) {
    await client.query('ALTER TABLE schema_migrations ADD COLUMN "migrationName" text;');
    columns = await schemaMigrationColumns(client);
  }
  if (columns.has("fileName")) {
    await client.query('UPDATE schema_migrations SET "migrationName" = COALESCE(NULLIF("migrationName", \'\'), "fileName") WHERE "migrationName" IS NULL OR "migrationName" = \'\';');
  }
  await client.query('UPDATE schema_migrations SET "migrationName" = key WHERE "migrationName" IS NULL OR "migrationName" = \'\';');
  await client.query('ALTER TABLE schema_migrations ALTER COLUMN "migrationName" SET NOT NULL;');
  await client.query(`
CREATE UNIQUE INDEX IF NOT EXISTS schema_migrations_name_type_idx
  ON schema_migrations ("migrationType", "migrationName");
`);
  return schemaMigrationColumns(client);
}

async function readAppliedMigrations(client) {
  const rows = await client.query('SELECT key, "migrationName", "migrationType", checksum, "appliedAt", "appliedBy" FROM schema_migrations;');
  return new Map(rows.map((row) => [row.key || migrationKey({ filePath: row.migrationName, type: row.migrationType }), row]));
}

function appliedBy() {
  return envValue("GAMEFOUNDRY_DATABASE_MIGRATION_ACTOR") ||
    envValue("USERNAME") ||
    envValue("USER") ||
    "codex";
}

async function applyMigration(client, migration, appliedMigrations, actor, schemaColumns) {
  const applied = appliedMigrations.get(migration.key);
  if (applied) {
    if (applied.checksum !== migration.checksum) {
      throw new Error(`Migration checksum changed for ${migration.filePath}. Existing checksum ${applied.checksum}; current checksum ${migration.checksum}. Create a new migration file instead of editing an applied one.`);
    }
    return "SKIP";
  }

  await client.query(migration.sql);
  const columns = ["key", "\"migrationName\"", "\"migrationType\"", "checksum", "\"appliedAt\"", "\"appliedBy\""];
  const values = [sqlLiteral(migration.key), sqlLiteral(migration.migrationName), sqlLiteral(migration.type), sqlLiteral(migration.checksum), "now()", sqlLiteral(actor)];
  if (schemaColumns.has("fileName")) {
    columns.splice(2, 0, "\"fileName\"");
    values.splice(2, 0, sqlLiteral(migration.fileName));
  }
  await client.query(`INSERT INTO schema_migrations (${columns.join(", ")}) VALUES (${values.join(", ")});`);
  appliedMigrations.set(migration.key, {
    appliedBy: actor,
    checksum: migration.checksum,
    key: migration.key,
    migrationName: migration.migrationName,
    migrationType: migration.type,
  });
  return "APPLY";
}

export async function runDatabaseMigrationLane({ laneLabel, migrationDirs }) {
  const envLoad = loadRuntimeEnv();
  if (!envLoad.loaded) {
    throw new Error(`${ENV_FILE} was not found; database migrations use the same runtime env file.`);
  }

  const config = parseDatabaseUrl();
  if (!config.user || !config.password) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must include username and password.");
  }

  const client = createPostgresConnectionClient();
  await client.query("SELECT 1 AS ok;");
  const schemaColumns = await ensureSchemaMigrations(client);

  const migrations = readMigrationFiles(migrationDirs);
  const appliedMigrations = await readAppliedMigrations(client);
  const actor = appliedBy();
  const results = [];
  for (const migration of migrations) {
    try {
      results.push({
        migration,
        status: await applyMigration(client, migration, appliedMigrations, actor, schemaColumns),
      });
    } catch (error) {
      throw new Error(`Failed applying ${migration.filePath}: ${error instanceof Error ? error.message : String(error || "Unknown database error.")}`);
    }
  }

  const appliedCount = results.filter((result) => result.status === "APPLY").length;
  const skippedCount = results.filter((result) => result.status === "SKIP").length;
  console.log(`PASS - .env loaded for ${laneLabel} apply (${envLoad.loadedKeys.length} key(s) applied)`);
  console.log(`PASS - Database connection ready (${databaseDiagnostic(config)})`);
  console.log(`PASS - Database SSL mode: ${config.sslMode}`);
  console.log(`PASS - Database connection mode selected from GAMEFOUNDRY_DATABASE_SSL: ${connectionModeDiagnostic(config)}.`);
  console.log("PASS - schema_migrations table confirmed.");
  console.log("PASS - Migration tracking fields: key, migrationName, migrationType, checksum, appliedAt, appliedBy.");
  console.log(`PASS - Database migrations processed=${results.length}; applied=${appliedCount}; skipped=${skippedCount}.`);
  results.forEach((result) => {
    console.log(`${result.status === "APPLY" ? "APPLIED" : "SKIPPED"} - ${result.migration.type} ${result.migration.filePath}`);
  });
}
