import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../src/dev-runtime/server/local-api-router.mjs";

const PUBLIC_CONFIG_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_API_URL",
  "GAMEFOUNDRY_ENVIRONMENT_LABEL",
  "GAMEFOUNDRY_SITE_URL",
]);

const SECRET_ENV = Object.freeze({
  GAMEFOUNDRY_DATABASE_URL: "postgresql://secret-user:secret-pass@example.test:5432/secret_db",
  GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID: "secret-access-key-id",
  GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY: "secret-storage-key",
  GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "secret-service-role-key",
});

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
        error: error instanceof Error ? error.message : String(error || "Public config test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start public config API server."));
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
  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  return payload.data;
}

test("public config exposes only browser-safe environment values", async () => {
  await withEnv({
    ...SECRET_ENV,
    GAMEFOUNDRY_API_URL: "http://127.0.0.1:5501",
    GAMEFOUNDRY_ENVIRONMENT_LABEL: "Development Environment",
    GAMEFOUNDRY_SITE_URL: "http://127.0.0.1:5501",
  }, async () => {
    const server = await startApiServer();
    try {
      const payload = await apiJson(server.baseUrl, "/api/public/config");
      assert.deepEqual(payload.publicConfig, {
        apiUrl: "http://127.0.0.1:5501",
        environmentLabel: "Development Environment",
        siteUrl: "http://127.0.0.1:5501",
      });
      assert.equal(payload.environmentBanner.active, true);
      assert.equal(payload.environmentBanner.message, "Development Environment");
      assert.equal(payload.environmentBanner.tone, "warning");
      const serialized = JSON.stringify(payload);
      for (const key of Object.keys(SECRET_ENV)) {
        assert.equal(serialized.includes(key), false);
      }
      for (const value of Object.values(SECRET_ENV)) {
        assert.equal(serialized.includes(value), false);
      }
      for (const key of PUBLIC_CONFIG_ENV_KEYS) {
        assert.equal(serialized.includes(key), false);
      }
    } finally {
      await server.close();
    }
  });
});

test("production environment label hides the environment banner by default", async () => {
  await withEnv({
    GAMEFOUNDRY_API_URL: "https://gamefoundrystudio.example",
    GAMEFOUNDRY_ENVIRONMENT_LABEL: "Production",
    GAMEFOUNDRY_SITE_URL: "https://gamefoundrystudio.example",
  }, async () => {
    const server = await startApiServer();
    try {
      const payload = await apiJson(server.baseUrl, "/api/public/config");
      assert.equal(payload.environmentBanner.active, false);
      assert.equal(payload.environmentBanner.message, "");
      assert.equal(payload.diagnostics.environmentLabelConfigured, true);
    } finally {
      await server.close();
    }
  });
});

test("missing local environment label returns an actionable diagnostic banner", async () => {
  await withEnv({
    GAMEFOUNDRY_API_URL: "http://127.0.0.1:5501",
    GAMEFOUNDRY_ENVIRONMENT_LABEL: undefined,
    GAMEFOUNDRY_SITE_URL: "http://127.0.0.1:5501",
  }, async () => {
    const server = await startApiServer();
    try {
      const payload = await apiJson(server.baseUrl, "/api/public/config");
      assert.equal(payload.environmentBanner.active, true);
      assert.match(payload.environmentBanner.message, /GAMEFOUNDRY_ENVIRONMENT_LABEL/);
      assert.match(payload.environmentBanner.message, /\.env/);
      assert.equal(payload.environmentBanner.tone, "danger");
      assert.equal(payload.diagnostics.environmentLabelConfigured, false);
    } finally {
      await server.close();
    }
  });
});
