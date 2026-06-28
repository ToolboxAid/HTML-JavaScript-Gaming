import assert from "node:assert/strict";
import test from "node:test";
import { SEED_DB_KEYS } from "../../../api/seed/seed-db-keys.mjs";
import {
  SupabaseAuthProviderAdapter,
  SupabasePostgresProviderAdapter,
} from "../../../api/auth/provider-contract-stubs.mjs";
import {
  DEV_CREATOR_IDENTITIES,
  syncSupabaseDevCreatorIdentities,
} from "../../../api/testing/supabase-dev-creator-identity-seed-sync.mjs";

const syncEnv = Object.freeze({
  GAMEFOUNDRY_DATABASE_SSL: "disable",
  GAMEFOUNDRY_DATABASE_URL: "postgres://sync_user:sync_password@dev-sync.example.test/gamefoundry",
  GAMEFOUNDRY_ENV: "dev",
  GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
  GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  GAMEFOUNDRY_SUPABASE_URL: "https://supabase-sync.example.test",
});
const DEV_DB_USER_KEYS = Object.freeze({
  davidq: "01J00000000000000000000014",
  user1: "01J00000000000000000000011",
  user2: "01J00000000000000000000012",
  user3: "01J00000000000000000000013",
});

function decodeEqFilter(searchParams, key) {
  const value = searchParams.get(key) || "";
  return value.startsWith("eq.") ? value.slice(3) : "";
}

