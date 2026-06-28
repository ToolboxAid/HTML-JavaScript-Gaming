#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { createProviderContractSnapshot, SupabasePostgresProviderAdapter } from "../../api/auth/provider-contract-stubs.mjs";
import { createPostgresConnectionClient } from "../../api/persistence/postgres-connection-client.mjs";
import { createLocalApiRouter } from "../../api/server/local-api-router.mjs";
import { createServerSeedTables } from "../../api/seed/server-seed-loader.mjs";
import { SEED_DB_KEYS } from "../../api/seed/seed-db-keys.mjs";

const RUNTIME_ENV_FILE = ".env";
const DDL_FILES = Object.freeze([
  "dev/build/database/ddl/account.sql",
  "dev/build/database/ddl/admin.sql",
  "dev/build/database/ddl/game-workspace.sql",
  "dev/build/database/ddl/asset.sql",
  "dev/build/database/ddl/objects.sql",
  "dev/build/database/ddl/controls.sql",
  "dev/build/database/ddl/game-design.sql",
  "dev/build/database/ddl/game-configuration.sql",
  "dev/build/database/ddl/game-journey.sql",
  "dev/build/database/ddl/palette.sql",
  "dev/build/database/ddl/tags.sql",
  "dev/build/database/ddl/tool-metadata.sql",
  "dev/build/database/ddl/tool-planning.sql",
  "dev/build/database/ddl/toolbox-votes.sql",
  "dev/build/database/ddl/support-tickets.sql",
]);
const BANNER_SETTING_KEYS = Object.freeze([
  "platform.banner.enabled",
  "platform.banner.message",
  "platform.banner.tone",
]);
const LOCAL_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);
const GAME_NAME = `PR197 Runtime Game ${process.pid}`;

function parseEnvValue(value) {
  const trimmed = String(value || "").trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function loadRuntimeEnv() {
  const envPath = path.resolve(process.cwd(), RUNTIME_ENV_FILE);
  if (!fs.existsSync(envPath)) {
    throw new Error(`${RUNTIME_ENV_FILE} is required for runtime validation. Runtime startup does not auto-load copy-source env files.`);
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
    process.env[key] = parseEnvValue(normalized.slice(separatorIndex + 1));
    loadedKeys.push(key);
  });
  return {
    loadedKeys: loadedKeys.sort(),
    path: envPath,
  };
}

function requireEnv(key) {
  const value = String(process.env[key] || "").trim();
  if (!value) {
    throw new Error(`${key} is required for local Postgres runtime validation.`);
  }
  return value;
}

function isPrivateIpv4Host(host) {
  const parts = String(host || "").split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [first, second] = parts;
  return first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254);
}

function assertConfiguredLocalDatabaseUrl() {
  const value = requireEnv("GAMEFOUNDRY_DATABASE_URL");
  const databaseUrl = new URL(value);
  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must use postgres:// or postgresql:// for local Postgres runtime validation.");
  }
  const database = decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "") || "");
  const actual = {
    database,
    host: databaseUrl.hostname,
    port: databaseUrl.port || "5432",
    protocol: databaseUrl.protocol,
    user: decodeURIComponent(databaseUrl.username || ""),
  };
  if (!LOCAL_HOSTS.has(actual.host) && !isPrivateIpv4Host(actual.host)) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must target a local/private Postgres host for local runtime validation.");
  }
  if (!actual.database || !actual.user || !decodeURIComponent(databaseUrl.password || "")) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must include database, username, and password for local Postgres runtime validation.");
  }
  return actual;
}

function sqlLiteral(value) {
  return `'${String(value || "").replace(/'/g, "''")}'`;
}

function bannerRows(rows) {
  return rows.filter((row) => BANNER_SETTING_KEYS.includes(String(row?.settingKey || "")));
}

async function applyGroupedDdl(client) {
  for (const filePath of DDL_FILES) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const sql = fs.readFileSync(absolutePath, "utf8");
    await client.query(`\n-- Begin ${filePath}\n${sql}\n-- End ${filePath}\n`);
  }
}

