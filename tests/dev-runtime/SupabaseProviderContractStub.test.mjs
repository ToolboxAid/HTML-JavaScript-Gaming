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
} from "../../src/dev-runtime/auth/provider-contract-stubs.mjs";
import { MOCK_DB_KEYS } from "../../src/dev-runtime/persistence/mock-db-store.js";
import { createLocalApiRouter } from "../../src/dev-runtime/server/local-api-router.mjs";

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
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
      });
    });
  });
}

function startFakeSupabaseAuthServer(options = {}) {
  const expectedApiKey = options.expectedApiKey || "";
  const rejectWrongApiKey = options.rejectWrongApiKey === true;
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
    if (requestUrl.pathname === "/auth/v1/health") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (requestUrl.pathname === "/auth/v1/recover") {
      response.end(JSON.stringify({ ok: true }));
      return;
    }
    response.end(JSON.stringify({
      access_token: "fake-supabase-access-token",
      refresh_token: "fake-supabase-refresh-token",
      token_type: "bearer",
      user: {
        email: body.email || "creator@example.test",
        id: "supabase-user-id-1",
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
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
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

function preflightCheck(snapshot, checkId) {
  return snapshot.supabasePreflight.checks.find((check) => check.id === checkId);
}

test("Supabase provider contract stubs keep explicitly selected Local DB active", () => {
  const snapshot = createProviderContractSnapshot({
    GAMEFOUNDRY_AUTH_PROVIDER: "local-db",
    GAMEFOUNDRY_DB_PROVIDER: "local-db",
  });
  assert.equal(snapshot.activeProviders.authProviderId, "local-db");
  assert.equal(snapshot.activeProviders.databaseProviderId, "local-db");
  assert.equal(snapshot.activeProviders.status, "ready");
  assert.equal(snapshot.activationReadiness.localDbSelected, true);
  assert.equal(snapshot.activationReadiness.readyBeforeActivation, false);
  assert.equal(snapshot.activationReadiness.selectedProvidersReady, true);
  assert.equal(snapshot.activationReadiness.supabaseAuthReady, false);
  assert.equal(snapshot.activationReadiness.supabasePostgresReady, false);
  assert.equal(snapshot.requestedProviders.authProviderId, "local-db");
  assert.equal(snapshot.requestedProviders.databaseProviderId, "local-db");
  assert.equal(snapshot.boundary, "Browser -> API/Service Contract -> Database");
  assert.equal(snapshot.failureContract.selectedProviderAuthoritative, true);
  assert.equal(snapshot.failureContract.automaticFallbackAllowed, false);
  assert.equal(snapshot.failureContract.providerChainingAllowed, false);
  assert.equal(snapshot.supabaseAuth.status, "adapter-inactive");
  assert.equal(snapshot.supabaseAuth.adapter.activeByDefault, false);
  assert.equal(snapshot.supabaseAuth.adapter.passwordStorage, "external-provider");
  assert.equal(snapshot.supabaseAuth.adapter.serviceRoleSecretsUsed, false);
  assert.deepEqual(snapshot.supabaseAuth.operations, [
    "getCurrentUser",
    "signIn",
    "signOut",
    "createAccount",
    "requestPasswordReset",
    "requireRole",
  ]);
  assert.equal(snapshot.supabaseAuth.userMapping.appUserKeyField, "users.key");
  assert.equal(snapshot.supabaseAuth.userMapping.externalAuthUserIdField, "supabase.auth.user.id");
  assert.equal(snapshot.supabaseAuth.userMapping.browserAuthoritativeUserKeysAllowed, false);
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.auth, ["local-db"]);
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.database, ["local-db"]);
  assert.deepEqual(snapshot.providerDiagnostics.providerFailures, []);
  assert.deepEqual(snapshot.providerDiagnostics.selectionControls.auth.supportedProviders, [
    "local-db",
    "supabase-auth",
  ]);
  assert.deepEqual(snapshot.providerDiagnostics.selectionControls.database.supportedProviders, [
    "local-db",
    "supabase-postgres",
  ]);
  assert.equal(snapshot.runtimeActivation.localDbSelected, true);
  assert.equal(snapshot.runtimeActivation.browserReceivesServiceRoleSecrets, false);
  assert.equal(snapshot.runtimeActivation.selectedProvidersCanServeRuntime, true);
  assert.equal(snapshot.supabasePreflight.overallStatus, "WARN");
  assert.equal(snapshot.supabasePreflight.fallbackAllowed, false);
  assert.equal(snapshot.supabasePreflight.selectedProvidersReady, true);
  assert.equal(snapshot.supabasePreflight.supabaseSelected, false);
  assert.equal(snapshot.supabasePreflight.secretValuesExposed, false);
  assert.equal(snapshot.supabasePreflight.serverOnlySecretNamesExposed, false);
  assert.equal(preflightCheck(snapshot, "auth-provider-selected").status, "PASS");
  assert.equal(preflightCheck(snapshot, "database-provider-selected").status, "PASS");
  assert.equal(preflightCheck(snapshot, "supabase-url").status, "WARN");
  assert.equal(preflightCheck(snapshot, "supabase-anon-key").status, "WARN");
  assert.equal(preflightCheck(snapshot, "supabase-server-only-credential").status, "WARN");
  assert.equal(preflightCheck(snapshot, "identity-tables-readiness").status, "WARN");
  assert.equal(preflightCheck(snapshot, "site-setup-readiness").status, "WARN");
  assert.match(snapshot.providerDiagnostics.missingConfigWarnings.join("\n"), /Supabase Auth future provider is not configured/);
  assert.equal(snapshot.providerDiagnostics.secretValuesExposed, false);
  assert.equal(snapshot.supabasePostgres.serverOnlySecretsExposed, false);
  assert.equal(snapshot.supabasePostgres.serverOnlySecretNamesExposed, false);
  assert.equal(snapshot.supabasePostgres.status, "adapter-inactive");
  assert.equal(snapshot.supabasePostgres.adapter.activeByDefault, false);
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
    "initializeIdentity",
    "runSiteSetup",
    "getDbViewerSnapshot",
  ]);
  assert.equal(snapshot.supabasePostgres.dataMigrationActive, false);
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
  const env = {
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
  };
  const snapshot = createProviderContractSnapshot(env);
  assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.activeProviders.status, "failed");
  assert.equal(snapshot.requestedProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.requestedProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.providerDiagnostics.activeProvider.authProviderId, "supabase-auth");
  assert.equal(snapshot.providerDiagnostics.activeProvider.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.failureContract.automaticFallbackAllowed, false);
  assert.equal(snapshot.supabaseAuth.status, "not-configured");
  assert.equal(snapshot.supabasePostgres.status, "not-configured");
  assert.equal(snapshot.activationReadiness.readyBeforeActivation, false);
  assert.equal(snapshot.activationReadiness.selectedProvidersReady, false);
  assert.equal(snapshot.runtimeActivation.selectedProvidersCanServeRuntime, false);
  assert.equal(snapshot.runtimeActivation.selectedProvidersFailed, true);
  assert.equal(snapshot.supabasePreflight.overallStatus, "FAIL");
  assert.equal(snapshot.supabasePreflight.supabaseSelected, true);
  assert.equal(snapshot.supabasePreflight.selectedProvidersReady, false);
  assert.equal(snapshot.supabasePreflight.fallbackAllowed, false);
  assert.equal(preflightCheck(snapshot, "auth-provider-selected").status, "PASS");
  assert.equal(preflightCheck(snapshot, "database-provider-selected").status, "PASS");
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
  assert.match(snapshot.supabaseAuth.diagnostic, /Supabase Auth provider selected but not configured/);
  assert.match(snapshot.supabasePostgres.diagnostic, /Supabase Postgres provider selected but not configured/);
  assert.deepEqual(snapshot.supabaseAuth.missingBrowserSafeEnvironmentVariables, [
    "GAMEFOUNDRY_SUPABASE_URL",
    "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  ]);
});

test("Auth status distinguishes configured Supabase when Local DB auth remains selected", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer();
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "local-db",
    GAMEFOUNDRY_DB_PROVIDER: "local-db",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, false);
      assert.equal(status.status, "provider-not-selected");
      assert.equal(status.message, "The site is currently unavailable. Please try again later.");
      assert.equal(status.configured, true);
      assert.equal(status.supabaseConfigPresent, true);
      assert.equal(status.supabaseProviderSelected, false);
      assert.equal(status.supabaseProviderNotSelected, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);
      assert.equal(status.authProviderId, "local-db");
      assert.equal(status.databaseProviderId, "local-db");
      assert.match(status.operatorDiagnostic, /selected auth provider is local-db/);
      assert.match(status.operatorDiagnostic, /GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth/);
      assert.match(status.operatorDiagnostic, /GAMEFOUNDRY_DB_PROVIDER=local-db/);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.operatorOnly, true);
      assert.equal(preflight.selected, false);
      assert.equal(preflight.supabaseConfigPresent, true);
      assert.equal(preflight.supabaseProviderSelected, false);
      assert.equal(preflight.supabaseProviderNotSelected, true);
      assert.equal(preflight.localDbProductDataActive, true);
      assert.equal(preflight.connectivityStatus, "healthy");
      assert.equal(preflight.connectivityHealthy, true);
      assert.equal(preflight.status, "healthy");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-provider-selected").status, "WARN");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "PASS");
      assert.equal(JSON.stringify(preflight).includes("test-anon-key"), false);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Selected Supabase providers keep diagnostics available and block Local DB runtime routes when not configured", async () => {
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
      assert.equal(session.status, 500);
      assert.equal(session.payload.ok, false);
      assert.match(session.payload.error, /requires the Local DB database provider/);
      assert.match(session.payload.error, /Selected database provider is supabase-postgres/);

      const snapshot = await apiPayload(server.baseUrl, "/api/local-db/snapshot");
      assert.equal(snapshot.status, 500);
      assert.equal(snapshot.payload.ok, false);
      assert.match(snapshot.payload.error, /requires the Local DB database provider/);
      assert.match(snapshot.payload.error, /Selected database provider is supabase-postgres/);
    } finally {
      await server.close();
    }
  });
});

