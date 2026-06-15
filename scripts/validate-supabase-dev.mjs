#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import tls from "node:tls";
import { URL } from "node:url";

const ENV_FILE = ".env.local";
const REQUIRED_ENV = Object.freeze([
  {
    key: "GAMEFOUNDRY_SUPABASE_URL",
    label: "URL configured",
  },
  {
    key: "GAMEFOUNDRY_SUPABASE_ANON_KEY",
    label: "Publishable key configured",
  },
  {
    key: "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
    label: "Service role key configured",
  },
  {
    key: "GAMEFOUNDRY_SUPABASE_DATABASE_URL",
    label: "Database URL configured",
  },
]);

const IDENTITY_TABLES = Object.freeze(["users", "roles", "user_roles"]);
const REQUEST_TIMEOUT_MS = 15000;
const POSTGRES_PROTOCOL_VERSION = 196608;
const POSTGRES_SSL_REQUEST_CODE = 80877103;

function int32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32BE(value, 0);
  return buffer;
}

function maskValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "missing";
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

function parseEnvLocal(contents) {
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

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ENV_FILE);
  if (!fs.existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: [],
      path: envPath,
    };
  }
  const values = parseEnvLocal(fs.readFileSync(envPath, "utf8"));
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
    const databaseUrl = new URL(envValue("GAMEFOUNDRY_SUPABASE_DATABASE_URL"));
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

