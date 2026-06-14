import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import assert from "node:assert/strict";
import { createMockApiRouter } from "../../src/dev-runtime/server/mock-api-router.mjs";
import { MOCK_DB_KEYS } from "../../src/dev-runtime/persistence/mock-db-store.js";

const GUEST_SEED_GROUP_KEYS = [
  "asset",
  "controls",
  "game-configuration",
  "game-design",
  "game-journey",
  "game-workspace",
  "objects",
  "palette",
  "tags",
];

function startApiServer() {
  const handleRequest = createMockApiRouter();
  const server = http.createServer((request, response) => {
    const address = server.address();
    const port = address && typeof address !== "string" ? address.port : 0;
    const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    handleRequest(request, response, requestUrl).catch((error) => {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error || "Seed integrity test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start seed integrity API server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
      });
    });
  });
}

async function apiJson(baseUrl, pathName, options = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    headers: options.body ? { "content-type": "application/json" } : undefined,
    ...options,
  });
  const payload = await response.json();
  assert.equal(payload.ok, true, `${pathName} should return ok`);
  return payload.data;
}

function assertRuntimeTimestamps(rows) {
  rows.forEach((row) => {
    const createdAtMs = Date.parse(row.createdAt);
    const updatedAtMs = Date.parse(row.updatedAt);
    assert.equal(Number.isFinite(createdAtMs), true, `${row.key}.createdAt should parse`);
    assert.equal(Number.isFinite(updatedAtMs), true, `${row.key}.updatedAt should parse`);
    assert.equal(row.createdAt.startsWith("2026-06-06T09"), false, `${row.key}.createdAt should not use old hardcoded seed timestamp`);
    assert.equal(row.updatedAt.startsWith("2026-06-06T09"), false, `${row.key}.updatedAt should not use old hardcoded seed timestamp`);
    assert.ok(createdAtMs > Date.now() - 10 * 60_000, `${row.key}.createdAt should be runtime-generated`);
    assert.ok(createdAtMs < Date.now() + 2 * 60 * 60_000, `${row.key}.createdAt should stay near runtime seed creation`);
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sampleByKey(snapshot, sampleKey) {
  const sample = (snapshot.tables.tool_state_samples || []).find((row) => row.key === sampleKey);
  assert.ok(sample, `tool_state_samples should include ${sampleKey}`);
  return sample;
}

async function replaceSampleLabel(baseUrl, sampleKey, sampleLabel) {
  const snapshot = await apiJson(baseUrl, "/api/mock-db/snapshot");
  const nextState = clone(snapshot);
  const sample = sampleByKey(nextState, sampleKey);
  sample.sampleLabel = sampleLabel;
  await apiJson(baseUrl, "/api/dev/testing/mock-db-state", {
    body: JSON.stringify({ state: nextState }),
    method: "POST",
  });
}

test("server Local DB seed includes runtime timestamps, read-only guest packages, and unique user-owned samples", async () => {
  const previousLocalDbPath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  const localDbPath = path.join(process.cwd(), "tmp", "local-db", `db-seed-integrity-${process.pid}.sqlite`);
  process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbPath;
  const server = await startApiServer();
  try {
    await apiJson(server.baseUrl, "/api/session/mode", {
      body: JSON.stringify({ modeId: "local-db" }),
      method: "POST",
    });
    const snapshot = await apiJson(server.baseUrl, "/api/mock-db/snapshot");
    const guestSeed = await apiJson(server.baseUrl, "/api/guest/seed");
    const samples = snapshot.tables.tool_state_samples || [];
    const userSamples = samples.filter((sample) => sample.audience === "user");
    const guestToolKeys = [...new Set((guestSeed.packages || []).map((sample) => sample.toolKey))].sort();

    assert.deepEqual(guestToolKeys, GUEST_SEED_GROUP_KEYS, "guest seed data should include every required grouped seed file");
    assert.equal(guestSeed.readOnly, true);
    assert.equal(guestSeed.source, "docs_build/database/seed/guest/");
    assert.equal((guestSeed.packages || []).every((sample) => sample.loadablePath && sample.sampleKind === "toolSeed"), true);
    assert.equal((guestSeed.packages || []).every((sample) => sample.readOnly === true && sample.writableByGuest === false), true);
    assert.equal(samples.some((sample) => sample.audience === "guest"), false);
    assert.deepEqual(userSamples.map((sample) => sample.userKey).sort(), [
      MOCK_DB_KEYS.users.admin,
      MOCK_DB_KEYS.users.user1,
      MOCK_DB_KEYS.users.user2,
      MOCK_DB_KEYS.users.user3,
    ].sort());
    assert.equal(new Set(userSamples.map((sample) => sample.gameKey)).size, userSamples.length);
    assert.equal(new Set(userSamples.map((sample) => sample.toolStateKey)).size, userSamples.length);
    assert.equal((guestSeed.packages || []).every((sample) => sample.createdBy === MOCK_DB_KEYS.users.forgeBot), true);
    assert.equal(userSamples.every((sample) => sample.createdBy === sample.userKey), true);
    assertRuntimeTimestamps(samples);
    assert.equal((snapshot.tables.users || []).some((user) => user.displayName === "Guest"), false);
  } finally {
    await server.close();
    await fs.rm(localDbPath, { force: true });
    if (previousLocalDbPath) {
      process.env.GAMEFOUNDRY_LOCAL_DB_PATH = previousLocalDbPath;
    } else {
      delete process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
    }
  }
});

test("server reseed targets Local DB and rejects retired Local Mem mode", async () => {
  const previousLocalDbPath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  const localDbPath = path.join(process.cwd(), "tmp", "local-db", `db-reseed-integrity-${process.pid}.sqlite`);
  process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbPath;
  const server = await startApiServer();
  try {
    await apiJson(server.baseUrl, "/api/session/mode", {
      body: JSON.stringify({ modeId: "local-db" }),
      method: "POST",
    });
    const localDbInitial = await apiJson(server.baseUrl, "/api/mock-db/snapshot");
    const sampleKey = (localDbInitial.tables.tool_state_samples || [])[0]?.key;
    assert.ok(sampleKey, "Local DB seed should include a tool_state_samples row");
    const originalLabel = sampleByKey(localDbInitial, sampleKey).sampleLabel;

    await replaceSampleLabel(server.baseUrl, sampleKey, "Local DB mutated before reseed");
    let localDbSnapshot = await apiJson(server.baseUrl, "/api/mock-db/snapshot");
    assert.equal(sampleByKey(localDbSnapshot, sampleKey).sampleLabel, "Local DB mutated before reseed");

    await apiJson(server.baseUrl, "/api/mock-db/seed", { method: "POST" });
    const localDbReseeded = await apiJson(server.baseUrl, "/api/mock-db/snapshot");
    assert.equal(sampleByKey(localDbReseeded, sampleKey).sampleLabel, originalLabel);
    assertRuntimeTimestamps(localDbReseeded.tables.tool_state_samples || []);

    const retiredModeResponse = await fetch(`${server.baseUrl}/api/session/mode`, {
      body: JSON.stringify({ modeId: "local-mem" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const retiredModePayload = await retiredModeResponse.json();
    assert.equal(retiredModeResponse.status, 500);
    assert.equal(retiredModePayload.ok, false);
    assert.match(retiredModePayload.error, /Unknown local login environment: local-mem/);

    localDbSnapshot = await apiJson(server.baseUrl, "/api/mock-db/snapshot");
    assert.equal(sampleByKey(localDbSnapshot, sampleKey).sampleLabel, originalLabel);
  } finally {
    await server.close();
    await fs.rm(localDbPath, { force: true });
    if (previousLocalDbPath) {
      process.env.GAMEFOUNDRY_LOCAL_DB_PATH = previousLocalDbPath;
    } else {
      delete process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
    }
  }
});
