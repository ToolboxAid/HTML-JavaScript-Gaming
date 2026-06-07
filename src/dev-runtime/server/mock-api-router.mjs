import {
  createAssetToolMockRepository,
  pickerDiagnosticForRole,
} from "../../../toolbox/assets/assets-mock-repository.js";
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

const TOOL_ORDER = ["workspace", "game-design", "game-configuration", "project-journey", "palette", "asset"];
const IDENTITY_TABLES = ["users", "roles", "user_roles"];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isUlidKey(value) {
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(String(value || ""));
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

function sessionUserFromKey(tables, userKey, modeId) {
  const key = String(userKey || "");
  if (modeId === "dev" || !isUlidKey(key)) {
    return {
      authenticated: false,
      diagnostic: modeId === "dev"
        ? "DEV mode uses read-only/demo JSON access. Switch to Local to use persisted Memory DB sessions."
        : "",
      displayName: "Login",
      id: "guest",
      isAdmin: false,
      label: "Guest",
      mode: modeId,
      roleSlugs: [],
      userKey: null,
    };
  }

  const user = (tables.users || []).find((record) => record.key === key && record.isActive !== false);
  if (!user) {
    return {
      authenticated: false,
      diagnostic: `Selected Local user key ${key} is missing from server Memory DB users.`,
      displayName: "Login",
      id: "guest",
      isAdmin: false,
      label: "Guest",
      mode: modeId,
      roleSlugs: [],
      userKey: null,
    };
  }

  const roleSlugs = roleSlugsForUserKey(tables, key);
  if (!roleSlugs.length || roleSlugs.includes("system")) {
    return {
      authenticated: false,
      diagnostic: `Selected Local user ${user.displayName || key} has no human login role.`,
      displayName: "Login",
      id: "guest",
      isAdmin: false,
      label: "Guest",
      mode: modeId,
      roleSlugs: [],
      userKey: null,
    };
  }

  return {
    authenticated: true,
    diagnostic: "",
    displayName: user.displayName || key,
    id: key,
    isAdmin: roleSlugs.includes("admin"),
    label: user.displayName || key,
    mode: modeId,
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

class LocalDevMockDataSource {
  constructor() {
    this.repositoryCounter = 1;
    this.repositoryById = new Map();
    this.sessionModeId = "local";
    this.sessionUserKey = "";
    this.seed();
  }

  seed() {
    this.cleared = false;
    this.standaloneTables = clone(getStandaloneMockDbSeedTables());
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

  clear() {
    this.cleared = true;
    this.standaloneTables = clone(getStandaloneMockDbSeedTables());
    Object.keys(this.standaloneTables).forEach((tableName) => {
      this.standaloneTables[tableName] = [];
    });
    this.sharedOptions.memoryDbTables = this.standaloneTables;
    return this.snapshot();
  }

  replaceTestingState(state = {}) {
    this.cleared = Boolean(state.cleared);
    this.standaloneTables = clone(state.tables || {});
    IDENTITY_TABLES.forEach((tableName) => {
      if (!Array.isArray(this.standaloneTables[tableName])) {
        this.standaloneTables[tableName] = [];
      }
    });
    this.sharedOptions.memoryDbTables = this.standaloneTables;
    return this.snapshot();
  }

  setMode(modeId) {
    const nextMode = MOCK_DB_SESSION_MODES.find((mode) => mode.id === modeId) || MOCK_DB_SESSION_MODES.find((mode) => mode.id === "local");
    this.sessionModeId = nextMode.id;
    if (this.sessionModeId === "dev") {
      this.sessionUserKey = "";
    }
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return clone(nextMode);
  }

  setUser(userKey) {
    this.sessionModeId = "local";
    this.sessionUserKey = String(userKey || "");
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
    if (this.sessionModeId === "dev") {
      return [sessionUserFromKey(this.standaloneTables, "", "dev")];
    }
    const guest = sessionUserFromKey(this.standaloneTables, "", "local");
    return [
      guest,
      ...(this.standaloneTables.users || [])
        .map((user) => sessionUserFromKey(this.standaloneTables, user.key, "local"))
        .filter((user) => user.authenticated && !user.roleSlugs.includes("system")),
    ];
  }

  repositoryForTool(toolId) {
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
    return method(...args);
  }

  snapshot() {
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
          ok(response, dataSource.setUser(""));
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

      if (parts[1] === "dev" && parts[2] === "testing" && parts[3] === "mock-db-state" && request.method === "POST") {
        const body = await readRequestJson(request);
        ok(response, dataSource.replaceTestingState(body.state || {}));
        return true;
      }

      if (parts[1] === "toolbox") {
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
