import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { createConfiguredBackupStorage } from "../storage/r2-project-asset-storage.mjs";
import { DB_BACKUP_PREFIX_ENV, DB_BACKUP_STORAGE_PROVIDER_ENV } from "../storage/storage-config.mjs";

export const DB_BACKUP_DIR_ENV = "GAMEFOUNDRY_DB_BACKUP_DIR";
export const DB_BACKUP_STAGING_DIR_ENV = "GAMEFOUNDRY_DB_BACKUP_STAGING_DIR";
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

function resolveBackupStagingRoot(env = process.env, repoRoot = process.cwd()) {
  const configured = String(env[DB_BACKUP_STAGING_DIR_ENV] || "").trim();
  const stagingRoot = path.resolve(configured ? configured : os.tmpdir());
  const repoTmp = path.resolve(repoRoot, "tmp");
  if (pathIsInside(repoTmp, stagingRoot)) {
    throw new Error(`${DB_BACKUP_STAGING_DIR_ENV} must not point inside repo tmp/. Configure temporary server-side staging outside tmp/.`);
  }
  return stagingRoot;
}

function deprecatedBackupDirectoryMessage(env = process.env) {
  const configured = String(env[DB_BACKUP_DIR_ENV] || "").trim();
  if (!configured) {
    return "";
  }
  return `${DB_BACKUP_DIR_ENV} is deprecated for final backup storage and was not used.`;
}

export function postgresBackupFilename({ environment = "unknown", now = new Date(), sequence = 1 } = {}) {
  return `gamefoundry-${safeEnvironmentName(environment)}-db-${julianCode(now)}-${String(sequence).padStart(3, "0")}.dump`;
}

function storageMissingMessage(backupStorage) {
  if (backupStorage?.config?.missingKeys?.length) {
    return `Missing or empty: ${backupStorage.config.missingKeys.join(", ")}.`;
  }
  if (backupStorage?.config?.validationError) {
    return backupStorage.config.validationError;
  }
  return `Configure ${DB_BACKUP_STORAGE_PROVIDER_ENV}=r2 and ${DB_BACKUP_PREFIX_ENV} before running Create Backup.`;
}

function assertBackupStorage(backupStorage) {
  if (!backupStorage?.configured || typeof backupStorage.putObject !== "function") {
    throw new Error(`Create Backup requires configured R2 backup storage. ${storageMissingMessage(backupStorage)}`);
  }
  const backupPrefix = String(backupStorage.config?.backupPrefix || "").trim();
  if (!backupPrefix) {
    throw new Error(`Create Backup requires ${DB_BACKUP_PREFIX_ENV} before running pg_dump.`);
  }
  return {
    backupPrefix,
    storageProvider: String(backupStorage.config?.provider || "r2").trim() || "r2",
  };
}

