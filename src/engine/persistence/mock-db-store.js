const MOCK_DB_STORAGE_KEY = "gamefoundry.mockDb.v1";
const MOCK_DB_SESSION_STORAGE_KEY = "gamefoundry.mockDb.sessionUser.v1";
const MOCK_DB_VERSION = 2;

function makeMockUlid(sequence) {
  return `01K2GFSJ0Y${String(sequence).padStart(16, "0")}`;
}

export const MOCK_DB_KEYS = Object.freeze({
  users: Object.freeze({
    forgeBot: makeMockUlid(41),
    user1: makeMockUlid(51),
    user2: makeMockUlid(52),
    user3: makeMockUlid(53),
    admin: makeMockUlid(54),
    designer: makeMockUlid(51),
    producer: makeMockUlid(52),
  }),
  actors: Object.freeze({
    forgeBot: makeMockUlid(61),
    user1: makeMockUlid(62),
    user2: makeMockUlid(63),
    user3: makeMockUlid(64),
    admin: makeMockUlid(65),
    designer: makeMockUlid(62),
    producer: makeMockUlid(63),
  }),
});

export const MOCK_DB_SESSION_USERS = Object.freeze([
  Object.freeze({
    id: "user1",
    label: "User 1",
    accountType: "user",
    isAdmin: false,
    userKey: MOCK_DB_KEYS.users.user1,
    actorKey: MOCK_DB_KEYS.actors.user1,
  }),
  Object.freeze({
    id: "user2",
    label: "User 2",
    accountType: "user",
    isAdmin: false,
    userKey: MOCK_DB_KEYS.users.user2,
    actorKey: MOCK_DB_KEYS.actors.user2,
  }),
  Object.freeze({
    id: "user3",
    label: "User 3",
    accountType: "user",
    isAdmin: false,
    userKey: MOCK_DB_KEYS.users.user3,
    actorKey: MOCK_DB_KEYS.actors.user3,
  }),
  Object.freeze({
    id: "admin",
    label: "Admin",
    accountType: "admin",
    isAdmin: true,
    userKey: MOCK_DB_KEYS.users.admin,
    actorKey: MOCK_DB_KEYS.actors.admin,
  }),
]);