function warn(label, detail = "") {
  return result("WARN", label, detail);
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
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

async function checkIdentityTable(tableName) {
  try {
    const serviceRoleKey = envValue("GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY");
    const response = await fetchWithTimeout(supabaseApiUrl(`/rest/v1/${encodeURIComponent(tableName)}?select=key&limit=1`), {
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    if (response.ok) {
      return pass(`${tableName} table`, `HTTP ${response.status}`);
    }
    const payload = await safeJson(response);
    const message = payload?.message || "";
    const setupHint = response.status === 404
      ? " Run docs_build/database/ddl/account/supabase-identity-tables.sql through the approved Supabase SQL setup path."
      : "";
    return fail(`${tableName} table`, `HTTP ${response.status}${message ? `: ${message}` : ""}${setupHint}`);
  } catch (error) {
    return fail(`${tableName} table`, error?.code || error?.cause?.code || error?.message);
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function checkTlsValidation() {
  try {
    const { hostname } = new URL(envValue("GAMEFOUNDRY_SUPABASE_URL"));
    await new Promise((resolve, reject) => {
      const socket = tls.connect({
        host: hostname,
        port: 443,
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
  const databaseUrl = new URL(envValue("GAMEFOUNDRY_SUPABASE_DATABASE_URL"));
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

function createReader(socket) {
  let buffer = Buffer.alloc(0);
  const waiters = [];
  let closedError = null;

  function flush() {
    while (waiters.length && (closedError || buffer.length >= waiters[0].size)) {
      const waiter = waiters.shift();
      clearTimeout(waiter.timeout);
      if (closedError) {
        waiter.reject(closedError);
        continue;
      }
      const chunk = buffer.subarray(0, waiter.size);
      buffer = buffer.subarray(waiter.size);
      waiter.resolve(chunk);
    }
  }

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    flush();
  });
  socket.once("error", (error) => {
    closedError = error;
    flush();
  });
  socket.once("close", () => {
    if (!closedError) {
      closedError = new Error("Connection closed before the expected response was received.");
      flush();
    }
  });

  return {
    read(size, timeoutMs = REQUEST_TIMEOUT_MS) {
      if (closedError) {
        return Promise.reject(closedError);
      }
      if (buffer.length >= size) {
        const chunk = buffer.subarray(0, size);
        buffer = buffer.subarray(size);
        return Promise.resolve(chunk);
      }
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const index = waiters.findIndex((waiter) => waiter.resolve === resolve);
          if (index !== -1) {
            waiters.splice(index, 1);
          }
          reject(new Error("Timed out waiting for PostgreSQL response."));
        }, timeoutMs);
        waiters.push({
          reject,
          resolve,
          size,
          timeout,
        });
      });
    },
  };
}

async function readPgMessage(reader) {
  const type = (await reader.read(1)).toString("utf8");
  const length = (await reader.read(4)).readInt32BE(0);
  const payload = length > 4 ? await reader.read(length - 4) : Buffer.alloc(0);
  return {
    payload,
    type,
  };
}

function pgCString(value) {
  return Buffer.from(`${value}\0`, "utf8");
}

function pgStartupMessage({ database, user }) {
  const params = Buffer.concat([
    pgCString("user"),
    pgCString(user),
    pgCString("database"),
    pgCString(database),
    pgCString("client_encoding"),
    pgCString("UTF8"),
    pgCString("application_name"),
    pgCString("gamefoundry-dev-validator"),
    Buffer.from([0]),
  ]);
  const payload = Buffer.concat([int32(POSTGRES_PROTOCOL_VERSION), params]);
  return Buffer.concat([int32(payload.length + 4), payload]);
}

function pgPasswordMessage(content) {
  const payload = Buffer.isBuffer(content) ? content : pgCString(content);
  return Buffer.concat([Buffer.from("p"), int32(payload.length + 4), payload]);
}

function parseCStringList(payload, offset = 0) {
  const values = [];
  let start = offset;
  for (let index = offset; index < payload.length; index += 1) {
    if (payload[index] !== 0) {
      continue;
    }
    if (index === start) {
      break;
    }
    values.push(payload.subarray(start, index).toString("utf8"));
    start = index + 1;
  }
  return values;
}

function parsePgError(payload) {
  const fields = {};
  let index = 0;
  while (index < payload.length && payload[index] !== 0) {
    const code = String.fromCharCode(payload[index]);
    index += 1;
    const end = payload.indexOf(0, index);
    if (end === -1) {
      break;
    }
    fields[code] = payload.subarray(index, end).toString("utf8");
    index = end + 1;
  }
  return fields.M || fields.C || "PostgreSQL returned an error response.";
}

function md5PostgresPassword(password, user, salt) {
  const inner = crypto.createHash("md5").update(password + user).digest("hex");
  return `md5${crypto.createHash("md5").update(Buffer.concat([Buffer.from(inner), salt])).digest("hex")}`;
}

function saslName(value) {
  return String(value).replace(/=/g, "=3D").replace(/,/g, "=2C");
}

function xorBuffers(left, right) {
  const output = Buffer.alloc(left.length);
  for (let index = 0; index < left.length; index += 1) {
    output[index] = left[index] ^ right[index];
  }
  return output;
}

function parseScramAttributes(message) {
  const attributes = new Map();
  message.split(",").forEach((part) => {
    const key = part.slice(0, 1);
    attributes.set(key, part.slice(2));
  });
  return attributes;
}

function createScramClient(user, password) {
  const nonce = crypto.randomBytes(18).toString("base64").replace(/=+$/u, "");
  const clientFirstBare = `n=${saslName(user)},r=${nonce}`;
  const clientFirstMessage = `n,,${clientFirstBare}`;
  let expectedServerSignature = "";

  return {
    clientFirstMessage,
    createFinalMessage(serverFirstMessage) {
      const attributes = parseScramAttributes(serverFirstMessage);
      const serverNonce = attributes.get("r") || "";
      const salt = Buffer.from(attributes.get("s") || "", "base64");
      const iterations = Number(attributes.get("i") || 0);
      if (!serverNonce.startsWith(nonce) || !salt.length || !iterations) {
        throw new Error("PostgreSQL SCRAM authentication returned an invalid challenge.");
      }
      const clientFinalWithoutProof = `c=${Buffer.from("n,,").toString("base64")},r=${serverNonce}`;
      const authMessage = `${clientFirstBare},${serverFirstMessage},${clientFinalWithoutProof}`;
      const saltedPassword = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
      const clientKey = crypto.createHmac("sha256", saltedPassword).update("Client Key").digest();
      const storedKey = crypto.createHash("sha256").update(clientKey).digest();
      const clientSignature = crypto.createHmac("sha256", storedKey).update(authMessage).digest();
      const clientProof = xorBuffers(clientKey, clientSignature).toString("base64");
      const serverKey = crypto.createHmac("sha256", saltedPassword).update("Server Key").digest();
      expectedServerSignature = crypto.createHmac("sha256", serverKey).update(authMessage).digest("base64");
      return `${clientFinalWithoutProof},p=${clientProof}`;
    },
    verifyServerFinal(serverFinalMessage) {
      const attributes = parseScramAttributes(serverFinalMessage);
      const signature = attributes.get("v");
      if (expectedServerSignature && signature && signature !== expectedServerSignature) {
        throw new Error("PostgreSQL SCRAM server signature did not match.");
      }
    },
  };
}

async function openPostgresTlsConnection({ host, port }) {
  const socket = net.connect({
    host,
    port,
    timeout: REQUEST_TIMEOUT_MS,
  });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("PostgreSQL TCP connection timed out."));
    });
    socket.once("error", reject);
  });
  socket.write(Buffer.concat([int32(8), int32(POSTGRES_SSL_REQUEST_CODE)]));
  const sslResponse = await new Promise((resolve, reject) => {
    socket.once("data", (chunk) => resolve(chunk.subarray(0, 1).toString("utf8")));
    socket.once("error", reject);
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("Timed out waiting for PostgreSQL SSL response."));
    });
  });
  if (sslResponse !== "S") {
    socket.destroy();
    throw new Error("PostgreSQL server did not accept TLS negotiation.");
  }
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({
      rejectUnauthorized: true,
      servername: host,
      socket,
    });
    secureSocket.once("secureConnect", () => {
      if (secureSocket.authorized) {
        resolve(secureSocket);
        return;
      }
      const reason = secureSocket.authorizationError || "PostgreSQL TLS certificate was not authorized.";
      secureSocket.destroy();
      reject(new Error(reason));
    });
    secureSocket.once("error", reject);
  });
}