test("Supabase Auth selection keeps Local DB product data active and fails auth actions safely when config is missing", async () => {
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "local-db",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, false);
      assert.equal(status.selected, true);
      assert.equal(status.configured, false);
      assert.equal(status.supabaseConfigPresent, false);
      assert.equal(status.supabaseProviderSelected, true);
      assert.equal(status.supabaseProviderNotSelected, false);
      assert.equal(status.supabaseConnectivityStatus, "not-configured");
      assert.equal(status.connectivityHealthy, null);
      assert.equal(status.databaseProviderId, "local-db");
      assert.equal(status.localDbProductDataActive, true);
      assert.equal(status.noAutomaticFallback, true);
      assert.equal(status.message, "The site is currently unavailable. Please try again later.");
      assert.match(status.operatorDiagnostic, /Supabase Auth provider selected but not configured/);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.supabaseConfigPresent, false);
      assert.equal(preflight.supabaseProviderSelected, true);
      assert.equal(preflight.connectivityStatus, "not-configured");
      assert.equal(preflight.connectivityHealthy, false);
      assert.equal(preflight.checks.find((check) => check.id === "supabase-config-present").status, "FAIL");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "SKIP");

      const session = await apiPayload(server.baseUrl, "/api/session/current");
      assert.equal(session.status, 200);
      assert.equal(session.payload.ok, true);
      assert.equal(session.payload.data.authenticated, false);
      assert.match(session.payload.data.diagnostic, /Supabase Auth does not create a Local DB product-data session/);

      const snapshot = await apiPayload(server.baseUrl, "/api/local-db/snapshot");
      assert.equal(snapshot.status, 200);
      assert.equal(snapshot.payload.ok, true);
      assert.equal(Array.isArray(snapshot.payload.data.tables.users), true);

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