export function postgresBackupObjectKey({ backupPrefix, fileName } = {}) {
  const normalizedPrefix = String(backupPrefix || "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return `/${normalizedPrefix}/${String(fileName || "").trim()}`.replace(/\/{2,}/g, "/");
}

async function nextBackupSequence(backupStorage, backupPrefix, environment, now) {
  const prefix = `gamefoundry-${safeEnvironmentName(environment)}-db-${julianCode(now)}-`;
  const listed = typeof backupStorage.listObjects === "function"
    ? await backupStorage.listObjects(backupPrefix)
    : { keys: [] };
  if (listed.ok === false) {
    throw new Error(`Create Backup failed: R2 backup prefix could not be listed. ${listed.message || "Verify storage list permissions and backup prefix."}`);
  }
  const names = (Array.isArray(listed.keys) ? listed.keys : [])
    .map((key) => path.posix.basename(String(key || "")));
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

async function assertBackupStagingRoot(stagingRoot) {
  const details = await stat(stagingRoot);
  if (!details.isDirectory()) {
    throw new Error(`${DB_BACKUP_STAGING_DIR_ENV} must point to an existing temporary server-side staging directory.`);
  }
}

async function createBackupStagingDirectory(env, repoRoot) {
  const stagingRoot = resolveBackupStagingRoot(env, repoRoot);
  await assertBackupStagingRoot(stagingRoot);
  return mkdtemp(path.join(stagingRoot, "gamefoundry-postgres-backup-"));
}

async function removePartialBackup(outputPath) {
  try {
    await unlink(outputPath);
  } catch {
    // Partial cleanup is best-effort after pg_dump failure.
  }
}

async function removeStagingDirectory(stagingDirectory) {
  if (!stagingDirectory) {
    return;
  }
  await rm(stagingDirectory, { force: true, recursive: true });
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
  backupStorage = null,
  env = process.env,
  environment = "UNKNOWN",
  now = new Date(),
  repoRoot = process.cwd(),
  runProcess = spawnProcess,
} = {}) {
  let stagingDirectory = "";
  let outputPath = "";
  try {
    const config = parseDatabaseConfig(env);
    const storage = backupStorage || createConfiguredBackupStorage(env);
    const storageConfig = assertBackupStorage(storage);
    const version = await runProcess("pg_dump", ["--version"], { env: pgDumpEnvironment(config) });
    if (version.code === "ENOENT") {
      return failure("Create Backup failed: pg_dump is unavailable. Install PostgreSQL client tools on the Local API host and ensure pg_dump is on PATH.", {
        currentEnvironment: environment,
      });
    }
    if (version.code !== 0) {
      return failure("Create Backup failed: pg_dump --version did not complete. Verify PostgreSQL client tools are installed on the Local API host.", {
        currentEnvironment: environment,
      });
    }

    const sequence = await nextBackupSequence(storage, storageConfig.backupPrefix, environment, now);
    const fileName = postgresBackupFilename({ environment, now, sequence });
    const r2Key = postgresBackupObjectKey({ backupPrefix: storageConfig.backupPrefix, fileName });
    stagingDirectory = await createBackupStagingDirectory(env, repoRoot);
    outputPath = path.join(stagingDirectory, fileName);
    const dump = await runProcess("pg_dump", pgDumpArgs(config, outputPath), {
      env: pgDumpEnvironment(config),
    });
    if (dump.code !== 0) {
      await removePartialBackup(outputPath);
      return failure("Create Backup failed: pg_dump did not complete. Verify database connectivity, credentials, SSL mode, and backup directory permissions.", {
        currentEnvironment: environment,
        fileName,
        r2Key,
      });
    }

    const output = await stat(outputPath);
    if (!output.isFile() || output.size <= 0) {
      await removePartialBackup(outputPath);
      return failure("Create Backup failed: pg_dump produced an empty or invalid backup artifact.", {
        currentEnvironment: environment,
        fileName,
        r2Key,
      });
    }

    const createdAt = now.toISOString();
    const upload = await storage.putObject({
      bytes: await readFile(outputPath),
      contentType: "application/octet-stream",
      objectKey: r2Key,
    });
    if (!upload.ok) {
      return failure(`Create Backup failed: R2 upload did not complete for ${r2Key}. ${upload.message || "Verify endpoint, bucket, credentials, and backup prefix."}`, {
        backup: {
          createdAt,
          fileName,
          format: POSTGRES_BACKUP_FORMAT,
          r2Key,
          sizeBytes: output.size,
          storageProvider: storageConfig.storageProvider,
        },
        currentEnvironment: environment,
      });
    }

    await removeStagingDirectory(stagingDirectory);
    stagingDirectory = "";
    return {
      actionId: "create-backup",
      actionLabel: "Create Backup",
      backup: {
        createdAt,
        environment,
        fileName,
        format: POSTGRES_BACKUP_FORMAT,
        r2Key,
        sizeBytes: output.size,
        storageProvider: storageConfig.storageProvider,
      },
      currentEnvironment: environment,
      executed: true,
      message: `Create Backup uploaded ${fileName} to R2 key ${r2Key} for ${environment} at ${createdAt}; size ${output.size} bytes. ${deprecatedBackupDirectoryMessage(env)}`.trim(),
      secretEditingAllowed: false,
      secretsExposed: false,
      status: "PASS",
    };
  } catch (error) {
    return failure(error instanceof Error ? error.message : String(error || "Create Backup failed."), {
      currentEnvironment: environment,
    });
  } finally {
    await removeStagingDirectory(stagingDirectory);
  }
}