function createFakeSupabaseSyncState() {
  const timestamp = "2026-06-16T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: SEED_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: SEED_DB_KEYS.users.admin,
  };
  const state = {
    authUsers: [
      { email: "user1@example.invalid", id: "auth-user-1" },
      { email: "codex-extra@example.test", id: "auth-extra-codex" },
      { email: "qbytes.dq+old@gmail.com", id: "auth-extra-qbytes" },
    ],
    roles: [
      { key: "role-creator", roleSlug: "creator", name: "Creator", isActive: true, isSystemRole: false, ...audit },
      { key: "role-guest", roleSlug: "guest", name: "Guest", isActive: true, isSystemRole: false, ...audit },
      { key: "role-admin", roleSlug: "admin", name: "Admin", isActive: true, isSystemRole: false, ...audit },
      { key: "role-user", roleSlug: "user", name: "User", isActive: true, isSystemRole: false, ...audit },
    ],
    user_roles: [
      { key: "old-user-role", userKey: DEV_DB_USER_KEYS.user1, roleKey: "role-user", ...audit },
      { key: "missing-role-reference", userKey: DEV_DB_USER_KEYS.davidq, roleKey: "01KV6FVP0ASR2RRR9WXCBKTV6C", ...audit },
      { key: "extra-user-role", userKey: "user-extra-codex", roleKey: "role-creator", ...audit },
      { key: "davidq-admin-role", userKey: DEV_DB_USER_KEYS.davidq, roleKey: "role-admin", ...audit },
    ],
    users: [
      {
        authProvider: "dev-static-seed",
        authProviderUserId: "user-1",
        displayName: "User 1",
        email: "user1@example.invalid",
        isActive: true,
        key: DEV_DB_USER_KEYS.user1,
        ...audit,
      },
      {
        authProvider: "dev-static-seed",
        authProviderUserId: "user-2",
        displayName: "User 2",
        email: "user2@example.invalid",
        isActive: true,
        key: DEV_DB_USER_KEYS.user2,
        ...audit,
      },
      {
        authProvider: "dev-static-seed",
        authProviderUserId: "user-3",
        displayName: "User 3",
        email: "user3@example.invalid",
        isActive: true,
        key: DEV_DB_USER_KEYS.user3,
        ...audit,
      },
      {
        authProvider: "dev-static-seed",
        authProviderUserId: "davidq",
        displayName: "DavidQ",
        email: "qbytes.dq@gmail.com",
        isActive: true,
        key: DEV_DB_USER_KEYS.davidq,
        ...audit,
      },
      {
        authProvider: "supabase-auth",
        authProviderUserId: "auth-extra-codex",
        displayName: "Codex Extra",
        email: "codex-extra@example.test",
        isActive: true,
        key: "user-extra-codex",
        ...audit,
      },
    ],
  };
  const calls = [];
  let generatedKey = 1;

  function mutateTableRequest(tableName, { body = {}, method = "GET", query = "select=*" } = {}) {
    calls.push({
      body,
      method,
      path: `/rest/v1/${tableName}?${query}`,
    });

    state[tableName] = state[tableName] || [];
    if (method === "POST") {
      const rows = Array.isArray(body) ? body : [body];
      rows.forEach((row) => {
        const rowWithKey = {
          ...row,
          key: row.key || `generated-${generatedKey++}`,
        };
        const index = state[tableName].findIndex((existing) => existing.key === rowWithKey.key);
        if (index === -1) {
          state[tableName].push(rowWithKey);
        } else {
          state[tableName][index] = {
            ...state[tableName][index],
            ...rowWithKey,
          };
        }
      });
      return rows;
    }
    if (method === "DELETE") {
      const searchParams = new URLSearchParams(query);
      const filterField = searchParams.has("key")
        ? "key"
        : searchParams.has("roleKey")
          ? "roleKey"
          : tableName === "users"
            ? "key"
            : "userKey";
      const filterValue = decodeEqFilter(searchParams, filterField);
      const deleted = state[tableName].filter((row) => row[filterField] === filterValue);
      state[tableName] = state[tableName].filter((row) => row[filterField] !== filterValue);
      return deleted;
    }
    if (method === "PATCH") {
      const searchParams = new URLSearchParams(query);
      const filterField = searchParams.has("createdBy") ? "createdBy" : "updatedBy";
      const filterValue = decodeEqFilter(searchParams, filterField);
      const changed = [];
      state[tableName] = state[tableName].map((row) => {
        if (row[filterField] !== filterValue) {
          return row;
        }
        const nextRow = { ...row, ...body };
        changed.push(nextRow);
        return nextRow;
      });
      return changed;
    }
    return state[tableName].map((row) => ({ ...row }));
  }

  async function fetchImpl(url, options = {}) {
    const requestUrl = new URL(url);
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};
    calls.push({
      body,
      method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
    });

    if (requestUrl.pathname === "/auth/v1/admin/users" && method === "GET") {
      return {
        json: async () => ({ users: state.authUsers.map((user) => ({ ...user })) }),
        ok: true,
        status: 200,
      };
    }

    if (requestUrl.pathname === "/auth/v1/admin/users" && method === "POST") {
      const id = `auth-${String(body.email).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`;
      state.authUsers.push({ email: body.email, id });
      return {
        json: async () => ({ email: body.email, id }),
        ok: true,
        status: 200,
      };
    }

    if (requestUrl.pathname.startsWith("/auth/v1/admin/users/") && method === "PUT") {
      const id = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      const user = state.authUsers.find((candidate) => candidate.id === id);
      if (!user) {
        return {
          json: async () => ({ message: "Not Found" }),
          ok: false,
          status: 404,
        };
      }
      user.email = body.email || user.email;
      user.user_metadata = body.user_metadata || {};
      return {
        json: async () => ({ ...user }),
        ok: true,
        status: 200,
      };
    }

    if (requestUrl.pathname.startsWith("/auth/v1/admin/users/") && method === "DELETE") {
      const id = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      const before = state.authUsers.length;
      state.authUsers = state.authUsers.filter((user) => user.id !== id);
      return {
        json: async () => ({ id }),
        ok: before !== state.authUsers.length,
        status: before !== state.authUsers.length ? 200 : 404,
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
    postgresClient: {
      requestTable: async (tableName, options = {}) => mutateTableRequest(tableName, options),
    },
    state,
  };
}

