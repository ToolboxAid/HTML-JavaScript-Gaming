import { randomBytes } from "node:crypto";
import { Buffer } from "node:buffer";
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
import { createConfiguredProjectAssetStorage } from "../storage/r2-project-asset-storage.mjs";
import { loadStorageConfig } from "../storage/storage-config.mjs";
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
  createMockDbAuditFields,
  getMockDbTableSchemas,
  getMockDbToolGroups,
  normalizeMockDbTables,
} from "../persistence/mock-db-store.js";
import { createServerSeedTables } from "../seed/server-seed-loader.mjs";
import { SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";
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
const DEFAULT_SUPABASE_ACCOUNT_ROLE = Object.freeze({
  description: "Default authenticated Creator role.",
  isSystemRole: false,
  name: "Creator",
  roleSlug: "creator",
});
const IDENTITY_TABLES = ["users", "roles", "user_roles"];
const TOOLBOX_TABLES = ["toolbox_tool_metadata", "toolbox_tool_planning", "toolbox_votes"];
const TOOL_SNAPSHOT_PERSISTENCE_EXCLUDED_TABLES = new Set([
  "platform_settings",
  "support_categories",
  "toolbox_tool_metadata",
  "toolbox_tool_planning",
  "toolbox_votes",
]);
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
  Object.freeze({ label: "Controls", path: "admin/controls.html", route: "admin-controls" }),
  Object.freeze({ label: "Infrastructure", path: "admin/infrastructure.html", route: "admin-infrastructure" }),
  Object.freeze({ label: "Moderation", path: "admin/moderation.html", route: "admin-moderation" }),
  Object.freeze({ label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" }),
  Object.freeze({ label: "Ratings", path: "admin/ratings.html", route: "admin-ratings" }),
  Object.freeze({ label: "Roles", path: "admin/roles.html", route: "admin-roles" }),
  Object.freeze({ label: "System Health", path: "admin/system-health.html", route: "admin-system-health" }),
  Object.freeze({ label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" }),
  Object.freeze({ label: "Users", path: "admin/users.html", route: "admin-users" }),
]);
const OWNER_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" }),
  Object.freeze({ label: "Design System", path: "admin/design-system.html", route: "admin-design-system" }),
  Object.freeze({ label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" }),
  Object.freeze({ href: "/admin/admin-notes.html", label: "Notes", localNotes: true }),
  Object.freeze({ label: "Operations", path: "owner/operations.html", route: "owner-operations" }),
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
const PLATFORM_BANNER_SETTING_KEYS = Object.freeze({
  active: "platform.banner.enabled",
  message: "platform.banner.message",
  tone: "platform.banner.tone",
});
const PLATFORM_BANNER_TONES = Object.freeze(["info", "warning", "danger"]);
const PLATFORM_BANNER_DEFAULTS = Object.freeze({
  active: false,
  message: "",
  tone: "info",
});
const STORAGE_PROJECTS_PREFIX_ENV_KEY = "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX";
const SYSTEM_HEALTH_LIMIT_ENV_KEYS = Object.freeze([
  Object.freeze({
    key: "GAMEFOUNDRY_STORAGE_LIMIT_BYTES",
    label: "Storage limit bytes",
    service: "Project Asset Storage / R2",
  }),
  Object.freeze({
    key: "GAMEFOUNDRY_STORAGE_CLASS_A_LIMIT_MONTHLY",
    label: "Storage Class A monthly limit",
    service: "Project Asset Storage / R2",
  }),
  Object.freeze({
    key: "GAMEFOUNDRY_STORAGE_CLASS_B_LIMIT_MONTHLY",
    label: "Storage Class B monthly limit",
    service: "Project Asset Storage / R2",
  }),
  Object.freeze({
    key: "GAMEFOUNDRY_DB_SIZE_LIMIT_BYTES",
    label: "Local DB size limit bytes",
    service: "Product Data / Local DB",
  }),
  Object.freeze({
    key: "GAMEFOUNDRY_DB_CONNECTION_LIMIT",
    label: "Local DB connection limit",
    service: "Product Data / Local DB",
  }),
]);
const SYSTEM_HEALTH_LIMIT_PRESSURE_LABELS = Object.freeze(["OK", "WATCH", "UPGRADE SOON", "RISK"]);
const STORAGE_PROJECTS_PREFIX_LANES = Object.freeze([
  Object.freeze({ lane: "DEV", path: "/dev/projects/" }),
  Object.freeze({ lane: "IST", path: "/ist/projects/" }),
  Object.freeze({ lane: "UAT", path: "/uat/projects/" }),
  Object.freeze({ lane: "PRD", path: "/prd/projects/" }),
]);
const STORAGE_CONNECTIVITY_ACTIONS = Object.freeze([
  Object.freeze({ id: "storage-list", label: "List" }),
  Object.freeze({ id: "storage-write-test-object", label: "Write test object" }),
  Object.freeze({ id: "storage-read-test-object", label: "Read test object" }),
  Object.freeze({ id: "storage-delete-test-object", label: "Delete test object" }),
]);
const STORAGE_CONNECTIVITY_TEST_OBJECT_CONTENT = "Game Foundry Studio storage connectivity test object.\n";
const STORAGE_CONNECTIVITY_TEST_OBJECT_RELATIVE_PATH = "connectivity/storage-connectivity-test.txt";
const OWNER_OPERATION_ACTIONS = Object.freeze([
  Object.freeze({
    id: "validate-current-connection",
    label: "Validate current connection",
    mode: "live-check",
  }),
  Object.freeze({
    id: "reseed-dev",
    label: "Reseed DEV",
    mode: "manual-only",
  }),
  Object.freeze({
    id: "restore-from-backup",
    label: "Restore from backup",
    mode: "manual-only",
  }),
  Object.freeze({
    id: "run-migration",
    label: "Run migration",
    mode: "manual-only",
  }),
  Object.freeze({
    id: "storage-list",
    label: "Storage list",
    mode: "storage-connectivity",
  }),
  Object.freeze({
    id: "storage-write-test-object",
    label: "Storage write test object",
    mode: "storage-connectivity",
  }),
  Object.freeze({
    id: "storage-read-test-object",
    label: "Storage read test object",
    mode: "storage-connectivity",
  }),
  Object.freeze({
    id: "storage-delete-test-object",
    label: "Storage delete test object",
    mode: "storage-connectivity",
  }),
  Object.freeze({
    id: "promote-dev-to-ist",
    label: "Promote DEV to IST",
    mode: "manual-only",
  }),
  Object.freeze({
    id: "promote-ist-to-uat",
    label: "Promote IST to UAT",
    mode: "manual-only",
  }),
  Object.freeze({
    id: "promote-uat-to-prod",
    label: "Promote UAT to PROD",
    mode: "manual-only",
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

function dotEnvValue(key) {
  const envPath = path.resolve(process.cwd(), ".env");
  let contents = "";
  try {
    contents = readFileSync(envPath, "utf8");
  } catch {
    return { found: false, value: "" };
  }
  let foundValue = "";
  let found = false;
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }
    const candidateKey = normalized.slice(0, separatorIndex).trim();
    if (candidateKey !== key) {
      return;
    }
    found = true;
    foundValue = parseEnvValue(normalized.slice(separatorIndex + 1));
  });
  return { found, value: foundValue.trim() };
}

function storageProjectsPrefixStatus() {
  const currentPath = dotEnvValue(STORAGE_PROJECTS_PREFIX_ENV_KEY);
  const matchedLane = STORAGE_PROJECTS_PREFIX_LANES.find((lane) => lane.path === currentPath.value);
  const invalidPath = !currentPath.found || !currentPath.value || !matchedLane;
  const rows = STORAGE_PROJECTS_PREFIX_LANES.map((lane) => {
    if (invalidPath) {
      return {
        ...lane,
        active: false,
        status: "ERROR",
        value: "ERROR",
      };
    }
    const active = currentPath.value === lane.path;
    return {
      ...lane,
      active,
      status: active ? "PASS" : "SKIP",
      value: active ? "yes" : "no",
    };
  });
  return {
    configured: !invalidPath,
    invalidPath,
    missing: !currentPath.found || !currentPath.value,
    rows,
    secretsExposed: false,
    status: invalidPath ? "ERROR" : "PASS",
    variableName: STORAGE_PROJECTS_PREFIX_ENV_KEY,
  };
}

function databaseConfigStatus(env = process.env) {
  const databaseUrl = String(env.GAMEFOUNDRY_DATABASE_URL || "").trim();
  const sslMode = String(env.GAMEFOUNDRY_DATABASE_SSL || "").trim().toLowerCase();
  if (!databaseUrl) {
    return {
      configured: false,
      databaseName: "not configured",
      databaseNameStatus: "WARN",
      host: "not configured",
      hostStatus: "WARN",
      port: "",
      portStatus: "WARN",
      sslMode: sslMode || "not configured",
      sslModeStatus: sslMode ? "PASS" : "WARN",
    };
  }
  try {
    const parsedUrl = new URL(databaseUrl);
    if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
      throw new Error("Database URL must use postgres:// or postgresql://.");
    }
    const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, "") || "");
    return {
      configured: Boolean(parsedUrl.hostname && databaseName),
      databaseName: databaseName || "not configured",
      databaseNameStatus: databaseName ? "PASS" : "WARN",
      host: parsedUrl.hostname || "not configured",
      hostStatus: parsedUrl.hostname ? "PASS" : "WARN",
      port: Number(parsedUrl.port || 5432),
      portStatus: "PASS",
      sslMode: sslMode || "not configured",
      sslModeStatus: sslMode ? "PASS" : "WARN",
    };
  } catch {
    return {
      configured: false,
      databaseName: "invalid database URL",
      databaseNameStatus: "FAIL",
      host: "invalid database URL",
      hostStatus: "FAIL",
      port: "",
      portStatus: "FAIL",
      sslMode: sslMode || "not configured",
      sslModeStatus: sslMode ? "PASS" : "WARN",
    };
  }
}

function projectPackageReadinessStatus() {
  const decisionPath = path.join(process.cwd(), "docs_build", "codex", "decisions", "project-packages.md");
  try {
    const contents = readFileSync(decisionPath, "utf8");
    const requiredContent = [
      ".gfsp",
      "Game Foundry Studio Project",
      "ZIP-based package format",
      "<ProjectNameWithoutSpaces>-<YYJJJ>-<sequence>.gfsp",
      "Export Project Package",
      "Import Project Package",
      "Validate Project Package",
    ];
    const missing = requiredContent.filter((item) => !contents.includes(item));
    return {
      decisionPath: "docs_build/codex/decisions/project-packages.md",
      message: missing.length
        ? `Project package decision note is missing: ${missing.join(", ")}.`
        : "Project package decision note is ready for .gfsp export/import/validate planning.",
      status: missing.length ? "WARN" : "PASS",
    };
  } catch {
    return {
      decisionPath: "docs_build/codex/decisions/project-packages.md",
      message: "Project package decision note is missing. Restore docs_build/codex/decisions/project-packages.md.",
      status: "WARN",
    };
  }
}

function systemHealthLimitRows() {
  return SYSTEM_HEALTH_LIMIT_ENV_KEYS.map((limit) => {
    const configuredLimit = dotEnvValue(limit.key);
    const hasLimitValue = configuredLimit.found && configuredLimit.value;
    return {
      area: limit.service,
      field: limit.label,
      limit: hasLimitValue ? configuredLimit.value : "not configured",
      nextStep: hasLimitValue
        ? `Add safe ${limit.service} usage reporting through the Local API before calculating pressure.`
        : `Set ${limit.key} in the selected .env.<target> copy-source, copy it to .env, then add safe ${limit.service} usage reporting through the Local API.`,
      pressure: "NOT AVAILABLE",
      pressureLabels: SYSTEM_HEALTH_LIMIT_PRESSURE_LABELS,
      status: "WARN",
      usage: "NOT AVAILABLE",
      variableName: limit.key,
    };
  });
}

function overallHealthStatus(rows) {
  const statuses = rows.map((row) => String(row.status || "").toUpperCase());
  if (statuses.includes("FAIL") || statuses.includes("ERROR")) {
    return "FAIL";
  }
  if (statuses.includes("WARN") || statuses.includes("SKIP")) {
    return "WARN";
  }
  return "PASS";
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

function normalizePlatformSettingRows(rows = []) {
  return Array.isArray(rows)
    ? rows.filter((row) => row && typeof row === "object")
    : [];
}

function platformSettingBySettingKey(rows = []) {
  return new Map(normalizePlatformSettingRows(rows)
    .map((row) => [String(row.settingKey || "").trim(), row])
    .filter(([settingKey]) => settingKey));
}

function platformSettingValue(rowsByKey, fieldName) {
  const row = rowsByKey.get(PLATFORM_BANNER_SETTING_KEYS[fieldName]);
  if (!row || row.isActive === false) {
    return PLATFORM_BANNER_DEFAULTS[fieldName];
  }
  return String(row.settingValue || "").trim();
}

function platformSettingBoolean(rowsByKey, fieldName) {
  const value = platformSettingValue(rowsByKey, fieldName);
  return value === true || String(value).toLowerCase() === "true";
}

function normalizedPlatformBanner(rows = []) {
  const rowsByKey = platformSettingBySettingKey(rows);
  const activeFlag = platformSettingBoolean(rowsByKey, "active");
  const message = platformSettingValue(rowsByKey, "message");
  const tone = PLATFORM_BANNER_TONES.includes(platformSettingValue(rowsByKey, "tone"))
    ? platformSettingValue(rowsByKey, "tone")
    : PLATFORM_BANNER_DEFAULTS.tone;
  return {
    active: activeFlag && Boolean(message),
    message,
    sourceTableRowKey: rowsByKey.get(PLATFORM_BANNER_SETTING_KEYS.active)?.key || "",
    sourceTable: "platform_settings",
    tone,
  };
}

function normalizePlatformBannerUpdate(body = {}) {
  const active = body.active === true || String(body.active).toLowerCase() === "true";
  const message = String(body.message || "").trim();
  const tone = PLATFORM_BANNER_TONES.includes(String(body.tone || "").trim())
    ? String(body.tone).trim()
    : PLATFORM_BANNER_DEFAULTS.tone;
  if (active && !message) {
    throw new Error("Platform banner message is required before enabling the banner.");
  }
  return { active, message, tone };
}

function platformBannerSettingRows({ actorKey, adapter, banner, existingRows }) {
  const now = new Date().toISOString();
  const rowsByKey = platformSettingBySettingKey(existingRows);
  const settingRows = [
    {
      description: "Controls whether the platform banner renders.",
      settingKey: PLATFORM_BANNER_SETTING_KEYS.active,
      settingType: "boolean",
      settingValue: banner.active ? "true" : "false",
    },
    {
      description: "Platform banner message text.",
      settingKey: PLATFORM_BANNER_SETTING_KEYS.message,
      settingType: "string",
      settingValue: banner.message,
    },
    {
      description: "Platform banner visual tone.",
      settingKey: PLATFORM_BANNER_SETTING_KEYS.tone,
      settingType: "string",
      settingValue: banner.tone,
    },
  ];
  return settingRows.map((row) => {
    const existing = rowsByKey.get(row.settingKey) || {};
    return {
      ...existing,
      ...row,
      createdAt: existing.createdAt || now,
      createdBy: existing.createdBy || actorKey,
      isActive: true,
      key: existing.key || adapter.createRecordKey(),
      updatedAt: now,
      updatedBy: actorKey,
    };
  });
}

function platformBannerDiagnostics(banner) {
  return {
    active: banner.active,
    message: banner.message,
    sourceTable: banner.sourceTable,
    sourceTableRowKey: banner.sourceTableRowKey,
  };
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

function sendBinary(response, statusCode, body, contentType = "application/octet-stream") {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", contentType);
  response.end(body);
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

function repositoryMethodError(message, statusCode = 502) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.operatorDiagnostic = message;
  return error;
}

function repositoryMethodRequiresPersistence(methodName) {
  return !/^(get|list|open|read|validate)/.test(String(methodName || ""));
}

const GAME_WORKSPACE_SAVE_METHODS = new Set([
  "clearTestData",
  "createGame",
  "deleteGame",
  "resetGameData",
  "seedDemoGame",
  "updateGameMemberRole",
  "updateGamePurpose",
  "updateGameStatus",
]);

function assertRepositoryMethodResult(repositoryId, methodName, result) {
  if (result === undefined) {
    throw repositoryMethodError(`Server repository ${repositoryId}.${methodName} returned no result. Restore the server API contract for ${methodName}.`);
  }
  if (result && typeof result === "object" && result.error === true) {
    throw repositoryMethodError(result.message || `Server repository ${repositoryId}.${methodName} returned an error payload instead of data.`);
  }
  if (methodName === "getActiveGame" && result !== null) {
    const members = Array.isArray(result?.members) ? result.members : null;
    if (!result || typeof result !== "object" || !String(result.id || "").trim() || !members) {
      throw repositoryMethodError(`Server repository ${repositoryId}.getActiveGame returned a malformed active game payload. Open or create a Game Workspace game before continuing.`);
    }
  }
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
    isOwner: false,
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
    isOwner: roleSlugs.includes("owner"),
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
    serverSessionResolved: Boolean(resolvedSession),
    message: "Account authentication completed through the account service.",
    passwordStoredByBrowser: false,
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

function snapshotAuditFields(index = 0, userKey = SEED_DB_KEYS.users.forgeBot) {
  return createMockDbAuditFields(index, userKey);
}

function gameWorkspaceTables(repository) {
  const tables = repository.getTables();
  const activeGame = repository.getActiveGame();
  const progress = repository.getGameProgress();
  const gameWorkspaceGames = tables.games.map((project, index) => ({
    ...snapshotAuditFields(index + 20, SEED_DB_KEYS.users.user1),
    key: gameWorkspaceGameKey(project.id),
    name: project.name,
    ownerKey: SEED_DB_KEYS.users.user1,
    status: project.status,
  }));
  const activeGameKey = gameWorkspaceGameKey(activeGame?.id);
  return normalizeOwnedTables("game-workspace", {
    game_workspace_games: gameWorkspaceGames,
    game_workspace_progress: activeGame ? [{
      ...snapshotAuditFields(80, SEED_DB_KEYS.users.user1),
      key: runtimeGeneratedKeyForSource(`game-workspace-progress:${activeGameKey}`),
      gameKey: activeGameKey,
      currentFocus: progress.currentFocus,
      gameProgress: progress.gameProgress,
      publishingProgress: progress.publishingProgress,
      recommendedNextTool: progress.recommendedNextTool,
    }] : [],
  });
}

function gameWorkspaceProjectRecords(repository) {
  const tables = repository.getTables();
  return (tables.games || []).map((project) => ({
    apiOwnedKey: true,
    localRecordId: project.id,
    name: project.name,
    ownerKey: project.ownerKey,
    projectKey: gameWorkspaceGameKey(project.id),
    source: "Local DB",
    status: project.status,
  }));
}

function gameDesignTables(repository) {
  const tables = repository.getTables();
  return normalizeOwnedTables("game-design", {
    game_design_documents: (tables.game_design_documents || []).map((record, index) => ({
      ...snapshotAuditFields(index + 100, SEED_DB_KEYS.users.user1),
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      status: record.status,
      title: record.title || `${record.gamePurpose || record.projectPurpose || "Game"} Design`,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
    game_design_validation_items: (tables.game_design_validation_items || []).map((record, index) => ({
      ...snapshotAuditFields(index + 140, SEED_DB_KEYS.users.user1),
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      label: record.label,
      status: record.status,
      action: record.action,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
  });
}

function gameConfigurationTables(repository) {
  const tables = repository.getTables();
  return normalizeOwnedTables("game-configuration", {
    game_configuration_records: (tables.game_configuration_documents || []).map((record, index) => ({
      ...snapshotAuditFields(index + 180, SEED_DB_KEYS.users.user1),
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
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
    game_configuration_validation_items: (tables.game_configuration_validation_items || []).map((record, index) => ({
      ...snapshotAuditFields(index + 220, SEED_DB_KEYS.users.user1),
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      label: record.label,
      status: record.status,
      action: record.action,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
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

function assetRuntimeTables(repository) {
  const tables = assetTables(repository);
  const assets = (tables.asset_library_items || []).map((row) => ({
    ...row,
    gameId: row.gameId || row.ownerProjectId || "",
    key: row.id || row.key,
  }));
  const assetKeyById = new Map(assets.map((asset) => [asset.id, asset.key]));
  const projectIds = new Map();
  const rememberProject = (projectId, sourceRow = {}) => {
    const key = String(projectId || "").trim();
    if (!key || projectIds.has(key)) {
      return;
    }
    const ownerKey = sourceRow.ownerUserId || sourceRow.createdBy || SEED_DB_KEYS.users.user1;
    projectIds.set(key, {
      createdAt: sourceRow.createdAt,
      createdBy: sourceRow.createdBy || ownerKey,
      ownerKey,
      updatedAt: sourceRow.updatedAt,
      updatedBy: sourceRow.updatedBy || ownerKey,
    });
  };
  assets.forEach((asset) => rememberProject(asset.ownerProjectId || asset.gameId, asset));
  const storageObjects = (tables.asset_storage_objects || []).map((row) => {
    const assetId = assetKeyById.get(row.assetId) || row.assetId;
    const gameId = row.gameId || row.ownerProjectId || "";
    rememberProject(row.ownerProjectId || gameId, row);
    return {
      ...row,
      assetId,
      gameId,
      key: row.id || row.key,
    };
  });
  const importEvents = (tables.asset_import_events || []).map((row) => {
    const assetId = assetKeyById.get(row.assetId) || row.assetId;
    const owningAsset = assets.find((asset) => asset.key === assetId || asset.id === row.assetId);
    const gameId = row.gameId || owningAsset?.ownerProjectId || "";
    rememberProject(gameId, row);
    return {
      ...row,
      assetId,
      gameId,
      key: row.id || row.key,
    };
  });
  const validationItems = (tables.asset_validation_items || []).map((row) => ({
    ...row,
    key: row.id || row.key,
  }));
  return {
    game_workspace_games: Array.from(projectIds.entries()).map(([key, project]) => ({
      createdAt: project.createdAt || snapshotAuditFields(90, project.ownerKey).createdAt,
      createdBy: project.createdBy,
      key,
      name: "Project Asset Storage",
      ownerKey: project.ownerKey,
      status: "Under Construction",
      updatedAt: project.updatedAt || project.createdAt || snapshotAuditFields(90, project.ownerKey).updatedAt,
      updatedBy: project.updatedBy,
    })),
    asset_import_events: importEvents,
    asset_library_items: assets,
    asset_storage_objects: storageObjects,
    asset_validation_items: validationItems,
  };
}

function productTableNamesForSnapshot() {
  const schemaTableNames = Object.keys(getMockDbTableSchemas());
  return SUPABASE_POSTGRES_PRODUCT_TABLES
    .filter((tableName) => schemaTableNames.includes(tableName));
}

function productTablesFromSnapshot(snapshot) {
  const tables = snapshot?.tables && typeof snapshot.tables === "object" ? snapshot.tables : {};
  const persistenceTableNames = productTableNamesForSnapshot()
    .filter((tableName) => !TOOL_SNAPSHOT_PERSISTENCE_EXCLUDED_TABLES.has(tableName));
  return Object.fromEntries(persistenceTableNames.map((tableName) => [
    tableName,
    Array.isArray(tables[tableName]) ? tables[tableName] : [],
  ]));
}

class ApiRuntimeDataSource {
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

  async persistSupabaseGameWorkspaceSnapshot(action) {
    return this.upsertSupabaseProductTables(gameWorkspaceTables(this.gameWorkspaceRepository), action);
  }

  async persistSupabaseAssetSnapshot(action) {
    return this.upsertSupabaseProductTables(assetRuntimeTables(this.assetRepository), action);
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
    if (this.sessionUserKey) {
      try {
        const tables = await this.readSupabaseIdentityTablesUnchecked("Reading selected Local API session");
        return sessionUserFromIdentityTables(tables, this.sessionUserKey, this.sessionModeId, "Local DB identity");
      } catch (error) {
        return guestSession(
          FIXED_ACCOUNT_SESSION_MODE,
          `Selected Local API session could not be resolved from identity tables: ${error instanceof Error ? error.message : String(error || "Unknown identity table error.")}`,
        );
      }
    }
    if (!status.ready) {
      return guestSession(FIXED_ACCOUNT_SESSION_MODE, status.operatorDiagnostic || AUTH_UNAVAILABLE_MESSAGE);
    }
    return guestSession(FIXED_ACCOUNT_SESSION_MODE);
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
      projectAssetStorage: createConfiguredProjectAssetStorage(),
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

  async persistGameWorkspaceProviderState(action) {
    return {
      action,
      database: "Local DB",
      databaseEngine: "SQLite",
      providerId: "local-api-project-workspace",
      serviceContract: "Web UI -> Local API/Service Contract -> Local DB",
      status: "PASS",
    };
  }

  async persistAssetProviderState(action) {
    return this.persistSupabaseAssetSnapshot(action);
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
    const missingDefaultRoles = ["admin", "creator", "guest", "owner"].filter((roleSlug) => !roleSlugs.has(roleSlug));
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
          : "Create or assign the first admin through Owner Operations before promotion.",
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
          ? `${toolMetadataCount} tool metadata rows are available through the configured server API.`
          : "Tool metadata rows are missing from the configured setup state.",
      },
      {
        action: "Create baseline settings records",
        id: "starter-platform-settings",
        label: "Starter Platform Settings",
        status: platformSettingsCount ? "PASS" : "FAIL",
        message: platformSettingsCount
          ? `${platformSettingsCount} starter platform setting row(s) are available through the configured server API.`
          : "Starter platform settings are missing from the configured setup state.",
      },
      {
        action: "Prepare support category setup",
        id: "support-categories",
        label: "Support Categories",
        status: supportCategoriesCount ? "PASS" : "FAIL",
        message: supportCategoriesCount
          ? `${supportCategoriesCount} support category row(s) are available through the configured server API.`
          : "Support categories are missing from the configured setup state.",
      },
    ];
    const statusCounts = areas.reduce((counts, area) => {
      counts[area.status] = (counts[area.status] || 0) + 1;
      return counts;
    }, {});
    const status = statusCounts.FAIL ? "FAIL" : (statusCounts.WARN || statusCounts.SKIP ? "WARN" : "PASS");
    return {
      areas,
      message: `Owner Operations setup status checked ${areas.length} setup areas.`,
      ownership: "Owner -> Operations",
      connection: this.providerContract().activeProviders,
      status,
      statusCounts,
    };
  }

  async platformBannerForRoute() {
    const adapter = this.supabaseDatabaseAdapter("Reading platform banner settings");
    const rows = await adapter.getPlatformSettings();
    const banner = normalizedPlatformBanner(rows);
    return {
      banner,
      diagnostics: platformBannerDiagnostics(banner),
      sourceTable: "platform_settings",
    };
  }

  async adminPlatformBannerForRoute() {
    const session = await this.currentSessionForRoute();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to read platform banner settings.");
    }
    return this.platformBannerForRoute();
  }

  async updateAdminPlatformBanner(body = {}) {
    const session = await this.currentSessionForRoute();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to update platform banner settings.");
    }
    const adapter = this.supabaseDatabaseAdapter("Updating platform banner settings");
    const existingRows = await adapter.getPlatformSettings();
    const banner = normalizePlatformBannerUpdate(body);
    const rows = platformBannerSettingRows({
      actorKey: session.userKey,
      adapter,
      banner,
      existingRows,
    });
    await adapter.upsertPlatformSettings(rows);
    const refreshedRows = await adapter.getPlatformSettings();
    const refreshedBanner = normalizedPlatformBanner(refreshedRows);
    return {
      banner: refreshedBanner,
      diagnostics: platformBannerDiagnostics(refreshedBanner),
      recordsWritten: rows.length,
      sourceTable: "platform_settings",
    };
  }

  async requireOwnerSession() {
    const session = await this.currentSessionForRoute();
    if (!session.isOwner || !session.userKey) {
      throw new Error("Owner role required to use Owner Operations.");
    }
    return session;
  }

  async requireAdminSession() {
    const session = await this.currentSessionForRoute();
    if (!session.isAdmin || !session.userKey) {
      throw new Error("Admin role required to read Infrastructure status.");
    }
    return session;
  }

  ownerConnectionSummary() {
    const providerContract = this.providerContract();
    const authStatus = this.authStatus();
    const productStatus = providerContract.supabasePostgres?.status || "unknown";
    const storageConfigured = loadStorageConfig().configured === true;
    return {
      account: {
        configured: authStatus.configured === true,
        label: "Account connection",
        status: authStatus.status,
      },
      boundary: SERVER_DATA_BOUNDARY_RULE,
      environmentSwitching: "manual-env-change-and-server-restart",
      productData: {
        configured: providerContract.supabasePostgres?.configured === true,
        label: "Product data connection",
        status: productStatus,
      },
      projectAssetStorage: {
        configured: storageConfigured,
        label: "Project asset storage",
        status: storageConfigured ? "configured" : "not configured",
      },
      secretsExposed: false,
    };
  }

  ownerStorageStatus() {
    const storageConfig = loadStorageConfig();
    const safe = storageConfig.safe || {};
    const configured = storageConfig.configured === true;
    return {
      accessKeyConfigured: configured,
      accessKeyStatus: configured ? "PASS" : "WARN",
      bucket: safe.bucket || "",
      bucketStatus: safe.bucket ? "PASS" : "WARN",
      configured,
      endpoint: safe.endpoint || "",
      endpointStatus: safe.endpoint && safe.endpoint !== "invalid endpoint" ? "PASS" : "WARN",
      message: configured
        ? "Project asset storage is configured. Credential values are hidden."
        : `Project asset storage is not fully configured: ${storageConfig.missingKeys?.join(", ") || storageConfig.validationError || "storage configuration incomplete"}.`,
      projectsPrefix: safe.projectsPrefix || "",
      projectsPrefixStatus: safe.projectsPrefix ? "PASS" : "WARN",
      secretKeyConfigured: configured,
      secretKeyStatus: configured ? "PASS" : "WARN",
      status: configured ? "PASS" : "WARN",
    };
  }

  storageConnectivityTestObjectKey(storage) {
    const projectsPrefix = String(storage.config?.projectsPrefix || "").trim();
    return `${projectsPrefix}${STORAGE_CONNECTIVITY_TEST_OBJECT_RELATIVE_PATH}`.replace(/\/{2,}/g, "/");
  }

  storageConnectivityConfigFailure(actionId, storage) {
    const missing = storage.config?.missingKeys?.join(", ") || storage.config?.validationError || "storage configuration incomplete";
    return {
      actionId,
      executed: false,
      message: `Storage connectivity requires configured storage and GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX before this action can run. Missing or invalid: ${missing}.`,
      secretEditingAllowed: false,
      secretsExposed: false,
      status: "FAIL",
      storageStatus: this.ownerStorageStatus(),
    };
  }

  storageConnectivityResult({ actionId, executed = true, keysListed = 0, message, objectKey, projectsPrefix, status }) {
    return {
      actionId,
      executed,
      keysListed,
      message,
      projectsPrefix,
      secretEditingAllowed: false,
      secretsExposed: false,
      status,
      storageStatus: this.ownerStorageStatus(),
      testObjectKey: objectKey,
    };
  }

  async runStorageConnectivityAction(actionId) {
    const action = STORAGE_CONNECTIVITY_ACTIONS.find((candidate) => candidate.id === actionId);
    if (!action) {
      throw new Error(`Unknown storage connectivity action: ${actionId || "missing actionId"}.`);
    }

    const storage = createConfiguredProjectAssetStorage();
    const projectsPrefix = String(storage.config?.projectsPrefix || "").trim();
    if (!storage.configured || !projectsPrefix) {
      return this.storageConnectivityConfigFailure(action.id, storage);
    }

    const objectKey = this.storageConnectivityTestObjectKey(storage);
    try {
      if (action.id === "storage-list") {
        const result = await storage.listProjectObjects();
        const keysListed = Array.isArray(result.keys) ? result.keys.length : 0;
        return this.storageConnectivityResult({
          actionId: action.id,
          keysListed,
          message: result.ok
            ? `List completed under ${projectsPrefix}; ${keysListed} object(s) returned.`
            : `${result.message || "Storage list failed."} Verify the endpoint, bucket, credentials, and GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX.`,
          objectKey,
          projectsPrefix,
          status: result.ok ? "PASS" : "FAIL",
        });
      }

      if (action.id === "storage-write-test-object") {
        const result = await storage.putObject({
          bytes: STORAGE_CONNECTIVITY_TEST_OBJECT_CONTENT,
          contentType: "text/plain; charset=utf-8",
          objectKey,
        });
        return this.storageConnectivityResult({
          actionId: action.id,
          message: result.ok
            ? `Write test object completed at ${objectKey}.`
            : `${result.message || "Storage write failed."} Verify write permission for ${projectsPrefix}.`,
          objectKey,
          projectsPrefix,
          status: result.ok ? "PASS" : "FAIL",
        });
      }

      if (action.id === "storage-read-test-object") {
        const result = await storage.readObject(objectKey);
        const text = result.ok ? Buffer.from(result.bytes || []).toString("utf8") : "";
        const contentMatches = text === STORAGE_CONNECTIVITY_TEST_OBJECT_CONTENT;
        return this.storageConnectivityResult({
          actionId: action.id,
          message: result.ok && contentMatches
            ? `Read test object completed from ${objectKey}.`
            : `${result.message || "Storage read failed or returned unexpected content."} Run Write test object first and verify read permission for ${projectsPrefix}.`,
          objectKey,
          projectsPrefix,
          status: result.ok && contentMatches ? "PASS" : "FAIL",
        });
      }

      const result = await storage.deleteObject(objectKey);
      return this.storageConnectivityResult({
        actionId: action.id,
        message: result.ok
          ? `Delete test object completed at ${objectKey}.`
          : `${result.message || "Storage delete failed."} Verify delete permission for ${projectsPrefix}.`,
        objectKey,
        projectsPrefix,
        status: result.ok ? "PASS" : "FAIL",
      });
    } catch (error) {
      return this.storageConnectivityResult({
        actionId: action.id,
        message: `Storage connectivity action failed: ${error instanceof Error ? error.message : String(error || "Unknown storage error.")}`,
        objectKey,
        projectsPrefix,
        status: "FAIL",
      });
    }
  }

  ownerPromotionFoundation() {
    const steps = [
      {
        id: "dev-export-plan",
        stage: "DEV",
        operation: "Export",
        safetyDiagnostic: "Read-only export planning only; no project records, asset references, or storage objects are changed.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan a read-only DEV export through Local API from Local DB/SQLite metadata, asset references, and configured project asset storage object keys.",
      },
      {
        id: "ist-import-plan",
        stage: "IST",
        operation: "Import",
        safetyDiagnostic: "Overwrite confirmation is not implemented; importing over an existing IST project must fail visibly before any write.",
        safetyStatus: "FAIL",
        status: "PLAN",
        message: "Plan DEV to IST promotion through reviewed server-side tooling; no browser import execution.",
      },
      {
        id: "ist-validate-plan",
        stage: "IST",
        operation: "Validate",
        safetyDiagnostic: "Validation planning is read-only and reports metadata/storage reference mismatches without modifying IST.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan validation of IST project metadata, asset references, and project asset storage objects before UAT promotion.",
      },
      {
        id: "uat-import-plan",
        stage: "UAT",
        operation: "Import",
        safetyDiagnostic: "Overwrite confirmation is not implemented; importing over an existing UAT project must fail visibly before any write.",
        safetyStatus: "FAIL",
        status: "PLAN",
        message: "Plan IST to UAT promotion through reviewed server-side tooling; no browser import execution.",
      },
      {
        id: "uat-validate-plan",
        stage: "UAT",
        operation: "Validate",
        safetyDiagnostic: "Validation planning is read-only and reports metadata/storage reference mismatches without modifying UAT.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan validation of UAT project metadata, asset references, and project asset storage objects before any PROD promotion.",
      },
      {
        id: "prod-import-plan",
        stage: "PROD",
        operation: "Import",
        safetyDiagnostic: "Overwrite confirmation is not implemented; importing over an existing PROD project must fail visibly before any write.",
        safetyStatus: "FAIL",
        status: "PLAN",
        message: "Plan a PROD import of project metadata, asset references, and project asset storage objects only after UAT validation evidence is reviewed.",
      },
      {
        id: "prod-validate-plan",
        stage: "PROD",
        operation: "Validate",
        safetyDiagnostic: "Validation planning is read-only and reports PROD readiness without modifying project data.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan runtime-safe PROD validation without destructive browser operations.",
      },
    ];
    return {
      browserExecutionAllowed: false,
      destructiveOperationsAllowed: false,
      exportImportRuntime: "reviewed server-side tooling only",
      importOverwriteAllowed: false,
      importOverwritePolicy: "fail-visible-until-explicit-confirmation",
      message: "Project promotion foundation is planning-only for DEV, IST, UAT, and PROD.",
      ownerOnly: true,
      overwriteConfirmationImplemented: false,
      promotionScope: "project metadata, asset references, and project asset storage objects",
      safetyMessage: "Export and Validate are read-only; Import overwrite is blocked until explicit confirmation exists.",
      secretEditingAllowed: false,
      status: "PASS",
      steps,
    };
  }

  async ownerDatabaseStatus() {
    const databaseStatus = {
      ...databaseConfigStatus(),
      lastMigration: {
        appliedAt: "",
        name: "",
        type: "",
      },
      lastMigrationStatus: "WARN",
      migrationCounts: {
        DDL: 0,
        DML: 0,
      },
      migrationStatus: "WARN",
      status: "WARN",
    };
    try {
      const adapter = this.supabaseDatabaseAdapter("Reading Owner Operations migration history");
      const countRows = await adapter.databaseClient().query(`
SELECT "migrationType", count(*)::int AS count
FROM schema_migrations
GROUP BY "migrationType"
ORDER BY "migrationType";
`);
      const lastRows = await adapter.databaseClient().query(`
SELECT "migrationType", "migrationName", "appliedAt"
FROM schema_migrations
ORDER BY "appliedAt" DESC, key DESC
LIMIT 1;
`);
      const counts = new Map(countRows.map((row) => [String(row.migrationType || ""), Number(row.count || 0)]));
      const lastRow = lastRows[0] || {};
      return {
        ...databaseStatus,
        lastMigration: {
          appliedAt: String(lastRow.appliedAt || ""),
          name: String(lastRow.migrationName || ""),
          type: String(lastRow.migrationType || ""),
        },
        lastMigrationStatus: lastRow.migrationName ? "PASS" : "WARN",
        migrationCounts: {
          DDL: counts.get("DDL") || 0,
          DML: counts.get("DML") || 0,
        },
        migrationStatus: "PASS",
        status: databaseStatus.configured === true ? "PASS" : "WARN",
      };
    } catch (error) {
      return {
        ...databaseStatus,
        message: `Migration history read failed: ${error instanceof Error ? error.message : String(error || "Unknown database error.")}`,
      };
    }
  }

  async ownerOperationsStatus() {
    await this.requireOwnerSession();
    return {
      actions: clone(OWNER_OPERATION_ACTIONS),
      connectionSummary: this.ownerConnectionSummary(),
      databaseStatus: await this.ownerDatabaseStatus(),
      message: "Owner Operations loaded. Environment switching remains manual through configuration changes and server restart.",
      promotionFoundation: this.ownerPromotionFoundation(),
      secretEditingAllowed: false,
      status: "PASS",
      storageStatus: this.ownerStorageStatus(),
    };
  }

  async adminInfrastructureStoragePathStatus() {
    await this.requireAdminSession();
    return storageProjectsPrefixStatus();
  }

  async adminInfrastructureStorageConnectivityAction(body = {}) {
    await this.requireAdminSession();
    return this.runStorageConnectivityAction(String(body.actionId || "").trim());
  }

  async adminSystemHealthStatus() {
    const session = await this.requireAdminSession();
    const authStatus = this.authStatus();
    const databaseStatus = await this.ownerDatabaseStatus();
    const storageStatus = this.ownerStorageStatus();
    const environmentStatus = storageProjectsPrefixStatus();
    const limitRows = systemHealthLimitRows();
    const packageStatus = projectPackageReadinessStatus();
    const promotionFoundation = this.ownerPromotionFoundation();
    const importBlocked = promotionFoundation.importOverwriteAllowed === false
      && promotionFoundation.browserExecutionAllowed === false
      && promotionFoundation.destructiveOperationsAllowed === false;
    const overview = [
      {
        area: "Account/session readiness",
        status: session.authenticated && session.isAdmin ? "PASS" : "FAIL",
        summary: session.authenticated && session.isAdmin
          ? "Current session is authenticated with Admin access."
          : "Sign in with an Admin account to view system health.",
      },
      {
        area: "Product Data / Local DB",
        status: databaseStatus.configured === true ? databaseStatus.status || "PASS" : "WARN",
        summary: databaseStatus.configured === true
          ? `Local DB status is configured for ${databaseStatus.databaseName || "configured database"}.`
          : databaseStatus.message || "Local DB configuration is not complete.",
      },
      {
        area: "Project Asset Storage / R2",
        status: storageStatus.status || "WARN",
        summary: storageStatus.message || "Project asset storage status unavailable.",
      },
      {
        area: "Environment configuration",
        status: environmentStatus.status === "PASS" ? "PASS" : "WARN",
        summary: environmentStatus.status === "PASS"
          ? `${environmentStatus.variableName} matches exactly one project storage lane.`
          : `${environmentStatus.variableName} is missing or does not match an approved project storage lane.`,
      },
      {
        area: "Secrets status",
        status: storageStatus.accessKeyConfigured && storageStatus.secretKeyConfigured ? "PASS" : "WARN",
        summary: storageStatus.accessKeyConfigured && storageStatus.secretKeyConfigured
          ? "Storage credentials are configured; secret values are hidden."
          : "Storage credentials are not fully configured; secret values remain hidden.",
      },
      {
        area: "Environment limits",
        status: "WARN",
        summary: "Limits are read from current .env because values may differ by DEV/IST/UAT/PRD; live usage is NOT AVAILABLE until provider usage metrics are exposed safely.",
      },
      {
        area: "Migration status",
        status: databaseStatus.migrationStatus || "WARN",
        summary: `DDL=${databaseStatus.migrationCounts?.DDL || 0}; DML=${databaseStatus.migrationCounts?.DML || 0}; last=${databaseStatus.lastMigration?.name || "not recorded"}.`,
      },
      {
        area: "Project package readiness",
        status: packageStatus.status,
        summary: packageStatus.message,
      },
      {
        area: "Promotion/package safety",
        status: importBlocked ? "PASS" : "WARN",
        summary: promotionFoundation.safetyMessage || "Promotion safety status unavailable.",
      },
    ];
    return {
      details: [
        { area: "Account/session readiness", field: "Session", status: session.authenticated ? "PASS" : "FAIL", value: session.authenticated ? "authenticated" : "not authenticated" },
        { area: "Account/session readiness", field: "Role", status: session.isAdmin ? "PASS" : "FAIL", value: session.isAdmin ? "Admin" : "Admin required" },
        { area: "Product Data / Local DB", field: "Database host", status: databaseStatus.hostStatus || "WARN", value: databaseStatus.host || "not configured" },
        { area: "Product Data / Local DB", field: "Database name", status: databaseStatus.databaseNameStatus || "WARN", value: databaseStatus.databaseName || "not configured" },
        { area: "Project Asset Storage / R2", field: "Endpoint", status: storageStatus.endpointStatus || "WARN", value: storageStatus.endpoint || "not configured" },
        { area: "Project Asset Storage / R2", field: "Bucket", status: storageStatus.bucketStatus || "WARN", value: storageStatus.bucket || "not configured" },
        { area: "Project Asset Storage / R2", field: "Projects prefix", status: storageStatus.projectsPrefixStatus || "WARN", value: storageStatus.projectsPrefix || "not configured" },
        { area: "Environment configuration", field: environmentStatus.variableName, status: environmentStatus.status, value: environmentStatus.configured ? "valid lane match" : "missing or invalid" },
        { area: "Secrets status", field: "Storage access key", status: storageStatus.accessKeyStatus || "WARN", value: storageStatus.accessKeyConfigured ? "configured; value hidden" : "not configured" },
        { area: "Secrets status", field: "Storage secret key", status: storageStatus.secretKeyStatus || "WARN", value: storageStatus.secretKeyConfigured ? "configured; value hidden" : "not configured" },
        { area: "Migration status", field: "Migration counts", status: databaseStatus.migrationStatus || "WARN", value: `DDL=${databaseStatus.migrationCounts?.DDL || 0}; DML=${databaseStatus.migrationCounts?.DML || 0}` },
        { area: "Project package readiness", field: ".gfsp decision", status: packageStatus.status, value: packageStatus.decisionPath },
        { area: "Promotion/package safety", field: "Browser destructive operations", status: promotionFoundation.destructiveOperationsAllowed === false ? "PASS" : "WARN", value: promotionFoundation.destructiveOperationsAllowed === false ? "disabled" : "review required" },
        { area: "Promotion/package safety", field: "Import overwrite", status: promotionFoundation.importOverwriteAllowed === false ? "PASS" : "WARN", value: promotionFoundation.importOverwritePolicy || "review required" },
      ],
      links: {
        infrastructure: "/admin/infrastructure.html",
        ownerOperations: "/owner/operations.html",
      },
      limits: limitRows,
      message: "Admin System Health loaded safe status only.",
      overview,
      pressureLabels: SYSTEM_HEALTH_LIMIT_PRESSURE_LABELS,
      secretEditingAllowed: false,
      secretsExposed: false,
      status: overallHealthStatus(overview),
    };
  }

  projectWorkspaceProjectsForRoute() {
    const activeProject = this.gameWorkspaceRepository.getActiveGame();
    const records = gameWorkspaceProjectRecords(this.gameWorkspaceRepository);
    return {
      api: "Local API",
      apiOwnsAuthoritativeProjectKeys: true,
      activeProjectKey: activeProject ? gameWorkspaceGameKey(activeProject.id) : "",
      browserProductDataSsoT: false,
      database: "Local DB",
      databaseEngine: "SQLite",
      guestBrowsingAllowed: true,
      guestSavingAllowed: false,
      pageLocalProductDataArrays: false,
      recordCount: records.length,
      records,
      serviceContract: "Web UI -> Local API/Service Contract -> Local DB",
      source: "Local API",
      terminology: "Project Workspace",
    };
  }

  async validateOwnerConnection() {
    await this.requireOwnerSession();
    const authStatus = await this.authStatusForRoute();
    let productCheck = {
      ready: false,
      status: "unavailable",
      message: "Product data connection was not validated.",
    };
    try {
      const connection = this.supabaseDatabaseAdapter("Validating Owner Operations product data connection").connect();
      productCheck = {
        ready: connection.ready === true,
        status: connection.ready === true ? "ready" : "unavailable",
        message: connection.ready === true
          ? "Product data connection is configured."
          : "Product data connection did not report ready.",
      };
    } catch (error) {
      productCheck = {
        ready: false,
        status: "unavailable",
        message: error instanceof Error ? error.message : String(error || "Product data connection validation failed."),
      };
    }
    const accountReady = authStatus.ready === true;
    const status = accountReady && productCheck.ready ? "PASS" : "FAIL";
    return {
      checks: [
        {
          id: "account-connection",
          label: "Account connection",
          status: accountReady ? "PASS" : "FAIL",
          message: authStatus.operatorDiagnostic || authStatus.message || "Account connection status unavailable.",
        },
        {
          id: "product-data-connection",
          label: "Product data connection",
          status: productCheck.ready ? "PASS" : "FAIL",
          message: productCheck.message,
        },
      ],
      connectionSummary: this.ownerConnectionSummary(),
      databaseStatus: await this.ownerDatabaseStatus(),
      executed: true,
      message: status === "PASS"
        ? "Current configured connections validated."
        : "Current configured connection validation failed.",
      secretEditingAllowed: false,
      status,
      promotionFoundation: this.ownerPromotionFoundation(),
      storageStatus: this.ownerStorageStatus(),
    };
  }

  async runOwnerOperationAction(body = {}) {
    await this.requireOwnerSession();
    const actionId = String(body.actionId || "").trim();
    const action = OWNER_OPERATION_ACTIONS.find((candidate) => candidate.id === actionId);
    if (!action) {
      throw new Error(`Unknown Owner Operations action: ${actionId || "missing actionId"}.`);
    }
    if (action.id === "validate-current-connection") {
      return this.validateOwnerConnection();
    }
    if (action.mode === "storage-connectivity") {
      return this.runStorageConnectivityAction(action.id);
    }
    return {
      actionId: action.id,
      executed: false,
      manualOnly: true,
      message: `${action.label} is staged in Owner Operations but must be executed manually through reviewed server-side scripts, configuration changes, and server restart.`,
      secretEditingAllowed: false,
      status: "SKIP",
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
    const browserOwnedProductDataActive = false;
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
      browserOwnedProductDataActive,
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
      browserOwnedProductDataActive: status.browserOwnedProductDataActive,
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
          ...createMockDbAuditFields(index, SEED_DB_KEYS.users.forgeBot),
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
          ...createMockDbAuditFields(index, SEED_DB_KEYS.users.forgeBot),
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
        ...createMockDbAuditFields(index, SEED_DB_KEYS.users.forgeBot),
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
        ...createMockDbAuditFields(index, SEED_DB_KEYS.users.forgeBot),
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
      ownerMenuItems: clone(OWNER_NAVIGATION_ITEMS),
      ownership: {
        adminMainItems: "navigation config",
        ownerMenuItems: "owner navigation config",
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
    if (repository === this.gameWorkspaceRepository && GAME_WORKSPACE_SAVE_METHODS.has(methodName) && !this.sessionUserKey) {
      throw new Error("Sign in required to save Project Workspace project records through Local API.");
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
    const result = await method(...args);
    assertRepositoryMethodResult(repositoryId, methodName, result);
    if (repositoryMethodRequiresPersistence(methodName)) {
      if (repository === this.gameWorkspaceRepository) {
        await this.persistGameWorkspaceProviderState(`Persisting ${methodName} result`);
      } else if (repository === this.assetRepository) {
        await this.persistAssetProviderState(`Persisting ${methodName} result`);
      } else {
        await this.persistProductProviderState(`Persisting ${methodName} result`);
      }
    }
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

/**
 * Legacy export name retained for the existing dev:local-api command surface.
 * The router itself serves the configured server API contract.
 */
export function createLocalApiRouter() {
  const dataSource = new ApiRuntimeDataSource();

  return async function handleApiRuntimeRequest(request, response, requestUrl) {
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

      if (parts[1] === "project-workspace" && request.method === "GET" && parts[2] === "projects") {
        ok(response, dataSource.projectWorkspaceProjectsForRoute());
        return true;
      }

      if (parts[1] === "platform-settings" && request.method === "GET" && parts[2] === "banner") {
        ok(response, await dataSource.platformBannerForRoute());
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "setup" && request.method === "POST" && parts[3] === "reseed") {
        fail(response, 410, new Error("Admin reseed endpoint is removed. Use configured server setup/sync scripts."));
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

      if (parts[1] === "admin" && parts[2] === "platform-settings" && request.method === "GET" && parts[3] === "banner") {
        ok(response, await dataSource.adminPlatformBannerForRoute());
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "platform-settings" && request.method === "POST" && parts[3] === "banner") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.updateAdminPlatformBanner(body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "infrastructure" && request.method === "GET" && parts[3] === "storage-path-status") {
        ok(response, await dataSource.adminInfrastructureStoragePathStatus());
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "infrastructure" && request.method === "POST" && parts[3] === "storage-connectivity-action") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.adminInfrastructureStorageConnectivityAction(body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "system-health" && request.method === "GET" && parts[3] === "status") {
        ok(response, await dataSource.adminSystemHealthStatus());
        return true;
      }

      if (parts[1] === "owner" && parts[2] === "operations" && request.method === "GET" && parts[3] === "status") {
        ok(response, await dataSource.ownerOperationsStatus());
        return true;
      }

      if (parts[1] === "owner" && parts[2] === "operations" && request.method === "POST" && parts[3] === "validate") {
        ok(response, await dataSource.validateOwnerConnection());
        return true;
      }

      if (parts[1] === "owner" && parts[2] === "operations" && request.method === "POST" && parts[3] === "action") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.runOwnerOperationAction(body));
        return true;
      }

      if (parts[1] === "guest" && parts[2] === "seed" && request.method === "GET") {
        ok(response, dataSource.guestSeedPackages());
        return true;
      }

      if (parts[1] === "storage" && parts[2] === "project-assets" && parts[3] === "read" && request.method === "GET") {
        const objectKey = String(requestUrl.searchParams.get("key") || "").trim();
        const storage = createConfiguredProjectAssetStorage();
        const projectsPrefix = String(storage.config?.projectsPrefix || "").trim();
        if (!objectKey || !projectsPrefix || !objectKey.startsWith(projectsPrefix)) {
          fail(response, 400, new Error("Project asset storage read requires an object key under the configured projects prefix."));
          return true;
        }
        const result = await storage.readObject(objectKey);
        if (!result.ok) {
          fail(response, 404, new Error(result.message || "Project asset storage object was not found."));
          return true;
        }
        sendBinary(response, 200, result.bytes, result.contentType || "application/octet-stream");
        return true;
      }

      if (parts[1] === "storage" && parts[2] === "project-assets" && parts[3] === "list" && request.method === "GET") {
        const projectId = String(requestUrl.searchParams.get("projectId") || "").trim();
        const storage = createConfiguredProjectAssetStorage();
        const projectsPrefix = String(storage.config?.projectsPrefix || "").trim();
        if (!projectsPrefix) {
          fail(response, 400, new Error("Project asset storage list requires configured project storage."));
          return true;
        }
        const result = await storage.listProjectObjects(projectId);
        if (!result.ok) {
          fail(response, 404, new Error(result.message || "Project asset storage objects were not listed."));
          return true;
        }
        ok(response, {
          keys: result.keys,
          message: result.message,
          projectId,
          projectsPrefix,
        });
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