test("Account auth routes call external Supabase Auth and return sanitized action results", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer();
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "local-db",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.configured, true);
      assert.equal(status.localDbProductDataActive, true);
      assert.equal(status.message, "Account service is available.");
      assert.equal(status.supabaseConfigPresent, true);
      assert.equal(status.supabaseProviderSelected, true);
      assert.equal(status.supabaseProviderNotSelected, false);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");
      assert.equal(status.connectivityHealthy, null);

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.supabaseConfigPresent, true);
      assert.equal(preflight.supabaseProviderSelected, true);
      assert.equal(preflight.localDbProductDataActive, true);
      assert.equal(preflight.connectivityStatus, "healthy");
      assert.equal(preflight.connectivityHealthy, true);
      assert.equal(preflight.checks.find((check) => check.id === "supabase-provider-selected").status, "PASS");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "PASS");

      const signIn = await postApiPayload(server.baseUrl, "/api/auth/sign-in", {
        email: "creator@example.test",
        password: "not-stored-locally",
      });
      assert.equal(signIn.status, 200);
      assert.equal(signIn.payload.ok, true);
      assert.equal(signIn.payload.data.providerId, "supabase-auth");
      assert.equal(signIn.payload.data.status, "PASS");
      assert.equal(signIn.payload.data.passwordStoredLocally, false);
      assert.equal(signIn.payload.data.localDbSessionCreated, false);
      assert.equal(signIn.payload.data.accessTokenExposed, false);
      assert.equal(signIn.payload.data.refreshTokenExposed, false);
      assert.equal(JSON.stringify(signIn.payload).includes("fake-supabase-access-token"), false);
      assert.equal(JSON.stringify(signIn.payload).includes("fake-supabase-refresh-token"), false);

      const createAccount = await postApiPayload(server.baseUrl, "/api/auth/create-account", {
        email: "new@example.test",
        password: "not-stored-locally",
      });
      assert.equal(createAccount.status, 200);
      assert.equal(createAccount.payload.data.action, "create-account");
      assert.equal(createAccount.payload.data.localDbSessionCreated, false);

      const reset = await postApiPayload(server.baseUrl, "/api/auth/password-reset", {
        email: "reset@example.test",
      });
      assert.equal(reset.status, 200);
      assert.equal(reset.payload.data.action, "password-reset");
      assert.equal(reset.payload.data.redirectToIncluded, true);

      assert.deepEqual(fakeSupabase.calls.map((call) => call.path), [
        "/auth/v1/health",
        "/auth/v1/token?grant_type=password",
        "/auth/v1/signup",
        "/auth/v1/recover",
      ]);
      assert.equal(fakeSupabase.calls.every((call) => call.headers.apikey === "test-anon-key"), true);
    } finally {
      await server.close();
    }
  });
  await fakeSupabase.close();
});

