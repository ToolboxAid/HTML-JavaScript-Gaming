import crypto from "node:crypto";
import net from "node:net";
import tls from "node:tls";

const POSTGRES_PROTOCOL_VERSION = 196608;
const POSTGRES_SSL_REQUEST_CODE = 80877103;
const DEFAULT_TIMEOUT_MS = 15000;
const DATABASE_SSL_MODES = new Set(["disable", "require"]);
const BOOL_OID = 16;
const INT_OIDS = new Set([20, 21, 23]);
const FLOAT_OIDS = new Set([700, 701, 1700]);
const JSON_OIDS = new Set([114, 3802]);

function int32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32BE(value, 0);
  return buffer;
}

function pgCString(value) {
  return Buffer.from(`${value}\0`, "utf8");
}

export function databaseSslMode(env = process.env) {
  const value = String(env?.GAMEFOUNDRY_DATABASE_SSL || "").trim().toLowerCase();
  if (!value) {
    throw new Error("GAMEFOUNDRY_DATABASE_SSL is required. Use disable for plain TCP Postgres or require for TLS Postgres.");
  }
  if (!DATABASE_SSL_MODES.has(value)) {
    throw new Error(`GAMEFOUNDRY_DATABASE_SSL must be one of ${Array.from(DATABASE_SSL_MODES).join(", ")}.`);
  }
  return value;
}

function parseDatabaseConfig(env) {
  const value = String(env?.GAMEFOUNDRY_DATABASE_URL || "").trim();
  if (!value) {
    throw new Error("Configured database connection is not configured. Add GAMEFOUNDRY_DATABASE_URL on the server.");
  }
  const databaseUrl = new URL(value);
  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must use postgres:// or postgresql://.");
  }
  return {
    database: decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "") || "postgres"),
    host: databaseUrl.hostname,
    password: decodeURIComponent(databaseUrl.password || ""),
    port: Number(databaseUrl.port || 5432),
    rejectUnauthorized: false,
    sslMode: databaseSslMode(env),
    user: decodeURIComponent(databaseUrl.username || ""),
  };
}

function databaseSslRemediation(sslMode) {
  return sslMode === "disable"
    ? "If this database target requires TLS, set GAMEFOUNDRY_DATABASE_SSL=require."
    : "If this database target is a plain local Postgres listener, set GAMEFOUNDRY_DATABASE_SSL=disable.";
}

function databaseConnectionError(config, error) {
  const message = error instanceof Error ? error.message : String(error || "Unknown database connection error.");
  return new Error(`Database connection failed with GAMEFOUNDRY_DATABASE_SSL=${config.sslMode}: ${message} ${databaseSslRemediation(config.sslMode)}`);
}

function createReader(socket) {
  let buffer = Buffer.alloc(0);
  let closedError = null;
  const waiters = [];

  function flush() {
    while (waiters.length) {
      const waiter = waiters[0];
      if (closedError) {
        waiters.shift();
        clearTimeout(waiter.timeout);
        waiter.reject(closedError);
        continue;
      }
      if (buffer.length < waiter.length) {
        break;
      }
      waiters.shift();
      clearTimeout(waiter.timeout);
      const chunk = buffer.subarray(0, waiter.length);
      buffer = buffer.subarray(waiter.length);
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
    read(length, timeoutMs = DEFAULT_TIMEOUT_MS) {
      if (buffer.length >= length) {
        const chunk = buffer.subarray(0, length);
        buffer = buffer.subarray(length);
        return Promise.resolve(chunk);
      }
      if (closedError) {
        return Promise.reject(closedError);
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
          length,
          reject,
          resolve,
          timeout,
        });
        flush();
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

function pgStartupMessage({ database, user }) {
  const params = Buffer.concat([
    pgCString("user"),
    pgCString(user),
    pgCString("database"),
    pgCString(database),
    pgCString("client_encoding"),
    pgCString("UTF8"),
    pgCString("application_name"),
    pgCString("gamefoundry-runtime-product-data"),
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
  const payload = pgCString(sql);
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

async function openTcpSocket({ host, port }) {
  const socket = net.connect({
    host,
    port,
    timeout: DEFAULT_TIMEOUT_MS,
  });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("PostgreSQL TCP connection timed out."));
    });
    socket.once("error", reject);
  });
  return socket;
}

async function negotiateSocket(config) {
  const socket = await openTcpSocket(config);
  if (config.sslMode === "disable") {
    return socket;
  }

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
      rejectUnauthorized: config.rejectUnauthorized,
      servername: config.host,
      socket,
    });
    secureSocket.once("secureConnect", () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });
}

