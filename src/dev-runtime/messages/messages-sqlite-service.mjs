import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import { SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";

const MESSAGES_SQLITE_PATH_ENV_KEY = "GAMEFOUNDRY_MESSAGES_SQLITE_PATH";
const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SEED_CATEGORY_NAMES = Object.freeze([
  "Dialog",
  "Narration",
  "Quest",
  "Tutorial",
  "Combat",
  "System",
  "Achievement",
  "Notification",
]);
const SEED_EMOTION_PROFILES = Object.freeze([
  Object.freeze({ description: "Neutral spoken delivery for general narration or dialog.", name: "Calm", pauseAfterMs: 150, pauseBeforeMs: 0, pitch: 1, rate: 1, volume: 1 }),
  Object.freeze({ description: "Fast, alert delivery for warnings and immediate danger.", name: "Urgent", pauseAfterMs: 80, pauseBeforeMs: 0, pitch: 1.08, rate: 1.15, volume: 1 }),
  Object.freeze({ description: "Quiet delivery for secret, stealth, or intimate lines.", name: "Whisper", pauseAfterMs: 180, pauseBeforeMs: 80, pitch: 0.95, rate: 0.9, volume: 0.55 }),
  Object.freeze({ description: "Forceful delivery for conflict or frustration.", name: "Angry", pauseAfterMs: 90, pauseBeforeMs: 0, pitch: 0.98, rate: 1.1, volume: 1 }),
  Object.freeze({ description: "Bright delivery for reveals, wins, and high-energy moments.", name: "Excited", pauseAfterMs: 100, pauseBeforeMs: 0, pitch: 1.12, rate: 1.12, volume: 1 }),
  Object.freeze({ description: "Soft delivery for loss, regret, or reflective moments.", name: "Sad", pauseAfterMs: 220, pauseBeforeMs: 100, pitch: 0.9, rate: 0.85, volume: 0.8 }),
  Object.freeze({ description: "Measured delivery for suspense, hidden lore, or strange events.", name: "Mysterious", pauseAfterMs: 260, pauseBeforeMs: 120, pitch: 0.92, rate: 0.88, volume: 0.85 }),
]);
const SEED_TTS_PROFILES = Object.freeze([
  Object.freeze({
    description: "Balanced local browser playback option until authored TTS profiles are available.",
    language: "en-US",
    name: "Default Balanced TTS Profile",
    pitch: 1,
    providerKey: "browser-speech",
    rate: 1,
    voiceName: "",
    volume: 1,
  }),
  Object.freeze({
    description: "Narration-focused preview configuration for future spoken story text.",
    language: "en-US",
    name: "Narration Preview",
    pitch: 0.95,
    providerKey: "browser-speech",
    rate: 0.9,
    voiceName: "",
    volume: 0.9,
  }),
]);

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

function normalizeText(value) {
  return typeof value === "string" ? value : "";
}

function normalizeName(value, label) {
  const normalized = normalizeText(value).trim();
  if (!normalized) {
    throw httpError(`${label} is required.`);
  }
  return normalized;
}

function normalizeActive(value, fallback = true) {
  return value === undefined ? fallback : value !== false;
}

function normalizeNumber(value, fallback) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeInteger(value, fallback) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) ? numberValue : fallback;
}

function normalizeActorKey(actorKey) {
  const normalized = normalizeText(actorKey).trim();
  return normalized || SEED_DB_KEYS.users.forgeBot;
}

function activeToDatabase(value) {
  return value ? 1 : 0;
}

function activeFromDatabase(value) {
  return Number(value) !== 0;
}

function resolveMessagesDatabasePath(repoRoot, env = process.env) {
  const configuredPath = normalizeText(env[MESSAGES_SQLITE_PATH_ENV_KEY]).trim();
  if (configuredPath) {
    return path.resolve(repoRoot, configuredPath);
  }
  return path.join(repoRoot, "tmp", "messages", "messages.sqlite");
}