async function seedIdentity(adapter) {
  const seedTables = createServerSeedTables();
  return adapter.initializeIdentity({
    actorKey: SEED_DB_KEYS.users.admin,
    roles: seedTables.roles,
    userRoles: seedTables.user_roles,
    users: seedTables.users,
  });
}

async function restoreBannerRows(client, adapter, rows) {
  await client.query(`DELETE FROM platform_settings WHERE "settingKey" IN (${BANNER_SETTING_KEYS.map(sqlLiteral).join(", ")});`);
  if (rows.length) {
    await adapter.upsertPlatformSettings(rows);
  }
}

async function deleteValidationGames(client) {
  await client.query(`
DELETE FROM game_workspace_progress
WHERE "gameKey" IN (
  SELECT key FROM game_workspace_games WHERE name = ${sqlLiteral(GAME_NAME)}
);
DELETE FROM game_workspace_games WHERE name = ${sqlLiteral(GAME_NAME)};
`);
}

function startFakeSupabaseServer() {
  const requests = [];
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    requests.push({
      method: request.method,
      path: requestUrl.pathname,
    });
    if (requestUrl.pathname === "/auth/v1/health") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    response.statusCode = 503;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ message: "Fake Supabase Auth server only allows Auth health checks." }));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start fake Supabase Auth validation server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
        requests,
      });
    });
  });
}

function startApiValidationServer() {
  const handleApiRuntimeRequest = createLocalApiRouter();
  const server = http.createServer(async (request, response) => {
    try {
      const address = server.address();
      const origin = address && typeof address !== "string"
        ? `http://127.0.0.1:${address.port}`
        : "http://127.0.0.1";
      const requestUrl = new URL(request.url || "/", origin);
      if (await handleApiRuntimeRequest(request, response, requestUrl)) {
        return;
      }
      response.statusCode = 404;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ error: "Validation API route not found.", ok: false }));
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error), ok: false }));
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start API validation server."));
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

