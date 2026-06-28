#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import process from "node:process";
import tls from "node:tls";
import { URL } from "node:url";
import { createPostgresConnectionClient, databaseSslMode } from "../../api/persistence/postgres-connection-client.mjs";

const ENV_FILE = ".env";
const REQUIRED_ENV = Object.freeze([
  {
    key: "GAMEFOUNDRY_SUPABASE_URL",
    label: "Auth connection URL configured",
  },
  {
    key: "GAMEFOUNDRY_SUPABASE_ANON_KEY",
    label: "Auth anon key configured",
  },
  {
    key: "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
    label: "Auth service role key configured",
  },
  {
    key: "GAMEFOUNDRY_DATABASE_URL",
    label: "Database connection URL configured",
  },
  {
    key: "GAMEFOUNDRY_DATABASE_SSL",
    label: "Database SSL mode configured",
  },
]);

const REQUIRED_TABLES = Object.freeze(["users", "roles", "user_roles", "platform_settings"]);
const REQUEST_TIMEOUT_MS = 15000;

function systemCaCertificates() {
  return typeof tls.getCACertificates === "function"
    ? tls.getCACertificates("system")
    : undefined;
}

function maskValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "missing";
  }
  if (normalized === "disable" || normalized === "require") {
    return normalized;
  }
  if (normalized.length <= 10) {
    return `${normalized.slice(0, Math.min(6, normalized.length))}...`;
  }
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function parseEnvFile(contents) {
  const values = new Map();
  contents.split(/\r?\n/).forEach((line) => {
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
    const value = parseEnvValue(normalized.slice(separatorIndex + 1));
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      values.set(key, value);
    }
  });
  return values;
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ENV_FILE);
  if (!fs.existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: [],
      path: envPath,
    };
  }
  const values = parseEnvFile(fs.readFileSync(envPath, "utf8"));
  values.forEach((value, key) => {
    if (!String(process.env[key] || "").trim()) {
      process.env[key] = value;
    }
  });
  return {
    loaded: true,
    loadedKeys: Array.from(values.keys()).sort(),
    path: envPath,
  };
}

function envValue(key) {
  return String(process.env[key] || "").trim();
}

function sanitizeDiagnostic(value) {
  const source = String(value || "").trim();
  if (!source) {
    return "";
  }
  let text = source;
  REQUIRED_ENV.forEach(({ key }) => {
    const raw = envValue(key);
    if (raw) {
      text = text.split(raw).join(maskValue(raw));
    }
  });
  try {
    const databaseUrl = new URL(envValue("GAMEFOUNDRY_DATABASE_URL"));
    if (databaseUrl.password) {
      text = text.split(databaseUrl.password).join(maskValue(databaseUrl.password));
    }
  } catch {
    // Ignore malformed or missing database URLs while sanitizing diagnostics.
  }
  return text;
}

function result(status, label, detail = "") {
  return {
    detail: sanitizeDiagnostic(detail),
    label,
    status,
  };
}

function pass(label, detail = "") {
  return result("PASS", label, detail);
}

function fail(label, detail = "") {
  return result("FAIL", label, detail);
}

function formatResult({ detail, label, status }) {
  return detail ? `${status} - ${label} (${detail})` : `${status} - ${label}`;
}

function supabaseApiUrl(route) {
  const base = envValue("GAMEFOUNDRY_SUPABASE_URL").replace(/\/+$/, "");
  if (!base) {
    throw new Error("GAMEFOUNDRY_SUPABASE_URL is missing.");
  }
  return `${base}${route}`;
}

async function fetchWithTimeout(url, options = {}) {
  const requestUrl = new URL(url);
  const client = requestUrl.protocol === "http:" ? http : https;
  return new Promise((resolve, reject) => {
    const request = client.request(requestUrl, {
      headers: options.headers,
      method: options.method || "GET",
      timeout: REQUEST_TIMEOUT_MS,
      ca: requestUrl.protocol === "https:" ? systemCaCertificates() : undefined,
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => {
        chunks.push(chunk);
      });
      response.on("end", () => {
        const status = Number(response.statusCode || 0);
        const rawBody = Buffer.concat(chunks).toString("utf8");
        resolve({
          ok: status >= 200 && status < 300,
          status,
          async json() {
            return rawBody ? JSON.parse(rawBody) : {};
          },
        });
      });
    });
    request.once("timeout", () => {
      request.destroy(new Error("Request timed out."));
    });
    request.once("error", reject);
    if (options.body) {
      request.write(options.body);
    }
    request.end();
  });
}

async function checkSupabaseReachable() {
  try {
    const response = await fetchWithTimeout(supabaseApiUrl("/"));
    return pass("Supabase reachable", `HTTP ${response.status}`);
  } catch (error) {
    return fail("Supabase reachable", error?.code || error?.cause?.code || error?.message);
  }
}

