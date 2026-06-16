#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import tls from "node:tls";

const ENV_FILE = ".env.local";
const REQUEST_TIMEOUT_MS = 20000;
const POSTGRES_PROTOCOL_VERSION = 196608;
const POSTGRES_SSL_REQUEST_CODE = 80877103;
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
const DEV_REST_GRANTS_SQL = `
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
notify pgrst, 'reload schema';
`;

function int32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32BE(value, 0);
  return buffer;
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

function loadEnvLocal() {
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
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || String(process.env[key] || "").trim()) {
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
  const value = envValue("GAMEFOUNDRY_SUPABASE_DATABASE_URL");
  if (!value) {
    throw new Error("GAMEFOUNDRY_SUPABASE_DATABASE_URL is required to apply DEV DDL.");
  }
  const databaseUrl = new URL(value);
  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("GAMEFOUNDRY_SUPABASE_DATABASE_URL must use postgres:// or postgresql://.");
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
      closedError = new Error("Connection closed before the expected PostgreSQL response.");
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
    pgCString("gamefoundry-dev-ddl-apply"),
    Buffer.from([0]),
  ]);
  const payload = Buffer.concat([int32(POSTGRES_PROTOCOL_VERSION), params]);
  return Buffer.concat([int32(payload.length + 4), payload]);
}

function pgPasswordMessage(content) {
  const payload = Buffer.isBuffer(content) ? content : pgCString(content);
  return Buffer.concat([Buffer.from("p"), int32(payload.length + 4), payload]);
}

function pgQueryMessage(sql) {
  const payload = Buffer.concat([Buffer.from(sql, "utf8"), Buffer.from([0])]);
  return Buffer.concat([Buffer.from("Q"), int32(payload.length + 4), payload]);
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
      rejectUnauthorized: false,
      servername: host,
      socket,
    });
    secureSocket.once("secureConnect", () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });
}

async function authenticate(socket, config) {
  const reader = createReader(socket);
  socket.write(pgStartupMessage(config));
  let scramClient = null;
  while (true) {
    const message = await readPgMessage(reader);
    if (message.type === "R") {
      const authCode = message.payload.readInt32BE(0);
      if (authCode === 0) {
        continue;
      }
      if (authCode === 3) {
        socket.write(pgPasswordMessage(config.password));
        continue;
      }
      if (authCode === 5) {
        socket.write(pgPasswordMessage(md5PostgresPassword(config.password, config.user, message.payload.subarray(4, 8))));
        continue;
      }
      if (authCode === 10) {
        const mechanisms = parseCStringList(message.payload, 4);
        if (!mechanisms.includes("SCRAM-SHA-256")) {
          throw new Error(`PostgreSQL requested unsupported authentication mechanism: ${mechanisms.join(", ") || "unknown"}.`);
        }
        scramClient = createScramClient(config.user, config.password);
        const initialResponse = Buffer.from(scramClient.clientFirstMessage, "utf8");
        socket.write(pgPasswordMessage(Buffer.concat([
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
        socket.write(pgPasswordMessage(Buffer.from(scramClient.createFinalMessage(message.payload.subarray(4).toString("utf8")), "utf8")));
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
      return reader;
    }
  }
}

async function executeSql(socket, reader, sql) {
  socket.write(pgQueryMessage(sql));
  const commands = [];
  while (true) {
    const message = await readPgMessage(reader);
    if (message.type === "C") {
      commands.push(message.payload.toString("utf8").replace(/\0$/u, ""));
      continue;
    }
    if (message.type === "E") {
      throw new Error(parsePgError(message.payload));
    }
    if (message.type === "Z") {
      return commands;
    }
  }
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
  const envLoad = loadEnvLocal();
  const config = parseDatabaseUrl();
  if (!config.user || !config.password) {
    throw new Error("GAMEFOUNDRY_SUPABASE_DATABASE_URL must include username and password.");
  }
  const socket = await openPostgresTlsConnection(config);
  try {
    const reader = await authenticate(socket, config);
    const commandResponses = [];
    for (const ddlFile of readDdlFiles()) {
      try {
        const commands = await executeSql(socket, reader, ddlFile.sql);
        commandResponses.push({
          commands,
          filePath: ddlFile.filePath,
        });
      } catch (error) {
        throw new Error(`Failed applying ${ddlFile.filePath}: ${error instanceof Error ? error.message : String(error || "Unknown PostgreSQL error.")}`);
      }
    }
    commandResponses.push({
      commands: await executeSql(socket, reader, DEV_REST_GRANTS_SQL),
      filePath: "DEV REST grants",
    });
    socket.write(Buffer.from("X\0\0\0\u0004", "binary"));
    console.log(envLoad.loaded
      ? `PASS - .env.local loaded (${envLoad.loadedKeys.length} key(s) loaded)`
      : `FAIL - ${ENV_FILE} was not found`);
    console.log("WARN - Direct PostgreSQL DDL connection used TLS without certificate verification for DEV only; no secrets were printed.");
    console.log(`PASS - Applied ${DDL_FILES.length} grouped DEV DDL file(s).`);
    console.log("PASS - Applied DEV service_role REST grants and requested PostgREST schema reload.");
    console.log(`PASS - PostgreSQL command responses received: ${commandResponses.reduce((total, result) => total + result.commands.length, 0)}.`);
    DDL_FILES.forEach((filePath) => console.log(`APPLIED - ${filePath}`));
  } finally {
    socket.end();
  }
}

await main();
