import { randomBytes } from "node:crypto";
import {
  createMessageStudioDefaultTtsProfiles,
  createMessageStudioTtsProfileOptions,
} from "../../../toolbox/text-to-speech/text2speech.js";
import { createPostgresConnectionClient } from "../persistence/postgres-connection-client.mjs";
import { SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";

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
  Object.freeze({ description: "Balanced spoken delivery for general narration or dialog.", name: "Neutral", pauseAfterMs: 150, pauseBeforeMs: 0, pitch: 1, rate: 1, volume: 1 }),
  Object.freeze({ description: "Neutral spoken delivery for general narration or dialog.", name: "Calm", pauseAfterMs: 150, pauseBeforeMs: 0, pitch: 1, rate: 1, volume: 1 }),
  Object.freeze({ description: "Fast, alert delivery for warnings and immediate danger.", name: "Urgent", pauseAfterMs: 80, pauseBeforeMs: 0, pitch: 1.08, rate: 1.15, volume: 1 }),
  Object.freeze({ description: "Quiet delivery for secret, stealth, or intimate lines.", name: "Whisper", pauseAfterMs: 180, pauseBeforeMs: 80, pitch: 0.95, rate: 0.9, volume: 0.55 }),
  Object.freeze({ description: "Forceful delivery for conflict or frustration.", name: "Angry", pauseAfterMs: 90, pauseBeforeMs: 0, pitch: 0.98, rate: 1.1, volume: 1 }),
  Object.freeze({ description: "Bright delivery for reveals, wins, and high-energy moments.", name: "Excited", pauseAfterMs: 100, pauseBeforeMs: 0, pitch: 1.12, rate: 1.12, volume: 1 }),
  Object.freeze({ description: "Soft delivery for loss, regret, or reflective moments.", name: "Sad", pauseAfterMs: 220, pauseBeforeMs: 100, pitch: 0.9, rate: 0.85, volume: 0.8 }),
  Object.freeze({ description: "Measured delivery for suspense, hidden lore, or strange events.", name: "Mysterious", pauseAfterMs: 260, pauseBeforeMs: 120, pitch: 0.92, rate: 0.88, volume: 0.85 }),
  Object.freeze({ description: "Synthetic delivery for mechanical or artificial characters.", name: "Robot", pauseAfterMs: 120, pauseBeforeMs: 40, pitch: 0.82, rate: 0.92, volume: 0.9 }),
]);
const MESSAGE_STUDIO_TTS_PROFILE_OPTIONS = Object.freeze(createMessageStudioTtsProfileOptions(createMessageStudioDefaultTtsProfiles())
  .map((profile) => Object.freeze({
    ...profile,
    emotionSettings: Object.freeze(profile.emotionSettings.map((setting) => Object.freeze({ ...setting }))),
  })));
const SEED_TTS_PROFILES = Object.freeze(MESSAGE_STUDIO_TTS_PROFILE_OPTIONS.map((profile) => Object.freeze({
  description: `${profile.name} from Text To Speech profile ownership.`,
  language: profile.language || "en-US",
  name: profile.name,
  pitch: 1,
  providerKey: profile.providerKey || "browser-speech",
  rate: 1,
  voiceName: profile.voiceName || "Default browser voice",
  volume: 1,
})));
const SUPPORTED_TTS_PROVIDER_KEYS = Object.freeze([
  "browser-speech",
  "elevenlabs",
  "openai",
  "azure",
  "polly",
]);
const ACTIVE_PUBLISH_TTS_PROVIDER_KEYS = Object.freeze([
  "browser-speech",
]);
const MESSAGE_EVENT_ACTION_TYPES = Object.freeze([
  Object.freeze({ key: "show-message", label: "Show Message", requiresMessage: true }),
  Object.freeze({ key: "speak-message", label: "Speak Message", requiresMessage: true }),
  Object.freeze({ key: "wait-for-continue", label: "Wait For Continue", requiresMessage: false }),
]);

