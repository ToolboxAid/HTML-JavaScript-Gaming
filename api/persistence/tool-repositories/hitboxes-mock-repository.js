import { randomBytes } from "node:crypto";
import {
  MOCK_DB_KEYS,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const HITBOXES_TOOL_TABLES = Object.freeze([
  "hitbox_definition_records",
]);

const HITBOXES_DB_OWNER = "hitboxes";
const DEFAULT_GAME_ID = "demo-project";
const DEFAULT_HITBOXES_USER_KEY = MOCK_DB_KEYS.users.user1;
const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const DEV_SAMPLE_OBJECTS = Object.freeze([
  Object.freeze({
    bounds: Object.freeze({ height: 10, width: 10, x: 0, y: 0 }),
    devSample: true,
    id: "dev-review-ball",
    key: "dev-review-ball",
    name: "DEV Review Ball",
    origin: Object.freeze({ x: 5, y: 5 }),
    reviewLabel: "DEV review/test data",
    visual: Object.freeze({
      assetKey: "dev-review-ball-vector",
      label: "DEV Review Ball Vector",
      previewPath: "",
      type: "Vector",
    }),
  }),
  Object.freeze({
    bounds: Object.freeze({ height: 10, width: 10, x: 0, y: 50 }),
    devSample: true,
    id: "dev-review-paddle",
    key: "dev-review-paddle",
    name: "DEV Review Paddle",
    origin: Object.freeze({ x: 5, y: 5 }),
    reviewLabel: "DEV review/test data",
    visual: Object.freeze({
      assetKey: "dev-review-paddle-vector",
      label: "DEV Review Paddle Vector",
      previewPath: "",
      type: "Vector",
    }),
  }),
]);

function cloneRows(rows = []) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return Object.fromEntries(
    HITBOXES_TOOL_TABLES.map((table) => [table, cloneRows(tables[table] || [])]),
  );
}

