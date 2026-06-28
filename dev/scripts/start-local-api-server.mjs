import process from "node:process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { databaseSslMode } from "../../api/persistence/postgres-connection-client.mjs";
import { startLocalApiServer } from "../../api/server/local-api-server.mjs";
import { loadStorageConfig } from "../../api/storage/storage-config.mjs";

const RUNTIME_ENV_FILE = ".env";
const NOT_CONFIGURED = "(not configured)";
const PORT_NOT_CONFIGURED = "not configured";
const SECTION_DIVIDER = "=========================================";
const MASKED_ENV_VALUE = "********";
const SECRET_ENV_KEY_PARTS = Object.freeze([
  "PASSWORD",
  "SECRET",
  "TOKEN",
  "KEY",
  "SERVICE_ROLE",
  "JWT",
]);
const DEFAULT_PORT_BY_PROTOCOL = Object.freeze({
  "http:": "80",
  "https:": "443",
  "postgres:": "5432",
  "postgresql:": "5432",
});

function parseRuntimeEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
    return null;
  }
  const index = trimmed.indexOf("=");
  const key = trimmed.slice(0, index).trim();
  let value = trimmed.slice(index + 1).trim();
  if (!key) {
    return null;
  }
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function loadRuntimeEnv() {
  const envPath = path.resolve(process.cwd(), RUNTIME_ENV_FILE);
  if (!existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: 0,
      variables: [],
    };
  }
  const envValuesBeforeLoad = new Map(
    Object.keys(process.env)
      .filter((key) => process.env[key] !== undefined)
      .map((key) => [key, process.env[key]])
  );
  const variablesByKey = new Map();
  let loadedKeys = 0;
  readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const parsed = parseRuntimeEnvLine(line);
    if (!parsed) {
      return;
    }
    const { key, value } = parsed;
    const wasAlreadySet = envValuesBeforeLoad.has(key);
    if (!variablesByKey.has(key)) {
      variablesByKey.set(key, {
        applied: !wasAlreadySet,
        key,
        value: wasAlreadySet ? envValuesBeforeLoad.get(key) : value,
      });
    }
    if (process.env[key] !== undefined) {
      return;
    }
    process.env[key] = value;
    loadedKeys += 1;
  });
  return {
    loaded: true,
    loadedKeys,
    variables: Array.from(variablesByKey.values()).sort((left, right) => left.key.localeCompare(right.key)),
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

function configuredSourceLine(label, key, configured) {
  return `${label} source: ${configured ? key : "not configured"}`;
}

function derivedSourceLine(label, key, configured, derivedSource) {
  return `${label} source: ${configured ? key : `not configured; derived from ${derivedSource}`}`;
}

function connectionStatusLine(label, connection) {
  return `Configured ${label} connection: ${connection.ready ? "configured" : `missing ${connection.missingKeys.join(", ")}`}.`;
}

function shouldMaskEnvValue(key) {
  const normalizedKey = String(key || "").toUpperCase();
  return SECRET_ENV_KEY_PARTS.some((part) => normalizedKey.includes(part));
}

function redactUrlCredentials(value) {
  const rawValue = String(value ?? "");
  try {
    const url = new URL(rawValue);
    if (!url.username && !url.password) {
      return rawValue;
    }
    if (url.username) {
      url.username = MASKED_ENV_VALUE;
    }
    if (url.password) {
      url.password = MASKED_ENV_VALUE;
    }
    return url.toString();
  } catch {
    return rawValue;
  }
}

function formatEnvValue(key, value) {
  if (shouldMaskEnvValue(key)) {
    return MASKED_ENV_VALUE;
  }
  return redactUrlCredentials(value);
}

function formatEnvironmentVariableLogLines(runtimeEnv) {
  if (!runtimeEnv.loaded) {
    return [".env was not found for API runtime."];
  }
  return [
    SECTION_DIVIDER,
    "Environment Variables",
    SECTION_DIVIDER,
    ...(runtimeEnv.variables || [])
      .slice()
      .sort((left, right) => left.key.localeCompare(right.key))
      .map(
        ({ applied, key, value }) => `${applied ? "+" : "-"} ${key}=${formatEnvValue(key, value)}`
      ),
  ];
}

function portFromUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return PORT_NOT_CONFIGURED;
  }
  try {
    const url = new URL(trimmed);
    return url.port || DEFAULT_PORT_BY_PROTOCOL[url.protocol] || PORT_NOT_CONFIGURED;
  } catch {
    return PORT_NOT_CONFIGURED;
  }
}

