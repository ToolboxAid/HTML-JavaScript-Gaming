import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SupabaseAuthProviderAdapter,
  SupabaseAuthProviderStub,
  SupabasePostgresProviderAdapter,
  SupabasePostgresProviderStub,
  createProviderContractSnapshot,
} from "../../../api/auth/provider-contract-stubs.mjs";
import { SEED_DB_KEYS } from "../../../api/seed/seed-db-keys.mjs";
import {
  createLocalApiRouter,
  sessionUserFromIdentityTables,
} from "../../../api/server/local-api-router.mjs";

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
        error: error instanceof Error ? error.message : String(error || "Provider contract test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start provider contract API server."));
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

function startFakeSupabaseAuthServer(options = {}) {
  const expectedApiKey = options.expectedApiKey || "";
  const rejectWrongApiKey = options.rejectWrongApiKey === true;
  const unavailableIdentityTables = new Set(options.identityTablesUnavailable === true
    ? ["users", "roles", "user_roles"]
    : options.unavailableIdentityTables || []);
  const identityTables = {
    roles: [...(options.identityTables?.roles || [])],
    user_roles: [...(options.identityTables?.user_roles || [])],
    users: [...(options.identityTables?.users || [])],
  };
  const authUserIdForEmail = (email) => {
    const normalizedEmail = String(email || "creator@example.test").trim();
    if (options.userIdByEmail?.[normalizedEmail]) {
      return options.userIdByEmail[normalizedEmail];
    }
    if (options.authUserId) {
      return options.authUserId;
    }
    if (normalizedEmail === "user1@example.invalid") {
      return "supabase-user-1";
    }
    return `supabase-${normalizedEmail.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  };
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
    if (rejectWrongApiKey && request.headers.apikey !== expectedApiKey) {
      response.statusCode = 401;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ message: "Invalid API key" }));
      return;
    }
    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      if (unavailableIdentityTables.has(tableName)) {
        response.statusCode = 404;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify({ message: `Could not find the table 'public.${tableName}' in the schema cache` }));
        return;
      }
      if (request.method === "POST") {
        const rows = Array.isArray(body) ? body : [body];
        identityTables[tableName] = identityTables[tableName] || [];
        rows.forEach((row) => {
          const index = identityTables[tableName].findIndex((existing) => existing.key === row.key);
          if (index >= 0) {
            identityTables[tableName][index] = {
              ...identityTables[tableName][index],
              ...row,
            };
          } else {
            identityTables[tableName].push(row);
          }
        });
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(rows));
        return;
      }
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(identityTables[tableName] || []));
      return;
    }
    if (requestUrl.pathname === "/auth/v1/health") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (requestUrl.pathname === "/auth/v1/recover") {
      if (options.failPasswordReset) {
        response.statusCode = options.failPasswordReset.status || 500;
        response.end(JSON.stringify(options.failPasswordReset.payload || { message: "Password reset failed" }));
        return;
      }
      response.end(JSON.stringify({ ok: true }));
      return;
    }
    if (requestUrl.pathname === "/auth/v1/admin/users") {
      if (options.failAdminCreateAccount) {
        response.statusCode = options.failAdminCreateAccount.status || 500;
        response.end(JSON.stringify(options.failAdminCreateAccount.payload || { message: "Create account failed" }));
        return;
      }
      if (options.adminCreateAccountPayload) {
        response.end(JSON.stringify(options.adminCreateAccountPayload));
        return;
      }
    }
    response.end(JSON.stringify({
      access_token: "fake-supabase-access-token",
      refresh_token: "fake-supabase-refresh-token",
      token_type: "bearer",
      user: {
        email: body.email || "creator@example.test",
        id: authUserIdForEmail(body.email),
      },
    }));
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start fake Supabase Auth server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        calls,
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
  assert.equal(payload.ok, true, `${pathName} should return ok`);
  return payload.data;
}

async function apiPayload(baseUrl, pathName) {
  const response = await fetch(`${baseUrl}${pathName}`);
  const payload = await response.json();
  return { payload, status: response.status };
}

async function postApiPayload(baseUrl, pathName, body = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const payload = await response.json();
  return { payload, status: response.status };
}

async function withCapturedConsoleWarn(callback) {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => {
    warnings.push(args.map((arg) => String(arg)).join(" "));
  };
  try {
    return await callback(warnings);
  } finally {
    console.warn = originalWarn;
  }
}

function preflightCheck(snapshot, checkId) {
  return snapshot.supabasePreflight.checks.find((check) => check.id === checkId);
}

function fakeSupabaseIdentityTables(overrides = {}) {
  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: SEED_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: SEED_DB_KEYS.users.admin,
  };
  return {
    roles: overrides.roles || [
      {
        key: SEED_DB_KEYS.roles.creator,
        roleSlug: "creator",
        name: "Creator",
        description: "Creator account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.roles.admin,
        roleSlug: "admin",
        name: "Admin",
        description: "Administrative account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
    ],
    user_roles: overrides.user_roles || [
      {
        key: SEED_DB_KEYS.userRoles.user1User,
        userKey: SEED_DB_KEYS.users.user1,
        roleKey: SEED_DB_KEYS.roles.creator,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.userRoles.adminAdmin,
        userKey: SEED_DB_KEYS.users.admin,
        roleKey: SEED_DB_KEYS.roles.admin,
        ...audit,
      },
    ],
    users: overrides.users || [
      {
        key: SEED_DB_KEYS.users.user1,
        displayName: "User 1",
        email: "user1@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-user-1",
        isActive: true,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.users.admin,
        displayName: "DavidQ",
        email: "qbytes.dq@gmail.com",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-admin",
        isActive: true,
        ...audit,
      },
    ],
  };
}

function fakePostgresIdentityClient(identityTables = {}) {
  return {
    requestTable: async (tableName) => (identityTables[tableName] || []).map((row) => ({ ...row })),
  };
}

test("Supabase provider contract does not require provider selector variables", () => {
  const snapshot = createProviderContractSnapshot({});
  assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.activeProviders.status, "failed");
  assert.equal(snapshot.activationReadiness.readyBeforeActivation, false);
  assert.equal(snapshot.activationReadiness.runtimeProviderPathReady, false);
  assert.equal(snapshot.activationReadiness.supabaseAuthReady, false);
  assert.equal(snapshot.activationReadiness.supabasePostgresReady, false);
  assert.equal(snapshot.boundary, "Browser -> API/Service Contract -> Database");
  assert.equal(snapshot.failureContract.runtimeProviderPathFixed, true);
  assert.equal(snapshot.failureContract.automaticFallbackAllowed, false);
  assert.equal(snapshot.failureContract.providerChainingAllowed, false);
  assert.deepEqual(snapshot.identityOwnership.ownershipFields, ["key", "createdAt", "updatedAt", "createdBy", "updatedBy"]);
  assert.equal(snapshot.identityOwnership.ownerProviderId, "supabase-auth");
  assert.equal(snapshot.identityOwnership.productDatabaseProviderId, "supabase-postgres");
  assert.equal(snapshot.identityOwnership.readerProviderId, "supabase-postgres");
  assert.equal(snapshot.identityOwnership.userKeyAuthority, "users.key");
  assert.equal(snapshot.identityOwnership.browserAuthoritativeKeysAllowed, false);
  assert.equal(snapshot.identityOwnership.serverApiOwnsKeyGeneration, true);
  assert.match(snapshot.identityOwnership.staticDevUserUlidException, /User 1, User 2, User 3, and DavidQ only/);
  assert.match(snapshot.identityOwnership.temporaryDevOnlyException, /Static ULIDs are allowed only/);
  assert.deepEqual(snapshot.identityOwnership.tables, ["users", "roles", "user_roles"]);
  assert.equal(snapshot.supabaseAuth.status, "not-configured");
  assert.equal(snapshot.supabaseAuth.adapter.activeByDefault, true);
  assert.equal(snapshot.supabaseAuth.adapter.passwordStorage, "external-provider");
  assert.equal(snapshot.supabaseAuth.adapter.serviceRoleSecretsUsed, false);
  assert.deepEqual(snapshot.supabaseAuth.operations, [
    "getCurrentUser",
    "signIn",
    "signOut",
    "createAccount",
    "listAdminUsers",
    "listAllAdminUsers",
    "updateAccount",
    "deleteTestAccount",
    "requestPasswordReset",
    "requireRole",
  ]);
  assert.equal(snapshot.supabaseAuth.userMapping.appUserKeyField, "users.key");
  assert.equal(snapshot.supabaseAuth.userMapping.externalAuthUserIdField, "supabase.auth.user.id");
  assert.equal(snapshot.supabaseAuth.userMapping.browserAuthoritativeUserKeysAllowed, false);
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.auth, []);
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.database, []);
  assert.deepEqual(snapshot.providerDiagnostics.providerFailures.map((failure) => failure.reason), [
    "missing-configuration",
    "missing-configuration",
  ]);
  assert.deepEqual(snapshot.providerDiagnostics.ignoredRuntimeSelectors, []);
  assert.equal(snapshot.runtimeActivation.browserReceivesServiceRoleSecrets, false);
  assert.equal(snapshot.runtimeActivation.runtimeProviderPathFixed, true);
  assert.equal(snapshot.runtimeActivation.runtimeProviderPathReady, false);
  assert.equal(snapshot.supabasePreflight.overallStatus, "FAIL");
  assert.equal(snapshot.supabasePreflight.fallbackAllowed, false);
  assert.equal(snapshot.supabasePreflight.runtimeProviderPathReady, false);
  assert.equal(snapshot.supabasePreflight.supabaseActive, true);
  assert.equal(snapshot.supabasePreflight.secretValuesExposed, false);
  assert.equal(snapshot.supabasePreflight.serverOnlySecretNamesExposed, false);
  assert.equal(preflightCheck(snapshot, "runtime-auth-provider").status, "PASS");
  assert.equal(preflightCheck(snapshot, "runtime-database-provider").status, "PASS");
  assert.equal(preflightCheck(snapshot, "supabase-url").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "supabase-anon-key").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "supabase-server-only-credential").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "identity-tables-readiness").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "site-setup-readiness").status, "FAIL");
  assert.match(snapshot.providerDiagnostics.missingConfigWarnings.join("\n"), /Supabase Auth is not configured/);
  assert.equal(snapshot.providerDiagnostics.secretValuesExposed, false);
  assert.equal(snapshot.supabasePostgres.serverOnlySecretsExposed, false);
  assert.equal(snapshot.supabasePostgres.serverOnlySecretNamesExposed, false);
  assert.equal(snapshot.supabasePostgres.status, "not-configured");
  assert.equal(snapshot.supabasePostgres.adapter.activeByDefault, true);
  assert.equal(snapshot.supabasePostgres.adapter.implementation, "config-gated Supabase Postgres REST adapter");
  assert.equal(snapshot.supabasePostgres.adapter.keyGenerationOwner, "server-api");
  assert.equal(snapshot.supabasePostgres.adapter.staticUlidsAllowedOnlyForDevSeedUsers, true);
  assert.equal(snapshot.supabasePostgres.readiness.dbViewerReady, false);
  assert.equal(snapshot.supabasePostgres.readiness.serverApiOwnsKeyGeneration, true);
  assert.equal(snapshot.supabasePostgres.readiness.siteSetupReady, false);
  assert.deepEqual(snapshot.supabasePostgres.operations, [
    "connect",
    "getUsers",
    "getRoles",
    "getUserRoles",
    "getTableRows",
    "getTables",
    "getProductTableRows",
    "getProductTables",
    "initializeIdentity",
    "upsertProductTable",
    "upsertProductTables",
    "deleteUserByKey",
    "deleteUserRoleByKey",
    "deleteUserRolesForUserKey",
    "getPlatformSettings",
    "reassignRoleAuditReferences",
    "reassignUserRoleAuditReferences",
    "runSiteSetup",
    "getDbViewerSnapshot",
    "upsertPlatformSettings",
  ]);
  assert.equal(snapshot.supabasePostgres.dataMigrationActive, true);
  assert.deepEqual(snapshot.supabasePostgres.migrationSequence, [
    "Supabase Auth",
    "Supabase users/roles/user_roles",
    "Supabase tool/product data groups",
  ]);
  assert.match(snapshot.supabasePostgres.executionOwnership.dev, /DEV setup\/migration only/);
  assert.match(snapshot.supabasePostgres.executionOwnership.uat, /User-controlled/);
  assert.match(snapshot.supabasePostgres.executionOwnership.prod, /User-controlled/);
});

test("Supabase stubs fail visibly when selected without configuration", () => {
  const env = {};
  const snapshot = createProviderContractSnapshot(env);
  assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.activeProviders.status, "failed");
  assert.equal(snapshot.providerDiagnostics.activeProvider.authProviderId, "supabase-auth");
  assert.equal(snapshot.providerDiagnostics.activeProvider.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.failureContract.automaticFallbackAllowed, false);
  assert.equal(snapshot.failureContract.runtimeProviderPathFixed, true);
  assert.equal(snapshot.supabaseAuth.status, "not-configured");
  assert.equal(snapshot.supabasePostgres.status, "not-configured");
  assert.equal(snapshot.activationReadiness.readyBeforeActivation, false);
  assert.equal(snapshot.activationReadiness.runtimeProviderPathReady, false);
  assert.equal(snapshot.runtimeActivation.runtimeProviderPathReady, false);
  assert.equal(snapshot.runtimeActivation.runtimeProviderPathFailed, true);
  assert.equal(snapshot.supabasePreflight.overallStatus, "FAIL");
  assert.equal(snapshot.supabasePreflight.supabaseActive, true);
  assert.equal(snapshot.supabasePreflight.runtimeProviderPathReady, false);
  assert.equal(snapshot.supabasePreflight.fallbackAllowed, false);
  assert.equal(preflightCheck(snapshot, "runtime-auth-provider").status, "PASS");
  assert.equal(preflightCheck(snapshot, "runtime-database-provider").status, "PASS");
  assert.equal(preflightCheck(snapshot, "supabase-url").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "supabase-anon-key").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "supabase-server-only-credential").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "identity-tables-readiness").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "site-setup-readiness").status, "FAIL");
  assert.deepEqual(preflightCheck(snapshot, "identity-tables-readiness").records, {
    roles: false,
    user_roles: false,
    users: false,
  });
  assert.equal(snapshot.activationReadiness.blockers.length > 0, true);
  assert.equal(snapshot.providerDiagnostics.providerFailures.length, 2);
  assert.deepEqual(snapshot.providerDiagnostics.providerFailures.map((failure) => failure.providerId), [
    "supabase-auth",
    "supabase-postgres",
  ]);
  assert.equal(JSON.stringify(snapshot).includes("rollback"), false);
  assert.match(snapshot.supabaseAuth.diagnostic, /Supabase Auth connection is not configured/);
  assert.match(snapshot.supabasePostgres.diagnostic, /Supabase Postgres connection is not configured/);
  assert.deepEqual(snapshot.supabaseAuth.missingBrowserSafeEnvironmentVariables, [
    "GAMEFOUNDRY_SUPABASE_URL",
    "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  ]);
});

test("Default startup selects Supabase Auth and Supabase Postgres product data without falling back", async () => {
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: undefined,
    GAMEFOUNDRY_DB_PROVIDER: undefined,
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const snapshot = createProviderContractSnapshot({});
    assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
    assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
    assert.equal(snapshot.activeProviders.status, "failed");
    assert.equal(snapshot.identityOwnership.ownerProviderId, "supabase-auth");
    assert.equal(snapshot.identityOwnership.productDatabaseProviderId, "supabase-postgres");
    assert.equal(snapshot.identityOwnership.dataMigrationActive, true);
    assert.equal(snapshot.failureContract.automaticFallbackAllowed, false);
    assert.equal(snapshot.supabaseAuth.status, "not-configured");
    assert.equal(snapshot.supabaseAuth.adapter.activeByDefault, true);
    assert.equal(snapshot.supabasePostgres.dataMigrationActive, true);

    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.authProviderId, "supabase-auth");
      assert.equal(status.databaseProviderId, "supabase-postgres");
      assert.equal(status.ready, false);
      assert.equal(status.status, "unavailable");
      assert.equal(status.noAutomaticFallback, true);
      assert.equal(status.message, "The site is currently unavailable. Please try again later.");
      assert.match(status.operatorDiagnostic, /Supabase Auth connection is not configured/);

      const session = await apiPayload(server.baseUrl, "/api/session/current");
      assert.equal(session.status, 200);
      assert.equal(session.payload.ok, true);
      assert.equal(session.payload.data.authenticated, false);
      assert.match(session.payload.data.diagnostic, /Supabase Auth connection is not configured/);

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "creator@example.test",
        password: "not-stored",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.ok, false);
      assert.equal(signIn.payload.error, "The site is currently unavailable. Please try again later.");
    } finally {
      await server.close();
    }
  });
});

test("Provider contract assigns identity and product data ownership to Supabase providers", () => {
  const snapshot = createProviderContractSnapshot({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-safe-anon-key",
    GAMEFOUNDRY_DATABASE_URL: "server-only-database-url-placeholder",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "server-only-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test",
  });

  assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.activeProviders.status, "ready");
  assert.equal(snapshot.supabasePostgres.dataMigrationActive, true);
  assert.equal(snapshot.identityOwnership.ownerProviderId, "supabase-auth");
  assert.equal(snapshot.identityOwnership.readerProviderId, "supabase-postgres");
  assert.equal(snapshot.identityOwnership.productDatabaseProviderId, "supabase-postgres");
  assert.equal(snapshot.identityOwnership.identityConfigured, true);
  assert.equal(snapshot.identityOwnership.dataMigrationActive, true);
  assert.equal(snapshot.identityOwnership.userKeyAuthority, "users.key");
  assert.equal(snapshot.identityOwnership.browserAuthoritativeKeysAllowed, false);
  assert.deepEqual(snapshot.identityOwnership.ownershipFields, ["key", "createdAt", "updatedAt", "createdBy", "updatedBy"]);
  assert.deepEqual(snapshot.identityOwnership.tables, ["users", "roles", "user_roles"]);
  assert.match(snapshot.identityOwnership.staticDevUserUlidException, /DavidQ only/);
  assert.equal(snapshot.runtimeActivation.supabaseAuthActive, true);
  assert.equal(snapshot.runtimeActivation.supabasePostgresActive, true);
  assert.equal(snapshot.providerDiagnostics.secretValuesExposed, false);
  assert.equal(JSON.stringify(snapshot).includes("server-only-service-role-key"), false);
});

test("Auth status ignores legacy Local DB selectors when Supabase is configured", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "local-db",
    GAMEFOUNDRY_DB_PROVIDER: "local-db",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.status, "ready");
      assert.equal(status.message, "Account service is available.");
      assert.equal(status.configured, true);
      assert.equal(status.supabaseConfigPresent, true);
      assert.equal(status.supabaseProviderActive, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);
      assert.equal(status.authProviderId, "supabase-auth");
      assert.equal(status.databaseProviderId, "supabase-postgres");
      assert.match(status.operatorDiagnostic, /Supabase Auth configuration is present/);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.operatorOnly, true);
      assert.equal(preflight.active, true);
      assert.equal(preflight.supabaseConfigPresent, true);
      assert.equal(preflight.supabaseProviderActive, true);
      assert.equal(preflight.browserOwnedProductDataActive, false);
      assert.equal(preflight.supabaseProductDataActive, true);
      assert.equal(preflight.connectivityStatus, "healthy");
      assert.equal(preflight.connectivityHealthy, true);
      assert.equal(preflight.status, "healthy");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-runtime-provider").status, "PASS");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-product-data").status, "PASS");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "PASS");
      assert.equal(JSON.stringify(preflight).includes("test-anon-key"), false);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Fixed Supabase providers keep diagnostics available and block product data routes when not configured", async () => {
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
  }, async () => {
    const server = await startApiServer();
    try {
      const providerContract = await apiJson(server.baseUrl, "/api/providers/contract");
      assert.equal(providerContract.activeProviders.authProviderId, "supabase-auth");
      assert.equal(providerContract.activeProviders.databaseProviderId, "supabase-postgres");
      assert.equal(providerContract.activeProviders.status, "failed");
      assert.equal(providerContract.providerDiagnostics.providerFailures.length, 2);
      assert.equal(providerContract.supabasePreflight.overallStatus, "FAIL");
      assert.equal(providerContract.supabasePreflight.fallbackAllowed, false);

      const session = await apiPayload(server.baseUrl, "/api/session/current");
      assert.equal(session.status, 200);
      assert.equal(session.payload.ok, true);
      assert.equal(session.payload.data.authenticated, false);
      assert.match(session.payload.data.diagnostic, /Supabase Auth connection is not configured/);

      const snapshot = await apiPayload(server.baseUrl, "/api/product-data/snapshot");
      assert.equal(snapshot.status, 500);
      assert.equal(snapshot.payload.ok, false);
      assert.match(snapshot.payload.error, /database connection is not configured/);
    } finally {
      await server.close();
    }
  });
});

test("Missing Supabase config fails safely without product data fallback", async () => {
  await withEnv({
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, false);
      assert.equal(status.active, true);
      assert.equal(status.configured, false);
      assert.equal(status.supabaseConfigPresent, false);
      assert.equal(status.supabaseProviderActive, true);
      assert.equal(status.supabaseConnectivityStatus, "not-configured");
      assert.equal(status.connectivityHealthy, null);
      assert.equal(status.databaseProviderId, "supabase-postgres");
      assert.equal(status.browserOwnedProductDataActive, false);
      assert.equal(status.supabaseProductDataActive, true);
      assert.equal(status.noAutomaticFallback, true);
      assert.equal(status.message, "The site is currently unavailable. Please try again later.");
      assert.match(status.operatorDiagnostic, /Supabase Auth connection is not configured/);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.supabaseConfigPresent, false);
      assert.equal(preflight.supabaseProviderActive, true);
      assert.equal(preflight.supabaseProductDataActive, true);
      assert.equal(preflight.connectivityStatus, "not-configured");
      assert.equal(preflight.connectivityHealthy, false);
      assert.equal(preflight.checks.find((check) => check.id === "supabase-config-present").status, "FAIL");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-product-data").status, "PASS");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "SKIP");

      const session = await apiPayload(server.baseUrl, "/api/session/current");
      assert.equal(session.status, 200);
      assert.equal(session.payload.ok, true);
      assert.equal(session.payload.data.authenticated, false);
      assert.match(session.payload.data.diagnostic, /Supabase Auth connection is not configured/);

      const snapshot = await apiPayload(server.baseUrl, "/api/product-data/snapshot");
      assert.equal(snapshot.status, 500);
      assert.equal(snapshot.payload.ok, false);
      assert.match(snapshot.payload.error, /database connection is not configured/);

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "creator@example.test",
        password: "not-stored",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.ok, false);
      assert.equal(signIn.payload.error, "The site is currently unavailable. Please try again later.");
    } finally {
      await server.close();
    }
  });
});

test("Configured Supabase Auth enables sign-in attempt before identity readiness", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTablesUnavailable: true,
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.message, "Account service is available.");
      assert.equal(status.supabaseConfigPresent, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "creator@example.test",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.ok, false);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/token?grant_type=password"), true);
      assert.equal(JSON.stringify(signIn.payload).includes("not-stored-locally"), false);
      assert.equal(JSON.stringify(signIn.payload).includes("test-anon-key"), false);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Account auth routes call external Supabase Auth and sanitize identity readiness failures", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.configured, true);
      assert.equal(status.browserOwnedProductDataActive, false);
      assert.equal(status.supabaseProductDataActive, true);
      assert.equal(status.message, "Account service is available.");
      assert.equal(status.supabaseConfigPresent, true);
      assert.equal(status.supabaseProviderActive, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.supabaseConfigPresent, true);
      assert.equal(preflight.supabaseProviderActive, true);
      assert.equal(preflight.browserOwnedProductDataActive, false);
      assert.equal(preflight.supabaseProductDataActive, true);
      assert.equal(preflight.connectivityStatus, "healthy");
      assert.equal(preflight.connectivityHealthy, true);
      assert.equal(preflight.checks.find((check) => check.id === "supabase-runtime-provider").status, "PASS");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "PASS");

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "user1@example.invalid",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.ok, false);
      assert.equal(signIn.payload.error, "Account identity setup is incomplete. Please contact support.");
      assert.equal(JSON.stringify(signIn.payload).includes("fake-supabase-access-token"), false);
      assert.equal(JSON.stringify(signIn.payload).includes("fake-supabase-refresh-token"), false);

      const session = await apiJson(server.baseUrl, "/api/session/current");
      assert.equal(session.authenticated, false);
      assert.match(session.diagnostic, /identity table validation failed|database connection is not configured/i);

      const createAccount = await postApiPayload(server.baseUrl, "/api/auth/create-account", {
        email: "new@example.test",
        password: "not-stored-locally",
      });
      assert.equal(createAccount.status, 503);
      assert.equal(createAccount.payload.ok, false);
      assert.equal(createAccount.payload.error, "Account identity setup is incomplete. Please contact support.");

      const reset = await postApiPayload(server.baseUrl, "/api/auth/password-reset", {
        email: "reset@example.test",
      });
      assert.equal(reset.status, 200);
      assert.equal(reset.payload.data.action, "password-reset");
      assert.equal(reset.payload.data.redirectToIncluded, true);
      assert.equal(reset.payload.data.message, "If an account exists for that email, password reset instructions will be sent.");

      assert.equal(fakeSupabase.calls.filter((call) => call.path === "/auth/v1/health").length >= 1, true);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/token?grant_type=password"), true);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/admin/users"), true);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/recover"), true);
      assert.equal(fakeSupabase.calls
        .filter((call) => call.path.startsWith("/auth/v1/") && call.path !== "/auth/v1/admin/users")
        .every((call) => call.headers.apikey === "test-anon-key"), true);
      assert.equal(fakeSupabase.calls
        .filter((call) => call.path === "/auth/v1/admin/users")
        .every((call) => call.headers.apikey === "test-service-role-key"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Create account provisions Supabase identity user default role and user_roles before sign-in", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: {
      roles: [],
      user_roles: [],
      users: [],
    },
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.identityTablesReady, true);
      assert.deepEqual(preflight.identityTableRecords, {
        roles: 0,
        user_roles: 0,
        users: 0,
      });

      const createAccount = await postApiPayload(server.baseUrl, "/api/auth/create-account", {
        email: "new.creator@example.test",
        password: "not-stored-locally",
      });
      assert.equal(createAccount.status, 200);
      assert.equal(createAccount.payload.ok, true);
      assert.equal(createAccount.payload.data.identityProvisioned, true);
      assert.equal(createAccount.payload.data.roleCreated, true);
      assert.equal(createAccount.payload.data.userRoleCreated, true);
      assert.deepEqual(createAccount.payload.data.roleSlugs, ["creator"]);
      assert.match(createAccount.payload.data.userKey, /^[0-9A-HJKMNP-TV-Z]{26}$/);
      assert.equal(Object.values(SEED_DB_KEYS.users).includes(createAccount.payload.data.userKey), false);
      assert.deepEqual(createAccount.payload.data.identityTableRecords, {
        roles: 1,
        user_roles: 1,
        users: 1,
      });

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "new.creator@example.test",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 200);
      assert.equal(signIn.payload.data.sessionResolved, true);
      assert.equal(signIn.payload.data.userKey, createAccount.payload.data.userKey);
      assert.deepEqual(signIn.payload.data.roleSlugs, ["creator"]);

      const current = await apiJson(server.baseUrl, "/api/session/current");
      assert.equal(current.authenticated, true);
      assert.equal(current.userKey, createAccount.payload.data.userKey);
      assert.deepEqual(current.roleSlugs, ["creator"]);

      const restPosts = fakeSupabase.calls
        .filter((call) => call.method === "POST" && call.path.startsWith("/rest/v1/"))
        .map((call) => call.path);
      assert.deepEqual(restPosts, [
        "/rest/v1/users?on_conflict=key",
        "/rest/v1/roles?on_conflict=key",
        "/rest/v1/user_roles?on_conflict=key",
      ]);
      assert.equal(fakeSupabase.calls
        .filter((call) => call.path.startsWith("/rest/v1/"))
        .every((call) => call.headers.apikey === "test-service-role-key"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase sign-in resolves the session from database users.key matched by Auth id", async () => {
  const databaseOwnedUserKey = "01J00000000000000000000001";
  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: SEED_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: SEED_DB_KEYS.users.admin,
  };
  const identityTables = fakeSupabaseIdentityTables({
    user_roles: [
      {
        key: SEED_DB_KEYS.userRoles.user1User,
        userKey: databaseOwnedUserKey,
        roleKey: SEED_DB_KEYS.roles.creator,
        ...audit,
      },
    ],
    users: [
      {
        key: databaseOwnedUserKey,
        displayName: "Database Creator",
        email: "user1@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-user-1",
        isActive: true,
        ...audit,
      },
    ],
  });
  const fakeSupabase = await startFakeSupabaseAuthServer({ identityTables });
  await withEnv({
    GAMEFOUNDRY_DATABASE_SSL: "disable",
    GAMEFOUNDRY_DATABASE_URL: "postgres://contract_user:contract_password@supabase-provider.example.test/gamefoundry",
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer({
      supabasePostgresClient: fakePostgresIdentityClient(identityTables),
    });
    try {
      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "user1@example.invalid",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 200);
      assert.equal(signIn.payload.data.sessionResolved, true);
      assert.equal(signIn.payload.data.userKey, databaseOwnedUserKey);
      assert.equal(Object.values(SEED_DB_KEYS.users).includes(signIn.payload.data.userKey), false);

      const current = await apiJson(server.baseUrl, "/api/session/current");
      assert.equal(current.authenticated, true);
      assert.equal(current.userKey, databaseOwnedUserKey);
      assert.equal(current.displayName, "Database Creator");
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase sign-in does not resolve a session from email when authProviderUserId is stale", async () => {
  const databaseOwnedUserKey = "01J00000000000000000000002";
  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: SEED_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: SEED_DB_KEYS.users.admin,
  };
  const identityTables = fakeSupabaseIdentityTables({
    user_roles: [
      {
        key: SEED_DB_KEYS.userRoles.user1User,
        userKey: databaseOwnedUserKey,
        roleKey: SEED_DB_KEYS.roles.creator,
        ...audit,
      },
    ],
    users: [
      {
        key: databaseOwnedUserKey,
        displayName: "Database Creator",
        email: "user1@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "stale-supabase-user-1",
        isActive: true,
        ...audit,
      },
    ],
  });
  const fakeSupabase = await startFakeSupabaseAuthServer({ identityTables });
  await withEnv({
    GAMEFOUNDRY_DATABASE_SSL: "disable",
    GAMEFOUNDRY_DATABASE_URL: "postgres://contract_user:contract_password@supabase-provider.example.test/gamefoundry",
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer({
      supabasePostgresClient: fakePostgresIdentityClient(identityTables),
    });
    try {
      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "user1@example.invalid",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.ok, false);
      assert.equal(signIn.payload.error, "Account identity setup is incomplete. Please contact support.");
      assert.equal(JSON.stringify(signIn.payload).includes("stale-supabase-user-1"), false);
      assert.equal(JSON.stringify(signIn.payload).includes(databaseOwnedUserKey), false);

      const current = await apiJson(server.baseUrl, "/api/session/current");
      assert.equal(current.authenticated, false);
      assert.equal(current.userKey, null);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Create account provider failure returns generic browser error and logs safe operator diagnostics", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    failAdminCreateAccount: {
      payload: { message: "User already registered" },
      status: 422,
    },
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      await withCapturedConsoleWarn(async (warnings) => {
        const createAccount = await postApiPayload(server.baseUrl, "/api/auth/create-account", {
          email: "existing.creator@example.test",
          password: "not-stored-locally",
        });
        assert.equal(createAccount.status, 503);
        assert.equal(createAccount.payload.ok, false);
        assert.equal(createAccount.payload.error, "The site is currently unavailable. Please try again later.");
        assert.equal(JSON.stringify(createAccount.payload).includes("User already registered"), false);
        assert.equal(JSON.stringify(createAccount.payload).includes("existing.creator@example.test"), false);
        assert.equal(warnings.length, 3);
        assert.match(warnings[0], /\[auth\/operator\] POST \/api\/auth\/create-account diagnostic phase=start/);
        assert.match(warnings[1], /\[auth\/operator\] POST \/api\/auth\/create-account diagnostic phase=upstream-failed/);
        assert.match(warnings[1], /safeMessage=Supabase Auth request failed with HTTP 422\./);
        assert.match(warnings[2], /\[auth\/operator\] POST \/api\/auth\/create-account failed:/);
        assert.match(warnings[2], /Create account: Supabase Auth request failed with HTTP 422\./);
        assert.equal(warnings.join("\n").includes("User already registered"), false);
        assert.equal(warnings.join("\n").includes("test-service-role-key"), false);
      });
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/admin/users"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Create account identity provisioning failure returns support message after Auth succeeds", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    adminCreateAccountPayload: {
      user: {
        email: "no-identity-id@example.test",
      },
    },
    identityTables: {
      roles: [],
      user_roles: [],
      users: [],
    },
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      await withCapturedConsoleWarn(async (warnings) => {
        const createAccount = await postApiPayload(server.baseUrl, "/api/auth/create-account", {
          email: "no-identity-id@example.test",
          password: "not-stored-locally",
        });
        assert.equal(createAccount.status, 503);
        assert.equal(createAccount.payload.ok, false);
        assert.equal(createAccount.payload.error, "Account identity setup is incomplete. Please contact support.");
        assert.equal(JSON.stringify(createAccount.payload).includes("no-identity-id@example.test"), false);
        assert.equal(warnings.length, 3);
        assert.match(warnings[0], /\[auth\/operator\] POST \/api\/auth\/create-account diagnostic phase=start/);
        assert.match(warnings[1], /\[auth\/operator\] POST \/api\/auth\/create-account diagnostic phase=identity-provisioning-failed/);
        assert.match(warnings[1], /Create account: Supabase Auth did not return the user id and email required for identity provisioning\./);
        assert.match(warnings[2], /\[auth\/operator\] POST \/api\/auth\/create-account failed:/);
        assert.match(warnings[2], /Create account: Supabase Auth did not return the user id and email required for identity provisioning\./);
      });
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/admin/users"), true);
      assert.equal(fakeSupabase.calls.some((call) => call.method === "POST" && call.path.startsWith("/rest/v1/")), false);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Password reset rate limit returns safe message and logs upstream HTTP 429", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    failPasswordReset: {
      payload: {
        code: "over_email_send_rate_limit",
        message: "Email rate limit exceeded for reset429@example.test",
      },
      status: 429,
    },
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      await withCapturedConsoleWarn(async (warnings) => {
        const reset = await postApiPayload(server.baseUrl, "/api/auth/password-reset", {
          email: "reset429@example.test",
        });
        assert.equal(reset.status, 429);
        assert.equal(reset.payload.ok, false);
        assert.equal(reset.payload.error, "Too many reset requests. Please wait and try again later.");
        assert.equal(JSON.stringify(reset.payload).includes("Email rate limit exceeded"), false);
        assert.equal(JSON.stringify(reset.payload).includes("reset429@example.test"), false);
        assert.equal(warnings.length, 3);
        assert.match(warnings[0], /\[auth\/operator\] POST \/api\/auth\/password-reset diagnostic phase=start/);
        assert.match(warnings[1], /\[auth\/operator\] POST \/api\/auth\/password-reset diagnostic phase=upstream-rate-limited/);
        assert.match(warnings[1], /upstreamStatusCode=429/);
        assert.match(warnings[1], /safeErrorCode=over_email_send_rate_limit/);
        assert.match(warnings[1], /safeMessage=Supabase Auth request failed with HTTP 429\./);
        assert.match(warnings[2], /\[auth\/operator\] POST \/api\/auth\/password-reset failed:/);
        assert.match(warnings[2], /Password reset: Supabase Auth request failed with HTTP 429\./);
        assert.equal(warnings.join("\n").includes("Email rate limit exceeded"), false);
        assert.equal(warnings.join("\n").includes("reset429@example.test"), false);
      });
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/recover"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Password reset non-429 provider failure returns generic unavailable message", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    failPasswordReset: {
      payload: {
        message: "Provider outage for reset500@example.test",
      },
      status: 500,
    },
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      await withCapturedConsoleWarn(async (warnings) => {
        const reset = await postApiPayload(server.baseUrl, "/api/auth/password-reset", {
          email: "reset500@example.test",
        });
        assert.equal(reset.status, 503);
        assert.equal(reset.payload.ok, false);
        assert.equal(reset.payload.error, "The site is currently unavailable. Please try again later.");
        assert.equal(JSON.stringify(reset.payload).includes("Provider outage"), false);
        assert.equal(JSON.stringify(reset.payload).includes("reset500@example.test"), false);
        assert.equal(warnings.length, 3);
        assert.match(warnings[1], /\[auth\/operator\] POST \/api\/auth\/password-reset diagnostic phase=upstream-failed/);
        assert.match(warnings[1], /upstreamStatusCode=500/);
        assert.match(warnings[1], /safeMessage=Supabase Auth request failed with HTTP 500\./);
        assert.match(warnings[2], /Password reset: Supabase Auth request failed with HTTP 500\./);
        assert.equal(warnings.join("\n").includes("Provider outage"), false);
        assert.equal(warnings.join("\n").includes("reset500@example.test"), false);
      });
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/recover"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase sign in fails visibly when the Auth user has no app identity row", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: {
      roles: [],
      user_roles: [],
      users: [],
    },
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);

      await withCapturedConsoleWarn(async (warnings) => {
        const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
          email: "missing.identity@example.test",
          password: "not-stored-locally",
        });
        assert.equal(signIn.status, 503);
        assert.equal(signIn.payload.ok, false);
        assert.equal(signIn.payload.error, "Account identity setup is incomplete. Please contact support.");
        assert.equal(JSON.stringify(signIn.payload).includes("missing.identity@example.test"), false);
        assert.equal(warnings.length, 3);
        assert.match(warnings[0], /\[auth\/operator\] POST \/api\/auth\/sign-in diagnostic phase=start/);
        assert.match(warnings[1], /\[auth\/operator\] POST \/api\/auth\/sign-in diagnostic phase=session-resolution-failed/);
        assert.match(warnings[1], /safeMessage=Sign in: Account authentication succeeded, but no matching users record exists for this account\./);
        assert.match(warnings[2], /\[auth\/operator\] POST \/api\/auth\/sign-in failed:/);
        assert.match(warnings[2], /Sign in: Account authentication succeeded, but no matching users record exists for this account\./);
        assert.equal(warnings.join("\n").includes("missing.identity@example.test"), false);
        assert.equal(warnings.join("\n").includes("not-stored-locally"), false);
        assert.equal(warnings.join("\n").includes("fake-supabase-access-token"), false);
        assert.equal(warnings.join("\n").includes("test-service-role-key"), false);
      });
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase account actions fail actionably when identity tables are missing", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTablesUnavailable: true,
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);
      assert.equal(status.message, "Account service is available.");

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.identityTablesReady, false);
      assert.match(preflight.checks.find((check) => check.id === "supabase-identity-tables").summary, /identity table validation failed|supabase-identity-tables\.sql/i);

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "creator@example.test",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.ok, false);
      assert.equal(signIn.payload.error, "Account identity setup is incomplete. Please contact support.");
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/token?grant_type=password"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Default Supabase Auth routes call external auth and keep identity failures safe", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: undefined,
    GAMEFOUNDRY_DB_PROVIDER: undefined,
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.authProviderId, "supabase-auth");
      assert.equal(status.databaseProviderId, "supabase-postgres");
      assert.equal(status.browserOwnedProductDataActive, false);
      assert.equal(status.supabaseProductDataActive, true);
      assert.equal(status.message, "Account service is available.");
      assert.equal(status.noAutomaticFallback, true);
      assert.equal(status.active, true);
      assert.equal(status.configured, true);
      assert.equal(status.connectivityHealthy, null);

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "user1@example.invalid",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.ok, false);
      assert.equal(signIn.payload.error, "Account identity setup is incomplete. Please contact support.");

      const createAccount = await postApiPayload(server.baseUrl, "/api/auth/create-account", {
        email: "default-create@example.test",
        password: "not-stored-locally",
      });
      assert.equal(createAccount.status, 503);
      assert.equal(createAccount.payload.ok, false);
      assert.equal(createAccount.payload.error, "Account identity setup is incomplete. Please contact support.");

      const reset = await postApiPayload(server.baseUrl, "/api/auth/password-reset", {
        email: "default-reset@example.test",
      });
      assert.equal(reset.status, 200);
      assert.equal(reset.payload.data.action, "password-reset");
      assert.equal(reset.payload.data.providerId, "supabase-auth");

      assert.equal(fakeSupabase.calls.filter((call) => call.path === "/auth/v1/health").length >= 1, true);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/token?grant_type=password"), true);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/admin/users"), true);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/recover"), true);
      assert.equal(fakeSupabase.calls
        .filter((call) => call.path.startsWith("/auth/v1/") && call.path !== "/auth/v1/admin/users")
        .every((call) => call.headers.apikey === "test-anon-key"), true);
      assert.equal(fakeSupabase.calls
        .filter((call) => call.path === "/auth/v1/admin/users")
        .every((call) => call.headers.apikey === "test-service-role-key"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase Auth selected path reads users roles user_roles and product data through Supabase providers", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const contract = await apiJson(server.baseUrl, "/api/providers/contract");
      assert.equal(contract.activeProviders.authProviderId, "supabase-auth");
      assert.equal(contract.activeProviders.databaseProviderId, "supabase-postgres");
      assert.equal(contract.identityOwnership.ownerProviderId, "supabase-auth");
      assert.equal(contract.identityOwnership.readerProviderId, "supabase-postgres");
      assert.equal(contract.identityOwnership.productDatabaseProviderId, "supabase-postgres");
      assert.equal(contract.identityOwnership.dataMigrationActive, true);
      assert.equal(contract.identityOwnership.userKeyAuthority, "users.key");
      assert.deepEqual(contract.identityOwnership.tables, ["users", "roles", "user_roles"]);

      const users = await apiJson(server.baseUrl, "/api/session/users");
      assert.equal(users.some((user) => user.displayName === "User 1" && user.roleSlugs.includes("creator")), true);
      assert.equal(users.some((user) => user.displayName === "DavidQ" && user.isAdmin), true);

      const signIn = await postApiPayload(server.baseUrl, "/api/session/user", {
        userKey: SEED_DB_KEYS.users.user1,
      });
      assert.equal(signIn.status, 200);
      assert.equal(signIn.payload.ok, true);
      assert.equal(signIn.payload.data.authenticated, true);
      assert.equal(signIn.payload.data.userKey, SEED_DB_KEYS.users.user1);
      assert.equal(signIn.payload.data.displayName, "User 1");
      assert.deepEqual(signIn.payload.data.roleSlugs, ["creator"]);

      const current = await apiJson(server.baseUrl, "/api/session/current");
      assert.equal(current.authenticated, true);
      assert.equal(current.userKey, SEED_DB_KEYS.users.user1);

      const snapshot = await apiJson(server.baseUrl, "/api/product-data/snapshot");
      assert.equal(Array.isArray(snapshot.tables.asset_library_items), true);
      assert.equal(Array.isArray(snapshot.tables.game_input_mappings), true);

      const restCalls = fakeSupabase.calls
        .filter((call) => call.path.startsWith("/rest/v1/"))
        .map((call) => call.path);
      assert.equal(restCalls.includes("/rest/v1/users?select=*"), true);
      assert.equal(restCalls.includes("/rest/v1/roles?select=*"), true);
      assert.equal(restCalls.includes("/rest/v1/user_roles?select=*"), true);
      assert.equal(restCalls.length >= 9, true);
      assert.equal(fakeSupabase.calls
        .filter((call) => call.path.startsWith("/rest/v1/"))
        .every((call) => call.headers.apikey === "test-service-role-key"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase identity session lookup fails visibly when the selected user is missing", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const response = await postApiPayload(server.baseUrl, "/api/session/user", {
        userKey: "01K2GFSJ0Y0000000000000099",
      });
      assert.equal(response.status, 200);
      assert.equal(response.payload.ok, true);
      assert.equal(response.payload.data.authenticated, false);
      assert.match(response.payload.data.diagnostic, /Selected Supabase identity user key .* is missing from users/);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase identity session lookup fails visibly when the selected user key is malformed", async () => {
  const server = await startApiServer();
  try {
    const response = await postApiPayload(server.baseUrl, "/api/session/user", {
      userKey: "not-a-users-key",
    });
    assert.equal(response.status, 200);
    assert.equal(response.payload.ok, true);
    assert.equal(response.payload.data.authenticated, false);
    assert.match(response.payload.data.diagnostic, /not a valid users\.key/);

    const logout = await postApiPayload(server.baseUrl, "/api/session/logout", {});
    assert.equal(logout.status, 200);
    assert.equal(logout.payload.ok, true);
    assert.equal(logout.payload.data.authenticated, false);
    assert.doesNotMatch(logout.payload.data.diagnostic || "", /not a valid users\.key/);
  } finally {
    await server.close();
  }
});

test("Supabase identity session lookup fails visibly when user_roles references a missing role", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: fakeSupabaseIdentityTables({
      user_roles: [
        {
          key: SEED_DB_KEYS.userRoles.user1User,
          userKey: SEED_DB_KEYS.users.user1,
          roleKey: "01K2GFSJ0Y0000000000000199",
          createdAt: "2026-06-15T00:00:00.000Z",
          createdBy: SEED_DB_KEYS.users.admin,
          updatedAt: "2026-06-15T00:00:00.000Z",
          updatedBy: SEED_DB_KEYS.users.admin,
        },
      ],
    }),
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const response = await postApiPayload(server.baseUrl, "/api/session/user", {
        userKey: SEED_DB_KEYS.users.user1,
      });
      assert.equal(response.status, 200);
      assert.equal(response.payload.ok, true);
      assert.equal(response.payload.data.authenticated, false);
      assert.match(response.payload.data.diagnostic, /references missing role key/);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase identity table session resolver exposes Creator Admin and Owner role state", () => {
  const admin = sessionUserFromIdentityTables(
    fakeSupabaseIdentityTables(),
    SEED_DB_KEYS.users.admin,
    "account",
    "Supabase identity",
  );
  assert.equal(admin.authenticated, true);
  assert.equal(admin.userKey, SEED_DB_KEYS.users.admin);
  assert.equal(admin.isAdmin, true);
  assert.equal(admin.isOwner, false);
  assert.deepEqual(admin.roleSlugs, ["admin"]);

  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: SEED_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: SEED_DB_KEYS.users.admin,
  };
  const tables = fakeSupabaseIdentityTables({
    roles: [
      {
        key: SEED_DB_KEYS.roles.creator,
        roleSlug: "creator",
        name: "Creator",
        description: "Creator account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.roles.admin,
        roleSlug: "admin",
        name: "Admin",
        description: "Administrative account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.roles.owner,
        roleSlug: "owner",
        name: "Owner",
        description: "Owner account.",
        isActive: true,
        isSystemRole: false,
        ...audit,
      },
    ],
    user_roles: [
      {
        key: SEED_DB_KEYS.userRoles.user1User,
        userKey: SEED_DB_KEYS.users.user1,
        roleKey: SEED_DB_KEYS.roles.creator,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.userRoles.adminUser,
        userKey: SEED_DB_KEYS.users.admin,
        roleKey: SEED_DB_KEYS.roles.creator,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.userRoles.adminAdmin,
        userKey: SEED_DB_KEYS.users.admin,
        roleKey: SEED_DB_KEYS.roles.admin,
        ...audit,
      },
      {
        key: SEED_DB_KEYS.userRoles.adminOwner,
        userKey: SEED_DB_KEYS.users.admin,
        roleKey: SEED_DB_KEYS.roles.owner,
        ...audit,
      },
    ],
  });

  const creator = sessionUserFromIdentityTables(
    tables,
    SEED_DB_KEYS.users.user1,
    "account",
    "Supabase identity",
  );
  assert.equal(creator.authenticated, true);
  assert.equal(creator.userKey, SEED_DB_KEYS.users.user1);
  assert.equal(creator.isAdmin, false);
  assert.equal(creator.isOwner, false);
  assert.deepEqual(creator.roleSlugs, ["creator"]);

  const owner = sessionUserFromIdentityTables(
    tables,
    SEED_DB_KEYS.users.admin,
    "account",
    "Supabase identity",
  );
  assert.equal(owner.authenticated, true);
  assert.equal(owner.userKey, SEED_DB_KEYS.users.admin);
  assert.equal(owner.isAdmin, true);
  assert.equal(owner.isOwner, true);
  assert.deepEqual(owner.roleSlugs, ["creator", "admin", "owner"]);
});

test("Supabase identity table session resolver reports missing user and missing role diagnostics", () => {
  const tables = fakeSupabaseIdentityTables();
  const missingUser = sessionUserFromIdentityTables(
    tables,
    "01K2GFSJ0Y0000000000000099",
    "account",
    "Supabase identity",
  );
  assert.equal(missingUser.authenticated, false);
  assert.match(missingUser.diagnostic, /Selected Supabase identity user key .* is missing from users/);

  const missingRole = sessionUserFromIdentityTables(
    fakeSupabaseIdentityTables({
      user_roles: [
        {
          key: SEED_DB_KEYS.userRoles.user1User,
          userKey: SEED_DB_KEYS.users.user1,
          roleKey: "01K2GFSJ0Y0000000000000088",
          createdAt: "2026-06-15T00:00:00.000Z",
          createdBy: SEED_DB_KEYS.users.admin,
          updatedAt: "2026-06-15T00:00:00.000Z",
          updatedBy: SEED_DB_KEYS.users.admin,
        },
      ],
    }),
    SEED_DB_KEYS.users.user1,
    "account",
    "Supabase identity",
  );
  assert.equal(missingRole.authenticated, false);
  assert.match(missingRole.diagnostic, /references missing role key/);
});

test("Operator auth preflight reports failed Supabase connectivity for wrong anon key without exposing secrets", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    expectedApiKey: "expected-anon-key",
    rejectWrongApiKey: true,
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "wrong-anon-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.supabaseConfigPresent, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);
      assert.equal(status.message, "Account service is available.");
      assert.match(status.operatorDiagnostic, /Supabase Auth configuration is present/);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.supabaseConfigPresent, true);
      assert.equal(preflight.supabaseProviderActive, true);
      assert.equal(preflight.connectivityStatus, "failed");
      assert.equal(preflight.connectivityHealthy, false);
      assert.equal(preflight.status, "failed");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "FAIL");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").httpStatus, 401);
      assert.equal(JSON.stringify(preflight).includes("wrong-anon-key"), false);
      assert.equal(JSON.stringify(preflight).includes("expected-anon-key"), false);

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "user1@example.invalid",
        password: "not-stored",
      });
      assert.equal(signIn.status, 503);
      assert.equal(signIn.payload.error, "The site is currently unavailable. Please try again later.");
      assert.equal(JSON.stringify(signIn.payload).includes("wrong-anon-key"), false);
      assert.equal(fakeSupabase.calls.some((call) => call.path === "/auth/v1/token?grant_type=password"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Supabase stubs do not expose server-only secret names or values through the Local API", async () => {
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_DATABASE_URL: "server-only-database-url-placeholder",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
  }, async () => {
    const server = await startApiServer();
    try {
      const [providerContract, adapterContract] = await Promise.all([
        apiJson(server.baseUrl, "/api/providers/contract"),
        apiJson(server.baseUrl, "/api/data-source/adapter-contract"),
      ]);
      const providerText = JSON.stringify(providerContract);
      const adapterText = JSON.stringify(adapterContract);
      assert.equal(providerContract.activeProviders.authProviderId, "supabase-auth");
      assert.equal(providerContract.activeProviders.databaseProviderId, "supabase-postgres");
      assert.equal(providerContract.activeProviders.status, "failed");
      assert.equal(providerContract.providerDiagnostics.activeProvider.authProviderId, "supabase-auth");
      assert.equal(providerContract.failureContract.automaticFallbackAllowed, false);
      assert.equal(providerContract.providerDiagnostics.secretValuesExposed, false);
      assert.equal(providerContract.providerDiagnostics.serverOnlyEnvironmentVariableNamesExposed, false);
      assert.equal(providerContract.supabasePreflight.secretValuesExposed, false);
      assert.equal(providerContract.supabasePreflight.serverOnlySecretNamesExposed, false);
      assert.equal(providerContract.supabasePostgres.serverOnlySecretsExposed, false);
      assert.equal(adapterContract.providerContract.supabasePostgres.serverOnlySecretNamesExposed, false);
      assert.equal(providerText.includes("not-a-real-service-role-test-value"), false);
      assert.equal(providerText.includes("server-only-database-url-placeholder"), false);
      assert.equal(providerText.includes("GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY"), false);
      assert.equal(providerText.includes("GAMEFOUNDRY_DATABASE_URL"), false);
      assert.equal(adapterText.includes("not-a-real-service-role-test-value"), false);
      assert.equal(adapterText.includes("server-only-database-url-placeholder"), false);
    } finally {
      await server.close();
    }
  });
});

test("Supabase Auth adapter fails visibly when selected without configuration", async () => {
  const auth = new SupabaseAuthProviderStub({ env: { GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth" } });
  await assert.rejects(() => auth.getCurrentUser(), /Supabase Auth connection is not configured/);
  await assert.rejects(() => auth.signIn(), /Supabase Auth connection is not configured/);
  await assert.rejects(() => auth.signOut(), /Supabase Auth connection is not configured/);
  await assert.rejects(() => auth.createAccount(), /Supabase Auth connection is not configured/);
  await assert.rejects(() => auth.listAdminUsers(), /Supabase Auth connection is not configured/);
  await assert.rejects(() => auth.listAllAdminUsers(), /Supabase Auth connection is not configured/);
  await assert.rejects(() => auth.updateAccount(), /Supabase Auth connection is not configured/);
  await assert.rejects(() => auth.requestPasswordReset(), /Supabase Auth connection is not configured/);
  assert.throws(() => auth.requireRole(), /future app user mapping adapter/);
});

test("Supabase Auth adapter uses service role only for server-owned account creation", async () => {
  const calls = [];
  const auth = new SupabaseAuthProviderAdapter({
    env: {
      GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
      GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test/",
    },
    fetchImpl: async (url, options) => {
      calls.push({ options, url });
      return {
        json: async () => ({ ok: true, url }),
        ok: true,
        status: 200,
      };
    },
  });

  await auth.signIn({ email: "creator@example.test", password: "test-password" });
  await auth.createAccount({ email: "new@example.test", password: "new-password" });
  await auth.listAdminUsers();
  await auth.updateAccount({ authProviderUserId: "supabase-test-user-id", email: "new@example.test", password: "new-password" });
  await auth.deleteTestAccount({ authProviderUserId: "supabase-test-user-id" });
  await auth.requestPasswordReset({ email: "reset@example.test", redirectTo: "http://127.0.0.1:5501/account/password-reset.html" });
  await auth.getCurrentUser({ accessToken: "user-access-token" });
  await auth.signOut({ accessToken: "user-access-token" });

  assert.deepEqual(calls.map((call) => call.url), [
    "https://supabase-dev.example.test/auth/v1/token?grant_type=password",
    "https://supabase-dev.example.test/auth/v1/admin/users",
    "https://supabase-dev.example.test/auth/v1/admin/users?page=1&per_page=100",
    "https://supabase-dev.example.test/auth/v1/admin/users/supabase-test-user-id",
    "https://supabase-dev.example.test/auth/v1/admin/users/supabase-test-user-id",
    "https://supabase-dev.example.test/auth/v1/recover",
    "https://supabase-dev.example.test/auth/v1/user",
    "https://supabase-dev.example.test/auth/v1/logout",
  ]);
  assert.equal(calls[0].options.headers.apikey, "test-anon-key");
  assert.equal(calls[1].options.headers.apikey, "not-a-real-service-role-test-value");
  assert.equal(calls[1].options.headers.authorization, "Bearer not-a-real-service-role-test-value");
  assert.equal(calls[2].options.headers.apikey, "not-a-real-service-role-test-value");
  assert.equal(calls[2].options.headers.authorization, "Bearer not-a-real-service-role-test-value");
  assert.equal(calls[3].options.headers.apikey, "not-a-real-service-role-test-value");
  assert.equal(calls[3].options.headers.authorization, "Bearer not-a-real-service-role-test-value");
  assert.equal(calls[4].options.headers.apikey, "not-a-real-service-role-test-value");
  assert.equal(calls[4].options.headers.authorization, "Bearer not-a-real-service-role-test-value");
  assert.equal(calls[5].options.headers.apikey, "test-anon-key");
  assert.equal(calls[6].options.headers.apikey, "test-anon-key");
  assert.equal(calls[7].options.headers.apikey, "test-anon-key");
  assert.equal(calls[6].options.headers.authorization, "Bearer user-access-token");
  assert.equal(calls[7].options.headers.authorization, "Bearer user-access-token");
});

test("Supabase Postgres adapter fails visibly when selected without configuration", async () => {
  const database = new SupabasePostgresProviderStub({ env: { GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres" } });
  assert.throws(() => database.connect(), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.getUsers(), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.getRoles(), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.getUserRoles(), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.initializeIdentity(), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.deleteUserByKey("user-key"), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.deleteUserRolesForUserKey("user-key"), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.reassignRoleAuditReferences({ fromUserKey: "from-user", toUserKey: "to-user" }), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.reassignUserRoleAuditReferences({ fromUserKey: "from-user", toUserKey: "to-user" }), /Supabase Postgres connection is not configured/);
  assert.throws(() => database.runSiteSetup(), /Supabase Postgres connection is not configured/);
  await assert.rejects(() => database.getDbViewerSnapshot(), /Supabase Postgres connection is not configured/);
});

test("Supabase Postgres adapter supports identity tables and readiness when configured", async () => {
  const calls = [];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_DATABASE_URL: "server-only-database-url-placeholder",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
      GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test/",
    },
    fetchImpl: async (url, options) => {
      calls.push({ options, url });
      const tableName = new URL(url).pathname.split("/").pop();
      return {
        json: async () => [{ key: `${tableName}-row` }],
        ok: true,
        status: 200,
      };
    },
    keyFactory: () => "01J00000000000000000000000",
  });

  assert.equal(database.createRecordKey(), "01J00000000000000000000000");
  assert.deepEqual(database.connect(), {
    boundary: "Browser -> API/Service Contract -> Database",
    providerId: "supabase-postgres",
    ready: true,
  });
  assert.equal(database.readiness().dbViewerReady, true);
  assert.equal(database.readiness().siteSetupReady, true);
  assert.equal(database.readiness().serverApiOwnsKeyGeneration, true);
  assert.deepEqual(database.runSiteSetup(), {
    executed: false,
    owner: "Admin -> Site Setup",
    providerId: "supabase-postgres",
    ready: true,
  });

  const snapshot = await database.getDbViewerSnapshot();
  assert.equal(Object.keys(snapshot.tables).includes("users"), true);
  assert.equal(Object.keys(snapshot.tables).includes("toolbox_tool_metadata"), true);
  assert.equal(Object.keys(snapshot.tables).includes("asset_library_items"), true);
  const urls = calls.map((call) => call.url);
  assert.equal(urls.includes("https://supabase-dev.example.test/rest/v1/users?select=*"), true);
  assert.equal(urls.includes("https://supabase-dev.example.test/rest/v1/roles?select=*"), true);
  assert.equal(urls.includes("https://supabase-dev.example.test/rest/v1/user_roles?select=*"), true);
  assert.equal(urls.includes("https://supabase-dev.example.test/rest/v1/toolbox_tool_metadata?select=*"), true);
  assert.equal(urls.includes("https://supabase-dev.example.test/rest/v1/asset_library_items?select=*"), true);
  assert.equal(calls.every((call) => call.options.headers.apikey === "not-a-real-service-role-test-value"), true);
});

test("Supabase Postgres adapter supports DEV cleanup deletes and audit reassignment", async () => {
  const calls = [];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_DATABASE_URL: "server-only-database-url-placeholder",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
      GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test/",
    },
    fetchImpl: async (url, options) => {
      calls.push({
        body: options.body ? JSON.parse(options.body) : null,
        method: options.method,
        url,
      });
      return {
        json: async () => [{ key: "changed-row" }],
        ok: true,
        status: 200,
      };
    },
  });

  await database.deleteUserRolesForUserKey("from-user");
  await database.deleteUserByKey("from-user");
  await database.reassignRoleAuditReferences({ fromUserKey: "from-user", toUserKey: "to-user" });
  await database.reassignUserRoleAuditReferences({ fromUserKey: "from-user", toUserKey: "to-user" });

  assert.deepEqual(calls, [
    {
      body: null,
      method: "DELETE",
      url: "https://supabase-dev.example.test/rest/v1/user_roles?userKey=eq.from-user",
    },
    {
      body: null,
      method: "DELETE",
      url: "https://supabase-dev.example.test/rest/v1/users?key=eq.from-user",
    },
    {
      body: { createdBy: "to-user" },
      method: "PATCH",
      url: "https://supabase-dev.example.test/rest/v1/roles?createdBy=eq.from-user",
    },
    {
      body: { updatedBy: "to-user" },
      method: "PATCH",
      url: "https://supabase-dev.example.test/rest/v1/roles?updatedBy=eq.from-user",
    },
    {
      body: { createdBy: "to-user" },
      method: "PATCH",
      url: "https://supabase-dev.example.test/rest/v1/user_roles?createdBy=eq.from-user",
    },
    {
      body: { updatedBy: "to-user" },
      method: "PATCH",
      url: "https://supabase-dev.example.test/rest/v1/user_roles?updatedBy=eq.from-user",
    },
  ]);
});

test("Supabase Postgres adapter initializes key-based users roles and user_roles", async () => {
  const calls = [];
  const generatedKeys = [
    "01J000000000000000000ROLE1",
    "01J000000000000000USERROLE1",
  ];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_DATABASE_URL: "server-only-database-url-placeholder",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
      GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test/",
    },
    fetchImpl: async (url, options) => {
      calls.push({
        body: options.body ? JSON.parse(options.body) : null,
        headers: options.headers,
        method: options.method,
        url,
      });
      return {
        json: async () => (options.body ? JSON.parse(options.body) : []),
        ok: true,
        status: 200,
      };
    },
    keyFactory: () => generatedKeys.shift(),
  });

  const result = await database.initializeIdentity({
    actorKey: SEED_DB_KEYS.users.admin,
    roles: [
      {
        roleSlug: "admin",
        name: "Admin",
        description: "Administrative user.",
        isSystemRole: false,
      },
    ],
    userRoles: [
      {
        userKey: SEED_DB_KEYS.users.admin,
        roleSlug: "admin",
      },
    ],
    users: [
      {
        key: SEED_DB_KEYS.users.admin,
        displayName: "DavidQ",
        email: "qbytes.dq@gmail.com",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-davidq",
      },
    ],
  });

  assert.deepEqual(calls.map((call) => `${call.method} ${call.url}`), [
    "GET https://supabase-dev.example.test/rest/v1/roles?select=*",
    "GET https://supabase-dev.example.test/rest/v1/user_roles?select=*",
    "POST https://supabase-dev.example.test/rest/v1/users?on_conflict=key",
    "POST https://supabase-dev.example.test/rest/v1/roles?on_conflict=key",
    "POST https://supabase-dev.example.test/rest/v1/user_roles?on_conflict=key",
  ]);
  assert.equal(calls.slice(2).every((call) => call.headers.prefer === "resolution=merge-duplicates,return=representation"), true);
  assert.equal(calls[2].body[0].key, SEED_DB_KEYS.users.admin);
  assert.equal(calls[2].body[0].createdBy, SEED_DB_KEYS.users.admin);
  assert.equal(calls[2].body[0].updatedBy, SEED_DB_KEYS.users.admin);
  assert.equal(calls[3].body[0].key, "01J000000000000000000ROLE1");
  assert.equal(calls[3].body[0].roleSlug, "admin");
  assert.equal(calls[4].body[0].key, "01J000000000000000USERROLE1");
  assert.equal(calls[4].body[0].userKey, SEED_DB_KEYS.users.admin);
  assert.equal(calls[4].body[0].roleKey, "01J000000000000000000ROLE1");
  assert.deepEqual(result.identityKeyModel, {
    roleKeyField: "roles.key",
    userKeyField: "users.key",
    userRoleRoleKeyField: "user_roles.roleKey",
    userRoleUserKeyField: "user_roles.userKey",
  });
  assert.deepEqual(result.initialized, {
    roles: 1,
    user_roles: 1,
    users: 1,
  });
  assert.equal(result.serverApiOwnsKeyGeneration, true);
  assert.equal(result.staticDevUserUlidExceptionUsed, true);
});

test("Supabase Postgres adapter reuses existing roleSlug and user_roles keys during identity initialization", async () => {
  const calls = [];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_DATABASE_URL: "server-only-database-url-placeholder",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
      GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test/",
    },
    fetchImpl: async (url, options) => {
      const body = options.body ? JSON.parse(options.body) : null;
      calls.push({
        body,
        headers: options.headers,
        method: options.method,
        url,
      });
      if (url.endsWith("/rest/v1/roles?select=*")) {
        return {
          json: async () => [{
            key: "01J000000000000000EXISTROLE",
            roleSlug: "admin",
          }],
          ok: true,
          status: 200,
        };
      }
      if (url.endsWith("/rest/v1/user_roles?select=*")) {
        return {
          json: async () => [{
            key: "01J000000000000EXISTUSERROLE",
            roleKey: "01J000000000000000EXISTROLE",
            userKey: SEED_DB_KEYS.users.admin,
          }],
          ok: true,
          status: 200,
        };
      }
      return {
        json: async () => (body || []),
        ok: true,
        status: 200,
      };
    },
    keyFactory: () => "01J000000000000UNUSEDKEY",
  });

  await database.initializeIdentity({
    actorKey: SEED_DB_KEYS.users.admin,
    roles: [
      {
        roleSlug: "admin",
        name: "Admin",
      },
    ],
    userRoles: [
      {
        userKey: SEED_DB_KEYS.users.admin,
        roleSlug: "admin",
      },
    ],
    users: [
      {
        key: SEED_DB_KEYS.users.admin,
        displayName: "DavidQ",
      },
    ],
  });

  assert.equal(calls[3].body[0].key, "01J000000000000000EXISTROLE");
  assert.equal(calls[3].body[0].roleSlug, "admin");
  assert.equal(calls[4].body[0].key, "01J000000000000EXISTUSERROLE");
  assert.equal(calls[4].body[0].roleKey, "01J000000000000000EXISTROLE");
  assert.equal(calls[4].body[0].userKey, SEED_DB_KEYS.users.admin);
});

test("Admin identity setup API fails visibly when Supabase Postgres is selected without config", async () => {
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "local-db",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
  }, async () => {
    const server = await startApiServer();
    try {
      const response = await postApiPayload(server.baseUrl, "/api/admin/setup/identity", {
        actorKey: SEED_DB_KEYS.users.admin,
      });
      assert.equal(response.status, 500);
      assert.equal(response.payload.ok, false);
      assert.match(response.payload.error, /Supabase Postgres connection is not configured/);
    } finally {
      await server.close();
    }
  });
});

test("Supabase activation diagnostics report readiness for fixed providers", () => {
  const snapshot = createProviderContractSnapshot({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_DATABASE_URL: "server-only-database-url-placeholder",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
    GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test/",
  });

  assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.activeProviders.status, "ready");
  assert.equal(snapshot.activationReadiness.readyBeforeActivation, true);
  assert.equal(snapshot.activationReadiness.runtimeProviderPathReady, true);
  assert.equal(snapshot.activationReadiness.siteSetupReady, true);
  assert.equal(snapshot.activationReadiness.supabaseAuthReady, true);
  assert.equal(snapshot.activationReadiness.supabasePostgresReady, true);
  assert.equal(snapshot.runtimeActivation.runtimeProviderPathReady, true);
  assert.equal(snapshot.runtimeActivation.supabaseAuthActive, true);
  assert.equal(snapshot.runtimeActivation.supabasePostgresActive, true);
  assert.equal(snapshot.supabasePreflight.overallStatus, "PASS");
  assert.equal(snapshot.supabasePreflight.supabaseActive, true);
  assert.equal(snapshot.supabasePreflight.runtimeProviderPathReady, true);
  assert.equal(snapshot.supabasePreflight.fallbackAllowed, false);
  assert.equal(preflightCheck(snapshot, "supabase-url").status, "PASS");
  assert.equal(preflightCheck(snapshot, "supabase-anon-key").status, "PASS");
  assert.equal(preflightCheck(snapshot, "supabase-server-only-credential").status, "PASS");
  assert.equal(preflightCheck(snapshot, "identity-tables-readiness").status, "PASS");
  assert.deepEqual(preflightCheck(snapshot, "identity-tables-readiness").records, {
    roles: true,
    user_roles: true,
    users: true,
  });
  assert.equal(preflightCheck(snapshot, "site-setup-readiness").status, "PASS");
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.auth, ["supabase-auth"]);
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.database, ["supabase-postgres"]);
  assert.equal(snapshot.supabaseAuth.status, "adapter-ready");
  assert.equal(snapshot.supabasePostgres.status, "adapter-ready");
  assert.equal(JSON.stringify(snapshot).includes("not-a-real-service-role-test-value"), false);
  assert.equal(JSON.stringify(snapshot).includes("server-only-database-url-placeholder"), false);
});

test("Unsupported provider selector values are not contract inputs", () => {
  const snapshot = createProviderContractSnapshot({});

  assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.activeProviders.status, "failed");
  assert.equal(snapshot.failureContract.automaticFallbackAllowed, false);
  assert.equal(snapshot.activationReadiness.runtimeProviderPathReady, false);
  assert.equal(snapshot.supabasePreflight.overallStatus, "FAIL");
  assert.equal(preflightCheck(snapshot, "runtime-auth-provider").status, "PASS");
  assert.equal(preflightCheck(snapshot, "runtime-database-provider").status, "PASS");
  assert.deepEqual(snapshot.providerDiagnostics.providerFailures.map((failure) => failure.reason), [
    "missing-configuration",
    "missing-configuration",
  ]);
  assert.deepEqual(snapshot.providerDiagnostics.ignoredRuntimeSelectors, []);
  assert.equal(JSON.stringify(snapshot).includes("rollback"), false);
});

test(".env.example documents Supabase DEV variables without values", async () => {
  const contents = await readFile(".env.example", "utf8");
  assert.doesNotMatch(contents, /^GAMEFOUNDRY_AUTH_PROVIDER=/m);
  assert.doesNotMatch(contents, /^GAMEFOUNDRY_DB_PROVIDER=/m);
  assert.match(contents, /^GAMEFOUNDRY_SUPABASE_URL=$/m);
  assert.match(contents, /^GAMEFOUNDRY_SUPABASE_ANON_KEY=$/m);
  assert.match(contents, /^GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY=$/m);
  assert.match(contents, /^GAMEFOUNDRY_DATABASE_URL=$/m);
  assert.equal(/supabase\.co|sbp_|eyJ[A-Za-z0-9_-]{20,}/.test(contents), false);
});