function createEmptyTables() {
  return {
    hitbox_definition_records: [],
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeRole(value) {
  const role = normalizeText(value).toLowerCase();
  return ["hitbox", "hurtbox", "trigger", "sensor", "physics"].includes(role) ? role : "hitbox";
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeBounds(source = {}) {
  const bounds = source.bounds && typeof source.bounds === "object" ? source.bounds : {};
  const width = Math.max(1, finiteNumber(bounds.width ?? source.width, 64));
  const height = Math.max(1, finiteNumber(bounds.height ?? source.height, 64));
  return {
    height,
    width,
    x: finiteNumber(bounds.x ?? source.x, 0),
    y: finiteNumber(bounds.y ?? source.y, 0),
  };
}

function normalizeOrigin(source = {}) {
  const origin = source.origin && typeof source.origin === "object"
    ? source.origin
    : source.objectOrigin && typeof source.objectOrigin === "object"
      ? source.objectOrigin
      : {};
  return {
    x: finiteNumber(origin.x, 0),
    y: finiteNumber(origin.y, 0),
  };
}

function objectKey(source = {}) {
  return normalizeText(source.key || source.id || source.objectKey || source.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function visualMetadataForObject(object = {}) {
  const render = object.render && typeof object.render === "object" ? object.render : {};
  const assignedVisual = object.assignedVisualAsset && typeof object.assignedVisualAsset === "object" ? object.assignedVisualAsset : {};
  const visualAsset = object.visualAsset && typeof object.visualAsset === "object" ? object.visualAsset : {};
  const visual = object.visual && typeof object.visual === "object" ? object.visual : {};
  const candidates = [render, assignedVisual, visualAsset, visual, object];
  const assetKey = candidates.map((candidate) => normalizeText(candidate.assetKey || candidate.assetId || candidate.id)).find(Boolean) || "";
  const previewPath = candidates.map((candidate) => normalizeText(candidate.previewPath || candidate.path || candidate.storedPath || candidate.imagePath)).find(Boolean) || "";
  const type = candidates.map((candidate) => normalizeText(candidate.type || candidate.assetType || candidate.kind)).find(Boolean) || "";
  const label = candidates.map((candidate) => normalizeText(candidate.label || candidate.name || candidate.assetName)).find(Boolean) || assetKey;

  if (!assetKey && !previewPath) {
    return null;
  }

  return {
    assetKey,
    label: label || assetKey || "Assigned visual asset",
    previewPath,
    type: type || "Asset",
  };
}

function sourceObjectFromObject(object = {}) {
  const visual = visualMetadataForObject(object);
  const key = objectKey(object);
  if (!visual || !key) {
    return null;
  }
  return {
    bounds: normalizeBounds(object),
    devSample: false,
    id: key,
    key,
    name: normalizeText(object.name) || key,
    origin: normalizeOrigin(object),
    reviewLabel: "",
    source: "objects-api",
    visual,
  };
}

function timestamp() {
  return new Date().toISOString();
}

function encodeTime(time, length) {
  let value = Math.max(0, Math.floor(Number(time) || Date.now()));
  let output = "";
  for (let index = length - 1; index >= 0; index -= 1) {
    output = ULID_ALPHABET[value % 32] + output;
    value = Math.floor(value / 32);
  }
  return output;
}

function encodeRandom(length) {
  const bytes = randomBytes(length);
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += ULID_ALPHABET[bytes[index] % 32];
  }
  return output;
}

function makeUlid() {
  return `${encodeTime(Date.now(), 10)}${encodeRandom(16)}`;
}

function normalizeHitboxInput(hitbox = {}, index = 0) {
  return {
    enabled: hitbox.enabled !== false,
    height: Math.max(1, finiteNumber(hitbox.height, 24)),
    name: normalizeText(hitbox.name) || `Hitbox ${index + 1}`,
    role: normalizeRole(hitbox.role),
    visible: hitbox.visible !== false,
    width: Math.max(1, finiteNumber(hitbox.width, 24)),
    x: finiteNumber(hitbox.x, 0),
    y: finiteNumber(hitbox.y, 0),
  };
}

function hitboxFromRecord(record = {}) {
  return {
    enabled: record.enabled !== false,
    height: finiteNumber(record.height, 1),
    key: normalizeText(record.key),
    name: normalizeText(record.name),
    objectKey: normalizeText(record.objectKey),
    role: normalizeRole(record.role),
    visible: record.visible !== false,
    width: finiteNumber(record.width, 1),
    x: finiteNumber(record.x, 0),
    y: finiteNumber(record.y, 0),
  };
}

function initialTables(options = {}) {
  const explicitRows = options.memoryDbTables?.hitbox_definition_records;
  if (Array.isArray(explicitRows)) {
    return normalizeMockDbTables(HITBOXES_DB_OWNER, {
      hitbox_definition_records: explicitRows,
    }, options);
  }
  return normalizeMockDbTables(HITBOXES_DB_OWNER, createEmptyTables(), options);
}

function recordGameId(record = {}) {
  return normalizeText(record.gameId || record.projectId);
}

export function createHitboxesToolMockRepository(options = {}) {
  let tables = initialTables(options);

  function activeGameId() {
    return normalizeText(options.gameWorkspaceRepository?.getActiveGame?.()?.id) || DEFAULT_GAME_ID;
  }

  function activeUserKey() {
    const userKey = typeof options.sessionUserKey === "function"
      ? options.sessionUserKey()
      : options.sessionUserKey;
    return normalizeText(userKey) || DEFAULT_HITBOXES_USER_KEY;
  }

  function persistTables() {
    tables = normalizeMockDbTables(HITBOXES_DB_OWNER, cloneTables(tables), options);
    if (options.memoryDbTables && typeof options.memoryDbTables === "object") {
      HITBOXES_TOOL_TABLES.forEach((tableName) => {
        options.memoryDbTables[tableName] = cloneRows(tables[tableName]);
      });
    }
    saveMockDbTables(HITBOXES_DB_OWNER, tables, options);
  }

  function listRealSourceObjects(gameId = "") {
    const objects = options.objectsRepository?.listObjects?.(gameId) || [];
    return Array.isArray(objects)
      ? objects.map(sourceObjectFromObject).filter(Boolean)
      : [];
  }

  function listSourceObjects(gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    const objects = listRealSourceObjects(targetGameId);
    if (objects.length) {
      return {
        objects,
        source: "objects-api",
        usingDevSamples: false,
      };
    }
    return {
      objects: DEV_SAMPLE_OBJECTS.map((object) => ({
        ...object,
        source: "dev-sample",
      })),
      source: "dev-sample",
      usingDevSamples: true,
      warning: "DEV review/test data is being served because no Objects have assigned sprite/vector/asset metadata.",
    };
  }

  function listHitboxes(objectKeyValue = "", gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    const targetObjectKey = normalizeText(objectKeyValue);
    return (tables.hitbox_definition_records || [])
      .filter((record) => recordGameId(record) === targetGameId)
      .filter((record) => normalizeText(record.objectKey) === targetObjectKey)
      .sort((left, right) => (
        (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
          || normalizeText(left.name).localeCompare(normalizeText(right.name))
      ))
      .map(hitboxFromRecord);
  }

  function saveHitboxes(objectKeyValue = "", hitboxes = [], gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    const targetObjectKey = normalizeText(objectKeyValue);
    if (!targetObjectKey) {
      return {
        error: true,
        message: "Hitbox save requires an Object key.",
      };
    }

    const now = timestamp();
    const userKey = activeUserKey();
    const existingByKey = new Map(
      (tables.hitbox_definition_records || [])
        .filter((record) => recordGameId(record) === targetGameId)
        .filter((record) => normalizeText(record.objectKey) === targetObjectKey)
        .map((record) => [normalizeText(record.key), record]),
    );
    const nextRecords = (Array.isArray(hitboxes) ? hitboxes : []).map((hitbox, index) => {
      const normalized = normalizeHitboxInput(hitbox, index);
      const incomingKey = normalizeText(hitbox.key);
      const previous = incomingKey && existingByKey.get(incomingKey);
      return {
        ...normalized,
        createdAt: previous?.createdAt || now,
        createdBy: previous?.createdBy || userKey,
        gameId: targetGameId,
        key: previous?.key || makeUlid(),
        objectKey: targetObjectKey,
        recordOrder: index + 1,
        updatedAt: now,
        updatedBy: userKey,
      };
    });

    tables.hitbox_definition_records = [
      ...(tables.hitbox_definition_records || []).filter((record) => (
        recordGameId(record) !== targetGameId || normalizeText(record.objectKey) !== targetObjectKey
      )),
      ...nextRecords,
    ];
    persistTables();

    return {
      hitboxes: listHitboxes(targetObjectKey, targetGameId),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function resetHitboxes(objectKeyValue = "", gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    const targetObjectKey = normalizeText(objectKeyValue);
    tables.hitbox_definition_records = (tables.hitbox_definition_records || []).filter((record) => (
      recordGameId(record) !== targetGameId || normalizeText(record.objectKey) !== targetObjectKey
    ));
    persistTables();
    return {
      hitboxes: [],
      reset: true,
      snapshot: getSnapshot(),
    };
  }

  function getTables() {
    return normalizeMockDbTables(HITBOXES_DB_OWNER, cloneTables(tables), options);
  }

  function getSnapshot() {
    const normalizedTables = getTables();
    return {
      hitboxes: normalizedTables.hitbox_definition_records.map(hitboxFromRecord),
      sourceObjects: listSourceObjects().objects,
      tables: normalizedTables,
    };
  }

  return {
    DEV_SAMPLE_OBJECTS,
    HITBOXES_TOOL_TABLES,
    getSnapshot,
    getTables,
    listHitboxes,
    listSourceObjects,
    resetHitboxes,
    saveHitboxes,
  };
}