async function apiJson(baseUrl, routePath, { body = null, method = "GET" } = {}) {
  const response = await fetch(`${baseUrl}${routePath}`, {
    body: body === null ? undefined : JSON.stringify(body),
    headers: body === null ? undefined : { "content-type": "application/json" },
    method,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(`API ${method} ${routePath} failed with HTTP ${response.status}: ${payload.error || "No error payload."}`);
  }
  return payload.data;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function validateApiRuntime({ adapter, client }) {
  const initialBannerRows = bannerRows(await adapter.getPlatformSettings());
  const server = await startApiValidationServer();
  try {
    const session = await apiJson(server.baseUrl, "/api/session/user", {
      body: { userKey: SEED_DB_KEYS.users.admin },
      method: "POST",
    });
    assert(session.authenticated === true, "DavidQ validation session did not authenticate from local Postgres users.");
    assert(session.isAdmin === true, "DavidQ validation session did not resolve admin role from local Postgres user_roles.");

    const message = "PR196 local Postgres banner validation";
    const bannerUpdate = await apiJson(server.baseUrl, "/api/admin/platform-settings/banner", {
      body: {
        active: true,
        message,
        tone: "info",
      },
      method: "POST",
    });
    assert(bannerUpdate.banner?.active === true, "Admin banner save did not return active=true.");
    assert(bannerUpdate.banner?.message === message, "Admin banner save did not return the validation message.");

    const publicBanner = await apiJson(server.baseUrl, "/api/platform-settings/banner");
    assert(publicBanner.banner?.active === true, "Public banner read did not return active=true.");
    assert(publicBanner.banner?.message === message, "Public banner read did not return the validation message.");

    const savedBannerRows = bannerRows(await adapter.getPlatformSettings());
    const messageRow = savedBannerRows.find((row) => row.settingKey === "platform.banner.message");
    assert(messageRow?.settingValue === message, "Local Postgres platform_settings message row was not updated.");

    const repository = await apiJson(server.baseUrl, "/api/toolbox/game-hub/repositories", {
      body: {},
      method: "POST",
    });
    assert(repository.repositoryId, "Game Hub repository was not created.");

    const created = await apiJson(server.baseUrl, `/api/toolbox/game-hub/repositories/${repository.repositoryId}/methods/createGame`, {
      body: {
        args: [
          {
            name: GAME_NAME,
            purpose: "Game",
            status: "Planning",
          },
        ],
      },
      method: "POST",
    });
    assert(created.result?.name === GAME_NAME, "Game Hub create did not return the validation game.");

    const active = await apiJson(server.baseUrl, `/api/toolbox/game-hub/repositories/${repository.repositoryId}/methods/getActiveGame`, {
      body: { args: [] },
      method: "POST",
    });
    assert(active.result?.name === GAME_NAME, "Game Hub active game did not resolve the validation game.");
    assert(Array.isArray(active.result?.members), "Game Hub active game did not include members.");

    const gameRows = await adapter.getProductTableRows("game_workspace_games");
    assert(gameRows.some((row) => row.name === GAME_NAME), "Local Postgres game_workspace_games did not include the validation game.");

    return {
      activeBanner: publicBanner.banner,
      bannerRows: savedBannerRows.length,
      gameRows: gameRows.filter((row) => row.name === GAME_NAME).length,
      initialBannerRows,
      repositoryId: repository.repositoryId,
      session,
    };
  } finally {
    await server.close();
    await restoreBannerRows(client, adapter, initialBannerRows);
    await deleteValidationGames(client);
  }
}

async function main() {
  const envLoad = loadRuntimeEnv();
  const database = assertConfiguredLocalDatabaseUrl();
  const originalSupabaseEnv = {
    GAMEFOUNDRY_SUPABASE_ANON_KEY: process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
    GAMEFOUNDRY_SUPABASE_URL: process.env.GAMEFOUNDRY_SUPABASE_URL,
  };
  const fakeSupabase = await startFakeSupabaseServer();
  process.env.GAMEFOUNDRY_SUPABASE_URL = fakeSupabase.baseUrl;
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "local-postgres-validation-anon";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "local-postgres-validation-service-role";

  const client = createPostgresConnectionClient();
  const adapter = new SupabasePostgresProviderAdapter();

  try {
    await client.query("SELECT 1 AS ok;");
    await applyGroupedDdl(client);
    const identity = await seedIdentity(adapter);
    const apiEvidence = await validateApiRuntime({ adapter, client });
    const restPlatformCalls = fakeSupabase.requests
      .filter((request) => request.path === "/rest/v1/platform_settings");
    assert(restPlatformCalls.length === 0, "Supabase platform_settings REST endpoint was called during product-data validation.");

    const providerContract = createProviderContractSnapshot();
    assert(providerContract.supabasePostgres?.configured === true, "Provider contract did not report the database connection as configured.");

    console.log(`PASS - ${RUNTIME_ENV_FILE} loaded only (${envLoad.loadedKeys.length} key(s) applied).`);
    console.log(`PASS - Local Postgres connection validated at ${database.host}:${database.port}/${database.database}.`);
    console.log(`PASS - Applied ${DDL_FILES.length} grouped DDL file(s) through GAMEFOUNDRY_DATABASE_URL.`);
    console.log(`PASS - Seeded identity rows: users=${identity.written.users}, roles=${identity.written.roles}, user_roles=${identity.written.user_roles}.`);
    console.log(`PASS - Banner saved and read through API; local platform_settings banner rows observed=${apiEvidence.bannerRows}.`);
    console.log(`PASS - Supabase Auth health calls=${fakeSupabase.requests.filter((request) => request.path === "/auth/v1/health").length}; Supabase platform_settings REST calls=0.`);
    console.log(`PASS - Game Hub create/getActiveGame used repository ${apiEvidence.repositoryId}; local game rows observed=${apiEvidence.gameRows}.`);
    console.log("PASS - Validation cleanup restored banner rows and removed PR197 Game Hub rows.");
  } finally {
    await fakeSupabase.close();
    Object.entries(originalSupabaseEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
}

await main();
