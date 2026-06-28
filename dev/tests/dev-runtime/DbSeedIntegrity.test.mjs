import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { MOCK_DB_KEYS } from "../../../api/persistence/mock-db-store.js";
import { getActiveToolRegistry } from "../../../api/guest-seeds/tool-metadata-inventory.js";
import { createMessagesPostgresClientStub } from "../helpers/messagesPostgresClientStub.mjs";

const GUEST_SEED_GROUP_KEYS = getActiveToolRegistry()
  .filter((tool) => tool.visibleInToolsList !== false && tool.hidden !== true)
  .map((tool) => tool.id || tool.key || tool.slug || tool.name)
  .sort();

function startApiServer(routerOptions = {}) {
  const handleRequest = createLocalApiRouter(routerOptions);
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
        close: async () => {
          await handleRequest.close?.();
          await new Promise((closeResolve) => server.close(closeResolve));
        },
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

test("Messages Local API seeds through the Postgres service and preserves response shapes", async () => {
  const server = await startApiServer({ messagesPostgresClient: createMessagesPostgresClientStub() });
  try {
    const categories = await apiJson(server.baseUrl, "/api/messages/categories");
    assert.equal(categories.persistence.engine, "Postgres");
    assert.equal(categories.persistence.owner, "messages");
    assert.equal(categories.persistence.storage, "server-owned");
    assert.equal(categories.categories.some((category) => category.name === "Dialog"), true);

    const emotionProfiles = await apiJson(server.baseUrl, "/api/messages/emotion-profiles");
    const urgent = emotionProfiles.emotionProfiles.find((profile) => profile.name === "Urgent");
    assert.ok(urgent, "Messages emotion profiles should include Urgent");
    assert.equal(emotionProfiles.emotionProfiles.some((profile) => profile.name === "Neutral"), false);
    assert.equal(emotionProfiles.emotionProfiles.some((profile) => profile.name === "Robot"), false);

    const ttsProfiles = await apiJson(server.baseUrl, "/api/messages/tts-profiles");
    assert.deepEqual(ttsProfiles.ttsProfiles.map((profile) => profile.name), []);

    await apiJson(server.baseUrl, "/api/session/user", {
      body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.user1 }),
      method: "POST",
    });
    const createdProfile = await apiJson(server.baseUrl, "/api/messages/tts-profiles", {
      body: JSON.stringify({
        emotionSettings: [{
          emotion: "urgent",
          emotionLabel: "Urgent",
          pitch: 1.08,
          rate: 1.15,
          volume: 1,
        }],
        language: "en-US",
        name: "Seed Integrity Test Profile",
        pitch: 1,
        providerKey: "browser-speech",
        rate: 1,
        voiceName: "Default browser voice",
        volume: 1,
      }),
      method: "POST",
    });
    assert.equal(createdProfile.ttsProfile.name, "Seed Integrity Test Profile");
    assert.deepEqual(createdProfile.ttsProfile.emotionSettings.map((setting) => setting.emotionLabel), ["Urgent"]);

    const created = await apiJson(server.baseUrl, "/api/messages/messages", {
      body: JSON.stringify({
        emotionProfileKey: urgent.key,
        messageText: "Postgres-backed message text.",
        name: "Postgres Cutover Message",
        voiceProfileKey: createdProfile.ttsProfile.key,
      }),
      method: "POST",
    });
    assert.equal(created.persistence.engine, "Postgres");
    assert.equal(created.message.categoryName, "Dialog");
    assert.equal(created.message.emotionProfileName, "Urgent");
    assert.equal(created.message.messageText, "Postgres-backed message text.");
    assert.equal(created.message.voiceProfileName, "Seed Integrity Test Profile");

    const segment = await apiJson(server.baseUrl, "/api/messages/segments", {
      body: JSON.stringify({
        displayOrder: 1,
        emotionProfileKey: urgent.key,
        messageKey: created.message.key,
        segmentText: "Postgres-backed message part.",
        voiceProfileKey: createdProfile.ttsProfile.key,
      }),
      method: "POST",
    });
    assert.equal(segment.segment.messageName, "Postgres Cutover Message");
    assert.equal(segment.segment.emotionProfileName, "Urgent");
    assert.equal(segment.segment.voiceProfileName, "Seed Integrity Test Profile");

    const list = await apiJson(server.baseUrl, "/api/messages/messages");
    const listed = list.messages.find((message) => message.key === created.message.key);
    assert.equal(listed.name, "Postgres Cutover Message");
    assert.equal(listed.categoryName, "Dialog");
  } finally {
    await server.close();
  }
});

