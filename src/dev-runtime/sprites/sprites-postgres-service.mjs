import { randomBytes } from "node:crypto";
import { createPostgresConnectionClient } from "../persistence/postgres-connection-client.mjs";

const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SPRITE_STATUSES = Object.freeze(["draft", "ready", "published", "archived"]);
export const SPRITES_POSTGRES_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sprite_records (
  key text PRIMARY KEY,
  "gameId" text REFERENCES game_workspace_games(key),
  "ownerUserId" text REFERENCES users(key),
  "name" text NOT NULL,
  "status" text NOT NULL,
  "category" text NOT NULL DEFAULT '',
  "tagKeys" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "source" text NOT NULL DEFAULT '',
  "storageObjectKey" text NOT NULL DEFAULT '',
  "storagePath" text NOT NULL DEFAULT '',
  "originalName" text NOT NULL DEFAULT '',
  "mimeType" text NOT NULL DEFAULT '',
  "width" integer,
  "height" integer,
  "sizeBytes" bigint,
  "checksum" text NOT NULL DEFAULT '',
  "paletteColorKeys" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "archived" boolean NOT NULL DEFAULT false,
  "archivedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE TABLE IF NOT EXISTS sprite_usage_references (
  key text PRIMARY KEY,
  "spriteKey" text NOT NULL REFERENCES sprite_records(key),
  "sourceType" text NOT NULL,
  "sourceKey" text NOT NULL,
  "label" text NOT NULL DEFAULT '',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE INDEX IF NOT EXISTS idx_sprite_records_gameid ON sprite_records ("gameId");
CREATE INDEX IF NOT EXISTS idx_sprite_records_owneruserid ON sprite_records ("ownerUserId");
CREATE INDEX IF NOT EXISTS idx_sprite_records_status ON sprite_records ("status");
CREATE INDEX IF NOT EXISTS idx_sprite_records_createdby ON sprite_records ("createdBy");
CREATE INDEX IF NOT EXISTS idx_sprite_records_updatedby ON sprite_records ("updatedBy");
CREATE INDEX IF NOT EXISTS idx_sprite_usage_references_spritekey ON sprite_usage_references ("spriteKey");
CREATE INDEX IF NOT EXISTS idx_sprite_usage_references_source ON sprite_usage_references ("sourceType", "sourceKey");
CREATE INDEX IF NOT EXISTS idx_sprite_usage_references_createdby ON sprite_usage_references ("createdBy");
CREATE INDEX IF NOT EXISTS idx_sprite_usage_references_updatedby ON sprite_usage_references ("updatedBy");
`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function encodeUlidPart(value, length) {
  let remaining = BigInt(value);
  let encoded = "";
  for (let index = 0; index < length; index += 1) {
    encoded = ULID_ALPHABET[Number(remaining % 32n)] + encoded;
    remaining /= 32n;
  }
  return encoded;
}

function createUlid() {
  const timePart = encodeUlidPart(Date.now(), 10);
  const randomPart = Array.from(randomBytes(16), (byte) => ULID_ALPHABET[byte % 32]).join("");
  return `${timePart}${randomPart}`;
}

function timestamp() {
  return new Date().toISOString();
}

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function queryForKey(key) {
  return `select=*&key=eq.${encodeURIComponent(key)}`;
}

function normalizeText(value) {
  return typeof value === "string" ? value : "";
}

function normalizeRequiredText(value, label) {
  const normalized = normalizeText(value).trim();
  if (!normalized) {
    throw httpError(`${label} is required.`);
  }
  return normalized;
}

function normalizeStatus(value, existingStatus = "") {
  const normalized = normalizeText(value || existingStatus).trim().toLowerCase();
  if (!SPRITE_STATUSES.includes(normalized)) {
    throw httpError(`Sprite status must be one of: ${SPRITE_STATUSES.join(", ")}.`);
  }
  return normalized;
}

function normalizeKeyList(value, label) {
  if (value === undefined || value === null || value === "") {
    return [];
  }
  if (!Array.isArray(value)) {
    throw httpError(`${label} must be an array of API/database keys.`);
  }
  return value.map((item) => normalizeText(item).trim()).filter(Boolean);
}

function normalizeOptionalInteger(value, label) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) {
    throw httpError(`${label} must be a non-negative whole number.`);
  }
  return numeric;
}

function normalizeActorKey(actorKey) {
  const normalized = normalizeText(actorKey).trim();
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(normalized)) {
    throw httpError("Sign in is required to save Sprites.", 401);
  }
  return normalized;
}

function assertNoColorDefinitions(input = {}) {
  const forbiddenKeys = ["colors", "hex", "palette", "paletteColors", "swatches"];
  const present = forbiddenKeys.filter((key) => Object.prototype.hasOwnProperty.call(input, key));
  if (present.length) {
    throw httpError("Sprites may reference Palette/Colors keys only; reusable color definitions belong to Palette/Colors.");
  }
}

function compareSpriteRows(left, right) {
  return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""))
    || String(left.name || "").localeCompare(String(right.name || ""), undefined, { sensitivity: "base" })
    || String(left.key || "").localeCompare(String(right.key || ""));
}

function spriteFromRow(row = {}, references = []) {
  return {
    archived: row.archived === true,
    archivedAt: row.archivedAt || "",
    category: row.category || "",
    checksum: row.checksum || "",
    createdAt: row.createdAt || "",
    createdBy: row.createdBy || "",
    gameId: row.gameId || "",
    height: row.height ?? null,
    key: row.key || "",
    mimeType: row.mimeType || "",
    name: row.name || "",
    originalName: row.originalName || "",
    ownerUserId: row.ownerUserId || "",
    paletteColorKeys: Array.isArray(row.paletteColorKeys) ? [...row.paletteColorKeys] : [],
    references,
    sizeBytes: row.sizeBytes ?? null,
    source: row.source || "",
    status: row.status || "",
    storageObjectKey: row.storageObjectKey || "",
    storagePath: row.storagePath || "",
    tagKeys: Array.isArray(row.tagKeys) ? [...row.tagKeys] : [],
    updatedAt: row.updatedAt || "",
    updatedBy: row.updatedBy || "",
    usageCount: references.length,
    width: row.width ?? null,
  };
}

function referenceFromRow(row = {}) {
  return {
    key: row.key || "",
    label: row.label || "",
    sourceKey: row.sourceKey || "",
    sourceType: row.sourceType || "",
    spriteKey: row.spriteKey || "",
  };
}

export class SpritesPostgresService {
  constructor({
    env = process.env,
    postgresClient = null,
  } = {}) {
    this.env = env;
    this.postgresClient = postgresClient;
    this.readyPromise = null;
  }

  client() {
    if (!this.postgresClient) {
      this.postgresClient = createPostgresConnectionClient({ env: this.env });
    }
    return this.postgresClient;
  }

  async ensureReady() {
    if (!this.readyPromise) {
      this.readyPromise = this.initialize();
    }
    return this.readyPromise;
  }

  async initialize() {
    await this.client().query(SPRITES_POSTGRES_SCHEMA_SQL);
  }

  close() {
    this.postgresClient?.close?.();
  }

  persistenceSummary() {
    return {
      engine: "Postgres",
      owner: "sprites",
      storage: "server-owned",
    };
  }

  async tableRows(tableName) {
    return clone(await this.client().requestTable(tableName, { method: "GET", query: "select=*" }));
  }

  async rowByKey(tableName, key) {
    const rows = await this.client().requestTable(tableName, { method: "GET", query: queryForKey(key) });
    return clone(rows)[0] || null;
  }

  async upsertRow(tableName, row) {
    const rows = await this.client().requestTable(tableName, { body: row, method: "POST" });
    return clone(rows)[0] || row;
  }

  async patchRow(tableName, key, row) {
    const rows = await this.client().requestTable(tableName, {
      body: row,
      method: "PATCH",
      query: queryForKey(key),
    });
    return clone(rows)[0] || null;
  }

  async deleteRow(tableName, key) {
    const rows = await this.client().requestTable(tableName, {
      method: "DELETE",
      query: queryForKey(key),
    });
    return clone(rows)[0] || null;
  }

  async referencesForSprite(spriteKey) {
    const rows = await this.tableRows("sprite_usage_references");
    return rows.filter((row) => row.spriteKey === spriteKey).map(referenceFromRow);
  }

  async spriteFromRecord(row) {
    return spriteFromRow(row, await this.referencesForSprite(row.key));
  }

  async listSprites() {
    await this.ensureReady();
    const rows = (await this.tableRows("sprite_records")).sort(compareSpriteRows);
    return Promise.all(rows.map((row) => this.spriteFromRecord(row)));
  }

  async getSprite(key) {
    await this.ensureReady();
    const row = await this.rowByKey("sprite_records", key);
    if (!row) {
      throw httpError("Sprite was not found.", 404);
    }
    return this.spriteFromRecord(row);
  }

  async findSpriteByName(name) {
    const normalized = normalizeText(name).trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    return (await this.tableRows("sprite_records")).find((row) => normalizeText(row.name).trim().toLowerCase() === normalized) || null;
  }

  normalizeSpriteInput(input = {}, existing = null) {
    assertNoColorDefinitions(input);
    const name = input.name === undefined && existing ? existing.name : normalizeRequiredText(input.name, "Sprite name");
    const status = input.status === undefined && existing ? existing.status : normalizeStatus(input.status);
    return {
      category: input.category === undefined && existing ? existing.category : normalizeText(input.category).trim(),
      checksum: input.checksum === undefined && existing ? existing.checksum : normalizeText(input.checksum).trim(),
      gameId: input.gameId === undefined && existing ? existing.gameId : normalizeText(input.gameId).trim(),
      height: input.height === undefined && existing ? existing.height : normalizeOptionalInteger(input.height, "Sprite height"),
      mimeType: input.mimeType === undefined && existing ? existing.mimeType : normalizeText(input.mimeType).trim(),
      name,
      originalName: input.originalName === undefined && existing ? existing.originalName : normalizeText(input.originalName).trim(),
      ownerUserId: input.ownerUserId === undefined && existing ? existing.ownerUserId : normalizeText(input.ownerUserId).trim(),
      paletteColorKeys: input.paletteColorKeys === undefined && existing ? existing.paletteColorKeys : normalizeKeyList(input.paletteColorKeys, "Palette color keys"),
      sizeBytes: input.sizeBytes === undefined && existing ? existing.sizeBytes : normalizeOptionalInteger(input.sizeBytes, "Sprite size bytes"),
      source: input.source === undefined && existing ? existing.source : normalizeText(input.source).trim(),
      status,
      storageObjectKey: input.storageObjectKey === undefined && existing ? existing.storageObjectKey : normalizeText(input.storageObjectKey).trim(),
      storagePath: input.storagePath === undefined && existing ? existing.storagePath : normalizeText(input.storagePath).trim(),
      tagKeys: input.tagKeys === undefined && existing ? existing.tagKeys : normalizeKeyList(input.tagKeys, "Tag keys"),
      width: input.width === undefined && existing ? existing.width : normalizeOptionalInteger(input.width, "Sprite width"),
    };
  }

  async createSprite(input = {}, actorKey = "") {
    await this.ensureReady();
    const actor = normalizeActorKey(actorKey);
    const values = this.normalizeSpriteInput(input);
    const duplicate = await this.findSpriteByName(values.name);
    if (duplicate && duplicate.archived !== true) {
      throw httpError(`Sprite ${values.name} already exists.`, 409);
    }
    const now = timestamp();
    const key = createUlid();
    await this.upsertRow("sprite_records", {
      ...values,
      archived: values.status === "archived",
      archivedAt: values.status === "archived" ? now : null,
      createdAt: now,
      createdBy: actor,
      key,
      ownerUserId: values.ownerUserId || actor,
      updatedAt: now,
      updatedBy: actor,
    });
    return this.getSprite(key);
  }

  async updateSprite(key, input = {}, actorKey = "") {
    const existing = await this.getSprite(key);
    const actor = normalizeActorKey(actorKey);
    const values = this.normalizeSpriteInput(input, existing);
    const duplicate = await this.findSpriteByName(values.name);
    if (duplicate && duplicate.key !== key && duplicate.archived !== true) {
      throw httpError(`Sprite ${values.name} already exists.`, 409);
    }
    const archived = values.status === "archived" || existing.archived === true;
    await this.patchRow("sprite_records", key, {
      ...values,
      archived,
      archivedAt: archived ? (existing.archivedAt || timestamp()) : null,
      updatedAt: timestamp(),
      updatedBy: actor,
    });
    return this.getSprite(key);
  }

  async archiveSprite(key, actorKey = "") {
    await this.getSprite(key);
    const actor = normalizeActorKey(actorKey);
    await this.patchRow("sprite_records", key, {
      archived: true,
      archivedAt: timestamp(),
      status: "archived",
      updatedAt: timestamp(),
      updatedBy: actor,
    });
    return this.getSprite(key);
  }

  async deleteSprite(key, actorKey = "") {
    const existing = await this.getSprite(key);
    normalizeActorKey(actorKey);
    if (existing.usageCount > 0) {
      throw httpError("Sprite is referenced by another record. Archive it instead of deleting it.", 409);
    }
    await this.deleteRow("sprite_records", key);
    return existing;
  }
}

export function createSpritesPostgresService(options = {}) {
  return new SpritesPostgresService(options);
}

export async function handleSpritesApiContract({
  actorKey = "",
  body = {},
  method = "GET",
  parts = [],
  service,
} = {}) {
  if (!service) {
    throw httpError("Sprites Postgres service is not configured.", 500);
  }
  const normalizedMethod = String(method || "GET").toUpperCase();
  const resource = parts[0] || "";
  const key = parts[1] || "";
  const action = parts[2] || "";

  if (resource === "records") {
    if (normalizedMethod === "GET" && !key) {
      return {
        persistence: service.persistenceSummary(),
        sprites: await service.listSprites(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        persistence: service.persistenceSummary(),
        sprite: await service.getSprite(key),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        persistence: service.persistenceSummary(),
        sprite: await service.createSprite(body, actorKey),
      };
    }
    if (normalizedMethod === "POST" && key && action === "archive") {
      return {
        persistence: service.persistenceSummary(),
        sprite: await service.archiveSprite(key, actorKey),
      };
    }
    if (normalizedMethod === "POST" && key && action === "delete") {
      return {
        persistence: service.persistenceSummary(),
        sprite: await service.deleteSprite(key, actorKey),
      };
    }
    if (normalizedMethod === "POST" && key && !action) {
      return {
        persistence: service.persistenceSummary(),
        sprite: await service.updateSprite(key, body, actorKey),
      };
    }
  }

  throw httpError(`Unknown Sprites API route: ${normalizedMethod} /api/sprites/${parts.join("/")}.`, 404);
}
