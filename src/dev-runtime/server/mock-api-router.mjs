import { mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import {
  createAssetToolMockRepository,
  pickerDiagnosticForRole,
} from "../persistence/tool-repositories/assets-mock-repository.js";
import {
  createObjectsToolMockRepository,
} from "../persistence/tool-repositories/objects-mock-repository.js";
import {
  createInputMappingToolMockRepository,
} from "../persistence/tool-repositories/input-mapping-mock-repository.js";
import {
  TOOL_IMAGE_FALLBACK,
  TOOL_RELEASE_CHANNELS,
  TOOL_RELEASE_CHANNEL_HELP_TEXT,
  TOOL_RELEASE_CHANNEL_LABELS,
  TOOL_STATUS_MODEL,
  getActiveToolRegistry,
  getToolImageDiagnostics,
  getToolImageSource,
  getToolProgressReadiness,
  getToolReleaseChannel,
  getToolReleaseChannelLabel,
  getToolRoute,
} from "../guest-seeds/tool-metadata-inventory.js";
import {
  PALETTE_CATALOG_CONFIG,
} from "../persistence/tool-repositories/palette-catalog-config.js";
import {
  PALETTE_SOURCE_USER,
  PALETTE_TOOL_KEY,
  PALETTE_WORKSPACE_PATH,
  createProjectWorkspacePaletteRepository,
  normalizePaletteSwatchInput,
  validatePaletteSwatchInput,
} from "../persistence/tool-repositories/palette-workspace-repository.js";
import {
  GAME_CONFIGURATION_SECTIONS,
  createGameConfigurationMockRepository,
} from "../persistence/tool-repositories/game-configuration-mock-repository.js";
import {
  GAME_DESIGN_GAME_TYPES,
  GAME_DESIGN_GENRES,
  GAME_DESIGN_PLAY_STYLES,
  createGameDesignMockRepository,
} from "../persistence/tool-repositories/game-design-mock-repository.js";
import {
  PROJECT_JOURNEY_KEYS,
  PROJECT_JOURNEY_STATUS_BY_ID,
  PROJECT_JOURNEY_STATUSES,
  PROJECT_JOURNEY_SUGGESTED_TOOLS,
  createProjectJourneyMockRepository,
} from "../persistence/tool-repositories/project-journey-mock-repository.js";
import {
  PROJECT_WORKSPACE_MEMBER_ROLES,
  PROJECT_WORKSPACE_PROJECT_PURPOSES,
  PROJECT_WORKSPACE_PROJECT_STATUSES,
  createProjectWorkspaceMockRepository,
} from "../persistence/tool-repositories/project-workspace-mock-repository.js";
import {
  MOCK_DB_KEYS,
  MOCK_DB_SESSION_MODES,
  createMockDbAuditFields,
  getMockDbTableSchemas,
  getMockDbToolGroups,
  normalizeMockDbTables,
} from "../persistence/mock-db-store.js";
import { createServerSeedTables } from "../guest-seeds/tool-state-samples.js";
import { createPaletteSourceMockDbRows } from "../guest-seeds/palette-source-mock-db.js";

export const SERVER_DATA_BOUNDARY_RULE = "Browser -> Server API -> Data Source";

const LOCAL_MEM_MODE_ID = "local-mem";
const LOCAL_DB_MODE_ID = "local-db";
const LOCAL_DB_NOT_CONFIGURED = "Local DB adapter not configured";
const TOOL_ORDER = ["workspace", "game-design", "game-configuration", "objects", "input-mapping-v2", "project-journey", "palette", "asset"];
const IDENTITY_TABLES = ["users", "roles", "user_roles"];
const TOOLBOX_TABLES = ["toolbox_tool_metadata", "toolbox_tool_planning", "toolbox_votes"];
const TOOLBOX_PLANNING_FIELDS = Object.freeze([
  "progressChecklist",
  "readiness",
  "requiredForPlayable",
  "requiredForPublish",
  "requiredForTestable",
  "requires",
]);
const DB_VIEWER_IDENTITY_TABLES = Object.freeze(["users", "user_roles", "roles"]);
const DB_VIEWER_TOOLBOX_VOTE_TABLES = Object.freeze(["toolbox_votes", "toolbox_vote_order"]);
const DB_VIEWER_STANDALONE_LABELS = Object.freeze({
  toolbox_tool_metadata: "Tool Metadata",
  toolbox_tool_planning: "Tool Planning",
  toolbox_votes: "Toolbox Votes",
  tool_state_samples: "Tool State Samples",
  user_roles: "User Roles",
});
const TOOLBOX_DEFAULT_RELEASE_CHANNELS = Object.freeze(["wireframe", "beta", "complete"]);
const BUILD_PATH_DEFAULT_RELEASE_CHANNELS = Object.freeze(["complete"]);
const TOOLBOX_RELEASE_CHANNEL_SWATCHES = Object.freeze({
  planned: "swatch-gray",
  wireframe: "swatch-blue",
  beta: "swatch-gold",
  complete: "swatch-green",
  deprecated: "swatch-purple",
});
const TOOLBOX_ROLE_FOCUS_TOOLS = Object.freeze({
  Owner: null,
  Designer: Object.freeze(["Project Workspace", "Project Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Characters", "Colors", "Assets"]),
  "World Builder": Object.freeze(["Worlds", "Objects", "Assets", "Colors", "Animations"]),
  Artist: Object.freeze(["Assets", "Colors", "Fonts", "Sprites", "Characters", "Objects", "Animations"]),
  "Audio Creator": Object.freeze(["Audio", "Music", "Voices", "MIDI", "Audio Effects", "Voice Capture", "Voice Output", "Assets"]),
  Translator: Object.freeze(["Languages", "Voices", "Voice Capture", "Voice Output"]),
  Tester: Object.freeze(["Game Testing", "Controls", "Hitboxes", "Debug", "Performance", "Events"]),
  Publisher: Object.freeze(["Publish", "Marketplace", "Community", "Cloud", "Languages"]),
  Viewer: Object.freeze(["Project Workspace", "Project Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Assets", "Colors", "Audio", "Publish", "Marketplace", "Community", "Languages", "Achievements", "Ratings"]),
});
const ADMIN_NAVIGATION_MAIN_ITEMS = Object.freeze([
  Object.freeze({ label: "Analytics", path: "admin/analytics.html", route: "admin-analytics" }),
  Object.freeze({ label: "Branding", path: "admin/branding.html", route: "admin-branding" }),
  Object.freeze({ label: "Controls", path: "admin/controls.html", route: "admin-controls" }),
  Object.freeze({ label: "Environments", path: "admin/environments.html", route: "admin-environments" }),
  Object.freeze({ label: "Game Migration", path: "admin/game-migration.html", route: "admin-game-migration" }),
  Object.freeze({ label: "Moderation", path: "admin/moderation.html", route: "admin-moderation" }),
  Object.freeze({ label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" }),
  Object.freeze({ label: "Ratings", path: "admin/ratings.html", route: "admin-ratings" }),
  Object.freeze({ label: "Roles", path: "admin/roles.html", route: "admin-roles" }),
  Object.freeze({ label: "Site Settings", path: "admin/site-settings.html", route: "admin-site-settings" }),
  Object.freeze({ label: "Themes", path: "admin/themes.html", route: "admin-themes" }),
  Object.freeze({ label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" }),
  Object.freeze({ label: "Users", path: "admin/users.html", route: "admin-users" }),
]);
const LOCAL_ADMIN_MY_STUFF_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" }),
  Object.freeze({ label: "Design System", path: "admin/design-system.html", route: "admin-design-system" }),
  Object.freeze({ label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" }),
  Object.freeze({ href: "/admin/admin-notes.html", label: "Notes", localNotes: true }),
]);

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

function orderedUniqueValues(rows, valueSelector) {
  const values = [];
  rows
    .slice()
    .sort((left, right) => left.order - right.order || left.displayName.localeCompare(right.displayName))
    .forEach((row) => {
      const value = String(valueSelector(row) || "").trim();
      if (value && !values.includes(value)) {
        values.push(value);
      }
    });
  return values;
}

function toolboxGroupSwatchClass(groupName, colorGroup) {
  const colorGroupClass = String(colorGroup || "").trim();
  if (colorGroupClass.startsWith("tool-group-")) {
    return colorGroupClass.replace(/^tool-group-/, "toolbox-group-");
  }

  const slug = String(groupName || "")
    .trim()
    .toLowerCase()
    .replace(/build\/create/g, "build")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `toolbox-group-${slug}` : "swatch-orange";
}

function toolboxGroupSwatches(rows) {
  return rows.reduce((swatches, row) => {
    const groupName = row.category || row.group || "";
    if (groupName && !swatches[groupName]) {
      swatches[groupName] = toolboxGroupSwatchClass(groupName, row.colorGroup);
    }
    return swatches;
  }, {});
}

function toolboxContractForTools(tools) {
  return {
    defaultReleaseChannels: {
      buildPath: [...BUILD_PATH_DEFAULT_RELEASE_CHANNELS],
      toolbox: [...TOOLBOX_DEFAULT_RELEASE_CHANNELS],
    },
    groupSwatches: toolboxGroupSwatches(tools),
    groups: orderedUniqueValues(tools, (tool) => tool.category || tool.group),
    releaseChannelByStatus: Object.fromEntries(TOOL_STATUS_MODEL.map((status) => [
      status,
      getToolReleaseChannel({ status }),
    ])),
    releaseChannelHelpText: clone(TOOL_RELEASE_CHANNEL_HELP_TEXT),
    releaseChannelLabels: clone(TOOL_RELEASE_CHANNEL_LABELS),
    releaseChannelSwatches: clone(TOOLBOX_RELEASE_CHANNEL_SWATCHES),
    releaseChannels: [...TOOL_RELEASE_CHANNELS],
    roleFocusTools: clone(TOOLBOX_ROLE_FOCUS_TOOLS),
    toolboxGroupOrder: orderedUniqueValues(tools, (tool) => tool.toolboxGroup),
  };
}

function dbViewerStandaloneTableLabel(tableName) {
  return DB_VIEWER_STANDALONE_LABELS[tableName] || tableName;
}

function dbViewerGroupsForSnapshot(tables, owners, toolGroups) {
  const tableNames = Object.keys(tables).sort();
  const tableNamesForOwner = (ownerId) => tableNames
    .filter((tableName) => owners[tableName] === ownerId)
    .sort();
  const toolGroupIds = TOOL_ORDER.filter((id) => tableNamesForOwner(id).length > 0);
  const toolOwnedTables = new Set(toolGroupIds.flatMap(tableNamesForOwner));
  const identityTables = DB_VIEWER_IDENTITY_TABLES.filter((tableName) => tableNames.includes(tableName));
  const toolboxVoteTables = DB_VIEWER_TOOLBOX_VOTE_TABLES.filter((tableName) => tableNames.includes(tableName));
  const groupedStandaloneTables = new Set([
    ...identityTables,
    ...toolboxVoteTables,
  ]);
  const standaloneTableNames = tableNames
    .filter((tableName) => !toolOwnedTables.has(tableName))
    .filter((tableName) => !groupedStandaloneTables.has(tableName))
    .sort();

  return [
    {
      id: "all",
      label: "All",
      tableNames,
      type: "all",
    },
    ...toolGroupIds.map((id) => ({
      id,
      label: toolGroups[id]?.label || id,
      tableNames: tableNamesForOwner(id),
      type: "tool",
    })),
    ...(identityTables.length ? [{
      id: "user_roles",
      label: dbViewerStandaloneTableLabel("user_roles"),
      tableNames: identityTables,
      type: "table",
    }] : []),
    ...standaloneTableNames.map((tableName) => ({
      id: tableName,
      label: dbViewerStandaloneTableLabel(tableName),
      tableNames: [tableName],
      type: "table",
    })),
    ...(toolboxVoteTables.length ? [{
      id: "toolbox_votes",
      label: dbViewerStandaloneTableLabel("toolbox_votes"),
      tableNames: toolboxVoteTables,
      type: "table",
    }] : []),
  ];
}

function valueOrDefault(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
}

function booleanOrDefault(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizedToolKey(row) {
  return String(row?.toolKey || row?.toolId || row?.id || "").trim();
}

function requiredToolMetadataDiagnostics(row) {
  const missing = ["toolKey", "toolName", "group", "path", "order", "status"].filter((field) => {
    const value = field === "toolKey" ? normalizedToolKey(row) : row?.[field];
    return value === undefined || value === null || value === "";
  });
  return missing.length ? `Missing DB-backed Toolbox metadata: ${missing.join(", ")}.` : "";
}

function serverRegistryTool(tool, index = 0) {
  const toolKey = normalizedToolKey(tool);
  const toolName = tool.toolName || tool.displayName || tool.name || toolKey;
  const releaseChannel = getToolReleaseChannel(tool.status || tool.releaseChannel);
  const route = String(tool.path || tool.route || getToolRoute(tool) || "").replace(/^\/+/, "");
  const badgePath = tool.badge || tool.imageSources?.badge || "";
  const toolImagePath = tool.toolImage || tool.tool || tool.imageSources?.tool || "";
  const imageProbe = {
    badge: badgePath,
    tool: toolImagePath,
  };
  return {
    ...tool,
    active: booleanOrDefault(tool.active, true),
    adminOnly: tool.adminOnly === true,
    badge: badgePath,
    category: tool.category || tool.group || "Platform",
    colorGroup: tool.colorGroup || "",
    deferred: tool.deferred === true,
    description: tool.description || tool.shortDescription || "",
    displayName: toolName,
    hidden: tool.hidden === true,
    id: toolKey,
    imageDiagnostics: getToolImageDiagnostics(imageProbe),
    imageSources: {
      badge: getToolImageSource(imageProbe, "badge"),
      tool: getToolImageSource(imageProbe, "tool"),
    },
    name: toolName,
    order: Math.max(1, Math.round(Number(tool.order) || index + 1)),
    path: route,
    planningSource: "toolbox_tool_planning",
    progressChecklist: Array.isArray(tool.progressChecklist) ? [...tool.progressChecklist] : [],
    readiness: tool.readiness || getToolProgressReadiness(tool.status || tool.releaseChannel),
    releaseChannel,
    releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
    requiredForPlayable: tool.requiredForPlayable === true,
    requiredForPublish: tool.requiredForPublish === true,
    requiredForTestable: tool.requiredForTestable === true,
    requires: Array.isArray(tool.requires) ? [...tool.requires] : [],
    route,
    shortDescription: tool.shortDescription || tool.description || "",
    shortLabel: tool.shortLabel || toolName,
    status: releaseChannel,
    statusDiagnostic: tool.statusDiagnostic || requiredToolMetadataDiagnostics(tool),
    tool: toolImagePath,
    toolboxGroup: tool.toolboxGroup || "",
    visibleInToolsList: tool.visibleInToolsList === true,
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

function sendNoContent(response, statusCode = 204) {
  response.statusCode = statusCode;
  response.setHeader("Allow", "GET, POST, HEAD, OPTIONS");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end();
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
  return normalizeMockDbTables(ownerId, tables);
}

const WORKSPACE_PROJECT_KEYS = Object.freeze({
  "camera-follow-demo": "01K2GFSJ0Y0000000080002104",
  "collision-demo": "01K2GFSJ0Y0000000080002103",
  "demo-project": PROJECT_JOURNEY_KEYS.project,
  "gravity-demo": "01K2GFSJ0Y0000000080002102",
});

function workspaceProjectKey(projectId) {
  return WORKSPACE_PROJECT_KEYS[projectId] || projectId || "";
}

function serverGeneratedUlid(source) {
  const text = String(source || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) >>> 0;
  }
  return `01K2GFSJ0Y${String(9_000_000_000 + hash).padStart(16, "0")}`;
}

function votePercent(count, total) {
  const resolvedCount = Number(count);
  const resolvedTotal = Number(total);
  if (!Number.isFinite(resolvedCount) || !Number.isFinite(resolvedTotal) || resolvedTotal <= 0) {
    return 0;
  }
  return Math.round((resolvedCount / resolvedTotal) * 100);
}

function snapshotAuditFields(index = 0, userKey = MOCK_DB_KEYS.users.forgeBot) {
  return createMockDbAuditFields(index, userKey);
}

function workspaceTables(repository) {
  const tables = repository.getTables();
  const activeProject = repository.getActiveProject();
  const progress = repository.getProjectProgress();
  const workspaceProjects = tables.projects.map((project, index) => ({
    ...snapshotAuditFields(index + 20, MOCK_DB_KEYS.users.user1),
    key: workspaceProjectKey(project.id),
    name: project.name,
    ownerKey: MOCK_DB_KEYS.users.user1,
    status: project.status,
  }));
  const activeProjectKey = workspaceProjectKey(activeProject?.id);
  return normalizeOwnedTables("workspace", {
    workspace_projects: workspaceProjects,
    workspace_progress: activeProject ? [{
      ...snapshotAuditFields(80, MOCK_DB_KEYS.users.user1),
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
    game_design_documents: (tables.game_design_documents || []).map((record, index) => ({
      ...snapshotAuditFields(index + 100, MOCK_DB_KEYS.users.user1),
      key: record.key,
      projectKey: workspaceProjectKey(record.projectKey || record.projectId),
      status: record.status,
      title: record.title || `${record.projectPurpose || "Game"} Design`,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || MOCK_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || MOCK_DB_KEYS.users.user1,
    })),
    game_design_validation_items: (tables.game_design_validation_items || []).map((record, index) => ({
      ...snapshotAuditFields(index + 140, MOCK_DB_KEYS.users.user1),
      key: record.key,
      projectKey: workspaceProjectKey(record.projectKey || record.projectId),
      label: record.label,
      status: record.status,
      action: record.action,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || MOCK_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || MOCK_DB_KEYS.users.user1,
    })),
  });
}

function gameConfigurationTables(repository) {
  const tables = repository.getTables();
  return normalizeOwnedTables("game-configuration", {
    game_configuration_records: (tables.game_configuration_documents || []).map((record, index) => ({
      ...snapshotAuditFields(index + 180, MOCK_DB_KEYS.users.user1),
      key: record.key,
      projectKey: workspaceProjectKey(record.projectKey || record.projectId),
      status: record.readinessStatus || "Ready",
      summary: [
        record.sceneTemplate,
        record.inputProfile,
        record.physicsProfile,
        record.cameraMode,
      ].filter(Boolean).join(", "),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || MOCK_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || MOCK_DB_KEYS.users.user1,
    })),
    game_configuration_validation_items: (tables.game_configuration_validation_items || []).map((record, index) => ({
      ...snapshotAuditFields(index + 220, MOCK_DB_KEYS.users.user1),
      key: record.key,
      projectKey: workspaceProjectKey(record.projectKey || record.projectId),
      label: record.label,
      status: record.status,
      action: record.action,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || MOCK_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || MOCK_DB_KEYS.users.user1,
    })),
  });
}

function objectsTables(repository) {
  return normalizeOwnedTables("objects", repository.getTables());
}

function inputMappingTables(repository) {
  return normalizeOwnedTables("input-mapping-v2", repository.getTables());
}

function projectJourneyTables(repository) {
  return normalizeOwnedTables("project-journey", repository.getTables());
}

function paletteTables(repository) {
  return normalizeOwnedTables("palette", {
    ...repository.getTables(),
    palette_source_swatches: createPaletteSourceMockDbRows(),
  });
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
      : createServerSeedTables();
    this.standaloneTables = clone(sourceTables);
    IDENTITY_TABLES.forEach((tableName) => {
      if (!Array.isArray(this.standaloneTables[tableName])) {
        this.standaloneTables[tableName] = [];
      }
    });
    TOOLBOX_TABLES.forEach((tableName) => {
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
    this.objectsRepository = createObjectsToolMockRepository({
      projectWorkspaceRepository: this.workspaceRepository,
      ...this.sharedOptions,
    });
    this.inputMappingRepository = createInputMappingToolMockRepository({
      projectWorkspaceRepository: this.workspaceRepository,
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
    const action = this.sessionModeId === LOCAL_DB_MODE_ID
      ? "Reseeding Local DB state"
      : "Reseeding Local Mem DB state";
    if (!options.initial) {
      this.assertConfiguredAdapter(action);
    }
    this.applyStateSnapshot({
      cleared: false,
      tables: createServerSeedTables(),
    });
    if (options.initial) {
      this.localMemState = clone(this.currentStateSnapshot());
      return this.currentStateSnapshot();
    }
    this.persistCurrentAdapterState(action);
    return this.snapshot();
  }

  clear() {
    this.assertConfiguredAdapter("Clearing Local Mem DB state");
    this.cleared = true;
    this.standaloneTables = clone(createServerSeedTables());
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

  toolboxVoteRows() {
    if (!Array.isArray(this.standaloneTables.toolbox_votes)) {
      this.standaloneTables.toolbox_votes = [];
    }
    return this.standaloneTables.toolbox_votes;
  }

  toolboxToolMetadataRows() {
    if (!Array.isArray(this.standaloneTables.toolbox_tool_metadata)) {
      this.standaloneTables.toolbox_tool_metadata = [];
    }
    return this.standaloneTables.toolbox_tool_metadata;
  }

  toolboxToolPlanningRows() {
    if (!Array.isArray(this.standaloneTables.toolbox_tool_planning)) {
      this.standaloneTables.toolbox_tool_planning = [];
    }
    return this.standaloneTables.toolbox_tool_planning;
  }

  toolboxVoteVoterKey() {
    const session = this.currentSession();
    if (!session.userKey) {
      throw new Error("Login required to record Toolbox votes.");
    }
    return session.userKey;
  }

  toolboxVoteKey(toolId, voterKey) {
    return serverGeneratedUlid(`toolbox-vote:${toolId}:${voterKey}`);
  }

  toolboxToolMetadataKey(toolId) {
    return serverGeneratedUlid(`toolbox-tool-metadata:${toolId}`);
  }

  toolboxToolPlanningKey(toolId) {
    return serverGeneratedUlid(`toolbox-tool-planning:${toolId}`);
  }

  defaultToolboxMetadata(tool, index) {
    const releaseChannel = getToolReleaseChannel(tool);
    const toolKey = tool.id;
    return {
      active: tool.active !== false,
      adminOnly: tool.adminOnly === true,
      badge: tool.badge || "",
      capabilityLabel: tool.capabilityLabel || "",
      category: tool.category || "Platform",
      childCapabilities: Array.isArray(tool.childCapabilities) ? [...tool.childCapabilities] : [],
      colorGroup: tool.colorGroup || "",
      deferred: tool.deferred === true,
      description: tool.description || tool.shortDescription || "",
      group: tool.category || "Platform",
      hidden: tool.hidden === true,
      order: Math.max(1, Math.round(Number(tool.order) || index + 1)),
      path: getToolRoute(tool) || "",
      requiredRole: typeof tool.requiredRole === "string" ? tool.requiredRole : "",
      shortDescription: tool.shortDescription || tool.description || "",
      shortLabel: tool.shortLabel || tool.displayName || tool.name || tool.id,
      status: releaseChannel,
      statusDiagnostic: tool.statusDiagnostic || "",
      subgroup: tool.subgroup || "",
      toolId: toolKey,
      toolImage: tool.tool || "",
      toolKey,
      toolboxGroup: tool.toolboxGroup || "",
      visibleInToolsList: tool.visibleInToolsList === true,
      releaseChannel,
      releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
      toolName: tool.displayName || tool.name || tool.id,
    };
  }

  defaultToolboxPlanning(tool) {
    return {
      progressChecklist: Array.isArray(tool.progressChecklist) ? [...tool.progressChecklist] : [],
      readiness: tool.readiness || "",
      requiredForPlayable: tool.requiredForPlayable === true,
      requiredForPublish: tool.requiredForPublish === true,
      requiredForTestable: tool.requiredForTestable === true,
      requires: Array.isArray(tool.requires) ? [...tool.requires] : [],
      toolKey: tool.id,
    };
  }

  ensureToolboxToolPlanningRows() {
    const rows = this.toolboxToolPlanningRows();
    const metadataRows = this.toolboxToolMetadataRows();
    const activeTools = getActiveToolRegistry();
    let changed = false;
    activeTools.forEach((tool, index) => {
      const toolKey = tool.id;
      const defaults = this.defaultToolboxPlanning(tool);
      const existingMetadata = metadataRows.find((row) => (row.toolKey || row.toolId) === toolKey);
      const existingRow = rows.find((row) => row.toolKey === toolKey);
      const migratedValues = existingMetadata || {};
      const normalizedValues = {
        progressChecklist: Array.isArray(existingRow?.progressChecklist)
          ? existingRow.progressChecklist
          : Array.isArray(migratedValues.progressChecklist) ? migratedValues.progressChecklist : defaults.progressChecklist,
        readiness: valueOrDefault(existingRow?.readiness, valueOrDefault(migratedValues.readiness, defaults.readiness)),
        requiredForPlayable: booleanOrDefault(existingRow?.requiredForPlayable, booleanOrDefault(migratedValues.requiredForPlayable, defaults.requiredForPlayable)),
        requiredForPublish: booleanOrDefault(existingRow?.requiredForPublish, booleanOrDefault(migratedValues.requiredForPublish, defaults.requiredForPublish)),
        requiredForTestable: booleanOrDefault(existingRow?.requiredForTestable, booleanOrDefault(migratedValues.requiredForTestable, defaults.requiredForTestable)),
        requires: Array.isArray(existingRow?.requires)
          ? existingRow.requires
          : Array.isArray(migratedValues.requires) ? migratedValues.requires : defaults.requires,
        toolKey,
      };

      if (!existingRow) {
        rows.push({
          key: this.toolboxToolPlanningKey(toolKey),
          ...normalizedValues,
          ...createMockDbAuditFields(index, MOCK_DB_KEYS.users.forgeBot),
        });
        changed = true;
        return;
      }

      Object.entries(normalizedValues).forEach(([key, value]) => {
        if (existingRow[key] !== value) {
          existingRow[key] = value;
          changed = true;
        }
      });
    });
    if (changed) {
      this.persistCurrentAdapterState("Syncing Toolbox tool planning");
    }
    return rows;
  }

  ensureToolboxToolMetadataRows() {
    const rows = this.toolboxToolMetadataRows();
    const activeTools = getActiveToolRegistry();
    let changed = false;
    activeTools.forEach((tool, index) => {
      const defaults = this.defaultToolboxMetadata(tool, index);
      const existingRow = rows.find((row) => (row.toolKey || row.toolId) === tool.id);
      if (!existingRow) {
        rows.push({
          key: this.toolboxToolMetadataKey(tool.id),
          ...defaults,
          ...createMockDbAuditFields(index, MOCK_DB_KEYS.users.forgeBot),
        });
        changed = true;
        return;
      }

      const releaseChannel = getToolReleaseChannel(existingRow.status || existingRow.releaseChannel || defaults.releaseChannel);
      const normalizedOrder = Math.max(1, Math.round(Number(existingRow.order) || defaults.order));
      const normalizedValues = {
        active: booleanOrDefault(existingRow.active, defaults.active),
        adminOnly: booleanOrDefault(existingRow.adminOnly, defaults.adminOnly),
        badge: valueOrDefault(existingRow.badge, defaults.badge),
        capabilityLabel: valueOrDefault(existingRow.capabilityLabel, defaults.capabilityLabel),
        category: valueOrDefault(existingRow.category, defaults.category),
        childCapabilities: Array.isArray(existingRow.childCapabilities) ? existingRow.childCapabilities : defaults.childCapabilities,
        colorGroup: valueOrDefault(existingRow.colorGroup, defaults.colorGroup),
        deferred: booleanOrDefault(existingRow.deferred, defaults.deferred),
        description: valueOrDefault(existingRow.description, defaults.description),
        group: existingRow.group || defaults.group,
        hidden: booleanOrDefault(existingRow.hidden, defaults.hidden),
        order: normalizedOrder,
        path: existingRow.path || defaults.path,
        requiredRole: valueOrDefault(existingRow.requiredRole, defaults.requiredRole),
        shortDescription: valueOrDefault(existingRow.shortDescription, defaults.shortDescription),
        shortLabel: valueOrDefault(existingRow.shortLabel, defaults.shortLabel),
        status: releaseChannel,
        statusDiagnostic: valueOrDefault(existingRow.statusDiagnostic, defaults.statusDiagnostic),
        subgroup: valueOrDefault(existingRow.subgroup, defaults.subgroup),
        toolId: existingRow.toolId || defaults.toolId,
        toolImage: valueOrDefault(existingRow.toolImage, defaults.toolImage),
        toolKey: existingRow.toolKey || existingRow.toolId || defaults.toolKey,
        toolboxGroup: valueOrDefault(existingRow.toolboxGroup, defaults.toolboxGroup),
        visibleInToolsList: booleanOrDefault(existingRow.visibleInToolsList, defaults.visibleInToolsList),
        releaseChannel,
        releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
        toolName: existingRow.toolName || defaults.toolName,
      };
      Object.entries(normalizedValues).forEach(([key, value]) => {
        if (existingRow[key] !== value) {
          existingRow[key] = value;
          changed = true;
        }
      });
      TOOLBOX_PLANNING_FIELDS.forEach((field) => {
        if (Object.hasOwn(existingRow, field)) {
          delete existingRow[field];
          changed = true;
        }
      });
    });
    if (changed) {
      this.persistCurrentAdapterState("Syncing Toolbox tool metadata");
    }
    return rows;
  }

  toolboxVoteSnapshot() {
    const session = this.currentSession();
    const voterKey = session.userKey || "";
    const votes = this.toolboxVoteRows();
    const metadataRows = this.ensureToolboxToolMetadataRows();
    return {
      currentUserKey: session.userKey || "",
      currentUserName: session.displayName || "Guest",
      rows: metadataRows
        .filter((metadata) => metadata.active !== false)
        .map((metadata, index) => {
          const toolKey = normalizedToolKey(metadata);
          const releaseChannel = getToolReleaseChannel(metadata.status || metadata.releaseChannel);
          const toolVotes = votes.filter((row) => row.toolId === toolKey);
          const up = toolVotes.filter((row) => row.direction === "up").length;
          const down = toolVotes.filter((row) => row.direction === "down").length;
          const totalVotes = up + down;
          return {
            currentUserVote: toolVotes.find((row) => row.userKey === voterKey)?.direction || "",
            down,
            downPercent: votePercent(down, totalVotes),
            group: metadata.group || "",
            order: Math.max(1, Math.round(Number(metadata.order) || index + 1)),
            path: metadata.path || "",
            status: releaseChannel,
            toolKey,
            releaseChannel,
            releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
            toolId: toolKey,
            toolName: metadata.toolName || toolKey,
            totalVotes,
            up,
            upPercent: votePercent(up, totalVotes),
          };
        })
        .sort((left, right) => left.order - right.order || left.toolName.localeCompare(right.toolName)),
    };
  }

  toolRegistrySnapshot() {
    const planningRows = this.ensureToolboxToolPlanningRows();
    const planningByToolKey = new Map(planningRows.map((row) => [row.toolKey, row]));
    const tools = this.ensureToolboxToolMetadataRows()
      .map((row, index) => serverRegistryTool({
        ...row,
        ...planningByToolKey.get(normalizedToolKey(row)),
      }, index))
      .sort((left, right) => left.order - right.order || left.displayName.localeCompare(right.displayName));
    const activeTools = tools.filter((tool) => tool.active !== false);
    return {
      activeTools,
      imageFallback: TOOL_IMAGE_FALLBACK,
      readinessByStatus: Object.fromEntries(TOOL_STATUS_MODEL.map((status) => [status, getToolProgressReadiness(status)])),
      toolboxContract: toolboxContractForTools(activeTools),
      tools,
    };
  }

  adminNavigationMenu() {
    return {
      adminMainItems: clone(ADMIN_NAVIGATION_MAIN_ITEMS),
      localAdminMyStuffItems: clone(LOCAL_ADMIN_MY_STUFF_NAVIGATION_ITEMS),
      ownership: {
        adminMainItems: "navigation config",
        localAdminMyStuffItems: "local/dev navigation config",
        routeMap: "static shell route resolution",
      },
      source: "server-api",
    };
  }

  castToolboxVote(toolId, direction) {
    const normalizedToolId = String(toolId || "");
    const normalizedDirection = String(direction || "").toLowerCase();
    if (!["up", "down"].includes(normalizedDirection)) {
      throw new Error("Toolbox vote direction must be up or down.");
    }
    const metadataRows = this.ensureToolboxToolMetadataRows();
    if (!metadataRows.some((row) => normalizedToolKey(row) === normalizedToolId)) {
      throw new Error(`Unknown Toolbox vote tool: ${normalizedToolId || "missing"}.`);
    }

    const voterKey = this.toolboxVoteVoterKey();
    const rows = this.toolboxVoteRows();
    const existingRow = rows.find((row) => row.toolId === normalizedToolId && row.userKey === voterKey);
    if (existingRow?.direction !== normalizedDirection) {
      const audit = createMockDbAuditFields(0, voterKey);
      if (existingRow) {
        existingRow.direction = normalizedDirection;
        existingRow.updatedAt = audit.updatedAt;
        existingRow.updatedBy = audit.updatedBy;
      } else {
        rows.push({
          key: this.toolboxVoteKey(normalizedToolId, voterKey),
          toolId: normalizedToolId,
          userKey: voterKey,
          direction: normalizedDirection,
          ...audit,
        });
      }
      this.cleared = false;
      this.persistCurrentAdapterState("Persisting Toolbox vote");
    }

    return this.toolboxVoteSnapshot();
  }

  updateToolboxVoteOrder(toolId, orderValue) {
    const session = this.currentSession();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to update Toolbox vote order.");
    }
    const normalizedToolId = String(toolId || "");
    const rows = this.ensureToolboxToolMetadataRows();
    const existingRow = rows.find((row) => normalizedToolKey(row) === normalizedToolId);
    if (!existingRow) {
      throw new Error(`Unknown Toolbox vote tool: ${normalizedToolId || "missing"}.`);
    }
    const rawOrder = Number(orderValue);
    if (!Number.isFinite(rawOrder)) {
      throw new Error("Toolbox vote order must be a number.");
    }
    const order = Math.max(1, Math.round(rawOrder));

    const audit = createMockDbAuditFields(0, session.userKey);
    existingRow.order = order;
    existingRow.updatedAt = audit.updatedAt;
    existingRow.updatedBy = audit.updatedBy;
    this.cleared = false;
    this.persistCurrentAdapterState("Persisting Toolbox tool metadata order");
    return this.toolboxVoteSnapshot();
  }

  updateToolboxToolMetadata(toolId, updates = {}) {
    const session = this.currentSession();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to update Toolbox tool metadata.");
    }
    const normalizedToolId = String(toolId || "");
    const rows = this.ensureToolboxToolMetadataRows();
    const row = rows.find((candidate) => normalizedToolKey(candidate) === normalizedToolId);
    if (!row) {
      throw new Error(`Toolbox metadata row missing for ${normalizedToolId}.`);
    }
    const group = String(updates.group || "").trim();
    const pathValue = String(updates.path || "").trim().replace(/^\/+/, "");
    const releaseChannel = getToolReleaseChannel(updates.status || updates.releaseChannel);
    if (!group) {
      throw new Error("Toolbox metadata group is required.");
    }
    if (!pathValue) {
      throw new Error("Toolbox metadata path is required.");
    }
    const audit = createMockDbAuditFields(0, session.userKey);
    row.group = group;
    row.category = group;
    row.path = pathValue;
    row.status = releaseChannel;
    row.toolKey = row.toolKey || row.toolId || normalizedToolId;
    row.toolId = row.toolId || row.toolKey || normalizedToolId;
    row.releaseChannel = releaseChannel;
    row.releaseChannelLabel = getToolReleaseChannelLabel(releaseChannel);
    row.updatedAt = audit.updatedAt;
    row.updatedBy = audit.updatedBy;
    this.cleared = false;
    this.persistCurrentAdapterState("Persisting Toolbox tool metadata");
    return this.toolboxVoteSnapshot();
  }

  reorderToolboxVoteRows(toolIds) {
    const session = this.currentSession();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to reorder Toolbox vote rows.");
    }
    if (!Array.isArray(toolIds)) {
      throw new Error("Toolbox vote reorder requires an ordered tool list.");
    }
    const metadataRows = this.ensureToolboxToolMetadataRows().filter((row) => row.active !== false);
    const visibleToolIds = metadataRows.map((row) => normalizedToolKey(row));
    const visibleToolIdSet = new Set(visibleToolIds);
    const orderedToolIds = toolIds.map((toolId) => String(toolId || "")).filter(Boolean);
    const uniqueToolIds = [...new Set(orderedToolIds)];
    if (uniqueToolIds.length !== visibleToolIds.length) {
      throw new Error("Toolbox vote reorder must include each visible Toolbox tool exactly once.");
    }
    const unknownToolId = uniqueToolIds.find((toolId) => !visibleToolIdSet.has(toolId));
    if (unknownToolId) {
      throw new Error(`Unknown Toolbox vote tool: ${unknownToolId}.`);
    }

    const rows = this.ensureToolboxToolMetadataRows();
    uniqueToolIds.forEach((toolId, index) => {
      const order = index + 1;
      const audit = createMockDbAuditFields(0, session.userKey);
      const existingRow = rows.find((row) => (row.toolKey || row.toolId) === toolId);
      if (existingRow) {
        existingRow.order = order;
        existingRow.updatedAt = audit.updatedAt;
        existingRow.updatedBy = audit.updatedBy;
      }
    });
    this.cleared = false;
    this.persistCurrentAdapterState("Persisting Toolbox tool metadata row order");
    return this.toolboxVoteSnapshot();
  }

  repositoryForTool(toolId) {
    this.assertConfiguredAdapter(`Opening ${toolId} repository`);
    if (toolId === "workspace") return this.workspaceRepository;
    if (toolId === "project-workspace") return this.workspaceRepository;
    if (toolId === "game-design") return this.gameDesignRepository;
    if (toolId === "game-configuration") return this.gameConfigurationRepository;
    if (toolId === "objects") return this.objectsRepository;
    if (toolId === "input-mapping-v2") return this.inputMappingRepository;
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
    if (toolId === "objects") {
      return {
        OBJECTS_TOOL_TABLES: this.objectsRepository.OBJECTS_TOOL_TABLES,
      };
    }
    if (toolId === "input-mapping-v2") {
      return {
        INPUT_MAPPING_TOOL_TABLES: this.inputMappingRepository.INPUT_MAPPING_TOOL_TABLES,
      };
    }
    if (toolId === "project-journey") {
      return {
        PROJECT_JOURNEY_KEYS,
        PROJECT_JOURNEY_STATUS_BY_ID,
        PROJECT_JOURNEY_STATUSES,
        PROJECT_JOURNEY_SUGGESTED_TOOLS,
      };
    }
    if (toolId === "palette" || toolId === "colors") {
      return {
        ...PALETTE_CATALOG_CONFIG,
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
      toolbox_tool_metadata: "standalone",
      toolbox_tool_planning: "standalone",
      toolbox_votes: "standalone",
      tool_state_samples: "standalone",
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
      const tables = {
        toolbox_tool_metadata: [],
        toolbox_tool_planning: [],
        toolbox_votes: [],
        tool_state_samples: [],
        users: [],
        roles: [],
        user_roles: [],
        ...emptyToolTables,
      };
      return {
        cleared: true,
        owners,
        schemas,
        tables,
        toolGroups,
        viewerGroups: dbViewerGroupsForSnapshot(tables, owners, toolGroups),
        version: 3,
      };
    }

    const tables = {
      ...this.standaloneTables,
      ...workspaceTables(this.workspaceRepository),
      ...gameDesignTables(this.gameDesignRepository),
      ...gameConfigurationTables(this.gameConfigurationRepository),
      ...objectsTables(this.objectsRepository),
      ...inputMappingTables(this.inputMappingRepository),
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
      viewerGroups: dbViewerGroupsForSnapshot(tables, owners, toolGroups),
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
      if (request.method === "OPTIONS") {
        sendNoContent(response);
        return true;
      }
      if (parts[1] === "session") {
        if (request.method === "HEAD" && ["current", "modes", "users"].includes(parts[2])) {
          sendNoContent(response, 200);
          return true;
        }
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

      if (parts[1] === "navigation" && request.method === "GET" && parts[2] === "admin-menu") {
        ok(response, dataSource.adminNavigationMenu());
        return true;
      }

      if (parts[1] === "dev" && parts[2] === "testing" && parts[3] === "mock-db-state" && request.method === "POST") {
        const body = await readRequestJson(request);
        ok(response, dataSource.replaceTestingState(body.state || {}));
        return true;
      }

      if (parts[1] === "toolbox") {
        if (request.method === "GET" && parts[2] === "votes" && parts[3] === "snapshot") {
          ok(response, dataSource.toolboxVoteSnapshot());
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "cast") {
          const body = await readRequestJson(request);
          ok(response, dataSource.castToolboxVote(body.toolId, body.direction));
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "order") {
          const body = await readRequestJson(request);
          ok(response, dataSource.updateToolboxVoteOrder(body.toolId, body.order));
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "order-list") {
          const body = await readRequestJson(request);
          ok(response, dataSource.reorderToolboxVoteRows(body.toolIds));
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "metadata") {
          const body = await readRequestJson(request);
          ok(response, dataSource.updateToolboxToolMetadata(body.toolId, body));
          return true;
        }
        if (request.method === "GET" && parts[2] === "registry" && parts[3] === "snapshot") {
          ok(response, dataSource.toolRegistrySnapshot());
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
