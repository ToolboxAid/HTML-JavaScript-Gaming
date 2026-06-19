import process from "node:process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { databaseSslMode } from "../src/dev-runtime/persistence/postgres-connection-client.mjs";
import { startLocalApiServer } from "../src/dev-runtime/server/local-api-server.mjs";

const RUNTIME_ENV_FILE = ".env";
const NOT_CONFIGURED = "(not configured)";

function loadRuntimeEnv() {
  const envPath = path.resolve(process.cwd(), RUNTIME_ENV_FILE);
  if (!existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: 0,
    };
  }
  let loadedKeys = 0;
  readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      return;
    }
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (!key || process.env[key] !== undefined) {
      return;
    }
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
    loadedKeys += 1;
  });
  return {
    loaded: true,
    loadedKeys,
  };
}

function connectionStatus(requiredKeys) {
  const missingKeys = requiredKeys.filter((key) => !String(process.env[key] || "").trim());
  return {
    ready: missingKeys.length === 0,
    missingKeys,
  };
}

function configuredValue(value) {
  return String(value || "").trim() || NOT_CONFIGURED;
}

function defaultApiUrl(baseUrl) {
  return `${String(baseUrl || "").replace(/\/+$/, "")}/api`;
}

function connectionStatusLine(label, connection) {
  return `Configured ${label} connection: ${connection.ready ? "configured" : `missing ${connection.missingKeys.join(", ")}`}.`;
}

export function formatStartupLogLines({
  accountConnection,
  configuredDatabaseSslMode,
  databaseConnection,
  databaseSslModeError,
  env = process.env,
  localServer,
  runtimeEnv,
}) {
  return [
    `GameFoundry API runtime server running at ${localServer.baseUrl}`,
    `Configured site URL: ${configuredValue(env.GAMEFOUNDRY_SITE_URL)}`,
    `Configured API URL: ${String(env.GAMEFOUNDRY_API_URL || "").trim() || defaultApiUrl(localServer.baseUrl)}`,
    runtimeEnv.loaded
      ? `.env loaded for API runtime (${runtimeEnv.loadedKeys} key(s) applied).`
      : ".env was not found for API runtime.",
    connectionStatusLine("auth", accountConnection),
    connectionStatusLine("database", databaseConnection),
    `Database SSL mode: ${configuredDatabaseSslMode || `invalid (${databaseSslModeError})`}`,
    "Press Ctrl+C to stop.",
  ];
}

async function main() {
  const runtimeEnv = loadRuntimeEnv();
  const accountConnection = connectionStatus([
    "GAMEFOUNDRY_SUPABASE_URL",
    "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  ]);
  const databaseConnection = connectionStatus([
    "GAMEFOUNDRY_SUPABASE_URL",
    "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
    "GAMEFOUNDRY_DATABASE_URL",
    "GAMEFOUNDRY_DATABASE_SSL",
  ]);
  let configuredDatabaseSslMode = "";
  let databaseSslModeError = "";
  try {
    configuredDatabaseSslMode = databaseSslMode();
  } catch (error) {
    databaseSslModeError = error instanceof Error ? error.message : String(error || "Unknown database SSL mode error.");
  }
  const host = process.env.GAMEFOUNDRY_LOCAL_API_HOST || "127.0.0.1";
  const port = Number(process.env.GAMEFOUNDRY_LOCAL_API_PORT || 5501);

  const localServer = await startLocalApiServer({ host, port });
  formatStartupLogLines({
    accountConnection,
    configuredDatabaseSslMode,
    databaseConnection,
    databaseSslModeError,
    localServer,
    runtimeEnv,
  }).forEach((line) => console.log(line));

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, async () => {
      await localServer.close();
      process.exit(0);
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
