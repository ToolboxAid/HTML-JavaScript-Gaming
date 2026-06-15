import process from "node:process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  LOCAL_DATABASE_PROVIDER_ID,
  SUPABASE_AUTH_PROVIDER_ID,
} from "../src/dev-runtime/auth/provider-contract-stubs.mjs";
import { startLocalApiServer } from "../src/dev-runtime/server/local-api-server.mjs";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
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

const envLocal = loadEnvLocal();

function configureLocalApiProviders() {
  const hasSupabaseAuthConfig = Boolean(
    process.env.GAMEFOUNDRY_SUPABASE_URL &&
    process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY &&
    process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY,
  );
  const previousAuthProvider = process.env.GAMEFOUNDRY_AUTH_PROVIDER || "";
  if (hasSupabaseAuthConfig) {
    process.env.GAMEFOUNDRY_AUTH_PROVIDER = SUPABASE_AUTH_PROVIDER_ID;
  }
  if (!process.env.GAMEFOUNDRY_DB_PROVIDER) {
    process.env.GAMEFOUNDRY_DB_PROVIDER = LOCAL_DATABASE_PROVIDER_ID;
  }
  return {
    authProvider: process.env.GAMEFOUNDRY_AUTH_PROVIDER || "",
    dbProvider: process.env.GAMEFOUNDRY_DB_PROVIDER || "",
    selectedSupabaseAuthForDev:
      hasSupabaseAuthConfig && previousAuthProvider !== SUPABASE_AUTH_PROVIDER_ID,
  };
}

const providerSelection = configureLocalApiProviders();
const host = process.env.GAMEFOUNDRY_LOCAL_API_HOST || "127.0.0.1";
const port = Number(process.env.GAMEFOUNDRY_LOCAL_API_PORT || 5501);

const localServer = await startLocalApiServer({ host, port });

console.log(`GameFoundry API-backed local server running at ${localServer.baseUrl}/account/sign-in.html`);
console.log(envLocal.loaded
  ? `.env.local loaded for local API runtime (${envLocal.loadedKeys} key(s) applied).`
  : ".env.local was not found for local API runtime.");
console.log(`Local API auth provider: ${providerSelection.authProvider || "(unset)"}.`);
console.log(`Local API product data provider: ${providerSelection.dbProvider || "(unset)"}.`);
if (providerSelection.selectedSupabaseAuthForDev) {
  console.log("Supabase Auth selected for local API runtime because Supabase DEV auth configuration is present.");
}
console.log("Press Ctrl+C to stop.");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await localServer.close();
    process.exit(0);
  });
}
