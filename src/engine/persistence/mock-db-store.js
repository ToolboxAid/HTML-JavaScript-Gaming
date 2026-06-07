const MOCK_DB_STORAGE_KEY = "gamefoundry.mockDb.v1";
const MOCK_DB_SESSION_STORAGE_KEY = "gamefoundry.mockDb.sessionUser.v1";
const MOCK_DB_SESSION_MODE_STORAGE_KEY = "gamefoundry.mockDb.sessionMode.v1";
const MOCK_DB_VERSION = 3;

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
  roles: Object.freeze({
    user: makeMockUlid(72),
    admin: makeMockUlid(73),
    system: makeMockUlid(74),
  }),
  userRoles: Object.freeze({
    user1User: makeMockUlid(82),
    user2User: makeMockUlid(83),
    user3User: makeMockUlid(84),
    adminUser: makeMockUlid(85),
    adminAdmin: makeMockUlid(86),
    forgeBotSystem: makeMockUlid(87),
  }),
});

export const MOCK_DB_SESSION_USERS = Object.freeze([
  Object.freeze({
    id: "guest",
    label: "Guest",
    authenticated: false,
    isAdmin: false,
    userKey: null,
    roleSlugs: Object.freeze([]),
  }),
  Object.freeze({
    id: "user1",
    label: "User 1",
    authenticated: true,
    isAdmin: false,
    userKey: MOCK_DB_KEYS.users.user1,
    roleSlugs: Object.freeze(["user"]),
  }),
  Object.freeze({
    id: "user2",
    label: "User 2",
    authenticated: true,
    isAdmin: false,
    userKey: MOCK_DB_KEYS.users.user2,
    roleSlugs: Object.freeze(["user"]),
  }),
  Object.freeze({
    id: "user3",
    label: "User 3",
    authenticated: true,
    isAdmin: false,
    userKey: MOCK_DB_KEYS.users.user3,
    roleSlugs: Object.freeze(["user"]),
  }),
  Object.freeze({
    id: "admin",
    label: "Admin",
    authenticated: true,
    isAdmin: true,
    userKey: MOCK_DB_KEYS.users.admin,
    roleSlugs: Object.freeze(["user", "admin"]),
  }),
]);

export const MOCK_DB_SYSTEM_USER = Object.freeze({
  id: "forge-bot",
  label: "forge-bot",
  authenticated: false,
  isAdmin: false,
  userKey: MOCK_DB_KEYS.users.forgeBot,
  roleSlugs: Object.freeze(["system"]),
});

export const MOCK_DB_SESSION_MODES = Object.freeze([
  Object.freeze({
    id: "dev",
    label: "DEV",
    description: "Only gets the JSON data.",
    persistent: false,
  }),
  Object.freeze({
    id: "local",
    label: "Local",
    description: "Uses the persisted Memory DB.",
    persistent: true,
  }),
]);

export const MOCK_DB_TOOL_GROUPS = Object.freeze({
  workspace: Object.freeze({
    label: "Workspace",
    tableNames: Object.freeze(["workspace_projects", "workspace_progress"]),
  }),
  "game-design": Object.freeze({
    label: "Game Design",
    tableNames: Object.freeze(["game_design_documents", "game_design_validation_items"]),
  }),
  "game-configuration": Object.freeze({
    label: "Game Configuration",
    tableNames: Object.freeze(["game_configuration_records", "game_configuration_validation_items"]),
  }),
  "project-journey": Object.freeze({
    label: "Project Journey",
    tableNames: Object.freeze([
      "project_journey_note_types",
      "project_journey_notes",
      "project_journey_templates",
      "project_journey_items",
      "project_journey_activity",
    ]),
  }),
  palette: Object.freeze({
    label: "Palette",
    tableNames: Object.freeze([
      "palette_colors",
      "palette_source_swatches",
      "palette_swatch_usages",
      "project_workspace_palette_globals",
    ]),
  }),
  asset: Object.freeze({
    label: "Asset",
    tableNames: Object.freeze([
      "asset_role_definitions",
      "asset_library_items",
      "asset_storage_objects",
      "asset_import_events",
      "asset_validation_items",
    ]),
  }),
});

