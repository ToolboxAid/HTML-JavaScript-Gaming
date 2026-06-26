import { SEED_DB_KEYS, makeSeedUlid } from "../seed/seed-db-keys.mjs";

const MOCK_DB_STORAGE_KEY = "gamefoundry.mockDb.v1";
const MOCK_DB_SESSION_STORAGE_KEY = "gamefoundry.mockDb.sessionUser.v1";
const MOCK_DB_SESSION_MODE_STORAGE_KEY = "gamefoundry.mockDb.sessionMode.v1";
const MOCK_DB_VERSION = 3;

const makeMockUlid = makeSeedUlid;

export const MOCK_DB_KEYS = SEED_DB_KEYS;

export const MOCK_DB_SYSTEM_USER = Object.freeze({
  id: "davidq",
  label: "DavidQ",
  authenticated: false,
  isAdmin: false,
  userKey: MOCK_DB_KEYS.users.forgeBot,
  roleSlugs: Object.freeze(["creator"]),
});

export const MOCK_DB_SESSION_MODES = Object.freeze([
  Object.freeze({
    adapterId: "local-db",
    adapterName: "LocalDbAdapter",
    configured: true,
    description: "Uses the Local DB adapter behind the server API boundary.",
    environment: "Local DB",
    id: "local-db",
    label: "Local DB",
    persistence: "Local DB",
    persistent: true,
    usersEnabled: true,
  }),
]);

