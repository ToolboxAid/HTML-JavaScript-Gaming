import { randomBytes } from "node:crypto";
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
  Object.freeze({ description: "Bright, positive delivery for friendly or successful moments.", name: "Happy", pauseAfterMs: 110, pauseBeforeMs: 0, pitch: 1.08, rate: 1.04, volume: 1 }),
  Object.freeze({ description: "Neutral spoken delivery for general narration or dialog.", name: "Calm", pauseAfterMs: 150, pauseBeforeMs: 0, pitch: 1, rate: 1, volume: 1 }),
  Object.freeze({ description: "Fast, alert delivery for warnings and immediate danger.", name: "Urgent", pauseAfterMs: 80, pauseBeforeMs: 0, pitch: 1.08, rate: 1.15, volume: 1 }),
  Object.freeze({ description: "Quiet delivery for secret, stealth, or intimate lines.", name: "Whisper", pauseAfterMs: 180, pauseBeforeMs: 80, pitch: 0.95, rate: 0.9, volume: 0.55 }),
  Object.freeze({ description: "Forceful delivery for conflict or frustration.", name: "Angry", pauseAfterMs: 90, pauseBeforeMs: 0, pitch: 0.98, rate: 1.1, volume: 1 }),
  Object.freeze({ description: "Tense delivery for fear, panic, or discovery.", name: "Scared", pauseAfterMs: 120, pauseBeforeMs: 0, pitch: 1.12, rate: 1.12, volume: 0.9 }),
  Object.freeze({ description: "Bright delivery for reveals, wins, and high-energy moments.", name: "Excited", pauseAfterMs: 100, pauseBeforeMs: 0, pitch: 1.12, rate: 1.12, volume: 1 }),
  Object.freeze({ description: "Soft delivery for loss, regret, or reflective moments.", name: "Sad", pauseAfterMs: 220, pauseBeforeMs: 100, pitch: 0.9, rate: 0.85, volume: 0.8 }),
  Object.freeze({ description: "Measured delivery for suspense, hidden lore, or strange events.", name: "Mysterious", pauseAfterMs: 260, pauseBeforeMs: 120, pitch: 0.92, rate: 0.88, volume: 0.85 }),
]);
const SEED_TTS_PROFILES = Object.freeze([]);
const SEED_TTS_PROFILE_EMOTION_SETTINGS = Object.freeze([]);
const RETIRED_TTS_PROFILE_PARENT_NAMES = Object.freeze([
  "Default Balanced Profile",
  "Hero",
  "Merchant",
  "Neutral",
  "Robot",
]);
const RETIRED_TTS_PROFILE_PARENT_NAMES_NORMALIZED = new Set(
  RETIRED_TTS_PROFILE_PARENT_NAMES.map((name) => name.toLowerCase()),
);
const SUPPORTED_TTS_PROVIDER_KEYS = Object.freeze([
  "browser-speech",
  "elevenlabs",
  "openai",
  "azure",
  "polly",
]);
const SUPPORTED_TTS_SSML_LIKE_PRESETS = Object.freeze([
  "normal",
  "slow",
  "whisper-ish",
]);
const ACTIVE_PUBLISH_TTS_PROVIDER_KEYS = Object.freeze([
  "browser-speech",
]);
const DEFAULT_TYPEWRITER_SPEED = 30;
const AUTHENTICATED_MESSAGES_WRITE_RESOURCES = Object.freeze([
  "categories",
  "emotion-profiles",
  "event-actions",
  "messages",
  "segments",
  "tts-profiles",
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

CREATE TABLE IF NOT EXISTS messages_tts_profile_emotion_settings (
  key text PRIMARY KEY,
  "ttsProfileKey" text NOT NULL REFERENCES messages_tts_profiles(key),
  "emotionProfileKey" text NOT NULL REFERENCES messages_emotion_profiles(key),
  "volume" numeric NOT NULL DEFAULT 1,
  "pitch" numeric NOT NULL DEFAULT 1,
  "rate" numeric NOT NULL DEFAULT 1,
  "displayOrder" integer NOT NULL DEFAULT 0,
  "ssmlLikePreset" text NOT NULL DEFAULT 'normal',
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "createdBy" text NOT NULL REFERENCES users(key),
  "updatedBy" text NOT NULL REFERENCES users(key),
  UNIQUE ("ttsProfileKey", "emotionProfileKey")
);

CREATE TABLE IF NOT EXISTS messages_records (
  key text PRIMARY KEY,
  "name" text NOT NULL,
  "categoryKey" text NOT NULL REFERENCES messages_categories(key),
  "emotionProfileKey" text NOT NULL REFERENCES messages_emotion_profiles(key),
  "voiceProfileKey" text NOT NULL REFERENCES messages_tts_profiles(key),
  "messageText" text NOT NULL,
  "speaker" text NOT NULL DEFAULT '',
  "trigger" text NOT NULL DEFAULT '',
  "typewriterSpeed" numeric NOT NULL DEFAULT ${DEFAULT_TYPEWRITER_SPEED},
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
ALTER TABLE messages_records ADD COLUMN IF NOT EXISTS "speaker" text NOT NULL DEFAULT '';
ALTER TABLE messages_records ADD COLUMN IF NOT EXISTS "trigger" text NOT NULL DEFAULT '';
ALTER TABLE messages_records ADD COLUMN IF NOT EXISTS "typewriterSpeed" numeric NOT NULL DEFAULT ${DEFAULT_TYPEWRITER_SPEED};
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
CREATE INDEX IF NOT EXISTS idx_messages_tts_profile_emotion_settings_ttsprofilekey ON messages_tts_profile_emotion_settings ("ttsProfileKey");
CREATE INDEX IF NOT EXISTS idx_messages_tts_profile_emotion_settings_emotionprofilekey ON messages_tts_profile_emotion_settings ("emotionProfileKey");
CREATE INDEX IF NOT EXISTS idx_messages_tts_profile_emotion_settings_order ON messages_tts_profile_emotion_settings ("ttsProfileKey", "displayOrder");
CREATE INDEX IF NOT EXISTS idx_messages_tts_profile_emotion_settings_createdby ON messages_tts_profile_emotion_settings ("createdBy");
CREATE INDEX IF NOT EXISTS idx_messages_tts_profile_emotion_settings_updatedby ON messages_tts_profile_emotion_settings ("updatedBy");
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
  const providerKey = normalizeName(value, "TTS Profile provider");
  if (!SUPPORTED_TTS_PROVIDER_KEYS.includes(providerKey)) {
    throw httpError("TTS Profile provider is not supported.");
  }
  return providerKey;
}

function isRetiredTtsProfileParentName(value) {
  return RETIRED_TTS_PROFILE_PARENT_NAMES_NORMALIZED.has(normalizeText(value).trim().toLowerCase());
}

function normalizeSsmlLikePreset(value, fallback = "normal") {
  const normalized = normalizeText(value || fallback).trim() || fallback;
  if (!SUPPORTED_TTS_SSML_LIKE_PRESETS.includes(normalized)) {
    throw httpError("Emotion preset is not supported.");
  }
  return normalized;
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

function messagesWriteRequiresAuthenticatedActor(resource, method) {
  return String(method || "GET").toUpperCase() === "POST"
    && AUTHENTICATED_MESSAGES_WRITE_RESOURCES.includes(resource);
}

function messagesWriteAuthenticationMessage(resource) {
  if (["emotion-profiles", "tts-profiles"].includes(resource)) {
    return "Sign in required to save Text To Speech profiles and emotions.";
  }
  return "Sign in required to save Messages through the API.";
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

function queryForEqual(field, value) {
  return `select=*&${encodeURIComponent(field)}=eq.${encodeURIComponent(value)}`;
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
    speaker: row.speaker || "",
    trigger: row.trigger || "",
    typewriterSpeed: normalizeNumber(row.typewriterSpeed, DEFAULT_TYPEWRITER_SPEED),
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

function ttsEmotionSettingFromRow(row, profile, usage = {}) {
  const messageUsageCount = Number(usage.messageUsageCount || 0);
  const segmentUsageCount = Number(usage.segmentUsageCount || 0);
  return {
    active: activeFromDatabase(row.active) && profile.active !== false,
    displayOrder: Number(row.displayOrder || 0),
    emotion: emotionSettingKey(profile.name),
    emotionLabel: profile.name,
    key: profile.key,
    messagePartsUsageCount: segmentUsageCount,
    messageUsageCount,
    pitch: Number(row.pitch),
    rate: Number(row.rate),
    references: Array.isArray(usage.references) ? usage.references : [],
    settingKey: row.key,
    ssmlLikePreset: row.ssmlLikePreset || "normal",
    usageCount: messageUsageCount + segmentUsageCount,
    volume: Number(row.volume),
  };
}

function ttsProfileFromRow(row, emotionSettings = [], usage = {}) {
  const messageUsageCount = Number(usage.messageUsageCount || 0);
  const segmentUsageCount = Number(usage.segmentUsageCount || 0);
  return {
    active: activeFromDatabase(row.active),
    age: "",
    ageFilter: "",
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    description: row.description || "",
    emotionSettings,
    gender: "",
    key: row.key,
    language: row.language,
    messageUsageCount,
    name: row.name,
    pitch: Number(row.pitch),
    providerKey: row.providerKey,
    rate: Number(row.rate),
    references: Array.isArray(usage.references) ? usage.references : [],
    segmentUsageCount,
    status: activeFromDatabase(row.active) ? "Active" : "Inactive",
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
    usageCount: messageUsageCount + segmentUsageCount,
    voice: row.voiceName || "",
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

  async rowsByField(tableName, field, value) {
    return cloneRows(await this.client().requestTable(tableName, {
      method: "GET",
      query: queryForEqual(field, value),
    }));
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
    await this.deleteRetiredTtsProfileParents();
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
    await this.seedDefaultTtsProfileEmotionSettings();
    await this.deleteEmptyTtsProfileParents();
    await this.assertNoRetiredTtsProfileParents();
    await this.backfillDefaultVoiceProfileReferences();
  }

  async deleteRetiredTtsProfileParents() {
    const profiles = await this.tableRows("messages_tts_profiles");
    for (const profile of profiles) {
      if (!isRetiredTtsProfileParentName(profile.name)) {
        continue;
      }
      await this.deleteTtsProfileParentData(profile.key);
    }
    await this.deleteOrphanedTtsProfileEmotionSettings();
  }

  async deleteTtsProfileParentData(ttsProfileKey) {
    await this.deleteTtsProfileReferences(ttsProfileKey);
    const settings = await this.rowsByField("messages_tts_profile_emotion_settings", "ttsProfileKey", ttsProfileKey);
    for (const setting of settings) {
      await this.deleteRow("messages_tts_profile_emotion_settings", setting.key);
    }
    await this.deleteRow("messages_tts_profiles", ttsProfileKey);
  }

  async deleteTtsProfileReferences(ttsProfileKey) {
    const directSegments = await this.rowsByField("messages_segments", "voiceProfileKey", ttsProfileKey);
    for (const segment of directSegments) {
      await this.deleteRow("messages_segments", segment.key);
    }
    const messages = await this.rowsByField("messages_records", "voiceProfileKey", ttsProfileKey);
    for (const message of messages) {
      const messageSegments = await this.rowsByField("messages_segments", "messageKey", message.key);
      for (const segment of messageSegments) {
        await this.deleteRow("messages_segments", segment.key);
      }
      const eventActions = await this.rowsByField("messages_event_actions", "messageKey", message.key);
      for (const eventAction of eventActions) {
        await this.deleteRow("messages_event_actions", eventAction.key);
      }
      await this.deleteRow("messages_records", message.key);
    }
  }

  async deleteEmptyTtsProfileParents() {
    await this.deleteOrphanedTtsProfileEmotionSettings();
    const settings = await this.tableRows("messages_tts_profile_emotion_settings");
    const ttsProfileKeysWithSettings = new Set(settings.map((setting) => setting.ttsProfileKey));
    const profiles = await this.tableRows("messages_tts_profiles");
    for (const profile of profiles) {
      if (ttsProfileKeysWithSettings.has(profile.key)) {
        continue;
      }
      await this.deleteTtsProfileParentData(profile.key);
    }
  }

  async deleteOrphanedTtsProfileEmotionSettings() {
    const profileKeys = new Set((await this.tableRows("messages_tts_profiles")).map((profile) => profile.key));
    const emotionKeys = new Set((await this.tableRows("messages_emotion_profiles")).map((emotion) => emotion.key));
    const settings = await this.tableRows("messages_tts_profile_emotion_settings");
    for (const setting of settings) {
      if (profileKeys.has(setting.ttsProfileKey) && emotionKeys.has(setting.emotionProfileKey)) {
        continue;
      }
      await this.deleteRow("messages_tts_profile_emotion_settings", setting.key);
    }
  }

  async assertNoRetiredTtsProfileParents() {
    const remainingNames = (await this.tableRows("messages_tts_profiles"))
      .map((profile) => normalizeText(profile.name).trim())
      .filter((name) => isRetiredTtsProfileParentName(name))
      .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
    if (remainingNames.length) {
      throw httpError(`Retired TTS Profile cleanup failed: ${remainingNames.join(", ")} still exist.`, 500);
    }
  }

  async seedDefaultTtsProfileEmotionSettings() {
    for (const profileSettings of SEED_TTS_PROFILE_EMOTION_SETTINGS) {
      const ttsProfile = await this.findTtsProfileByNameRaw(profileSettings.ttsProfileName);
      if (!ttsProfile) {
        continue;
      }
      for (const [displayIndex, emotionName] of profileSettings.emotions.entries()) {
        const emotionProfile = await this.findEmotionProfileByNameRaw(emotionName);
        if (!emotionProfile) {
          continue;
        }
        const existing = await this.findTtsEmotionSettingRaw(ttsProfile.key, emotionProfile.key);
        if (existing) {
          continue;
        }
        await this.insertTtsEmotionSetting({
          active: true,
          actorKey: SEED_DB_KEYS.users.forgeBot,
          displayOrder: displayIndex + 1,
          emotionProfileKey: emotionProfile.key,
          pitch: Number(emotionProfile.pitch),
          rate: Number(emotionProfile.rate),
          ssmlLikePreset: "normal",
          ttsProfileKey: ttsProfile.key,
          volume: Number(emotionProfile.volume),
        }, { skipEnsure: true });
      }
    }
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

  async deleteEmotionProfile(key) {
    const existing = await this.getEmotionProfile(key);
    if (existing.usageCount > 0) {
      throw httpError("Emotion Profile is referenced by messages or sentences. Reassign those references before deleting this Emotion Profile.", 409);
    }
    const settings = await this.rowsByField("messages_tts_profile_emotion_settings", "emotionProfileKey", key);
    if (settings.length > 0) {
      throw httpError("Emotion Profile belongs to one or more TTS Profiles. Remove it from those TTS Profiles before deleting this Emotion Profile.", 409);
    }
    await this.deleteRow("messages_emotion_profiles", key);
    return existing;
  }

  async findTtsEmotionSettingRaw(ttsProfileKey, emotionProfileKey) {
    const ttsKey = normalizeText(ttsProfileKey).trim();
    const emotionKey = normalizeText(emotionProfileKey).trim();
    if (!ttsKey || !emotionKey) {
      return null;
    }
    return (await this.tableRows("messages_tts_profile_emotion_settings"))
      .find((row) => row.ttsProfileKey === ttsKey && row.emotionProfileKey === emotionKey) || null;
  }

  async ttsEmotionSettingUsage(ttsProfileKey, emotionProfileKey) {
    const messages = await this.tableRows("messages_records");
    const segments = await this.tableRows("messages_segments");
    const messageNames = new Map(messages.map((message) => [message.key, message.name]));
    const messageReferences = messages
      .filter((message) => message.voiceProfileKey === ttsProfileKey && message.emotionProfileKey === emotionProfileKey)
      .sort(compareName)
      .map((row) => ({
        key: row.key,
        label: row.name,
        type: "message",
      }));
    const segmentReferences = segments
      .filter((segment) => segment.voiceProfileKey === ttsProfileKey && segment.emotionProfileKey === emotionProfileKey)
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
        label: `${messageNames.get(row.messageKey) || "Unknown Message"} sentence ${row.displayOrder}`,
        messageKey: row.messageKey,
        preview: normalizeText(row.segmentText).slice(0, 80),
        type: "sentence",
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

  async emotionSettingsForTtsProfileRow(row) {
    const emotionRows = new Map((await this.tableRows("messages_emotion_profiles")).map((emotionRow) => [emotionRow.key, emotionRow]));
    const settingRows = (await this.rowsByField("messages_tts_profile_emotion_settings", "ttsProfileKey", row.key))
      .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0)
        || String(left.createdAt || "").localeCompare(String(right.createdAt || ""))
        || String(left.key).localeCompare(String(right.key)));
    const settings = [];
    for (const settingRow of settingRows) {
      const emotionRow = emotionRows.get(settingRow.emotionProfileKey);
      if (!emotionRow) {
        continue;
      }
      const usage = await this.ttsEmotionSettingUsage(row.key, emotionRow.key);
      settings.push(ttsEmotionSettingFromRow(settingRow, emotionProfileFromRow(emotionRow), usage));
    }
    return settings;
  }

  async ttsProfileUsage(key) {
    const messages = await this.tableRows("messages_records");
    const segments = await this.tableRows("messages_segments");
    const messageNames = new Map(messages.map((message) => [message.key, message.name]));
    const messageReferences = messages
      .filter((message) => message.voiceProfileKey === key)
      .sort(compareName)
      .map((row) => ({
        key: row.key,
        label: row.name,
        type: "message",
      }));
    const segmentReferences = segments
      .filter((segment) => segment.voiceProfileKey === key)
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
        label: `${messageNames.get(row.messageKey) || "Unknown Message"} sentence ${row.displayOrder}`,
        messageKey: row.messageKey,
        preview: normalizeText(row.segmentText).slice(0, 80),
        type: "sentence",
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

  async insertTtsEmotionSetting(input = {}, { skipEnsure = false } = {}) {
    if (!skipEnsure) {
      await this.ensureReady();
    }
    const ttsProfileKey = normalizeName(input.ttsProfileKey, "TTS Profile");
    const emotionProfileKey = normalizeName(input.emotionProfileKey, "Emotion Profile");
    const existing = await this.findTtsEmotionSettingRaw(ttsProfileKey, emotionProfileKey);
    if (existing) {
      throw httpError("Emotion Profile already belongs to this TTS Profile.");
    }
    const key = createUlid();
    const now = timestamp();
    const actor = normalizeActorKey(input.actorKey);
    await this.upsertRow("messages_tts_profile_emotion_settings", {
      active: normalizeActive(input.active, true),
      createdAt: now,
      createdBy: actor,
      displayOrder: normalizeInteger(input.displayOrder, 0),
      emotionProfileKey,
      key,
      pitch: normalizeEditableNumber(input.pitch, 1, "Emotion profile pitch"),
      rate: normalizeEditableNumber(input.rate, 1, "Emotion profile rate"),
      ssmlLikePreset: normalizeSsmlLikePreset(input.ssmlLikePreset, "normal"),
      ttsProfileKey,
      updatedAt: now,
      updatedBy: actor,
      volume: normalizeEditableNumber(input.volume, 1, "Emotion profile volume"),
    });
    return this.rowByKey("messages_tts_profile_emotion_settings", key);
  }

  async replaceTtsEmotionSettings(ttsProfileKey, inputSettings = [], actorKey = "") {
    if (!Array.isArray(inputSettings)) {
      return;
    }
    const actor = normalizeActorKey(actorKey);
    const now = timestamp();
    const nextSettings = new Map();
    const emotionProfiles = await this.tableRows("messages_emotion_profiles");
    const emotionByName = new Map(emotionProfiles.map((profile) => [normalizeText(profile.name).trim().toLowerCase(), profile]));
    for (const [displayIndex, setting] of inputSettings.entries()) {
      const rawEmotionKey = normalizeText(setting?.key || setting?.emotionProfileKey).trim();
      let emotionRow = rawEmotionKey ? await this.rowByKey("messages_emotion_profiles", rawEmotionKey) : null;
      if (!emotionRow) {
        emotionRow = emotionByName.get(normalizeText(setting?.emotionLabel || setting?.name || setting?.emotion).trim().toLowerCase()) || null;
      }
      if (!emotionRow) {
        throw httpError("Choose an existing Emotion Profile before saving this TTS Profile.");
      }
      const key = emotionRow.key;
      if (nextSettings.has(key)) {
        throw httpError("Emotion Profile must be unique within the selected TTS Profile.");
      }
      nextSettings.set(key, {
        active: normalizeActive(setting.active, true),
        displayOrder: normalizeInteger(setting.displayOrder, displayIndex + 1),
        emotionProfileKey: key,
        pitch: normalizeEditableNumber(setting.pitch, Number(emotionRow.pitch), "Emotion profile pitch"),
        rate: normalizeEditableNumber(setting.rate, Number(emotionRow.rate), "Emotion profile rate"),
        ssmlLikePreset: normalizeSsmlLikePreset(setting.ssmlLikePreset, "normal"),
        volume: normalizeEditableNumber(setting.volume, Number(emotionRow.volume), "Emotion profile volume"),
      });
    }
    const existingSettings = await this.rowsByField("messages_tts_profile_emotion_settings", "ttsProfileKey", ttsProfileKey);
    for (const existing of existingSettings) {
      if (nextSettings.has(existing.emotionProfileKey)) {
        continue;
      }
      const usage = await this.ttsEmotionSettingUsage(ttsProfileKey, existing.emotionProfileKey);
      if ((usage.messageUsageCount + usage.segmentUsageCount) > 0) {
        const emotionRow = await this.rowByKey("messages_emotion_profiles", existing.emotionProfileKey);
        throw httpError(`Emotion Profile ${emotionRow?.name || existing.emotionProfileKey} is referenced by messages or sentences. Reassign those references before removing it from this TTS Profile.`, 409);
      }
      await this.deleteRow("messages_tts_profile_emotion_settings", existing.key);
    }
    for (const setting of nextSettings.values()) {
      const existing = existingSettings.find((candidate) => candidate.emotionProfileKey === setting.emotionProfileKey) || null;
      if (existing) {
        await this.patchRow("messages_tts_profile_emotion_settings", existing.key, {
          active: setting.active,
          displayOrder: setting.displayOrder,
          pitch: setting.pitch,
          rate: setting.rate,
          ssmlLikePreset: setting.ssmlLikePreset,
          updatedAt: now,
          updatedBy: actor,
          volume: setting.volume,
        });
        continue;
      }
      await this.insertTtsEmotionSetting({
        ...setting,
        actorKey: actor,
        ttsProfileKey,
      });
    }
  }

  async listTtsProfiles() {
    await this.ensureReady();
    await this.deleteRetiredTtsProfileParents();
    await this.deleteEmptyTtsProfileParents();
    await this.assertNoRetiredTtsProfileParents();
    const rows = (await this.tableRows("messages_tts_profiles")).sort(compareName);
    return Promise.all(rows.map(async (row) => ttsProfileFromRow(
      row,
      await this.emotionSettingsForTtsProfileRow(row),
      await this.ttsProfileUsage(row.key),
    )));
  }

  async getTtsProfile(key) {
    await this.ensureReady();
    await this.deleteRetiredTtsProfileParents();
    await this.deleteEmptyTtsProfileParents();
    await this.assertNoRetiredTtsProfileParents();
    const row = await this.rowByKey("messages_tts_profiles", key);
    if (!row) {
      throw httpError("TTS Profile was not found.", 404);
    }
    return ttsProfileFromRow(
      row,
      await this.emotionSettingsForTtsProfileRow(row),
      await this.ttsProfileUsage(row.key),
    );
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
    return row ? this.getTtsProfile(row.key) : null;
  }

  async defaultVoiceProfileKeyRaw() {
    return "";
  }

  async backfillDefaultVoiceProfileReferences() {
    const voiceProfileKey = await this.defaultVoiceProfileKeyRaw();
    if (!voiceProfileKey) {
      return;
    }
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
    const name = input.name === undefined && existing ? existing.name : normalizeName(input.name, "TTS Profile name");
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      description: input.description === undefined && existing ? existing.description : normalizeText(input.description),
      language: input.language === undefined && existing ? existing.language : normalizeName(input.language, "TTS Profile language"),
      name,
      pitch: normalizeNumber(input.pitch, existing ? existing.pitch : 1),
      providerKey: input.providerKey === undefined && existing ? existing.providerKey : normalizeTtsProviderKey(input.providerKey),
      rate: normalizeNumber(input.rate, existing ? existing.rate : 1),
      voiceName: input.voiceName === undefined && existing ? existing.voiceName : normalizeName(input.voiceName, "TTS Profile voice name"),
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
    if (Array.isArray(input.emotionSettings)) {
      await this.replaceTtsEmotionSettings(key, input.emotionSettings, actor);
    }
    const row = await this.rowByKey("messages_tts_profiles", key);
    return ttsProfileFromRow(
      row,
      await this.emotionSettingsForTtsProfileRow(row),
      await this.ttsProfileUsage(key),
    );
  }

  async createTtsProfile(input = {}, actorKey = "") {
    const values = this.normalizeTtsProfileInput(input);
    if (isRetiredTtsProfileParentName(values.name)) {
      throw httpError("This TTS Profile name is retired and cannot be saved.");
    }
    if (!Array.isArray(input.emotionSettings) || !input.emotionSettings.length) {
      throw httpError("TTS Profile requires at least one emotion setting.");
    }
    const existing = await this.findTtsProfileByName(values.name);
    if (existing) {
      throw httpError(`TTS Profile ${values.name} already exists.`);
    }
    return this.insertTtsProfile({
      ...values,
      actorKey,
      emotionSettings: input.emotionSettings,
    });
  }

  async updateTtsProfile(key, input = {}, actorKey = "") {
    const existing = await this.getTtsProfile(key);
    if (Array.isArray(input.emotionSettings) && !input.emotionSettings.length) {
      await this.deleteTtsProfileParentData(key);
      throw httpError("TTS Profile was deleted because it has no emotion settings.", 410);
    }
    const values = this.normalizeTtsProfileInput(input, existing);
    if (isRetiredTtsProfileParentName(values.name)) {
      throw httpError("This TTS Profile name is retired and cannot be saved.");
    }
    const duplicate = await this.findTtsProfileByName(values.name);
    if (duplicate && duplicate.key !== key) {
      throw httpError(`TTS Profile ${values.name} already exists.`);
    }
    if (existing.active && !values.active && existing.usageCount > 0) {
      throw httpError("TTS Profile is referenced by messages or sentences. Reassign those references before deactivating this TTS Profile.", 409);
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
    if (Array.isArray(input.emotionSettings)) {
      await this.replaceTtsEmotionSettings(key, input.emotionSettings, actorKey);
    }
    return this.getTtsProfile(key);
  }

  async deleteTtsProfile(key) {
    const existing = await this.getTtsProfile(key);
    if (existing.usageCount > 0) {
      throw httpError("TTS Profile is referenced by messages or sentences. Reassign those references before deleting this TTS Profile.", 409);
    }
    const settings = await this.rowsByField("messages_tts_profile_emotion_settings", "ttsProfileKey", key);
    for (const setting of settings) {
      await this.deleteRow("messages_tts_profile_emotion_settings", setting.key);
    }
    await this.deleteRow("messages_tts_profiles", key);
    return existing;
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
      throw httpError("TTS Profile is inactive. Choose an active TTS Profile before saving a message.");
    }
    return profile;
  }

  async assertProfileEmotionSetting(voiceProfileKey, emotionProfileKey) {
    const setting = await this.findTtsEmotionSettingRaw(voiceProfileKey, emotionProfileKey);
    if (!setting || !activeFromDatabase(setting.active)) {
      throw httpError("Add this Emotion Profile to the selected TTS Profile before saving.");
    }
    const emotion = await this.getEmotionProfile(emotionProfileKey);
    if (!emotion.active) {
      throw httpError("Emotion profile is inactive. Choose an active emotion profile before saving.");
    }
    return setting;
  }

  async normalizeMessageInput(input = {}, existing = null) {
    const name = input.name === undefined && existing ? existing.name : normalizeName(input.name, "Message name");
    const categoryKey = normalizeText(input.categoryKey === undefined && existing ? existing.categoryKey : input.categoryKey).trim()
      || await this.defaultMessageCategoryKey();
    const emotionProfileKey = normalizeText(input.emotionProfileKey === undefined && existing ? existing.emotionProfileKey : input.emotionProfileKey).trim();
    const voiceProfileKey = normalizeText(input.voiceProfileKey === undefined && existing ? existing.voiceProfileKey : input.voiceProfileKey).trim();
    const messageText = input.messageText === undefined && existing ? existing.messageText : normalizeText(input.messageText);
    const speaker = input.speaker === undefined && existing ? existing.speaker : normalizeText(input.speaker);
    const trigger = input.trigger === undefined && existing ? existing.trigger : normalizeText(input.trigger);
    const typewriterSpeed = normalizeEditableNumber(
      input.typewriterSpeed === undefined && existing ? existing.typewriterSpeed : input.typewriterSpeed,
      DEFAULT_TYPEWRITER_SPEED,
      "Typewriter speed",
    );
    if (!emotionProfileKey) {
      throw httpError("Emotion profile is required.");
    }
    if (!voiceProfileKey) {
      throw httpError("TTS Profile is required.");
    }
    if (!messageText.trim()) {
      throw httpError("Message text is required.");
    }
    if (typewriterSpeed < 0) {
      throw httpError("Typewriter speed must be 0 or greater.");
    }
    await this.assertActiveCategory(categoryKey);
    await this.assertActiveEmotionProfile(emotionProfileKey);
    await this.assertActiveVoiceProfile(voiceProfileKey);
    await this.assertProfileEmotionSetting(voiceProfileKey, emotionProfileKey);
    return {
      active: normalizeActive(input.active, existing ? existing.active : true),
      categoryKey,
      emotionProfileKey,
      messageText,
      name,
      notes: input.notes === undefined && existing ? existing.notes : normalizeText(input.notes),
      speaker,
      trigger,
      typewriterSpeed,
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
      speaker: values.speaker,
      trigger: values.trigger,
      typewriterSpeed: values.typewriterSpeed,
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
      speaker: values.speaker,
      trigger: values.trigger,
      typewriterSpeed: values.typewriterSpeed,
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
      throw httpError("TTS Profile is required.");
    }
    if (!segmentText.trim()) {
      throw httpError("Segment text is required.");
    }
    await this.getMessage(messageKey);
    await this.assertActiveEmotionProfile(emotionProfileKey);
    await this.assertActiveVoiceProfile(voiceProfileKey);
    await this.assertProfileEmotionSetting(voiceProfileKey, emotionProfileKey);
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
    const ttsEmotionSettings = await this.tableRows("messages_tts_profile_emotion_settings");
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
        return false;
      }
      const emotionProfile = emotions.get(emotionProfileKey);
      if (!emotionProfile) {
        addIssue({
          code: "broken-reference",
          field: "emotionProfileKey",
          message: "Choose an existing Emotion Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return false;
      }
      if (!activeFromDatabase(emotionProfile.active)) {
        addIssue({
          code: "inactive-reference",
          field: "emotionProfileKey",
          message: "Choose an active Emotion Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return false;
      }
      return true;
    };

    const validateVoiceReference = (row, targetType, targetName) => {
      const voiceProfileKey = normalizeText(row.voiceProfileKey).trim();
      if (!voiceProfileKey) {
        addIssue({
          code: "missing-voice-profile",
          field: "voiceProfileKey",
          message: "Choose a TTS Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return false;
      }
      const voiceProfile = voices.get(voiceProfileKey);
      if (!voiceProfile) {
        addIssue({
          code: "broken-reference",
          field: "voiceProfileKey",
          message: "Choose an existing TTS Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return false;
      }
      if (!activeFromDatabase(voiceProfile.active)) {
        addIssue({
          code: "inactive-reference",
          field: "voiceProfileKey",
          message: "Choose an active TTS Profile before publishing.",
          targetKey: row.key,
          targetName,
          targetType,
        });
        return false;
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
      return true;
    };

    const validateProfileEmotionSetting = (row, targetType, targetName) => {
      const emotionProfileKey = normalizeText(row.emotionProfileKey).trim();
      const voiceProfileKey = normalizeText(row.voiceProfileKey).trim();
      if (!emotionProfileKey || !voiceProfileKey || !emotions.has(emotionProfileKey) || !voices.has(voiceProfileKey)) {
        return;
      }
      const setting = ttsEmotionSettings.find((candidate) => candidate.ttsProfileKey === voiceProfileKey
        && candidate.emotionProfileKey === emotionProfileKey);
      if (!setting || !activeFromDatabase(setting.active)) {
        addIssue({
          code: "profile-emotion-missing",
          field: "emotionProfileKey",
          message: "Add this Emotion Profile to the selected TTS Profile before publishing.",
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
      const typewriterSpeed = Number(message.typewriterSpeed);
      if (!Number.isFinite(typewriterSpeed) || typewriterSpeed < 0) {
        addIssue({
          code: "invalid-typewriter-speed",
          field: "typewriterSpeed",
          message: "Use a Typewriter Speed of 0 or greater before publishing.",
          targetKey: message.key,
          targetName,
          targetType: "message",
        });
      }
      const validEmotion = validateEmotionReference(message, "message", targetName);
      const validVoice = validateVoiceReference(message, "message", targetName);
      if (validEmotion && validVoice) {
        validateProfileEmotionSetting(message, "message", targetName);
      }
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
      const validEmotion = validateEmotionReference(segment, "message-part", targetName);
      const validVoice = validateVoiceReference(segment, "message-part", targetName);
      if (validEmotion && validVoice) {
        validateProfileEmotionSetting(segment, "message-part", targetName);
      }
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
  if (messagesWriteRequiresAuthenticatedActor(resource, normalizedMethod) && !normalizeText(actorKey).trim()) {
    throw httpError(messagesWriteAuthenticationMessage(resource), 401);
  }

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
    if (normalizedMethod === "POST" && key && action === "delete") {
      return {
        emotionProfile: await service.deleteEmotionProfile(key),
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
    if (normalizedMethod === "POST" && key && action === "delete") {
      return {
        persistence: service.persistenceSummary(),
        ttsProfile: await service.deleteTtsProfile(key),
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
