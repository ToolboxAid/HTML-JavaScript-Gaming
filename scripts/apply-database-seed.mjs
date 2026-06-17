#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { syncSupabaseDevCreatorIdentities } from "../src/dev-runtime/testing/supabase-dev-creator-identity-seed-sync.mjs";

const ENV_FILE = ".env";
const DEV_DATABASE_NAME = "gamefoundry_dev";

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
    throw new Error(`${ENV_FILE} was not found; DEV seed uses the same runtime env file.`);
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
    if (process.env[key] !== undefined) {
      return;
    }
    process.env[key] = parseEnvValue(normalized.slice(separatorIndex + 1));
    loadedKeys.push(key);
  });
  return loadedKeys.sort();
}

function configuredDatabase() {
  const value = String(process.env.GAMEFOUNDRY_DATABASE_URL || "").trim();
  if (!value) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL is required for DEV seed validation.");
  }
  const databaseUrl = new URL(value);
  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must use postgres:// or postgresql://.");
  }
  return {
    database: decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "") || "postgres"),
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 5432),
  };
}

function assertDevSeedTarget(config) {
  if (config.database !== DEV_DATABASE_NAME) {
    throw new Error(`DEV seed refused for configured database "${config.database}". Copy the DEV connection to .env before running this lane; IST/UAT/PRD seed execution requires separate explicit approval outside this script.`);
  }
}

function runUnsafeTargetSelfTest() {
  try {
    assertDevSeedTarget({
      database: "gamefoundry_uat",
      host: "example.invalid",
      port: 5432,
    });
  } catch (error) {
    console.log(`PASS - Unsafe seed target refused: ${error instanceof Error ? error.message : String(error || "Unknown error.")}`);
    return;
  }
  throw new Error("Unsafe seed target self-test failed because non-DEV database was accepted.");
}

function roleEvidenceLine(result) {
  const evidence = result.verification.roleEvidence;
  return [
    `User 1 creator=${evidence.user1Creator ? "PASS" : "FAIL"}`,
    `User 2 creator=${evidence.user2Creator ? "PASS" : "FAIL"}`,
    `User 3 creator=${evidence.user3Creator ? "PASS" : "FAIL"}`,
    `DavidQ creator=${evidence.davidqCreator ? "PASS" : "FAIL"}`,
    `DavidQ admin=${evidence.davidqAdmin ? "PASS" : "FAIL"}`,
    `DavidQ owner=${evidence.davidqOwner ? "PASS" : "FAIL"}`,
  ].join(", ");
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has("--unsafe-target-self-test")) {
    runUnsafeTargetSelfTest();
    return;
  }

  const dryRun = args.has("--dry-run");
  const loadedKeys = loadRuntimeEnv();
  const database = configuredDatabase();
  assertDevSeedTarget(database);
  const result = await syncSupabaseDevCreatorIdentities({ dryRun });
  console.log(`PASS - .env loaded for DEV seed lane (${loadedKeys.length} key(s) applied).`);
  console.log(`PASS - DEV seed target confirmed (host=${database.host}; port=${database.port}; database=${database.database}).`);
  console.log(`PASS - DEV seed mode: ${dryRun ? "dry-run validation" : "apply"}.`);
  console.log(`PASS - Seed identity counts before auth=${result.beforeCounts.authUsers}; public.users=${result.beforeCounts.publicUsers}.`);
  console.log(`PASS - Seed identity counts after auth=${result.afterCounts.authUsers}; public.users=${result.afterCounts.publicUsers}.`);
  console.log(`PASS - Role evidence: ${roleEvidenceLine(result)}.`);
  console.log(`PASS - Verification failures: ${result.verification.failures.length ? result.verification.failures.join(", ") : "none"}.`);
  if (result.verification.failures.length) {
    process.exitCode = 1;
  }
}

await main();
