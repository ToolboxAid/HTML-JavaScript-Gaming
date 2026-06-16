import process from "node:process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { startLocalApiServer } from "../src/dev-runtime/server/local-api-server.mjs";

const RUNTIME_ENV_FILE = ".env";

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

const runtimeEnv = loadRuntimeEnv();

function connectionStatus(requiredKeys) {
  const missingKeys = requiredKeys.filter((key) => !String(process.env[key] || "").trim());
  return {
    ready: missingKeys.length === 0,
    missingKeys,
  };
}

const accountConnection = connectionStatus([
  "GAMEFOUNDRY_SUPABASE_URL",
  "GAMEFOUNDRY_SUPABASE_ANON_KEY",
]);
const databaseConnection = connectionStatus([
  "GAMEFOUNDRY_SUPABASE_URL",
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
  "GAMEFOUNDRY_DATABASE_URL",
]);
const host = process.env.GAMEFOUNDRY_LOCAL_API_HOST || "127.0.0.1";
const port = Number(process.env.GAMEFOUNDRY_LOCAL_API_PORT || 5501);

const localServer = await startLocalApiServer({ host, port });

console.log(`GameFoundry API runtime server running at ${localServer.baseUrl}/account/sign-in.html`);
console.log(runtimeEnv.loaded
  ? `.env loaded for API runtime (${runtimeEnv.loadedKeys} key(s) applied).`
  : ".env was not found for API runtime.");
console.log(`Configured auth connection: ${accountConnection.ready ? "configured" : `missing ${accountConnection.missingKeys.join(", ")}`}.`);
console.log(`Configured database connection: ${databaseConnection.ready ? "configured" : `missing ${databaseConnection.missingKeys.join(", ")}`}.`);
console.log("Press Ctrl+C to stop.");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await localServer.close();
    process.exit(0);
  });
}