test("Supabase DEV creator identity sync upserts canonical users and deletes extra managed accounts", async () => {
  const fake = createFakeSupabaseSyncState();
  let providerGeneratedKey = 1;
  const result = await syncSupabaseDevCreatorIdentities({
    authProvider: new SupabaseAuthProviderAdapter({
      env: syncEnv,
      fetchImpl: fake.fetchImpl,
    }),
    databaseProvider: new SupabasePostgresProviderAdapter({
      env: syncEnv,
      keyFactory: () => `provider-generated-key-${providerGeneratedKey++}`,
      postgresClient: fake.postgresClient,
    }),
    env: syncEnv,
  });

  assert.equal(result.status, "PASS");
  assert.equal(result.beforeCounts.managedExtraAuthUsers, 2);
  assert.equal(result.beforeCounts.managedExtraPublicUsers, 1);
  assert.equal(result.afterCounts.managedExtraAuthUsers, 0);
  assert.equal(result.afterCounts.managedExtraPublicUsers, 0);
  assert.deepEqual(result.deletedRecords.map((record) => record.email).sort(), [
    "codex-extra@example.test",
    "qbytes.dq+old@gmail.com",
  ]);
  assert.equal(result.verification.legacyUserRoleDeleted, true);
  assert.equal(result.verification.davidqAdminAssignmentPreserved, true);
  assert.equal(result.verification.davidqOwnerAssignmentPreserved, true);
  assert.deepEqual(result.verification.roleEvidence, {
    davidqAdmin: true,
    davidqCreator: true,
    davidqOwner: true,
    user1Creator: true,
    user2Creator: true,
    user3Creator: true,
  });
  assert.equal(result.verification.identityEvidence.every((record) => record.synced), true);
  assert.equal(result.verification.creatorAssignments.every((record) => record.assigned), true);
  assert.equal(result.userRoleRepair.staleRecordsFound, 2);
  assert.equal(result.userRoleRepair.staleRoleKeyRemoved, true);
  assert.deepEqual(result.verification.missingRoleReferenceUserRoles, []);
  assert.deepEqual(result.verification.staleRequestedRoleReferences, []);
  assert.deepEqual(result.verification.unexpectedCanonicalAssignments, []);

  const canonicalEmails = DEV_CREATOR_IDENTITIES.map((identity) => identity.email).sort();
  assert.deepEqual(fake.state.authUsers.map((user) => user.email).sort(), canonicalEmails);
  assert.deepEqual(fake.state.users.map((user) => user.email).sort(), canonicalEmails);
  assert.equal(fake.state.users.find((user) => user.email === "qbytes.dq@gmail.com").displayName, "DavidQ");
  assert.equal(fake.state.users.find((user) => user.email === "qbytes.dq@gmail.com").key, DEV_DB_USER_KEYS.davidq);
  assert.equal(fake.state.users.find((user) => user.email === "user1@example.invalid").key, DEV_DB_USER_KEYS.user1);
  assert.equal(fake.state.users.find((user) => user.email === "user2@example.invalid").key, DEV_DB_USER_KEYS.user2);
  assert.equal(fake.state.users.find((user) => user.email === "user3@example.invalid").key, DEV_DB_USER_KEYS.user3);
  assert.equal(fake.state.users.some((user) => Object.values(SEED_DB_KEYS.users).includes(user.key)), false);
  assert.equal(fake.state.users.every((user) => user.authProvider === "supabase-auth"), true);
  assert.equal(fake.state.roles.some((role) => role.roleSlug === "user"), false);
  assert.equal(fake.state.roles.find((role) => role.roleSlug === "owner").isActive, true);
  const ownerRole = fake.state.roles.find((role) => role.roleSlug === "owner");
  const davidq = fake.state.users.find((user) => user.email === "qbytes.dq@gmail.com");
  assert.equal(fake.state.user_roles.some((row) => row.userKey === davidq.key && row.roleKey === ownerRole.key), true);
  assert.equal(fake.calls.some((call) => call.path === "/auth/v1/admin/users?page=1&per_page=100" && call.method === "GET"), true);
  const existingUserUpdate = fake.calls.find((call) => call.method === "PUT" && call.path === "/auth/v1/admin/users/auth-user-1");
  assert.equal(Boolean(existingUserUpdate), true);
  assert.equal(Object.hasOwn(existingUserUpdate.body, "password"), false);
  assert.equal(result.authUpsertRecords.find((record) => record.email === "user1@example.invalid").passwordUpdated, false);
});

test("Supabase DEV creator identity sync requires existing database users rows by email", async () => {
  const fake = createFakeSupabaseSyncState();
  fake.state.users = fake.state.users.filter((user) => user.email !== "qbytes.dq@gmail.com");
  await assert.rejects(
    () => syncSupabaseDevCreatorIdentities({
      authProvider: new SupabaseAuthProviderAdapter({
        env: syncEnv,
        fetchImpl: fake.fetchImpl,
      }),
      databaseProvider: new SupabasePostgresProviderAdapter({
        env: syncEnv,
        postgresClient: fake.postgresClient,
      }),
      env: syncEnv,
    }),
    /requires existing database users rows for: qbytes\.dq@gmail\.com/,
  );
});
