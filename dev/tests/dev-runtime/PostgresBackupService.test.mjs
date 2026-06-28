import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  DB_BACKUP_DIR_ENV,
  DB_BACKUP_STAGING_DIR_ENV,
  createPostgresBackup,
  postgresBackupFilename,
  postgresBackupObjectKey,
} from "../../../api/database/postgres-backup-service.mjs";
import {
  DB_BACKUP_PREFIX_ENV,
  DB_BACKUP_STORAGE_PROVIDER_ENV,
} from "../../../api/storage/storage-config.mjs";

const TEST_ENV = Object.freeze({
  GAMEFOUNDRY_DATABASE_SSL: "disable",
  GAMEFOUNDRY_DATABASE_URL: "postgresql://backup_user:backup_secret@127.0.0.1:5432/gamefoundry_dev",
});
const TEST_BACKUP_PREFIX = "/dev/backups/postgres/";

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function requestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function startFakeR2StorageServer(bucket = "backup-test-bucket") {
  const objects = new Map();
  const requests = [];
  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    const pathSegments = decodeURIComponent(requestUrl.pathname).split("/").filter(Boolean);
    const requestBucket = pathSegments[0] || "";
    const objectKey = `/${pathSegments.slice(1).join("/")}`;
    requests.push({
      method: request.method,
      objectKey,
      pathname: requestUrl.pathname,
      prefix: requestUrl.searchParams.get("prefix") || "",
    });
    if (requestBucket !== bucket) {
      response.statusCode = 404;
      response.end("Unknown bucket");
      return;
    }
    if (request.method === "GET" && requestUrl.searchParams.get("list-type") === "2") {
      const prefix = requestUrl.searchParams.get("prefix") || "";
      const keys = Array.from(objects.keys()).filter((key) => key.startsWith(prefix)).sort();
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/xml");
      response.end(`<ListBucketResult>${keys.map((key) => `<Contents><Key>${escapeXml(key)}</Key></Contents>`).join("")}</ListBucketResult>`);
      return;
    }
    if (request.method === "PUT") {
      objects.set(objectKey, await requestBody(request));
      response.statusCode = 200;
      response.end("");
      return;
    }
    response.statusCode = 404;
    response.end("Missing object");
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    bucket,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
    objects,
    requests,
  };
}

function createBackupStorage({ keys = [], uploadResult = null } = {}) {
  const uploads = [];
  return {
    configured: true,
    config: {
      backupPrefix: TEST_BACKUP_PREFIX,
      provider: "r2",
    },
    uploads,
    async listObjects(prefix) {
      assert.equal(prefix, TEST_BACKUP_PREFIX);
      return {
        keys,
        message: `Listed storage objects under ${prefix}.`,
        ok: true,
      };
    },
    async putObject(upload) {
      uploads.push(upload);
      return uploadResult || {
        bytesWritten: upload.bytes.length,
        message: `Uploaded ${upload.objectKey}.`,
        ok: true,
        writeResult: "Stored",
      };
    },
  };
}

test("postgresBackupFilename uses environment, Julian date, sequence, and dump extension", () => {
  assert.equal(
    postgresBackupFilename({
      environment: "DEV",
      now: new Date("2026-06-17T16:00:00.000Z"),
      sequence: 1,
    }),
    "gamefoundry-dev-db-26168-001.dump",
  );
  assert.equal(
    postgresBackupObjectKey({
      backupPrefix: TEST_BACKUP_PREFIX,
      fileName: "gamefoundry-dev-db-26168-001.dump",
    }),
    "/dev/backups/postgres/gamefoundry-dev-db-26168-001.dump",
  );
});