test("Operator auth preflight reports failed Supabase connectivity for wrong anon key without exposing secrets", async () => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    expectedApiKey: "expected-anon-key",
    rejectWrongApiKey: true,
  });
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "local-db",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "wrong-anon-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const server = await startApiServer();
    try {
      const status = await apiJson(server.baseUrl, "/api/auth/status");
      assert.equal(status.ready, true);
      assert.equal(status.supabaseConfigPresent, true);
      assert.equal(status.supabaseConnectivityStatus, "not-checked");

      const preflight = await apiJson(server.baseUrl, "/api/auth/operator-preflight");
      assert.equal(preflight.supabaseConfigPresent, true);
      assert.equal(preflight.supabaseProviderSelected, true);
      assert.equal(preflight.connectivityStatus, "failed");
      assert.equal(preflight.connectivityHealthy, false);
      assert.equal(preflight.status, "failed");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").status, "FAIL");
      assert.equal(preflight.checks.find((check) => check.id === "supabase-connectivity").httpStatus, 401);
      assert.equal(JSON.stringify(preflight).includes("wrong-anon-key"), false);
      assert.equal(JSON.stringify(preflight).includes("expected-anon-key"), false);
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
    GAMEFOUNDRY_SUPABASE_DATABASE_URL: "server-only-database-url-placeholder",
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
      assert.equal(providerText.includes("GAMEFOUNDRY_SUPABASE_DATABASE_URL"), false);
      assert.equal(adapterText.includes("not-a-real-service-role-test-value"), false);
      assert.equal(adapterText.includes("server-only-database-url-placeholder"), false);
    } finally {
      await server.close();
    }
  });
});

