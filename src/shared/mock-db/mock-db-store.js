const MOCK_DB_STORAGE_KEY = "gamefoundry.mockDb.v1";
const MOCK_DB_VERSION = 1;

function makeMockUlid(sequence) {
  return `01K2GFSJ0Y${String(sequence).padStart(16, "0")}`;
}

export const MOCK_DB_KEYS = Object.freeze({
  users: Object.freeze({
    forgeBot: makeMockUlid(41),
    designer: makeMockUlid(51),
    producer: makeMockUlid(52),
  }),
  actors: Object.freeze({
    forgeBot: makeMockUlid(61),
    designer: makeMockUlid(62),
    producer: makeMockUlid(63),
  }),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canUseStorage(options = {}) {
  if (options.persist === false) {
    return false;
  }
  if (options.persist === true) {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  }
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function mockDbPersistenceEnabled(options = {}) {
  return canUseStorage(options);
}

function emptyState() {
  return {
    tables: {},
    version: MOCK_DB_VERSION,
  };
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
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.tables || typeof parsed.tables !== "object") {
      return emptyState();
    }
    return {
      tables: parsed.tables,
      version: parsed.version || MOCK_DB_VERSION,
    };
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
      tables: state.tables || {},
      version: state.version || MOCK_DB_VERSION,
    }));
  } catch {}
}

function normalizeTables(tables = {}) {
  return Object.fromEntries(
    Object.entries(tables).map(([tableName, rows]) => [
      tableName,
      Array.isArray(rows) ? clone(rows) : [],
    ]),
  );
}

export function loadMockDbTables(ownerId, seedTables = {}, options = {}) {
  const state = readStoredState(options);
  const normalizedSeeds = normalizeTables(seedTables);
  const tableNames = Object.keys(normalizedSeeds);
  const persisted = tableNames.some((tableName) => Object.hasOwn(state.tables, tableName));
  let changed = false;

  tableNames.forEach((tableName) => {
    if (!Object.hasOwn(state.tables, tableName) || !Array.isArray(state.tables[tableName])) {
      state.tables[tableName] = clone(normalizedSeeds[tableName]);
      changed = true;
    }
  });

  if (changed) {
    writeStoredState(state, options);
  }

  return {
    ownerId,
    persisted,
    tables: normalizeTables(Object.fromEntries(tableNames.map((tableName) => [tableName, state.tables[tableName]]))),
  };
}

export function saveMockDbTables(ownerId, tables = {}, options = {}) {
  const state = readStoredState(options);
  Object.entries(normalizeTables(tables)).forEach(([tableName, rows]) => {
    state.tables[tableName] = rows;
  });
  writeStoredState(state, options);
  return {
    ownerId,
    tables: normalizeTables(tables),
  };
}

function auditFields(minutes, byType = "system") {
  const timestamp = new Date(Date.UTC(2026, 5, 6, 9, minutes, 0)).toISOString();
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdByType: byType,
    updatedByType: byType,
  };
}

export function getStandaloneMockDbSeedTables() {
  return {
    actors: [
      {
        key: MOCK_DB_KEYS.actors.forgeBot,
        actorType: "system",
        displayName: "forge-bot",
        userKey: MOCK_DB_KEYS.users.forgeBot,
        ...auditFields(1),
      },
      {
        key: MOCK_DB_KEYS.actors.designer,
        actorType: "user",
        displayName: "Designer",
        userKey: MOCK_DB_KEYS.users.designer,
        ...auditFields(2),
      },
      {
        key: MOCK_DB_KEYS.actors.producer,
        actorType: "user",
        displayName: "Producer",
        userKey: MOCK_DB_KEYS.users.producer,
        ...auditFields(3),
      },
    ],
    users: [
      {
        key: MOCK_DB_KEYS.users.forgeBot,
        accountType: "system",
        displayName: "forge-bot",
        status: "active",
        ...auditFields(1),
      },
      {
        key: MOCK_DB_KEYS.users.designer,
        accountType: "user",
        displayName: "Designer",
        status: "active",
        ...auditFields(2),
      },
      {
        key: MOCK_DB_KEYS.users.producer,
        accountType: "user",
        displayName: "Producer",
        status: "active",
        ...auditFields(3),
      },
    ],
  };
}

export function getStandaloneMockDbTables(options = {}) {
  return loadMockDbTables("standalone", getStandaloneMockDbSeedTables(), options).tables;
}

export function getAllPersistedMockDbTables(options = {}) {
  const state = readStoredState(options);
  return normalizeTables(state.tables);
}
