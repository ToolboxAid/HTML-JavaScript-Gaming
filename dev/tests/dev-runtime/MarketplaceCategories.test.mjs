import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { SUPABASE_POSTGRES_PRODUCT_TABLES } from "../../../api/auth/provider-contract-stubs.mjs";
import {
  readMarketplaceCategories,
  validateMarketplaceCategoryCode,
} from "../../../api/marketplace/marketplace-category-service.mjs";
import { getMockDbTableSchemas } from "../../../api/persistence/mock-db-store.js";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

const APPROVED_CODES = Object.freeze(["games", "assets", "audio", "music", "worlds", "templates", "tutorials"]);
const ALPHABETICAL_CODES = Object.freeze(["assets", "audio", "games", "music", "templates", "tutorials", "worlds"]);
const ALPHABETICAL_LABELS = Object.freeze(["Assets", "Audio", "Games", "Music", "Templates", "Tutorials", "Worlds"]);

function withEnv(nextEnv, callback) {
  const previousEnv = {};
  Object.keys(nextEnv).forEach((key) => {
    previousEnv[key] = process.env[key];
    if (nextEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = nextEnv[key];
    }
  });
  return Promise.resolve()
    .then(callback)
    .finally(() => {
      Object.entries(previousEnv).forEach(([key, value]) => {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      });
    });
}

function startApiServer() {
  const handleRequest = createLocalApiRouter();
  const server = http.createServer((request, response) => {
    const address = server.address();
    const port = address && typeof address !== "string" ? address.port : 0;
    const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    handleRequest(request, response, requestUrl).catch((error) => {
      response.statusCode = error?.statusCode || 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error || "Marketplace category test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start marketplace category API server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

async function apiJson(baseUrl, pathName) {
  const response = await fetch(`${baseUrl}${pathName}`);
  const payload = await response.json();
  assert.equal(response.status, 200, `${pathName} should return HTTP 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true, `${pathName} should return ok: ${payload.error || ""}`);
  return payload.data;
}

test("marketplace_categories is registered as a DB-backed product table", () => {
  const schemas = getMockDbTableSchemas();
  assert.deepEqual(schemas.marketplace_categories, [
    "key",
    "code",
    "displayName",
    "active",
    "sortName",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ]);
  assert.equal(SUPABASE_POSTGRES_PRODUCT_TABLES.includes("marketplace_categories"), true);
});

test("seeded marketplace categories match the approved list exactly", () => {
  const tables = createServerSeedTables();
  assert.deepEqual(tables.marketplace_categories.map((row) => row.code).sort(), APPROVED_CODES.slice().sort());
  assert.deepEqual(tables.marketplace_categories.map((row) => row.displayName).sort(), ALPHABETICAL_LABELS.slice().sort());
  assert.equal(tables.marketplace_categories.every((row) => row.active === true), true);
  assert.equal(tables.marketplace_categories.every((row) => row.createdBy === SEED_DB_KEYS.users.forgeBot), true);
});

test("marketplace category service returns browseable categories alphabetically", () => {
  const categories = readMarketplaceCategories(createServerSeedTables());
  assert.equal(categories.status, "PASS");
  assert.deepEqual(categories.categories.map((row) => row.code), ALPHABETICAL_CODES);
  assert.deepEqual(categories.categories.map((row) => row.displayName), ALPHABETICAL_LABELS);
  assert.deepEqual(categories.sourceTables, ["marketplace_categories"]);
});

test("marketplace category validator resolves approved URL-safe codes", () => {
  const category = validateMarketplaceCategoryCode(createServerSeedTables(), "worlds");
  assert.equal(category.code, "worlds");
  assert.equal(category.displayName, "Worlds");
});

test("invalid marketplace category records are diagnosed and not exposed", () => {
  const tables = createServerSeedTables();
  tables.marketplace_categories.push({
    active: true,
    code: "tools",
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    displayName: "Tools",
    key: makeSeedUlid(1950),
    sortName: "tools",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: SEED_DB_KEYS.users.admin,
  });
  const categories = readMarketplaceCategories(tables);
  assert.equal(categories.status, "FAIL");
  assert.equal(categories.categories.some((row) => row.code === "tools"), false);
  assert.equal(categories.diagnostics.some((entry) => entry.code === "tools" && entry.status === "FAIL"), true);
});

test("Local API exposes marketplace categories from the shared source", async () => {
  await withEnv({
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      const categories = await apiJson(server.baseUrl, "/api/marketplace/categories");
      assert.equal(categories.status, "PASS");
      assert.deepEqual(categories.categories.map((row) => row.code), ALPHABETICAL_CODES);
      assert.deepEqual(categories.categories.map((row) => row.displayName), ALPHABETICAL_LABELS);
      assert.deepEqual(categories.sourceTables, ["marketplace_categories"]);
    } finally {
      await server.close();
    }
  });
});