function formatRuntimePortLogLines({ env, localServer }) {
  const configuredApiUrl = String(env.GAMEFOUNDRY_API_URL || "").trim();
  return [
    SECTION_DIVIDER,
    "All Runtime Ports being used by Service",
    SECTION_DIVIDER,
    `live server port: ${portFromUrl(env.GAMEFOUNDRY_SITE_URL)}`,
    `API server port: ${portFromUrl(localServer.baseUrl)}`,
    `configured API URL port: ${portFromUrl(configuredApiUrl)}`,
    `local API URL port: ${portFromUrl(configuredApiUrl || defaultApiUrl(localServer.baseUrl))}`,
    `DB/Postgres port: ${portFromUrl(env.GAMEFOUNDRY_DATABASE_URL)}`,
    `Supabase service port: ${portFromUrl(env.GAMEFOUNDRY_SUPABASE_URL)}`,
    `Storage service port: ${portFromUrl(env.GAMEFOUNDRY_STORAGE_ENDPOINT)}`,
  ];
}

function databaseMode(env) {
  const rawValue = String(env.GAMEFOUNDRY_DATABASE_URL || "").trim();
  if (!rawValue) {
    return "not configured";
  }
  try {
    const parsedUrl = new URL(rawValue);
    return ["postgres:", "postgresql:"].includes(parsedUrl.protocol) ? "Postgres" : "invalid database URL";
  } catch {
    return "invalid database URL";
  }
}

function storageStatus(env) {
  const storageConfig = loadStorageConfig(env);
  if (storageConfig.configured) {
    return `configured (bucket ${storageConfig.safe.bucket}; prefix ${storageConfig.safe.projectsPrefix})`;
  }
  const issue = storageConfig.validationError || `missing ${storageConfig.missingKeys?.join(", ") || "storage configuration"}`;
  return `not configured (${issue})`;
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
  const configuredApiUrl = String(env.GAMEFOUNDRY_API_URL || "").trim();
  const localApiUrl = configuredApiUrl || defaultApiUrl(localServer.baseUrl);
  const configuredSiteUrl = configuredValue(env.GAMEFOUNDRY_SITE_URL);
  return [
    `GameFoundry API runtime server running at ${localServer.baseUrl}`,
    `Configured site URL: ${configuredSiteUrl}`,
    `Configured API URL: ${configuredValue(configuredApiUrl)}`,
    `Local API URL: ${localApiUrl}`,
    `Local site URL: ${configuredSiteUrl}`,
    `Local site URL port: ${portFromUrl(env.GAMEFOUNDRY_SITE_URL)}`,
    "Runtime configuration source: .env + process environment",
    derivedSourceLine("Local API URL", "GAMEFOUNDRY_API_URL", Boolean(configuredApiUrl), "Local API bind URL"),
    configuredSourceLine("Local site URL", "GAMEFOUNDRY_SITE_URL", Boolean(String(env.GAMEFOUNDRY_SITE_URL || "").trim())),
    configuredSourceLine("Storage/R2 endpoint", "GAMEFOUNDRY_STORAGE_ENDPOINT", Boolean(String(env.GAMEFOUNDRY_STORAGE_ENDPOINT || "").trim())),
    configuredSourceLine("Storage/R2 projects prefix", "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX", Boolean(String(env.GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX || "").trim())),
    ...formatEnvironmentVariableLogLines(runtimeEnv),
    ...formatRuntimePortLogLines({ env, localServer }),
    connectionStatusLine("auth", accountConnection),
    connectionStatusLine("database", databaseConnection),
    `Database mode: ${databaseMode(env)}`,
    `Storage status: ${storageStatus(env)}`,
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
