#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createPostgresConnectionClient, databaseSslMode } from "../src/dev-runtime/persistence/postgres-connection-client.mjs";

const ENV_FILE = ".env";
const DDL_FILES = Object.freeze([
  "docs_build/database/ddl/account.sql",
  "docs_build/database/ddl/admin.sql",
  "docs_build/database/ddl/game-workspace.sql",
  "docs_build/database/ddl/asset.sql",
  "docs_build/database/ddl/objects.sql",
  "docs_build/database/ddl/controls.sql",
  "docs_build/database/ddl/game-design.sql",
  "docs_build/database/ddl/game-configuration.sql",
  "docs_build/database/ddl/game-journey.sql",
  "docs_build/database/ddl/palette.sql",
  "docs_build/database/ddl/tags.sql",
  "docs_build/database/ddl/tool-metadata.sql",
  "docs_build/database/ddl/tool-planning.sql",
  "docs_build/database/ddl/toolbox-votes.sql",
  "docs_build/database/ddl/support-tickets.sql",
]);
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
    if (process.env[key] !== undefined) {
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

function envValue(key) {
  return String(process.env[key] || "").trim();
}

function parseDatabaseUrl() {
  const value = envValue("GAMEFOUNDRY_DATABASE_URL");
  if (!value) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL is required to apply GFS DDL.");
  }
  const databaseUrl = new URL(value);
  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must use postgres:// or postgresql://.");
  }
  const host = databaseUrl.hostname;
  return {
    database: decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "") || "postgres"),
    host,
    password: decodeURIComponent(databaseUrl.password || ""),
    port: Number(databaseUrl.port || 5432),
    sslMode: databaseSslMode(),
    user: decodeURIComponent(databaseUrl.username || ""),
  };
}

function databaseDiagnostic(config) {
  return `host=${config.host}; port=${config.port}; database=${config.database}`;
}

function connectionModeDiagnostic(config) {
  if (config.sslMode === "disable") {
    return "plain TCP";
  }
  return "TLS";
}

function readDdlFiles() {
  return DDL_FILES.map((filePath) => {
    const absolutePath = path.resolve(process.cwd(), filePath);
    return {
      filePath,
      sql: `\n-- Begin ${filePath}\n${fs.readFileSync(absolutePath, "utf8")}\n-- End ${filePath}\n`,
    };
  });
}

async function main() {
  const envLoad = loadRuntimeEnv();
  if (!envLoad.loaded) {
    throw new Error(`${ENV_FILE} was not found; DDL apply uses the same runtime env file.`);
  }

  const config = parseDatabaseUrl();
  if (!config.user || !config.password) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must include username and password.");
  }

  const client = createPostgresConnectionClient();
  await client.query("SELECT 1 AS ok;");

  const appliedFiles = [];
  for (const ddlFile of readDdlFiles()) {
    try {
      await client.query(ddlFile.sql);
      appliedFiles.push(ddlFile.filePath);
    } catch (error) {
      throw new Error(`Failed applying ${ddlFile.filePath}: ${error instanceof Error ? error.message : String(error || "Unknown PostgreSQL error.")}`);
    }
  }

  console.log(`PASS - .env loaded for DDL apply (${envLoad.loadedKeys.length} key(s) applied)`);
  console.log(`PASS - Database connection ready (${databaseDiagnostic(config)})`);
  console.log(`PASS - Database SSL mode: ${config.sslMode}`);
  console.log(`PASS - DDL connection mode selected from GAMEFOUNDRY_DATABASE_SSL: ${connectionModeDiagnostic(config)}.`);
  console.log(`PASS - Applied ${appliedFiles.length} grouped GFS DDL file(s) through GAMEFOUNDRY_DATABASE_URL.`);
  console.log("PASS - DDL connection behavior is driven by GAMEFOUNDRY_DATABASE_URL and GAMEFOUNDRY_DATABASE_SSL.");
  appliedFiles.forEach((filePath) => console.log(`APPLIED - ${filePath}`));
}

await main();