export const MOCK_DB_SYSTEM_ACTOR = Object.freeze({
  id: "forge-bot",
  label: "forge-bot",
  accountType: "system",
  isAdmin: false,
  userKey: MOCK_DB_KEYS.users.forgeBot,
  actorKey: MOCK_DB_KEYS.actors.forgeBot,
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canUseStorage(options = {}) {
  if (options.persist === false) {
    return false;
  }
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function mockDbPersistenceEnabled(options = {}) {
  return canUseStorage(options);
}

function emptyState() {
  return {
    cleared: false,
    owners: {},
    tables: {},
    version: MOCK_DB_VERSION,
  };
}

function sanitizeState(source = {}) {
  const state = emptyState();
  if (source && typeof source === "object") {
    state.cleared = Boolean(source.cleared);
    state.owners = source.owners && typeof source.owners === "object" ? { ...source.owners } : {};
    state.tables = source.tables && typeof source.tables === "object" ? { ...source.tables } : {};
    state.version = source.version || MOCK_DB_VERSION;
  }
  return state;
}

function readStoredState(options = {}) {
  if (!canUseStorage(options)) {
    return emptyState();
  }
  try {
    const raw = window.localStorage.getItem(MOCK_DB_STORAGE_KEY);
    if (!raw) {
      return emptyState();
    }
    return sanitizeState(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

function writeStoredState(state, options = {}) {
  if (!canUseStorage(options)) {
    return;
  }
  try {
    window.localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify({
      cleared: Boolean(state.cleared),
      owners: state.owners || {},
      tables: state.tables || {},
      version: MOCK_DB_VERSION,
    }));
  } catch {}
}

function isUlidKey(value) {
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(String(value || ""));
}

function hashString(value) {
  const text = String(value || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function generatedRecordKey(tableName, record, index) {
  const stableSource = [
    tableName,
    record?.id,
    record?.name,
    record?.displayName,
    record?.symbol,
    record?.projectId,
    index,
  ].filter((part) => part !== undefined && part !== null && part !== "").join(":");
  return makeMockUlid(8_000_000_000 + hashString(stableSource));
}

function timestampForIndex(index) {
  return new Date(Date.UTC(2026, 5, 6, 9, index % 60, 0)).toISOString();
}

function sessionUserFromId(sessionUserId) {
  return MOCK_DB_SESSION_USERS.find((user) => user.id === sessionUserId) || MOCK_DB_SESSION_USERS[0];
}

function selectedSessionUserId(options = {}) {
  if (options.sessionUserId) {
    return options.sessionUserId;
  }
  if (!canUseStorage(options)) {
    return MOCK_DB_SESSION_USERS[0].id;
  }
  try {
    return window.localStorage.getItem(MOCK_DB_SESSION_STORAGE_KEY) || MOCK_DB_SESSION_USERS[0].id;
  } catch {
    return MOCK_DB_SESSION_USERS[0].id;
  }
}

export function getMockDbSessionUsers() {
  return clone(MOCK_DB_SESSION_USERS);
}

export function getMockDbSystemActor() {
  return clone(MOCK_DB_SYSTEM_ACTOR);
}

export function getMockDbSessionUser(options = {}) {
  return clone(sessionUserFromId(selectedSessionUserId(options)));
}

export function setMockDbSessionUser(sessionUserId, options = {}) {
  const sessionUser = sessionUserFromId(sessionUserId);
  if (canUseStorage(options)) {
    try {
      window.localStorage.setItem(MOCK_DB_SESSION_STORAGE_KEY, sessionUser.id);
    } catch {}
  }
  return clone(sessionUser);
}

function actorKeyForAuditType(byType = "system", options = {}) {
  return byType === "user"
    ? sessionUserFromId(selectedSessionUserId(options)).actorKey
    : MOCK_DB_SYSTEM_ACTOR.actorKey;
}

export function createMockDbAuditFields(minutes = 0, byType = "system", options = {}) {
  const timestamp = new Date(Date.UTC(2026, 5, 6, 9, minutes, 0)).toISOString();
  const actorKey = options.actorKey || actorKeyForAuditType(byType, options);
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: actorKey,
    updatedBy: actorKey,
    createdByType: byType,
    updatedByType: byType,
  };
}

function normalizeAuditType(value, fallback = "system") {
  return value === "user" ? "user" : value === "system" ? "system" : fallback;
}

function normalizeRecord(tableName, record, index, options = {}) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const createdByType = normalizeAuditType(source.createdByType, "system");
  const updatedByType = normalizeAuditType(source.updatedByType, createdByType);
  const createdAt = source.createdAt || timestampForIndex(index);
  const updatedAt = source.updatedAt || createdAt;
  const normalized = {
    ...source,
    key: isUlidKey(source.key) ? source.key : generatedRecordKey(tableName, source, index),
    createdAt,
    updatedAt,
    createdBy: isUlidKey(source.createdBy) ? source.createdBy : actorKeyForAuditType(createdByType, options),
    updatedBy: isUlidKey(source.updatedBy) ? source.updatedBy : actorKeyForAuditType(updatedByType, options),
    createdByType,
    updatedByType,
  };
  return normalized;
}

function normalizeTableRows(tableName, rows = [], options = {}) {
  const usedKeys = new Set();
  return (Array.isArray(rows) ? rows : []).map((record, index) => {
    const normalized = normalizeRecord(tableName, record, index, options);
    let key = normalized.key;
    let offset = 0;
    while (usedKeys.has(key)) {
      offset += 1;
      key = makeMockUlid(8_500_000_000 + hashString(`${tableName}:${index}:${offset}`));
    }
    usedKeys.add(key);
    return {
      ...normalized,
      key,
    };
  });
}

function normalizeTables(tables = {}, options = {}) {
  return Object.fromEntries(
    Object.entries(tables).map(([tableName, rows]) => [
      tableName,
      normalizeTableRows(tableName, rows, options),
    ]),
  );
}

export function loadMockDbTables(ownerId, seedTables = {}, options = {}) {
  const state = readStoredState(options);
  const normalizedSeeds = normalizeTables(seedTables, { ...options, ownerId });
  const tableNames = Object.keys(normalizedSeeds);
  const persisted = tableNames.some((tableName) => Object.hasOwn(state.tables, tableName));
  let changed = false;

  tableNames.forEach((tableName) => {
    if (state.owners[tableName] !== ownerId) {
      changed = true;
    }
    state.owners[tableName] = ownerId;
    if (state.cleared) {
      if (!Object.hasOwn(state.tables, tableName) || !Array.isArray(state.tables[tableName])) {
        state.tables[tableName] = [];
        changed = true;
      }
      return;
    }
    if (!Object.hasOwn(state.tables, tableName) || !Array.isArray(state.tables[tableName])) {
      state.tables[tableName] = clone(normalizedSeeds[tableName]);
      changed = true;
      return;
    }
    const normalizedRows = normalizeTableRows(tableName, state.tables[tableName], { ...options, ownerId });
    const existingKeys = new Set(normalizedRows.map((record) => record.key));
    const missingSeedRows = normalizedSeeds[tableName].filter((record) => !existingKeys.has(record.key));
    const mergedRows = missingSeedRows.length ? [...normalizedRows, ...missingSeedRows] : normalizedRows;
    if (JSON.stringify(mergedRows) !== JSON.stringify(state.tables[tableName])) {
      state.tables[tableName] = mergedRows;
      changed = true;
    }
  });

  if (changed || tableNames.some((tableName) => state.owners[tableName] !== ownerId)) {
    writeStoredState(state, options);
  }

  return {
    cleared: Boolean(state.cleared),
    ownerId,
    persisted,
    tables: normalizeTables(Object.fromEntries(tableNames.map((tableName) => [tableName, state.tables[tableName] || []])), { ...options, ownerId }),
  };
}

export function saveMockDbTables(ownerId, tables = {}, options = {}) {
  const state = readStoredState(options);
  Object.entries(normalizeTables(tables, { ...options, ownerId })).forEach(([tableName, rows]) => {
    state.owners[tableName] = ownerId;
    state.tables[tableName] = rows;
  });
  writeStoredState(state, options);
  return {
    ownerId,
    tables: normalizeTables(tables, { ...options, ownerId }),
  };
}

export function clearMockDbTables(options = {}) {
  const state = readStoredState(options);
  Object.keys(state.tables).forEach((tableName) => {
    state.tables[tableName] = [];
  });
  state.cleared = true;
  writeStoredState(state, options);
  return {
    cleared: true,
    tables: normalizeTables(state.tables, options),
  };
}

function standaloneAudit(minutes) {
  return createMockDbAuditFields(minutes, "system", { actorKey: MOCK_DB_SYSTEM_ACTOR.actorKey });
}

export function getStandaloneMockDbSeedTables() {
  return {
    actors: [
      {
        key: MOCK_DB_KEYS.actors.forgeBot,
        actorType: "system",
        displayName: "forge-bot",
        userKey: MOCK_DB_KEYS.users.forgeBot,
        ...standaloneAudit(1),
      },
      ...MOCK_DB_SESSION_USERS.map((sessionUser, index) => ({
        key: sessionUser.actorKey,
        actorType: sessionUser.isAdmin ? "admin" : "user",
        displayName: sessionUser.label,
        userKey: sessionUser.userKey,
        ...standaloneAudit(index + 2),
      })),
    ],
    users: [
      {
        key: MOCK_DB_KEYS.users.forgeBot,
        accountType: "system",
        displayName: "forge-bot",
        status: "active",
        ...standaloneAudit(1),
      },
      ...MOCK_DB_SESSION_USERS.map((sessionUser, index) => ({
        key: sessionUser.userKey,
        accountType: sessionUser.accountType,
        displayName: sessionUser.label,
        status: "active",
        ...standaloneAudit(index + 2),
      })),
    ],
  };
}

export function getStandaloneMockDbTables(options = {}) {
  return loadMockDbTables("standalone", getStandaloneMockDbSeedTables(), options).tables;
}

export function getAllPersistedMockDbSnapshot(options = {}) {
  const state = readStoredState(options);
  return {
    cleared: Boolean(state.cleared),
    owners: { ...state.owners },
    tables: normalizeTables(state.tables, options),
    version: state.version || MOCK_DB_VERSION,
  };
}

export function getAllPersistedMockDbTables(options = {}) {
  return getAllPersistedMockDbSnapshot(options).tables;
}
