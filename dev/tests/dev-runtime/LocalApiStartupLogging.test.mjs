import assert from "node:assert/strict";
import test from "node:test";
import { formatStartupLogLines } from "../../local-runtime/start-local-api-server.mjs";

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
      GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID: "storage-access-key",
      GAMEFOUNDRY_STORAGE_BUCKET: "gamefoundry-test-assets",
      GAMEFOUNDRY_STORAGE_ENDPOINT: "http://127.0.0.1:9000",
      GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX: "/dev/projects/",
      GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY: "storage-secret",
      GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
      GAMEFOUNDRY_SUPABASE_URL: "https://example.supabase.co",
    },
    localServer: {
      baseUrl: "http://127.0.0.1:5501",
    },
    runtimeEnv: {
      loaded: true,
      loadedKeys: 12,
      variables: [
        {
          applied: false,
          key: "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
          value: "service-role-secret",
        },
        {
          applied: true,
          key: "GAMEFOUNDRY_SUPABASE_URL",
          value: "https://example.supabase.co",
        },
        {
          applied: true,
          key: "GAMEFOUNDRY_DATABASE_URL",
          value: "postgres://secret-user:secret-pass@example.invalid/db",
        },
        {
          applied: false,
          key: "GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID",
          value: "storage-access-key",
        },
        {
          applied: true,
          key: "GAMEFOUNDRY_STORAGE_BUCKET",
          value: "gamefoundry-test-assets",
        },
        {
          applied: true,
          key: "GAMEFOUNDRY_STORAGE_ENDPOINT",
          value: "http://127.0.0.1:9000",
        },
        {
          applied: true,
          key: "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX",
          value: "/dev/projects/",
        },
        {
          applied: false,
          key: "GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY",
          value: "storage-secret",
        },
      ],
    },
  });

  assert.deepEqual(lines, [
    "GameFoundry API runtime server running at http://127.0.0.1:5501",
    "Configured site URL: http://127.0.0.1:5500",
    "Configured API URL: http://127.0.0.1:5501/api",
    "Local API URL: http://127.0.0.1:5501/api",
    "Local site URL: http://127.0.0.1:5500",
    "Local site URL port: 5500",
    "Runtime configuration source: .env + process environment",
    "Local API URL source: GAMEFOUNDRY_API_URL",
    "Local site URL source: GAMEFOUNDRY_SITE_URL",
    "Storage/R2 endpoint source: GAMEFOUNDRY_STORAGE_ENDPOINT",
    "Storage/R2 projects prefix source: GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX",
    "=========================================",
    "Environment Variables",
    "=========================================",
    "+ GAMEFOUNDRY_DATABASE_URL=postgres://********:********@example.invalid/db",
    "- GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID=********",
    "+ GAMEFOUNDRY_STORAGE_BUCKET=gamefoundry-test-assets",
    "+ GAMEFOUNDRY_STORAGE_ENDPOINT=http://127.0.0.1:9000",
    "+ GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX=/dev/projects/",
    "- GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY=********",
    "- GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY=********",
    "+ GAMEFOUNDRY_SUPABASE_URL=https://example.supabase.co",
    "=========================================",
    "All Runtime Ports being used by Service",
    "=========================================",
    "live server port: 5500",
    "API server port: 5501",
    "configured API URL port: 5501",
    "local API URL port: 5501",
    "DB/Postgres port: 5432",
    "Supabase service port: 443",
    "Storage service port: 9000",
    "Configured auth connection: configured.",
    "Configured database connection: configured.",
    "Database mode: Postgres",
    "Storage status: configured (bucket gamefoundry-test-assets; prefix /dev/projects/)",
    "Database SSL mode: require",
    "Press Ctrl+C to stop.",
  ]);
  assert.equal(lines.join("\n").includes("/account/sign-in.html"), false);
  assert.equal(lines.join("\n").includes(".env loaded for API runtime"), false);
  assert.equal(lines.join("\n").includes("secret-user"), false);
  assert.equal(lines.join("\n").includes("secret-pass"), false);
  assert.equal(lines.join("\n").includes("storage-access-key"), false);
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
      variables: [],
    },
  });

  assert.deepEqual(lines, [
    "GameFoundry API runtime server running at http://127.0.0.1:5599",
    "Configured site URL: (not configured)",
    "Configured API URL: (not configured)",
    "Local API URL: http://127.0.0.1:5599/api",
    "Local site URL: (not configured)",
    "Local site URL port: not configured",
    "Runtime configuration source: .env + process environment",
    "Local API URL source: not configured; derived from Local API bind URL",
    "Local site URL source: not configured",
    "Storage/R2 endpoint source: not configured",
    "Storage/R2 projects prefix source: not configured",
    ".env was not found for API runtime.",
    "=========================================",
    "All Runtime Ports being used by Service",
    "=========================================",
    "live server port: not configured",
    "API server port: 5599",
    "configured API URL port: not configured",
    "local API URL port: 5599",
    "DB/Postgres port: not configured",
    "Supabase service port: not configured",
    "Storage service port: not configured",
    "Configured auth connection: missing GAMEFOUNDRY_SUPABASE_URL.",
    "Configured database connection: missing GAMEFOUNDRY_DATABASE_URL.",
    "Database mode: not configured",
    "Storage status: not configured (missing GAMEFOUNDRY_STORAGE_ENDPOINT, GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID, GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY, GAMEFOUNDRY_STORAGE_BUCKET, GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX)",
    "Database SSL mode: invalid (GAMEFOUNDRY_DATABASE_SSL is missing.)",
    "Press Ctrl+C to stop.",
  ]);
});