async function replaceSampleLabel(baseUrl, sampleKey, sampleLabel) {
  const snapshot = await apiJson(baseUrl, "/api/local-db/snapshot");
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
  const localDbPath = path.join(process.cwd(), "dev", "workspace", "tmp", "local-db", `db-seed-integrity-${process.pid}.local-db-state`);
  process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbPath;
  const server = await startApiServer();
  try {
    await apiJson(server.baseUrl, "/api/session/mode", {
      body: JSON.stringify({ modeId: "local-db" }),
      method: "POST",
    });
    const snapshot = await apiJson(server.baseUrl, "/api/local-db/snapshot");
    const guestSeed = await apiJson(server.baseUrl, "/api/guest/seed");
    const samples = snapshot.tables.tool_state_samples || [];
    const userSamples = samples.filter((sample) => sample.audience === "user");
    const guestToolKeys = [...new Set((guestSeed.packages || []).map((sample) => sample.toolKey))].sort();

    assert.deepEqual(guestToolKeys, GUEST_SEED_GROUP_KEYS, "guest seed data should include every required grouped seed file");
    assert.equal(guestSeed.readOnly, true);
    assert.equal(guestSeed.source, "dev/build/database/seed/guest/");
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
    assert.equal((guestSeed.packages || []).every((sample) => sample.createdBy === MOCK_DB_KEYS.users.admin), true);
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
  const localDbPath = path.join(process.cwd(), "dev", "workspace", "tmp", "local-db", `db-reseed-integrity-${process.pid}.local-db-state`);
  process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbPath;
  const server = await startApiServer();
  try {
    await apiJson(server.baseUrl, "/api/session/mode", {
      body: JSON.stringify({ modeId: "local-db" }),
      method: "POST",
    });
    const localDbInitial = await apiJson(server.baseUrl, "/api/local-db/snapshot");
    const sampleKey = (localDbInitial.tables.tool_state_samples || [])[0]?.key;
    assert.ok(sampleKey, "Local DB seed should include a tool_state_samples row");
    const originalLabel = sampleByKey(localDbInitial, sampleKey).sampleLabel;

    await replaceSampleLabel(server.baseUrl, sampleKey, "Local DB mutated before reseed");
    let localDbSnapshot = await apiJson(server.baseUrl, "/api/local-db/snapshot");
    assert.equal(sampleByKey(localDbSnapshot, sampleKey).sampleLabel, "Local DB mutated before reseed");

    await apiJson(server.baseUrl, "/api/local-db/seed", { method: "POST" });
    const localDbReseeded = await apiJson(server.baseUrl, "/api/local-db/snapshot");
    const reseededSamples = localDbReseeded.tables.tool_state_samples || [];
    assert.equal(reseededSamples.some((sample) => sample.sampleLabel === "Local DB mutated before reseed"), false);
    assert.equal(reseededSamples.some((sample) => sample.sampleLabel === originalLabel), true);
    assert.equal(reseededSamples.some((sample) => sample.key === sampleKey), false);
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

    localDbSnapshot = await apiJson(server.baseUrl, "/api/local-db/snapshot");
    assert.equal((localDbSnapshot.tables.tool_state_samples || []).some((sample) => sample.sampleLabel === originalLabel), true);
    assert.equal((localDbSnapshot.tables.tool_state_samples || []).some((sample) => sample.sampleLabel === "Local DB mutated before reseed"), false);
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
