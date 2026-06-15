import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import {
  createAssetToolMockRepository,
  pickerDiagnosticForRole,
} from "../persistence/tool-repositories/assets-mock-repository.js";
import {
  createTagsToolMockRepository,
} from "../persistence/tool-repositories/tags-mock-repository.js";
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
  getToolById,
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
  createGameWorkspacePaletteRepository,
  normalizePaletteSwatchInput,
  validatePaletteSwatchInput,
} from "../persistence/tool-repositories/palette-workspace-repository.js";
import {
  GAME_CONFIGURATION_PLAYER_MODES,
  GAME_CONFIGURATION_SECTIONS,
  createGameConfigurationMockRepository,
} from "../persistence/tool-repositories/game-configuration-mock-repository.js";
import {
  GAME_DESIGN_GAME_TYPES,
  GAME_DESIGN_GENRES,
  GAME_DESIGN_PLAYER_MODES,
  GAME_DESIGN_PLAY_STYLES,
  createGameDesignMockRepository,
} from "../persistence/tool-repositories/game-design-mock-repository.js";
import {
  GAME_JOURNEY_KEYS,
  GAME_JOURNEY_STATUS_BY_ID,
  GAME_JOURNEY_STATUSES,
  GAME_JOURNEY_SUGGESTED_TOOLS,
  createGameJourneyMockRepository,
} from "../persistence/tool-repositories/game-journey-mock-repository.js";
import {
  GAME_WORKSPACE_MEMBER_ROLES,
  GAME_WORKSPACE_GAME_PURPOSES,
  GAME_WORKSPACE_GAME_STATUSES,
  createGameWorkspaceMockRepository,
} from "../persistence/tool-repositories/game-workspace-mock-repository.js";
import {
  MOCK_DB_KEYS,
  MOCK_DB_SESSION_MODES,
  createMockDbAuditFields,
  getMockDbTableSchemas,
  getMockDbToolGroups,
  normalizeMockDbTables,
} from "../persistence/mock-db-store.js";
import { createServerSeedTables } from "../seed/server-seed-loader.mjs";
import { createPaletteSourceMockDbRows } from "../guest-seeds/palette-source-mock-db.js";
import {
  LOCAL_AUTH_PROVIDER_ID,
  LOCAL_DATABASE_PROVIDER_ID,
  SUPABASE_AUTH_PROVIDER_ID,
  SUPABASE_POSTGRES_PROVIDER_ID,
  SupabaseAuthProviderAdapter,
  SupabasePostgresProviderAdapter,
  createProviderContractSnapshot,
} from "../auth/provider-contract-stubs.mjs";

export const SERVER_DATA_BOUNDARY_RULE = "Browser -> Server API -> Data Source";

const LOCAL_DB_MODE_ID = "local-db";
const LOCAL_DB_NOT_CONFIGURED = "Local DB adapter not configured";
const AUTH_UNAVAILABLE_MESSAGE = "The site is currently unavailable. Please try again later.";
const AUTH_READY_MESSAGE = "Account service is available.";
const ACCOUNT_IDENTITY_SETUP_MESSAGE = "Account identity setup is incomplete. Please contact support.";
const DEFAULT_SUPABASE_ACCOUNT_ROLE = Object.freeze({
  description: "Default creator/player account role.",
  isSystemRole: false,
  name: "User",
  roleSlug: "user",
});
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
  platform_settings: "Platform Settings",
  support_categories: "Support Categories",
  user_roles: "User Roles",
});
const DB_VIEWER_GROUP_ORDER = Object.freeze([
  Object.freeze({ id: "asset", label: "Asset", ownerId: "asset", type: "tool" }),
  Object.freeze({ id: "controls", label: "Controls", ownerId: "controls", type: "tool" }),
  Object.freeze({ id: "game-configuration", label: "Game Configuration", ownerId: "game-configuration", type: "tool" }),
  Object.freeze({ id: "game-design", label: "Game Design", ownerId: "game-design", type: "tool" }),
  Object.freeze({ id: "game-journey", label: "Game Journey", ownerId: "game-journey", type: "tool" }),
  Object.freeze({ id: "game-workspace", label: "Game Workspace", ownerId: "game-workspace", type: "tool" }),
  Object.freeze({ id: "objects", label: "Objects", ownerId: "objects", type: "tool" }),
  Object.freeze({ id: "palette", label: "Palette", ownerId: "palette", type: "tool" }),
  Object.freeze({ id: "tags", label: "Tags", ownerId: "tags", type: "tool" }),
  Object.freeze({ id: "toolbox_tool_metadata", label: "Tool Metadata", tableNames: Object.freeze(["toolbox_tool_metadata"]), type: "table" }),
  Object.freeze({ id: "toolbox_tool_planning", label: "Tool Planning", tableNames: Object.freeze(["toolbox_tool_planning"]), type: "table" }),
  Object.freeze({ id: "tool_state_samples", label: "Tool State Samples", tableNames: Object.freeze(["tool_state_samples"]), type: "table" }),
  Object.freeze({ id: "toolbox_votes", label: "Toolbox Votes", tableNames: DB_VIEWER_TOOLBOX_VOTE_TABLES, type: "table" }),
  Object.freeze({ id: "user_roles", label: "User Roles", tableNames: DB_VIEWER_IDENTITY_TABLES, type: "table" }),
]);
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
  Designer: Object.freeze(["Game Workspace", "Game Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Characters", "Colors", "Assets", "Tags"]),
  "World Builder": Object.freeze(["Worlds", "Objects", "Assets", "Colors", "Tags", "Animations"]),
  Artist: Object.freeze(["Assets", "Colors", "Tags", "Fonts", "Sprites", "Characters", "Objects", "Animations"]),
  "Audio Creator": Object.freeze(["Audio", "Music", "Voices", "MIDI", "Audio Effects", "Voice Capture", "Voice Output", "Assets"]),
  Translator: Object.freeze(["Languages", "Voices", "Voice Capture", "Voice Output"]),
  Tester: Object.freeze(["Game Testing", "Controls", "Hitboxes", "Debug", "Performance", "Events"]),
  Publisher: Object.freeze(["Publish", "Marketplace", "Community", "Cloud", "Languages"]),
  Viewer: Object.freeze(["Game Workspace", "Game Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Assets", "Colors", "Tags", "Audio", "Publish", "Marketplace", "Community", "Languages", "Achievements", "Ratings"]),
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
  Object.freeze({ label: "Site Setup", path: "admin/site-setup.html", route: "admin-site-setup" }),
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

function providerFailureMessage(providerContract, providerId) {
  const failure = providerContract.providerDiagnostics.providerFailures
    .find((candidate) => candidate.providerId === providerId);
  if (failure?.remediation) {
    return failure.remediation;
  }
  return `Selected provider ${providerId} is not available for this Local API route yet.`;
}