function parseFieldDescription(payload, offset) {
  const nameEnd = payload.indexOf(0, offset);
  const name = payload.subarray(offset, nameEnd).toString("utf8");
  const typeOid = payload.readInt32BE(nameEnd + 7);
  return {
    name,
    nextOffset: nameEnd + 19,
    typeOid,
  };
}

function parseRowDescription(payload) {
  const count = payload.readInt16BE(0);
  const fields = [];
  let offset = 2;
  for (let index = 0; index < count; index += 1) {
    const field = parseFieldDescription(payload, offset);
    fields.push({
      name: field.name,
      typeOid: field.typeOid,
    });
    offset = field.nextOffset;
  }
  return fields;
}

function parsePgValue(value, typeOid) {
  if (value === null) {
    return null;
  }
  if (typeOid === BOOL_OID) {
    return value === "t";
  }
  if (INT_OIDS.has(typeOid)) {
    return Number(value);
  }
  if (FLOAT_OIDS.has(typeOid)) {
    return Number(value);
  }
  if (JSON_OIDS.has(typeOid)) {
    return JSON.parse(value);
  }
  return value;
}

function parseDataRow(payload, fields) {
  const count = payload.readInt16BE(0);
  const row = {};
  let offset = 2;
  for (let index = 0; index < count; index += 1) {
    const length = payload.readInt32BE(offset);
    offset += 4;
    const field = fields[index];
    if (length === -1) {
      row[field.name] = null;
      continue;
    }
    const rawValue = payload.subarray(offset, offset + length).toString("utf8");
    row[field.name] = parsePgValue(rawValue, field.typeOid);
    offset += length;
  }
  return row;
}

function quoteIdentifier(value) {
  const name = String(value || "").trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid PostgreSQL identifier: ${name || "(empty)"}.`);
  }
  return `"${name.replace(/"/g, "\"\"")}"`;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  const normalized = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `'${normalized.replace(/'/g, "''")}'`;
}

function filterFromQuery(query = "") {
  const params = new URLSearchParams(query);
  for (const [key, value] of params.entries()) {
    if (key === "select" || key === "on_conflict") {
      continue;
    }
    if (!value.startsWith("eq.")) {
      throw new Error(`Unsupported PostgreSQL query filter for ${key}.`);
    }
    return {
      column: key,
      value: decodeURIComponent(value.slice(3)),
    };
  }
  return null;
}

function selectSql(tableName, query) {
  const filter = filterFromQuery(query);
  const where = filter ? ` WHERE ${quoteIdentifier(filter.column)} = ${sqlLiteral(filter.value)}` : "";
  return `SELECT * FROM ${quoteIdentifier(tableName)}${where};`;
}

