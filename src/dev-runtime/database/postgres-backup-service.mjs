import { spawn } from "node:child_process";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export const DB_BACKUP_DIR_ENV = "GAMEFOUNDRY_DB_BACKUP_DIR";
export const POSTGRES_BACKUP_FORMAT = "custom";

const DATABASE_SSL_MODES = new Set(["disable", "require"]);
const DATABASE_PROTOCOLS = new Set(["postgres:", "postgresql:"]);

function julianCode(now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000);
  return `${String(now.getUTCFullYear()).slice(-2)}${String(day).padStart(3, "0")}`;
}

function safeEnvironmentName(environment) {
  const normalized = String(environment || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "unknown";
}

function pathIsInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function parseDatabaseConfig(env = process.env) {
  const rawUrl = String(env.GAMEFOUNDRY_DATABASE_URL || "").trim();
  if (!rawUrl) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL is required before Create Backup can run pg_dump.");
  }
  const databaseUrl = new URL(rawUrl);
  if (!DATABASE_PROTOCOLS.has(databaseUrl.protocol)) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must use postgres:// or postgresql:// before Create Backup can run pg_dump.");
  }
  const sslMode = String(env.GAMEFOUNDRY_DATABASE_SSL || "").trim().toLowerCase();
  if (!DATABASE_SSL_MODES.has(sslMode)) {
    throw new Error("GAMEFOUNDRY_DATABASE_SSL must be disable or require before Create Backup can run pg_dump.");
  }
  const user = decodeURIComponent(databaseUrl.username || "");
  const password = decodeURIComponent(databaseUrl.password || "");
  const database = decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "") || "");
  if (!database || !user || !password) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must include database name, username, and password before Create Backup can run pg_dump.");
  }
  return {
    database,
    host: databaseUrl.hostname,
    password,
    port: String(databaseUrl.port || 5432),
    sslMode,
    user,
  };
}

function resolveBackupDirectory(env = process.env, repoRoot = process.cwd()) {
  const configured = String(env[DB_BACKUP_DIR_ENV] || "").trim();
  if (!configured) {
    throw new Error(`${DB_BACKUP_DIR_ENV} is missing. Configure a server-side backup folder outside repo tmp/ before running Create Backup.`);
  }
  const backupDirectory = path.resolve(repoRoot, configured);
  const repoTmp = path.resolve(repoRoot, "tmp");
  if (pathIsInside(repoTmp, backupDirectory)) {
    throw new Error(`${DB_BACKUP_DIR_ENV} must not point inside repo tmp/. Configure a server-side backup folder outside tmp/.`);
  }
  return backupDirectory;
}

export function postgresBackupFilename({ environment = "unknown", now = new Date(), sequence = 1 } = {}) {
  return `gamefoundry-${safeEnvironmentName(environment)}-db-${julianCode(now)}-${String(sequence).padStart(3, "0")}.dump`;
}

async function nextBackupSequence(backupDirectory, environment, now) {
  const prefix = `gamefoundry-${safeEnvironmentName(environment)}-db-${julianCode(now)}-`;
  const names = await readdir(backupDirectory);
  const sequences = names
    .map((name) => {
      const match = name.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\d{3})\\.dump$`));
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => Number.isInteger(value) && value > 0);
  return sequences.length ? Math.max(...sequences) + 1 : 1;
}

function spawnProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      ...options,
      windowsHide: true,
    });
    const stdout = [];
    const stderr = [];
    child.stdout?.on("data", (chunk) => stdout.push(chunk));
    child.stderr?.on("data", (chunk) => stderr.push(chunk));
    child.once("error", (error) => {
      resolve({
        code: error?.code === "ENOENT" ? "ENOENT" : 1,
        stderr: error instanceof Error ? error.message : String(error || "Process failed to start."),
        stdout: "",
      });
    });
    child.once("close", (code) => {
      resolve({
        code: Number(code || 0),
        stderr: Buffer.concat(stderr).toString("utf8"),
        stdout: Buffer.concat(stdout).toString("utf8"),
      });
    });
  });
}

async function assertBackupDirectory(backupDirectory) {
  const details = await stat(backupDirectory);
  if (!details.isDirectory()) {
    throw new Error(`${DB_BACKUP_DIR_ENV} must point to an existing server-side directory.`);
  }
}

async function removePartialBackup(outputPath) {
  try {
    await unlink(outputPath);
  } catch {
    // Partial cleanup is best-effort after pg_dump failure.
  }
}

function pgDumpArgs(config, outputPath) {
  return [
    "--format=custom",
    "--no-password",
    "--file",
    outputPath,
    "--host",
    config.host,
    "--port",
    config.port,
    "--username",
    config.user,
    "--dbname",
    config.database,
  ];
}

function pgDumpEnvironment(config, baseEnv = process.env) {
  return {
    ...baseEnv,
    PGCONNECT_TIMEOUT: "15",
    PGPASSWORD: config.password,
    PGSSLMODE: config.sslMode,
  };
}

function failure(message, details = {}) {
  return {
    ...details,
    actionId: "create-backup",
    actionLabel: "Create Backup",
    executed: false,
    message,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: "FAIL",
  };
}

export async function createPostgresBackup({
  env = process.env,
  environment = "UNKNOWN",
  now = new Date(),
  repoRoot = process.cwd(),
  runProcess = spawnProcess,
} = {}) {
  try {
    const config = parseDatabaseConfig(env);
    const backupDirectory = resolveBackupDirectory(env, repoRoot);
    await assertBackupDirectory(backupDirectory);
    const version = await runProcess("pg_dump", ["--version"], { env: pgDumpEnvironment(config) });
    if (version.code === "ENOENT") {
      return failure("Create Backup failed: pg_dump is unavailable. Install PostgreSQL client tools on the Local API host and ensure pg_dump is on PATH.");
    }
    if (version.code !== 0) {
      return failure("Create Backup failed: pg_dump --version did not complete. Verify PostgreSQL client tools are installed on the Local API host.");
    }

    const sequence = await nextBackupSequence(backupDirectory, environment, now);
    const fileName = postgresBackupFilename({ environment, now, sequence });
    const outputPath = path.join(backupDirectory, fileName);
    const dump = await runProcess("pg_dump", pgDumpArgs(config, outputPath), {
      env: pgDumpEnvironment(config),
    });
    if (dump.code !== 0) {
      await removePartialBackup(outputPath);
      return failure("Create Backup failed: pg_dump did not complete. Verify database connectivity, credentials, SSL mode, and backup directory permissions.", {
        currentEnvironment: environment,
        fileName,
      });
    }

    const output = await stat(outputPath);
    if (!output.isFile() || output.size <= 0) {
      await removePartialBackup(outputPath);
      return failure("Create Backup failed: pg_dump produced an empty or invalid backup artifact.", {
        currentEnvironment: environment,
        fileName,
      });
    }

    const createdAt = now.toISOString();
    return {
      actionId: "create-backup",
      actionLabel: "Create Backup",
      backup: {
        createdAt,
        fileName,
        format: POSTGRES_BACKUP_FORMAT,
        sizeBytes: output.size,
      },
      currentEnvironment: environment,
      executed: true,
      message: `Create Backup wrote ${fileName} for ${environment} with pg_dump custom format at ${createdAt}; size ${output.size} bytes.`,
      secretEditingAllowed: false,
      secretsExposed: false,
      status: "PASS",
    };
  } catch (error) {
    return failure(error instanceof Error ? error.message : String(error || "Create Backup failed."));
  }
}
