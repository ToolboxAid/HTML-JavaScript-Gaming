import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../src/dev-runtime/server/local-api-router.mjs";
import { MOCK_DB_KEYS } from "../../src/dev-runtime/persistence/mock-db-store.js";

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
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error || "Product cutover test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start product cutover API server."));
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

function identityTables() {
  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: MOCK_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: MOCK_DB_KEYS.users.admin,
  };
  return {
    roles: [
      {
        key: MOCK_DB_KEYS.roles.user,
        roleSlug: "user",
        name: "User",
        description: "Creator account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
      {
        key: MOCK_DB_KEYS.roles.admin,
        roleSlug: "admin",
        name: "Admin",
        description: "Administrative account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
    ],
    user_roles: [
      {
        key: MOCK_DB_KEYS.userRoles.user1User,
        userKey: MOCK_DB_KEYS.users.user1,
        roleKey: MOCK_DB_KEYS.roles.user,
        ...audit,
      },
      {
        key: MOCK_DB_KEYS.userRoles.adminAdmin,
        userKey: MOCK_DB_KEYS.users.admin,
        roleKey: MOCK_DB_KEYS.roles.admin,
        ...audit,
      },
    ],
    users: [
      {
        key: MOCK_DB_KEYS.users.user1,
        displayName: "User 1",
        email: "user1@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-user-1",
        isActive: true,
        ...audit,
      },
      {
        key: MOCK_DB_KEYS.users.admin,
        displayName: "DavidQ admin",
        email: "admin@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-admin",
        isActive: true,
        ...audit,
      },
    ],
  };
}

function startFakeSupabaseProductServer() {
  const tables = identityTables();
  const calls = [];
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const body = rawBody ? JSON.parse(rawBody) : {};
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    calls.push({
      body,
      headers: request.headers,
      method: request.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
    });

    if (requestUrl.pathname === "/auth/v1/health") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      tables[tableName] = tables[tableName] || [];
      if (request.method === "POST") {
        const rows = Array.isArray(body) ? body : [body];
        rows.forEach((row) => {
          const index = tables[tableName].findIndex((existing) => existing.key === row.key);
          if (index >= 0) {
            tables[tableName][index] = {
              ...tables[tableName][index],
              ...row,
            };
          } else {
            tables[tableName].push(row);
          }
        });
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(rows));
        return;
      }
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(tables[tableName]));
      return;
    }

    response.statusCode = 404;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ message: "Unknown fake Supabase route." }));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start fake Supabase product server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        calls,
        tables,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

async function apiJson(baseUrl, pathName, options = {}) {
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
  assert.equal(payload.ok, true, `${pathName} should return ok: ${payload.error || ""}`);
  return payload.data;
}

test("Supabase-selected product routes bootstrap Toolbox metadata and read DB snapshot from Supabase", async () => {
  const fakeSupabase = await startFakeSupabaseProductServer();
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const registry = await apiJson(server.baseUrl, "/api/toolbox/registry/snapshot");
      assert.equal(registry.providerId, "supabase-postgres");
      assert.equal(registry.source, "supabase-postgres");
      assert.equal(registry.activeTools.length > 0, true);
      assert.equal(fakeSupabase.tables.toolbox_tool_metadata.length > 0, true);
      assert.equal(fakeSupabase.tables.toolbox_tool_planning.length > 0, true);
      assert.equal(fakeSupabase.calls.some((call) => call.method === "POST" && call.path === "/rest/v1/toolbox_tool_metadata?on_conflict=key"), true);
      assert.equal(fakeSupabase.calls.some((call) => call.method === "POST" && call.path === "/rest/v1/toolbox_tool_planning?on_conflict=key"), true);

      const snapshot = await apiJson(server.baseUrl, "/api/local-db/snapshot");
      assert.equal(snapshot.source, "supabase-postgres");
      assert.equal(snapshot.provider.databaseProviderId, "supabase-postgres");
      assert.equal(snapshot.tables.toolbox_tool_metadata.length, fakeSupabase.tables.toolbox_tool_metadata.length);
      assert.equal(Array.isArray(snapshot.tables.asset_library_items), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase-selected Toolbox vote writes use server-owned keys and Supabase tables", async () => {
  const fakeSupabase = await startFakeSupabaseProductServer();
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const registry = await apiJson(server.baseUrl, "/api/toolbox/registry/snapshot");
      const toolId = registry.activeTools[0].id;
      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: MOCK_DB_KEYS.users.user1 },
        method: "POST",
      });
      const voteSnapshot = await apiJson(server.baseUrl, "/api/toolbox/votes/cast", {
        body: { direction: "up", toolId },
        method: "POST",
      });
      const vote = fakeSupabase.tables.toolbox_votes[0];
      assert.match(vote.key, /^[0-9A-HJKMNP-TV-Z]{26}$/);
      assert.equal(vote.userKey, MOCK_DB_KEYS.users.user1);
      assert.equal(vote.toolId, toolId);
      assert.equal(vote.direction, "up");
      assert.equal(voteSnapshot.providerId, "supabase-postgres");
      assert.equal(voteSnapshot.rows.find((row) => row.toolId === toolId).currentUserVote, "up");
      assert.equal(fakeSupabase.calls.some((call) => call.method === "POST" && call.path === "/rest/v1/toolbox_votes?on_conflict=key"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase-selected toolbox repositories open and persist through product tables", async () => {
  const fakeSupabase = await startFakeSupabaseProductServer();
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const repository = await apiJson(server.baseUrl, "/api/toolbox/game-workspace/repositories", {
        body: { options: {} },
        method: "POST",
      });
      assert.match(repository.repositoryId, /^game-workspace-\d+$/);

      const snapshot = await apiJson(server.baseUrl, `/api/toolbox/game-workspace/repositories/${repository.repositoryId}/methods/getSnapshot`, {
        body: { args: [] },
        method: "POST",
      });
      assert.equal(Array.isArray(snapshot.result.tables.games), true);
      assert.equal(fakeSupabase.calls.some((call) => call.method === "POST" && call.path === "/rest/v1/game_workspace_games?on_conflict=key"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});
