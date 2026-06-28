import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SupabaseAuthProviderAdapter,
  SupabasePostgresProviderAdapter,
} from "../../../api/auth/provider-contract-stubs.mjs";
import {
  assertDevOnlyAuthTestCleanupEnvironment,
  cleanupSupabaseDevAuthTestUsers,
  isSupabaseDevAuthTestUser,
} from "../../../api/testing/supabase-dev-auth-test-user-cleanup.mjs";
import { MOCK_DB_KEYS } from "../../../api/persistence/mock-db-store.js";

const cleanupEnv = Object.freeze({
  GAMEFOUNDRY_ENV: "dev",
  GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
  GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  GAMEFOUNDRY_SUPABASE_URL: "https://supabase-cleanup.example.test",
});

function decodeEqFilter(searchParams, key) {
  const value = searchParams.get(key) || "";
  return value.startsWith("eq.") ? value.slice(3) : "";
}

function createFakeSupabaseCleanupState() {
  const state = {
    authUsers: new Set(["auth-codex-1", "auth-playwright-1", "auth-real-1", "auth-static-1"]),
    roles: [{ createdBy: "user-real-1", key: "role-user", roleSlug: "user", updatedBy: "user-real-1" }],
    user_roles: [
      { createdBy: "user-codex-1", key: "user-role-codex-1", roleKey: "role-user", updatedBy: "user-codex-1", userKey: "user-codex-1" },
      { createdBy: "user-codex-1", key: "user-role-codex-2", roleKey: "role-user", updatedBy: "user-codex-1", userKey: "user-codex-1" },
      { createdBy: "user-playwright-1", key: "user-role-playwright-1", roleKey: "role-user", updatedBy: "user-playwright-1", userKey: "user-playwright-1" },
      { createdBy: "user-real-1", key: "user-role-real-1", roleKey: "role-user", updatedBy: "user-real-1", userKey: "user-real-1" },
      { createdBy: MOCK_DB_KEYS.users.user1, key: "user-role-static-1", roleKey: "role-user", updatedBy: MOCK_DB_KEYS.users.user1, userKey: MOCK_DB_KEYS.users.user1 },
    ],
    users: [
      {
        authProvider: "supabase-auth",
        authProviderUserId: "auth-codex-1",
        email: "codex-pr26166-cleanup@example.test",
        key: "user-codex-1",
      },
      {
        authProvider: "supabase-auth",
        authProviderUserId: "auth-playwright-1",
        email: "playwright-cleanup@example.test",
        key: "user-playwright-1",
      },
      {
        authProvider: "supabase-auth",
        authProviderUserId: "auth-real-1",
        email: "creator@example.com",
        key: "user-real-1",
      },
      {
        authProvider: "local-db",
        authProviderUserId: "auth-local-1",
        email: "codex-local-provider@example.test",
        key: "user-local-1",
      },
      {
        authProvider: "supabase-auth",
        authProviderUserId: "auth-static-1",
        email: "codex-static-user@example.test",
        key: MOCK_DB_KEYS.users.user1,
      },
    ],
  };
  const calls = [];

  async function fetchImpl(url, options = {}) {
    const requestUrl = new URL(url);
    const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
    calls.push({
      method: options.method || "GET",
      path: `${requestUrl.pathname}${requestUrl.search}`,
    });

    if (requestUrl.pathname.startsWith("/auth/v1/admin/users/")) {
      const authUserId = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      if (!state.authUsers.has(authUserId)) {
        return {
          json: async () => ({ message: "Not Found" }),
          ok: false,
          status: 404,
        };
      }
      state.authUsers.delete(authUserId);
      return {
        json: async () => ({ id: authUserId }),
        ok: true,
        status: 200,
      };
    }

    if (requestUrl.pathname.startsWith("/rest/v1/") && (options.method || "GET") === "DELETE") {
      const key = tableName === "users"
        ? decodeEqFilter(requestUrl.searchParams, "key")
        : decodeEqFilter(requestUrl.searchParams, "userKey");
      const rows = state[tableName] || [];
      const deleted = rows.filter((row) => tableName === "users" ? row.key === key : row.userKey === key);
      state[tableName] = rows.filter((row) => tableName === "users" ? row.key !== key : row.userKey !== key);
      return {
        json: async () => deleted,
        ok: true,
        status: 200,
      };
    }

    if (requestUrl.pathname.startsWith("/rest/v1/") && (options.method || "GET") === "PATCH") {
      const body = options.body ? JSON.parse(options.body) : {};
      const filterField = ["createdBy", "updatedBy"].find((field) => requestUrl.searchParams.has(field));
      const filterValue = decodeEqFilter(requestUrl.searchParams, filterField);
      const rows = state[tableName] || [];
      const updated = rows
        .filter((row) => row[filterField] === filterValue)
        .map((row) => {
          Object.assign(row, body);
          return { ...row };
        });
      return {
        json: async () => updated,
        ok: true,
        status: 200,
      };
    }

    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      return {
        json: async () => state[tableName] || [],
        ok: true,
        status: 200,
      };
    }

    return {
      json: async () => ({ message: "Unhandled fake route" }),
      ok: false,
      status: 500,
    };
  }

  return {
    calls,
    fetchImpl,
    state,
  };
}

function cleanupProviders(fetchImpl) {
  return {
    authProvider: new SupabaseAuthProviderAdapter({
      env: cleanupEnv,
      fetchImpl,
    }),
    databaseProvider: new SupabasePostgresProviderAdapter({
      env: cleanupEnv,
      fetchImpl,
    }),
  };
}