async function checkAuthEndpointReachable() {
  try {
    const anonKey = envValue("GAMEFOUNDRY_SUPABASE_ANON_KEY");
    const response = await fetchWithTimeout(supabaseApiUrl("/auth/v1/settings"), {
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${anonKey}`,
      },
    });
    return response.status < 500
      ? pass("Auth endpoint reachable", `HTTP ${response.status}`)
      : fail("Auth endpoint reachable", `HTTP ${response.status}`);
  } catch (error) {
    return fail("Auth endpoint reachable", error?.code || error?.cause?.code || error?.message);
  }
}

async function checkServiceRoleAuthentication() {
  try {
    const serviceRoleKey = envValue("GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY");
    const response = await fetchWithTimeout(supabaseApiUrl("/auth/v1/admin/users?page=1&per_page=1"), {
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    if (response.ok) {
      return pass("Service role authentication", `HTTP ${response.status}`);
    }
    return fail("Service role authentication", `HTTP ${response.status}`);
  } catch (error) {
    return fail("Service role authentication", error?.code || error?.cause?.code || error?.message);
  }
}

function quoteIdentifier(value) {
  const name = String(value || "").trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid database identifier: ${name || "(empty)"}.`);
  }
  return `"${name.replace(/"/g, "\"\"")}"`;
}

async function checkIdentityTable(tableName) {
  try {
    const config = parseDatabaseUrl();
    const client = createPostgresConnectionClient();
    await client.query(`SELECT key FROM ${quoteIdentifier(tableName)} LIMIT 1;`);
    return pass(`${tableName} table`, databaseDiagnostic(config));
  } catch (error) {
    return fail(`${tableName} table`, error?.code || error?.cause?.code || error?.message);
  }
}

async function checkTlsValidation() {
  try {
    const { hostname } = new URL(envValue("GAMEFOUNDRY_SUPABASE_URL"));
    await new Promise((resolve, reject) => {
      const socket = tls.connect({
        host: hostname,
        port: 443,
        ca: systemCaCertificates(),
        rejectUnauthorized: true,
        servername: hostname,
        timeout: REQUEST_TIMEOUT_MS,
      });
      socket.once("secureConnect", () => {
        if (socket.authorized) {
          socket.end();
          resolve();
          return;
        }
        const reason = socket.authorizationError || "TLS certificate was not authorized.";
        socket.destroy();
        reject(new Error(reason));
      });
      socket.once("timeout", () => {
        socket.destroy();
        reject(new Error("TLS validation timed out."));
      });
      socket.once("error", reject);
    });
    return pass("TLS validation");
  } catch (error) {
    return fail("TLS validation", error?.code || error?.message);
  }
}

function parseDatabaseUrl() {
  const databaseUrl = new URL(envValue("GAMEFOUNDRY_DATABASE_URL"));
  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("Database URL must use postgres:// or postgresql://.");
  }
  return {
    database: decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "") || "postgres"),
    host: databaseUrl.hostname,
    password: decodeURIComponent(databaseUrl.password || ""),
    port: Number(databaseUrl.port || 5432),
    user: decodeURIComponent(databaseUrl.username || ""),
  };
}

function databaseDiagnostic(config) {
  return `host=${config.host}; port=${config.port}; database=${config.database}`;
}

function checkDatabaseSslMode() {
  try {
    return pass(`Database SSL mode: ${databaseSslMode()}`);
  } catch (error) {
    return fail("Database SSL mode", error?.message);
  }
}

async function checkDatabaseConnection() {
  try {
    const config = parseDatabaseUrl();
    if (!config.user || !config.password) {
      throw new Error("Database URL must include username and password.");
    }
    const client = createPostgresConnectionClient();
    await client.query("SELECT 1 AS ok;");
    return pass("Database connection", databaseDiagnostic(config));
  } catch (error) {
    return fail("Database connection", error?.code || error?.message);
  }
}

async function main() {
  const envLoad = loadEnvFile();
  const results = [];
  results.push(envLoad.loaded
    ? pass("Runtime .env validation load", `${envLoad.loadedKeys.length} key(s) loaded`)
    : fail("Runtime .env validation load", `${ENV_FILE} was not found`));

  REQUIRED_ENV.forEach(({ key, label }) => {
    const value = envValue(key);
    results.push(value ? pass(label, `${key}=${maskValue(value)}`) : fail(label, `${key}=missing`));
  });

  const supabaseReachable = await checkSupabaseReachable();
  const tlsValidation = await checkTlsValidation();
  const authEndpoint = await checkAuthEndpointReachable();
  const serviceRole = await checkServiceRoleAuthentication();
  results.push(supabaseReachable);
  results.push(tlsValidation);
  results.push(authEndpoint);
  results.push(serviceRole);
  const tableResults = [];
  for (const tableName of REQUIRED_TABLES) {
    tableResults.push(await checkIdentityTable(tableName));
  }
  results.push(checkDatabaseSslMode());
  results.push(await checkDatabaseConnection());
  results.push(...tableResults);

  results.forEach((check) => {
    console.log(formatResult(check));
  });
  const failed = results.filter((check) => check.status === "FAIL");
  const warned = results.filter((check) => check.status === "WARN");
  console.log("");
  console.log(`Overall Result: ${failed.length ? "FAIL" : "PASS"}`);
  if (warned.length) {
    console.log(`Warning checks: ${warned.map((check) => check.label).join(", ")}`);
  }
  if (failed.length) {
    console.log(`Failed checks: ${failed.map((check) => check.label).join(", ")}`);
    process.exitCode = 1;
  }
}

await main();