const MESSAGES_POSTGRES_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS messages_categories (
  key text PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE TABLE IF NOT EXISTS messages_emotion_profiles (
  key text PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text NOT NULL DEFAULT '',
  "volume" numeric NOT NULL DEFAULT 1,
  "pitch" numeric NOT NULL DEFAULT 1,
  "rate" numeric NOT NULL DEFAULT 1,
  "pauseBeforeMs" integer NOT NULL DEFAULT 0,
  "pauseAfterMs" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE TABLE IF NOT EXISTS messages_tts_profiles (
  key text PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text NOT NULL DEFAULT '',
  "providerKey" text NOT NULL,
  "voiceName" text NOT NULL DEFAULT '',
  "language" text NOT NULL,
  "volume" numeric NOT NULL DEFAULT 1,
  "pitch" numeric NOT NULL DEFAULT 1,
  "rate" numeric NOT NULL DEFAULT 1,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE TABLE IF NOT EXISTS messages_records (
  key text PRIMARY KEY,
  "name" text NOT NULL,
  "categoryKey" text NOT NULL REFERENCES messages_categories(key),
  "emotionProfileKey" text NOT NULL REFERENCES messages_emotion_profiles(key),
  "voiceProfileKey" text NOT NULL REFERENCES messages_tts_profiles(key),
  "messageText" text NOT NULL,
  "notes" text NOT NULL DEFAULT '',
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE TABLE IF NOT EXISTS messages_segments (
  key text PRIMARY KEY,
  "messageKey" text NOT NULL REFERENCES messages_records(key),
  "emotionProfileKey" text NOT NULL REFERENCES messages_emotion_profiles(key),
  "voiceProfileKey" text NOT NULL REFERENCES messages_tts_profiles(key),
  "segmentText" text NOT NULL,
  "displayOrder" integer NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE TABLE IF NOT EXISTS messages_event_actions (
  key text PRIMARY KEY,
  "name" text NOT NULL,
  "actionType" text NOT NULL,
  "messageKey" text REFERENCES messages_records(key),
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key)
);

ALTER TABLE messages_records ADD COLUMN IF NOT EXISTS "voiceProfileKey" text REFERENCES messages_tts_profiles(key);
ALTER TABLE messages_segments ADD COLUMN IF NOT EXISTS "voiceProfileKey" text REFERENCES messages_tts_profiles(key);

CREATE INDEX IF NOT EXISTS idx_messages_records_categorykey ON messages_records ("categoryKey");
CREATE INDEX IF NOT EXISTS idx_messages_records_emotionprofilekey ON messages_records ("emotionProfileKey");
CREATE INDEX IF NOT EXISTS idx_messages_records_voiceprofilekey ON messages_records ("voiceProfileKey");
CREATE INDEX IF NOT EXISTS idx_messages_records_createdby ON messages_records ("createdBy");
CREATE INDEX IF NOT EXISTS idx_messages_records_updatedby ON messages_records ("updatedBy");
CREATE INDEX IF NOT EXISTS idx_messages_segments_messagekey ON messages_segments ("messageKey");
CREATE INDEX IF NOT EXISTS idx_messages_segments_emotionprofilekey ON messages_segments ("emotionProfileKey");
CREATE INDEX IF NOT EXISTS idx_messages_segments_voiceprofilekey ON messages_segments ("voiceProfileKey");
CREATE INDEX IF NOT EXISTS idx_messages_segments_order ON messages_segments ("messageKey", "displayOrder");
CREATE INDEX IF NOT EXISTS idx_messages_segments_createdby ON messages_segments ("createdBy");
CREATE INDEX IF NOT EXISTS idx_messages_segments_updatedby ON messages_segments ("updatedBy");
CREATE INDEX IF NOT EXISTS idx_messages_event_actions_actiontype ON messages_event_actions ("actionType");
CREATE INDEX IF NOT EXISTS idx_messages_event_actions_messagekey ON messages_event_actions ("messageKey");
CREATE INDEX IF NOT EXISTS idx_messages_event_actions_createdby ON messages_event_actions ("createdBy");
CREATE INDEX IF NOT EXISTS idx_messages_event_actions_updatedby ON messages_event_actions ("updatedBy");
CREATE INDEX IF NOT EXISTS idx_messages_tts_profiles_providerkey ON messages_tts_profiles ("providerKey");
CREATE INDEX IF NOT EXISTS idx_messages_tts_profiles_createdby ON messages_tts_profiles ("createdBy");
CREATE INDEX IF NOT EXISTS idx_messages_tts_profiles_updatedby ON messages_tts_profiles ("updatedBy");
`;

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

function normalizeRequiredNumber(value, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw httpError(`${label} is required.`);
  }
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw httpError(`${label} must be a number.`);
  }
  return numberValue;
}

function normalizeEditableNumber(value, fallback, label) {
  return value === undefined ? fallback : normalizeRequiredNumber(value, label);
}

function normalizeTtsProviderKey(value) {
  const providerKey = normalizeName(value, "Voice profile provider");
  if (!SUPPORTED_TTS_PROVIDER_KEYS.includes(providerKey)) {
    throw httpError("Voice profile provider is not supported.");
  }
  return providerKey;
}

function eventActionTypeDefinition(actionType) {
  return MESSAGE_EVENT_ACTION_TYPES.find((candidate) => candidate.key === actionType) || null;
}

function normalizeEventActionType(value) {
  const actionType = normalizeName(value, "Event action");
  if (!eventActionTypeDefinition(actionType)) {
    throw httpError("Event action is not supported.");
  }
  return actionType;
}

function emotionSettingKey(value) {
  return normalizeText(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "neutral";
}

function normalizeInteger(value, fallback) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) ? numberValue : fallback;
}

function normalizeActorKey(actorKey) {
  const normalized = normalizeText(actorKey).trim();
  return normalized || SEED_DB_KEYS.users.forgeBot;
}

function activeFromDatabase(value) {
  if (typeof value === "boolean") {
    return value;
  }
  return Number(value) !== 0;
}

function cloneRows(rows) {
  return JSON.parse(JSON.stringify(Array.isArray(rows) ? rows : []));
}

function compareName(left, right) {
  return normalizeText(left?.name).localeCompare(normalizeText(right?.name), undefined, { sensitivity: "base" });
}

function queryForKey(key) {
  return `select=*&key=eq.${encodeURIComponent(key)}`;
}

function messageRecordFromRow(row, { categoryName = "", emotionProfileName = "", voiceProfileName = "" } = {}) {
  return {
    active: activeFromDatabase(row.active),
    categoryKey: row.categoryKey,
    categoryName,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    emotionProfileKey: row.emotionProfileKey,
    emotionProfileName,
    key: row.key,
    messageText: row.messageText,
    name: row.name,
    notes: row.notes || "",
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
    voiceProfileKey: row.voiceProfileKey || "",
    voiceProfileName,
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

function ttsEmotionSettingFromEmotionProfile(profile) {
  return {
    active: profile.active !== false,
    emotion: emotionSettingKey(profile.name),
    emotionLabel: profile.name,
    key: profile.key,
    pitch: Number(profile.pitch),
    rate: Number(profile.rate),
    ssmlLikePreset: "normal",
    volume: Number(profile.volume),
  };
}

function messageStudioTtsProfileOption(row) {
  const rowName = normalizeText(row?.name).trim().toLowerCase();
  const rowKey = normalizeText(row?.key).trim();
  return MESSAGE_STUDIO_TTS_PROFILE_OPTIONS.find((profile) => {
    return profile.key === rowKey || normalizeText(profile.name).trim().toLowerCase() === rowName;
  }) || null;
}

function emotionSettingsForTtsProfileRow(row, emotionRows = []) {
  const option = messageStudioTtsProfileOption(row);
  if (!option) {
    return [];
  }
  const activeEmotionProfiles = emotionRows
    .map((profileRow) => emotionProfileFromRow(profileRow))
    .filter((profile) => profile.active !== false);
  const byLabel = new Map(activeEmotionProfiles.map((profile) => [normalizeText(profile.name).trim().toLowerCase(), profile]));
  const byEmotion = new Map(activeEmotionProfiles.map((profile) => [emotionSettingKey(profile.name), profile]));
  return option.emotionSettings
    .map((setting) => {
      const emotionProfile = byLabel.get(normalizeText(setting.emotionLabel).trim().toLowerCase())
        || byEmotion.get(emotionSettingKey(setting.emotion))
        || null;
      if (!emotionProfile) {
        return null;
      }
      return {
        ...ttsEmotionSettingFromEmotionProfile(emotionProfile),
        pitch: Number(setting.pitch),
        rate: Number(setting.rate),
        ssmlLikePreset: setting.ssmlLikePreset || "normal",
        volume: Number(setting.volume),
      };
    })
    .filter(Boolean);
}

function ttsProfileFromRow(row, emotionSettings = []) {
  const profileOption = messageStudioTtsProfileOption(row);
  return {
    active: activeFromDatabase(row.active),
    age: profileOption?.age || "",
    ageFilter: profileOption?.ageFilter || profileOption?.age || "",
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    description: row.description || "",
    emotionSettings,
    gender: profileOption?.gender || "",
    key: row.key,
    language: row.language,
    name: row.name,
    pitch: Number(row.pitch),
    providerKey: row.providerKey,
    rate: Number(row.rate),
    status: activeFromDatabase(row.active) ? "Active" : "Inactive",
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
    voice: profileOption?.voice || row.voiceName || "",
    voiceName: row.voiceName || "",
    volume: Number(row.volume),
  };
}

function messageSegmentFromRow(row, { emotionProfileName = "", messageName = "", voiceProfileName = "" } = {}) {
  return {
    active: activeFromDatabase(row.active),
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    displayOrder: Number(row.displayOrder),
    emotionProfileKey: row.emotionProfileKey,
    emotionProfileName,
    key: row.key,
    messageKey: row.messageKey,
    messageName,
    segmentText: row.segmentText,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
    voiceProfileKey: row.voiceProfileKey || "",
    voiceProfileName,
  };
}

function messageEventActionFromRow(row, { messageName = "" } = {}) {
  const actionType = row.actionType || "";
  return {
    actionLabel: eventActionTypeDefinition(actionType)?.label || actionType,
    actionType,
    active: activeFromDatabase(row.active),
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    key: row.key,
    messageKey: row.messageKey || "",
    messageName,
    name: row.name,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

function publishValidationIssue({ code, field, message, targetKey = "", targetName = "", targetType }) {
  return {
    code,
    field,
    message,
    targetKey: normalizeText(targetKey),
    targetName: normalizeText(targetName),
    targetType,
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

export class MessagesPostgresService {
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
    await this.client().query(MESSAGES_POSTGRES_SCHEMA_SQL);
    await this.seedDefaults();
  }

  close() {
    this.postgresClient?.close?.();
  }

  async tableRows(tableName) {
    return cloneRows(await this.client().requestTable(tableName, { method: "GET", query: "select=*" }));
  }

  async upsertRow(tableName, row) {
    const rows = await this.client().requestTable(tableName, { body: row, method: "POST" });
    return cloneRows(rows)[0] || row;
  }

  async patchRow(tableName, key, row) {
    const rows = await this.client().requestTable(tableName, {
      body: row,
      method: "PATCH",
      query: queryForKey(key),
    });
    return cloneRows(rows)[0] || null;
  }

  async deleteRow(tableName, key) {
    const rows = await this.client().requestTable(tableName, {
      method: "DELETE",
      query: queryForKey(key),
    });
    return cloneRows(rows)[0] || null;
  }

  async rowByKey(tableName, key) {
    const rows = await this.client().requestTable(tableName, { method: "GET", query: queryForKey(key) });
    return cloneRows(rows)[0] || null;
  }

  async seedDefaults() {
    for (const name of SEED_CATEGORY_NAMES) {
      const existing = await this.findCategoryByNameRaw(name);
      if (!existing) {
        await this.insertCategory({
          active: true,
          actorKey: SEED_DB_KEYS.users.forgeBot,
          name,
        }, { skipEnsure: true });
      }
    }
    for (const profile of SEED_EMOTION_PROFILES) {
      const existing = await this.findEmotionProfileByNameRaw(profile.name);
      if (!existing) {
        await this.insertEmotionProfile({
          ...profile,
          active: true,
          actorKey: SEED_DB_KEYS.users.forgeBot,
        }, { skipEnsure: true });
      }
    }
    for (const profile of SEED_TTS_PROFILES) {
      const existing = await this.findTtsProfileByNameRaw(profile.name);
      if (!existing) {
        await this.insertTtsProfile({
          ...profile,
          active: true,
          actorKey: SEED_DB_KEYS.users.forgeBot,
        }, { skipEnsure: true });
      }
    }
    await this.backfillDefaultVoiceProfileReferences();
  }

  persistenceSummary() {
    return {
      engine: "Postgres",
      owner: "messages",
      storage: "server-owned",
    };
  }

  async listCategories() {
    await this.ensureReady();
    return (await this.tableRows("messages_categories")).sort(compareName).map(categoryFromRow);
  }

  async getCategory(key) {
    await this.ensureReady();
    const row = await this.rowByKey("messages_categories", key);
    if (!row) {
      throw httpError("Message category was not found.", 404);
    }
    return categoryFromRow(row);
  }

  async findCategoryByNameRaw(name) {
    const normalized = normalizeText(name).trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    return (await this.tableRows("messages_categories")).find((row) => normalizeText(row.name).trim().toLowerCase() === normalized) || null;
  }

  async findCategoryByName(name) {
    await this.ensureReady();
    const row = await this.findCategoryByNameRaw(name);
    return row ? categoryFromRow(row) : null;
  }

  async insertCategory({ active = true, actorKey, name }, { skipEnsure = false } = {}) {
    if (!skipEnsure) {
      await this.ensureReady();
    }
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(actorKey);
    await this.upsertRow("messages_categories", {
      active: normalizeActive(active, true),
      createdAt: now,
      createdBy: actor,
      key,
      name: normalizeName(name, "Category name"),
      updatedAt: now,
      updatedBy: actor,
    });
    const row = await this.rowByKey("messages_categories", key);
    return categoryFromRow(row);
  }

  async createCategory(input = {}, actorKey = "") {
    const name = normalizeName(input.name, "Category name");
    const existing = await this.findCategoryByName(name);
    if (existing) {
      throw httpError(`Category ${name} already exists.`);
    }
    return this.insertCategory({
      active: normalizeActive(input.active, true),
      actorKey,
      name,
    });
  }

  async updateCategory(key, input = {}, actorKey = "") {
    const existing = await this.getCategory(key);
    const name = input.name === undefined ? existing.name : normalizeName(input.name, "Category name");
    const duplicate = await this.findCategoryByName(name);
    if (duplicate && duplicate.key !== key) {
      throw httpError(`Category ${name} already exists.`);
    }
    await this.patchRow("messages_categories", key, {
      active: normalizeActive(input.active, existing.active),
      name,
      updatedAt: timestamp(),
      updatedBy: normalizeActorKey(actorKey),
    });
    return this.getCategory(key);
  }

  async listEmotionProfiles() {
    await this.ensureReady();
    const rows = (await this.tableRows("messages_emotion_profiles")).sort(compareName);
    return Promise.all(rows.map(async (row) => emotionProfileFromRow(row, await this.emotionProfileUsage(row.key))));
  }

  async getEmotionProfile(key) {
    await this.ensureReady();
    const row = await this.rowByKey("messages_emotion_profiles", key);
    if (!row) {
      throw httpError("Emotion profile was not found.", 404);
    }
    return emotionProfileFromRow(row, await this.emotionProfileUsage(row.key));
  }

  async findEmotionProfileByNameRaw(name) {
    const normalized = normalizeText(name).trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    return (await this.tableRows("messages_emotion_profiles")).find((row) => normalizeText(row.name).trim().toLowerCase() === normalized) || null;
  }

  async findEmotionProfileByName(name) {
    await this.ensureReady();
    const row = await this.findEmotionProfileByNameRaw(name);
    return row ? emotionProfileFromRow(row) : null;
  }

  async emotionProfileUsage(key) {
    const messages = await this.tableRows("messages_records");
    const segments = await this.tableRows("messages_segments");
    const messageNames = new Map(messages.map((message) => [message.key, message.name]));
    const messageReferences = messages
      .filter((message) => message.emotionProfileKey === key)
      .sort(compareName)
      .map((row) => ({
        key: row.key,
        label: row.name,
        type: "message",
      }));
    const segmentReferences = segments
      .filter((segment) => segment.emotionProfileKey === key)
      .sort((left, right) => {
        const leftName = messageNames.get(left.messageKey) || "";
        const rightName = messageNames.get(right.messageKey) || "";
        return leftName.localeCompare(rightName, undefined, { sensitivity: "base" })
          || Number(left.displayOrder) - Number(right.displayOrder)
          || String(left.key).localeCompare(String(right.key));
      })
      .map((row) => ({
        displayOrder: Number(row.displayOrder),
        key: row.key,
        label: `${messageNames.get(row.messageKey) || "Unknown Message"} segment ${row.displayOrder}`,
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

  async insertEmotionProfile(input = {}, { skipEnsure = false } = {}) {
    if (!skipEnsure) {
      await this.ensureReady();
    }
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(input.actorKey);
    await this.upsertRow("messages_emotion_profiles", {
      active: normalizeActive(input.active, true),
      createdAt: now,
      createdBy: actor,
      description: normalizeText(input.description),
      key,
      name: normalizeName(input.name, "Emotion profile name"),
      pauseAfterMs: normalizeInteger(input.pauseAfterMs, 0),
      pauseBeforeMs: normalizeInteger(input.pauseBeforeMs, 0),
      pitch: normalizeRequiredNumber(input.pitch, "Emotion profile pitch"),
      rate: normalizeRequiredNumber(input.rate, "Emotion profile rate"),
      updatedAt: now,
      updatedBy: actor,
      volume: normalizeRequiredNumber(input.volume, "Emotion profile volume"),
    });
    const row = await this.rowByKey("messages_emotion_profiles", key);
    return emotionProfileFromRow(row, await this.emotionProfileUsage(key));
  }

  async createEmotionProfile(input = {}, actorKey = "") {
    const name = normalizeName(input.name, "Emotion profile name");
    const existing = await this.findEmotionProfileByName(name);
    if (existing) {
      throw httpError(`Emotion profile ${name} already exists.`);
    }
    return this.insertEmotionProfile({
      ...input,
      actorKey,
      name,
    });
  }

  async updateEmotionProfile(key, input = {}, actorKey = "") {
    const existing = await this.getEmotionProfile(key);
    const name = input.name === undefined ? existing.name : normalizeName(input.name, "Emotion profile name");
    const duplicate = await this.findEmotionProfileByName(name);
    if (duplicate && duplicate.key !== key) {
      throw httpError(`Emotion profile ${name} already exists.`);
    }
    const active = normalizeActive(input.active, existing.active);
    if (existing.active && !active && existing.usageCount > 0) {
      throw httpError("Emotion profile is referenced by messages or segments. Reassign those references before deactivating this emotion profile.");
    }
    await this.patchRow("messages_emotion_profiles", key, {
      active,
      description: input.description === undefined ? existing.description : normalizeText(input.description),
      name,
      pauseAfterMs: normalizeInteger(input.pauseAfterMs, existing.pauseAfterMs),
      pauseBeforeMs: normalizeInteger(input.pauseBeforeMs, existing.pauseBeforeMs),
      pitch: normalizeEditableNumber(input.pitch, existing.pitch, "Emotion profile pitch"),
      rate: normalizeEditableNumber(input.rate, existing.rate, "Emotion profile rate"),
      updatedAt: timestamp(),
      updatedBy: normalizeActorKey(actorKey),
      volume: normalizeEditableNumber(input.volume, existing.volume, "Emotion profile volume"),
    });
    return this.getEmotionProfile(key);
  }

  async listTtsProfiles() {
    await this.ensureReady();
    const emotionRows = await this.tableRows("messages_emotion_profiles");
    return (await this.tableRows("messages_tts_profiles"))
      .sort(compareName)
      .map((row) => ttsProfileFromRow(row, emotionSettingsForTtsProfileRow(row, emotionRows)));
  }

  async getTtsProfile(key) {
    await this.ensureReady();
    const row = await this.rowByKey("messages_tts_profiles", key);
    if (!row) {
      throw httpError("Voice profile was not found.", 404);
    }
    const emotionRows = await this.tableRows("messages_emotion_profiles");
    return ttsProfileFromRow(row, emotionSettingsForTtsProfileRow(row, emotionRows));
  }

  async findTtsProfileByNameRaw(name) {
    const normalized = normalizeText(name).trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    return (await this.tableRows("messages_tts_profiles")).find((row) => normalizeText(row.name).trim().toLowerCase() === normalized) || null;
  }

  async findTtsProfileByName(name) {
    await this.ensureReady();
    const row = await this.findTtsProfileByNameRaw(name);
    return row ? ttsProfileFromRow(row) : null;
  }

  async defaultVoiceProfileKeyRaw() {
    const defaultProfile = await this.findTtsProfileByNameRaw("Default Balanced Profile");
    if (defaultProfile) {
      return defaultProfile.key;
    }
    const fallback = (await this.tableRows("messages_tts_profiles")).sort(compareName)[0];
    if (!fallback) {
      throw httpError("Voice profile seed is unavailable. Restart the Local API runtime.");
    }
    return fallback.key;
  }

  async backfillDefaultVoiceProfileReferences() {
    const voiceProfileKey = await this.defaultVoiceProfileKeyRaw();
    for (const tableName of ["messages_records", "messages_segments"]) {
      const rows = await this.tableRows(tableName);
      for (const row of rows) {
        if (normalizeText(row.voiceProfileKey).trim()) {
          continue;
        }
        await this.patchRow(tableName, row.key, {
          updatedAt: timestamp(),
          updatedBy: normalizeActorKey(row.updatedBy),
          voiceProfileKey,
        });
      }
    }
  }

  normalizeTtsProfileInput(input = {}, existing = null) {
    const name = input.name === undefined && existing ? existing.name : normalizeName(input.name, "Voice profile name");
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      description: input.description === undefined && existing ? existing.description : normalizeText(input.description),
      language: input.language === undefined && existing ? existing.language : normalizeName(input.language, "Voice profile language"),
      name,
      pitch: normalizeNumber(input.pitch, existing ? existing.pitch : 1),
      providerKey: input.providerKey === undefined && existing ? existing.providerKey : normalizeTtsProviderKey(input.providerKey),
      rate: normalizeNumber(input.rate, existing ? existing.rate : 1),
      voiceName: input.voiceName === undefined && existing ? existing.voiceName : normalizeName(input.voiceName, "Voice profile voice name"),
      volume: normalizeNumber(input.volume, existing ? existing.volume : 1),
    };
  }

  async insertTtsProfile(input = {}, { skipEnsure = false } = {}) {
    if (!skipEnsure) {
      await this.ensureReady();
    }
    const values = this.normalizeTtsProfileInput(input);
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(input.actorKey);
    await this.upsertRow("messages_tts_profiles", {
      active: values.active,
      createdAt: now,
      createdBy: actor,
      description: values.description,
      key,
      language: values.language,
      name: values.name,
      pitch: values.pitch,
      providerKey: values.providerKey,
      rate: values.rate,
      updatedAt: now,
      updatedBy: actor,
      voiceName: values.voiceName,
      volume: values.volume,
    });
    const row = await this.rowByKey("messages_tts_profiles", key);
    const emotionRows = await this.tableRows("messages_emotion_profiles");
    return ttsProfileFromRow(row, emotionSettingsForTtsProfileRow(row, emotionRows));
  }

  async createTtsProfile(input = {}, actorKey = "") {
    const values = this.normalizeTtsProfileInput(input);
    const existing = await this.findTtsProfileByName(values.name);
    if (existing) {
      throw httpError(`Voice profile ${values.name} already exists.`);
    }
    return this.insertTtsProfile({
      ...values,
      actorKey,
    });
  }

  async updateTtsProfile(key, input = {}, actorKey = "") {
    const existing = await this.getTtsProfile(key);
    const values = this.normalizeTtsProfileInput(input, existing);
    const duplicate = await this.findTtsProfileByName(values.name);
    if (duplicate && duplicate.key !== key) {
      throw httpError(`Voice profile ${values.name} already exists.`);
    }
    await this.patchRow("messages_tts_profiles", key, {
      active: values.active,
      description: values.description,
      language: values.language,
      name: values.name,
      pitch: values.pitch,
      providerKey: values.providerKey,
      rate: values.rate,
      updatedAt: timestamp(),
      updatedBy: normalizeActorKey(actorKey),
      voiceName: values.voiceName,
      volume: values.volume,
    });
    return this.getTtsProfile(key);
  }

  async listMessages() {
    await this.ensureReady();
    const categories = new Map((await this.tableRows("messages_categories")).map((row) => [row.key, row.name]));
    const emotions = new Map((await this.tableRows("messages_emotion_profiles")).map((row) => [row.key, row.name]));
    const voices = new Map((await this.tableRows("messages_tts_profiles")).map((row) => [row.key, row.name]));
    return (await this.tableRows("messages_records"))
      .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)) || compareName(left, right))
      .map((row) => messageRecordFromRow(row, {
        categoryName: categories.get(row.categoryKey) || "",
        emotionProfileName: emotions.get(row.emotionProfileKey) || "",
        voiceProfileName: voices.get(row.voiceProfileKey) || "",
      }));
  }

  async getMessage(key) {
    await this.ensureReady();
    const row = await this.rowByKey("messages_records", key);
    if (!row) {
      throw httpError("Message was not found.", 404);
    }
    const category = await this.rowByKey("messages_categories", row.categoryKey);
    const emotion = await this.rowByKey("messages_emotion_profiles", row.emotionProfileKey);
    const voice = await this.rowByKey("messages_tts_profiles", row.voiceProfileKey);
    return messageRecordFromRow(row, {
      categoryName: category?.name || "",
      emotionProfileName: emotion?.name || "",
      voiceProfileName: voice?.name || "",
    });
  }

  async assertActiveCategory(key) {
    const category = await this.getCategory(key);
    if (!category.active) {
      throw httpError("Category is inactive. Choose an active category before saving a message.");
    }
    return category;
  }

  async defaultMessageCategoryKey() {
    const dialog = await this.findCategoryByName("Dialog");
    const fallback = dialog || (await this.listCategories())[0];
    if (!fallback) {
      throw httpError("Message category seed is unavailable. Restart the Local API runtime.");
    }
    return fallback.key;
  }

  async assertActiveEmotionProfile(key) {
    const profile = await this.getEmotionProfile(key);
    if (!profile.active) {
      throw httpError("Emotion profile is inactive. Choose an active emotion profile before saving a message.");
    }
    return profile;
  }

  async assertActiveVoiceProfile(key) {
    const profile = await this.getTtsProfile(key);
    if (!profile.active) {
      throw httpError("Voice profile is inactive. Choose an active voice profile before saving a message.");
    }
    return profile;
  }

  async normalizeMessageInput(input = {}, existing = null) {
    const name = input.name === undefined && existing ? existing.name : normalizeName(input.name, "Message name");
    const categoryKey = normalizeText(input.categoryKey === undefined && existing ? existing.categoryKey : input.categoryKey).trim()
      || await this.defaultMessageCategoryKey();
    const emotionProfileKey = normalizeText(input.emotionProfileKey === undefined && existing ? existing.emotionProfileKey : input.emotionProfileKey).trim();
    const voiceProfileKey = normalizeText(input.voiceProfileKey === undefined && existing ? existing.voiceProfileKey : input.voiceProfileKey).trim();
    const messageText = input.messageText === undefined && existing ? existing.messageText : normalizeText(input.messageText);
    if (!emotionProfileKey) {
      throw httpError("Emotion profile is required.");
    }
    if (!voiceProfileKey) {
      throw httpError("Voice profile is required.");
    }
    if (!messageText.trim()) {
      throw httpError("Message text is required.");
    }
    await this.assertActiveCategory(categoryKey);
    await this.assertActiveEmotionProfile(emotionProfileKey);
    await this.assertActiveVoiceProfile(voiceProfileKey);
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      categoryKey,
      emotionProfileKey,
      messageText,
      name,
      notes: input.notes === undefined && existing ? existing.notes : normalizeText(input.notes),
      voiceProfileKey,
    };
  }

  async createMessage(input = {}, actorKey = "") {
    await this.ensureReady();
    const values = await this.normalizeMessageInput(input);
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(actorKey);
    await this.upsertRow("messages_records", {
      active: values.active,
      categoryKey: values.categoryKey,
      createdAt: now,
      createdBy: actor,
      emotionProfileKey: values.emotionProfileKey,
      key,
      messageText: values.messageText,
      name: values.name,
      notes: values.notes,
      updatedAt: now,
      updatedBy: actor,
      voiceProfileKey: values.voiceProfileKey,
    });
    return this.getMessage(key);
  }

  async updateMessage(key, input = {}, actorKey = "") {
    const existing = await this.getMessage(key);
    const values = await this.normalizeMessageInput(input, existing);
    await this.patchRow("messages_records", key, {
      active: values.active,
      categoryKey: values.categoryKey,
      emotionProfileKey: values.emotionProfileKey,
      messageText: values.messageText,
      name: values.name,
      notes: values.notes,
      updatedAt: timestamp(),
      updatedBy: normalizeActorKey(actorKey),
      voiceProfileKey: values.voiceProfileKey,
    });
    return this.getMessage(key);
  }

  async deleteMessage(key) {
    const existing = await this.getMessage(key);
    const referenced = (await this.tableRows("messages_segments"))
      .some((segment) => segment.messageKey === existing.key);
    if (referenced) {
      throw httpError("Message is referenced by message parts. Remove those references before deleting this message.", 409);
    }
    await this.deleteRow("messages_records", existing.key);
    return existing;
  }

  async listMessageSegments() {
    await this.ensureReady();
    const messages = new Map((await this.tableRows("messages_records")).map((row) => [row.key, row.name]));
    const emotions = new Map((await this.tableRows("messages_emotion_profiles")).map((row) => [row.key, row.name]));
    const voices = new Map((await this.tableRows("messages_tts_profiles")).map((row) => [row.key, row.name]));
    return (await this.tableRows("messages_segments"))
      .sort((left, right) => String(left.messageKey).localeCompare(String(right.messageKey))
        || Number(left.displayOrder) - Number(right.displayOrder)
        || String(left.createdAt).localeCompare(String(right.createdAt))
        || String(left.key).localeCompare(String(right.key)))
      .map((row) => messageSegmentFromRow(row, {
        emotionProfileName: emotions.get(row.emotionProfileKey) || "",
        messageName: messages.get(row.messageKey) || "",
        voiceProfileName: voices.get(row.voiceProfileKey) || "",
      }));
  }

  async getMessageSegment(key) {
    await this.ensureReady();
    const row = await this.rowByKey("messages_segments", key);
    if (!row) {
      throw httpError("Message segment was not found.", 404);
    }
    const message = await this.rowByKey("messages_records", row.messageKey);
    const emotion = await this.rowByKey("messages_emotion_profiles", row.emotionProfileKey);
    const voice = await this.rowByKey("messages_tts_profiles", row.voiceProfileKey);
    return messageSegmentFromRow(row, {
      emotionProfileName: emotion?.name || "",
      messageName: message?.name || "",
      voiceProfileName: voice?.name || "",
    });
  }

  async normalizeMessageSegmentInput(input = {}, existing = null) {
    const messageKey = normalizeText(input.messageKey === undefined && existing ? existing.messageKey : input.messageKey).trim();
    const emotionProfileKey = normalizeText(input.emotionProfileKey === undefined && existing ? existing.emotionProfileKey : input.emotionProfileKey).trim();
    const voiceProfileKey = normalizeText(input.voiceProfileKey === undefined && existing ? existing.voiceProfileKey : input.voiceProfileKey).trim();
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
    if (!voiceProfileKey) {
      throw httpError("Voice profile is required.");
    }
    if (!segmentText.trim()) {
      throw httpError("Segment text is required.");
    }
    await this.getMessage(messageKey);
    await this.assertActiveEmotionProfile(emotionProfileKey);
    await this.assertActiveVoiceProfile(voiceProfileKey);
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      displayOrder,
      emotionProfileKey,
      messageKey,
      segmentText,
      voiceProfileKey,
    };
  }

  async createMessageSegment(input = {}, actorKey = "") {
    await this.ensureReady();
    const values = await this.normalizeMessageSegmentInput(input);
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(actorKey);
    await this.upsertRow("messages_segments", {
      active: values.active,
      createdAt: now,
      createdBy: actor,
      displayOrder: values.displayOrder,
      emotionProfileKey: values.emotionProfileKey,
      key,
      messageKey: values.messageKey,
      segmentText: values.segmentText,
      updatedAt: now,
      updatedBy: actor,
      voiceProfileKey: values.voiceProfileKey,
    });
    return this.getMessageSegment(key);
  }

  async updateMessageSegment(key, input = {}, actorKey = "") {
    const existing = await this.getMessageSegment(key);
    const values = await this.normalizeMessageSegmentInput(input, existing);
    await this.patchRow("messages_segments", key, {
      active: values.active,
      displayOrder: values.displayOrder,
      emotionProfileKey: values.emotionProfileKey,
      messageKey: values.messageKey,
      segmentText: values.segmentText,
      updatedAt: timestamp(),
      updatedBy: normalizeActorKey(actorKey),
      voiceProfileKey: values.voiceProfileKey,
    });
    return this.getMessageSegment(key);
  }

  async deleteMessageSegment(key) {
    const existing = await this.getMessageSegment(key);
    await this.deleteRow("messages_segments", existing.key);
    return existing;
  }

  async listMessageEventActions() {
    await this.ensureReady();
    const messages = new Map((await this.tableRows("messages_records")).map((row) => [row.key, row.name]));
    return (await this.tableRows("messages_event_actions"))
      .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)) || compareName(left, right))
      .map((row) => messageEventActionFromRow(row, {
        messageName: messages.get(row.messageKey) || "",
      }));
  }

  async getMessageEventAction(key) {
    await this.ensureReady();
    const row = await this.rowByKey("messages_event_actions", key);
    if (!row) {
      throw httpError("Message event action was not found.", 404);
    }
    const message = row.messageKey ? await this.rowByKey("messages_records", row.messageKey) : null;
    return messageEventActionFromRow(row, {
      messageName: message?.name || "",
    });
  }

  async normalizeMessageEventActionInput(input = {}, existing = null) {
    const actionType = input.actionType === undefined && existing ? existing.actionType : normalizeEventActionType(input.actionType);
    const actionDefinition = eventActionTypeDefinition(actionType);
    const rawMessageKey = input.messageKey === undefined && existing ? existing.messageKey : input.messageKey;
    const messageKey = normalizeText(rawMessageKey).trim();
    const name = input.name === undefined && existing ? existing.name : normalizeName(input.name, "Event action name");
    if (actionDefinition?.requiresMessage && !messageKey) {
      throw httpError("Message is required for this event action.");
    }
    if (!actionDefinition?.requiresMessage && messageKey) {
      throw httpError("Message is not used by this event action.");
    }
    if (messageKey) {
      await this.getMessage(messageKey);
    }
    return {
      actionType,
      active: normalizeActive(input.active, existing ? existing.active : true),
      messageKey,
      name,
    };
  }

  async createMessageEventAction(input = {}, actorKey = "") {
    await this.ensureReady();
    const values = await this.normalizeMessageEventActionInput(input);
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(actorKey);
    await this.upsertRow("messages_event_actions", {
      actionType: values.actionType,
      active: values.active,
      createdAt: now,
      createdBy: actor,
      key,
      messageKey: values.messageKey || null,
      name: values.name,
      updatedAt: now,
      updatedBy: actor,
    });
    return this.getMessageEventAction(key);
  }

  async updateMessageEventAction(key, input = {}, actorKey = "") {
    const existing = await this.getMessageEventAction(key);
    const values = await this.normalizeMessageEventActionInput(input, existing);
    await this.patchRow("messages_event_actions", key, {
      actionType: values.actionType,
      active: values.active,
      messageKey: values.messageKey || null,
      name: values.name,
      updatedAt: timestamp(),
      updatedBy: normalizeActorKey(actorKey),
    });
    return this.getMessageEventAction(key);
  }

  async validateMessagePublishConfiguration() {
    await this.ensureReady();
    const messages = await this.tableRows("messages_records");
    const segments = await this.tableRows("messages_segments");
    const emotions = new Map((await this.tableRows("messages_emotion_profiles")).map((row) => [row.key, row]));
    const voices = new Map((await this.tableRows("messages_tts_profiles")).map((row) => [row.key, row]));
    const eventActions = await this.tableRows("messages_event_actions");
    const messagesByKey = new Map(messages.map((row) => [row.key, row]));
    const issues = [];

    const addIssue = (issue) => {
      issues.push(publishValidationIssue(issue));
    };

    const validateEmotionReference = (row, targetType, targetName) => {
      const emotionProfileKey = normalizeText(row.emotionProfileKey).trim();
      if (!emotionProfileKey) {
        addIssue({
          code: "missing-emotion-profile",
          field: "emotionProfileKey",
          message: "Choose an Emotion Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return;
      }
      if (!emotions.has(emotionProfileKey)) {
        addIssue({
          code: "broken-reference",
          field: "emotionProfileKey",
          message: "Choose an existing Emotion Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
      }
    };

    const validateVoiceReference = (row, targetType, targetName) => {
      const voiceProfileKey = normalizeText(row.voiceProfileKey).trim();
      if (!voiceProfileKey) {
        addIssue({
          code: "missing-voice-profile",
          field: "voiceProfileKey",
          message: "Choose a Voice Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return;
      }
      const voiceProfile = voices.get(voiceProfileKey);
      if (!voiceProfile) {
        addIssue({
          code: "broken-reference",
          field: "voiceProfileKey",
          message: "Choose an existing Voice Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return;
      }
      const providerKey = normalizeText(voiceProfile.providerKey).trim();
      if (!SUPPORTED_TTS_PROVIDER_KEYS.includes(providerKey) || !ACTIVE_PUBLISH_TTS_PROVIDER_KEYS.includes(providerKey)) {
        addIssue({
          code: "invalid-provider-assignment",
          field: "providerKey",
          message: "Use Browser Speech API for publish-ready message voice playback.",
          targetKey: row.key,
          targetName,
          targetType,
        });
      }
    };

    messages.forEach((message) => {
      const targetName = normalizeText(message.name) || "Message";
      if (!normalizeText(message.messageText).trim()) {
        addIssue({
          code: "missing-message-text",
          field: "messageText",
          message: "Add message text before publishing.",
          targetKey: message.key,
          targetName,
          targetType: "message",
        });
      }
      validateEmotionReference(message, "message", targetName);
      validateVoiceReference(message, "message", targetName);
    });

    segments.forEach((segment) => {
      const targetName = segment.displayOrder ? `Part ${segment.displayOrder}` : "Message Part";
      const messageKey = normalizeText(segment.messageKey).trim();
      if (!messageKey || !messagesByKey.has(messageKey)) {
        addIssue({
          code: "broken-reference",
          field: "messageKey",
          message: "Connect this Message Part to an existing Message before publishing.",
          targetKey: segment.key,
          targetName,
          targetType: "message-part",
        });
      }
      if (!normalizeText(segment.segmentText).trim()) {
        addIssue({
          code: "missing-message-text",
          field: "segmentText",
          message: "Add Message Part text before publishing.",
          targetKey: segment.key,
          targetName,
          targetType: "message-part",
        });
      }
      validateEmotionReference(segment, "message-part", targetName);
      validateVoiceReference(segment, "message-part", targetName);
    });

    eventActions.forEach((eventAction) => {
      const actionType = normalizeText(eventAction.actionType).trim();
      const actionDefinition = eventActionTypeDefinition(actionType);
      const messageKey = normalizeText(eventAction.messageKey).trim();
      const targetName = normalizeText(eventAction.name) || actionDefinition?.label || "Message Event Action";
      if (!actionDefinition) {
        addIssue({
          code: "broken-reference",
          field: "actionType",
          message: "Choose a supported Message Event Action before publishing.",
          targetKey: eventAction.key,
          targetName,
          targetType: "event-action",
        });
        return;
      }
      if (actionDefinition.requiresMessage && !messageKey) {
        addIssue({
          code: "broken-reference",
          field: "messageKey",
          message: "Choose a Message for this Event Action before publishing.",
          targetKey: eventAction.key,
          targetName,
          targetType: "event-action",
        });
        return;
      }
      if (messageKey && !messagesByKey.has(messageKey)) {
        addIssue({
          code: "broken-reference",
          field: "messageKey",
          message: "Choose an existing Message for this Event Action before publishing.",
          targetKey: eventAction.key,
          targetName,
          targetType: "event-action",
        });
      }
      if (!actionDefinition.requiresMessage && messageKey) {
        addIssue({
          code: "broken-reference",
          field: "messageKey",
          message: "Remove the Message reference from Wait For Continue before publishing.",
          targetKey: eventAction.key,
          targetName,
          targetType: "event-action",
        });
      }
    });

    return {
      canPublish: issues.length === 0,
      checkedAt: timestamp(),
      issueCount: issues.length,
      issues,
      status: issues.length ? "Blocked" : "Ready",
      valid: issues.length === 0,
    };
  }
}

export function createMessagesPostgresService(options = {}) {
  return new MessagesPostgresService(options);
}

export async function handleMessagesApiContract({
  actorKey = "",
  body = {},
  method = "GET",
  parts = [],
  service,
} = {}) {
  if (!service) {
    throw httpError("Messages Postgres service is not configured.", 500);
  }
  const normalizedMethod = String(method || "GET").toUpperCase();
  const resource = parts[0] || "";
  const key = parts[1] || "";
  const action = parts[2] || "";

  if (resource === "publish-validation" && normalizedMethod === "GET" && !key) {
    return {
      persistence: service.persistenceSummary(),
      publishValidation: await service.validateMessagePublishConfiguration(),
    };
  }

  if (resource === "messages") {
    if (normalizedMethod === "GET" && !key) {
      return {
        messages: await service.listMessages(),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        message: await service.getMessage(key),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        message: await service.createMessage(body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key && action === "delete") {
      return {
        message: await service.deleteMessage(key),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key && !action) {
      return {
        message: await service.updateMessage(key, body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
  }

  if (resource === "emotion-profiles") {
    if (normalizedMethod === "GET" && !key) {
      return {
        emotionProfiles: await service.listEmotionProfiles(),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        emotionProfile: await service.getEmotionProfile(key),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        emotionProfile: await service.createEmotionProfile(body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        emotionProfile: await service.updateEmotionProfile(key, body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
  }

  if (resource === "categories") {
    if (normalizedMethod === "GET" && !key) {
      return {
        categories: await service.listCategories(),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        category: await service.createCategory(body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        category: await service.updateCategory(key, body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
  }

  if (resource === "tts-profiles") {
    if (normalizedMethod === "GET" && !key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfiles: await service.listTtsProfiles(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfile: await service.getTtsProfile(key),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfile: await service.createTtsProfile(body, actorKey),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        persistence: service.persistenceSummary(),
        ttsProfile: await service.updateTtsProfile(key, body, actorKey),
      };
    }
  }

  if (resource === "event-actions") {
    if (normalizedMethod === "GET" && !key) {
      return {
        eventActions: await service.listMessageEventActions(),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        eventAction: await service.getMessageEventAction(key),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        eventAction: await service.createMessageEventAction(body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
    if (normalizedMethod === "POST" && key) {
      return {
        eventAction: await service.updateMessageEventAction(key, body, actorKey),
        persistence: service.persistenceSummary(),
      };
    }
  }

  if (resource === "segments") {
    if (normalizedMethod === "GET" && !key) {
      return {
        persistence: service.persistenceSummary(),
        segments: await service.listMessageSegments(),
      };
    }
    if (normalizedMethod === "GET" && key) {
      return {
        persistence: service.persistenceSummary(),
        segment: await service.getMessageSegment(key),
      };
    }
    if (normalizedMethod === "POST" && !key) {
      return {
        persistence: service.persistenceSummary(),
        segment: await service.createMessageSegment(body, actorKey),
      };
    }
    if (normalizedMethod === "POST" && key && action === "delete") {
      return {
        persistence: service.persistenceSummary(),
        segment: await service.deleteMessageSegment(key),
      };
    }
    if (normalizedMethod === "POST" && key && !action) {
      return {
        persistence: service.persistenceSummary(),
        segment: await service.updateMessageSegment(key, body, actorKey),
      };
    }
  }

  throw httpError(`Unknown Messages API route: ${normalizedMethod} /api/messages/${parts.join("/")}.`, 404);
}