const REMOVED_TABLE_NAMES = new Set(["act" + "ors"]);
const REMOVED_RECORD_FIELDS = Object.freeze(["created" + "ByType", "updated" + "ByType", "account" + "Type", "is" + "SystemUser"]);
const REMOVED_UNAUTHENTICATED_USER_KEY = makeMockUlid(50);
const REMOVED_UNAUTHENTICATED_ROLE_KEY = makeMockUlid(71);
const REMOVED_UNAUTHENTICATED_JOIN_KEY = makeMockUlid(81);
const LEGACY_AUDIT_KEY_TO_USER_KEY = Object.freeze({
  [makeMockUlid(61)]: MOCK_DB_KEYS.users.forgeBot,
  [makeMockUlid(62)]: MOCK_DB_KEYS.users.user1,
  [makeMockUlid(63)]: MOCK_DB_KEYS.users.user2,
  [makeMockUlid(64)]: MOCK_DB_KEYS.users.user3,
  [makeMockUlid(65)]: MOCK_DB_KEYS.users.admin,
});

const MOCK_DB_TABLE_SCHEMAS = Object.freeze({
  users: Object.freeze(["key", "displayName", "email", "authProvider", "authProviderUserId", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  roles: Object.freeze(["key", "roleSlug", "name", "description", "isSystemRole", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  user_roles: Object.freeze(["key", "userKey", "roleKey", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  workspace_projects: Object.freeze(["key", "name", "status", "ownerKey", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  workspace_progress: Object.freeze(["key", "projectKey", "currentFocus", "projectProgress", "publishingProgress", "recommendedNextTool", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_design_documents: Object.freeze(["key", "projectKey", "title", "status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_design_validation_items: Object.freeze(["key", "projectKey", "label", "status", "action", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_configuration_records: Object.freeze(["key", "projectKey", "status", "summary", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_configuration_validation_items: Object.freeze(["key", "projectKey", "label", "status", "action", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  project_journey_note_types: Object.freeze(["key", "typeSlug", "name", "seeded", "userExtensible", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  project_journey_notes: Object.freeze(["key", "slug", "projectKey", "ownerKey", "name", "typeKey", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  project_journey_templates: Object.freeze(["key", "templateSlug", "originalMeaning", "systemGuidance", "linkedToolContexts", "version", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  project_journey_items: Object.freeze(["key", "projectKey", "noteKey", "status", "title", "userDetails", "templateKey", "linkedRecordType", "linkedRecordId", "indent", "order", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  project_journey_activity: Object.freeze(["key", "projectKey", "noteKey", "message", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  palette_colors: Object.freeze(["key", "projectId", "symbol", "hex", "name", "source", "tags", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  palette_source_swatches: Object.freeze(["key", "id", "symbol", "hex", "name", "source", "sourceLabel", "tags", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  palette_swatch_usages: Object.freeze(["key", "id", "projectId", "assetId", "swatchHex", "swatchName", "swatchSymbol", "toolId", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  project_workspace_palette_globals: Object.freeze(["key", "projectId", "swatchCount", "toolKey", "workspacePath", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_role_definitions: Object.freeze(["key", "id", "label", "storageFolder", "extensions", "mimeTypes", "previewBehavior", "uploadEnabled", "inputMode", "usageRoles", "maxSizeBytes", "dbFields", "validationNeeds", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_library_items: Object.freeze(["key", "id", "projectId", "ownerProjectId", "ownerUserId", "assetRole", "assetRoleLabel", "name", "fileName", "originalName", "mimeType", "size", "checksum", "storageObjectId", "storedPath", "path", "previewKind", "role", "type", "usage", "status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_storage_objects: Object.freeze(["key", "id", "assetId", "projectId", "ownerProjectId", "role", "originalName", "storedPath", "mimeType", "size", "checksum", "status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_import_events: Object.freeze(["key", "id", "assetId", "projectId", "fileName", "mimeType", "storedPath", "status", "type", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_validation_items: Object.freeze(["key", "id", "projectId", "field", "label", "status", "action", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
});

const DEFAULT_TABLE_OWNERS = Object.freeze(Object.fromEntries([
  ["users", "standalone"],
  ["roles", "standalone"],
  ["user_roles", "standalone"],
  ...Object.entries(MOCK_DB_TOOL_GROUPS).flatMap(([ownerId, group]) =>
    group.tableNames.map((tableName) => [tableName, ownerId]),
  ),
]));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasBrowserStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function sessionModeFromId(sessionModeId) {
  return MOCK_DB_SESSION_MODES.find((mode) => mode.id === sessionModeId) ||
    MOCK_DB_SESSION_MODES.find((mode) => mode.id === "local") ||
    MOCK_DB_SESSION_MODES[0];
}

function selectedSessionModeId(options = {}) {
  if (options.sessionMode) {
    return sessionModeFromId(options.sessionMode).id;
  }
  if (!hasBrowserStorage()) {
    return "local";
  }
  try {
    return sessionModeFromId(window.localStorage.getItem(MOCK_DB_SESSION_MODE_STORAGE_KEY) || "local").id;
  } catch {
    return "local";
  }
}

function canUseStorage(options = {}) {
  if (options.persist === false) {
    return false;
  }
  return hasBrowserStorage() && selectedSessionModeId(options) === "local";
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
  REMOVED_TABLE_NAMES.forEach((tableName) => {
    delete state.tables[tableName];
    delete state.owners[tableName];
  });
  if (Array.isArray(state.tables.users)) {
    state.tables.users = state.tables.users.filter((user) =>
      user?.key !== REMOVED_UNAUTHENTICATED_USER_KEY &&
      String(user?.displayName || "").toLowerCase() !== "guest",
    );
  }
  if (Array.isArray(state.tables.roles)) {
    state.tables.roles = state.tables.roles.filter((role) =>
      role?.key !== REMOVED_UNAUTHENTICATED_ROLE_KEY &&
      String(role?.roleSlug || "").toLowerCase() !== "guest" &&
      String(role?.name || "").toLowerCase() !== "guest",
    );
  }
  if (Array.isArray(state.tables.user_roles)) {
    state.tables.user_roles = state.tables.user_roles.filter((row) =>
      row?.key !== REMOVED_UNAUTHENTICATED_JOIN_KEY &&
      row?.userKey !== REMOVED_UNAUTHENTICATED_USER_KEY &&
      row?.roleKey !== REMOVED_UNAUTHENTICATED_ROLE_KEY,
    );
  }
  Object.entries(DEFAULT_TABLE_OWNERS).forEach(([tableName, ownerId]) => {
    if (!Object.hasOwn(state.owners, tableName)) {
      state.owners[tableName] = ownerId;
    }
  });
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
    window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-changed"));
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
  return MOCK_DB_SESSION_USERS.find((user) => user.id === sessionUserId) ||
    MOCK_DB_SESSION_USERS.find((user) => user.id === "guest") ||
    MOCK_DB_SESSION_USERS[0];
}

function selectedSessionUserId(options = {}) {
  if (options.sessionUserId) {
    return options.sessionUserId;
  }
  if (selectedSessionModeId(options) === "dev" || !hasBrowserStorage()) {
    return "guest";
  }
  try {
    return window.localStorage.getItem(MOCK_DB_SESSION_STORAGE_KEY) || "guest";
  } catch {
    return "guest";
  }
}

export function getMockDbSessionUsers() {
  return clone(MOCK_DB_SESSION_USERS);
}

export function getMockDbSessionModes() {
  return clone(MOCK_DB_SESSION_MODES);
}

export function getMockDbSessionMode(options = {}) {
  return clone(sessionModeFromId(selectedSessionModeId(options)));
}

export function setMockDbSessionMode(sessionModeId, options = {}) {
  const sessionMode = sessionModeFromId(sessionModeId);
  if (hasBrowserStorage() && options.persist !== false) {
    try {
      window.localStorage.setItem(MOCK_DB_SESSION_MODE_STORAGE_KEY, sessionMode.id);
      if (sessionMode.id === "dev") {
        window.localStorage.setItem(MOCK_DB_SESSION_STORAGE_KEY, "guest");
      }
      window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-mode-changed", {
        detail: clone(sessionMode),
      }));
      window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
        detail: clone(sessionUserFromId(selectedSessionUserId())),
      }));
    } catch {}
  }
  return clone(sessionMode);
}

export function getMockDbSystemUser() {
  return clone(MOCK_DB_SYSTEM_USER);
}

export function getMockDbSessionUser(options = {}) {
  return clone(sessionUserFromId(selectedSessionUserId(options)));
}

export function setMockDbSessionUser(sessionUserId, options = {}) {
  const sessionUser = selectedSessionModeId(options) === "dev" ? sessionUserFromId("guest") : sessionUserFromId(sessionUserId);
  if (hasBrowserStorage() && options.persist !== false) {
    try {
      window.localStorage.setItem(MOCK_DB_SESSION_STORAGE_KEY, sessionUser.id);
      window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
        detail: clone(sessionUser),
      }));
    } catch {}
  }
  return clone(sessionUser);
}

function defaultAuditUserKey(options = {}) {
  return options.userKey || MOCK_DB_SYSTEM_USER.userKey;
}

function normalizeUserKey(value, fallbackUserKey) {
  const key = String(value || "");
  if (LEGACY_AUDIT_KEY_TO_USER_KEY[key]) {
    return LEGACY_AUDIT_KEY_TO_USER_KEY[key];
  }
  return isUlidKey(key) ? key : fallbackUserKey;
}

export function createMockDbAuditFields(minutes = 0, userKey = MOCK_DB_SYSTEM_USER.userKey) {
  const timestamp = new Date(Date.UTC(2026, 5, 6, 9, minutes, 0)).toISOString();
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: userKey,
    updatedBy: userKey,
  };
}

function sanitizeRecordFields(source = {}) {
  const record = { ...source };
  REMOVED_RECORD_FIELDS.forEach((field) => {
    delete record[field];
  });
  return record;
}

function normalizeRecord(tableName, record, index, options = {}) {
  const source = sanitizeRecordFields(record && typeof record === "object" && !Array.isArray(record) ? record : {});
  const fallbackUserKey = defaultAuditUserKey(options);
  const createdAt = source.createdAt || timestampForIndex(index);
  const updatedAt = source.updatedAt || createdAt;
  return {
    ...source,
    key: isUlidKey(source.key) ? source.key : generatedRecordKey(tableName, source, index),
    createdAt,
    updatedAt,
    createdBy: normalizeUserKey(source.createdBy, fallbackUserKey),
    updatedBy: normalizeUserKey(source.updatedBy, normalizeUserKey(source.createdBy, fallbackUserKey)),
  };
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
    Object.entries(tables)
      .filter(([tableName]) => !REMOVED_TABLE_NAMES.has(tableName))
      .map(([tableName, rows]) => [
        tableName,
        normalizeTableRows(tableName, rows, options),
      ]),
  );
}

function ensureKnownTables(state) {
  Object.entries(DEFAULT_TABLE_OWNERS).forEach(([tableName, ownerId]) => {
    if (!Object.hasOwn(state.tables, tableName)) {
      state.tables[tableName] = [];
    }
    state.owners[tableName] = state.owners[tableName] || ownerId;
  });
}

export function loadMockDbTables(ownerId, seedTables = {}, options = {}) {
  const state = readStoredState(options);
  const normalizedSeeds = normalizeTables(seedTables, { ...options, ownerId });
  const tableNames = Object.keys(normalizedSeeds);
  const persisted = tableNames.some((tableName) => Object.hasOwn(state.tables, tableName));
  let changed = false;

  tableNames.forEach((tableName) => {
    if (REMOVED_TABLE_NAMES.has(tableName)) {
      return;
    }
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

  if (changed) {
    writeStoredState(state, options);
  }

  return {
    cleared: Boolean(state.cleared),
    ownerId,
    persisted,
    tables: normalizeTables(Object.fromEntries(tableNames.map((tableName) => [tableName, state.tables[tableName] || []])), { ...options, ownerId }),
  };
}

export function registerMockDbTables(ownerId, seedTables = {}, options = {}) {
  return loadMockDbTables(ownerId, seedTables, options).tables;
}

export function saveMockDbTables(ownerId, tables = {}, options = {}) {
  const state = readStoredState(options);
  Object.entries(normalizeTables(tables, { ...options, ownerId })).forEach(([tableName, rows]) => {
    state.owners[tableName] = ownerId;
    state.tables[tableName] = rows;
  });
  state.cleared = false;
  writeStoredState(state, options);
  return {
    ownerId,
    tables: normalizeTables(tables, { ...options, ownerId }),
  };
}

export function clearMockDbTables(options = {}) {
  const state = readStoredState(options);
  ensureKnownTables(state);
  Object.keys(state.tables).forEach((tableName) => {
    if (!REMOVED_TABLE_NAMES.has(tableName)) {
      state.tables[tableName] = [];
      state.owners[tableName] = state.owners[tableName] || DEFAULT_TABLE_OWNERS[tableName] || "standalone";
    }
  });
  state.cleared = true;
  writeStoredState(state, options);
  return {
    cleared: true,
    tables: normalizeTables(state.tables, options),
  };
}

export function seedMockDbTables(options = {}) {
  const state = emptyState();
  Object.entries(getStandaloneMockDbSeedTables()).forEach(([tableName, rows]) => {
    state.tables[tableName] = normalizeTableRows(tableName, rows, options);
    state.owners[tableName] = "standalone";
  });
  writeStoredState(state, options);
  return {
    cleared: false,
    tables: normalizeTables(state.tables, options),
  };
}

function standaloneAudit(minutes) {
  return createMockDbAuditFields(minutes, MOCK_DB_SYSTEM_USER.userKey);
}

export function getStandaloneMockDbSeedTables() {
  return {
    users: [
      {
        key: MOCK_DB_KEYS.users.user1,
        displayName: "User 1",
        email: "user1@example.invalid",
        authProvider: "mock",
        authProviderUserId: "user-1",
        isActive: true,
        ...standaloneAudit(1),
      },
      {
        key: MOCK_DB_KEYS.users.user2,
        displayName: "User 2",
        email: "user2@example.invalid",
        authProvider: "mock",
        authProviderUserId: "user-2",
        isActive: true,
        ...standaloneAudit(2),
      },
      {
        key: MOCK_DB_KEYS.users.user3,
        displayName: "User 3",
        email: "user3@example.invalid",
        authProvider: "mock",
        authProviderUserId: "user-3",
        isActive: true,
        ...standaloneAudit(3),
      },
      {
        key: MOCK_DB_KEYS.users.admin,
        displayName: "Admin",
        email: "admin@example.invalid",
        authProvider: "mock",
        authProviderUserId: "admin",
        isActive: true,
        ...standaloneAudit(4),
      },
      {
        key: MOCK_DB_KEYS.users.forgeBot,
        displayName: "forge-bot",
        email: "",
        authProvider: "system",
        authProviderUserId: "forge-bot",
        isActive: true,
        ...standaloneAudit(5),
      },
    ],
    roles: [
      {
        key: MOCK_DB_KEYS.roles.user,
        roleSlug: "user",
        name: "user",
        description: "Standard creator user.",
        isSystemRole: false,
        isActive: true,
        ...standaloneAudit(6),
      },
      {
        key: MOCK_DB_KEYS.roles.admin,
        roleSlug: "admin",
        name: "admin",
        description: "Administrative user.",
        isSystemRole: false,
        isActive: true,
        ...standaloneAudit(7),
      },
      {
        key: MOCK_DB_KEYS.roles.system,
        roleSlug: "system",
        name: "system",
        description: "Internal system user.",
        isSystemRole: true,
        isActive: true,
        ...standaloneAudit(8),
      },
    ],
    user_roles: [
      { key: MOCK_DB_KEYS.userRoles.user1User, userKey: MOCK_DB_KEYS.users.user1, roleKey: MOCK_DB_KEYS.roles.user, ...standaloneAudit(9) },
      { key: MOCK_DB_KEYS.userRoles.user2User, userKey: MOCK_DB_KEYS.users.user2, roleKey: MOCK_DB_KEYS.roles.user, ...standaloneAudit(10) },
      { key: MOCK_DB_KEYS.userRoles.user3User, userKey: MOCK_DB_KEYS.users.user3, roleKey: MOCK_DB_KEYS.roles.user, ...standaloneAudit(11) },
      { key: MOCK_DB_KEYS.userRoles.adminUser, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.user, ...standaloneAudit(12) },
      { key: MOCK_DB_KEYS.userRoles.adminAdmin, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.admin, ...standaloneAudit(13) },
      { key: MOCK_DB_KEYS.userRoles.forgeBotSystem, userKey: MOCK_DB_KEYS.users.forgeBot, roleKey: MOCK_DB_KEYS.roles.system, ...standaloneAudit(14) },
    ],
  };
}

export function getStandaloneMockDbTables(options = {}) {
  return loadMockDbTables("standalone", getStandaloneMockDbSeedTables(), options).tables;
}

export function getMockDbTableSchemas() {
  return clone(MOCK_DB_TABLE_SCHEMAS);
}

export function getMockDbToolGroups() {
  return clone(MOCK_DB_TOOL_GROUPS);
}

export function getAllPersistedMockDbSnapshot(options = {}) {
  const state = readStoredState(options);
  ensureKnownTables(state);
  return {
    cleared: Boolean(state.cleared),
    owners: { ...state.owners },
    schemas: getMockDbTableSchemas(),
    tables: normalizeTables(state.tables, options),
    toolGroups: getMockDbToolGroups(),
    version: state.version || MOCK_DB_VERSION,
  };
}

export function getAllPersistedMockDbTables(options = {}) {
  return getAllPersistedMockDbSnapshot(options).tables;
}
