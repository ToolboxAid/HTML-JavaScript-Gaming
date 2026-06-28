#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createConfiguredProjectAssetStorage } from "../../api/storage/r2-project-asset-storage.mjs";
import {
  STORAGE_ENV_KEYS,
  STORAGE_PROJECTS_ALLOWED_PREFIXES,
  loadStorageConfig,
} from "../../api/storage/storage-config.mjs";

const ENV_FILE = ".env";

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function loadRuntimeEnv() {
  const envPath = path.resolve(process.cwd(), ENV_FILE);
  if (!fs.existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: [],
      path: envPath,
    };
  }
  const loadedKeys = [];
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }
    const key = normalized.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return;
    }
    process.env[key] = parseEnvValue(normalized.slice(separatorIndex + 1));
    loadedKeys.push(key);
  });
  return {
    loaded: true,
    loadedKeys: loadedKeys.sort(),
    path: envPath,
  };
}

const envLoad = loadRuntimeEnv();
if (!envLoad.loaded) {
  console.log("SKIP - .env was not found; storage config validation uses .env only.");
  process.exit(0);
}

const config = loadStorageConfig();
const presentKeys = STORAGE_ENV_KEYS.filter((key) => String(process.env[key] || "").trim());
console.log(`PASS - .env loaded for storage config validation (${envLoad.loadedKeys.length} key(s) applied).`);
console.log(`PASS - Storage env keys present=${presentKeys.length}/${STORAGE_ENV_KEYS.length}.`);

if (!config.configured) {
  console.log(`SKIP - Storage DEV values are not fully configured in .env (${config.missingKeys?.join(", ") || config.validationError}).`);
  console.log(`SKIP - Approved project storage prefixes: ${STORAGE_PROJECTS_ALLOWED_PREFIXES.join(", ")}.`);
  process.exit(0);
}

console.log(`PASS - Storage endpoint configured: ${config.safe.endpoint}.`);
console.log(`PASS - Storage bucket configured: ${config.safe.bucket}.`);
console.log(`PASS - Storage projects prefix configured: ${config.safe.projectsPrefix}.`);
console.log("PASS - Storage access key and secret key stayed server-only; values were not printed.");

const storage = createConfiguredProjectAssetStorage();
const listed = await storage.listProjectObjects();
if (!listed.ok) {
  throw new Error(listed.message);
}
console.log(`PASS - Storage list/readiness check succeeded for prefix ${config.safe.projectsPrefix}; objects=${listed.keys.length}.`);

