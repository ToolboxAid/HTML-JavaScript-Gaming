import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import { createLocalApiRouter } from "../../../src/dev-runtime/server/local-api-router.mjs";
import { createSpritesPostgresService } from "../../../src/dev-runtime/sprites/sprites-postgres-service.mjs";
import { SEED_DB_KEYS } from "../../../src/dev-runtime/seed/seed-db-keys.mjs";
import { createPostgresClientStub } from "../../helpers/postgresClientStub.mjs";

function startApiServer() {
  const spritesService = createSpritesPostgresService({
    postgresClient: createPostgresClientStub(),
  });
  const handleRequest = createLocalApiRouter({ spritesService });
  const server = http.createServer((request, response) => {
    const address = server.address();
    const port = address && typeof address !== "string" ? address.port : 0;
    const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    handleRequest(request, response, requestUrl).catch((error) => {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error || "Sprites API test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Sprites API test server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => {
          handleRequest.close?.();
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

async function apiPayload(baseUrl, pathName, options = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, options.body === undefined
    ? options
    : {
      ...options,
      body: JSON.stringify(options.body),
      headers: {
        "content-type": "application/json",
        ...(options.headers || {}),
      },
    });
  const payload = await response.json();
  return { payload, response };
}

async function apiJson(baseUrl, pathName, options = {}) {
  const { payload, response } = await apiPayload(baseUrl, pathName, options);
  assert.equal(response.status, 200, `${pathName} should return 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true, `${pathName} should return ok`);
  return payload.data;
}

test("Sprites Local API contract allows guest read and requires sign-in for writes", async () => {
  const server = await startApiServer();
  try {
    const list = await apiJson(server.baseUrl, "/api/sprites/records");
    assert.deepEqual(list.sprites, []);
    assert.equal(list.persistence.owner, "sprites");

    const blocked = await apiPayload(server.baseUrl, "/api/sprites/records", {
      body: { name: "Guest Sprite", status: "draft" },
      method: "POST",
    });
    assert.equal(blocked.response.status, 401);
    assert.equal(blocked.payload.ok, false);
    assert.match(blocked.payload.error, /Sign in is required/);

    await apiJson(server.baseUrl, "/api/session/user", {
      body: { userKey: SEED_DB_KEYS.users.user1 },
      method: "POST",
    });
    const created = await apiJson(server.baseUrl, "/api/sprites/records", {
      body: {
        height: 16,
        name: "API Hero",
        paletteColorKeys: ["palette-color-hero"],
        status: "draft",
        width: 16,
      },
      method: "POST",
    });
    assert.match(created.sprite.key, /^[0-9A-HJKMNP-TV-Z]{26}$/);
    assert.equal(created.sprite.createdBy, SEED_DB_KEYS.users.user1);
    assert.deepEqual(created.sprite.paletteColorKeys, ["palette-color-hero"]);

    const read = await apiJson(server.baseUrl, `/api/sprites/records/${created.sprite.key}`);
    assert.equal(read.sprite.name, "API Hero");
  } finally {
    await server.close();
  }
});
