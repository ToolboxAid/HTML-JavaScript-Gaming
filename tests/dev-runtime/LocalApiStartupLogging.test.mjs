import assert from "node:assert/strict";
import test from "node:test";
import { formatStartupLogLines } from "../../scripts/start-local-api-server.mjs";

const CONFIGURED_CONNECTION = Object.freeze({
  missingKeys: [],
  ready: true,
});

test("local API startup log separates bind URL from configured public URLs", () => {
  const lines = formatStartupLogLines({
    accountConnection: CONFIGURED_CONNECTION,
    configuredDatabaseSslMode: "require",
    databaseConnection: CONFIGURED_CONNECTION,
    databaseSslModeError: "",
    env: {
      GAMEFOUNDRY_API_URL: "http://127.0.0.1:5501/api",
      GAMEFOUNDRY_DATABASE_URL: "postgres://secret-user:secret-pass@example.invalid/db",
      GAMEFOUNDRY_SITE_URL: "http://127.0.0.1:5500",
      GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY: "storage-secret",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
    },
    localServer: {
      baseUrl: "http://127.0.0.1:5501",
    },
    runtimeEnv: {
      loaded: true,
      loadedKeys: 12,
    },
  });

  assert.deepEqual(lines, [
    "GameFoundry API runtime server running at http://127.0.0.1:5501",
    "Configured site URL: http://127.0.0.1:5500",
    "Configured API URL: http://127.0.0.1:5501/api",
    ".env loaded for API runtime (12 key(s) applied).",
    "Configured auth connection: configured.",
    "Configured database connection: configured.",
    "Database SSL mode: require",
    "Press Ctrl+C to stop.",
  ]);
  assert.equal(lines.join("\n").includes("/account/sign-in.html"), false);
  assert.equal(lines.join("\n").includes("secret-pass"), false);
  assert.equal(lines.join("\n").includes("storage-secret"), false);
  assert.equal(lines.join("\n").includes("service-role-secret"), false);
});

test("local API startup log shows missing site URL and derives API URL from bind URL", () => {
  const lines = formatStartupLogLines({
    accountConnection: {
      missingKeys: ["GAMEFOUNDRY_SUPABASE_URL"],
      ready: false,
    },
    configuredDatabaseSslMode: "",
    databaseConnection: {
      missingKeys: ["GAMEFOUNDRY_DATABASE_URL"],
      ready: false,
    },
    databaseSslModeError: "GAMEFOUNDRY_DATABASE_SSL is missing.",
    env: {},
    localServer: {
      baseUrl: "http://127.0.0.1:5599",
    },
    runtimeEnv: {
      loaded: false,
      loadedKeys: 0,
    },
  });

  assert.deepEqual(lines, [
    "GameFoundry API runtime server running at http://127.0.0.1:5599",
    "Configured site URL: (not configured)",
    "Configured API URL: http://127.0.0.1:5599/api",
    ".env was not found for API runtime.",
    "Configured auth connection: missing GAMEFOUNDRY_SUPABASE_URL.",
    "Configured database connection: missing GAMEFOUNDRY_DATABASE_URL.",
    "Database SSL mode: invalid (GAMEFOUNDRY_DATABASE_SSL is missing.)",
    "Press Ctrl+C to stop.",
  ]);
});