test("DEV auth cleanup identifies only Codex and Playwright Supabase test accounts", () => {
  assert.equal(isSupabaseDevAuthTestUser({
    authProvider: "supabase-auth",
    authProviderUserId: "auth-codex-1",
    email: "codex-test@example.test",
    key: "user-codex-1",
  }), true);
  assert.equal(isSupabaseDevAuthTestUser({
    authProvider: "supabase-auth",
    authProviderUserId: "auth-real-1",
    email: "creator@example.com",
    key: "user-real-1",
  }), false);
  assert.equal(isSupabaseDevAuthTestUser({
    authProvider: "supabase-auth",
    authProviderUserId: "auth-static-1",
    email: "codex-static@example.test",
    key: MOCK_DB_KEYS.users.user1,
  }), false);
});

test("DEV auth cleanup deletes only matching Supabase Auth users users rows and user_roles", async () => {
  const fake = createFakeSupabaseCleanupState();
  const result = await cleanupSupabaseDevAuthTestUsers({
    ...cleanupProviders(fake.fetchImpl),
    env: cleanupEnv,
  });

  assert.equal(result.status, "PASS");
  assert.equal(result.testDataCreated, 0);
  assert.equal(result.testDataDeleted, 2);
  assert.deepEqual(result.deletedRecords.map((record) => record.email).sort(), [
    "codex-pr26166-cleanup@example.test",
    "playwright-cleanup@example.test",
  ]);
  assert.deepEqual(result.deletedRecords.map((record) => record.userRolesDeleted).sort(), [1, 2]);
  assert.deepEqual(result.deletedRecords.map((record) => record.usersDeleted), [1, 1]);
  assert.equal(fake.state.authUsers.has("auth-codex-1"), false);
  assert.equal(fake.state.authUsers.has("auth-playwright-1"), false);
  assert.equal(fake.state.authUsers.has("auth-real-1"), true);
  assert.equal(fake.state.authUsers.has("auth-static-1"), true);
  assert.deepEqual(fake.state.users.map((user) => user.key).sort(), [
    MOCK_DB_KEYS.users.user1,
    "user-local-1",
    "user-real-1",
  ].sort());
  assert.deepEqual(fake.state.user_roles.map((row) => row.key).sort(), [
    "user-role-real-1",
    "user-role-static-1",
  ]);
  assert.equal(fake.calls.some((call) => call.path === "/auth/v1/admin/users/auth-codex-1" && call.method === "DELETE"), true);
  assert.equal(fake.calls.some((call) => call.path === "/rest/v1/user_roles?userKey=eq.user-codex-1" && call.method === "DELETE"), true);
  assert.equal(fake.calls.some((call) => call.path === "/rest/v1/users?key=eq.user-codex-1" && call.method === "DELETE"), true);
});

test("DEV auth cleanup reassigns shared audit references only with explicit non-test audit user", async () => {
  const fake = createFakeSupabaseCleanupState();
  fake.state.roles.push({
    createdBy: "user-codex-1",
    key: "role-test-owned",
    roleSlug: "test-owned",
    updatedBy: "user-codex-1",
  });

  await assert.rejects(() => cleanupSupabaseDevAuthTestUsers({
    ...cleanupProviders(fake.fetchImpl),
    env: cleanupEnv,
  }), /shared account audit references/);

  const result = await cleanupSupabaseDevAuthTestUsers({
    ...cleanupProviders(fake.fetchImpl),
    auditUserKey: "user-real-1",
    env: cleanupEnv,
  });

  assert.equal(result.auditReassignmentRequired, true);
  assert.equal(result.auditDependencyRecords.length, 1);
  assert.deepEqual(result.auditReassignmentRecords, [{
    roleAuditReferencesReassigned: 2,
    userKey: "user-codex-1",
    userRoleAuditReferencesReassigned: 0,
  }]);
  assert.equal(fake.state.roles.find((role) => role.key === "role-test-owned").createdBy, "user-real-1");
  assert.equal(fake.state.roles.find((role) => role.key === "role-test-owned").updatedBy, "user-real-1");
  assert.equal(fake.state.users.some((user) => user.key === "user-codex-1"), false);
  assert.equal(fake.calls.some((call) => call.path === "/rest/v1/roles?createdBy=eq.user-codex-1" && call.method === "PATCH"), true);
  assert.equal(fake.calls.some((call) => call.path === "/rest/v1/roles?updatedBy=eq.user-codex-1" && call.method === "PATCH"), true);
});

test("DEV auth cleanup dry-run lists matching records without deleting", async () => {
  const fake = createFakeSupabaseCleanupState();
  const result = await cleanupSupabaseDevAuthTestUsers({
    ...cleanupProviders(fake.fetchImpl),
    dryRun: true,
    env: cleanupEnv,
  });

  assert.equal(result.dryRun, true);
  assert.equal(result.testDataCandidates, 2);
  assert.equal(result.testDataDeleted, 0);
  assert.equal(fake.state.authUsers.has("auth-codex-1"), true);
  assert.equal(fake.state.users.some((user) => user.key === "user-codex-1"), true);
  assert.equal(fake.calls.some((call) => call.method === "DELETE"), false);
});

test("DEV auth cleanup refuses UAT and production modes", () => {
  assert.throws(() => assertDevOnlyAuthTestCleanupEnvironment({ GAMEFOUNDRY_ENV: "uat" }), /DEV-only/);
  assert.throws(() => assertDevOnlyAuthTestCleanupEnvironment({ NODE_ENV: "production" }), /DEV-only/);
});