function readDocsBuildGuestSeedPackages() {
  const guestSeedDir = path.join(process.cwd(), "docs_build", "database", "seed", "guest");
  try {
    return readdirSync(guestSeedDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort()
      .flatMap((fileName) => {
        const filePath = path.join(guestSeedDir, fileName);
        const seed = JSON.parse(readFileSync(filePath, "utf8"));
        return (seed.samplePackages || []).map((sample) => ({
          ...sample,
          group: seed.group,
          groupKey: seed.groupKey,
          readOnly: true,
          source: `docs_build/database/seed/guest/${fileName}`,
          writableByGuest: false,
        }));
      });
  } catch (error) {
    return [];
  }
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

function dbViewerGroupsForSnapshot(tables, owners) {
  const tableNames = Object.keys(tables).sort();
  const tableNamesForOwner = (ownerId) => tableNames
    .filter((tableName) => owners[tableName] === ownerId)
    .sort();
  const groupedTables = new Set();
  const orderedGroups = DB_VIEWER_GROUP_ORDER
    .map((group) => {
      const groupTableNames = group.ownerId
        ? tableNamesForOwner(group.ownerId)
        : (group.tableNames || []).filter((tableName) => tableNames.includes(tableName));
      groupTableNames.forEach((tableName) => groupedTables.add(tableName));
      return {
        id: group.id,
        label: group.label,
        tableNames: groupTableNames,
        type: group.type,
      };
    })
    .filter((group) => group.tableNames.length > 0);
  const ungroupedStandaloneGroups = tableNames
    .filter((tableName) => !groupedTables.has(tableName))
    .map((tableName) => ({
      id: tableName,
      label: dbViewerStandaloneTableLabel(tableName),
      tableNames: [tableName],
      type: "table",
    }))
    .sort((left, right) => left.label.localeCompare(right.label));

  return [
    {
      id: "all",
      label: "All",
      tableNames,
      type: "all",
    },
    ...orderedGroups,
    ...ungroupedStandaloneGroups,
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
  const registryTool = getToolById(toolKey);
  const toolName = tool.toolName || tool.displayName || tool.name || toolKey;
  const releaseChannel = getToolReleaseChannel(tool.status || tool.releaseChannel);
  const route = String(tool.path || tool.route || getToolRoute(tool) || "").replace(/^\/+/, "");
  const badgePath = tool.badge || tool.imageSources?.badge || "";
  const toolImagePath = tool.toolImage || tool.tool || tool.imageSources?.tool || "";
  const navigation = tool.navigation || registryTool?.navigation || null;
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
    navigation: navigation ? JSON.parse(JSON.stringify(navigation)) : undefined,
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

const RUNTIME_ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const RUNTIME_SOURCE_KEYS = new Map();

function encodeRuntimeUlidPart(value, length) {
  let remaining = BigInt(value);
  let encoded = "";
  for (let index = 0; index < length; index += 1) {
    encoded = RUNTIME_ULID_ALPHABET[Number(remaining % 32n)] + encoded;
    remaining /= 32n;
  }
  return encoded;
}

function runtimeGeneratedUlid() {
  const timePart = encodeRuntimeUlidPart(Date.now(), 10);
  const randomPart = Array.from(randomBytes(16))
    .map((byte) => RUNTIME_ULID_ALPHABET[byte % 32])
    .join("")
    .slice(0, 16);
  return `${timePart}${randomPart}`;
}

function runtimeGeneratedKeyForSource(source) {
  const keySource = String(source || "").trim();
  if (!keySource) {
    return runtimeGeneratedUlid();
  }
  if (!RUNTIME_SOURCE_KEYS.has(keySource)) {
    RUNTIME_SOURCE_KEYS.set(keySource, runtimeGeneratedUlid());
  }
  return RUNTIME_SOURCE_KEYS.get(keySource);
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

function logSafeAuthOperatorDiagnostic(request, requestUrl, error) {
  const route = `${request?.method || "REQUEST"} ${requestUrl?.pathname || "/api/auth"}`;
  if (!String(requestUrl?.pathname || "").startsWith("/api/auth/")) {
    return;
  }
  const diagnostic = String(error?.operatorDiagnostic || error?.message || "No operator diagnostic available.")
    .replace(/[\r\n]+/g, " ")
    .trim();
  console.warn(`[auth/operator] ${route} failed: ${diagnostic}`);
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

function roleSlugsAndDiagnosticsForUserKey(tables, userKey) {
  const roleByKey = new Map((tables.roles || [])
    .filter((role) => role.isActive !== false)
    .map((role) => [role.key, role.roleSlug || role.slug || role.name]));
  const roleRows = (tables.user_roles || []).filter((row) => row.userKey === userKey);
  const missingRoleKeys = roleRows
    .map((row) => row.roleKey)
    .filter((roleKey) => roleKey && !roleByKey.has(roleKey));
  return {
    missingRoleKeys,
    roleRows,
    roleSlugs: roleRows
      .filter((row) => roleByKey.has(row.roleKey))
      .map((row) => roleByKey.get(row.roleKey))
      .filter(Boolean),
  };
}

function modeById(modeId) {
  return MOCK_DB_SESSION_MODES.find((mode) => mode.id === modeId) ||
    MOCK_DB_SESSION_MODES.find((mode) => mode.id === LOCAL_DB_MODE_ID) ||
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

function sessionUserFromIdentityTables(tables, userKey, modeId, providerLabel) {
  const mode = modeById(modeId);
  const key = String(userKey || "");
  if (mode.id !== LOCAL_DB_MODE_ID) {
    return guestSession(mode, mode.diagnostic || LOCAL_DB_NOT_CONFIGURED);
  }
  if (!isUlidKey(key)) {
    return guestSession(mode);
  }

  const user = (tables.users || []).find((record) => record.key === key && record.isActive !== false);
  if (!user) {
    return guestSession(mode, `Selected ${providerLabel} user key ${key} is missing from users.`);
  }

  const { missingRoleKeys, roleRows, roleSlugs } = roleSlugsAndDiagnosticsForUserKey(tables, key);
  if (missingRoleKeys.length) {
    return guestSession(mode, `Selected ${providerLabel} user ${user.displayName || key} references missing role key(s): ${missingRoleKeys.join(", ")}.`);
  }
  if (!roleRows.length) {
    return guestSession(mode, `Selected ${providerLabel} user ${user.displayName || key} has no user_roles assignment.`);
  }
  if (!roleSlugs.length || roleSlugs.includes("system")) {
    return guestSession(mode, `Selected ${providerLabel} user ${user.displayName || key} has no human login role.`);
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

function sessionUserFromKey(tables, userKey, modeId) {
  const mode = modeById(modeId);
  const key = String(userKey || "");
  if (mode.id !== LOCAL_DB_MODE_ID) {
    return guestSession(mode, mode.diagnostic || LOCAL_DB_NOT_CONFIGURED);
  }
  if (!isUlidKey(key)) {
    return guestSession(mode);
  }

  const user = (tables.users || []).find((record) => record.key === key && record.isActive !== false);
  if (!user) {
    return guestSession(mode, `Selected Local user key ${key} is missing from server Local DB users.`);
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

function normalizedAuthEmail(value) {
  return String(value || "").trim();
}

function displayNameFromEmail(email) {
  const localPart = String(email || "").split("@")[0].trim();
  return localPart || "Creator";
}

function sanitizedAuthErrorDiagnostic(error) {
  const message = String(error?.message || error || "").trim();
  const statusMatch = message.match(/HTTP\s+(\d+)/);
  const code = error?.code || error?.cause?.code || "";
  return {
    code,
    httpStatus: statusMatch ? Number(statusMatch[1]) : 0,
    message: statusMatch
      ? `Supabase Auth request failed with HTTP ${statusMatch[1]}.`
      : message
        ? "Supabase Auth request failed before an HTTP status was available."
        : "Supabase Auth request failed.",
  };
}

function safeOperatorDiagnosticValue(value, fallback = "none") {
  const normalized = String(value || "").replace(/[\r\n]+/g, " ").trim();
  if (!normalized) {
    return fallback;
  }
  return normalized
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/apikey\s*[:=]\s*[A-Za-z0-9._~+/=-]+/gi, "apikey=[redacted]");
}

function operatorYesNo(value) {
  if (value === true) {
    return "yes";
  }
  if (value === false) {
    return "no";
  }
  return "unknown";
}

function createAccountUpstreamStatusCode(payload, error) {
  const fromPayload = Number(payload?.__operator?.upstreamStatusCode || 0);
  if (fromPayload) {
    return String(fromPayload);
  }
  const fromError = Number(error?.upstreamStatusCode || error?.status || error?.statusCode || 0);
  if (fromError && fromError !== 503) {
    return String(fromError);
  }
  const diagnostic = error ? sanitizedAuthErrorDiagnostic(error) : null;
  return diagnostic?.httpStatus ? String(diagnostic.httpStatus) : "none";
}

function logCreateAccountOperatorDiagnostic({
  error = null,
  phase,
  payload = null,
  safeErrorCode = "",
  safeMessage = "",
  status = {},
}) {
  const diagnostic = error ? sanitizedAuthErrorDiagnostic(error) : null;
  const fields = [
    `phase=${safeOperatorDiagnosticValue(phase, "unknown")}`,
    `selectedAuthProvider=${safeOperatorDiagnosticValue(status.authProviderId || status.providerId || "unknown")}`,
    `dbProvider=${safeOperatorDiagnosticValue(status.databaseProviderId || "unknown")}`,
    `supabaseConfigured=${operatorYesNo(status.configured ?? status.supabaseConfigPresent)}`,
    `identityTablesReady=${operatorYesNo(status.identityTablesReady)}`,
    `upstreamStatusCode=${createAccountUpstreamStatusCode(payload, error)}`,
    `safeErrorCode=${safeOperatorDiagnosticValue(safeErrorCode || error?.safeErrorCode || diagnostic?.code, "none")}`,
    `safeMessage=${safeOperatorDiagnosticValue(safeMessage || error?.safeErrorMessage || diagnostic?.message, "none")}`,
  ];
  console.warn(`[auth/operator] POST /api/auth/create-account diagnostic ${fields.join(" ")}`);
}

function identityTableCounts(tables = {}) {
  return {
    roles: Array.isArray(tables.roles) ? tables.roles.length : 0,
    user_roles: Array.isArray(tables.user_roles) ? tables.user_roles.length : 0,
    users: Array.isArray(tables.users) ? tables.users.length : 0,
  };
}

function authUnavailableError(action, diagnostic = "") {
  const error = new Error(AUTH_UNAVAILABLE_MESSAGE);
  error.statusCode = 503;
  error.operatorDiagnostic = diagnostic ? `${action}: ${diagnostic}` : `${action}: ${AUTH_UNAVAILABLE_MESSAGE}`;
  return error;
}

function authIdentitySetupError(action, diagnostic = "") {
  const error = new Error(ACCOUNT_IDENTITY_SETUP_MESSAGE);
  error.statusCode = 503;
  error.operatorDiagnostic = diagnostic ? `${action}: ${diagnostic}` : `${action}: ${ACCOUNT_IDENTITY_SETUP_MESSAGE}`;
  return error;
}

function sanitizedSupabaseAuthActionResult(action, email, payload = {}, session = null) {
  const user = payload.user && typeof payload.user === "object" ? payload.user : {};
  const resolvedSession = session && session.authenticated ? session : null;
  return {
    accessTokenExposed: false,
    action,
    email: String(user.email || email || "").trim(),
    externalAuthUserIdPresent: Boolean(user.id),
    localDbSessionCreated: Boolean(resolvedSession),
    message: "Account authentication completed through the account service.",
    passwordStoredLocally: false,
    providerId: SUPABASE_AUTH_PROVIDER_ID,
    refreshTokenExposed: false,
    roleSlugs: resolvedSession ? resolvedSession.roleSlugs : [],
    sessionResolved: Boolean(resolvedSession),
    sessionStoredInBrowser: false,
    status: "PASS",
    userKey: resolvedSession ? resolvedSession.userKey : null,
  };
}

function normalizeOwnedTables(ownerId, tables) {
  return normalizeMockDbTables(ownerId, tables);
}

function gameWorkspaceGameKey(gameId) {
  const normalizedGameId = String(gameId || "").trim();
  if (!normalizedGameId) {
    return "";
  }
  if (isUlidKey(normalizedGameId)) {
    return normalizedGameId;
  }
  return runtimeGeneratedKeyForSource(`game-workspace-game:${normalizedGameId}`);
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

function gameWorkspaceTables(repository) {
  const tables = repository.getTables();
  const activeGame = repository.getActiveGame();
  const progress = repository.getGameProgress();
  const gameWorkspaceGames = tables.games.map((project, index) => ({
    ...snapshotAuditFields(index + 20, MOCK_DB_KEYS.users.user1),
    key: gameWorkspaceGameKey(project.id),
    name: project.name,
    ownerKey: MOCK_DB_KEYS.users.user1,
    status: project.status,
  }));
  const activeGameKey = gameWorkspaceGameKey(activeGame?.id);
  return normalizeOwnedTables("game-workspace", {
    game_workspace_games: gameWorkspaceGames,
    game_workspace_progress: activeGame ? [{
      ...snapshotAuditFields(80, MOCK_DB_KEYS.users.user1),
      key: runtimeGeneratedKeyForSource(`game-workspace-progress:${activeGameKey}`),
      gameKey: activeGameKey,
      currentFocus: progress.currentFocus,
      gameProgress: progress.gameProgress,
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
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      status: record.status,
      title: record.title || `${record.gamePurpose || record.projectPurpose || "Game"} Design`,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || MOCK_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || MOCK_DB_KEYS.users.user1,
    })),
    game_design_validation_items: (tables.game_design_validation_items || []).map((record, index) => ({
      ...snapshotAuditFields(index + 140, MOCK_DB_KEYS.users.user1),
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
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
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      playerMode: record.playerMode || "1 Player",
      status: record.status || record.readinessStatus || "Ready",
      summary: record.gameBasics || [
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
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
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

function controlsTables(repository) {
  return normalizeOwnedTables("controls", repository.getTables());
}

function gameJourneyTables(repository) {
  return normalizeOwnedTables("game-journey", repository.getTables());
}

function paletteTables(repository) {
  return normalizeOwnedTables("palette", {
    ...repository.getTables(),
    palette_source_swatches: createPaletteSourceMockDbRows(),
  });
}

function tagsTables(repository) {
  return normalizeOwnedTables("tags", repository.getTables());
}

function assetTables(repository) {
  return normalizeOwnedTables("asset", repository.getTables());
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

class LocalDevDataSource {
  constructor() {
    this.repositoryCounter = 1;
    this.repositoryById = new Map();
    this.sessionModeId = LOCAL_DB_MODE_ID;
    this.sessionUserKey = "";
    this.identityTablesCache = null;
    this.adapterByModeId = new Map(
      MOCK_DB_SESSION_MODES.map((mode) => [mode.id, new LocalDbAdapter(mode)]),
    );
    this.applyStateSnapshot({
      cleared: false,
      tables: createServerSeedTables(),
    });
    const startupAdapter = this.adapterByModeId.get(this.currentMode().id);
    if (!startupAdapter) {
      throw new Error(`${LOCAL_DB_NOT_CONFIGURED}. Unknown DEV database mode: ${this.currentMode().id || "missing"}.`);
    }
    const adapterState = startupAdapter.readState("Starting Local DB", this.currentStateSnapshot());
    this.applyStateSnapshot(adapterState);
  }

  currentMode() {
    return modeById(this.sessionModeId);
  }

  adapterContract() {
    return {
      ...clone(DB_ADAPTER_CONTRACT),
      providerContract: createProviderContractSnapshot(),
    };
  }

  providerContract() {
    return createProviderContractSnapshot();
  }

  assertLocalAuthProvider(action) {
    const providerContract = this.providerContract();
    const providerId = providerContract.activeProviders.authProviderId;
    if (providerId !== LOCAL_AUTH_PROVIDER_ID) {
      throw new Error(`${action} requires the Local DB auth provider. Selected auth provider is ${providerId}. ${providerFailureMessage(providerContract, providerId)}`);
    }
  }

  assertLocalDatabaseProvider(action) {
    const providerContract = this.providerContract();
    const providerId = providerContract.activeProviders.databaseProviderId;
    if (providerId !== LOCAL_DATABASE_PROVIDER_ID) {
      throw new Error(`${action} requires the Local DB database provider. Selected database provider is ${providerId}. ${providerFailureMessage(providerContract, providerId)}`);
    }
  }

  assertLocalRuntimeProviders(action) {
    this.assertLocalAuthProvider(action);
    this.assertLocalDatabaseProvider(action);
  }

  localAuthSession(action) {
    this.assertLocalAuthProvider(action);
    return sessionUserFromKey(this.standaloneTables, this.sessionUserKey, this.sessionModeId);
  }

  async readSupabaseIdentityTablesUnchecked(action) {
    this.assertLocalDatabaseProvider(action);
    const adapter = new SupabasePostgresProviderAdapter();
    const [users, roles, userRoles] = await Promise.all([
      adapter.getUsers(),
      adapter.getRoles(),
      adapter.getUserRoles(),
    ]);
    this.identityTablesCache = {
      providerId: SUPABASE_AUTH_PROVIDER_ID,
      readerProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      tables: {
        roles: Array.isArray(roles) ? roles : [],
        user_roles: Array.isArray(userRoles) ? userRoles : [],
        users: Array.isArray(users) ? users : [],
      },
    };
    return this.identityTablesCache.tables;
  }

  async readSupabaseIdentityTables(action) {
    this.assertLocalDatabaseProvider(action);
    const authStatus = await this.authStatusForRoute();
    if (!authStatus.ready) {
      if (authStatus.identityTablesReady === false) {
        throw authIdentitySetupError(action, authStatus.operatorDiagnostic || "Account identity tables are not ready.");
      }
      throw authUnavailableError(action, `Supabase Auth identity ownership is not ready. ${authStatus.operatorDiagnostic || authStatus.status}`);
    }
    return this.readSupabaseIdentityTablesUnchecked(action);
  }

  async supabaseIdentityReadinessCheck() {
    try {
      const tables = await this.readSupabaseIdentityTablesUnchecked("Validating Supabase identity tables");
      return {
        diagnostic: "Supabase identity tables are reachable through the server-side provider contract.",
        identityBootstrapReady: true,
        identityTableRecords: identityTableCounts(tables),
        identityTablesReady: true,
      };
    } catch (error) {
      const rawMessage = String(error?.message || error || "");
      const setupDiagnostic = rawMessage.includes("Supabase Postgres") && rawMessage.includes("HTTP 404")
        ? "Identity tables are missing. Run docs_build/database/ddl/account/supabase-identity-tables.sql through the approved Supabase SQL setup path."
        : "";
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      const fallbackDiagnostic = diagnostic.httpStatus
        ? diagnostic.message
        : "Supabase identity table validation failed before an HTTP status was available.";
      return {
        diagnostic: setupDiagnostic || fallbackDiagnostic,
        identityBootstrapReady: false,
        identityTableRecords: {
          roles: 0,
          user_roles: 0,
          users: 0,
        },
        identityTablesReady: false,
      };
    }
  }

  cachedSupabaseIdentitySession() {
    if (!this.identityTablesCache?.tables) {
      return guestSession(this.currentMode(), "Supabase identity tables have not been loaded through the server API yet.");
    }
    return sessionUserFromIdentityTables(
      this.identityTablesCache.tables,
      this.sessionUserKey,
      this.sessionModeId,
      "Supabase identity",
    );
  }

  async currentSessionForRoute() {
    this.assertLocalDatabaseProvider("Reading current session");
    const providerId = this.providerContract().activeProviders.authProviderId;
    if (providerId === LOCAL_AUTH_PROVIDER_ID) {
      return this.localAuthSession("Reading current session");
    }
    if (providerId === SUPABASE_AUTH_PROVIDER_ID) {
      const status = await this.authStatusForRoute();
      if (!status.ready) {
        return guestSession(this.currentMode(), status.operatorDiagnostic || AUTH_UNAVAILABLE_MESSAGE);
      }
      if (!this.sessionUserKey) {
        return guestSession(this.currentMode());
      }
      const tables = await this.readSupabaseIdentityTables("Reading current session");
      return sessionUserFromIdentityTables(tables, this.sessionUserKey, this.sessionModeId, "Supabase identity");
    }
    return guestSession(this.currentMode(), `Selected auth provider is ${providerId}; no session provider contract is available.`);
  }

  async sessionUsersForRoute() {
    this.assertLocalDatabaseProvider("Reading session users");
    const providerId = this.providerContract().activeProviders.authProviderId;
    if (providerId === LOCAL_AUTH_PROVIDER_ID) {
      return this.sessionUsers();
    }
    if (providerId !== SUPABASE_AUTH_PROVIDER_ID) {
      return [guestSession(this.currentMode(), `Selected auth provider is ${providerId}; no session user provider contract is available.`)];
    }
    if (this.sessionModeId !== LOCAL_DB_MODE_ID) {
      return [guestSession(this.currentMode(), this.currentMode().diagnostic || LOCAL_DB_NOT_CONFIGURED)];
    }
    const tables = await this.readSupabaseIdentityTables("Reading session users");
    const guest = sessionUserFromIdentityTables(tables, "", this.sessionModeId, "Supabase identity");
    return [
      guest,
      ...(tables.users || [])
        .map((user) => sessionUserFromIdentityTables(tables, user.key, this.sessionModeId, "Supabase identity"))
        .filter((user) => user.authenticated && !user.roleSlugs.includes("system")),
    ];
  }

  async setUserForRoute(userKey) {
    this.assertLocalDatabaseProvider("Selecting a session user");
    const providerId = this.providerContract().activeProviders.authProviderId;
    if (providerId === LOCAL_AUTH_PROVIDER_ID) {
      return this.setUser(userKey);
    }
    this.sessionUserKey = String(userKey || "");
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSessionForRoute();
  }

  async clearSessionUserForRoute() {
    this.assertLocalDatabaseProvider("Clearing a session user");
    const providerId = this.providerContract().activeProviders.authProviderId;
    if (providerId === LOCAL_AUTH_PROVIDER_ID) {
      return this.clearSessionUser();
    }
    this.sessionUserKey = "";
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSessionForRoute();
  }

  currentAdapter() {
    this.assertLocalDatabaseProvider("Opening Local DB adapter");
    const adapter = this.adapterByModeId.get(this.currentMode().id);
    if (!adapter) {
      throw new Error(`${LOCAL_DB_NOT_CONFIGURED}. Unknown DEV database mode: ${this.currentMode().id || "missing"}.`);
    }
    return adapter;
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
    if (Array.isArray(this.standaloneTables.tool_state_samples)) {
      this.standaloneTables.tool_state_samples = this.standaloneTables.tool_state_samples
        .filter((sample) => sample?.audience !== "guest");
    }
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
    this.gameWorkspaceRepository = createGameWorkspaceMockRepository();
    this.gameWorkspaceRepository.resetGameData();
    this.gameDesignRepository = createGameDesignMockRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
    });
    this.gameConfigurationRepository = createGameConfigurationMockRepository({
      gameDesignRepository: this.gameDesignRepository,
    });
    this.paletteRepository = createGameWorkspacePaletteRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      ...this.sharedOptions,
    });
    this.tagsRepository = createTagsToolMockRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      ...this.sharedOptions,
      sessionUserKey: () => this.sessionUserKey,
      usageProvider: () => this.assetRepository?.listAssets() || [],
    });
    this.assetRepository = createAssetToolMockRepository({
      configurationRepository: this.gameConfigurationRepository,
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      paletteRepository: this.paletteRepository,
      tagsRepository: this.tagsRepository,
      ...this.sharedOptions,
      sessionUserKey: () => this.sessionUserKey,
    });
    this.objectsRepository = createObjectsToolMockRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      ...this.sharedOptions,
    });
    this.inputMappingRepository = createInputMappingToolMockRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      ...this.sharedOptions,
      sessionUserKey: () => this.sessionUserKey,
    });
    this.assetReadyInitialized = false;
    this.sharedOptions.gameWorkspaceRepository = this.gameWorkspaceRepository;
    this.gameJourneyRepository = createGameJourneyMockRepository(this.sharedOptions);
    this.repositoryById.clear();
  }

  persistCurrentAdapterState(action) {
    this.currentAdapter().writeState(action, this.currentStateSnapshot());
  }

  seed(options = {}) {
    const action = "Reseeding Local DB state";
    if (!options.initial) {
      this.assertConfiguredAdapter(action);
    }
    this.applyStateSnapshot({
      cleared: false,
      tables: createServerSeedTables(),
    });
    this.persistCurrentAdapterState(action);
    return this.snapshot();
  }

  adminReseed() {
    const session = this.currentSession();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to run Local DB setup reseed.");
    }
    const snapshot = this.seed();
    return {
      message: "Local DB reseed completed through Admin setup.",
      snapshot,
      status: "PASS",
    };
  }

  adminInitializeIdentity(body = {}) {
    const providerContract = this.providerContract();
    const providerId = providerContract.activeProviders.databaseProviderId;
    if (providerId !== SUPABASE_POSTGRES_PROVIDER_ID) {
      throw new Error(`Admin identity setup requires selected database provider ${SUPABASE_POSTGRES_PROVIDER_ID}. Selected database provider is ${providerId}.`);
    }
    const database = new SupabasePostgresProviderAdapter();
    return database.initializeIdentity(body);
  }

  adminSetupStatus() {
    const snapshot = this.snapshot();
    const tables = snapshot.tables || {};
    const users = tables.users || [];
    const roles = tables.roles || [];
    const userRoles = tables.user_roles || [];
    const roleSlugs = new Set(roles.map((role) => role.roleSlug).filter(Boolean));
    const missingDefaultRoles = ["admin", "creator", "guest", "user"].filter((roleSlug) => !roleSlugs.has(roleSlug));
    const adminRoleKeys = new Set(roles
      .filter((role) => role.roleSlug === "admin")
      .map((role) => role.key));
    const adminUserKeys = new Set(userRoles
      .filter((row) => adminRoleKeys.has(row.roleKey))
      .map((row) => row.userKey));
    const firstAdminReady = users.some((user) => adminUserKeys.has(user.key) && user.isActive !== false);
    const toolMetadataCount = (tables.toolbox_tool_metadata || []).length;
    const platformSettingsCount = (tables.platform_settings || []).length;
    const supportCategoriesCount = (tables.support_categories || []).length;
    const areas = [
      {
        action: "Assign the initial admin user",
        id: "first-admin",
        label: "First Admin",
        status: firstAdminReady ? "PASS" : "FAIL",
        message: firstAdminReady
          ? "At least one active user has the admin role through user_roles."
          : "Create or assign the first admin through Admin -> Site Setup before promotion.",
      },
      {
        action: "Create approved role records",
        id: "default-roles",
        label: "Default Roles",
        status: missingDefaultRoles.length ? "WARN" : "PASS",
        message: missingDefaultRoles.length
          ? `Missing default role slug(s): ${missingDefaultRoles.join(", ")}.`
          : "Default role slugs are present.",
      },
      {
        action: "Seed active tool metadata",
        id: "tool-metadata-bootstrap",
        label: "Tool Metadata Bootstrap",
        status: toolMetadataCount ? "PASS" : "FAIL",
        message: toolMetadataCount
          ? `${toolMetadataCount} tool metadata rows are available through the Local API.`
          : "Tool metadata rows are missing from the Local API setup state.",
      },
      {
        action: "Create baseline settings records",
        id: "starter-platform-settings",
        label: "Starter Platform Settings",
        status: platformSettingsCount ? "PASS" : "FAIL",
        message: platformSettingsCount
          ? `${platformSettingsCount} starter platform setting row(s) are available through the Local API.`
          : "Starter platform settings are missing from the Local API setup state.",
      },
      {
        action: "Prepare support category setup",
        id: "support-categories",
        label: "Support Categories",
        status: supportCategoriesCount ? "PASS" : "FAIL",
        message: supportCategoriesCount
          ? `${supportCategoriesCount} support category row(s) are available through the Local API.`
          : "Support categories are missing from the Local API setup state.",
      },
    ];
    const statusCounts = areas.reduce((counts, area) => {
      counts[area.status] = (counts[area.status] || 0) + 1;
      return counts;
    }, {});
    const status = statusCounts.FAIL ? "FAIL" : (statusCounts.WARN || statusCounts.SKIP ? "WARN" : "PASS");
    return {
      areas,
      message: `Site Setup status checked ${areas.length} setup areas.`,
      ownership: "Admin -> Site Setup",
      provider: this.providerContract().activeProviders,
      status,
      statusCounts,
    };
  }

  guestSeedPackages() {
    const packages = readDocsBuildGuestSeedPackages();
    return {
      readOnly: true,
      route: "/api/guest/seed",
      source: "docs_build/database/seed/guest/",
      packages,
      status: packages.length ? "PASS" : "WARN",
      warning: packages.length ? "" : "No docs_build guest seed packages were found.",
    };
  }

  clear() {
    this.assertConfiguredAdapter("Clearing Local DB state");
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
    this.assertConfiguredAdapter("Replacing Local DB testing state");
    this.applyStateSnapshot(state);
    const snapshot = this.snapshot();
    this.persistCurrentAdapterState("Replacing Local DB testing state");
    return snapshot;
  }

  setMode(modeId) {
    this.assertLocalRuntimeProviders("Selecting a local session mode");
    const nextMode = MOCK_DB_SESSION_MODES.find((mode) => mode.id === modeId);
    if (!nextMode) {
      throw new Error(`Unknown local login environment: ${modeId || "missing"}.`);
    }
    this.persistCurrentAdapterState("Saving current local data source before mode switch");
    const currentFallbackState = this.currentStateSnapshot();
    const nextAdapter = this.adapterByModeId.get(nextMode.id);
    const nextState = nextAdapter.readState("Selecting Local DB", currentFallbackState);
    this.sessionModeId = nextMode.id;
    this.applyStateSnapshot(nextState);
    return clone(nextMode);
  }

  setUser(userKey) {
    this.assertLocalRuntimeProviders("Selecting a session user");
    this.sessionUserKey = String(userKey || "");
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSession();
  }

  clearSessionUser() {
    this.assertLocalRuntimeProviders("Clearing a session user");
    this.sessionUserKey = "";
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSession();
  }

  authStatus() {
    const providerContract = this.providerContract();
    const authProviderId = providerContract.activeProviders.authProviderId;
    const databaseProviderId = providerContract.activeProviders.databaseProviderId;
    const selected = authProviderId === SUPABASE_AUTH_PROVIDER_ID;
    const localDbProductDataActive = databaseProviderId === LOCAL_DATABASE_PROVIDER_ID;
    const configured = providerContract.supabaseAuth.configured === true;
    const failure = providerContract.providerDiagnostics.providerFailures
      .find((candidate) => candidate.providerId === authProviderId || candidate.providerId === SUPABASE_AUTH_PROVIDER_ID);
    const missingBrowserSafeEnvironmentVariables = providerContract.supabaseAuth.missingBrowserSafeEnvironmentVariables || [];
    const connectivityStatus = configured ? "not-checked" : "not-configured";
    let operatorDiagnostic = "";
    let status = "unavailable";

    if (!selected) {
      operatorDiagnostic = configured
        ? `Supabase Auth configuration is present, but selected auth provider is ${authProviderId}. Set GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth to activate external account authentication while keeping GAMEFOUNDRY_DB_PROVIDER=local-db for product data.`
        : `Supabase Auth provider is not selected. Selected auth provider is ${authProviderId}; Supabase Auth configuration is not complete.`;
      status = "provider-not-selected";
    } else if (!localDbProductDataActive) {
      operatorDiagnostic = "Supabase Auth activation keeps Local DB active for product data; the selected database provider is not Local DB.";
      status = "unavailable";
    } else if (!configured) {
      operatorDiagnostic = providerContract.supabaseAuth.diagnostic || "Supabase Auth is missing required browser-safe environment configuration.";
      status = "unavailable";
    } else if (failure) {
      operatorDiagnostic = failure.remediation || providerContract.supabaseAuth.diagnostic || "Supabase Auth provider is not ready.";
      status = "unavailable";
    } else {
      operatorDiagnostic = "Supabase Auth is configured. Account actions use the external auth provider while product data remains Local DB.";
      status = "ready";
    }
    const message = status === "ready" ? AUTH_READY_MESSAGE : AUTH_UNAVAILABLE_MESSAGE;

    return {
      actionRequired: status === "ready" ? "" : message,
      authProviderId,
      boundary: SERVER_DATA_BOUNDARY_RULE,
      configured,
      connectivityHealthy: null,
      connectivityStatus,
      databaseProviderId,
      localDbProductDataActive,
      message,
      missingBrowserSafeEnvironmentVariables,
      noAutomaticFallback: true,
      operatorDiagnostic,
      operatorPreflightPath: "/api/auth/operator-preflight",
      passwordStorage: "external-provider",
      providerId: SUPABASE_AUTH_PROVIDER_ID,
      ready: status === "ready",
      selected,
      supabaseConfigPresent: configured,
      supabaseConnectivityStatus: connectivityStatus,
      supabaseProviderNotSelected: !selected,
      supabaseProviderSelected: selected,
      status,
    };
  }

  async authConnectivityCheck(status = this.authStatus()) {
    if (!status.supabaseConfigPresent) {
      return {
        connectivityHealthy: false,
        connectivityHttpStatus: 0,
        connectivityStatus: "not-configured",
        diagnostic: "Supabase Auth connectivity cannot be checked until configuration is present.",
      };
    }
    try {
      const adapter = new SupabaseAuthProviderAdapter();
      await adapter.request("/auth/v1/health", {
        operation: "status",
      });
      return {
        connectivityHealthy: true,
        connectivityHttpStatus: 0,
        connectivityStatus: "healthy",
        diagnostic: "Supabase Auth endpoint responded successfully.",
      };
    } catch (error) {
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      return {
        connectivityHealthy: false,
        connectivityHttpStatus: diagnostic.httpStatus,
        connectivityStatus: "failed",
        diagnostic: diagnostic.httpStatus
          ? diagnostic.message
          : `${diagnostic.message}${diagnostic.code ? ` (${diagnostic.code})` : ""}`,
      };
    }
  }

  async authStatusForRoute() {
    const status = this.authStatus();
    if (!status.selected || !status.configured || !status.localDbProductDataActive || status.status !== "ready") {
      return status;
    }
    const connectivity = await this.authConnectivityCheck(status);
    if (!connectivity.connectivityHealthy) {
      return {
        ...status,
        actionRequired: AUTH_UNAVAILABLE_MESSAGE,
        connectivityHealthy: false,
        connectivityHttpStatus: connectivity.connectivityHttpStatus || undefined,
        connectivityStatus: connectivity.connectivityStatus,
        message: AUTH_UNAVAILABLE_MESSAGE,
        operatorDiagnostic: `Supabase Auth configuration is present but readiness could not be proven. ${connectivity.diagnostic}`,
        ready: false,
        status: "unavailable",
        supabaseConnectivityStatus: connectivity.connectivityStatus,
      };
    }
    const identity = await this.supabaseIdentityReadinessCheck();
    if (!identity.identityTablesReady) {
      return {
        ...status,
        actionRequired: ACCOUNT_IDENTITY_SETUP_MESSAGE,
        connectivityHealthy: true,
        connectivityStatus: "healthy",
        identityBootstrapReady: false,
        identityTableRecords: identity.identityTableRecords,
        identityTablesReady: false,
        message: ACCOUNT_IDENTITY_SETUP_MESSAGE,
        operatorDiagnostic: `Supabase Auth is reachable, but identity table readiness could not be proven. ${identity.diagnostic}`,
        ready: false,
        status: "unavailable",
        supabaseConnectivityStatus: "healthy",
      };
    }
    return {
      ...status,
      connectivityHealthy: true,
      connectivityStatus: "healthy",
      identityBootstrapReady: true,
      identityTableRecords: identity.identityTableRecords,
      identityTablesReady: true,
      operatorDiagnostic: "Supabase Auth is selected, configured, reachable, identity tables are available, and product data remains Local DB.",
      ready: true,
      status: "ready",
      supabaseConnectivityStatus: "healthy",
    };
  }

  async authOperatorPreflight() {
    const status = this.authStatus();
    const checks = [
      {
        id: "supabase-config-present",
        status: status.supabaseConfigPresent ? "PASS" : "FAIL",
        summary: status.supabaseConfigPresent
          ? "Supabase Auth browser-safe configuration is present."
          : "Supabase Auth browser-safe configuration is missing.",
      },
      {
        id: "supabase-provider-selected",
        status: status.supabaseProviderSelected ? "PASS" : "WARN",
        summary: status.supabaseProviderSelected
          ? "Supabase Auth is the selected auth provider."
          : `Selected auth provider is ${status.authProviderId}; Supabase Auth is not selected.`,
      },
      {
        id: "local-db-product-data",
        status: status.localDbProductDataActive ? "PASS" : "FAIL",
        summary: status.localDbProductDataActive
          ? "Product data remains on Local DB for this preflight."
          : `Product data provider is ${status.databaseProviderId}; expected ${LOCAL_DATABASE_PROVIDER_ID}.`,
      },
    ];
    const connectivity = await this.authConnectivityCheck(status);

    checks.push({
      id: "supabase-connectivity",
      httpStatus: connectivity.connectivityHttpStatus || undefined,
      status: connectivity.connectivityStatus === "healthy" ? "PASS" : status.supabaseConfigPresent ? "FAIL" : "SKIP",
      summary: connectivity.diagnostic,
    });
    const identity = connectivity.connectivityStatus === "healthy"
      ? await this.supabaseIdentityReadinessCheck()
      : {
        diagnostic: "Supabase identity table validation requires healthy Supabase Auth connectivity first.",
        identityTableRecords: {
          roles: 0,
          user_roles: 0,
          users: 0,
        },
        identityTablesReady: false,
      };

    checks.push({
      id: "supabase-identity-tables",
      records: identity.identityTableRecords,
      status: identity.identityTablesReady ? "PASS" : connectivity.connectivityStatus === "healthy" ? "FAIL" : "SKIP",
      summary: identity.diagnostic,
    });

    return {
      authProviderId: status.authProviderId,
      browserMessage: AUTH_UNAVAILABLE_MESSAGE,
      checks,
      configured: status.configured,
      connectivityHealthy: connectivity.connectivityStatus === "healthy",
      connectivityStatus: connectivity.connectivityStatus,
      databaseProviderId: status.databaseProviderId,
      localDbProductDataActive: status.localDbProductDataActive,
      identityTableRecords: identity.identityTableRecords,
      identityTablesReady: identity.identityTablesReady,
      noAutomaticFallback: true,
      operatorDiagnostic: status.operatorDiagnostic,
      operatorOnly: true,
      providerId: SUPABASE_AUTH_PROVIDER_ID,
      selected: status.selected,
      status: connectivity.connectivityStatus === "healthy" ? "healthy" : connectivity.connectivityStatus,
      supabaseConfigPresent: status.supabaseConfigPresent,
      supabaseProviderNotSelected: status.supabaseProviderNotSelected,
      supabaseProviderSelected: status.supabaseProviderSelected,
    };
  }

  async authAdapterForAction(action) {
    const status = await this.authStatusForRoute();
    if (!status.ready) {
      if (status.identityTablesReady === false) {
        throw authIdentitySetupError(action, `Account identity setup is incomplete. ${status.operatorDiagnostic || status.status}`);
      }
      throw authUnavailableError(action, `Supabase Auth is not ready. ${status.operatorDiagnostic || status.status}`);
    }
    return new SupabaseAuthProviderAdapter();
  }

  async resolvedSessionForAuthPayload(action, email, payload = {}) {
    const authUser = payload.user && typeof payload.user === "object" ? payload.user : {};
    const authUserId = String(authUser.id || "").trim();
    const authEmail = normalizedAuthEmail(authUser.email || email);
    if (!authUserId && !authEmail) {
      throw authUnavailableError(action, "Supabase Auth did not return an account identity to resolve.");
    }
    const tables = await this.readSupabaseIdentityTables(`${action} session resolution`);
    const matchingUser = (tables.users || []).find((user) => {
      if (user.isActive === false || user.authProvider !== SUPABASE_AUTH_PROVIDER_ID) {
        return false;
      }
      return (authUserId && String(user.authProviderUserId || "") === authUserId) ||
        (authEmail && normalizedAuthEmail(user.email).toLowerCase() === authEmail.toLowerCase());
    });
    if (!matchingUser) {
      throw authIdentitySetupError(action, "Account authentication succeeded, but no matching users record exists for this account.");
    }
    const session = sessionUserFromIdentityTables(tables, matchingUser.key, this.sessionModeId, "Supabase identity");
    if (!session.authenticated) {
      throw authIdentitySetupError(action, session.diagnostic || "Account identity session could not be resolved.");
    }
    this.sessionUserKey = matchingUser.key;
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return session;
  }

  async provisionSupabaseIdentityForAuthPayload(action, email, payload = {}) {
    const authUser = payload.user && typeof payload.user === "object" ? payload.user : {};
    const authUserId = String(authUser.id || "").trim();
    const authEmail = normalizedAuthEmail(authUser.email || email);
    if (!authUserId || !authEmail) {
      throw authIdentitySetupError(action, "Supabase Auth did not return the user id and email required for identity provisioning.");
    }

    const adapter = new SupabasePostgresProviderAdapter();
    const tables = await this.readSupabaseIdentityTablesUnchecked(`${action} identity provisioning`);
    const users = tables.users || [];
    const roles = tables.roles || [];
    const userRoles = tables.user_roles || [];
    const matchingByProviderId = users.find((user) => user.authProvider === SUPABASE_AUTH_PROVIDER_ID &&
      String(user.authProviderUserId || "") === authUserId);
    const matchingByEmail = users.find((user) => normalizedAuthEmail(user.email).toLowerCase() === authEmail.toLowerCase());
    if (matchingByProviderId && matchingByEmail && matchingByProviderId.key !== matchingByEmail.key) {
      throw authIdentitySetupError(action, "Account identity maps to conflicting users records.");
    }
    const matchingUser = matchingByProviderId || matchingByEmail || null;
    if (matchingUser?.authProvider && matchingUser.authProvider !== SUPABASE_AUTH_PROVIDER_ID) {
      throw authIdentitySetupError(action, "Existing users record is owned by a different account provider.");
    }
    if (matchingUser?.authProviderUserId && String(matchingUser.authProviderUserId) !== authUserId) {
      throw authIdentitySetupError(action, "Existing users record is linked to a different account identity.");
    }

    const timestamp = new Date().toISOString();
    const userKey = matchingUser?.key || adapter.createRecordKey();
    const userRecord = adapter.normalizeUserRecord({
      ...matchingUser,
      authProvider: SUPABASE_AUTH_PROVIDER_ID,
      authProviderUserId: authUserId,
      displayName: matchingUser?.displayName || displayNameFromEmail(authEmail),
      email: authEmail,
      key: userKey,
    }, userKey, timestamp);
    await adapter.upsertTable("users", [userRecord]);

    let roleRecord = roles.find((role) => role.roleSlug === DEFAULT_SUPABASE_ACCOUNT_ROLE.roleSlug && role.isActive !== false);
    let roleCreated = false;
    if (!roleRecord) {
      roleRecord = adapter.normalizeRoleRecord({
        ...DEFAULT_SUPABASE_ACCOUNT_ROLE,
        key: adapter.createRecordKey(),
      }, userKey, timestamp);
      await adapter.upsertTable("roles", [roleRecord]);
      roleCreated = true;
    }

    const existingUserRole = userRoles.find((row) => row.userKey === userKey && row.roleKey === roleRecord.key);
    let userRoleCreated = false;
    if (!existingUserRole) {
      const userRoleRecord = adapter.normalizeUserRoleRecord({
        key: adapter.createRecordKey(),
        roleKey: roleRecord.key,
        userKey,
      }, new Map(), userKey, timestamp);
      await adapter.upsertTable("user_roles", [userRoleRecord]);
      userRoleCreated = true;
    }

    const refreshedTables = await this.readSupabaseIdentityTablesUnchecked(`${action} identity provisioning result`);
    const session = sessionUserFromIdentityTables(refreshedTables, userKey, this.sessionModeId, "Supabase identity");
    if (!session.authenticated) {
      throw authIdentitySetupError(action, session.diagnostic || "Provisioned account identity session could not be validated.");
    }

    return {
      identityProvisioned: true,
      identityTableRecords: identityTableCounts(refreshedTables),
      roleCreated,
      roleSlugs: session.roleSlugs,
      userKey,
      userRoleCreated,
    };
  }

  async authSignIn(body = {}) {
    const adapter = await this.authAdapterForAction("Sign in");
    const email = normalizedAuthEmail(body.email || body.identity);
    try {
      const payload = await adapter.signIn({
        email,
        password: body.password,
      });
      const session = await this.resolvedSessionForAuthPayload("Sign in", email, payload);
      return sanitizedSupabaseAuthActionResult("sign-in", email, payload, session);
    } catch (error) {
      if (error?.statusCode === 503) {
        throw error;
      }
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      throw authUnavailableError("Sign in", diagnostic.message);
    }
  }

  async authCreateAccount(body = {}) {
    const operatorStatus = await this.authStatusForRoute();
    logCreateAccountOperatorDiagnostic({
      phase: "start",
      safeMessage: "ready-check-complete",
      status: operatorStatus,
    });
    let adapter = null;
    try {
      adapter = await this.authAdapterForAction("Create account");
    } catch (error) {
      logCreateAccountOperatorDiagnostic({
        error,
        phase: "provider-not-ready",
        status: operatorStatus,
      });
      throw error;
    }
    const email = normalizedAuthEmail(body.email || body.identity);
    let payload = null;
    try {
      payload = await adapter.createAccount({
        email,
        password: body.password,
      });
    } catch (error) {
      logCreateAccountOperatorDiagnostic({
        error,
        phase: "upstream-failed",
        status: operatorStatus,
      });
      if (error?.statusCode === 503) {
        throw error;
      }
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      throw authUnavailableError("Create account", diagnostic.message);
    }

    let identity = null;
    try {
      identity = await this.provisionSupabaseIdentityForAuthPayload("Create account", email, payload);
    } catch (error) {
      logCreateAccountOperatorDiagnostic({
        error,
        payload,
        phase: "identity-provisioning-failed",
        safeMessage: error?.operatorDiagnostic || error?.message || "identity provisioning failed",
        status: operatorStatus,
      });
      if (error?.message === ACCOUNT_IDENTITY_SETUP_MESSAGE) {
        throw error;
      }
      const diagnostic = error?.operatorDiagnostic || sanitizedAuthErrorDiagnostic(error).message;
      throw authIdentitySetupError("Create account", diagnostic);
    }

    logCreateAccountOperatorDiagnostic({
      payload,
      phase: "success",
      safeMessage: "account-created-and-identity-provisioned",
      status: {
        ...operatorStatus,
        identityTablesReady: true,
      },
    });

    return {
      ...sanitizedSupabaseAuthActionResult("create-account", email, payload),
      identityProvisioned: identity.identityProvisioned,
      identityTableRecords: identity.identityTableRecords,
      message: "Account created. You can sign in after confirming your email.",
      roleCreated: identity.roleCreated,
      roleSlugs: identity.roleSlugs,
      userKey: identity.userKey,
      userRoleCreated: identity.userRoleCreated,
    };
  }

  async authPasswordReset(body = {}, redirectTo = "") {
    const adapter = await this.authAdapterForAction("Password reset");
    const email = normalizedAuthEmail(body.email || body.identity);
    try {
      const payload = await adapter.requestPasswordReset({
        email,
        redirectTo,
      });
      return {
        ...sanitizedSupabaseAuthActionResult("password-reset", email, payload),
        message: "If an account exists for that email, password reset instructions will be sent.",
        redirectToIncluded: Boolean(redirectTo),
      };
    } catch (error) {
      if (error?.statusCode === 503) {
        throw error;
      }
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      throw authUnavailableError("Password reset", diagnostic.message);
    }
  }

  currentSession() {
    this.assertLocalDatabaseProvider("Reading current session");
    const providerContract = this.providerContract();
    const providerId = providerContract.activeProviders.authProviderId;
    if (providerId === SUPABASE_AUTH_PROVIDER_ID) {
      return this.cachedSupabaseIdentitySession();
    }
    if (providerId !== LOCAL_AUTH_PROVIDER_ID) {
      return guestSession(this.currentMode(), `Selected auth provider is ${providerId}; no session provider contract is available.`);
    }
    return this.localAuthSession("Reading current session");
  }

  sessionModes() {
    this.assertLocalRuntimeProviders("Reading session modes");
    return clone(MOCK_DB_SESSION_MODES);
  }

  sessionUsers() {
    this.assertLocalRuntimeProviders("Reading session users");
    if (this.sessionModeId !== LOCAL_DB_MODE_ID) {
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
      throw new Error("Sign in required to record Toolbox votes.");
    }
    return session.userKey;
  }

  toolboxVoteKey(toolId, voterKey) {
    return runtimeGeneratedUlid();
  }

  toolboxToolMetadataKey(toolId) {
    return runtimeGeneratedKeyForSource(`toolbox-tool-metadata:${toolId}`);
  }

  toolboxToolPlanningKey(toolId) {
    return runtimeGeneratedKeyForSource(`toolbox-tool-planning:${toolId}`);
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
    if (toolId === "workspace") return this.gameWorkspaceRepository;
    if (toolId === "game-workspace") return this.gameWorkspaceRepository;
    if (toolId === "game-design") return this.gameDesignRepository;
    if (toolId === "game-configuration") return this.gameConfigurationRepository;
    if (toolId === "objects") return this.objectsRepository;
    if (toolId === "controls") return this.inputMappingRepository;
    if (toolId === "game-journey") return this.gameJourneyRepository;
    if (toolId === "palette") return this.paletteRepository;
    if (toolId === "colors") return this.paletteRepository;
    if (toolId === "tags") return this.tagsRepository;
    if (toolId === "asset") return this.assetRepository;
    if (toolId === "assets") return this.assetRepository;
    throw new Error(`Unknown toolbox API data source: ${toolId}.`);
  }

  constantsForTool(toolId) {
    this.assertConfiguredAdapter(`Reading ${toolId} constants`);
    if (toolId === "game-workspace") {
      return {
        GAME_WORKSPACE_MEMBER_ROLES,
        GAME_WORKSPACE_GAME_PURPOSES,
        GAME_WORKSPACE_GAME_STATUSES,
      };
    }
    if (toolId === "game-design") {
      return {
        GAME_DESIGN_GAME_TYPES,
        GAME_DESIGN_GENRES,
        GAME_DESIGN_PLAYER_MODES,
        GAME_DESIGN_PLAY_STYLES,
      };
    }
    if (toolId === "game-configuration") {
      return {
        GAME_CONFIGURATION_PLAYER_MODES,
        GAME_CONFIGURATION_SECTIONS,
      };
    }
    if (toolId === "objects") {
      return {
        CAPABILITY_LABELS: this.objectsRepository.CAPABILITY_LABELS,
        OBJECT_TYPE_TEMPLATES: this.objectsRepository.OBJECT_TYPE_TEMPLATES,
        OBJECTS_TOOL_TABLES: this.objectsRepository.OBJECTS_TOOL_TABLES,
        STARTER_OBJECTS: this.objectsRepository.STARTER_OBJECTS,
      };
    }
    if (toolId === "controls") {
      return {
        COMMON_DEFAULT_GAME_CONTROLS: this.inputMappingRepository.COMMON_DEFAULT_GAME_CONTROLS,
        CONTROL_EVENT_OPTIONS: this.inputMappingRepository.CONTROL_EVENT_OPTIONS,
        ENGINE_OWNED_NORMALIZED_INPUTS: this.inputMappingRepository.ENGINE_OWNED_NORMALIZED_INPUTS,
        GAME_CONTROL_NORMALIZED_INPUTS: this.inputMappingRepository.GAME_CONTROL_NORMALIZED_INPUTS,
        INPUT_MAPPING_TOOL_TABLES: this.inputMappingRepository.INPUT_MAPPING_TOOL_TABLES,
        NORMALIZED_USAGE_LABELS: this.inputMappingRepository.NORMALIZED_USAGE_LABELS,
      };
    }
    if (toolId === "game-journey") {
      return {
        GAME_JOURNEY_KEYS,
        GAME_JOURNEY_STATUS_BY_ID,
        GAME_JOURNEY_STATUSES,
        GAME_JOURNEY_SUGGESTED_TOOLS,
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
    if (toolId === "tags") {
      return {
        TAGS_TOOL_TABLES: this.tagsRepository.TAGS_TOOL_TABLES,
      };
    }
    if (toolId === "asset" || toolId === "assets") {
      return {
        ASSET_ROLE_DEFINITIONS: this.assetRepository.ASSET_ROLE_DEFINITIONS,
        ASSET_CATALOG_TYPES: this.assetRepository.ASSET_CATALOG_TYPES,
        ASSET_TOOL_TABLES: this.assetRepository.ASSET_TOOL_TABLES,
        ASSET_TYPES: this.assetRepository.ASSET_TYPES,
        ASSET_USAGE_OPTIONS: this.assetRepository.ASSET_USAGE_OPTIONS,
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
      repository = createGameWorkspacePaletteRepository({
        gameWorkspaceRepository: this.gameWorkspaceRepository,
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
    if (repository === this.assetRepository && (methodName === "importAsset" || methodName === "addAssetRecord")) {
      this.assetReadyInitialized = true;
    }
    const result = method(...args);
    this.persistCurrentAdapterState(`Persisting ${methodName} result`);
    return result;
  }

  snapshot(options = {}) {
    if (!options.skipAdapterCheck) {
      this.assertConfiguredAdapter("Reading Local DB state");
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
        viewerGroups: dbViewerGroupsForSnapshot(tables, owners),
        version: 3,
      };
    }

    const tables = {
      ...this.standaloneTables,
      ...gameWorkspaceTables(this.gameWorkspaceRepository),
      ...gameDesignTables(this.gameDesignRepository),
      ...gameConfigurationTables(this.gameConfigurationRepository),
      ...objectsTables(this.objectsRepository),
      ...controlsTables(this.inputMappingRepository),
      ...gameJourneyTables(this.gameJourneyRepository),
      ...paletteTables(this.paletteRepository),
      ...tagsTables(this.tagsRepository),
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
      viewerGroups: dbViewerGroupsForSnapshot(tables, owners),
      version: 3,
    };
  }
}

export function createLocalApiRouter() {
  const dataSource = new LocalDevDataSource();

  return async function handleLocalApiRequest(request, response, requestUrl) {
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
          ok(response, await dataSource.currentSessionForRoute());
          return true;
        }
        if (request.method === "GET" && parts[2] === "modes") {
          ok(response, dataSource.sessionModes());
          return true;
        }
        if (request.method === "GET" && parts[2] === "users") {
          ok(response, await dataSource.sessionUsersForRoute());
          return true;
        }
        if (request.method === "GET" && parts[2] === "provider-contract") {
          ok(response, dataSource.providerContract());
          return true;
        }
        if (request.method === "POST" && parts[2] === "mode") {
          const body = await readRequestJson(request);
          ok(response, {
            mode: dataSource.setMode(body.modeId),
            sessionUser: await dataSource.currentSessionForRoute(),
          });
          return true;
        }
        if (request.method === "POST" && parts[2] === "user") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.setUserForRoute(body.userKey));
          return true;
        }
        if (request.method === "POST" && parts[2] === "logout") {
          ok(response, await dataSource.clearSessionUserForRoute());
          return true;
        }
      }

      if (parts[1] === "auth") {
        if (request.method === "GET" && parts[2] === "status") {
          ok(response, await dataSource.authStatusForRoute());
          return true;
        }
        if (request.method === "GET" && parts[2] === "operator-preflight") {
          ok(response, await dataSource.authOperatorPreflight());
          return true;
        }
        if (request.method === "POST" && parts[2] === "sign-in") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.authSignIn(body));
          return true;
        }
        if (request.method === "POST" && parts[2] === "create-account") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.authCreateAccount(body));
          return true;
        }
        if (request.method === "POST" && parts[2] === "password-reset") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.authPasswordReset(body, `${requestUrl.origin}/account/password-reset.html`));
          return true;
        }
      }

      if (parts[1] === "local-db" || parts[1] === "mock-db") {
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

      if (parts[1] === "admin" && parts[2] === "setup" && request.method === "POST" && parts[3] === "reseed") {
        ok(response, dataSource.adminReseed());
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "setup" && request.method === "GET" && parts[3] === "status") {
        ok(response, dataSource.adminSetupStatus());
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "setup" && request.method === "POST" && parts[3] === "identity") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.adminInitializeIdentity(body));
        return true;
      }

      if (parts[1] === "guest" && parts[2] === "seed" && request.method === "GET") {
        ok(response, dataSource.guestSeedPackages());
        return true;
      }

      if (parts[1] === "data-source" && request.method === "GET" && parts[2] === "adapter-contract") {
        ok(response, dataSource.adapterContract());
        return true;
      }

      if (parts[1] === "providers" && request.method === "GET" && parts[2] === "contract") {
        ok(response, dataSource.providerContract());
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
      logSafeAuthOperatorDiagnostic(request, requestUrl, error);
      fail(response, error?.statusCode || 500, error);
      return true;
    }
  };
}
