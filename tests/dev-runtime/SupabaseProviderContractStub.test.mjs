import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SupabaseAuthProviderStub,
  SupabasePostgresProviderStub,
  createProviderContractSnapshot,
} from "../../src/dev-runtime/auth/provider-contract-stubs.mjs";
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

async function apiJson(baseUrl, pathName) {
  const response = await fetch(`${baseUrl}${pathName}`);
  const payload = await response.json();
  assert.equal(payload.ok, true, `${pathName} should return ok`);
  return payload.data;
}

test("Supabase provider contract stubs keep Local DB active by default", () => {
  const snapshot = createProviderContractSnapshot({});
  assert.equal(snapshot.activeProviders.authProviderId, "local-db");
  assert.equal(snapshot.activeProviders.databaseProviderId, "local-db");
  assert.equal(snapshot.requestedProviders.authProviderId, "local-db");
  assert.equal(snapshot.requestedProviders.databaseProviderId, "local-db");
  assert.equal(snapshot.boundary, "Browser -> API/Service Contract -> Database");
  assert.equal(snapshot.supabaseAuth.status, "stub");
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
  assert.match(snapshot.providerDiagnostics.missingConfigWarnings.join("\n"), /Supabase Auth future provider is not configured/);
  assert.equal(snapshot.providerDiagnostics.secretValuesExposed, false);
  assert.equal(snapshot.supabasePostgres.serverOnlySecretsExposed, false);
  assert.equal(snapshot.supabasePostgres.serverOnlySecretNamesExposed, false);
  assert.deepEqual(snapshot.supabasePostgres.operations, [
    "connect",
    "getUsers",
    "getRoles",
    "getUserRoles",
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
  assert.equal(snapshot.activeProviders.authProviderId, "local-db");
  assert.equal(snapshot.activeProviders.databaseProviderId, "local-db");
  assert.equal(snapshot.requestedProviders.authProviderId, "supabase-auth");
  assert.equal(snapshot.requestedProviders.databaseProviderId, "supabase-postgres");
  assert.equal(snapshot.supabaseAuth.status, "not-configured");
  assert.equal(snapshot.supabasePostgres.status, "not-configured");
  assert.match(snapshot.supabaseAuth.diagnostic, /Supabase Auth provider selected but not configured/);
  assert.match(snapshot.supabasePostgres.diagnostic, /Supabase Postgres provider selected but not configured/);
  assert.deepEqual(snapshot.supabaseAuth.missingBrowserSafeEnvironmentVariables, [
    "GAMEFOUNDRY_SUPABASE_URL",
    "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  ]);
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
      assert.equal(providerContract.activeProviders.authProviderId, "local-db");
      assert.equal(providerContract.activeProviders.databaseProviderId, "local-db");
      assert.equal(providerContract.providerDiagnostics.activeProvider.authProviderId, "local-db");
      assert.equal(providerContract.providerDiagnostics.secretValuesExposed, false);
      assert.equal(providerContract.providerDiagnostics.serverOnlyEnvironmentVariableNamesExposed, false);
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

test("Supabase provider classes are stubs only and do not implement runtime sign-in or database access", () => {
  const auth = new SupabaseAuthProviderStub({ env: { GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth" } });
  const database = new SupabasePostgresProviderStub({ env: { GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres" } });
  assert.throws(() => auth.getCurrentUser(), /Supabase Auth provider selected but not configured/);
  assert.throws(() => auth.signIn(), /Supabase Auth provider selected but not configured/);
  assert.throws(() => auth.signOut(), /Supabase Auth provider selected but not configured/);
  assert.throws(() => auth.createAccount(), /Supabase Auth provider selected but not configured/);
  assert.throws(() => auth.requestPasswordReset(), /Supabase Auth provider selected but not configured/);
  assert.throws(() => auth.requireRole(), /Supabase Auth provider selected but not configured/);
  assert.throws(() => database.connect(), /Supabase Postgres provider selected but not configured/);
  assert.throws(() => database.getUsers(), /Supabase Postgres provider selected but not configured/);
  assert.throws(() => database.getRoles(), /Supabase Postgres provider selected but not configured/);
  assert.throws(() => database.getUserRoles(), /Supabase Postgres provider selected but not configured/);
  assert.throws(() => database.runSiteSetup(), /Supabase Postgres provider selected but not configured/);
  assert.throws(() => database.getDbViewerSnapshot(), /Supabase Postgres provider selected but not configured/);
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