function ensureParentDirectory(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function messageRecordFromRow(row) {
  return {
    active: activeFromDatabase(row.active),
    categoryKey: row.categoryKey,
    categoryName: row.categoryName || "",
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    emotionProfileKey: row.emotionProfileKey,
    emotionProfileName: row.emotionProfileName || "",
    key: row.key,
    messageText: row.messageText,
    name: row.name,
    notes: row.notes || "",
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

function categoryFromRow(row) {
  return {
    active: activeFromDatabase(row.active),
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    key: row.key,
    name: row.name,
    status: activeFromDatabase(row.active) ? "Active" : "Inactive",
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

function emotionProfileFromRow(row, usage = {}) {
  const messageUsageCount = Number(usage.messageUsageCount || 0);
  const segmentUsageCount = Number(usage.segmentUsageCount || 0);
  return {
    active: activeFromDatabase(row.active),
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    description: row.description || "",
    key: row.key,
    name: row.name,
    pauseAfterMs: Number(row.pauseAfterMs),
    pauseBeforeMs: Number(row.pauseBeforeMs),
    pitch: Number(row.pitch),
    rate: Number(row.rate),
    references: Array.isArray(usage.references) ? usage.references : [],
    messageUsageCount,
    segmentUsageCount,
    status: activeFromDatabase(row.active) ? "Active" : "Inactive",
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
    usageCount: messageUsageCount + segmentUsageCount,
    volume: Number(row.volume),
  };
}

function ttsProfileFromRow(row) {
  return {
    active: activeFromDatabase(row.active),
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    description: row.description || "",
    key: row.key,
    language: row.language,
    name: row.name,
    pitch: Number(row.pitch),
    providerKey: row.providerKey,
    rate: Number(row.rate),
    status: activeFromDatabase(row.active) ? "Active" : "Inactive",
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
    voiceName: row.voiceName || "",
    volume: Number(row.volume),
  };
}

function messageSegmentFromRow(row) {
  return {
    active: activeFromDatabase(row.active),
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    displayOrder: Number(row.displayOrder),
    emotionProfileKey: row.emotionProfileKey,
    emotionProfileName: row.emotionProfileName || "",
    key: row.key,
    messageKey: row.messageKey,
    messageName: row.messageName || "",
    segmentText: row.segmentText,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

function normalizeRequiredInteger(value, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw httpError(`${label} is required.`);
  }
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue)) {
    throw httpError(`${label} must be a whole number.`);
  }
  if (numberValue < 1) {
    throw httpError(`${label} must be 1 or greater.`);
  }
  return numberValue;
}

export class MessagesSqliteService {
  constructor({
    env = process.env,
    repoRoot = process.cwd(),
  } = {}) {
    this.databasePath = resolveMessagesDatabasePath(repoRoot, env);
    this.database = null;
  }

  db() {
    if (!this.database) {
      ensureParentDirectory(this.databasePath);
      this.database = new DatabaseSync(this.databasePath);
      this.database.exec("PRAGMA foreign_keys = ON;");
      this.initializeSchema();
      this.seedDefaults();
    }
    return this.database;
  }

  close() {
    if (this.database) {
      this.database.close();
      this.database = null;
    }
  }

  initializeSchema() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS messages_categories (
        key TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        updatedBy TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages_emotion_profiles (
        key TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        volume REAL NOT NULL DEFAULT 1,
        pitch REAL NOT NULL DEFAULT 1,
        rate REAL NOT NULL DEFAULT 1,
        pauseBeforeMs INTEGER NOT NULL DEFAULT 0,
        pauseAfterMs INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        updatedBy TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages_records (
        key TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        categoryKey TEXT NOT NULL REFERENCES messages_categories(key),
        emotionProfileKey TEXT NOT NULL REFERENCES messages_emotion_profiles(key),
        messageText TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        updatedBy TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages_tts_profiles (
        key TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        providerKey TEXT NOT NULL,
        voiceName TEXT NOT NULL DEFAULT '',
        language TEXT NOT NULL,
        volume REAL NOT NULL DEFAULT 1,
        pitch REAL NOT NULL DEFAULT 1,
        rate REAL NOT NULL DEFAULT 1,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        updatedBy TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages_segments (
        key TEXT PRIMARY KEY,
        messageKey TEXT NOT NULL REFERENCES messages_records(key),
        emotionProfileKey TEXT NOT NULL REFERENCES messages_emotion_profiles(key),
        segmentText TEXT NOT NULL,
        displayOrder INTEGER NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        updatedBy TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_messages_records_category ON messages_records (categoryKey);
      CREATE INDEX IF NOT EXISTS idx_messages_records_emotion ON messages_records (emotionProfileKey);
      CREATE INDEX IF NOT EXISTS idx_messages_records_createdby ON messages_records (createdBy);
      CREATE INDEX IF NOT EXISTS idx_messages_records_updatedby ON messages_records (updatedBy);
      CREATE INDEX IF NOT EXISTS idx_messages_segments_message ON messages_segments (messageKey);
      CREATE INDEX IF NOT EXISTS idx_messages_segments_emotion ON messages_segments (emotionProfileKey);
      CREATE INDEX IF NOT EXISTS idx_messages_segments_order ON messages_segments (messageKey, displayOrder);
      CREATE INDEX IF NOT EXISTS idx_messages_segments_createdby ON messages_segments (createdBy);
      CREATE INDEX IF NOT EXISTS idx_messages_segments_updatedby ON messages_segments (updatedBy);
      CREATE INDEX IF NOT EXISTS idx_messages_tts_profiles_provider ON messages_tts_profiles (providerKey);
      CREATE INDEX IF NOT EXISTS idx_messages_tts_profiles_createdby ON messages_tts_profiles (createdBy);
      CREATE INDEX IF NOT EXISTS idx_messages_tts_profiles_updatedby ON messages_tts_profiles (updatedBy);
    `);
  }

  seedDefaults() {
    SEED_CATEGORY_NAMES.forEach((name) => {
      const existing = this.findCategoryByName(name);
      if (!existing) {
        this.insertCategory({
          active: true,
          actorKey: SEED_DB_KEYS.users.forgeBot,
          name,
        });
      }
    });

    SEED_EMOTION_PROFILES.forEach((profile) => {
      const existing = this.findEmotionProfileByName(profile.name);
      if (!existing) {
        this.insertEmotionProfile({
          ...profile,
          active: true,
          actorKey: SEED_DB_KEYS.users.forgeBot,
        });
      }
    });

    SEED_TTS_PROFILES.forEach((profile) => {
      const existing = this.findTtsProfileByName(profile.name);
      if (!existing) {
        this.insertTtsProfile({
          ...profile,
          active: true,
          actorKey: SEED_DB_KEYS.users.forgeBot,
        });
      }
    });
  }

  persistenceSummary() {
    return {
      engine: "SQLite",
      owner: "messages",
      storage: "server-owned",
    };
  }

  listCategories() {
    return this.db().prepare(`
      SELECT * FROM messages_categories
      ORDER BY name COLLATE NOCASE ASC
    `).all().map(categoryFromRow);
  }

  getCategory(key) {
    const row = this.db().prepare("SELECT * FROM messages_categories WHERE key = ?").get(key);
    if (!row) {
      throw httpError("Message category was not found.", 404);
    }
    return categoryFromRow(row);
  }

  findCategoryByName(name) {
    const normalized = normalizeText(name).trim();
    if (!normalized) {
      return null;
    }
    const row = this.db().prepare("SELECT * FROM messages_categories WHERE lower(name) = lower(?)").get(normalized);
    return row ? categoryFromRow(row) : null;
  }

  insertCategory({ active = true, actorKey, name }) {
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(actorKey);
    this.db().prepare(`
      INSERT INTO messages_categories (key, name, active, createdAt, updatedAt, createdBy, updatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(key, normalizeName(name, "Category name"), activeToDatabase(active), now, now, actor, actor);
    return this.getCategory(key);
  }

  createCategory(input = {}, actorKey = "") {
    const name = normalizeName(input.name, "Category name");
    const existing = this.findCategoryByName(name);
    if (existing) {
      throw httpError(`Category ${name} already exists.`);
    }
    return this.insertCategory({
      active: normalizeActive(input.active, true),
      actorKey,
      name,
    });
  }

  updateCategory(key, input = {}, actorKey = "") {
    const existing = this.getCategory(key);
    const name = input.name === undefined ? existing.name : normalizeName(input.name, "Category name");
    const duplicate = this.findCategoryByName(name);
    if (duplicate && duplicate.key !== key) {
      throw httpError(`Category ${name} already exists.`);
    }
    const now = timestamp();
    this.db().prepare(`
      UPDATE messages_categories
      SET name = ?, active = ?, updatedAt = ?, updatedBy = ?
      WHERE key = ?
    `).run(name, activeToDatabase(normalizeActive(input.active, existing.active)), now, normalizeActorKey(actorKey), key);
    return this.getCategory(key);
  }

  listEmotionProfiles() {
    return this.db().prepare(`
      SELECT * FROM messages_emotion_profiles
      ORDER BY name COLLATE NOCASE ASC
    `).all().map((row) => emotionProfileFromRow(row, this.emotionProfileUsage(row.key)));
  }

  getEmotionProfile(key) {
    const row = this.db().prepare("SELECT * FROM messages_emotion_profiles WHERE key = ?").get(key);
    if (!row) {
      throw httpError("Emotion profile was not found.", 404);
    }
    return emotionProfileFromRow(row, this.emotionProfileUsage(row.key));
  }

  findEmotionProfileByName(name) {
    const normalized = normalizeText(name).trim();
    if (!normalized) {
      return null;
    }
    const row = this.db().prepare("SELECT * FROM messages_emotion_profiles WHERE lower(name) = lower(?)").get(normalized);
    return row ? emotionProfileFromRow(row) : null;
  }

  emotionProfileUsage(key) {
    const messageReferences = this.db().prepare(`
      SELECT key, name
      FROM messages_records
      WHERE emotionProfileKey = ?
      ORDER BY name COLLATE NOCASE ASC, key ASC
    `).all(key).map((row) => ({
      key: row.key,
      label: row.name,
      type: "message",
    }));
    const segmentReferences = this.db().prepare(`
      SELECT
        messages_segments.key,
        messages_segments.messageKey,
        messages_segments.displayOrder,
        messages_segments.segmentText,
        messages_records.name AS messageName
      FROM messages_segments
      LEFT JOIN messages_records ON messages_records.key = messages_segments.messageKey
      WHERE messages_segments.emotionProfileKey = ?
      ORDER BY messages_records.name COLLATE NOCASE ASC, messages_segments.displayOrder ASC, messages_segments.key ASC
    `).all(key).map((row) => ({
      displayOrder: Number(row.displayOrder),
      key: row.key,
      label: `${row.messageName || "Unknown Message"} segment ${row.displayOrder}`,
      messageKey: row.messageKey,
      preview: normalizeText(row.segmentText).slice(0, 80),
      type: "segment",
    }));
    return {
      messageUsageCount: messageReferences.length,
      references: [
        ...messageReferences,
        ...segmentReferences,
      ],
      segmentUsageCount: segmentReferences.length,
    };
  }

  insertEmotionProfile(input = {}) {
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(input.actorKey);
    this.db().prepare(`
      INSERT INTO messages_emotion_profiles (
        key, name, description, volume, pitch, rate, pauseBeforeMs, pauseAfterMs,
        active, createdAt, updatedAt, createdBy, updatedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      key,
      normalizeName(input.name, "Emotion profile name"),
      normalizeText(input.description),
      normalizeNumber(input.volume, 1),
      normalizeNumber(input.pitch, 1),
      normalizeNumber(input.rate, 1),
      normalizeInteger(input.pauseBeforeMs, 0),
      normalizeInteger(input.pauseAfterMs, 0),
      activeToDatabase(normalizeActive(input.active, true)),
      now,
      now,
      actor,
      actor,
    );
    return this.getEmotionProfile(key);
  }

  createEmotionProfile(input = {}, actorKey = "") {
    const name = normalizeName(input.name, "Emotion profile name");
    const existing = this.findEmotionProfileByName(name);
    if (existing) {
      throw httpError(`Emotion profile ${name} already exists.`);
    }
    return this.insertEmotionProfile({
      ...input,
      actorKey,
      name,
    });
  }

  updateEmotionProfile(key, input = {}, actorKey = "") {
    const existing = this.getEmotionProfile(key);
    const name = input.name === undefined ? existing.name : normalizeName(input.name, "Emotion profile name");
    const duplicate = this.findEmotionProfileByName(name);
    if (duplicate && duplicate.key !== key) {
      throw httpError(`Emotion profile ${name} already exists.`);
    }
    const active = normalizeActive(input.active, existing.active);
    if (existing.active && !active && existing.usageCount > 0) {
      throw httpError("Emotion profile is referenced by messages or segments. Reassign those references before deactivating this emotion profile.");
    }
    const now = timestamp();
    this.db().prepare(`
      UPDATE messages_emotion_profiles
      SET name = ?, description = ?, volume = ?, pitch = ?, rate = ?, pauseBeforeMs = ?, pauseAfterMs = ?,
        active = ?, updatedAt = ?, updatedBy = ?
      WHERE key = ?
    `).run(
      name,
      input.description === undefined ? existing.description : normalizeText(input.description),
      normalizeNumber(input.volume, existing.volume),
      normalizeNumber(input.pitch, existing.pitch),
      normalizeNumber(input.rate, existing.rate),
      normalizeInteger(input.pauseBeforeMs, existing.pauseBeforeMs),
      normalizeInteger(input.pauseAfterMs, existing.pauseAfterMs),
      activeToDatabase(active),
      now,
      normalizeActorKey(actorKey),
      key,
    );
    return this.getEmotionProfile(key);
  }

  listTtsProfiles() {
    return this.db().prepare(`
      SELECT * FROM messages_tts_profiles
      ORDER BY name COLLATE NOCASE ASC
    `).all().map(ttsProfileFromRow);
  }

  getTtsProfile(key) {
    const row = this.db().prepare("SELECT * FROM messages_tts_profiles WHERE key = ?").get(key);
    if (!row) {
      throw httpError("TTS profile was not found.", 404);
    }
    return ttsProfileFromRow(row);
  }

  findTtsProfileByName(name) {
    const normalized = normalizeText(name).trim();
    if (!normalized) {
      return null;
    }
    const row = this.db().prepare("SELECT * FROM messages_tts_profiles WHERE lower(name) = lower(?)").get(normalized);
    return row ? ttsProfileFromRow(row) : null;
  }

  normalizeTtsProfileInput(input = {}, existing = null) {
    const name = input.name === undefined && existing ? existing.name : normalizeName(input.name, "TTS profile name");
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      description: input.description === undefined && existing ? existing.description : normalizeText(input.description),
      language: input.language === undefined && existing ? existing.language : normalizeName(input.language, "TTS profile language"),
      name,
      pitch: normalizeNumber(input.pitch, existing ? existing.pitch : 1),
      providerKey: input.providerKey === undefined && existing ? existing.providerKey : normalizeName(input.providerKey, "TTS provider key"),
      rate: normalizeNumber(input.rate, existing ? existing.rate : 1),
      voiceName: input.voiceName === undefined && existing ? existing.voiceName : normalizeText(input.voiceName),
      volume: normalizeNumber(input.volume, existing ? existing.volume : 1),
    };
  }

  insertTtsProfile(input = {}) {
    const values = this.normalizeTtsProfileInput(input);
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(input.actorKey);
    this.db().prepare(`
      INSERT INTO messages_tts_profiles (
        key, name, description, providerKey, voiceName, language, volume, pitch, rate,
        active, createdAt, updatedAt, createdBy, updatedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      key,
      values.name,
      values.description,
      values.providerKey,
      values.voiceName,
      values.language,
      values.volume,
      values.pitch,
      values.rate,
      activeToDatabase(values.active),
      now,
      now,
      actor,
      actor,
    );
    return this.getTtsProfile(key);
  }

  createTtsProfile(input = {}, actorKey = "") {
    const values = this.normalizeTtsProfileInput(input);
    const existing = this.findTtsProfileByName(values.name);
    if (existing) {
      throw httpError(`TTS profile ${values.name} already exists.`);
    }
    return this.insertTtsProfile({
      ...values,
      actorKey,
    });
  }

  updateTtsProfile(key, input = {}, actorKey = "") {
    const existing = this.getTtsProfile(key);
    const values = this.normalizeTtsProfileInput(input, existing);
    const duplicate = this.findTtsProfileByName(values.name);
    if (duplicate && duplicate.key !== key) {
      throw httpError(`TTS profile ${values.name} already exists.`);
    }
    const now = timestamp();
    this.db().prepare(`
      UPDATE messages_tts_profiles
      SET name = ?, description = ?, providerKey = ?, voiceName = ?, language = ?,
        volume = ?, pitch = ?, rate = ?, active = ?, updatedAt = ?, updatedBy = ?
      WHERE key = ?
    `).run(
      values.name,
      values.description,
      values.providerKey,
      values.voiceName,
      values.language,
      values.volume,
      values.pitch,
      values.rate,
      activeToDatabase(values.active),
      now,
      normalizeActorKey(actorKey),
      key,
    );
    return this.getTtsProfile(key);
  }

  listMessages() {
    return this.db().prepare(`
      SELECT
        messages_records.*,
        messages_categories.name AS categoryName,
        messages_emotion_profiles.name AS emotionProfileName
      FROM messages_records
      LEFT JOIN messages_categories ON messages_categories.key = messages_records.categoryKey
      LEFT JOIN messages_emotion_profiles ON messages_emotion_profiles.key = messages_records.emotionProfileKey
      ORDER BY messages_records.updatedAt DESC, messages_records.name COLLATE NOCASE ASC
    `).all().map(messageRecordFromRow);
  }

  getMessage(key) {
    const row = this.db().prepare(`
      SELECT
        messages_records.*,
        messages_categories.name AS categoryName,
        messages_emotion_profiles.name AS emotionProfileName
      FROM messages_records
      LEFT JOIN messages_categories ON messages_categories.key = messages_records.categoryKey
      LEFT JOIN messages_emotion_profiles ON messages_emotion_profiles.key = messages_records.emotionProfileKey
      WHERE messages_records.key = ?
    `).get(key);
    if (!row) {
      throw httpError("Message was not found.", 404);
    }
    return messageRecordFromRow(row);
  }

  assertActiveCategory(key) {
    const category = this.getCategory(key);
    if (!category.active) {
      throw httpError("Category is inactive. Choose an active category before saving a message.");
    }
    return category;
  }

  defaultMessageCategoryKey() {
    const dialog = this.findCategoryByName("Dialog");
    const fallback = dialog || this.listCategories()[0];
    if (!fallback) {
      throw httpError("Legacy message category seed is unavailable. Restart the Local API runtime.");
    }
    return fallback.key;
  }

  assertActiveEmotionProfile(key) {
    const profile = this.getEmotionProfile(key);
    if (!profile.active) {
      throw httpError("Emotion profile is inactive. Choose an active emotion profile before saving a message.");
    }
    return profile;
  }

  normalizeMessageInput(input = {}, existing = null) {
    const name = input.name === undefined && existing ? existing.name : normalizeName(input.name, "Message name");
    const categoryKey = normalizeText(input.categoryKey === undefined && existing ? existing.categoryKey : input.categoryKey).trim()
      || this.defaultMessageCategoryKey();
    const emotionProfileKey = normalizeText(input.emotionProfileKey === undefined && existing ? existing.emotionProfileKey : input.emotionProfileKey).trim();
    const messageText = input.messageText === undefined && existing ? existing.messageText : normalizeText(input.messageText);
    if (!emotionProfileKey) {
      throw httpError("Emotion profile is required.");
    }
    if (!messageText.trim()) {
      throw httpError("Message text is required.");
    }
    this.assertActiveCategory(categoryKey);
    this.assertActiveEmotionProfile(emotionProfileKey);
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      categoryKey,
      emotionProfileKey,
      messageText,
      name,
      notes: input.notes === undefined && existing ? existing.notes : normalizeText(input.notes),
    };
  }

  createMessage(input = {}, actorKey = "") {
    const values = this.normalizeMessageInput(input);
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(actorKey);
    this.db().prepare(`
      INSERT INTO messages_records (
        key, name, categoryKey, emotionProfileKey, messageText, notes, active,
        createdAt, updatedAt, createdBy, updatedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      key,
      values.name,
      values.categoryKey,
      values.emotionProfileKey,
      values.messageText,
      values.notes,
      activeToDatabase(values.active),
      now,
      now,
      actor,
      actor,
    );
    return this.getMessage(key);
  }

  updateMessage(key, input = {}, actorKey = "") {
    const existing = this.getMessage(key);
    const values = this.normalizeMessageInput(input, existing);
    const now = timestamp();
    this.db().prepare(`
      UPDATE messages_records
      SET name = ?, categoryKey = ?, emotionProfileKey = ?, messageText = ?, notes = ?,
        active = ?, updatedAt = ?, updatedBy = ?
      WHERE key = ?
    `).run(
      values.name,
      values.categoryKey,
      values.emotionProfileKey,
      values.messageText,
      values.notes,
      activeToDatabase(values.active),
      now,
      normalizeActorKey(actorKey),
      key,
    );
    return this.getMessage(key);
  }

  listMessageSegments() {
    return this.db().prepare(`
      SELECT
        messages_segments.*,
        messages_records.name AS messageName,
        messages_emotion_profiles.name AS emotionProfileName
      FROM messages_segments
      LEFT JOIN messages_records ON messages_records.key = messages_segments.messageKey
      LEFT JOIN messages_emotion_profiles ON messages_emotion_profiles.key = messages_segments.emotionProfileKey
      ORDER BY messages_segments.messageKey ASC, messages_segments.displayOrder ASC,
        messages_segments.createdAt ASC, messages_segments.key ASC
    `).all().map(messageSegmentFromRow);
  }

  getMessageSegment(key) {
    const row = this.db().prepare(`
      SELECT
        messages_segments.*,
        messages_records.name AS messageName,
        messages_emotion_profiles.name AS emotionProfileName
      FROM messages_segments
      LEFT JOIN messages_records ON messages_records.key = messages_segments.messageKey
      LEFT JOIN messages_emotion_profiles ON messages_emotion_profiles.key = messages_segments.emotionProfileKey
      WHERE messages_segments.key = ?
    `).get(key);
    if (!row) {
      throw httpError("Message segment was not found.", 404);
    }
    return messageSegmentFromRow(row);
  }

  normalizeMessageSegmentInput(input = {}, existing = null) {
    const messageKey = normalizeText(input.messageKey === undefined && existing ? existing.messageKey : input.messageKey).trim();
    const emotionProfileKey = normalizeText(input.emotionProfileKey === undefined && existing ? existing.emotionProfileKey : input.emotionProfileKey).trim();
    const segmentText = input.segmentText === undefined && existing ? existing.segmentText : normalizeText(input.segmentText);
    const displayOrder = normalizeRequiredInteger(
      input.displayOrder === undefined && existing ? existing.displayOrder : input.displayOrder,
      "Display order",
    );
    if (!messageKey) {
      throw httpError("Message is required.");
    }
    if (!emotionProfileKey) {
      throw httpError("Emotion profile is required.");
    }
    if (!segmentText.trim()) {
      throw httpError("Segment text is required.");
    }
    this.getMessage(messageKey);
    this.assertActiveEmotionProfile(emotionProfileKey);
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      displayOrder,
      emotionProfileKey,
      messageKey,
      segmentText,
    };
  }

  createMessageSegment(input = {}, actorKey = "") {
    const values = this.normalizeMessageSegmentInput(input);
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(actorKey);
    this.db().prepare(`
      INSERT INTO messages_segments (
        key, messageKey, emotionProfileKey, segmentText, displayOrder, active,
        createdAt, updatedAt, createdBy, updatedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      key,
      values.messageKey,
      values.emotionProfileKey,
      values.segmentText,
      values.displayOrder,
      activeToDatabase(values.active),
      now,
      now,
      actor,
      actor,
    );
    return this.getMessageSegment(key);
  }

  updateMessageSegment(key, input = {}, actorKey = "") {
    const existing = this.getMessageSegment(key);
    const values = this.normalizeMessageSegmentInput(input, existing);
    const now = timestamp();
    this.db().prepare(`
      UPDATE messages_segments
      SET messageKey = ?, emotionProfileKey = ?, segmentText = ?, displayOrder = ?,
        active = ?, updatedAt = ?, updatedBy = ?
      WHERE key = ?
    `).run(
      values.messageKey,
      values.emotionProfileKey,
      values.segmentText,
      values.displayOrder,
      activeToDatabase(values.active),
      now,
      normalizeActorKey(actorKey),
      key,
    );
    return this.getMessageSegment(key);
  }
}

export function createMessagesSqliteService(options = {}) {
  return new MessagesSqliteService(options);
}

export function handleMessagesApiContract({
  actorKey = "",
  body = {},
  method = "GET",
  parts = [],
  service,
} = {}) {
  if (!service) {
    throw httpError("Messages SQLite service is not configured.", 500);
  }
  const normalizedMethod = String(method || "GET").toUpperCase();
  const resource = parts[0] || "";
  const key = parts[1] || "";

  if (resource === "messages") {
    if (normalizedMethod === "GET" && !key) {
      return {
        messages: service.listMessages(),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        message: service.getMessage(key),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        message: service.createMessage(body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        message: service.updateMessage(key, body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
  }

  if (resource === "emotion-profiles") {
    if (normalizedMethod === "GET" && !key) {
      return {
        emotionProfiles: service.listEmotionProfiles(),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        emotionProfile: service.getEmotionProfile(key),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        emotionProfile: service.createEmotionProfile(body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        emotionProfile: service.updateEmotionProfile(key, body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
  }

  if (resource === "categories") {
    if (normalizedMethod === "GET" && !key) {
      return {
        categories: service.listCategories(),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        category: service.createCategory(body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        category: service.updateCategory(key, body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
  }

  if (resource === "tts-profiles") {
    if (normalizedMethod === "GET" && !key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfiles: service.listTtsProfiles(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfile: service.getTtsProfile(key),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfile: service.createTtsProfile(body, actorKey),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfile: service.updateTtsProfile(key, body, actorKey),
      };
    }
  }

  if (resource === "segments") {
    if (normalizedMethod === "GET" && !key) {
      return {
        persistence: service.persistenceSummary(),
        segments: service.listMessageSegments(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        persistence: service.persistenceSummary(),
        segment: service.getMessageSegment(key),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        persistence: service.persistenceSummary(),
        segment: service.createMessageSegment(body, actorKey),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        persistence: service.persistenceSummary(),
        segment: service.updateMessageSegment(key, body, actorKey),
      };
    }
  }

  throw httpError(`Unknown Messages API route: ${normalizedMethod} /api/messages/${parts.join("/")}.`, 404);
}