test("Supabase Auth adapter fails visibly when selected without configuration", async () => {
  const auth = new SupabaseAuthProviderStub({ env: { GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth" } });
  await assert.rejects(() => auth.getCurrentUser(), /Supabase Auth provider selected but not configured/);
  await assert.rejects(() => auth.signIn(), /Supabase Auth provider selected but not configured/);
  await assert.rejects(() => auth.signOut(), /Supabase Auth provider selected but not configured/);
  await assert.rejects(() => auth.createAccount(), /Supabase Auth provider selected but not configured/);
  await assert.rejects(() => auth.requestPasswordReset(), /Supabase Auth provider selected but not configured/);
  assert.throws(() => auth.requireRole(), /future app user mapping adapter/);
});

test("Supabase Auth adapter uses browser-safe env config without service-role values", async () => {
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
  await auth.requestPasswordReset({ email: "reset@example.test", redirectTo: "http://127.0.0.1:5501/account/password-reset.html" });
  await auth.getCurrentUser({ accessToken: "user-access-token" });
  await auth.signOut({ accessToken: "user-access-token" });

  assert.deepEqual(calls.map((call) => call.url), [
    "https://supabase-dev.example.test/auth/v1/token?grant_type=password",
    "https://supabase-dev.example.test/auth/v1/signup",
    "https://supabase-dev.example.test/auth/v1/recover",
    "https://supabase-dev.example.test/auth/v1/user",
    "https://supabase-dev.example.test/auth/v1/logout",
  ]);
  const callText = JSON.stringify(calls);
  assert.equal(callText.includes("not-a-real-service-role-test-value"), false);
  assert.equal(calls.every((call) => call.options.headers.apikey === "test-anon-key"), true);
  assert.equal(calls[3].options.headers.authorization, "Bearer user-access-token");
  assert.equal(calls[4].options.headers.authorization, "Bearer user-access-token");
});

test("Supabase Postgres adapter fails visibly when selected without configuration", async () => {
  const database = new SupabasePostgresProviderStub({ env: { GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres" } });
  assert.throws(() => database.connect(), /Supabase Postgres provider selected but not configured/);
  await assert.rejects(() => database.getUsers(), /Supabase Postgres provider selected but not configured/);
  await assert.rejects(() => database.getRoles(), /Supabase Postgres provider selected but not configured/);
  await assert.rejects(() => database.getUserRoles(), /Supabase Postgres provider selected but not configured/);
  await assert.rejects(() => database.initializeIdentity(), /Supabase Postgres provider selected but not configured/);
  assert.throws(() => database.runSiteSetup(), /Supabase Postgres provider selected but not configured/);
  await assert.rejects(() => database.getDbViewerSnapshot(), /Supabase Postgres provider selected but not configured/);
});

test("Supabase Postgres adapter supports identity tables and readiness when configured", async () => {
  const calls = [];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_SUPABASE_DATABASE_URL: "server-only-database-url-placeholder",
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
  assert.deepEqual(Object.keys(snapshot.tables).sort(), ["roles", "user_roles", "users"]);
  assert.deepEqual(calls.map((call) => call.url), [
    "https://supabase-dev.example.test/rest/v1/users?select=*",
    "https://supabase-dev.example.test/rest/v1/roles?select=*",
    "https://supabase-dev.example.test/rest/v1/user_roles?select=*",
  ]);
  assert.equal(calls.every((call) => call.options.headers.apikey === "not-a-real-service-role-test-value"), true);
});

test("Supabase Postgres adapter initializes key-based users roles and user_roles", async () => {
  const calls = [];
  const generatedKeys = [
    "01J000000000000000000ROLE1",
    "01J000000000000000USERROLE1",
  ];
  const database = new SupabasePostgresProviderAdapter({
    env: {
      GAMEFOUNDRY_SUPABASE_DATABASE_URL: "server-only-database-url-placeholder",
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
    actorKey: MOCK_DB_KEYS.users.admin,
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
        userKey: MOCK_DB_KEYS.users.admin,
        roleSlug: "admin",
      },
    ],
    users: [
      {
        key: MOCK_DB_KEYS.users.admin,
        displayName: "DavidQ admin",
        email: "admin@example.invalid",
        authProvider: "dev-static-seed",
        authProviderUserId: "davidq-admin",
      },
    ],
  });

  assert.deepEqual(calls.map((call) => `${call.method} ${call.url}`), [
    "POST https://supabase-dev.example.test/rest/v1/users?on_conflict=key",
    "POST https://supabase-dev.example.test/rest/v1/roles?on_conflict=key",
    "POST https://supabase-dev.example.test/rest/v1/user_roles?on_conflict=key",
  ]);
  assert.equal(calls.every((call) => call.headers.prefer === "resolution=merge-duplicates,return=representation"), true);
  assert.equal(calls[0].body[0].key, MOCK_DB_KEYS.users.admin);
  assert.equal(calls[0].body[0].createdBy, MOCK_DB_KEYS.users.admin);
  assert.equal(calls[0].body[0].updatedBy, MOCK_DB_KEYS.users.admin);
  assert.equal(calls[1].body[0].key, "01J000000000000000000ROLE1");
  assert.equal(calls[1].body[0].roleSlug, "admin");
  assert.equal(calls[2].body[0].key, "01J000000000000000USERROLE1");
  assert.equal(calls[2].body[0].userKey, MOCK_DB_KEYS.users.admin);
  assert.equal(calls[2].body[0].roleKey, "01J000000000000000000ROLE1");
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

test("Admin identity setup API fails visibly when Supabase Postgres is selected without config", async () => {
  await withEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "local-db",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
  }, async () => {
    const server = await startApiServer();
    try {
      const response = await postApiPayload(server.baseUrl, "/api/admin/setup/identity", {
        actorKey: MOCK_DB_KEYS.users.admin,
      });
      assert.equal(response.status, 500);
      assert.equal(response.payload.ok, false);
      assert.match(response.payload.error, /Supabase Postgres provider selected but not configured/);
    } finally {
      await server.close();
    }
  });
});

test("Supabase activation diagnostics report readiness for selected providers", () => {
  const snapshot = createProviderContractSnapshot({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "test-anon-key",
    GAMEFOUNDRY_SUPABASE_DATABASE_URL: "server-only-database-url-placeholder",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "not-a-real-service-role-test-value",
    GAMEFOUNDRY_SUPABASE_URL: "https://supabase-dev.example.test/",
  });

  assert.equal(snapshot.activeProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.activeProviders.status, "ready");
  assert.equal(snapshot.activationReadiness.localDbSelected, false);
  assert.equal(snapshot.activationReadiness.readyBeforeActivation, true);
  assert.equal(snapshot.activationReadiness.selectedProvidersReady, true);
  assert.equal(snapshot.activationReadiness.siteSetupReady, true);
  assert.equal(snapshot.activationReadiness.supabaseAuthReady, true);
  assert.equal(snapshot.activationReadiness.supabasePostgresReady, true);
  assert.equal(snapshot.runtimeActivation.selectedProvidersCanServeRuntime, true);
  assert.equal(snapshot.runtimeActivation.supabaseAuthSelected, true);
  assert.equal(snapshot.runtimeActivation.supabasePostgresSelected, true);
  assert.equal(snapshot.supabasePreflight.overallStatus, "PASS");
  assert.equal(snapshot.supabasePreflight.supabaseSelected, true);
  assert.equal(snapshot.supabasePreflight.selectedProvidersReady, true);
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
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.auth, ["local-db", "supabase-auth"]);
  assert.deepEqual(snapshot.providerDiagnostics.configuredProviders.database, ["local-db", "supabase-postgres"]);
  assert.equal(snapshot.supabaseAuth.status, "adapter-ready");
  assert.equal(snapshot.supabasePostgres.status, "adapter-ready");
  assert.equal(JSON.stringify(snapshot).includes("not-a-real-service-role-test-value"), false);
  assert.equal(JSON.stringify(snapshot).includes("server-only-database-url-placeholder"), false);
});

test("Unsupported selected providers fail without falling back to Local DB", () => {
  const snapshot = createProviderContractSnapshot({
    GAMEFOUNDRY_AUTH_PROVIDER: "unknown-auth",
    GAMEFOUNDRY_DB_PROVIDER: "unknown-db",
  });

  assert.equal(snapshot.activeProviders.authProviderId, "unknown-auth");
  assert.equal(snapshot.activeProviders.databaseProviderId, "unknown-db");
  assert.equal(snapshot.activeProviders.status, "failed");
  assert.equal(snapshot.failureContract.automaticFallbackAllowed, false);
  assert.equal(snapshot.activationReadiness.selectedProvidersReady, false);
  assert.equal(snapshot.supabasePreflight.overallStatus, "FAIL");
  assert.equal(preflightCheck(snapshot, "auth-provider-selected").status, "FAIL");
  assert.equal(preflightCheck(snapshot, "database-provider-selected").status, "FAIL");
  assert.deepEqual(snapshot.providerDiagnostics.providerFailures.map((failure) => failure.reason), [
    "unsupported-provider",
    "unsupported-provider",
  ]);
  assert.equal(JSON.stringify(snapshot).includes("rollback"), false);
});

test(".env.example documents future Supabase DEV variables without values", async () => {
  const contents = await readFile(".env.example", "utf8");
  assert.match(contents, /^GAMEFOUNDRY_AUTH_PROVIDER=local-db$/m);
  assert.match(contents, /^GAMEFOUNDRY_DB_PROVIDER=local-db$/m);
  assert.match(contents, /^GAMEFOUNDRY_SUPABASE_URL=$/m);
  assert.match(contents, /^GAMEFOUNDRY_SUPABASE_ANON_KEY=$/m);
  assert.match(contents, /^GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY=$/m);
  assert.match(contents, /^GAMEFOUNDRY_SUPABASE_DATABASE_URL=$/m);
  assert.equal(/supabase\.co|sbp_|eyJ[A-Za-z0-9_-]{20,}/.test(contents), false);
});
