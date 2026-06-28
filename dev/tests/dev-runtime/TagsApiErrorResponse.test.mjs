import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { SupabasePostgresProviderAdapter } from "../../../api/auth/provider-contract-stubs.mjs";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { SEED_DB_KEYS } from "../../../api/seed/seed-db-keys.mjs";

const RAW_TAGS_SCHEMA_ERROR = "Configured database project_tags request failed: relation \"project_tags\" does not exist at postgres://tags_owner:secret-password@db.internal.example:5432/gamefoundry";

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

function identityRows() {
  const timestamp = "2026-06-27T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: SEED_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: SEED_DB_KEYS.users.admin,
  };
  return {
    roles: [{
      key: SEED_DB_KEYS.roles.creator,
      roleSlug: "creator",
      name: "Creator",
      description: "Creator account.",
      isActive: true,
      isSystemRole: false,
      ...audit,
    }],
    user_roles: [{
      key: SEED_DB_KEYS.userRoles.user1User,
      userKey: SEED_DB_KEYS.users.user1,
      roleKey: SEED_DB_KEYS.roles.creator,
      ...audit,
    }],
    users: [{
      key: SEED_DB_KEYS.users.user1,
      displayName: "User 1",
      email: "user1@example.invalid",
      authProvider: "supabase-auth",
      authProviderUserId: "supabase-user-1",
      isActive: true,
      ...audit,
    }],
  };
}

async function withTagsSchemaFailure(callback) {
  const originalRequestTable = SupabasePostgresProviderAdapter.prototype.requestTable;
  const tables = identityRows();
  SupabasePostgresProviderAdapter.prototype.requestTable = async function requestTable(tableName, options = {}) {
    const method = options.method || "GET";
    if (tableName === "project_tags") {
      throw new Error(RAW_TAGS_SCHEMA_ERROR);
    }
    if (method === "POST") {
      return Array.isArray(options.body) ? options.body : [options.body];
    }
    return (tables[tableName] || []).map((row) => ({ ...row }));
  };
  try {
    return await callback();
  } finally {
    SupabasePostgresProviderAdapter.prototype.requestTable = originalRequestTable;
  }
}

function startApiServer() {
  const escapedErrors = [];
  const handleRequest = createLocalApiRouter();
  const server = http.createServer((request, response) => {
    const address = server.address();
    const port = address && typeof address !== "string" ? address.port : 0;
    const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    handleRequest(request, response, requestUrl).catch((error) => {
      escapedErrors.push(error);
      response.statusCode = 599;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error || "Escaped router error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Tags API error response server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
        escapedErrors,
      });
    });
  });
}

async function postApiPayload(baseUrl, pathName, body = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  return {
    payload: await response.json(),
    status: response.status,
  };
}

function assertSafeTagsSetupPayload(result) {
  assert.equal(result.status, 503);
  assert.equal(result.payload.ok, false);
  assert.match(result.payload.error, /Tags API database setup is unavailable/);
  assert.match(result.payload.error, /Verify the API database connection/);
  assert.doesNotMatch(result.payload.error, /relation/i);
  assert.doesNotMatch(result.payload.error, /project_tags/);
  assert.doesNotMatch(result.payload.error, /postgres:\/\//i);
  assert.doesNotMatch(result.payload.error, /db\.internal/i);
  assert.doesNotMatch(result.payload.error, /secret-password/i);
  assert.equal(Object.hasOwn(result.payload, "operatorDiagnostic"), false);
}

test("Tags repository methods return controlled HTTP setup errors without escaping the API router", async () => {
  await withEnv({
    GAMEFOUNDRY_DATABASE_SSL: "disable",
    GAMEFOUNDRY_DATABASE_URL: "postgres://tags_owner:secret-password@db.internal.example:5432/gamefoundry",
  }, async () => {
    await withTagsSchemaFailure(async () => {
      const server = await startApiServer();
      try {
        const session = await postApiPayload(server.baseUrl, "/api/session/user", {
          userKey: SEED_DB_KEYS.users.user1,
        });
        assert.equal(session.status, 200);
        assert.equal(session.payload.ok, true);

        const repository = await postApiPayload(server.baseUrl, "/api/toolbox/tags/repositories", {
          options: {},
        });
        assert.equal(repository.status, 200);
        assert.equal(repository.payload.ok, true);
        const repositoryId = repository.payload.data.repositoryId;
        assert.match(repositoryId, /^tags-\d+$/);

        for (const [methodName, args] of [
          ["listTags", []],
          ["getSnapshot", []],
          ["addTag", [{ label: "Schema Failure" }]],
        ]) {
          const result = await postApiPayload(
            server.baseUrl,
            `/api/toolbox/tags/repositories/${repositoryId}/methods/${methodName}`,
            { args },
          );
          assertSafeTagsSetupPayload(result);
        }

        const constants = await fetch(`${server.baseUrl}/api/toolbox/tags/constants`);
        const constantsPayload = await constants.json();
        assert.equal(constants.status, 200);
        assert.equal(constantsPayload.ok, true);
        assert.deepEqual(server.escapedErrors, []);
      } finally {
        await server.close();
      }
    });
  });
});