test("createPostgresBackup fails visibly when R2 backup storage is missing", async () => {
  const result = await createPostgresBackup({
    env: TEST_ENV,
    environment: "DEV",
    now: new Date("2026-06-17T16:00:00.000Z"),
    runProcess: async () => {
      throw new Error("pg_dump should not run without configured R2 backup storage.");
    },
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.executed, false);
  assert.equal(result.currentEnvironment, "DEV");
  assert.match(result.message, /Create Backup requires configured R2 backup storage/);
  assert.match(result.message, new RegExp(DB_BACKUP_STORAGE_PROVIDER_ENV));
  assert.match(result.message, new RegExp(DB_BACKUP_PREFIX_ENV));
});

test("createPostgresBackup fails visibly when pg_dump is unavailable", async () => {
  const result = await createPostgresBackup({
    backupStorage: createBackupStorage(),
    env: TEST_ENV,
    environment: "DEV",
    now: new Date("2026-06-17T16:00:00.000Z"),
    runProcess: async () => ({ code: "ENOENT", stderr: "not found", stdout: "" }),
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.executed, false);
  assert.equal(result.currentEnvironment, "DEV");
  assert.match(result.message, /pg_dump is unavailable/);
});

test("createPostgresBackup rejects repo tmp staging targets", async () => {
  const result = await createPostgresBackup({
    backupStorage: createBackupStorage(),
    env: {
      ...TEST_ENV,
      [DB_BACKUP_STAGING_DIR_ENV]: "tmp/postgres-backups",
    },
    environment: "DEV",
    now: new Date("2026-06-17T16:00:00.000Z"),
    repoRoot: process.cwd(),
    runProcess: async (command, args) => {
      assert.equal(command, "pg_dump");
      assert.deepEqual(args, ["--version"]);
      return { code: 0, stderr: "", stdout: "pg_dump (PostgreSQL) 16.0" };
    },
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.executed, false);
  assert.equal(result.currentEnvironment, "DEV");
  assert.match(result.message, /GAMEFOUNDRY_DB_BACKUP_STAGING_DIR must not point inside repo tmp/);
});

test("createPostgresBackup uploads pg_dump custom format to R2 and cleans temporary staging", async () => {
  const deprecatedBackupDir = await mkdtemp(path.join(os.tmpdir(), "gamefoundry-deprecated-backup-test-"));
  const storage = createBackupStorage();
  const calls = [];
  let outputPath = "";
  try {
    const result = await createPostgresBackup({
      backupStorage: storage,
      env: {
        ...TEST_ENV,
        [DB_BACKUP_DIR_ENV]: deprecatedBackupDir,
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
        outputPath = args[fileIndex + 1];
        await writeFile(outputPath, Buffer.from("PGDMP custom-format-test"));
        return { code: 0, stderr: "", stdout: "" };
      },
    });

    const dumpCall = calls.find((call) => call.args.includes("--format=custom"));
    assert.ok(dumpCall);
    assert.equal(result.status, "PASS");
    assert.equal(result.executed, true);
    assert.equal(result.currentEnvironment, "DEV");
    assert.equal(result.backup.fileName, "gamefoundry-dev-db-26168-001.dump");
    assert.equal(result.backup.environment, "DEV");
    assert.equal(result.backup.format, "custom");
    assert.equal(result.backup.r2Key, "/dev/backups/postgres/gamefoundry-dev-db-26168-001.dump");
    assert.ok(result.backup.sizeBytes > 0);
    assert.equal(result.backup.storageProvider, "r2");
    assert.equal(storage.uploads.length, 1);
    assert.equal(storage.uploads[0].contentType, "application/octet-stream");
    assert.equal(storage.uploads[0].objectKey, result.backup.r2Key);
    assert.equal(Buffer.from(storage.uploads[0].bytes).toString("utf8"), "PGDMP custom-format-test");
    assert.equal(path.dirname(outputPath).startsWith(path.resolve(process.cwd(), "tmp")), false);
    assert.equal(outputPath.startsWith(deprecatedBackupDir), false);
    assert.equal(dumpCall.command, "pg_dump");
    assert.equal(dumpCall.env.PGPASSWORD, "backup_secret");
    assert.equal(dumpCall.env.PGSSLMODE, "disable");
    assert.equal(dumpCall.args.includes("backup_secret"), false);
    assert.equal(dumpCall.args.includes("--format=custom"), true);
    assert.equal(dumpCall.args.includes("--dbname"), true);
    assert.match(result.message, /R2 key \/dev\/backups\/postgres\/gamefoundry-dev-db-26168-001\.dump/);
    assert.match(result.message, /GAMEFOUNDRY_DB_BACKUP_DIR is deprecated/);
    assert.match(result.message, /2026-06-17T16:00:00\.000Z/);
    await assert.rejects(() => stat(outputPath), /ENOENT/);
    await assert.rejects(() => stat(path.dirname(outputPath)), /ENOENT/);
    assert.deepEqual(await readdir(deprecatedBackupDir), []);
  } finally {
    await rm(deprecatedBackupDir, { force: true, recursive: true });
  }
});

test("createPostgresBackup reports R2 upload failure with key metadata and cleans staging", async () => {
  const storage = createBackupStorage({
    uploadResult: {
      bytesWritten: 0,
      message: "Storage upload failed with HTTP 500.",
      ok: false,
      writeResult: "FAIL: Storage upload",
    },
  });
  let outputPath = "";
  const result = await createPostgresBackup({
    backupStorage: storage,
    env: TEST_ENV,
    environment: "DEV",
    now: new Date("2026-06-17T16:00:00.000Z"),
    runProcess: async (command, args) => {
      if (args.includes("--version")) {
        return { code: 0, stderr: "", stdout: "pg_dump (PostgreSQL) 16.0" };
      }
      const fileIndex = args.indexOf("--file");
      outputPath = args[fileIndex + 1];
      await writeFile(outputPath, Buffer.from("PGDMP custom-format-test"));
      return { code: 0, stderr: "", stdout: "" };
    },
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.executed, false);
  assert.equal(result.currentEnvironment, "DEV");
  assert.equal(result.backup.fileName, "gamefoundry-dev-db-26168-001.dump");
  assert.equal(result.backup.r2Key, "/dev/backups/postgres/gamefoundry-dev-db-26168-001.dump");
  assert.equal(result.backup.storageProvider, "r2");
  assert.match(result.message, /R2 upload did not complete/);
  assert.match(result.message, /Storage upload failed with HTTP 500/);
  await assert.rejects(() => stat(outputPath), /ENOENT/);
  await assert.rejects(() => stat(path.dirname(outputPath)), /ENOENT/);
});

test("createPostgresBackup uploads backup artifact through configured R2 provider", async () => {
  const storageServer = await startFakeR2StorageServer();
  try {
    const result = await createPostgresBackup({
      env: {
        ...TEST_ENV,
        GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID: "backup-test-access-key",
        GAMEFOUNDRY_STORAGE_BUCKET: storageServer.bucket,
        GAMEFOUNDRY_STORAGE_ENDPOINT: storageServer.baseUrl,
        GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY: "backup-test-secret-key",
        [DB_BACKUP_PREFIX_ENV]: TEST_BACKUP_PREFIX,
        [DB_BACKUP_STORAGE_PROVIDER_ENV]: "r2",
      },
      environment: "DEV",
      now: new Date("2026-06-17T16:00:00.000Z"),
      runProcess: async (command, args) => {
        if (args.includes("--version")) {
          return { code: 0, stderr: "", stdout: "pg_dump (PostgreSQL) 16.0" };
        }
        const fileIndex = args.indexOf("--file");
        await writeFile(args[fileIndex + 1], Buffer.from("PGDMP configured-r2-upload-test"));
        return { code: 0, stderr: "", stdout: "" };
      },
    });

    assert.equal(result.status, "PASS");
    assert.equal(result.backup.r2Key, "/dev/backups/postgres/gamefoundry-dev-db-26168-001.dump");
    assert.equal(storageServer.objects.get(result.backup.r2Key).toString("utf8"), "PGDMP configured-r2-upload-test");
    assert.equal(storageServer.requests.some((request) => request.method === "GET" && request.prefix === TEST_BACKUP_PREFIX), true);
    assert.equal(storageServer.requests.some((request) => request.method === "PUT" && request.objectKey === result.backup.r2Key), true);
    assert.doesNotMatch(result.message, /backup-test-secret-key|backup-test-access-key/);
  } finally {
    await storageServer.close();
  }
});
