import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
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
  createMockDbAuditFields,
  getMockDbTableSchemas,
  getMockDbToolGroups,
  normalizeMockDbTables,
} from "../persistence/mock-db-store.js";
import { createServerSeedTables } from "../seed/server-seed-loader.mjs";
import { createPaletteSourceMockDbRows } from "../guest-seeds/palette-source-mock-db.js";
import {
  SUPABASE_AUTH_PROVIDER_ID,
  SUPABASE_POSTGRES_PROVIDER_ID,
  SUPABASE_POSTGRES_PRODUCT_TABLES,
  SupabaseAuthProviderAdapter,
  SupabasePostgresProviderAdapter,
  createProviderContractSnapshot,
} from "../auth/provider-contract-stubs.mjs";

export const SERVER_DATA_BOUNDARY_RULE = "Browser -> Server API -> Data Source";

const FIXED_ACCOUNT_SESSION_MODE = Object.freeze({
  adapterId: "supabase-postgres",
  adapterName: "SupabasePostgresProviderAdapter",
  configured: true,
  environment: "Account",
  id: "account-session",
  label: "Account",
  persistence: "Server account session",
  selectableOnLocalLogin: false,
  status: "fixed-runtime",
});
const AUTH_UNAVAILABLE_MESSAGE = "The site is currently unavailable. Please try again later.";
const AUTH_READY_MESSAGE = "Account service is available.";
const ACCOUNT_IDENTITY_SETUP_MESSAGE = "Account identity setup is incomplete. Please contact support.";
const PASSWORD_RESET_RATE_LIMIT_MESSAGE = "Too many reset requests. Please wait and try again later.";
const DEPRECATED_LOCAL_DB_ENDPOINT_MESSAGE = "Deprecated database endpoint is disabled. Use the server API service contract routes.";
const DEFAULT_SUPABASE_ACCOUNT_ROLE = Object.freeze({
  description: "Default authenticated Creator role.",
  isSystemRole: false,
  name: "Creator",
  roleSlug: "creator",
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
  connections: Object.freeze([
    Object.freeze({
      adapterId: "account-session",
      adapterName: "SupabaseAuthProviderAdapter",
      connection: "account",
      persistence: "server account session",
      selectableOnLocalLogin: false,
      status: "configured",
    }),
    Object.freeze({
      adapterId: "product-data",
      adapterName: "SupabasePostgresProviderAdapter",
      connection: "product data",
      persistence: "server product data",
      selectableOnLocalLogin: false,
      status: "configured",
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
  return `Runtime connections are fixed to the configured account and product data services; ${providerId} is not available for this server API route.`;
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

function deprecatedDatabaseEndpointError(pathname = "") {
  const error = new Error(`${DEPRECATED_LOCAL_DB_ENDPOINT_MESSAGE}${pathname ? ` (${pathname})` : ""}`);
  error.statusCode = 410;
  return error;
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
  const mode = FIXED_ACCOUNT_SESSION_MODE;
  const key = String(userKey || "");
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

function authActionUpstreamStatusCode(payload, error) {
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

function logAuthActionOperatorDiagnostic({
  error = null,
  phase,
  payload = null,
  route,
  safeErrorCode = "",
  safeMessage = "",
  status = {},
}) {
  const diagnostic = error ? sanitizedAuthErrorDiagnostic(error) : null;
  const fields = [
    `phase=${safeOperatorDiagnosticValue(phase, "unknown")}`,
    `runtimeAccountConnection=${safeOperatorDiagnosticValue(status.authProviderId || status.providerId || "unknown")}`,
    `runtimeProductDataConnection=${safeOperatorDiagnosticValue(status.databaseProviderId || "unknown")}`,
    `supabaseConfigured=${operatorYesNo(status.configured ?? status.supabaseConfigPresent)}`,
    `identityTablesReady=${operatorYesNo(status.identityTablesReady)}`,
    `upstreamStatusCode=${authActionUpstreamStatusCode(payload, error)}`,
    `safeErrorCode=${safeOperatorDiagnosticValue(safeErrorCode || error?.safeErrorCode || diagnostic?.code, "none")}`,
    `safeMessage=${safeOperatorDiagnosticValue(safeMessage || diagnostic?.message, "none")}`,
  ];
  console.warn(`[auth/operator] ${safeOperatorDiagnosticValue(route, "POST /api/auth")} diagnostic ${fields.join(" ")}`);
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

function authPasswordResetRateLimitError(diagnostic = "", upstreamError = null) {
  const error = new Error(PASSWORD_RESET_RATE_LIMIT_MESSAGE);
  error.statusCode = 429;
  error.upstreamStatusCode = 429;
  error.safeErrorCode = upstreamError?.safeErrorCode || "";
  error.operatorDiagnostic = diagnostic
    ? `Password reset: ${diagnostic}`
    : "Password reset: Supabase Auth request failed with HTTP 429.";
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

function productTableNamesForSnapshot() {
  const schemaTableNames = Object.keys(getMockDbTableSchemas());
  return SUPABASE_POSTGRES_PRODUCT_TABLES
    .filter((tableName) => schemaTableNames.includes(tableName));
}

function productTablesFromSnapshot(snapshot) {
  const tables = snapshot?.tables && typeof snapshot.tables === "object" ? snapshot.tables : {};
  return Object.fromEntries(productTableNamesForSnapshot().map((tableName) => [
    tableName,
    Array.isArray(tables[tableName]) ? tables[tableName] : [],
  ]));
}

class LocalDevDataSource {
  constructor() {
    this.repositoryCounter = 1;
    this.repositoryById = new Map();
    this.sessionModeId = FIXED_ACCOUNT_SESSION_MODE.id;
    this.sessionUserKey = "";
    this.identityTablesCache = null;
    this.applyStateSnapshot({
      cleared: false,
      tables: createServerSeedTables(),
    });
  }

  currentMode() {
    return FIXED_ACCOUNT_SESSION_MODE;
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

  assertSupabaseDatabaseProvider(action) {
    const providerContract = this.providerContract();
    const providerId = providerContract.activeProviders.databaseProviderId;
    if (providerId !== SUPABASE_POSTGRES_PROVIDER_ID) {
      throw new Error(`${action} requires the configured product data connection. ${providerFailureMessage(providerContract, providerId)}`);
    }
  }

  supabaseDatabaseAdapter(action) {
    this.assertSupabaseDatabaseProvider(action);
    const adapter = new SupabasePostgresProviderAdapter();
    adapter.connect();
    return adapter;
  }

  assertProductDatabaseProvider(action) {
    this.supabaseDatabaseAdapter(action);
    return SUPABASE_POSTGRES_PROVIDER_ID;
  }

  async readSupabaseIdentityTablesUnchecked(action) {
    this.assertSupabaseDatabaseProvider(action);
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
    this.assertSupabaseDatabaseProvider(action);
    const authStatus = await this.authStatusForRoute();
    if (!authStatus.ready) {
      if (authStatus.identityTablesReady === false) {
        throw authIdentitySetupError(action, authStatus.operatorDiagnostic || "Account identity tables are not ready.");
      }
      throw authUnavailableError(action, `Supabase Auth identity ownership is not ready. ${authStatus.operatorDiagnostic || authStatus.status}`);
    }
    return this.readSupabaseIdentityTablesUnchecked(action);
  }

  async readSupabaseProductTables(action) {
    const adapter = this.supabaseDatabaseAdapter(action);
    const productTables = await adapter.getProductTables(productTableNamesForSnapshot());
    this.supabaseProductTablesCache = {
      providerId: SUPABASE_POSTGRES_PROVIDER_ID,
      tables: productTables,
    };
    return productTables;
  }

  async upsertSupabaseProductTables(tables, action) {
    const adapter = this.supabaseDatabaseAdapter(action);
    const productTables = productTablesFromSnapshot({ tables });
    const result = await adapter.upsertProductTables(productTables);
    this.supabaseProductTablesCache = {
      providerId: SUPABASE_POSTGRES_PROVIDER_ID,
      tables: productTables,
    };
    return result;
  }

  async persistSupabaseProductSnapshot(action) {
    return this.upsertSupabaseProductTables(this.snapshot().tables, action);
  }

  async supabaseIdentityReadinessCheck() {
    try {
      const tables = await this.readSupabaseIdentityTablesUnchecked("Validating Supabase identity tables");
      return {
        diagnostic: "Supabase identity tables are reachable through the server-side service contract.",
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
    const status = await this.authStatusForRoute();
    if (!status.ready) {
      return guestSession(FIXED_ACCOUNT_SESSION_MODE, status.operatorDiagnostic || AUTH_UNAVAILABLE_MESSAGE);
    }
    if (!this.sessionUserKey) {
      return guestSession(FIXED_ACCOUNT_SESSION_MODE);
    }
    const tables = await this.readSupabaseIdentityTables("Reading current session");
    return sessionUserFromIdentityTables(tables, this.sessionUserKey, this.sessionModeId, "Supabase identity");
  }

  async sessionUsersForRoute() {
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
    this.sessionUserKey = String(userKey || "");
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSessionForRoute();
  }

  async clearSessionUserForRoute() {
    this.sessionUserKey = "";
    this.sharedOptions.sessionMode = this.sessionModeId;
    this.sharedOptions.sessionUserKey = this.sessionUserKey;
    return this.currentSessionForRoute();
  }

  currentStateSnapshot() {
    return this.snapshot();
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

  async persistProductProviderState(action) {
    return this.persistSupabaseProductSnapshot(action);
  }

  adminInitializeIdentity(body = {}) {
    const database = new SupabasePostgresProviderAdapter();
    return database.initializeIdentity(body);
  }

  async adminSetupStatus() {
    const snapshot = await this.snapshotForRoute();
    const tables = snapshot.tables || {};
    const users = tables.users || [];
    const roles = tables.roles || [];
    const userRoles = tables.user_roles || [];
    const roleSlugs = new Set(roles.map((role) => role.roleSlug).filter(Boolean));
    const missingDefaultRoles = ["admin", "creator", "guest"].filter((roleSlug) => !roleSlugs.has(roleSlug));
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
      connection: this.providerContract().activeProviders,
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

  setMode(modeId) {
    return {
      ...clone(FIXED_ACCOUNT_SESSION_MODE),
      diagnostic: "Session mode switching is disabled; account sessions use the fixed server-owned auth session.",
    };
  }

  setUser(userKey) {
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

  authStatus() {
    const providerContract = this.providerContract();
    const authProviderId = providerContract.activeProviders.authProviderId;
    const databaseProviderId = providerContract.activeProviders.databaseProviderId;
    const localDbProductDataActive = false;
    const supabaseProductDataActive = true;
    const configured = providerContract.supabaseAuth.configured === true;
    const failure = providerContract.providerDiagnostics.providerFailures
      .find((candidate) => candidate.providerId === authProviderId || candidate.providerId === SUPABASE_AUTH_PROVIDER_ID);
    const missingBrowserSafeEnvironmentVariables = providerContract.supabaseAuth.missingBrowserSafeEnvironmentVariables || [];
    const connectivityStatus = configured ? "not-checked" : "not-configured";
    let operatorDiagnostic = "";
    let status = "unavailable";

    if (!configured) {
      operatorDiagnostic = providerContract.supabaseAuth.diagnostic || "Supabase Auth is missing required browser-safe environment configuration.";
      status = "unavailable";
    } else if (failure) {
      operatorDiagnostic = failure.remediation || providerContract.supabaseAuth.diagnostic || "Account connection is not ready.";
      status = "unavailable";
    } else {
      operatorDiagnostic = "Account and product data connections are configured for server API runtime.";
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
      active: true,
      supabaseConfigPresent: configured,
      supabaseConnectivityStatus: connectivityStatus,
      supabaseProductDataActive,
      supabaseProviderActive: true,
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
    if (!status.configured || !status.supabaseProductDataActive || status.status !== "ready") {
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
      operatorDiagnostic: "Account connection is configured, reachable, identity tables are available, and product data uses the configured server connection.",
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
        id: "supabase-runtime-provider",
        status: "PASS",
        summary: "Account actions use the configured server account connection.",
      },
      {
        id: "supabase-product-data",
        status: status.supabaseProductDataActive ? "PASS" : "FAIL",
        summary: status.supabaseProductDataActive
          ? "Product data uses the configured server data connection for this preflight."
          : `Product data connection is ${status.databaseProviderId}; expected ${SUPABASE_POSTGRES_PROVIDER_ID}.`,
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
      supabaseProductDataActive: status.supabaseProductDataActive,
      identityTableRecords: identity.identityTableRecords,
      identityTablesReady: identity.identityTablesReady,
      noAutomaticFallback: true,
      operatorDiagnostic: status.operatorDiagnostic,
      operatorOnly: true,
      providerId: SUPABASE_AUTH_PROVIDER_ID,
      active: true,
      status: connectivity.connectivityStatus === "healthy" ? "healthy" : connectivity.connectivityStatus,
      supabaseConfigPresent: status.supabaseConfigPresent,
      supabaseProviderActive: true,
    };
  }

  async authAdapterForAction(action, status = null) {
    const readinessStatus = status || await this.authStatusForRoute();
    if (!readinessStatus.ready) {
      if (readinessStatus.identityTablesReady === false) {
        throw authIdentitySetupError(action, `Account identity setup is incomplete. ${readinessStatus.operatorDiagnostic || readinessStatus.status}`);
      }
      throw authUnavailableError(action, `Supabase Auth is not ready. ${readinessStatus.operatorDiagnostic || readinessStatus.status}`);
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
      throw authIdentitySetupError(action, "Existing users record is owned by a different account connection.");
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
    const operatorStatus = await this.authStatusForRoute();
    logAuthActionOperatorDiagnostic({
      phase: "start",
      route: "POST /api/auth/sign-in",
      safeMessage: "ready-check-complete",
      status: operatorStatus,
    });
    let adapter = null;
    try {
      adapter = await this.authAdapterForAction("Sign in", operatorStatus);
    } catch (error) {
      logAuthActionOperatorDiagnostic({
        error,
        phase: "connection-not-ready",
        route: "POST /api/auth/sign-in",
        status: operatorStatus,
      });
      throw error;
    }
    const email = normalizedAuthEmail(body.email || body.identity);
    let payload = null;
    try {
      payload = await adapter.signIn({
        email,
        password: body.password,
      });
    } catch (error) {
      logAuthActionOperatorDiagnostic({
        error,
        phase: "upstream-failed",
        route: "POST /api/auth/sign-in",
        status: operatorStatus,
      });
      if (error?.statusCode === 503) {
        throw error;
      }
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      throw authUnavailableError("Sign in", diagnostic.message);
    }

    try {
      const session = await this.resolvedSessionForAuthPayload("Sign in", email, payload);
      logAuthActionOperatorDiagnostic({
        payload,
        phase: "success",
        route: "POST /api/auth/sign-in",
        safeMessage: "session-resolved",
        status: {
          ...operatorStatus,
          identityTablesReady: true,
        },
      });
      return sanitizedSupabaseAuthActionResult("sign-in", email, payload, session);
    } catch (error) {
      logAuthActionOperatorDiagnostic({
        error,
        payload,
        phase: "session-resolution-failed",
        route: "POST /api/auth/sign-in",
        safeMessage: error?.operatorDiagnostic || error?.message || "session resolution failed",
        status: operatorStatus,
      });
      if (error?.statusCode === 503) {
        throw error;
      }
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      throw authUnavailableError("Sign in", diagnostic.message);
    }
  }

  async authCreateAccount(body = {}) {
    const operatorStatus = await this.authStatusForRoute();
    logAuthActionOperatorDiagnostic({
      phase: "start",
      route: "POST /api/auth/create-account",
      safeMessage: "ready-check-complete",
      status: operatorStatus,
    });
    let adapter = null;
    try {
      adapter = await this.authAdapterForAction("Create account", operatorStatus);
    } catch (error) {
      logAuthActionOperatorDiagnostic({
        error,
        phase: "connection-not-ready",
        route: "POST /api/auth/create-account",
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
      logAuthActionOperatorDiagnostic({
        error,
        phase: "upstream-failed",
        route: "POST /api/auth/create-account",
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
      logAuthActionOperatorDiagnostic({
        error,
        payload,
        phase: "identity-provisioning-failed",
        route: "POST /api/auth/create-account",
        safeMessage: error?.operatorDiagnostic || error?.message || "identity provisioning failed",
        status: operatorStatus,
      });
      if (error?.message === ACCOUNT_IDENTITY_SETUP_MESSAGE) {
        throw error;
      }
      const diagnostic = error?.operatorDiagnostic || sanitizedAuthErrorDiagnostic(error).message;
      throw authIdentitySetupError("Create account", diagnostic);
    }

    logAuthActionOperatorDiagnostic({
      payload,
      phase: "success",
      route: "POST /api/auth/create-account",
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
    const operatorStatus = await this.authStatusForRoute();
    logAuthActionOperatorDiagnostic({
      phase: "start",
      route: "POST /api/auth/password-reset",
      safeMessage: "ready-check-complete",
      status: operatorStatus,
    });
    let adapter = null;
    try {
      adapter = await this.authAdapterForAction("Password reset", operatorStatus);
    } catch (error) {
      logAuthActionOperatorDiagnostic({
        error,
        phase: "connection-not-ready",
        route: "POST /api/auth/password-reset",
        status: operatorStatus,
      });
      throw error;
    }
    const email = normalizedAuthEmail(body.email || body.identity);
    try {
      const payload = await adapter.requestPasswordReset({
        email,
        redirectTo,
      });
      logAuthActionOperatorDiagnostic({
        payload,
        phase: "success",
        route: "POST /api/auth/password-reset",
        safeMessage: "password-reset-requested",
        status: operatorStatus,
      });
      return {
        ...sanitizedSupabaseAuthActionResult("password-reset", email, payload),
        message: "If an account exists for that email, password reset instructions will be sent.",
        redirectToIncluded: Boolean(redirectTo),
      };
    } catch (error) {
      const diagnostic = sanitizedAuthErrorDiagnostic(error);
      const upstreamStatusCode = Number(error?.upstreamStatusCode || error?.status || error?.statusCode || 0);
      logAuthActionOperatorDiagnostic({
        error,
        phase: upstreamStatusCode === 429 ? "upstream-rate-limited" : "upstream-failed",
        route: "POST /api/auth/password-reset",
        status: operatorStatus,
      });
      if (error?.statusCode === 503) {
        throw error;
      }
      if (upstreamStatusCode === 429) {
        throw authPasswordResetRateLimitError(diagnostic.message, error);
      }
      throw authUnavailableError("Password reset", diagnostic.message);
    }
  }

  currentSession() {
    this.assertSupabaseDatabaseProvider("Reading current session");
    return this.cachedSupabaseIdentitySession();
  }

  sessionModes() {
    return [clone(FIXED_ACCOUNT_SESSION_MODE)];
  }

  sessionUsers() {
    return [guestSession(FIXED_ACCOUNT_SESSION_MODE)];
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

  async supabaseToolboxToolPlanningRows() {
    const adapter = this.supabaseDatabaseAdapter("Reading Supabase Toolbox tool planning");
    const rows = await adapter.getProductTableRows("toolbox_tool_planning");
    const activeTools = getActiveToolRegistry();
    const rowsByToolKey = new Map(rows.map((row) => [row.toolKey, row]));
    const missingRows = activeTools
      .filter((tool) => !rowsByToolKey.has(tool.id))
      .map((tool, index) => ({
        key: this.toolboxToolPlanningKey(tool.id),
        ...this.defaultToolboxPlanning(tool),
        ...createMockDbAuditFields(index, MOCK_DB_KEYS.users.forgeBot),
      }));
    if (missingRows.length) {
      await adapter.upsertProductTable("toolbox_tool_planning", missingRows);
      return adapter.getProductTableRows("toolbox_tool_planning");
    }
    return rows;
  }

  async supabaseToolboxToolMetadataRows() {
    const adapter = this.supabaseDatabaseAdapter("Reading Supabase Toolbox tool metadata");
    const rows = await adapter.getProductTableRows("toolbox_tool_metadata");
    const activeTools = getActiveToolRegistry();
    const existingToolKeys = new Set(rows.map((row) => row.toolKey || row.toolId));
    const missingRows = activeTools
      .filter((tool) => !existingToolKeys.has(tool.id))
      .map((tool, index) => ({
        key: this.toolboxToolMetadataKey(tool.id),
        ...this.defaultToolboxMetadata(tool, index),
        ...createMockDbAuditFields(index, MOCK_DB_KEYS.users.forgeBot),
      }));
    if (missingRows.length) {
      await adapter.upsertProductTable("toolbox_tool_metadata", missingRows);
      return adapter.getProductTableRows("toolbox_tool_metadata");
    }
    return rows;
  }

  async supabaseToolboxVoteRows() {
    const adapter = this.supabaseDatabaseAdapter("Reading Supabase Toolbox votes");
    return adapter.getProductTableRows("toolbox_votes");
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

  async toolboxVoteSnapshotForRoute() {
    this.supabaseDatabaseAdapter("Reading Supabase Toolbox vote snapshot");
    const session = await this.currentSessionForRoute();
    const voterKey = session.userKey || "";
    const votes = await this.supabaseToolboxVoteRows();
    const metadataRows = await this.supabaseToolboxToolMetadataRows();
    return {
      currentUserKey: session.userKey || "",
      currentUserName: session.displayName || "Guest",
      providerId: SUPABASE_POSTGRES_PROVIDER_ID,
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
      source: "supabase-postgres",
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
        localAdminMyStuffItems: "server connection config",
        routeMap: "static shell route resolution",
      },
      source: "server-api",
    };
  }

  async castToolboxVote(toolId, direction) {
    const normalizedToolId = String(toolId || "");
    const normalizedDirection = String(direction || "").toLowerCase();
    if (!["up", "down"].includes(normalizedDirection)) {
      throw new Error("Toolbox vote direction must be up or down.");
    }
    const session = await this.currentSessionForRoute();
    if (!session.userKey) {
      throw new Error("Sign in required to record Toolbox votes.");
    }
    const metadataRows = await this.supabaseToolboxToolMetadataRows();
    if (!metadataRows.some((row) => normalizedToolKey(row) === normalizedToolId)) {
      throw new Error(`Unknown Toolbox vote tool: ${normalizedToolId || "missing"}.`);
    }
    const rows = await this.supabaseToolboxVoteRows();
    const existingRow = rows.find((row) => row.toolId === normalizedToolId && row.userKey === session.userKey);
    if (existingRow?.direction !== normalizedDirection) {
      const audit = createMockDbAuditFields(0, session.userKey);
      const nextRow = existingRow
        ? {
          ...existingRow,
          direction: normalizedDirection,
          updatedAt: audit.updatedAt,
          updatedBy: audit.updatedBy,
        }
        : {
          key: this.toolboxVoteKey(normalizedToolId, session.userKey),
          toolId: normalizedToolId,
          userKey: session.userKey,
          direction: normalizedDirection,
          ...audit,
        };
      const adapter = this.supabaseDatabaseAdapter("Persisting Supabase Toolbox vote");
      await adapter.upsertProductTable("toolbox_votes", [nextRow]);
    }

    return this.toolboxVoteSnapshotForRoute();
  }

  async updateToolboxVoteOrder(toolId, orderValue) {
    const session = await this.currentSessionForRoute();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to update Toolbox vote order.");
    }
    const normalizedToolId = String(toolId || "");
    const rows = await this.supabaseToolboxToolMetadataRows();
    const existingRow = rows.find((row) => normalizedToolKey(row) === normalizedToolId);
    if (!existingRow) {
      throw new Error(`Unknown Toolbox vote tool: ${normalizedToolId || "missing"}.`);
    }
    const rawOrder = Number(orderValue);
    if (!Number.isFinite(rawOrder)) {
      throw new Error("Toolbox vote order must be a number.");
    }
    const audit = createMockDbAuditFields(0, session.userKey);
    const adapter = this.supabaseDatabaseAdapter("Persisting Supabase Toolbox tool metadata order");
    await adapter.upsertProductTable("toolbox_tool_metadata", [{
      ...existingRow,
      order: Math.max(1, Math.round(rawOrder)),
      updatedAt: audit.updatedAt,
      updatedBy: audit.updatedBy,
    }]);
    return this.toolboxVoteSnapshotForRoute();
  }

  async updateToolboxToolMetadata(toolId, updates = {}) {
    const session = await this.currentSessionForRoute();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to update Toolbox tool metadata.");
    }
    const normalizedToolId = String(toolId || "");
    const rows = await this.supabaseToolboxToolMetadataRows();
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
    const adapter = this.supabaseDatabaseAdapter("Persisting Supabase Toolbox tool metadata");
    await adapter.upsertProductTable("toolbox_tool_metadata", [{
      ...row,
      group,
      category: group,
      path: pathValue,
      status: releaseChannel,
      toolKey: row.toolKey || row.toolId || normalizedToolId,
      toolId: row.toolId || row.toolKey || normalizedToolId,
      releaseChannel,
      releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
      updatedAt: audit.updatedAt,
      updatedBy: audit.updatedBy,
    }]);
    return this.toolboxVoteSnapshotForRoute();
  }

  async reorderToolboxVoteRows(toolIds) {
    const session = await this.currentSessionForRoute();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to reorder Toolbox vote rows.");
    }
    if (!Array.isArray(toolIds)) {
      throw new Error("Toolbox vote reorder requires an ordered tool list.");
    }
    const metadataRows = (await this.supabaseToolboxToolMetadataRows()).filter((row) => row.active !== false);
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
    const audit = createMockDbAuditFields(0, session.userKey);
    const updatedRows = uniqueToolIds.map((toolId, index) => {
      const existingRow = metadataRows.find((row) => (row.toolKey || row.toolId) === toolId);
      return {
        ...existingRow,
        order: index + 1,
        updatedAt: audit.updatedAt,
        updatedBy: audit.updatedBy,
      };
    });
    const adapter = this.supabaseDatabaseAdapter("Persisting Supabase Toolbox tool metadata row order");
    await adapter.upsertProductTable("toolbox_tool_metadata", updatedRows);
    return this.toolboxVoteSnapshotForRoute();
  }

  repositoryForTool(toolId) {
    this.assertProductDatabaseProvider(`Opening ${toolId} repository`);
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
    this.assertProductDatabaseProvider(`Creating ${toolId} repository`);
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

  async callRepositoryMethod(repositoryId, methodName, args) {
    this.assertProductDatabaseProvider(`Calling repository method ${methodName}`);
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
    await this.persistProductProviderState(`Persisting ${methodName} result`);
    return result;
  }

  snapshot() {
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

  async toolRegistrySnapshotForRoute() {
    this.supabaseDatabaseAdapter("Reading Toolbox registry");
    const planningRows = await this.supabaseToolboxToolPlanningRows();
    const planningByToolKey = new Map(planningRows.map((row) => [row.toolKey, row]));
    const metadataRows = await this.supabaseToolboxToolMetadataRows();
    const tools = metadataRows
      .map((row, index) => serverRegistryTool({
        ...row,
        ...planningByToolKey.get(normalizedToolKey(row)),
      }, index))
      .sort((left, right) => left.order - right.order || left.displayName.localeCompare(right.displayName));
    const activeTools = tools.filter((tool) => tool.active !== false);
    return {
      activeTools,
      imageFallback: TOOL_IMAGE_FALLBACK,
      providerId: SUPABASE_POSTGRES_PROVIDER_ID,
      readinessByStatus: Object.fromEntries(TOOL_STATUS_MODEL.map((status) => [status, getToolProgressReadiness(status)])),
      source: "supabase-postgres",
      toolboxContract: toolboxContractForTools(activeTools),
      tools,
    };
  }

  async snapshotForRoute() {
    const adapter = this.supabaseDatabaseAdapter("Reading Supabase product database state");
    const providerSnapshot = await adapter.getDbViewerSnapshot();
    const baseline = this.snapshot();
    const schemas = getMockDbTableSchemas();
    const tables = Object.fromEntries(Object.keys(schemas).map((tableName) => [
      tableName,
      Array.isArray(providerSnapshot.tables?.[tableName]) ? providerSnapshot.tables[tableName] : [],
    ]));
    return {
      cleared: false,
      owners: baseline.owners,
      provider: {
        databaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
        source: "supabase-postgres",
      },
      schemas,
      source: "supabase-postgres",
      tables,
      toolGroups: baseline.toolGroups,
      viewerGroups: dbViewerGroupsForSnapshot(tables, baseline.owners),
      version: 4,
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

      if (parts[1] === "product-data" && request.method === "GET" && parts[2] === "snapshot") {
        ok(response, await dataSource.snapshotForRoute());
        return true;
      }

      if (parts[1] === "local-db" || parts[1] === "mock-db") {
        fail(response, 410, deprecatedDatabaseEndpointError(requestUrl.pathname));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "setup" && request.method === "POST" && parts[3] === "reseed") {
        fail(response, 410, deprecatedDatabaseEndpointError(requestUrl.pathname));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "setup" && request.method === "GET" && parts[3] === "status") {
        ok(response, await dataSource.adminSetupStatus());
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
        fail(response, 410, deprecatedDatabaseEndpointError(requestUrl.pathname));
        return true;
      }

      if (parts[1] === "toolbox") {
        if (request.method === "GET" && parts[2] === "votes" && parts[3] === "snapshot") {
          ok(response, await dataSource.toolboxVoteSnapshotForRoute());
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "cast") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.castToolboxVote(body.toolId, body.direction));
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "order") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.updateToolboxVoteOrder(body.toolId, body.order));
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "order-list") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.reorderToolboxVoteRows(body.toolIds));
          return true;
        }
        if (request.method === "POST" && parts[2] === "votes" && parts[3] === "metadata") {
          const body = await readRequestJson(request);
          ok(response, await dataSource.updateToolboxToolMetadata(body.toolId, body));
          return true;
        }
        if (request.method === "GET" && parts[2] === "registry" && parts[3] === "snapshot") {
          ok(response, await dataSource.toolRegistrySnapshotForRoute());
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
            repositoryId: await dataSource.createRepository(toolId, body.options || {}),
          });
          return true;
        }
        if (request.method === "POST" && parts[3] === "repositories" && parts[5] === "methods") {
          const body = await readRequestJson(request);
          ok(response, {
            result: await dataSource.callRepositoryMethod(parts[4], parts[6], body.args || []),
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
