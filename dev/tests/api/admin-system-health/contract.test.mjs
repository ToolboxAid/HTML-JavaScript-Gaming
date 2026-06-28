import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../../api/server/local-api-router.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";

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
        error: error instanceof Error ? error.message : String(error || "Admin System Health contract test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Admin System Health contract API server."));
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

async function apiPayload(baseUrl, pathName, request = {}) {
  const init = request.body === undefined
    ? request
    : {
      ...request,
      body: JSON.stringify(request.body),
      headers: {
        "content-type": "application/json",
        ...(request.headers || {}),
      },
    };
  const response = await fetch(`${baseUrl}${pathName}`, init);
  const payload = await response.json();
  return { payload, status: response.status };
}

async function apiJson(baseUrl, pathName, request = {}) {
  const { payload, status } = await apiPayload(baseUrl, pathName, request);
  assert.equal(status, 200, `${pathName} should return 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true);
  return payload.data;
}

test("Admin System Health completion contract remains server-owned and current-environment only", async () => {
  await withEnv({
    GAMEFOUNDRY_API_URL: "http://api-user:api-secret@127.0.0.1:5501/api",
    GAMEFOUNDRY_ENVIRONMENT_LABEL: "DEV",
    GAMEFOUNDRY_SITE_URL: "http://site-user:site-secret@127.0.0.1:5500",
    GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX: "/dev/projects/",
  }, async () => {
    const server = await startApiServer();
    try {
      const runtimeJson = await apiJson(server.baseUrl, "/api/runtime/health");
      assert.equal(runtimeJson.environment.name, "DEV");
      assert.equal(runtimeJson.environment.storageFolder, "/dev");
      assert.equal(runtimeJson.api.status, "PASS");
      assert.equal(Object.hasOwn(runtimeJson, "timestamp"), true);
      assert.equal(runtimeJson.secretEditingAllowed, false);
      assert.equal(runtimeJson.secretsExposed, false);
      assert.equal(JSON.stringify(runtimeJson).includes("api-secret"), false);
      assert.equal(JSON.stringify(runtimeJson).includes("site-secret"), false);
      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.admin },
        method: "POST",
      });
      const health = await apiJson(server.baseUrl, "/api/admin/system-health/status");
      assert.equal(health.environmentIdentity.name, "DEV");
      assert.equal(health.apiContract.currentDeploymentOnly, true);
      assert.equal(health.apiContract.noCrossEnvironmentChecks, true);
      assert.equal(health.environmentCapabilities.peerEnvironmentChecks, false);
      assert.equal(health.environmentMap.some((row) => Object.hasOwn(row, "status")), false);
      assert.deepEqual(
        [
          "apiContract",
          "adminApiRegistry",
          "environmentComparison",
          "environmentCapabilities",
          "runtimeFeatureFlags",
          "serviceHealth",
          "configurationSummary",
          "postgresMetrics",
          "scheduledMonitoring",
          "notificationsFoundation",
        ].filter((key) => Object.hasOwn(health, key)),
        [
          "apiContract",
          "adminApiRegistry",
          "environmentComparison",
          "environmentCapabilities",
          "runtimeFeatureFlags",
          "serviceHealth",
          "configurationSummary",
          "postgresMetrics",
          "scheduledMonitoring",
          "notificationsFoundation",
        ],
      );
      assert.equal(health.environmentComparison.noCrossEnvironmentChecks, true);
      assert.deepEqual(
        health.environmentComparison.rows.map((row) => `${row.displayName}:${row.state}`),
        [
          "Local (VS Code):Unavailable",
          "DEV:Current",
          "IST:Not Configured",
          "UAT:Not Configured",
          "PROD:Not Configured",
        ],
      );
      assert.deepEqual(
        health.postgresMetrics.rows.map((row) => row.metric),
        [
          "Connection status",
          "Database name",
          "Current schema",
          "Migration status",
          "Last migration",
          "Table count",
          "Database size",
          "Last checked",
        ],
      );
      const healthText = JSON.stringify(health);
      assert.equal(healthText.includes("api-secret"), false);
      assert.equal(healthText.includes("site-secret"), false);
      assert.equal(healthText.includes("/uat/projects"), false);
      assert.equal(health.secretEditingAllowed, false);
      assert.equal(health.secretsExposed, false);
      const expandedStorage = await apiJson(server.baseUrl, "/api/admin/system-health/storage-connectivity-action", {
        body: { actionId: "storage-expanded-validation" },
        method: "POST",
      });
      assert.deepEqual(
        expandedStorage.storageDiagnostics.map((row) => row.actionId),
        [
          "storage-bucket-connectivity",
          "storage-list",
          "storage-upload-test-object",
          "storage-read-test-object",
          "storage-delete-test-object",
        ],
      );
      assert.equal(expandedStorage.storageDiagnostics.every((row) => row.environmentFolder === "/dev"), true);
      assert.equal(expandedStorage.storageDiagnostics.every((row) => typeof row.durationMs === "number"), true);
      assert.equal(expandedStorage.permanentObjectCreated, false);
      assert.equal(JSON.stringify(expandedStorage).includes("api-secret"), false);
      assert.equal(JSON.stringify(expandedStorage).includes("site-secret"), false);
    } finally {
      await server.close();
    }
  });
});

test("Admin System Health rejects unknown manual health actions", async () => {
  const server = await startApiServer();
  try {
    await apiJson(server.baseUrl, "/api/session/user", {
      body: { userKey: SEED_DB_KEYS.users.admin },
      method: "POST",
    });
    const rejected = await apiPayload(server.baseUrl, "/api/admin/system-health/action", {
      body: { actionId: "peer-environment-check" },
      method: "POST",
    });
    assert.equal(rejected.status, 400);
    assert.match(rejected.payload.error, /Unknown Admin System Health action/);
  } finally {
    await server.close();
  }
});
