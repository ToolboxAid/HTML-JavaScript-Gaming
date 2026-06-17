import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  DB_BACKUP_DIR_ENV,
  createPostgresBackup,
  postgresBackupFilename,
} from "../../src/dev-runtime/database/postgres-backup-service.mjs";

const TEST_ENV = Object.freeze({
  GAMEFOUNDRY_DATABASE_SSL: "disable",
  GAMEFOUNDRY_DATABASE_URL: "postgresql://backup_user:backup_secret@127.0.0.1:5432/gamefoundry_dev",
});

test("postgresBackupFilename uses environment, Julian date, sequence, and dump extension", () => {
  assert.equal(
    postgresBackupFilename({
      environment: "DEV",
      now: new Date("2026-06-17T16:00:00.000Z"),
      sequence: 1,
    }),
    "gamefoundry-dev-db-26168-001.dump",
  );
});

test("createPostgresBackup fails visibly when backup directory is missing", async () => {
  const result = await createPostgresBackup({
    env: TEST_ENV,
    environment: "DEV",
    now: new Date("2026-06-17T16:00:00.000Z"),
    runProcess: async () => {
      throw new Error("pg_dump should not run without a backup directory.");
    },
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.executed, false);
  assert.match(result.message, /GAMEFOUNDRY_DB_BACKUP_DIR is missing/);
});

test("createPostgresBackup fails visibly when pg_dump is unavailable", async () => {
  const backupDir = await mkdtemp(path.join(os.tmpdir(), "gamefoundry-backup-test-"));
  try {
    const result = await createPostgresBackup({
      env: {
        ...TEST_ENV,
        [DB_BACKUP_DIR_ENV]: backupDir,
      },
      environment: "DEV",
      now: new Date("2026-06-17T16:00:00.000Z"),
      runProcess: async () => ({ code: "ENOENT", stderr: "not found", stdout: "" }),
    });

    assert.equal(result.status, "FAIL");
    assert.equal(result.executed, false);
    assert.match(result.message, /pg_dump is unavailable/);
  } finally {
    await rm(backupDir, { force: true, recursive: true });
  }
});

test("createPostgresBackup rejects repo tmp backup targets", async () => {
  const result = await createPostgresBackup({
    env: {
      ...TEST_ENV,
      [DB_BACKUP_DIR_ENV]: "tmp/postgres-backups",
    },
    environment: "DEV",
    now: new Date("2026-06-17T16:00:00.000Z"),
    repoRoot: process.cwd(),
    runProcess: async () => {
      throw new Error("pg_dump should not run for repo tmp backup targets.");
    },
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.executed, false);
  assert.match(result.message, /must not point inside repo tmp/);
});

test("createPostgresBackup runs pg_dump custom format to configured server-side folder", async () => {
  const backupDir = await mkdtemp(path.join(os.tmpdir(), "gamefoundry-backup-test-"));
  const calls = [];
  try {
    const result = await createPostgresBackup({
      env: {
        ...TEST_ENV,
        [DB_BACKUP_DIR_ENV]: backupDir,
      },
      environment: "DEV",
      now: new Date("2026-06-17T16:00:00.000Z"),
      runProcess: async (command, args, options = {}) => {
        calls.push({ args, command, env: options.env || {} });
        if (args.includes("--version")) {
          return { code: 0, stderr: "", stdout: "pg_dump (PostgreSQL) 16.0" };
        }
        const fileIndex = args.indexOf("--file");
        assert.notEqual(fileIndex, -1);
        await writeFile(args[fileIndex + 1], Buffer.from("PGDMP custom-format-test"));
        return { code: 0, stderr: "", stdout: "" };
      },
    });

    const dumpCall = calls.find((call) => call.args.includes("--format=custom"));
    assert.ok(dumpCall);
    assert.equal(result.status, "PASS");
    assert.equal(result.executed, true);
    assert.equal(result.backup.fileName, "gamefoundry-dev-db-26168-001.dump");
    assert.equal(result.backup.format, "custom");
    assert.ok(result.backup.sizeBytes > 0);
    assert.equal(dumpCall.command, "pg_dump");
    assert.equal(dumpCall.env.PGPASSWORD, "backup_secret");
    assert.equal(dumpCall.env.PGSSLMODE, "disable");
    assert.equal(dumpCall.args.includes("backup_secret"), false);
    assert.equal(dumpCall.args.includes("--format=custom"), true);
    assert.equal(dumpCall.args.includes("--dbname"), true);
    assert.match(result.message, /gamefoundry-dev-db-26168-001\.dump/);
  } finally {
    await rm(backupDir, { force: true, recursive: true });
  }
});