function upsertSql(tableName, rows) {
  if (!rows.length) {
    return "";
  }
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row || {}))));
  if (!columns.includes("key")) {
    throw new Error(`PostgreSQL upsert for ${tableName} requires key.`);
  }
  const columnList = columns.map(quoteIdentifier).join(", ");
  const values = rows.map((row) => `(${columns.map((column) => sqlLiteral(row[column])).join(", ")})`).join(", ");
  const updateColumns = columns.filter((column) => column !== "key");
  const updateList = updateColumns.length
    ? updateColumns.map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`).join(", ")
    : `${quoteIdentifier("key")} = EXCLUDED.${quoteIdentifier("key")}`;
  return `INSERT INTO ${quoteIdentifier(tableName)} (${columnList}) VALUES ${values} ON CONFLICT (${quoteIdentifier("key")}) DO UPDATE SET ${updateList} RETURNING *;`;
}

function patchSql(tableName, body, query) {
  const filter = filterFromQuery(query);
  if (!filter) {
    throw new Error(`PostgreSQL patch for ${tableName} requires an equality filter.`);
  }
  const columns = Object.keys(body || {});
  if (!columns.length) {
    return "";
  }
  const setList = columns.map((column) => `${quoteIdentifier(column)} = ${sqlLiteral(body[column])}`).join(", ");
  return `UPDATE ${quoteIdentifier(tableName)} SET ${setList} WHERE ${quoteIdentifier(filter.column)} = ${sqlLiteral(filter.value)} RETURNING *;`;
}

function deleteSql(tableName, query) {
  const filter = filterFromQuery(query);
  if (!filter) {
    throw new Error(`PostgreSQL delete for ${tableName} requires an equality filter.`);
  }
  return `DELETE FROM ${quoteIdentifier(tableName)} WHERE ${quoteIdentifier(filter.column)} = ${sqlLiteral(filter.value)} RETURNING *;`;
}

class PostgresConnection {
  constructor(socket, reader) {
    this.socket = socket;
    this.reader = reader;
  }

  async authenticate(config) {
    this.socket.write(pgStartupMessage(config));
    let scramClient = null;
    let authenticated = false;
    while (true) {
      const message = await readPgMessage(this.reader);
      if (message.type === "R") {
        const authCode = message.payload.readInt32BE(0);
        if (authCode === 0) {
          authenticated = true;
          continue;
        }
        if (authCode === 3) {
          this.socket.write(pgPasswordMessage(config.password));
          continue;
        }
        if (authCode === 5) {
          this.socket.write(pgPasswordMessage(md5PostgresPassword(config.password, config.user, message.payload.subarray(4, 8))));
          continue;
        }
        if (authCode === 10) {
          const mechanisms = parseCStringList(message.payload, 4);
          if (!mechanisms.includes("SCRAM-SHA-256")) {
            throw new Error(`PostgreSQL requested unsupported authentication mechanism: ${mechanisms.join(", ") || "unknown"}.`);
          }
          scramClient = createScramClient(config.user, config.password);
          const initialResponse = Buffer.from(scramClient.clientFirstMessage, "utf8");
          this.socket.write(pgPasswordMessage(Buffer.concat([
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
          this.socket.write(pgPasswordMessage(Buffer.from(scramClient.createFinalMessage(message.payload.subarray(4).toString("utf8")), "utf8")));
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
        return;
      }
    }
  }

  async query(sql) {
    if (!sql) {
      return [];
    }
    this.socket.write(pgQueryMessage(sql));
    let fields = [];
    const rows = [];
    while (true) {
      const message = await readPgMessage(this.reader);
      if (message.type === "T") {
        fields = parseRowDescription(message.payload);
        continue;
      }
      if (message.type === "D") {
        rows.push(parseDataRow(message.payload, fields));
        continue;
      }
      if (message.type === "E") {
        throw new Error(parsePgError(message.payload));
      }
      if (message.type === "Z") {
        return rows;
      }
    }
  }

  close() {
    this.socket.write(Buffer.from("X\0\0\0\u0004", "binary"));
    this.socket.end();
  }
}

async function withConnection(config, callback) {
  const socket = await negotiateSocket(config).catch((error) => {
    throw databaseConnectionError(config, error);
  });
  const connection = new PostgresConnection(socket, createReader(socket));
  try {
    await connection.authenticate(config).catch((error) => {
      throw databaseConnectionError(config, error);
    });
    return await callback(connection);
  } finally {
    connection.close();
  }
}

export function createPostgresConnectionClient({ env = process.env } = {}) {
  const config = parseDatabaseConfig(env);
  if (!config.user || !config.password) {
    throw new Error("GAMEFOUNDRY_DATABASE_URL must include username and password.");
  }
  return {
    async query(sql) {
      return withConnection(config, (connection) => connection.query(sql));
    },
    async requestTable(tableName, { body = null, method = "GET", query = "select=*" } = {}) {
      const normalizedMethod = String(method || "GET").toUpperCase();
      return withConnection(config, (connection) => {
        if (normalizedMethod === "GET") {
          return connection.query(selectSql(tableName, query));
        }
        if (normalizedMethod === "POST") {
          return connection.query(upsertSql(tableName, Array.isArray(body) ? body : [body]));
        }
        if (normalizedMethod === "PATCH") {
          return connection.query(patchSql(tableName, body || {}, query));
        }
        if (normalizedMethod === "DELETE") {
          return connection.query(deleteSql(tableName, query));
        }
        throw new Error(`Unsupported PostgreSQL table request method: ${normalizedMethod}.`);
      });
    },
  };
}