export const MOCK_DB_TOOL_GROUPS = Object.freeze({
  "game-hub": Object.freeze({
    label: "Game Hub",
    tableNames: Object.freeze(["game_workspace_games", "game_workspace_progress"]),
  }),
  "game-design": Object.freeze({
    label: "Game Design",
    tableNames: Object.freeze(["game_design_documents", "game_design_validation_items"]),
  }),
  "game-configuration": Object.freeze({
    label: "Game Configuration",
    tableNames: Object.freeze(["game_configuration_records", "game_configuration_validation_items"]),
  }),
  objects: Object.freeze({
    label: "Objects",
    tableNames: Object.freeze(["object_definition_records"]),
  }),
  hitboxes: Object.freeze({
    label: "Hitboxes",
    tableNames: Object.freeze(["hitbox_definition_records"]),
  }),
  controls: Object.freeze({
    label: "Controls",
    tableNames: Object.freeze(["game_input_mappings", "player_controller_profiles", "player_input_device_selections", "input_custom_action_records"]),
  }),
  "game-journey": Object.freeze({
    label: "Game Journey",
    tableNames: Object.freeze([
      "game_journey_completion_metrics",
      "game_journey_note_types",
      "game_journey_notes",
      "game_journey_templates",
      "game_journey_items",
      "game_journey_activity",
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
  tags: Object.freeze({
    label: "Tags",
    tableNames: Object.freeze(["workspace_tag_records"]),
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

const MOCK_DB_TABLE_SCHEMAS = Object.freeze({
  users: Object.freeze(["key", "displayName", "email", "authProvider", "authProviderUserId", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  roles: Object.freeze(["key", "roleSlug", "name", "description", "isSystemRole", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  user_roles: Object.freeze(["key", "userKey", "roleKey", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  invitations: Object.freeze(["key", "email", "recipientName", "relationshipNote", "personalMessage", "inviteSource", "invitationCode", "planKey", "status", "invitedBy", "expiresAt", "acceptedBy", "acceptedAt", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  membership_plans: Object.freeze(["key", "code", "displayName", "monthlyPriceCents", "currency", "billingInterval", "isPublic", "requiresInvitation", "isFounding", "basePlanCode", "revenueShareBps", "purchasedCreditBonusBps", "foundingMemberLimit", "active", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  membership_limits: Object.freeze(["key", "planKey", "storageMb", "monthlyAiCredits", "publishExperienceLimit", "maxTeamMembers", "collaborationEnabled", "marketplaceBrowseEnabled", "marketplaceBuyEnabled", "marketplaceFreeDownloadEnabled", "marketplaceSellEnabled", "analyticsTier", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  founding_members: Object.freeze(["key", "userKey", "planKey", "sequenceNumber", "lockedMonthlyPriceCents", "active", "assignedAt", "endedAt", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  user_memberships: Object.freeze(["key", "userKey", "planKey", "status", "source", "startedAt", "renewsAt", "canceledAt", "endedAt", "invitationKey", "foundingMemberKey", "externalSubscriptionId", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  ai_actions: Object.freeze(["key", "code", "displayName", "creditCost", "active", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  ai_credit_packs: Object.freeze(["key", "code", "displayName", "credits", "priceCents", "currency", "active", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  user_ai_credits: Object.freeze(["key", "userKey", "includedBalance", "purchasedBalance", "bonusBalance", "periodStart", "periodEnd", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  ai_usage_log: Object.freeze(["key", "userKey", "actionKey", "creditDelta", "sourceType", "sourceKey", "balanceAfter", "createdAt", "createdBy"]),
  project_members: Object.freeze(["key", "projectKey", "userKey", "role", "status", "invitedBy", "invitedAt", "joinedAt", "removedAt", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  legal_documents: Object.freeze(["key", "documentType", "slug", "title", "status", "publishedVersionKey", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  legal_document_versions: Object.freeze(["key", "documentKey", "version", "bodyMarkdown", "effectiveAt", "publishedAt", "publishedBy", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  marketplace_categories: Object.freeze(["key", "code", "displayName", "active", "sortName", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  toolbox_tool_metadata: Object.freeze(["key", "toolKey", "toolName", "shortLabel", "shortDescription", "description", "group", "category", "colorGroup", "toolboxGroup", "subgroup", "path", "order", "status", "badge", "toolImage", "active", "adminOnly", "hidden", "deferred", "visibleInToolsList", "capabilityLabel", "childCapabilities", "requiredRole", "statusDiagnostic", "toolId", "releaseChannel", "releaseChannelLabel", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  toolbox_tool_planning: Object.freeze(["key", "toolKey", "readiness", "requiredForPlayable", "requiredForTestable", "requiredForPublish", "requires", "progressChecklist", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  toolbox_votes: Object.freeze(["key", "toolId", "userKey", "direction", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  platform_settings: Object.freeze(["key", "settingKey", "settingValue", "settingType", "description", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  support_categories: Object.freeze(["key", "categorySlug", "name", "description", "isActive", "sortOrder", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_workspace_games: Object.freeze(["key", "name", "status", "ownerKey", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_workspace_progress: Object.freeze(["key", "gameKey", "currentFocus", "gameProgress", "publishingProgress", "recommendedNextTool", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_design_documents: Object.freeze(["key", "gameKey", "title", "status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_design_validation_items: Object.freeze(["key", "gameKey", "label", "status", "action", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_configuration_records: Object.freeze(["key", "gameKey", "status", "summary", "playerMode", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_configuration_validation_items: Object.freeze(["key", "gameKey", "label", "status", "action", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  object_definition_records: Object.freeze(["key", "id", "gameId", "name", "type", "state", "modelType", "renderType", "renderAssetKey", "renderPreviewPath", "capabilities", "behavior", "interaction", "recordOrder", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  hitbox_definition_records: Object.freeze(["key", "gameId", "objectKey", "name", "role", "enabled", "visible", "x", "y", "width", "height", "recordOrder", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_input_mappings: Object.freeze(["key", "id", "gameId", "objectKey", "objectName", "gameAction", "gameActionLabel", "usageLabel", "normalizedInput", "inputFamily", "eventD", "eventH", "eventU", "eventDC", "eventDrag", "eventAxis", "enabled", "state", "recordOrder", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  player_controller_profiles: Object.freeze(["key", "id", "playerId", "deviceType", "controllerName", "controllerId", "profileName", "inputs", "inputMappings", "recordOrder", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  player_input_device_selections: Object.freeze(["key", "id", "playerId", "selectionKey", "selectionType", "deviceType", "controllerId", "profileId", "label", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  input_custom_action_records: Object.freeze(["key", "id", "gameId", "label", "recordOrder", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_journey_note_types: Object.freeze(["key", "typeSlug", "name", "seeded", "userExtensible", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_journey_completion_metrics: Object.freeze(["key", "bucketKey", "bucketOrder", "bucketName", "friendlyDescription", "requiredForMvp", "canSkip", "plannedCount", "completedCount", "active", "status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_journey_notes: Object.freeze(["key", "slug", "gameKey", "ownerKey", "name", "typeKey", "bucketOrder", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_journey_templates: Object.freeze(["key", "templateSlug", "originalMeaning", "systemGuidance", "linkedToolContexts", "version", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_journey_items: Object.freeze(["key", "gameKey", "noteKey", "status", "title", "userDetails", "templateKey", "linkedRecordType", "linkedRecordId", "indent", "order", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  game_journey_activity: Object.freeze(["key", "gameKey", "noteKey", "message", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  palette_colors: Object.freeze(["key", "gameId", "swatchKey", "hex", "name", "source", "tags", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  palette_source_swatches: Object.freeze(["key", "id", "swatchKey", "hex", "name", "source", "sourceLabel", "tags", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  palette_swatch_usages: Object.freeze(["key", "id", "gameId", "assetId", "swatchHex", "swatchName", "swatchKey", "toolId", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  project_workspace_palette_globals: Object.freeze(["key", "gameId", "swatchCount", "toolKey", "workspacePath", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  workspace_tag_records: Object.freeze(["key", "id", "gameId", "name", "description", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_role_definitions: Object.freeze(["key", "id", "label", "storageFolder", "extensions", "mimeTypes", "previewBehavior", "uploadEnabled", "inputMode", "usageRoles", "maxSizeBytes", "dbFields", "validationNeeds", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_library_items: Object.freeze(["key", "id", "gameId", "ownerProjectId", "ownerUserId", "assetRole", "assetRoleLabel", "assetType", "description", "tagKeys", "name", "source", "reference", "fileName", "originalName", "mimeType", "size", "checksum", "storageObjectId", "storedPath", "path", "previewKind", "role", "type", "usage", "status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_storage_objects: Object.freeze(["key", "id", "assetId", "gameId", "ownerProjectId", "role", "originalName", "storedPath", "mimeType", "size", "checksum", "status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_import_events: Object.freeze(["key", "id", "assetId", "gameId", "fileName", "mimeType", "storedPath", "status", "type", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  asset_validation_items: Object.freeze(["key", "id", "gameId", "field", "label", "status", "action", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
  tool_state_samples: Object.freeze(["key", "audience", "userKey", "displayName", "toolKey", "toolName", "route", "gameKey", "toolStateKey", "manifestPath", "sampleLabel", "sampleKind", "loadablePath", "toolStatePayload", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
});

const DEFAULT_TABLE_OWNERS = Object.freeze(Object.fromEntries([
  ["users", "standalone"],
  ["roles", "standalone"],
  ["user_roles", "standalone"],
  ["invitations", "standalone"],
  ["membership_plans", "standalone"],
  ["membership_limits", "standalone"],
  ["founding_members", "standalone"],
  ["user_memberships", "standalone"],
  ["ai_actions", "standalone"],
  ["ai_credit_packs", "standalone"],
  ["user_ai_credits", "standalone"],
  ["ai_usage_log", "standalone"],
  ["project_members", "standalone"],
  ["legal_documents", "standalone"],
  ["legal_document_versions", "standalone"],
  ["marketplace_categories", "standalone"],
  ["toolbox_tool_metadata", "standalone"],
  ["toolbox_tool_planning", "standalone"],
  ["toolbox_votes", "standalone"],
  ["platform_settings", "standalone"],
  ["support_categories", "standalone"],
  ["tool_state_samples", "standalone"],
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
    MOCK_DB_SESSION_MODES.find((mode) => mode.id === "local-db") ||
    MOCK_DB_SESSION_MODES[0];
}

function requiredSessionModeFromId(sessionModeId) {
  const sessionMode = MOCK_DB_SESSION_MODES.find((mode) => mode.id === sessionModeId);
  if (!sessionMode) {
    throw new Error(`Unknown local login environment: ${sessionModeId || "missing"}.`);
  }
  return sessionMode;
}

function selectedSessionModeId(options = {}) {
  if (options.sessionMode) {
    return sessionModeFromId(options.sessionMode).id;
  }
  if (!hasBrowserStorage()) {
    return "local-db";
  }
  try {
    return sessionModeFromId(window.localStorage.getItem(MOCK_DB_SESSION_MODE_STORAGE_KEY) || "local-db").id;
  } catch {
    return "local-db";
  }
}

function canUseStorage(options = {}) {
  if (options.persist === false) {
    return false;
  }
  return false;
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
  const knownTableNames = new Set(Object.keys(MOCK_DB_TABLE_SCHEMAS));
  Object.keys(state.tables).forEach((tableName) => {
    if (!knownTableNames.has(tableName)) {
      delete state.tables[tableName];
    }
  });
  Object.keys(state.owners).forEach((tableName) => {
    if (!knownTableNames.has(tableName)) {
      delete state.owners[tableName];
    }
  });
  if (Array.isArray(state.tables.users)) {
    const allowedUserKeys = new Set([
      MOCK_DB_KEYS.users.user1,
      MOCK_DB_KEYS.users.user2,
      MOCK_DB_KEYS.users.user3,
      MOCK_DB_KEYS.users.admin,
    ]);
    state.tables.users = state.tables.users.filter((user) =>
      allowedUserKeys.has(user?.key),
    );
  }
  if (Array.isArray(state.tables.roles)) {
    state.tables.roles = state.tables.roles.filter((role) =>
      isUlidKey(role?.key),
    );
  }
  if (Array.isArray(state.tables.user_roles)) {
    const allowedJoinKeys = new Set([
      MOCK_DB_KEYS.userRoles.user1User,
      MOCK_DB_KEYS.userRoles.user2User,
      MOCK_DB_KEYS.userRoles.user3User,
      MOCK_DB_KEYS.userRoles.adminUser,
      MOCK_DB_KEYS.userRoles.adminAdmin,
      MOCK_DB_KEYS.userRoles.adminOwner,
    ]);
    const allowedUserKeys = new Set((state.tables.users || []).map((user) => user?.key));
    const allowedRoleKeys = new Set((state.tables.roles || []).map((role) => role?.key));
    state.tables.user_roles = state.tables.user_roles.filter((row) =>
      allowedJoinKeys.has(row?.key) &&
        allowedUserKeys.has(row?.userKey) &&
        allowedRoleKeys.has(row?.roleKey),
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

function stateFromExplicitTables(options = {}) {
  if (!options.memoryDbTables || typeof options.memoryDbTables !== "object") {
    return null;
  }
  return sanitizeState({
    cleared: Boolean(options.memoryDbCleared),
    owners: options.memoryDbOwners || {},
    tables: options.memoryDbTables,
    version: MOCK_DB_VERSION,
  });
}

function readMockDbState(options = {}) {
  return stateFromExplicitTables(options) || readStoredState(options);
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
    record?.swatchKey,
    record?.gameId,
    index,
  ].filter((part) => part !== undefined && part !== null && part !== "").join(":");
  return makeMockUlid(8_000_000_000 + hashString(stableSource));
}

function runtimeTimestampForOffset(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

function timestampForIndex(index) {
  return runtimeTimestampForOffset(index % 60);
}

function guestSessionUser() {
  return {
    authenticated: false,
    id: "guest",
    isAdmin: false,
    label: "Guest",
    roleSlugs: [],
    userKey: null,
  };
}

function roleSlugsForUserKey(state, userKey) {
  const roles = new Map((state?.tables?.roles || [])
    .filter((role) => role?.isActive !== false)
    .map((role) => [role.key, role.roleSlug || role.name]));
  return (state?.tables?.user_roles || [])
    .filter((row) => row.userKey === userKey && roles.has(row.roleKey))
    .map((row) => roles.get(row.roleKey))
    .filter(Boolean);
}

function sessionUserFromKey(userKey, options = {}) {
  const key = String(userKey || "");
  const modeId = selectedSessionModeId(options);
  if (!isUlidKey(key) || modeId !== "local-db") {
    return guestSessionUser();
  }
  const state = readMockDbState(options);
  const user = (state.tables.users || []).find((record) => record.key === key && record.isActive !== false);
  if (!user) {
    return guestSessionUser();
  }
  const roleSlugs = roleSlugsForUserKey(state, key);
  if (!roleSlugs.length || roleSlugs.includes("system")) {
    return guestSessionUser();
  }
  return {
    authenticated: true,
    id: key,
    isAdmin: roleSlugs.includes("admin"),
    label: user.displayName || key,
    roleSlugs,
    userKey: key,
  };
}

function selectedSessionUserKey(options = {}) {
  if (options.sessionUserKey) {
    return options.sessionUserKey;
  }
  if (options.userKey) {
    return options.userKey;
  }
  const modeId = selectedSessionModeId(options);
  if (modeId !== "local-db" || !hasBrowserStorage()) {
    return "";
  }
  try {
    return window.localStorage.getItem(MOCK_DB_SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function getMockDbSessionUsers(options = {}) {
  const modeId = selectedSessionModeId(options);
  if (modeId !== "local-db") {
    return [guestSessionUser()];
  }
  const state = readMockDbState(options);
  return [
    guestSessionUser(),
    ...(state.tables.users || [])
      .filter((user) => user?.isActive !== false)
      .map((user) => sessionUserFromKey(user.key, options))
      .filter((user) => user.authenticated),
  ];
}

export function getMockDbSessionModes() {
  return clone(MOCK_DB_SESSION_MODES);
}

export function getMockDbSessionMode(options = {}) {
  return clone(sessionModeFromId(selectedSessionModeId(options)));
}

export function setMockDbSessionMode(sessionModeId, options = {}) {
  const sessionMode = requiredSessionModeFromId(sessionModeId);
  if (hasBrowserStorage() && options.persist !== false) {
    try {
      window.localStorage.setItem(MOCK_DB_SESSION_MODE_STORAGE_KEY, sessionMode.id);
      window.localStorage.removeItem(MOCK_DB_SESSION_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-mode-changed", {
        detail: clone(sessionMode),
      }));
      window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
        detail: clone(getMockDbSessionUser()),
      }));
    } catch {}
  }
  return clone(sessionMode);
}

export function getMockDbSystemUser() {
  return clone(MOCK_DB_SYSTEM_USER);
}

export function getMockDbSessionUser(options = {}) {
  return clone(sessionUserFromKey(selectedSessionUserKey(options), options));
}

export function setMockDbSessionUser(userKey, options = {}) {
  const sessionUser = sessionUserFromKey(userKey, options);
  if (hasBrowserStorage() && options.persist !== false) {
    try {
      if (sessionUser.userKey) {
        window.localStorage.setItem(MOCK_DB_SESSION_STORAGE_KEY, sessionUser.userKey);
      } else {
        window.localStorage.removeItem(MOCK_DB_SESSION_STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
        detail: clone(sessionUser),
      }));
    } catch {}
  }
  return clone(sessionUser);
}

function normalizeUserKey(value, fieldName, options = {}) {
  const key = String(value || "");
  if (isUlidKey(key)) {
    return key;
  }
  throw new Error(
    `Invalid mock DB audit user key for ${options.tableName || "record"}.${fieldName}: ${key || "(empty)"}. Add explicit createdBy and updatedBy values that reference users.key.`,
  );
}

export function createMockDbAuditFields(minutes = 0, userKey) {
  const auditUserKey = normalizeUserKey(userKey, "createdBy", {
    tableName: "audit fields",
  });
  const timestamp = runtimeTimestampForOffset(minutes);
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: auditUserKey,
    updatedBy: auditUserKey,
  };
}

function sanitizeRecordFields(tableName, source = {}) {
  const fields = MOCK_DB_TABLE_SCHEMAS[tableName];
  if (!fields) {
    return { ...source };
  }
  const allowedFields = new Set(fields);
  return Object.fromEntries(
    Object.entries(source).filter(([field]) => allowedFields.has(field)),
  );
}

function normalizeRecord(tableName, record, index, options = {}) {
  const source = sanitizeRecordFields(
    tableName,
    record && typeof record === "object" && !Array.isArray(record) ? record : {},
  );
  const createdAt = source.createdAt || timestampForIndex(index);
  const updatedAt = source.updatedAt || createdAt;
  const createdBy = normalizeUserKey(source.createdBy, "createdBy", {
    ...options,
    tableName,
  });
  const updatedBy = normalizeUserKey(source.updatedBy, "updatedBy", {
    ...options,
    tableName,
  });
  return {
    ...source,
    key: isUlidKey(source.key) ? source.key : generatedRecordKey(tableName, source, index),
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
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
      .map(([tableName, rows]) => [
        tableName,
        normalizeTableRows(tableName, rows, options),
      ]),
  );
}

export function normalizeMockDbTables(ownerId, tables = {}, options = {}) {
  return normalizeTables(tables, { ...options, ownerId });
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
    state.tables[tableName] = [];
    state.owners[tableName] = state.owners[tableName] || DEFAULT_TABLE_OWNERS[tableName] || "standalone";
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
        authProvider: "supabase-auth",
        authProviderUserId: "user-1",
        isActive: true,
        ...standaloneAudit(1),
      },
      {
        key: MOCK_DB_KEYS.users.user2,
        displayName: "User 2",
        email: "user2@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "user-2",
        isActive: true,
        ...standaloneAudit(2),
      },
      {
        key: MOCK_DB_KEYS.users.user3,
        displayName: "User 3",
        email: "user3@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "user-3",
        isActive: true,
        ...standaloneAudit(3),
      },
      {
        key: MOCK_DB_KEYS.users.admin,
        displayName: "DavidQ",
        email: "qbytes.dq@gmail.com",
        authProvider: "supabase-auth",
        authProviderUserId: "davidq",
        isActive: true,
        ...standaloneAudit(5),
      },
    ],
    roles: [
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
        key: MOCK_DB_KEYS.roles.owner,
        roleSlug: "owner",
        name: "owner",
        description: "Owner account with platform-level stewardship access.",
        isSystemRole: false,
        isActive: true,
        ...standaloneAudit(8),
      },
      {
        key: MOCK_DB_KEYS.roles.creator,
        roleSlug: "creator",
        name: "creator",
        description: "Creator role for authenticated makers.",
        isSystemRole: false,
        isActive: true,
        ...standaloneAudit(9),
      },
      {
        key: MOCK_DB_KEYS.roles.guest,
        roleSlug: "guest",
        name: "guest",
        description: "Guest role for unauthenticated browsing and starter flows.",
        isSystemRole: false,
        isActive: true,
        ...standaloneAudit(10),
      },
    ],
    user_roles: [
      { key: MOCK_DB_KEYS.userRoles.user1User, userKey: MOCK_DB_KEYS.users.user1, roleKey: MOCK_DB_KEYS.roles.creator, ...standaloneAudit(10) },
      { key: MOCK_DB_KEYS.userRoles.user2User, userKey: MOCK_DB_KEYS.users.user2, roleKey: MOCK_DB_KEYS.roles.creator, ...standaloneAudit(11) },
      { key: MOCK_DB_KEYS.userRoles.user3User, userKey: MOCK_DB_KEYS.users.user3, roleKey: MOCK_DB_KEYS.roles.creator, ...standaloneAudit(13) },
      { key: MOCK_DB_KEYS.userRoles.adminUser, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.creator, ...standaloneAudit(14) },
      { key: MOCK_DB_KEYS.userRoles.adminAdmin, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.admin, ...standaloneAudit(15) },
      { key: MOCK_DB_KEYS.userRoles.adminOwner, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.owner, ...standaloneAudit(16) },
    ],
    platform_settings: [
      {
        key: makeMockUlid(111),
        settingKey: "platform.banner.enabled",
        settingValue: "false",
        settingType: "boolean",
        description: "Controls whether the platform banner renders.",
        isActive: true,
        ...standaloneAudit(18),
      },
      {
        key: makeMockUlid(112),
        settingKey: "platform.banner.message",
        settingValue: "",
        settingType: "string",
        description: "Platform banner message text.",
        isActive: true,
        ...standaloneAudit(19),
      },
      {
        key: makeMockUlid(113),
        settingKey: "platform.banner.tone",
        settingValue: "info",
        settingType: "string",
        description: "Platform banner visual tone.",
        isActive: true,
        ...standaloneAudit(20),
      },
    ],
    support_categories: [
      {
        key: makeMockUlid(120),
        categorySlug: "general-help",
        name: "General Help",
        description: "Starter support category for creator questions.",
        isActive: true,
        sortOrder: 1,
        ...standaloneAudit(17),
      },
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
