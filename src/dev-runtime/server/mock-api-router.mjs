import { mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import {
  createAssetToolMockRepository,
  pickerDiagnosticForRole,
} from "../../../toolbox/assets/assets-mock-repository.js";
import {
  TOOL_IMAGE_FALLBACK,
  TOOL_STATUS_MODEL,
  getActiveToolRegistry,
  getToolImageDiagnostics,
  getToolImageSource,
  getToolProgressReadiness,
  getToolRegistry,
  getToolRoute,
  toolRegistryMetadataDiagnostic,
} from "../../../toolbox/toolRegistry.js";
import {
  PALETTE_SOURCE_USER,
  PALETTE_TOOL_KEY,
  PALETTE_WORKSPACE_PATH,
  createProjectWorkspacePaletteRepository,
  normalizePaletteSwatchInput,
  validatePaletteSwatchInput,
} from "../../../toolbox/colors/palette-workspace-repository.js";
import {
  GAME_CONFIGURATION_SECTIONS,
  createGameConfigurationMockRepository,
} from "../../../toolbox/game-configuration/game-configuration-mock-repository.js";
import {
  GAME_DESIGN_GAME_TYPES,
  GAME_DESIGN_GENRES,
  GAME_DESIGN_PLAY_STYLES,
  createGameDesignMockRepository,
} from "../../../toolbox/game-design/game-design-mock-repository.js";
import {
  PROJECT_JOURNEY_KEYS,
  PROJECT_JOURNEY_STATUS_BY_ID,
  PROJECT_JOURNEY_STATUSES,
  createProjectJourneyMockRepository,
} from "../../../toolbox/project-journey/project-journey-mock-repository.js";
import {
  PROJECT_WORKSPACE_MEMBER_ROLES,
  PROJECT_WORKSPACE_PROJECT_PURPOSES,
  PROJECT_WORKSPACE_PROJECT_STATUSES,
  createProjectWorkspaceMockRepository,
} from "../../../toolbox/project-workspace/project-workspace-mock-repository.js";
import {
  MOCK_DB_KEYS,
  MOCK_DB_SESSION_MODES,
  getMockDbTableSchemas,
  getMockDbToolGroups,
  getStandaloneMockDbSeedTables,
  normalizeMockDbTables,
} from "../persistence/mock-db-store.js";

export const SERVER_DATA_BOUNDARY_RULE = "Browser -> Server API -> Data Source";

const LOCAL_MEM_MODE_ID = "local-mem";
const LOCAL_DB_MODE_ID = "local-db";
const LOCAL_DB_NOT_CONFIGURED = "Local DB adapter not configured";
const TOOL_ORDER = ["workspace", "game-design", "game-configuration", "project-journey", "palette", "asset"];
const IDENTITY_TABLES = ["users", "roles", "user_roles"];

const DB_ADAPTER_CONTRACT = Object.freeze({
  contract: "GameFoundryDbAdapter",
  rule: SERVER_DATA_BOUNDARY_RULE,
  environments: Object.freeze([
    Object.freeze({
      adapterId: "mock-db-memory",
      adapterName: "MockDbAdapter",
      environment: "Local Mem",
      persistence: "Memory",
      selectableOnLocalLogin: true,
      status: "configured",
    }),
    Object.freeze({
      adapterId: "local-db",
      adapterName: "LocalDbAdapter",
      environment: "Local DB",
      persistence: "Local DB",
      selectableOnLocalLogin: true,
      status: "configured",
    }),
    Object.freeze({
      adapterId: "uat-db",
      adapterName: "ServerDbAdapter",
      environment: "UAT",
      persistence: "Physical DB",
      selectableOnLocalLogin: false,
      status: "deployment-only",
    }),
    Object.freeze({
      adapterId: "prod-db",
      adapterName: "ServerDbAdapter",
      environment: "Prod",
      persistence: "Physical DB",
      selectableOnLocalLogin: false,
      status: "deployment-only",
    }),
  ]),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function serverRegistryTool(tool) {
  return {
    ...tool,
    imageDiagnostics: getToolImageDiagnostics(tool),
    imageSources: {
      badge: getToolImageSource(tool, "badge"),
      tool: getToolImageSource(tool, "tool"),
    },
    route: getToolRoute(tool),
    statusDiagnostic: toolRegistryMetadataDiagnostic(tool),
  };
}

function toolRegistrySnapshot() {
  return {
    activeTools: getActiveToolRegistry().map(serverRegistryTool),
    imageFallback: TOOL_IMAGE_FALLBACK,
    readinessByStatus: Object.fromEntries(TOOL_STATUS_MODEL.map((status) => [status, getToolProgressReadiness(status)])),
    tools: getToolRegistry().map(serverRegistryTool),
  };
}

function isUlidKey(value) {
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(String(value || ""));
}

function localDbStoragePath() {
  return process.env.GAMEFOUNDRY_LOCAL_DB_PATH ||
    path.join(process.cwd(), "tmp", "local-db", "local-db-state.sqlite");
}

function sqliteIdentifier(value) {
  const identifier = String(value || "");
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe SQLite identifier: ${identifier || "missing"}.`);
  }
  return `"${identifier}"`;
}

function serializeSqliteValue(value) {
  if (value === undefined) {
    return null;
  }
  return JSON.stringify(value);
}

function deserializeSqliteValue(value) {
  if (value === null || value === undefined) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function ok(response, data) {
  sendJson(response, 200, {
    data,
    ok: true,
    rule: SERVER_DATA_BOUNDARY_RULE,
  });
}

function fail(response, statusCode, error) {
  sendJson(response, statusCode, {
    error: error instanceof Error ? error.message : String(error || "Server API data source error."),
    ok: false,
    rule: SERVER_DATA_BOUNDARY_RULE,
  });
}

async function readRequestJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function roleSlugsForUserKey(tables, userKey) {
  const roleByKey = new Map((tables.roles || [])
    .filter((role) => role.isActive !== false)
    .map((role) => [role.key, role.roleSlug || role.name]));
  return (tables.user_roles || [])
    .filter((row) => row.userKey === userKey && roleByKey.has(row.roleKey))
    .map((row) => roleByKey.get(row.roleKey))
    .filter(Boolean);
}

function modeById(modeId) {
  return MOCK_DB_SESSION_MODES.find((mode) => mode.id === modeId) ||
    MOCK_DB_SESSION_MODES.find((mode) => mode.id === LOCAL_MEM_MODE_ID) ||
    MOCK_DB_SESSION_MODES[0];
}

function sessionModeMetadata(mode) {
  return {
    adapterId: mode.adapterId,
    adapterName: mode.adapterName,
    adapterStatus: mode.configured === false ? "not-configured" : "configured",
    environment: mode.environment || mode.label,
    mode: mode.id,
    persistence: mode.persistence || "",
  };
}

function guestSession(mode, diagnostic = "") {
  return {
    ...sessionModeMetadata(mode),
    authenticated: false,
    diagnostic,
    displayName: "Login",
    id: "guest",
    isAdmin: false,
    label: "Guest",
    roleSlugs: [],
    userKey: null,
  };
}

function sessionUserFromKey(tables, userKey, modeId) {
  const mode = modeById(modeId);
  const key = String(userKey || "");
  if (mode.id !== LOCAL_MEM_MODE_ID && mode.id !== LOCAL_DB_MODE_ID) {
    return guestSession(mode, mode.diagnostic || LOCAL_DB_NOT_CONFIGURED);
  }
  if (!isUlidKey(key)) {
    return guestSession(mode);
  }

  const user = (tables.users || []).find((record) => record.key === key && record.isActive !== false);
  if (!user) {
    return guestSession(mode, `Selected Local user key ${key} is missing from server Memory DB users.`);
  }

  const roleSlugs = roleSlugsForUserKey(tables, key);
  if (!roleSlugs.length || roleSlugs.includes("system")) {
    return guestSession(mode, `Selected Local user ${user.displayName || key} has no human login role.`);
  }

  return {
    ...sessionModeMetadata(mode),
    authenticated: true,
    diagnostic: "",
    displayName: user.displayName || key,
    id: key,
    isAdmin: roleSlugs.includes("admin"),
    label: user.displayName || key,
    roleSlugs,
    userKey: key,
  };
}

function normalizeOwnedTables(ownerId, tables) {
  return normalizeMockDbTables(ownerId, tables, {
    allowSeedAuditFallback: true,
    fallbackUserKey: MOCK_DB_KEYS.users.forgeBot,
    seedFallbackContext: `${ownerId} server data source snapshot`,
  });
}

function workspaceTables(repository) {
  const tables = repository.getTables();
  const activeProject = repository.getActiveProject();
  const progress = repository.getProjectProgress();
  const workspaceProjects = tables.projects.map((project) => ({
    key: project.id === "demo-project" ? PROJECT_JOURNEY_KEYS.project : project.id,
    name: project.name,
    ownerKey: MOCK_DB_KEYS.users.user1,
    status: project.status,
  }));
  const activeProjectKey = activeProject?.id === "demo-project" ? PROJECT_JOURNEY_KEYS.project : activeProject?.id || "";
  return normalizeOwnedTables("workspace", {
    workspace_projects: workspaceProjects,
    workspace_progress: activeProject ? [{
      key: "01K2GFSJ0Y0000000080001001",
      projectKey: activeProjectKey,
      currentFocus: progress.currentFocus,
      projectProgress: progress.projectProgress,
      publishingProgress: progress.publishingProgress,
      recommendedNextTool: progress.recommendedNextTool,
    }] : [],
  });
}

function gameDesignTables(repository) {
  const tables = repository.getTables();
  return normalizeOwnedTables("game-design", {
    game_design_documents: tables.game_design_documents || [],
    game_design_validation_items: tables.game_design_validation_items || [],
  });
}

function gameConfigurationTables(repository) {
  const tables = repository.getTables();
  return normalizeOwnedTables("game-configuration", {
    game_configuration_records: (tables.game_configuration_documents || []).map((record) => ({
      ...record,
      status: record.readinessStatus || "Ready",
      summary: [
        record.sceneTemplate,
        record.inputProfile,
        record.physicsProfile,
        record.cameraMode,
      ].filter(Boolean).join(", "),
    })),
    game_configuration_validation_items: tables.game_configuration_validation_items || [],
  });
}

function projectJourneyTables(repository) {
  return normalizeOwnedTables("project-journey", repository.getTables());
}

function paletteTables(repository) {
  return normalizeOwnedTables("palette", repository.getTables());
}

function assetTables(repository) {
  return normalizeOwnedTables("asset", repository.getTables());
}

class MockDbAdapter {
  constructor(mode) {
    this.mode = mode;
  }

  assertConfigured() {}
}

class LocalDbAdapter {
  constructor(mode) {
    this.mode = mode;
    this.storagePath = localDbStoragePath();
  }

  diagnostic(action, reason) {
    return `${LOCAL_DB_NOT_CONFIGURED}. ${action} requires server local SQLite storage at ${this.storagePath}. ${reason}`;
  }

  ensureStorage(action) {
    if (process.env.GAMEFOUNDRY_LOCAL_DB_DISABLE === "1") {
      throw new Error(this.diagnostic(action, "Storage initialization is disabled by GAMEFOUNDRY_LOCAL_DB_DISABLE."));
    }
    try {
      mkdirSync(path.dirname(this.storagePath), { recursive: true });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error || "Unable to create storage directory.");
      throw new Error(this.diagnostic(action, reason));
    }
  }

  openDatabase(action) {
    this.ensureStorage(action);
    try {
      const db = new DatabaseSync(this.storagePath);
      db.exec("PRAGMA foreign_keys = ON");
      return db;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error || "Unable to open SQLite database.");
      throw new Error(this.diagnostic(action, reason));
    }
  }

  tableColumns(db, tableName) {
    const rows = db.prepare(`PRAGMA table_info(${sqliteIdentifier(tableName)})`).all();
    return rows.map((row) => row.name);
  }

  fieldsForTable(tableName, records = []) {
    const schemas = getMockDbTableSchemas();
    const fields = [...(schemas[tableName] || [])];
    records.forEach((record) => {
      Object.keys(record || {}).forEach((field) => {
        if (!fields.includes(field)) {
          fields.push(field);
        }
      });
    });
    return fields;
  }

  ensureLogicalTable(db, tableName, records = []) {
    const fields = this.fieldsForTable(tableName, records);
    const columns = fields.map((field) => {
      const fieldSql = sqliteIdentifier(field);
      return field === "key" ? `${fieldSql} TEXT PRIMARY KEY` : `${fieldSql} TEXT`;
    });
    db.exec(`CREATE TABLE IF NOT EXISTS ${sqliteIdentifier(tableName)} (${columns.join(", ")})`);
    const existingColumns = new Set(this.tableColumns(db, tableName));
    fields.forEach((field) => {
      if (!existingColumns.has(field)) {
        db.exec(`ALTER TABLE ${sqliteIdentifier(tableName)} ADD COLUMN ${sqliteIdentifier(field)} TEXT`);
      }
    });
    return fields;
  }

  ensureSchema(db, state = {}) {
    db.exec("CREATE TABLE IF NOT EXISTS __gf_metadata (key TEXT PRIMARY KEY, value TEXT)");
    const schemas = getMockDbTableSchemas();
    Object.keys(schemas).sort().forEach((tableName) => {
      this.ensureLogicalTable(db, tableName, state.tables?.[tableName] || []);
    });
  }

  readMetadata(db, key) {
    const row = db.prepare("SELECT value FROM __gf_metadata WHERE key = ?").get(key);
    return row ? deserializeSqliteValue(row.value) : undefined;
  }

  writeMetadata(db, key, value) {
    db.prepare("INSERT OR REPLACE INTO __gf_metadata (key, value) VALUES (?, ?)").run(key, serializeSqliteValue(value));
  }

  readState(action, fallbackState) {
    let db;
    try {
      db = this.openDatabase(action);
      this.ensureSchema(db, fallbackState);
      if (this.readMetadata(db, "initialized") !== true) {
        db.close();
        db = null;
        this.writeState(action, fallbackState);
        return this.readState(action, fallbackState);
      }
      const schemas = getMockDbTableSchemas();
      const tables = {};
      Object.keys(schemas).sort().forEach((tableName) => {
        const fields = this.tableColumns(db, tableName);
        const selectableFields = fields.map(sqliteIdentifier).join(", ");
        const rows = db.prepare(`SELECT ${selectableFields} FROM ${sqliteIdentifier(tableName)} ORDER BY ${sqliteIdentifier("key")}`).all();
        tables[tableName] = rows.map((row) => {
          const record = {};
          fields.forEach((field) => {
            const value = deserializeSqliteValue(row[field]);
            if (value !== undefined) {
              record[field] = value;
            }
          });
          return record;
        });
      });
      return {
        ...clone(fallbackState || {}),
        cleared: this.readMetadata(db, "cleared") === true,
        tables,
        version: 3,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes(LOCAL_DB_NOT_CONFIGURED)) {
        throw error;
      }
      const reason = error instanceof Error ? error.message : String(error || "Unable to read SQLite state.");
      throw new Error(this.diagnostic(action, reason));
    } finally {
      if (db) {
        db.close();
      }
    }
  }

  writeState(action, state) {
    let db;
    try {
      db = this.openDatabase(action);
      this.ensureSchema(db, state);
      db.exec("BEGIN IMMEDIATE");
      try {
        const schemas = getMockDbTableSchemas();
        Object.keys(schemas).sort().forEach((tableName) => {
          const records = Array.isArray(state.tables?.[tableName]) ? state.tables[tableName] : [];
          const fields = this.ensureLogicalTable(db, tableName, records);
          db.exec(`DELETE FROM ${sqliteIdentifier(tableName)}`);
          if (!records.length) {
            return;
          }
          const fieldSql = fields.map(sqliteIdentifier).join(", ");
          const placeholders = fields.map(() => "?").join(", ");
          const insert = db.prepare(`INSERT OR REPLACE INTO ${sqliteIdentifier(tableName)} (${fieldSql}) VALUES (${placeholders})`);
          records.forEach((record) => {
            insert.run(...fields.map((field) => serializeSqliteValue(record?.[field])));
          });
        });
        this.writeMetadata(db, "cleared", Boolean(state.cleared));
        this.writeMetadata(db, "initialized", true);
        this.writeMetadata(db, "version", 3);
        db.exec("COMMIT");
      } catch (error) {
        try {
          db.exec("ROLLBACK");
        } catch {}
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes(LOCAL_DB_NOT_CONFIGURED)) {
        throw error;
      }
      const reason = error instanceof Error ? error.message : String(error || "Unable to write SQLite state.");
      throw new Error(this.diagnostic(action, reason));
    } finally {
      if (db) {
        db.close();
      }
    }
  }

  assertConfigured(action) {
    this.ensureStorage(action);
  }
}

class LocalDevMockDataSource {
  constructor() {
    this.repositoryCounter = 1;
    this.repositoryById = new Map();
    this.sessionModeId = LOCAL_MEM_MODE_ID;
    this.sessionUserKey = "";
    this.adapterByModeId = new Map(
      MOCK_DB_SESSION_MODES.map((mode) => [
        mode.id,
        mode.id === LOCAL_DB_MODE_ID ? new LocalDbAdapter(mode) : new MockDbAdapter(mode),
      ]),
    );
    this.seed({ initial: true });
  }

  currentMode() {
    return modeById(this.sessionModeId);
  }

  adapterContract() {
    return clone(DB_ADAPTER_CONTRACT);
  }

  currentAdapter() {
    return this.adapterByModeId.get(this.currentMode().id) || this.adapterByModeId.get(LOCAL_MEM_MODE_ID);
  }

  assertConfiguredAdapter(action) {
    this.currentAdapter().assertConfigured(action);
  }

  currentStateSnapshot() {
    return this.snapshot({ skipAdapterCheck: true });
  }

  applyStateSnapshot(state = {}) {
    this.cleared = Boolean(state.cleared);
    const sourceTables = state.tables && typeof state.tables === "object"
      ? state.tables
      : getStandaloneMockDbSeedTables();
    this.standaloneTables = clone(sourceTables);
    IDENTITY_TABLES.forEach((tableName) => {
      if (!Array.isArray(this.standaloneTables[tableName])) {
        this.standaloneTables[tableName] = [];
      }
    });
    this.sharedOptions = {
      memoryDbTables: this.standaloneTables,
      sessionMode: this.sessionModeId,
      sessionUserKey: this.sessionUserKey,
    };
    this.workspaceRepository = createProjectWorkspaceMockRepository();
    this.workspaceRepository.resetProjectData();
    this.gameDesignRepository = createGameDesignMockRepository({
      projectRepository: this.workspaceRepository,
    });
    this.gameConfigurationRepository = createGameConfigurationMockRepository({
      gameDesignRepository: this.gameDesignRepository,
    });
    this.paletteRepository = createProjectWorkspacePaletteRepository({
      projectWorkspaceRepository: this.workspaceRepository,
      ...this.sharedOptions,
    });
    this.assetRepository = createAssetToolMockRepository({
      configurationRepository: this.gameConfigurationRepository,
      paletteRepository: this.paletteRepository,
      ...this.sharedOptions,
    });
    this.assetReadyInitialized = false;
    this.sharedOptions.workspaceRepository = this.workspaceRepository;
    this.projectJourneyRepository = createProjectJourneyMockRepository(this.sharedOptions);
    this.repositoryById.clear();
  }

  persistCurrentAdapterState(action) {
    if (this.sessionModeId !== LOCAL_DB_MODE_ID) {
      this.localMemState = clone(this.currentStateSnapshot());
      return;
    }
    this.currentAdapter().writeState(action, this.currentStateSnapshot());
  }

  seed(options = {}) {
    if (!options.initial) {
      this.assertConfiguredAdapter("Seeding Local Mem DB state");
    }
    this.applyStateSnapshot({
      cleared: false,
      tables: getStandaloneMockDbSeedTables(),
    });
    if (options.initial) {
      this.localMemState = clone(this.currentStateSnapshot());
      return this.currentStateSnapshot();
    }
    this.persistCurrentAdapterState("Seeding Local DB state");
    return this.snapshot();
  }

  clear() {
    this.assertConfiguredAdapter("Clearing Local Mem DB state");
    this.cleared = true;
    this.standaloneTables = clone(getStandaloneMockDbSeedTables());
    Object.keys(this.standaloneTables).forEach((tableName) => {
      this.standaloneTables[tableName] = [];
    });
    this.sharedOptions.memoryDbTables = this.standaloneTables;
    const snapshot = this.snapshot();
    this.persistCurrentAdapterState("Clearing Local DB state");
    return snapshot;
  }

  replaceTestingState(state = {}) {
    this.assertConfiguredAdapter("Replacing Local Mem DB testing state");
    this.applyStateSnapshot(state);
    const snapshot = this.snapshot();
    this.persistCurrentAdapterState("Replacing Local DB testing state");
    return snapshot;
  }

  setMode(modeId) {
    const nextMode = MOCK_DB_SESSION_MODES.find((mode) => mode.id === modeId);
    if (!nextMode) {
      throw new Error(`Unknown local login environment: ${modeId || "missing"}.`);
    }
    this.persistCurrentAdapterState("Saving current local data source before mode switch");
    const currentFallbackState = this.currentStateSnapshot();
    const nextAdapter = this.adapterByModeId.get(nextMode.id);
    const nextState = nextMode.id === LOCAL_DB_MODE_ID
      ? nextAdapter.readState("Selecting Local DB", currentFallbackState)
      : this.localMemState || currentFallbackState;
    this.sessionModeId = nextMode.id;
    this.applyStateSnapshot(nextState);
    return clone(nextMode);
  }

  setUser(userKey) {
    this.assertConfiguredAdapter("Selecting a session user");
    this.sessionUserKey = String(userKey || "");
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSession();
  }

  clearSessionUser() {
    this.sessionUserKey = "";
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSession();
  }

  currentSession() {
    return sessionUserFromKey(this.standaloneTables, this.sessionUserKey, this.sessionModeId);
  }

  sessionModes() {
    return clone(MOCK_DB_SESSION_MODES);
  }

  sessionUsers() {
    if (this.sessionModeId !== LOCAL_MEM_MODE_ID && this.sessionModeId !== LOCAL_DB_MODE_ID) {
      return [sessionUserFromKey(this.standaloneTables, "", this.sessionModeId)];
    }
    const guest = sessionUserFromKey(this.standaloneTables, "", this.sessionModeId);
    return [
      guest,
      ...(this.standaloneTables.users || [])
        .map((user) => sessionUserFromKey(this.standaloneTables, user.key, this.sessionModeId))
        .filter((user) => user.authenticated && !user.roleSlugs.includes("system")),
    ];
  }

  repositoryForTool(toolId) {
    this.assertConfiguredAdapter(`Opening ${toolId} repository`);
    if (toolId === "workspace") return this.workspaceRepository;
    if (toolId === "project-workspace") return this.workspaceRepository;
    if (toolId === "game-design") return this.gameDesignRepository;
    if (toolId === "game-configuration") return this.gameConfigurationRepository;
    if (toolId === "project-journey") return this.projectJourneyRepository;
    if (toolId === "palette") return this.paletteRepository;
    if (toolId === "colors") return this.paletteRepository;
    if (toolId === "asset") return this.assetRepository;
    if (toolId === "assets") return this.assetRepository;
    throw new Error(`Unknown toolbox API data source: ${toolId}.`);
  }

  constantsForTool(toolId) {
    this.assertConfiguredAdapter(`Reading ${toolId} constants`);
    if (toolId === "workspace" || toolId === "project-workspace") {
      return {
        PROJECT_WORKSPACE_MEMBER_ROLES,
        PROJECT_WORKSPACE_PROJECT_PURPOSES,
        PROJECT_WORKSPACE_PROJECT_STATUSES,
      };
    }
    if (toolId === "game-design") {
      return {
        GAME_DESIGN_GAME_TYPES,
        GAME_DESIGN_GENRES,
        GAME_DESIGN_PLAY_STYLES,
      };
    }
    if (toolId === "game-configuration") {
      return { GAME_CONFIGURATION_SECTIONS };
    }
    if (toolId === "project-journey") {
      return {
        PROJECT_JOURNEY_KEYS,
        PROJECT_JOURNEY_STATUS_BY_ID,
        PROJECT_JOURNEY_STATUSES,
      };
    }
    if (toolId === "palette" || toolId === "colors") {
      return {
        PALETTE_SOURCE_USER,
        PALETTE_TOOL_KEY,
        PALETTE_WORKSPACE_PATH,
      };
    }
    if (toolId === "asset" || toolId === "assets") {
      return {
        ASSET_ROLE_DEFINITIONS: this.assetRepository.ASSET_ROLE_DEFINITIONS,
        ASSET_TOOL_TABLES: this.assetRepository.ASSET_TOOL_TABLES,
        ASSET_TYPES: this.assetRepository.ASSET_TYPES,
        ASSET_USAGE_BY_ROLE: this.assetRepository.ASSET_USAGE_BY_ROLE,
      };
    }
    throw new Error(`Unknown toolbox constants data source: ${toolId}.`);
  }

  callFunction(toolId, functionName, args) {
    this.assertConfiguredAdapter(`Calling ${toolId}.${functionName}`);
    if ((toolId === "palette" || toolId === "colors") && functionName === "normalizePaletteSwatchInput") {
      return normalizePaletteSwatchInput(...args);
    }
    if ((toolId === "palette" || toolId === "colors") && functionName === "validatePaletteSwatchInput") {
      return validatePaletteSwatchInput(...args);
    }
    if ((toolId === "asset" || toolId === "assets") && functionName === "pickerDiagnosticForRole") {
      return pickerDiagnosticForRole(...args);
    }
    throw new Error(`Unknown toolbox function data source: ${toolId}.${functionName}.`);
  }

  createRepository(toolId, options = {}) {
    this.assertConfiguredAdapter(`Creating ${toolId} repository`);
    const hasCustomOptions = options && typeof options === "object" && Object.keys(options).length > 0;
    let repository = this.repositoryForTool(toolId);
    if (hasCustomOptions && (toolId === "palette" || toolId === "colors")) {
      const paletteOptions = { ...options };
      if (paletteOptions.sourceMode === "empty") {
        paletteOptions.tables = { palette_source_swatches: [] };
        delete paletteOptions.sourceMode;
      } else if (paletteOptions.sourceMode === "invalid") {
        paletteOptions.tables = {
          palette_source_swatches: [
            { id: "invalid-source-row", source: "broken-source", symbol: "AB", hex: "not-a-hex", name: "", tags: ["diagnostic"] },
          ],
        };
        delete paletteOptions.sourceMode;
      }
      repository = createProjectWorkspacePaletteRepository({
        projectWorkspaceRepository: this.workspaceRepository,
        ...this.sharedOptions,
        ...paletteOptions,
      });
    }
    const repositoryId = `${toolId}-${this.repositoryCounter}`;
    this.repositoryCounter += 1;
    this.repositoryById.set(repositoryId, repository);
    return repositoryId;
  }

  callRepositoryMethod(repositoryId, methodName, args) {
    this.assertConfiguredAdapter(`Calling repository method ${methodName}`);
    const repository = this.repositoryById.get(repositoryId);
    if (!repository) {
      throw new Error(`Server repository ${repositoryId} is missing.`);
    }
    const method = repository[methodName];
    if (typeof method !== "function") {
      throw new Error(`Server repository method ${methodName} is missing.`);
    }
    this.cleared = false;
    if (repository === this.assetRepository && methodName === "makeReadyGameConfiguration") {
      if (this.assetReadyInitialized) {
        return repository.getSnapshot();
      }
      this.assetReadyInitialized = true;
    }
    if (repository === this.assetRepository && (methodName === "makeInvalidGameConfiguration" || methodName === "makeMissingGameConfiguration" || methodName === "clearAssetLibrary" || methodName === "resetAssetLibrary")) {
      this.assetReadyInitialized = false;
    }
    if (repository === this.assetRepository && methodName === "importAsset") {
      this.assetReadyInitialized = true;
    }
    const result = method(...args);
    this.persistCurrentAdapterState(`Persisting ${methodName} result`);
    return result;
  }

  snapshot(options = {}) {
    if (!options.skipAdapterCheck) {
      this.assertConfiguredAdapter("Reading Local Mem DB state");
    }
    const schemas = getMockDbTableSchemas();
    const toolGroups = getMockDbToolGroups();
    const owners = {
      users: "standalone",
      roles: "standalone",
      user_roles: "standalone",
    };
    Object.entries(toolGroups).forEach(([ownerId, group]) => {
      group.tableNames.forEach((tableName) => {
        owners[tableName] = ownerId;
      });
    });

    const emptyToolTables = Object.fromEntries(
      Object.values(toolGroups).flatMap((group) => group.tableNames).map((tableName) => [tableName, []]),
    );
    if (this.cleared) {
      return {
        cleared: true,
        owners,
        schemas,
        tables: {
          users: [],
          roles: [],
          user_roles: [],
          ...emptyToolTables,
        },
        toolGroups,
        version: 3,
      };
    }

    const tables = {
      ...this.standaloneTables,
      ...workspaceTables(this.workspaceRepository),
      ...gameDesignTables(this.gameDesignRepository),
      ...gameConfigurationTables(this.gameConfigurationRepository),
      ...projectJourneyTables(this.projectJourneyRepository),
      ...paletteTables(this.paletteRepository),
      ...assetTables(this.assetRepository),
    };

    Object.keys(schemas).forEach((tableName) => {
      if (!Object.hasOwn(tables, tableName)) {
        tables[tableName] = [];
      }
    });

    return {
      cleared: false,
      owners,
      schemas,
      tables,
      toolGroups,
      version: 3,
    };
  }
}

export function createMockApiRouter() {
  const dataSource = new LocalDevMockDataSource();

  return async function handleMockApiRequest(request, response, requestUrl) {
    if (!requestUrl.pathname.startsWith("/api/")) {
      return false;
    }

    try {
      const parts = requestUrl.pathname.split("/").filter(Boolean);
      if (parts[1] === "session") {
        if (request.method === "GET" && parts[2] === "current") {
          ok(response, dataSource.currentSession());
          return true;
        }
        if (request.method === "GET" && parts[2] === "modes") {
          ok(response, dataSource.sessionModes());
          return true;
        }
        if (request.method === "GET" && parts[2] === "users") {
          ok(response, dataSource.sessionUsers());
          return true;
        }
        if (request.method === "POST" && parts[2] === "mode") {
          const body = await readRequestJson(request);
          ok(response, {
            mode: dataSource.setMode(body.modeId),
            sessionUser: dataSource.currentSession(),
          });
          return true;
        }
        if (request.method === "POST" && parts[2] === "user") {
          const body = await readRequestJson(request);
          ok(response, dataSource.setUser(body.userKey));
          return true;
        }
        if (request.method === "POST" && parts[2] === "logout") {
          ok(response, dataSource.clearSessionUser());
          return true;
        }
      }

      if (parts[1] === "mock-db") {
        if (request.method === "GET" && parts[2] === "snapshot") {
          ok(response, dataSource.snapshot());
          return true;
        }
        if (request.method === "POST" && parts[2] === "clear") {
          ok(response, dataSource.clear());
          return true;
        }
        if (request.method === "POST" && parts[2] === "seed") {
          dataSource.seed();
          ok(response, dataSource.snapshot());
          return true;
        }
      }

      if (parts[1] === "data-source" && request.method === "GET" && parts[2] === "adapter-contract") {
        ok(response, dataSource.adapterContract());
        return true;
      }

      if (parts[1] === "dev" && parts[2] === "testing" && parts[3] === "mock-db-state" && request.method === "POST") {
        const body = await readRequestJson(request);
        ok(response, dataSource.replaceTestingState(body.state || {}));
        return true;
      }

      if (parts[1] === "toolbox") {
        if (request.method === "GET" && parts[2] === "registry" && parts[3] === "snapshot") {
          ok(response, toolRegistrySnapshot());
          return true;
        }
        const toolId = parts[2];
        if (request.method === "GET" && parts[3] === "constants") {
          ok(response, dataSource.constantsForTool(toolId));
          return true;
        }
        if (request.method === "POST" && parts[3] === "functions") {
          const body = await readRequestJson(request);
          ok(response, {
            result: dataSource.callFunction(toolId, parts[4], body.args || []),
          });
          return true;
        }
        if (request.method === "POST" && parts[3] === "repositories" && parts.length === 4) {
          const body = await readRequestJson(request);
          ok(response, {
            repositoryId: dataSource.createRepository(toolId, body.options || {}),
          });
          return true;
        }
        if (request.method === "POST" && parts[3] === "repositories" && parts[5] === "methods") {
          const body = await readRequestJson(request);
          ok(response, {
            result: dataSource.callRepositoryMethod(parts[4], parts[6], body.args || []),
          });
          return true;
        }
      }

      fail(response, 404, `Unknown API route: ${request.method} ${requestUrl.pathname}.`);
      return true;
    } catch (error) {
      fail(response, 500, error);
      return true;
    }
  };
}