async function checkDatabaseConnection() {
  let secureSocket = null;
  try {
    const config = parseDatabaseUrl();
    if (!config.user || !config.password) {
      throw new Error("Database URL must include username and password.");
    }
    secureSocket = await openPostgresTlsConnection(config);
    const reader = createReader(secureSocket);
    secureSocket.write(pgStartupMessage(config));

    let scramClient = null;
    let authenticated = false;
    while (true) {
      const message = await readPgMessage(reader);
      if (message.type === "R") {
        const authCode = message.payload.readInt32BE(0);
        if (authCode === 0) {
          authenticated = true;
          continue;
        }
        if (authCode === 3) {
          secureSocket.write(pgPasswordMessage(config.password));
          continue;
        }
        if (authCode === 5) {
          secureSocket.write(pgPasswordMessage(md5PostgresPassword(config.password, config.user, message.payload.subarray(4, 8))));
          continue;
        }
        if (authCode === 10) {
          const mechanisms = parseCStringList(message.payload, 4);
          if (!mechanisms.includes("SCRAM-SHA-256")) {
            throw new Error(`PostgreSQL requested unsupported authentication mechanism: ${mechanisms.join(", ") || "unknown"}.`);
          }
          scramClient = createScramClient(config.user, config.password);
          const initialResponse = Buffer.from(scramClient.clientFirstMessage, "utf8");
          secureSocket.write(pgPasswordMessage(Buffer.concat([
            pgCString("SCRAM-SHA-256"),
            int32(initialResponse.length),
            initialResponse,
          ])));
          continue;
        }
        if (authCode === 11) {
          if (!scramClient) {
            throw new Error("PostgreSQL SCRAM challenge arrived before client setup.");
          }
          const finalMessage = scramClient.createFinalMessage(message.payload.subarray(4).toString("utf8"));
          secureSocket.write(pgPasswordMessage(Buffer.from(finalMessage, "utf8")));
          continue;
        }
        if (authCode === 12) {
          if (scramClient) {
            scramClient.verifyServerFinal(message.payload.subarray(4).toString("utf8"));
          }
          continue;
        }
        throw new Error(`PostgreSQL requested unsupported authentication code ${authCode}.`);
      }
      if (message.type === "E") {
        throw new Error(parsePgError(message.payload));
      }
      if (message.type === "Z") {
        if (!authenticated) {
          throw new Error("PostgreSQL reached ready state before authentication completed.");
        }
        return pass("Database connection");
      }
    }
  } catch (error) {
    return fail("Database connection", error?.code || error?.message);
  } finally {
    if (secureSocket) {
      secureSocket.end();
    }
  }
}

function isTlsTrustFailure(detail) {
  return [
    "CERT_",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  ].some((marker) => String(detail || "").includes(marker));
}

function directDatabaseReadiness(databaseResult, restIdentityReady) {
  if (databaseResult.status !== "FAIL") {
    return databaseResult;
  }
  if (restIdentityReady && isTlsTrustFailure(databaseResult.detail)) {
    return warn(
      "Database connection",
      `${databaseResult.detail}; REST/API identity readiness passed, so direct PostgreSQL TLS failure is advisory for DEV.`,
    );
  }
  return databaseResult;
}

async function main() {
  const envLoad = loadEnvLocal();
  const results = [];
  results.push(envLoad.loaded
    ? pass(".env.local loaded", `${envLoad.loadedKeys.length} key(s) loaded`)
    : fail(".env.local loaded", `${ENV_FILE} was not found`));

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
  const identityTableResults = [];
  for (const tableName of IDENTITY_TABLES) {
    identityTableResults.push(await checkIdentityTable(tableName));
  }
  const restIdentityReady = serviceRole.status === "PASS"
    && identityTableResults.every((check) => check.status === "PASS");
  results.push(directDatabaseReadiness(await checkDatabaseConnection(), restIdentityReady));
  results.push(...identityTableResults);

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
