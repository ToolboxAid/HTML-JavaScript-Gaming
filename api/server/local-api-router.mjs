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
  createHitboxesToolMockRepository,
} from "../persistence/tool-repositories/hitboxes-mock-repository.js";
import {
  createInputMappingToolMockRepository,
} from "../persistence/tool-repositories/input-mapping-mock-repository.js";
import { createConfiguredBackupStorage, createConfiguredProjectAssetStorage } from "../storage/r2-project-asset-storage.mjs";
import {
  STORAGE_PROJECTS_PREFIX_LANES,
  loadStorageConfig,
  normalizeStorageProjectsPrefix,
} from "../storage/storage-config.mjs";
import { createPostgresBackup } from "../database/postgres-backup-service.mjs";
import {
  GFSP_PACKAGE_REQUIRED_FILES,
  GFSP_PACKAGE_FILENAME_PATTERN,
  createProjectPackage,
  projectPackageReadinessContract,
  validateProjectPackage,
} from "../project-packages/project-package-service.mjs";
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
  GAME_DESIGN_GAME_TYPES,
  GAME_DESIGN_GENRES,
  GAME_DESIGN_PLAYER_MODES,
  GAME_DESIGN_PLAY_STYLES,
  TAGS_TOOL_TABLES,
  createGameConfigurationApiService,
  createGameDesignApiService,
  createObjectsApiService,
  createTagsApiService,
} from "../toolbox-api/alfa-tool-services.mjs";
import {
  GAME_JOURNEY_KEYS,
  GAME_JOURNEY_STATUS_BY_ID,
  GAME_JOURNEY_STATUSES,
  GAME_JOURNEY_RECOMMENDED_TARGETS,
  GAME_JOURNEY_SUGGESTED_TOOLS,
  GAME_JOURNEY_TOOL_OWNERSHIP_AREAS,
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
import {
  MembershipAssignmentError,
  assignUserMembership,
  readMembershipCatalog,
  resolveActiveUserMembership,
} from "../memberships/membership-assignment-service.mjs";
import {
  OwnerMembershipSettingsError,
  readOwnerMembershipSettings,
  updateOwnerMembershipSettings,
} from "../memberships/owner-membership-settings-service.mjs";
import {
  AiCreditError,
  readAiCreditDisplay,
} from "../ai/ai-credit-service.mjs";
import {
  OwnerAiCreditSettingsError,
  readOwnerAiCreditSettings,
  updateOwnerAiCreditSettings,
} from "../ai/owner-ai-credit-settings-service.mjs";
import {
  MarketplaceEntitlementError,
  readMarketplaceEntitlements,
} from "../marketplace/marketplace-entitlement-service.mjs";
import {
  MarketplaceCategoryError,
  readMarketplaceCategories,
} from "../marketplace/marketplace-category-service.mjs";
import {
  MarketplaceRevenueError,
  readMarketplaceSellerRevenueModel,
} from "../marketplace/marketplace-revenue-service.mjs";
import { handleAdminNotesDirectoryApiRequest } from "../admin/admin-notes-directory.mjs";
import {
  createMessagesPostgresService,
  handleMessagesApiContract,
} from "../messages/messages-postgres-service.mjs";
import {
  LegalDocumentError,
  readPublishedLegalDocument,
} from "../legal/legal-document-service.mjs";
import {
  getAdminNavigationItems,
  getOwnerNavigationItems,
} from "../../www/src/api/admin-owner-navigation.js";
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
  invitations: "Invites",
  marketplace_categories: "Marketplace Categories",
  user_roles: "Creator Responsibilities",
});
const DB_VIEWER_GROUP_ORDER = Object.freeze([
  Object.freeze({ id: "asset", label: "Asset", ownerId: "asset", type: "tool" }),
  Object.freeze({ id: "controls", label: "Controls", ownerId: "controls", type: "tool" }),
  Object.freeze({ id: "game-configuration", label: "Game Configuration", ownerId: "game-configuration", type: "tool" }),
  Object.freeze({ id: "game-design", label: "Game Design", ownerId: "game-design", type: "tool" }),
  Object.freeze({ id: "game-journey", label: "Game Journey", ownerId: "game-journey", type: "tool" }),
  Object.freeze({ id: "game-hub", label: "Game Hub", ownerId: "game-hub", type: "tool" }),
  Object.freeze({ id: "objects", label: "Objects", ownerId: "objects", type: "tool" }),
  Object.freeze({ id: "palette", label: "Palette", ownerId: "palette", type: "tool" }),
  Object.freeze({ id: "tags", label: "Tags", ownerId: "tags", type: "tool" }),
  Object.freeze({ id: "toolbox_tool_metadata", label: "Tool Metadata", tableNames: Object.freeze(["toolbox_tool_metadata"]), type: "table" }),
  Object.freeze({ id: "toolbox_tool_planning", label: "Tool Planning", tableNames: Object.freeze(["toolbox_tool_planning"]), type: "table" }),
  Object.freeze({ id: "tool_state_samples", label: "Tool State Samples", tableNames: Object.freeze(["tool_state_samples"]), type: "table" }),
  Object.freeze({ id: "toolbox_votes", label: "Toolbox Votes", tableNames: DB_VIEWER_TOOLBOX_VOTE_TABLES, type: "table" }),
  Object.freeze({ id: "invitations", label: "Invites", tableNames: Object.freeze(["invitations"]), type: "table" }),
  Object.freeze({ id: "marketplace_categories", label: "Marketplace Categories", tableNames: Object.freeze(["marketplace_categories"]), type: "table" }),
  Object.freeze({ id: "user_roles", label: "Creator Responsibilities", tableNames: DB_VIEWER_IDENTITY_TABLES, type: "table" }),
]);
const TOOLBOX_DEFAULT_RELEASE_CHANNELS = Object.freeze(["wireframe", "beta", "complete"]);
const BUILD_PATH_DEFAULT_RELEASE_CHANNELS = Object.freeze(["complete"]);
const GAME_CREW_TABLES = Object.freeze(["project_members"]);
const GAME_CREW_MEMBER_ROLES = Object.freeze([
  "Owner",
  "Member",
]);
const GAME_CREW_KNOWN_USERS = Object.freeze({
  [SEED_DB_KEYS.users.user1]: "User 1",
  [SEED_DB_KEYS.users.user2]: "User 2",
  [SEED_DB_KEYS.users.user3]: "User 3",
  [SEED_DB_KEYS.users.admin]: "DavidQ",
});
const GAME_CREW_TEST_MEMBER_KEY = SEED_DB_KEYS.users.user2;
const TOOLBOX_RELEASE_CHANNEL_SWATCHES = Object.freeze({
  planned: "swatch-gray",
  wireframe: "swatch-blue",
  beta: "swatch-gold",
  complete: "swatch-green",
  deprecated: "swatch-purple",
});
const TOOLBOX_ROLE_FOCUS_TOOLS = Object.freeze({
  Owner: null,
  Designer: Object.freeze(["Game Hub", "Game Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Characters", "Colors", "Assets", "Tags"]),
  "World Builder": Object.freeze(["Worlds", "Objects", "Assets", "Colors", "Tags", "Animations"]),
  Artist: Object.freeze(["Assets", "Colors", "Tags", "Fonts", "Sprites", "Characters", "Objects", "Animations"]),
  "Audio Creator": Object.freeze(["Audio", "Music", "Voices", "MIDI", "Audio Effects", "Voice Capture", "Text To Speech", "Assets"]),
  Translator: Object.freeze(["Languages", "Voices", "Voice Capture", "Text To Speech"]),
  Tester: Object.freeze(["Game Testing", "Controls", "Hitboxes", "Debug", "Performance", "Events"]),
  Publisher: Object.freeze(["Publish", "Marketplace", "Community", "Cloud", "Languages"]),
  Viewer: Object.freeze(["Game Hub", "Game Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Assets", "Colors", "Tags", "Audio", "Publish", "Marketplace", "Community", "Languages", "Achievements", "Ratings"]),
});
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
const PUBLIC_CONFIG_ENV_KEYS = Object.freeze({
  apiUrl: "GAMEFOUNDRY_API_URL",
  environmentLabel: "GAMEFOUNDRY_ENVIRONMENT_LABEL",
  siteUrl: "GAMEFOUNDRY_SITE_URL",
});
const ENVIRONMENT_BANNER_SOURCE = "environment-config";
const ENVIRONMENT_LABEL_HIDDEN_VALUES = Object.freeze(["prd", "production"]);
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
const RUNTIME_ENV_SECRET_MARKERS = Object.freeze([
  "PASSWORD",
  "SECRET",
  "TOKEN",
  "KEY",
  "SERVICE_ROLE",
  "JWT",
  "DATABASE_URL",
]);
const LOCAL_API_STARTUP_DEFAULT_HOST = "127.0.0.1";
const LOCAL_API_STARTUP_DEFAULT_PORT = "5501";
const LOCAL_API_STARTUP_DEFAULT_PORT_BY_PROTOCOL = Object.freeze({
  "http:": "80",
  "https:": "443",
});
const LOCAL_API_PROCESS_STARTED_AT = new Date().toISOString();
const SYSTEM_HEALTH_API_CONTRACT_VERSION = "2026-06-24.system-health.v1";
const SYSTEM_HEALTH_USAGE_NOT_AVAILABLE = "NOT AVAILABLE";
const SYSTEM_HEALTH_USAGE_CONTRACTS = Object.freeze({
  GAMEFOUNDRY_DB_CONNECTION_LIMIT: Object.freeze({
    integrationPoint: "Future Local DB pool telemetry can report active connection count through the Local API.",
  }),
  GAMEFOUNDRY_DB_SIZE_LIMIT_BYTES: Object.freeze({
    integrationPoint: "Future Local DB storage telemetry can report database bytes used through the Local API.",
  }),
  GAMEFOUNDRY_STORAGE_CLASS_A_LIMIT_MONTHLY: Object.freeze({
    integrationPoint: "Future R2 provider telemetry can report monthly Class A operation count through the Local API.",
  }),
  GAMEFOUNDRY_STORAGE_CLASS_B_LIMIT_MONTHLY: Object.freeze({
    integrationPoint: "Future R2 provider telemetry can report monthly Class B operation count through the Local API.",
  }),
  GAMEFOUNDRY_STORAGE_LIMIT_BYTES: Object.freeze({
    integrationPoint: "Future R2 provider telemetry can report project asset storage bytes used through the Local API.",
  }),
});
const STORAGE_CONNECTIVITY_ACTIONS = Object.freeze([
  Object.freeze({ id: "storage-bucket-connectivity", label: "Bucket connectivity", operation: "bucket-connectivity" }),
  Object.freeze({ id: "storage-list", label: "List", operation: "list" }),
  Object.freeze({ id: "storage-upload-test-object", label: "Upload test object", operation: "upload" }),
  Object.freeze({ id: "storage-write-test-object", label: "Write test object", operation: "upload" }),
  Object.freeze({ id: "storage-read-test-object", label: "Read test object", operation: "read" }),
  Object.freeze({ id: "storage-delete-test-object", label: "Delete test object", operation: "delete" }),
]);
const SYSTEM_HEALTH_STORAGE_ACTION_IDS = Object.freeze([
  "storage-bucket-connectivity",
  "storage-list",
  "storage-upload-test-object",
  "storage-read-test-object",
  "storage-delete-test-object",
]);
const SYSTEM_HEALTH_STORAGE_EXPANDED_VALIDATION_ACTION_ID = "storage-expanded-validation";
const SYSTEM_HEALTH_MANUAL_ACTION_LABELS = Object.freeze({
  "database-check": "Run Database Check",
  "full-health-check": "Run Full Health Check",
  refresh: "Refresh",
  "runtime-check": "Run Runtime Check",
  "storage-check": "Run Storage Check",
});
const SYSTEM_HEALTH_API_ENDPOINTS = Object.freeze([
  Object.freeze({ method: "GET", path: "/api/runtime/health", purpose: "Read public-safe Local API runtime health JSON." }),
  Object.freeze({ method: "GET", path: "/api/admin/system-health/status", purpose: "Read current deployment System Health status." }),
  Object.freeze({ method: "POST", path: "/api/admin/system-health/action", purpose: "Run current deployment manual health actions." }),
  Object.freeze({ method: "POST", path: "/api/admin/system-health/storage-connectivity-action", purpose: "Run current deployment R2 folder diagnostics." }),
]);
const ADMIN_API_REGISTRY_ENTRIES = Object.freeze([
  Object.freeze({ method: "GET", owner: "Team Charlie", path: "/api/runtime/health", purpose: "Runtime health JSON contract" }),
  Object.freeze({ method: "GET", owner: "Team Charlie", path: "/api/admin/system-health/status", purpose: "System Health status contract" }),
  Object.freeze({ method: "POST", owner: "Team Charlie", path: "/api/admin/system-health/action", purpose: "System Health manual actions" }),
  Object.freeze({ method: "POST", owner: "Team Charlie", path: "/api/admin/system-health/storage-connectivity-action", purpose: "System Health R2 diagnostics" }),
  Object.freeze({ method: "GET", owner: "Team Charlie", path: "/api/admin/infrastructure/storage-path-status", purpose: "Infrastructure storage path status" }),
  Object.freeze({ method: "POST", owner: "Team Charlie", path: "/api/admin/infrastructure/storage-connectivity-action", purpose: "Infrastructure R2 diagnostics" }),
  Object.freeze({ method: "GET", owner: "Team Charlie", path: "/api/admin/operations/status", purpose: "Admin Operations status" }),
  Object.freeze({ method: "POST", owner: "Team Charlie", path: "/api/admin/operations/action", purpose: "Admin Operations actions" }),
  Object.freeze({ method: "GET", owner: "Shared Admin Navigation", path: "/api/navigation/admin-menu", purpose: "Admin navigation menu contract" }),
]);
const STORAGE_CONNECTIVITY_TEST_OBJECT_CONTENT = "Game Foundry Studio storage connectivity test object.\n";
const STORAGE_CONNECTIVITY_TEST_OBJECT_RELATIVE_PATH = "connectivity/storage-connectivity-test.txt";
const SYSTEM_HEALTH_ENVIRONMENT_MODELS = Object.freeze([
  Object.freeze({
    databaseModel: "Local Docker PostgreSQL",
    hostingModel: "VS Code + Local API",
    name: "Local",
    storageFolder: "/local",
  }),
  Object.freeze({
    databaseModel: "Local Docker PostgreSQL",
    hostingModel: "Local Docker",
    name: "DEV",
    storageFolder: "/dev",
  }),
  Object.freeze({
    databaseModel: "Local Docker PostgreSQL",
    hostingModel: "Local Docker",
    name: "IST",
    storageFolder: "/ist",
  }),
  Object.freeze({
    databaseModel: "Supabase PostgreSQL",
    hostingModel: "Cloudflare",
    name: "UAT",
    storageFolder: "/uat",
  }),
  Object.freeze({
    databaseModel: "Supabase PostgreSQL",
    hostingModel: "Cloudflare",
    name: "PRD",
    storageFolder: "/prd",
  }),
]);
const SYSTEM_HEALTH_ENVIRONMENT_BY_NAME = new Map(SYSTEM_HEALTH_ENVIRONMENT_MODELS.map((model) => [model.name, model]));
const SYSTEM_HEALTH_ENVIRONMENT_BY_FOLDER = new Map([
  ...SYSTEM_HEALTH_ENVIRONMENT_MODELS.map((model) => [model.storageFolder, model.name]),
  ["/prod", "PRD"],
]);
const ADMIN_OPERATION_GROUPS = Object.freeze([
  Object.freeze({
    id: "project-packaging",
    label: "Project Packaging",
    message: "Project package actions run through the Local API package contract. Browser controls only submit files and confirmations.",
    actions: Object.freeze([
      Object.freeze({
        diagnostic: "Export Project Package creates a .gfsp ZIP package for the active Game Hub record and validates it before returning diagnostics.",
        id: "export-project-package",
        label: "Export Project Package",
        mode: "server-package",
        status: "PASS",
      }),
      Object.freeze({
        diagnostic: "Validate Project Package inspects .gfsp integrity, required files, schema validity, compatibility, and asset references without importing.",
        id: "validate-project-package",
        label: "Validate Project Package",
        mode: "server-package",
        requiresPackageFile: true,
        status: "PASS",
      }),
      Object.freeze({
        confirmationMessage: "Replace Existing requires explicit confirmation before an existing project can be overwritten.",
        confirmationPhrase: "REPLACE",
        diagnostic: "Import Project Package validates first, detects project conflicts, and supports Replace Existing or Import As New Project without silent overwrite.",
        id: "import-project-package",
        label: "Import Project Package",
        mode: "server-package",
        risky: true,
        confirmationRequired: true,
        requiresPackageFile: true,
        status: "WARN",
        supportsImportModes: true,
      }),
    ]),
  }),
  Object.freeze({
    id: "backup-recovery",
    label: "Backup & Recovery",
    message: "Backup and recovery actions run through guarded Local API contracts with environment-aware restore restrictions.",
    actions: Object.freeze([
      Object.freeze({
        diagnostic: "Create Backup validates the configured Local DB connection, runs server-side pg_dump --format=custom into temporary staging, uploads the .dump to the configured R2 backup prefix, then removes staging.",
        id: "create-backup",
        label: "Create Backup",
        mode: "server-backup",
        status: "PASS",
      }),
      Object.freeze({
        confirmationMessage: "Restore From Backup is scaffold-only until server-side pg_restore safety is approved.",
        confirmationPhrase: "RESTORE",
        diagnostic: "Restore From Backup reports guarded not-implemented diagnostics and does not apply browser-uploaded backup data.",
        id: "restore-from-backup",
        label: "Restore From Backup",
        mode: "server-backup",
        risky: true,
        confirmationRequired: true,
        requiresBackupFile: true,
        status: "WARN",
      }),
    ]),
  }),
  Object.freeze({
    id: "database-operations",
    label: "Database Operations",
    message: "Database actions use Local API checks or return guarded diagnostics.",
    actions: Object.freeze([
      Object.freeze({
        diagnostic: "Validate Current Connection checks the configured account session and Local DB connection without changing data.",
        id: "validate-current-connection",
        label: "Validate Current Connection",
        mode: "live-check",
        status: "PASS",
      }),
      Object.freeze({
        diagnostic: "Database Connectivity Test checks the configured Local DB connection without changing data.",
        id: "database-connectivity-test",
        label: "Database Connectivity Test",
        mode: "live-check",
        status: "PASS",
      }),
      Object.freeze({
        confirmationMessage: "Run Migration is risky and must require explicit confirmation before migration execution is implemented.",
        diagnostic: "Run Migration is not implemented from Admin Operations; use reviewed server-side migration scripts.",
        id: "run-migration",
        label: "Run Migration",
        mode: "manual-only",
        notImplemented: true,
        risky: true,
        confirmationRequired: true,
        status: "SKIP",
      }),
      Object.freeze({
        confirmationMessage: "Reseed DEV is destructive and is only available when the configured project storage lane resolves to DEV.",
        devOnly: true,
        diagnostic: "Reseed DEV is not implemented from Admin Operations; use reviewed DEV-only reseed scripts.",
        id: "reseed-dev",
        label: "Reseed DEV",
        mode: "manual-only",
        notImplemented: true,
        risky: true,
        confirmationRequired: true,
        status: "SKIP",
      }),
    ]),
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
  const normalizedPath = normalizeStorageProjectsPrefix(currentPath.value);
  const matchedLane = STORAGE_PROJECTS_PREFIX_LANES.find((lane) => lane.path === normalizedPath);
  const invalidPath = !currentPath.found || !normalizedPath || !matchedLane;
  const rows = STORAGE_PROJECTS_PREFIX_LANES.map((lane) => {
    if (invalidPath) {
      return {
        ...lane,
        active: false,
        status: "ERROR",
        value: "ERROR",
      };
    }
    const active = normalizedPath === lane.path;
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
    missing: !currentPath.found || !normalizedPath,
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

function systemHealthPostgresMetrics(databaseStatus = {}, checkedAt = new Date().toISOString()) {
  const reason = databaseStatus.message || "Postgres metrics are reported only when the current environment database reader returns safe values.";
  const tableCount = Number(databaseStatus.tableCount);
  const metricRows = [
    {
      metric: "Connection status",
      status: databaseStatus.connectivityStatus || databaseStatus.status || "WARN",
      value: databaseStatus.connectivity || "Unavailable",
    },
    {
      metric: "Database name",
      status: databaseStatus.currentDatabaseNameStatus || databaseStatus.databaseNameStatus || "WARN",
      value: databaseStatus.currentDatabaseName || databaseStatus.databaseName || "Unavailable",
    },
    {
      metric: "Current schema",
      status: databaseStatus.currentSchemaStatus || "WARN",
      value: databaseStatus.currentSchema || "Unavailable",
    },
    {
      metric: "Migration status",
      status: databaseStatus.migrationStatus || "WARN",
      value: databaseStatus.migrationStatus === "PASS"
        ? `DDL=${databaseStatus.migrationCounts?.DDL || 0}; DML=${databaseStatus.migrationCounts?.DML || 0}`
        : "Unavailable",
    },
    {
      metric: "Last migration",
      status: databaseStatus.lastMigrationStatus || "WARN",
      value: databaseStatus.lastMigration?.name || "Unavailable",
    },
    {
      metric: "Table count",
      status: Number.isFinite(tableCount) ? "PASS" : "WARN",
      value: Number.isFinite(tableCount) ? String(tableCount) : "Unavailable",
    },
    {
      metric: "Database size",
      status: databaseStatus.databaseSizeStatus || "WARN",
      value: databaseStatus.databaseSize || "Unavailable",
    },
    {
      metric: "Last checked",
      status: databaseStatus.lastChecked ? "PASS" : "WARN",
      value: databaseStatus.lastChecked || checkedAt || "Unavailable",
    },
  ];
  return {
    lastChecked: databaseStatus.lastChecked || checkedAt,
    message: reason,
    rows: metricRows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: overallHealthStatus(metricRows),
  };
}

function projectPackageReadinessStatus() {
  const decisionPath = path.join(process.cwd(), "dev", "build", "codex", "decisions", "project-packages.md");
  const contract = projectPackageReadinessContract();
  try {
    const contents = readFileSync(decisionPath, "utf8");
    const requiredContent = [
      ".gfsp",
      "Game Foundry Studio Project",
      "ZIP-based package format",
      "<ProjectNameWithoutSpaces>-<YYJJJ>-<sequence>.gfsp",
      "metadata/package.json",
      "project/project.json",
      "assets/asset-references.json",
      "Export Project Package",
      "Import Project Package",
      "Validate Project Package",
    ];
    const missing = requiredContent.filter((item) => !contents.includes(item));
    return {
      contract,
      decisionPath: "dev/build/codex/decisions/project-packages.md",
      message: missing.length
        ? `Project package decision note is missing: ${missing.join(", ")}.`
        : "Project package decision note and runtime scaffold are ready for .gfsp export/import/validate package workflows.",
      status: missing.length ? "WARN" : "PASS",
    };
  } catch {
    return {
      contract,
      decisionPath: "dev/build/codex/decisions/project-packages.md",
      message: "Project package decision note is missing. Restore dev/build/codex/decisions/project-packages.md.",
      status: "WARN",
    };
  }
}

function parsePositiveIntegerConfig(rawValue) {
  const value = String(rawValue || "").trim();
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) ? numberValue : null;
}

function systemHealthConfiguredLimit(limit) {
  const configuredLimit = dotEnvValue(limit.key);
  if (!configuredLimit.found || !configuredLimit.value) {
    return {
      message: `Set ${limit.key} in the selected .env.<target> copy-source, copy it to .env, and restart validation.`,
      numericValue: null,
      status: "WARN",
      value: "not configured",
    };
  }
  const numericValue = parsePositiveIntegerConfig(configuredLimit.value);
  if (numericValue === null) {
    return {
      message: `${limit.key} must be a positive integer value in bytes, operations, or connection count as applicable.`,
      numericValue: null,
      status: "WARN",
      value: configuredLimit.value,
    };
  }
  return {
    message: `${limit.key} is configured with a positive integer value.`,
    numericValue,
    status: "PASS",
    value: configuredLimit.value,
  };
}

function systemHealthCurrentUsage(limit) {
  const contract = SYSTEM_HEALTH_USAGE_CONTRACTS[limit.key] || {};
  return {
    integrationPoint: contract.integrationPoint || "Future provider telemetry can report usage through the Local API.",
    numericValue: null,
    status: SYSTEM_HEALTH_USAGE_NOT_AVAILABLE,
    value: SYSTEM_HEALTH_USAGE_NOT_AVAILABLE,
  };
}

function systemHealthPressure(configuredLimit, currentUsage) {
  if (configuredLimit.numericValue === null || currentUsage.numericValue === null) {
    return {
      calculated: false,
      label: SYSTEM_HEALTH_USAGE_NOT_AVAILABLE,
      status: SYSTEM_HEALTH_USAGE_NOT_AVAILABLE,
    };
  }
  const ratio = currentUsage.numericValue / configuredLimit.numericValue;
  if (ratio >= 0.95) {
    return { calculated: true, label: "RISK", status: "RISK" };
  }
  if (ratio >= 0.85) {
    return { calculated: true, label: "UPGRADE SOON", status: "UPGRADE SOON" };
  }
  if (ratio >= 0.7) {
    return { calculated: true, label: "WATCH", status: "WATCH" };
  }
  return { calculated: true, label: "OK", status: "OK" };
}

function systemHealthLimitRows() {
  return SYSTEM_HEALTH_LIMIT_ENV_KEYS.map((limit) => {
    const configuredLimit = systemHealthConfiguredLimit(limit);
    const currentUsage = systemHealthCurrentUsage(limit);
    const pressure = systemHealthPressure(configuredLimit, currentUsage);
    return {
      area: limit.service,
      configuredLimit,
      currentUsage,
      field: limit.label,
      limit: configuredLimit.value,
      nextStep: configuredLimit.status === "PASS"
        ? currentUsage.integrationPoint
        : configuredLimit.message,
      pressure: pressure.label,
      pressureCalculation: pressure,
      pressureLabels: SYSTEM_HEALTH_LIMIT_PRESSURE_LABELS,
      status: configuredLimit.status,
      usage: currentUsage.value,
      variableName: limit.key,
    };
  });
}

function systemHealthLimitStatus(rows) {
  return rows.some((row) => row.status !== "PASS") ? "WARN" : "PASS";
}

function normalizeHealthStatus(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ERROR") {
    return "FAIL";
  }
  if (normalized === "PASS" || normalized === "WARN" || normalized === "FAIL") {
    return normalized;
  }
  return "WARN";
}

function systemHealthCounts(rows) {
  return rows.reduce((counts, row) => {
    counts[normalizeHealthStatus(row.status)] += 1;
    return counts;
  }, { FAIL: 0, PASS: 0, WARN: 0 });
}

function overallHealthStatus(rows) {
  const statuses = rows.map((row) => normalizeHealthStatus(row.status));
  if (statuses.includes("FAIL")) {
    return "FAIL";
  }
  if (statuses.includes("WARN")) {
    return "WARN";
  }
  return "PASS";
}

function localApiStartupPortFromUrl(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "not configured";
  }
  try {
    const parsedUrl = new URL(rawValue);
    return parsedUrl.port || LOCAL_API_STARTUP_DEFAULT_PORT_BY_PROTOCOL[parsedUrl.protocol] || "not configured";
  } catch {
    return "invalid URL";
  }
}

function localApiStartupUrlDisplay(value, fallback = "not configured") {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return fallback;
  }
  try {
    const parsedUrl = new URL(rawValue);
    if (parsedUrl.username) {
      parsedUrl.username = "********";
    }
    if (parsedUrl.password) {
      parsedUrl.password = "********";
    }
    parsedUrl.search = "";
    parsedUrl.hash = "";
    return parsedUrl.toString();
  } catch {
    return "invalid URL";
  }
}

function localApiStartupPortStatus(port) {
  if (port === "invalid URL") {
    return "FAIL";
  }
  return port === "not configured" ? "WARN" : "PASS";
}

function localApiStartupBindTarget(env = process.env) {
  const host = String(env.GAMEFOUNDRY_LOCAL_API_HOST || LOCAL_API_STARTUP_DEFAULT_HOST).trim() || LOCAL_API_STARTUP_DEFAULT_HOST;
  const port = String(env.GAMEFOUNDRY_LOCAL_API_PORT || LOCAL_API_STARTUP_DEFAULT_PORT).trim() || LOCAL_API_STARTUP_DEFAULT_PORT;
  const portStatus = /^[1-9]\d*$/.test(port) ? "PASS" : "WARN";
  return {
    host,
    port,
    status: portStatus,
    value: `${host}:${port}`,
  };
}

function localApiStartupDatabaseMode(env = process.env) {
  const databaseStatus = databaseConfigStatus(env);
  if (databaseStatus.hostStatus === "FAIL" || databaseStatus.databaseNameStatus === "FAIL") {
    return {
      reason: "GAMEFOUNDRY_DATABASE_URL is present but is not a valid Postgres URL.",
      status: "FAIL",
      value: "invalid database URL",
    };
  }
  if (!databaseStatus.configured) {
    return {
      reason: "GAMEFOUNDRY_DATABASE_URL is not configured for the Local API startup report.",
      status: "WARN",
      value: "not configured",
    };
  }
  return {
    reason: "GAMEFOUNDRY_DATABASE_URL is configured with a Postgres protocol; credentials remain hidden.",
    status: "PASS",
    value: "Postgres",
  };
}

function localApiStartupStorageStatus(env = process.env) {
  const storageConfig = loadStorageConfig(env);
  if (storageConfig.configured) {
    return {
      reason: `Cloudflare R2 configuration is present for bucket ${storageConfig.safe.bucket} and prefix ${storageConfig.safe.projectsPrefix}; credential values remain hidden.`,
      status: "PASS",
      value: "configured",
    };
  }
  const issue = storageConfig.validationError
    || `missing ${storageConfig.missingKeys?.join(", ") || "storage configuration"}`;
  return {
    reason: `Cloudflare R2 storage is not fully configured: ${issue}.`,
    status: "WARN",
    value: "not configured",
  };
}

function localApiStartupConfigSourceRow({ configured, derivedSource = "", field, key }) {
  const value = configured
    ? key
    : derivedSource
      ? `not configured; derived from ${derivedSource}`
      : "not configured";
  return {
    field,
    reason: configured
      ? `${key} is configured for runtime diagnostics.`
      : `${key} is not configured for runtime diagnostics.`,
    status: configured ? "PASS" : "WARN",
    value,
  };
}

function systemHealthLocalApiStartupDiagnostics(env = process.env) {
  const bindTarget = localApiStartupBindTarget(env);
  const configuredApiUrl = String(env.GAMEFOUNDRY_API_URL || "").trim();
  const derivedApiUrl = `http://${bindTarget.value}/api`;
  const siteUrl = String(env.GAMEFOUNDRY_SITE_URL || "").trim();
  const apiUrlDisplay = localApiStartupUrlDisplay(configuredApiUrl || derivedApiUrl);
  const configuredApiUrlDisplay = localApiStartupUrlDisplay(configuredApiUrl);
  const siteUrlDisplay = localApiStartupUrlDisplay(siteUrl);
  const siteUrlPort = localApiStartupPortFromUrl(siteUrl);
  const databaseMode = localApiStartupDatabaseMode(env);
  const storageConfig = loadStorageConfig(env);
  const storageStatus = localApiStartupStorageStatus(env);
  const rows = [
    {
      field: "Approved diagnostics format",
      reason: "Startup output includes deterministic Environment Variables and All Runtime Ports sections.",
      status: "PASS",
      value: "Environment Variables + All Runtime Ports",
    },
    {
      field: "Environment variable diagnostics",
      reason: "Startup output masks secret-like values and redacts URL credentials before printing.",
      status: "PASS",
      value: "masked and redacted",
    },
    {
      field: "Environment variable order",
      reason: "Runtime .env keys are sorted alphabetically before startup diagnostics are printed.",
      status: "PASS",
      value: "alphabetical",
    },
    {
      field: "Secret masking markers",
      reason: "Startup diagnostics mask variables whose keys contain PASSWORD, SECRET, TOKEN, KEY, SERVICE_ROLE, or JWT.",
      status: "PASS",
      value: "PASSWORD, SECRET, TOKEN, KEY, SERVICE_ROLE, JWT",
    },
    {
      field: "Runtime configuration source",
      reason: "Runtime configuration is read from process environment values loaded from .env before startup.",
      status: "PASS",
      value: ".env + process environment",
    },
    {
      field: "Configured startup bind target",
      reason: bindTarget.status === "PASS"
        ? "Local API startup uses the configured or default host and port for the bind target."
        : "GAMEFOUNDRY_LOCAL_API_PORT must be a positive integer.",
      status: bindTarget.status,
      value: bindTarget.value,
    },
    localApiStartupConfigSourceRow({
      configured: Boolean(configuredApiUrl),
      derivedSource: "Local API bind target",
      field: "Local API URL source",
      key: "GAMEFOUNDRY_API_URL",
    }),
    localApiStartupConfigSourceRow({
      configured: Boolean(siteUrl),
      field: "Local site URL source",
      key: "GAMEFOUNDRY_SITE_URL",
    }),
    localApiStartupConfigSourceRow({
      configured: Boolean(String(env.GAMEFOUNDRY_STORAGE_ENDPOINT || "").trim()),
      field: "Storage/R2 endpoint source",
      key: "GAMEFOUNDRY_STORAGE_ENDPOINT",
    }),
    {
      field: "Storage/R2 projects prefix source",
      reason: storageConfig.configured
        ? "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX matches an approved environment prefix."
        : storageConfig.validationError || `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX is ${storageConfig.missingKeys?.includes("GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX") ? "not configured" : "not ready"} for runtime diagnostics.`,
      status: storageConfig.configured ? "PASS" : "WARN",
      value: storageConfig.safe?.projectsPrefix || "not configured",
    },
    {
      field: "Local API URL",
      reason: configuredApiUrl
        ? "GAMEFOUNDRY_API_URL is configured and displayed without URL credentials."
        : "GAMEFOUNDRY_API_URL is not configured; Local API URL is explicitly derived from the bind target for diagnostics.",
      status: apiUrlDisplay === "invalid URL" ? "FAIL" : "PASS",
      value: apiUrlDisplay,
    },
    {
      field: "Local site URL",
      reason: siteUrl
        ? "GAMEFOUNDRY_SITE_URL is available for startup diagnostics."
        : "GAMEFOUNDRY_SITE_URL is not configured for the Local API startup report.",
      status: siteUrl ? (siteUrlDisplay === "invalid URL" ? "FAIL" : "PASS") : "WARN",
      value: siteUrlDisplay,
    },
    {
      field: "Local site URL port",
      reason: "Port is derived from GAMEFOUNDRY_SITE_URL for display only.",
      status: localApiStartupPortStatus(siteUrlPort),
      value: siteUrlPort,
    },
    {
      field: "Configured site URL",
      reason: siteUrl
        ? "GAMEFOUNDRY_SITE_URL is available for startup diagnostics."
        : "GAMEFOUNDRY_SITE_URL is not configured; startup diagnostics will print not configured.",
      status: siteUrl ? "PASS" : "WARN",
      value: localApiStartupUrlDisplay(siteUrl),
    },
    {
      field: "Configured API URL",
      reason: configuredApiUrl
        ? "GAMEFOUNDRY_API_URL is configured and displayed without URL credentials."
        : "GAMEFOUNDRY_API_URL is not configured; the configured API URL remains not configured.",
      status: configuredApiUrl ? (configuredApiUrlDisplay === "invalid URL" ? "FAIL" : "PASS") : "WARN",
      value: configuredApiUrlDisplay,
    },
    {
      field: "Configured API URL port",
      reason: "Port is derived from GAMEFOUNDRY_API_URL only; the Local API URL row shows the bind-target derived URL.",
      status: localApiStartupPortStatus(localApiStartupPortFromUrl(configuredApiUrl)),
      value: localApiStartupPortFromUrl(configuredApiUrl),
    },
    {
      field: "Local API URL port",
      reason: "Port is derived from the configured API URL or the explicit Local API bind-target URL.",
      status: localApiStartupPortStatus(localApiStartupPortFromUrl(configuredApiUrl || derivedApiUrl)),
      value: localApiStartupPortFromUrl(configuredApiUrl || derivedApiUrl),
    },
    {
      field: "Database mode",
      reason: databaseMode.reason,
      status: databaseMode.status,
      value: databaseMode.value,
    },
    {
      field: "Storage status",
      reason: storageStatus.reason,
      status: storageStatus.status,
      value: storageStatus.value,
    },
    {
      field: "Configurable multiple runtime ports",
      reason: "Configurable Runtime Ports are deprecated/superseded by fixed Local API and static site configuration.",
      status: "PASS",
      value: "deprecated/superseded",
    },
  ];
  return {
    message: "Local API startup diagnostics use the approved safe output format; configurable multiple runtime ports are deprecated/superseded.",
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: overallHealthStatus(rows),
  };
}

function systemHealthEnvironmentMap() {
  return SYSTEM_HEALTH_ENVIRONMENT_MODELS.map((model) => ({ ...model }));
}

function systemHealthEnvironmentComparison({ checkedAt = new Date().toISOString(), environmentIdentity = {} } = {}) {
  const currentEnvironmentName = normalizeEnvironmentName(environmentIdentity.name);
  const comparisonModels = [
    {
      canonicalName: "Local",
      databaseModel: "Local Docker PostgreSQL",
      displayName: "Local (VS Code)",
      hostingModel: "VS Code + Local API",
      runtimeExpectation: "Local static server + Local API + developer workstation",
      storageFolder: "/local",
    },
    {
      canonicalName: "DEV",
      databaseModel: "Local Docker PostgreSQL",
      displayName: "DEV",
      hostingModel: "Local Docker",
      runtimeExpectation: "Local Docker runtime + Local API",
      storageFolder: "/dev",
    },
    {
      canonicalName: "IST",
      databaseModel: "Local Docker PostgreSQL",
      displayName: "IST",
      hostingModel: "Local Docker",
      runtimeExpectation: "Local Docker runtime + Local API",
      storageFolder: "/ist",
    },
    {
      canonicalName: "UAT",
      databaseModel: "Supabase PostgreSQL",
      displayName: "UAT",
      hostingModel: "Cloudflare",
      runtimeExpectation: "Cloudflare deployment + server API contract",
      storageFolder: "/uat",
    },
    {
      canonicalName: "PRD",
      databaseModel: "Supabase PostgreSQL",
      displayName: "PROD",
      hostingModel: "Cloudflare",
      runtimeExpectation: "Cloudflare deployment + server API contract",
      storageFolder: "/prd",
    },
  ];
  const rows = comparisonModels.map((model) => {
    const current = normalizeEnvironmentName(model.canonicalName) === currentEnvironmentName;
    const state = current
      ? "Current"
      : model.canonicalName === "Local"
        ? "Unavailable"
        : "Not Configured";
    return {
      ...model,
      activeCheck: current,
      checkedAt: current ? checkedAt : "",
      state,
      status: current ? environmentIdentity.status || "PASS" : "WARN",
      summary: current
        ? `This deployment actively checks only ${environmentIdentity.name || model.displayName}.`
        : `${model.displayName} is reference-only from this deployment; no active health check was run.`,
    };
  });
  return {
    currentEnvironment: environmentIdentity.name || "Unknown",
    lastChecked: checkedAt,
    message: "Environment Health Comparison is reference-only for peer environments; only the current deployment is actively checked.",
    noCrossEnvironmentChecks: true,
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: rows.some((row) => row.activeCheck) ? "PASS" : "WARN",
  };
}

function topLevelStorageFolder(value) {
  const segment = String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)[0] || "";
  return segment ? `/${segment.toLowerCase()}` : "";
}

function normalizeEnvironmentName(value) {
  const upperValue = String(value || "").trim().toUpperCase();
  if (!upperValue) {
    return "";
  }
  if (["LOCAL", "DEV", "IST", "UAT", "PRD"].includes(upperValue)) {
    return upperValue === "LOCAL" ? "Local" : upperValue;
  }
  if (upperValue === "PROD" || upperValue === "PRODUCTION") {
    return "PRD";
  }
  if (upperValue.includes("LOCAL")) {
    return "Local";
  }
  return "";
}

function inferSystemHealthEnvironmentName(env = process.env) {
  const configuredStorageFolder = topLevelStorageFolder(env.GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX || dotEnvValue(STORAGE_PROJECTS_PREFIX_ENV_KEY).value);
  const folderMatch = SYSTEM_HEALTH_ENVIRONMENT_BY_FOLDER.get(configuredStorageFolder);
  if (folderMatch) {
    return {
      configuredStorageFolder,
      name: folderMatch,
      source: STORAGE_PROJECTS_PREFIX_ENV_KEY,
      status: "PASS",
    };
  }

  const labelMatch = normalizeEnvironmentName(env.GAMEFOUNDRY_ENVIRONMENT_LABEL);
  if (labelMatch) {
    return {
      configuredStorageFolder,
      name: labelMatch,
      source: "GAMEFOUNDRY_ENVIRONMENT_LABEL",
      status: "WARN",
    };
  }

  return {
    configuredStorageFolder,
    name: "Local",
    source: "local default",
    status: configuredStorageFolder ? "WARN" : "PASS",
  };
}

function systemHealthEnvironmentIdentity(env = process.env, lastHealthCheck = new Date().toISOString()) {
  const inferred = inferSystemHealthEnvironmentName(env);
  const model = SYSTEM_HEALTH_ENVIRONMENT_BY_NAME.get(inferred.name) || SYSTEM_HEALTH_ENVIRONMENT_BY_NAME.get("Local");
  const siteUrl = localApiStartupUrlDisplay(String(env.GAMEFOUNDRY_SITE_URL || "").trim());
  const bindTarget = localApiStartupBindTarget(env);
  const configuredApiUrl = String(env.GAMEFOUNDRY_API_URL || "").trim();
  const apiUrl = localApiStartupUrlDisplay(configuredApiUrl || `http://${bindTarget.value}/api`);
  const apiUrlSource = configuredApiUrl ? "GAMEFOUNDRY_API_URL" : "derived from Local API bind target";
  const storageFolderMatches = !inferred.configuredStorageFolder
    || inferred.configuredStorageFolder === model.storageFolder
    || (model.name === "PRD" && inferred.configuredStorageFolder === "/prod");

  return {
    apiUrl,
    apiUrlSource,
    apiUrlStatus: apiUrl === "invalid URL" ? "FAIL" : configuredApiUrl ? "PASS" : "WARN",
    databaseModel: model.databaseModel,
    hostingModel: model.hostingModel,
    lastHealthCheck,
    message: storageFolderMatches
      ? `Current deployment identity resolved as ${model.name} from ${inferred.source}.`
      : `Current deployment identity defaulted to ${model.name}; ${STORAGE_PROJECTS_PREFIX_ENV_KEY} did not match an approved environment folder.`,
    name: model.name,
    siteUrl,
    siteUrlSource: siteUrl === "not configured" ? "not configured" : "GAMEFOUNDRY_SITE_URL",
    siteUrlStatus: siteUrl === "not configured" || siteUrl === "invalid URL" ? "WARN" : "PASS",
    source: inferred.source,
    status: storageFolderMatches ? inferred.status : "WARN",
    storageFolder: model.storageFolder,
    storageFolderStatus: storageFolderMatches ? inferred.status : "WARN",
  };
}

function systemHealthSummary(rows) {
  const counts = systemHealthCounts(rows);
  const total = counts.PASS + counts.WARN + counts.FAIL;
  return {
    counts,
    lastRefreshAt: new Date().toISOString(),
    score: total ? Math.round((counts.PASS / total) * 100) : 0,
    status: overallHealthStatus(rows),
    total,
  };
}

function systemHealthApiContract(checkedAt = new Date().toISOString()) {
  const endpointValue = SYSTEM_HEALTH_API_ENDPOINTS
    .map((endpoint) => `${endpoint.method} ${endpoint.path}`)
    .join("; ");
  const rows = [
    {
      field: "Contract version",
      status: "PASS",
      value: SYSTEM_HEALTH_API_CONTRACT_VERSION,
    },
    {
      field: "Data boundary",
      status: "PASS",
      value: SERVER_DATA_BOUNDARY_RULE,
    },
    {
      field: "Deployment scope",
      status: "PASS",
      value: "Current deployment only",
    },
    {
      field: "Environment Map",
      status: "PASS",
      value: "Reference only; no peer environment checks",
    },
    {
      field: "Secret handling",
      status: "PASS",
      value: "No secret editing; secret values hidden",
    },
    {
      field: "Endpoints",
      status: "PASS",
      value: endpointValue,
    },
  ];
  return {
    contractVersion: SYSTEM_HEALTH_API_CONTRACT_VERSION,
    currentDeploymentOnly: true,
    endpointCount: SYSTEM_HEALTH_API_ENDPOINTS.length,
    endpoints: SYSTEM_HEALTH_API_ENDPOINTS.map((endpoint) => ({ ...endpoint })),
    lastChecked: checkedAt,
    message: "Admin System Health API contract is current-deployment only and server-owned.",
    noCrossEnvironmentChecks: true,
    referenceEnvironmentMapOnly: true,
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: "PASS",
  };
}

function systemHealthAdminApiRegistry(checkedAt = new Date().toISOString()) {
  const rows = ADMIN_API_REGISTRY_ENTRIES.map((entry) => ({
    ...entry,
    status: "PASS",
  }));
  return {
    lastChecked: checkedAt,
    message: "Admin API Registry lists server routes used by Admin System Health and adjacent Charlie-owned admin operations.",
    routeCount: rows.length,
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: "PASS",
  };
}

function systemHealthRuntimeFeatureFlags(checkedAt = new Date().toISOString()) {
  const rows = [
    { flag: "system-health.api-contract", status: "PASS", value: "Enabled" },
    { flag: "system-health.environment-capabilities", status: "PASS", value: "Enabled" },
    { flag: "system-health.admin-api-registry", status: "PASS", value: "Enabled" },
    { flag: "system-health.runtime-health", status: "PASS", value: "Enabled" },
    { flag: "system-health.manual-actions", status: "PASS", value: "Enabled" },
    { flag: "system-health.scheduled-monitoring", status: "PENDING", value: "Not Configured" },
    { flag: "system-health.notifications", status: "PENDING", value: "Not Configured" },
  ];
  return {
    lastChecked: checkedAt,
    message: "Runtime Feature Flags are read-only server-reported System Health capability flags.",
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: overallHealthStatus(rows.map((row) => ({ status: row.status }))),
  };
}

function isSecretLikeRuntimeEnvKey(key) {
  const upperKey = String(key || "").toUpperCase();
  return RUNTIME_ENV_SECRET_MARKERS.some((marker) => upperKey.includes(marker));
}

function systemHealthRuntimeEnvironment(env = process.env) {
  const rows = Object.keys(env || {})
    .filter((key) => String(key || "").trim())
    .sort((left, right) => left.localeCompare(right))
    .map((key) => {
      const configured = String(env[key] ?? "").trim().length > 0;
      const secretLike = isSecretLikeRuntimeEnvKey(key);
      return {
        configured,
        display: configured ? (secretLike ? "********" : "configured") : "not configured",
        key,
        reason: configured
          ? (secretLike ? "Value is loaded and masked because the key is secret-like." : "Value is loaded; raw runtime values are hidden.")
          : "Variable is present but empty.",
        secretLike,
        status: configured ? "PASS" : "WARN",
      };
    });
  const maskedSecretCount = rows.filter((row) => row.secretLike && row.configured).length;
  return {
    maskedSecretCount,
    message: `${rows.length} runtime environment key(s) loaded; ${maskedSecretCount} secret-like value(s) masked.`,
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: rows.some((row) => row.status !== "PASS") ? "WARN" : "PASS",
    totalCount: rows.length,
  };
}

let cachedProjectVersion = null;

function projectVersion() {
  if (cachedProjectVersion !== null) {
    return cachedProjectVersion;
  }
  try {
    const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    cachedProjectVersion = String(packageJson.version || "").trim();
  } catch {
    cachedProjectVersion = "";
  }
  return cachedProjectVersion;
}

function systemHealthRuntimeHealth(environmentIdentity = {}, checkedAt = new Date().toISOString()) {
  const version = projectVersion();
  const nodeVersion = String(process.version || "").trim();
  const uptimeSeconds = Math.max(0, Math.floor(process.uptime()));
  return {
    apiVersion: version,
    appVersion: version,
    environmentName: environmentIdentity.name || "Unknown",
    lastChecked: checkedAt,
    message: "Runtime health is reported by the current deployment Local API only.",
    nodeVersion,
    secretEditingAllowed: false,
    secretsExposed: false,
    serverStartTime: LOCAL_API_PROCESS_STARTED_AT,
    status: "PASS",
    uptimeSeconds,
  };
}

function systemHealthServiceDisplayStatus(status, configured = true) {
  if (configured === false) {
    return { healthStatus: "PENDING", status: "NOT CONFIGURED" };
  }
  const normalized = normalizeHealthStatus(status);
  if (normalized === "PASS") {
    return { healthStatus: "PASS", status: "PASS" };
  }
  if (normalized === "FAIL") {
    return { healthStatus: "FAIL", status: "FAIL" };
  }
  return { healthStatus: "WARN", status: "WARN" };
}

function systemHealthServiceCard({ configured = true, id, label, lastChecked, status = "WARN", summary }) {
  const displayStatus = systemHealthServiceDisplayStatus(status, configured);
  return {
    configured,
    healthStatus: displayStatus.healthStatus,
    id,
    label,
    lastChecked,
    status: displayStatus.status,
    summary: String(summary || "Service health status unavailable."),
  };
}

function systemHealthServiceHealth({
  authStatus = {},
  checkedAt,
  databaseStatus = {},
  runtimeHealth = {},
  session = {},
  storageStatus = {},
}) {
  const databaseConfigured = databaseStatus.configured !== false && databaseStatus.connectivity !== "not configured";
  const storageConfigured = storageStatus.configured === true;
  const authConfigured = authStatus.configured === true || authStatus.ready === true;
  const services = [
    systemHealthServiceCard({
      id: "runtime",
      label: "Runtime",
      lastChecked: runtimeHealth.lastChecked || checkedAt,
      status: runtimeHealth.status || "WARN",
      summary: runtimeHealth.message || "Runtime health status unavailable.",
    }),
    systemHealthServiceCard({
      id: "api",
      label: "API",
      lastChecked: checkedAt,
      status: session.authenticated && session.isAdmin ? "PASS" : "FAIL",
      summary: session.authenticated && session.isAdmin
        ? "Current deployment API responded to the Admin System Health request."
        : "Admin System Health API requires an authenticated Admin session.",
    }),
    systemHealthServiceCard({
      configured: databaseConfigured,
      id: "database",
      label: "Database",
      lastChecked: databaseStatus.lastChecked || checkedAt,
      status: databaseStatus.connectivityStatus || databaseStatus.status || "WARN",
      summary: databaseStatus.message || `${databaseStatus.databaseType || "PostgreSQL"} status unavailable.`,
    }),
    systemHealthServiceCard({
      configured: storageConfigured,
      id: "storage",
      label: "Storage",
      lastChecked: storageStatus.lastChecked || checkedAt,
      status: storageStatus.status || "WARN",
      summary: storageStatus.message || "Cloudflare R2 storage status unavailable.",
    }),
    systemHealthServiceCard({
      configured: authConfigured,
      id: "authentication",
      label: "Authentication",
      lastChecked: checkedAt,
      status: authStatus.ready === true ? "PASS" : "WARN",
      summary: authStatus.operatorDiagnostic || authStatus.message || "Authentication provider status unavailable.",
    }),
    systemHealthServiceCard({
      configured: false,
      id: "email",
      label: "Email",
      lastChecked: checkedAt,
      status: "PENDING",
      summary: "Email health contract is not configured for this deployment.",
    }),
    systemHealthServiceCard({
      configured: false,
      id: "background-jobs",
      label: "Background Jobs",
      lastChecked: checkedAt,
      status: "PENDING",
      summary: "Background job health contract is not configured for this deployment.",
    }),
  ];
  return {
    lastChecked: checkedAt,
    message: "Service Health summarizes current-deployment service contracts only.",
    secretEditingAllowed: false,
    secretsExposed: false,
    services,
    status: overallHealthStatus(services.map((service) => ({ status: service.healthStatus }))),
  };
}

function systemHealthConfigurationSummary({
  authStatus = {},
  checkedAt,
  databaseStatus = {},
  environmentIdentity = {},
  storageStatus = {},
}) {
  const authConfigured = authStatus.configured === true || authStatus.ready === true;
  const rows = [
    {
      field: "Current environment",
      status: environmentIdentity.status || "WARN",
      value: environmentIdentity.name || "Unknown",
    },
    {
      field: "Hosting model",
      status: environmentIdentity.hostingModel ? "PASS" : "WARN",
      value: environmentIdentity.hostingModel || "not configured",
    },
    {
      field: "Site URL",
      status: environmentIdentity.siteUrlStatus || "WARN",
      value: environmentIdentity.siteUrl || "not configured",
    },
    {
      field: "API URL",
      status: environmentIdentity.apiUrlStatus || "WARN",
      value: environmentIdentity.apiUrl || "not configured",
    },
    {
      field: "API URL source",
      status: environmentIdentity.apiUrlSource === "GAMEFOUNDRY_API_URL" ? "PASS" : "WARN",
      value: environmentIdentity.apiUrlSource || "not configured",
    },
    {
      field: "Site URL source",
      status: environmentIdentity.siteUrlSource === "GAMEFOUNDRY_SITE_URL" ? "PASS" : "WARN",
      value: environmentIdentity.siteUrlSource || "not configured",
    },
    {
      field: "Database provider/type",
      status: databaseStatus.databaseType || environmentIdentity.databaseModel ? "PASS" : "WARN",
      value: databaseStatus.databaseType || environmentIdentity.databaseModel || "PostgreSQL",
    },
    {
      field: "Storage provider/folder",
      status: storageStatus.environmentFolderStatus || environmentIdentity.storageFolderStatus || "WARN",
      value: `Cloudflare R2 ${storageStatus.environmentFolder || environmentIdentity.storageFolder || "not configured"}`,
    },
    {
      field: "Storage endpoint",
      status: storageStatus.endpointStatus || "WARN",
      value: storageStatus.endpoint || "not configured",
    },
    {
      field: "Storage projects prefix",
      status: storageStatus.projectsPrefixStatus || "WARN",
      value: storageStatus.projectsPrefix || "not configured",
    },
    {
      field: "Auth provider/status",
      status: authConfigured ? "PASS" : "PENDING",
      value: `${authStatus.providerId || SUPABASE_AUTH_PROVIDER_ID} ${authConfigured ? "ready" : "not configured"}`,
    },
  ];
  return {
    lastChecked: checkedAt,
    message: "Configuration Summary is read-only and contains no secret values.",
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: overallHealthStatus(rows),
  };
}

function systemHealthEnvironmentCapabilities({
  authStatus = {},
  checkedAt,
  databaseStatus = {},
  environmentIdentity = {},
  storageStatus = {},
}) {
  const rows = [
    {
      capability: "Hosting",
      status: environmentIdentity.hostingModel ? "PASS" : "WARN",
      value: environmentIdentity.hostingModel || "not configured",
    },
    {
      capability: "API",
      status: environmentIdentity.apiUrlStatus || "WARN",
      value: environmentIdentity.apiUrl || "not configured",
    },
    {
      capability: "Database",
      status: databaseStatus.connectivityStatus || databaseStatus.status || "WARN",
      value: databaseStatus.databaseType || environmentIdentity.databaseModel || "PostgreSQL",
    },
    {
      capability: "Storage",
      status: storageStatus.environmentFolderStatus || environmentIdentity.storageFolderStatus || "WARN",
      value: `Cloudflare R2 ${storageStatus.environmentFolder || environmentIdentity.storageFolder || "not configured"}`,
    },
    {
      capability: "Authentication",
      status: authStatus.ready === true ? "PASS" : "PENDING",
      value: authStatus.ready === true ? "Configured" : "Not Configured",
    },
    {
      capability: "Scheduled Monitoring",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      capability: "Notifications",
      status: "PENDING",
      value: "Not Configured",
    },
  ];
  return {
    currentEnvironment: environmentIdentity.name || "Unknown",
    lastChecked: checkedAt,
    message: "Environment Capabilities describes the current deployment only.",
    peerEnvironmentChecks: false,
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: overallHealthStatus(rows.map((row) => ({ status: row.status }))),
  };
}

function systemHealthScheduledMonitoring(checkedAt = new Date().toISOString()) {
  const rows = [
    {
      field: "Last scheduled run",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      field: "Next scheduled run",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      field: "Duration",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      field: "Recent result",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      field: "Failures/warnings",
      status: "PENDING",
      value: "Scheduler contract is not configured.",
    },
  ];
  return {
    lastChecked: checkedAt,
    message: "Scheduled Health Monitoring is not configured for this deployment.",
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: "PENDING",
  };
}

function systemHealthNotificationsFoundation(checkedAt = new Date().toISOString()) {
  const rows = [
    {
      field: "Email alerts",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      field: "Admin notifications",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      field: "Webhook alerts",
      status: "PENDING",
      value: "Not Configured",
    },
    {
      field: "Messages integration",
      status: "PENDING",
      value: "Not Configured",
    },
  ];
  return {
    lastChecked: checkedAt,
    message: "Notifications and alerts are Not Configured; no alert sending contract is configured for this deployment.",
    rows,
    secretEditingAllowed: false,
    secretsExposed: false,
    status: "PENDING",
  };
}

function systemHealthHistoryRow({ checkedAt, environmentName, area, result, summary, kind = "recent check" }) {
  return {
    area,
    checkedAt,
    environmentName,
    kind,
    result: normalizeHealthStatus(result),
    summary: String(summary || "No summary returned."),
  };
}

function systemHealthCheckHistory({
  checkedAt,
  databaseStatus = {},
  environmentIdentity = {},
  runtimeHealth = {},
  runtimeEnvironment = {},
  storageStatus = {},
}) {
  const environmentName = environmentIdentity.name || "Unknown";
  const databaseResponseTime = Number.isFinite(databaseStatus.responseTimeMs)
    ? `${databaseStatus.responseTimeMs} ms`
    : "not available";
  const recentChecks = [
    systemHealthHistoryRow({
      area: "Environment Summary",
      checkedAt,
      environmentName,
      result: environmentIdentity.status,
      summary: `Current deployment ${environmentName}; hosting ${environmentIdentity.hostingModel || "not configured"}; storage folder ${environmentIdentity.storageFolder || "not configured"}.`,
    }),
    systemHealthHistoryRow({
      area: "Database Health",
      checkedAt,
      environmentName,
      result: databaseStatus.connectivityStatus || databaseStatus.status,
      summary: `${databaseStatus.databaseType || "PostgreSQL"} connectivity ${databaseStatus.connectivity || "not configured"}; response time ${databaseResponseTime}; version ${databaseStatus.version || "not available"}.`,
    }),
    systemHealthHistoryRow({
      area: "Storage Health",
      checkedAt,
      environmentName,
      result: storageStatus.status,
      summary: `Cloudflare R2 folder ${storageStatus.environmentFolder || environmentIdentity.storageFolder || "not configured"}; bucket ${storageStatus.configured ? "configured" : "not configured"}; last checked ${storageStatus.lastChecked || checkedAt}.`,
    }),
    systemHealthHistoryRow({
      area: "Runtime Health",
      checkedAt,
      environmentName,
      result: runtimeHealth.status || runtimeEnvironment.status,
      summary: runtimeHealth.message || runtimeEnvironment.message || "Runtime health unavailable.",
    }),
  ];
  const issueRows = recentChecks
    .filter((row) => row.result !== "PASS")
    .map((row) => systemHealthHistoryRow({
      area: `${row.area} ${row.result === "FAIL" ? "Failure" : "Warning"}`,
      checkedAt: row.checkedAt,
      environmentName: row.environmentName,
      kind: row.result === "FAIL" ? "failure" : "warning",
      result: row.result,
      summary: row.summary,
    }));
  return [...recentChecks, ...issueRows];
}

function systemHealthR2Readiness(storageStatus) {
  const credentialsConfigured = storageStatus.accessKeyConfigured === true && storageStatus.secretKeyConfigured === true;
  const configurationReady = storageStatus.configured === true
    && Boolean(storageStatus.endpoint)
    && Boolean(storageStatus.bucket)
    && Boolean(storageStatus.projectsPrefix)
    && credentialsConfigured;
  const configurationNextStep = configurationReady
    ? "Run the Admin System Health storage connectivity actions when live R2 proof is needed."
    : "Configure endpoint, bucket, projects prefix, and hidden credentials in the selected .env.<target> copy-source, then copy it to .env.";
  const readinessTargets = ["Ready for Assets", "Ready for Project Packages", "Ready for Promotion Packages"];
  const rows = [
    {
      area: "Project Asset Storage / R2",
      field: "Endpoint",
      nextStep: storageStatus.endpoint ? "Endpoint is configured." : configurationNextStep,
      status: storageStatus.endpointStatus || "WARN",
      value: storageStatus.endpoint || "not configured",
    },
    {
      area: "Project Asset Storage / R2",
      field: "Bucket",
      nextStep: storageStatus.bucket ? "Bucket is configured." : configurationNextStep,
      status: storageStatus.bucketStatus || "WARN",
      value: storageStatus.bucket || "not configured",
    },
    {
      area: "Project Asset Storage / R2",
      field: "Prefix",
      nextStep: storageStatus.projectsPrefix ? "Prefix is configured." : configurationNextStep,
      status: storageStatus.projectsPrefixStatus || "WARN",
      value: storageStatus.projectsPrefix || "not configured",
    },
    {
      area: "Project Asset Storage / R2",
      field: "Credential configured status",
      nextStep: credentialsConfigured ? "Credentials are configured and hidden." : configurationNextStep,
      status: credentialsConfigured ? "PASS" : "WARN",
      value: credentialsConfigured ? "configured; values hidden" : "not configured",
    },
    {
      area: "Project Asset Storage / R2",
      field: "Connectivity test status",
      nextStep: "Use Admin System Health connectivity actions for List, Write test object, Read test object, and Delete test object validation.",
      status: "SKIP",
      value: "NOT RUN",
    },
    ...readinessTargets.map((target) => ({
      area: "R2 operational readiness",
      field: target,
      nextStep: configurationReady
        ? "Configuration is ready; collect live connectivity evidence before release or promotion signoff."
        : configurationNextStep,
      status: configurationReady ? "PASS" : "WARN",
      value: configurationReady ? "Ready" : "Not ready",
    })),
  ];
  return {
    recommendations: configurationReady
      ? ["Collect live connectivity evidence before release or promotion signoff."]
      : [configurationNextStep],
    rows,
    status: configurationReady ? "PASS" : "WARN",
  };
}

const ADMIN_OPERATIONS_REQUIRED_TABLES = Object.freeze([
  "membership_plans",
  "membership_limits",
  "user_memberships",
  "founding_members",
  "invitations",
  "project_members",
  "ai_actions",
  "ai_credit_packs",
  "user_ai_credits",
  "ai_usage_log",
]);
const ADMIN_OPERATIONS_REQUIRED_PACK_CODES = Object.freeze(["SMALL", "MEDIUM", "LARGE"]);
const ADMIN_OPERATIONS_NO_ACTION_CODE = "UNASSIGNED";

function adminHealthRows(tables, tableName) {
  return Array.isArray(tables?.[tableName]) ? tables[tableName] : [];
}

function adminHealthCountsBy(rows, fieldName) {
  return rows.reduce((counts, row) => {
    const value = String(row?.[fieldName] || "unknown").trim() || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function adminHealthTableRows(tables) {
  return ADMIN_OPERATIONS_REQUIRED_TABLES.map((tableName) => {
    const exists = Array.isArray(tables?.[tableName]);
    return {
      area: "Required DB configuration",
      count: exists ? tables[tableName].length : 0,
      issue: exists ? `${tableName} table is available.` : `${tableName} table is missing.`,
      nextStep: exists ? "No action required." : `Restore ${tableName} through the database seed/schema path before operating this subsystem.`,
      status: exists ? "PASS" : "FAIL",
      tableName,
    };
  });
}

function adminHealthPlanMaps(tables) {
  const plans = adminHealthRows(tables, "membership_plans");
  const limits = adminHealthRows(tables, "membership_limits");
  return {
    limitsByPlanKey: new Map(limits.map((row) => [row.planKey, row])),
    plans,
    plansByKey: new Map(plans.map((row) => [row.key, row])),
  };
}

function adminHealthMemberships(tables, planMaps) {
  const memberships = adminHealthRows(tables, "user_memberships");
  const missingPlanRows = memberships.filter((row) => !planMaps.plansByKey.has(row.planKey));
  const missingLimitPlans = planMaps.plans.filter((plan) => !planMaps.limitsByPlanKey.has(plan.key));
  const rows = memberships.map((row) => {
    const plan = planMaps.plansByKey.get(row.planKey);
    return {
      planCode: plan?.code || "MISSING_PLAN",
      source: row.source || "unknown",
      status: row.status || "unknown",
      userKey: row.userKey || "",
    };
  });
  const planOptions = Array.from(new Set(rows.map((row) => row.planCode))).sort();
  const status = missingPlanRows.length || missingLimitPlans.length ? "FAIL" : "PASS";
  return {
    activeCount: memberships.filter((row) => row.status === "active").length,
    countsByPlan: rows.reduce((counts, row) => {
      counts[row.planCode] = (counts[row.planCode] || 0) + 1;
      return counts;
    }, {}),
    countsByStatus: adminHealthCountsBy(memberships, "status"),
    missingLimitPlanCodes: missingLimitPlans.map((plan) => plan.code),
    missingPlanMembershipCount: missingPlanRows.length,
    planOptions,
    rows,
    status,
    summary: status === "PASS"
      ? `Membership assignments are readable: ${memberships.length} total, ${memberships.filter((row) => row.status === "active").length} active.`
      : `Membership assignment issues found: ${missingPlanRows.length} missing plan reference(s), ${missingLimitPlans.length} missing limit row(s).`,
    totalCount: memberships.length,
  };
}

function adminHealthInvitations(tables) {
  const invitations = adminHealthRows(tables, "invitations");
  const countsByStatus = adminHealthCountsBy(invitations, "status");
  const statusOptions = Array.from(new Set(invitations.map((row) => String(row.status || "unknown")))).sort();
  return {
    countsByStatus,
    rows: invitations
      .slice()
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
      .map((row) => ({
        email: row.email || "",
        expiresAt: row.expiresAt || "",
        invitationCode: row.invitationCode || "",
        status: row.status || "unknown",
      })),
    status: "PASS",
    statusOptions,
    summary: `Invitation support can inspect ${invitations.length} invitation record(s).`,
    totalCount: invitations.length,
  };
}

function adminHealthAiCredits(tables) {
  const actions = adminHealthRows(tables, "ai_actions");
  const packs = adminHealthRows(tables, "ai_credit_packs");
  const accounts = adminHealthRows(tables, "user_ai_credits");
  const usageRows = adminHealthRows(tables, "ai_usage_log");
  const actionsByKey = new Map(actions.map((row) => [row.key, row]));
  const accountUsers = new Set(accounts.map((row) => row.userKey));
  const usageUsers = new Set(usageRows.map((row) => row.userKey).filter(Boolean));
  const missingBalanceUserKeys = Array.from(usageUsers).filter((userKey) => !accountUsers.has(userKey)).sort();
  const missingActionUsageCount = usageRows.filter((row) => row.actionKey && !actionsByKey.has(row.actionKey)).length;
  const missingPackCodes = ADMIN_OPERATIONS_REQUIRED_PACK_CODES.filter((code) => !packs.some((row) => row.code === code));
  const rows = usageRows
    .slice()
    .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
    .map((row) => {
      const action = row.actionKey ? actionsByKey.get(row.actionKey) : null;
      return {
        actionCode: row.actionKey ? action?.code || "MISSING_ACTION" : ADMIN_OPERATIONS_NO_ACTION_CODE,
        balanceAfter: row.balanceAfter ?? "",
        creditDelta: row.creditDelta ?? 0,
        sourceType: row.sourceType || "unknown",
        userKey: row.userKey || "",
      };
    });
  const actionOptions = Array.from(new Set(rows.map((row) => row.actionCode))).sort();
  const status = missingPackCodes.length || !actions.length || missingActionUsageCount ? "FAIL" : missingBalanceUserKeys.length ? "WARN" : "PASS";
  return {
    actionOptions,
    balanceAccountCount: accounts.length,
    debitCount: usageRows.filter((row) => row.sourceType === "action_debit" || Number(row.creditDelta || 0) < 0).length,
    insufficientCreditFailureCount: usageRows.filter((row) => row.sourceType === "insufficient_credit").length,
    missingActionUsageCount,
    missingBalanceUserKeys,
    missingPackCodes,
    monthlyGrantCount: usageRows.filter((row) => row.sourceType === "monthly_grant").length,
    rows,
    status,
    summary: status === "PASS"
      ? `AI credit monitoring can inspect ${usageRows.length} usage log row(s) and ${accounts.length} balance account(s).`
      : `AI credit health found ${missingPackCodes.length} missing required pack(s), ${missingActionUsageCount} missing action reference(s), and ${missingBalanceUserKeys.length} usage user(s) without balances.`,
    totalBalance: accounts.reduce((sum, row) => sum + Number(row.includedBalance || 0) + Number(row.purchasedBalance || 0) + Number(row.bonusBalance || 0), 0),
    usageCount: usageRows.length,
  };
}

function adminHealthMarketplace(tables, planMaps) {
  const memberships = adminHealthRows(tables, "user_memberships");
  const activeMemberships = memberships.filter((row) => row.status === "active");
  const sellerEligibleRows = activeMemberships.filter((row) => {
    const limits = planMaps.limitsByPlanKey.get(row.planKey);
    return limits?.marketplaceSellEnabled === true;
  });
  const sellEnabledPlans = planMaps.plans.filter((plan) => planMaps.limitsByPlanKey.get(plan.key)?.marketplaceSellEnabled === true);
  const missingRevenuePlans = sellEnabledPlans.filter((plan) => !Number.isInteger(plan.revenueShareBps));
  const status = missingRevenuePlans.length ? "FAIL" : "PASS";
  return {
    missingRevenuePlanCodes: missingRevenuePlans.map((plan) => plan.code),
    sellerEligibleCount: sellerEligibleRows.length,
    status,
    summary: status === "PASS"
      ? `${sellerEligibleRows.length} active membership(s) currently have marketplace selling eligibility with DB-backed revenue share.`
      : `Marketplace revenue readiness is missing revenue share basis points for ${missingRevenuePlans.map((plan) => plan.code).join(", ")}.`,
  };
}

function adminHealthTeams(tables, planMaps) {
  const projectMembers = adminHealthRows(tables, "project_members");
  const memberships = adminHealthRows(tables, "user_memberships");
  const activeMembershipByUser = new Map(memberships.filter((row) => row.status === "active").map((row) => [row.userKey, row]));
  const membersByProject = projectMembers.reduce((groups, row) => {
    const projectKey = row.projectKey || "unknown";
    if (!groups.has(projectKey)) {
      groups.set(projectKey, []);
    }
    groups.get(projectKey).push(row);
    return groups;
  }, new Map());
  let limitViolationCount = 0;
  membersByProject.forEach((members) => {
    const activeMembers = members.filter((row) => row.status === "active");
    const ownerMember = members.find((row) => row.role === "owner") || activeMembers[0];
    const ownerMembership = activeMembershipByUser.get(ownerMember?.userKey);
    const maxTeamMembers = Number(planMaps.limitsByPlanKey.get(ownerMembership?.planKey)?.maxTeamMembers || 1);
    if (activeMembers.length > maxTeamMembers) {
      limitViolationCount += 1;
    }
  });
  const blockedInvitationCount = projectMembers.filter((row) => ["blocked", "limit_blocked", "rejected"].includes(String(row.status || ""))).length;
  const status = limitViolationCount ? "FAIL" : blockedInvitationCount ? "WARN" : "PASS";
  return {
    blockedInvitationCount,
    limitViolationCount,
    projectCount: membersByProject.size,
    status,
    summary: status === "PASS"
      ? `${membersByProject.size} project team(s) have no detected membership limit violations.`
      : `Team health found ${limitViolationCount} project limit violation(s) and ${blockedInvitationCount} blocked invitation(s).`,
  };
}

function adminHealthConfigIssues(tableRows, memberships, aiCredits) {
  const issues = tableRows.filter((row) => row.status !== "PASS");
  memberships.missingLimitPlanCodes.forEach((planCode) => {
    issues.push({
      area: "Membership configuration",
      count: 1,
      issue: `membership_limits row is missing for ${planCode}.`,
      nextStep: "Restore the plan limit row before assigning or supporting this membership plan.",
      status: "FAIL",
      tableName: "membership_limits",
    });
  });
  if (memberships.missingPlanMembershipCount) {
    issues.push({
      area: "Membership configuration",
      count: memberships.missingPlanMembershipCount,
      issue: `${memberships.missingPlanMembershipCount} membership assignment(s) reference a missing plan.`,
      nextStep: "Restore the missing membership plan row or correct the affected membership assignment.",
      status: "FAIL",
      tableName: "user_memberships",
    });
  }
  aiCredits.missingPackCodes.forEach((code) => {
    issues.push({
      area: "AI credit configuration",
      count: 1,
      issue: `Required AI credit pack ${code} is missing.`,
      nextStep: "Restore the DB-backed AI credit pack before supporting purchases.",
      status: "FAIL",
      tableName: "ai_credit_packs",
    });
  });
  if (aiCredits.missingActionUsageCount) {
    issues.push({
      area: "AI credit configuration",
      count: aiCredits.missingActionUsageCount,
      issue: `${aiCredits.missingActionUsageCount} AI usage row(s) reference missing AI actions.`,
      nextStep: "Restore the AI action row or classify the historical usage row before support review.",
      status: "FAIL",
      tableName: "ai_usage_log",
    });
  }
  if (aiCredits.missingBalanceUserKeys.length) {
    issues.push({
      area: "AI credit configuration",
      count: aiCredits.missingBalanceUserKeys.length,
      issue: `${aiCredits.missingBalanceUserKeys.length} user(s) have AI usage but no balance account.`,
      nextStep: "Open the user AI credit support record and reconcile the missing balance before adjustment.",
      status: "WARN",
      tableName: "user_ai_credits",
    });
  }
  if (!issues.length) {
    issues.push({
      area: "Required DB configuration",
      count: ADMIN_OPERATIONS_REQUIRED_TABLES.length,
      issue: "Required Admin operations tables and records are available.",
      nextStep: "No action required.",
      status: "PASS",
      tableName: "all required tables",
    });
  }
  return issues;
}

export function adminOperationsHealth(tables) {
  const tableRows = adminHealthTableRows(tables);
  const planMaps = adminHealthPlanMaps(tables);
  const memberships = adminHealthMemberships(tables, planMaps);
  const invitations = adminHealthInvitations(tables);
  const aiCredits = adminHealthAiCredits(tables);
  const marketplace = adminHealthMarketplace(tables, planMaps);
  const teams = adminHealthTeams(tables, planMaps);
  const configIssues = adminHealthConfigIssues(tableRows, memberships, aiCredits);
  const summaryRows = [
    { area: "Membership operations", count: memberships.totalCount, diagnostic: memberships.summary, status: memberships.status },
    { area: "Invitation support", count: invitations.totalCount, diagnostic: invitations.summary, status: invitations.status },
    { area: "AI credit monitoring", count: aiCredits.usageCount, diagnostic: aiCredits.summary, status: aiCredits.status },
    { area: "Marketplace revenue health", count: marketplace.sellerEligibleCount, diagnostic: marketplace.summary, status: marketplace.status },
    { area: "Team enforcement health", count: teams.projectCount, diagnostic: teams.summary, status: teams.status },
    { area: "Required DB configuration", count: configIssues.length, diagnostic: configIssues[0]?.issue || "Required DB configuration unavailable.", status: overallHealthStatus(configIssues) },
  ];
  return {
    aiCredits,
    configIssues,
    invitations,
    marketplace,
    memberships,
    sourceTables: ADMIN_OPERATIONS_REQUIRED_TABLES,
    status: overallHealthStatus(summaryRows),
    summaryRows,
    tableRows,
    teams,
  };
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
  const guestSeedDir = path.join(process.cwd(), "dev", "build", "database", "seed", "guest");
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
          source: `dev/build/database/seed/guest/${fileName}`,
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

function publicConfigValue(env, key) {
  return String(env?.[key] || "").trim();
}

function publicConfigFromEnvironment(env = process.env) {
  return {
    apiUrl: publicConfigValue(env, PUBLIC_CONFIG_ENV_KEYS.apiUrl),
    environmentLabel: publicConfigValue(env, PUBLIC_CONFIG_ENV_KEYS.environmentLabel),
    siteUrl: publicConfigValue(env, PUBLIC_CONFIG_ENV_KEYS.siteUrl),
  };
}

function localApiRequestUrl(requestUrl) {
  const hostname = String(requestUrl?.hostname || "").toLowerCase();
  return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
}

function environmentLabelSuppressesBanner(label) {
  const normalized = String(label || "").trim().toLowerCase();
  return ENVIRONMENT_LABEL_HIDDEN_VALUES.includes(normalized);
}

function environmentLabelDiagnosticName(label) {
  const normalizedName = normalizeEnvironmentName(label);
  if (normalizedName) {
    return normalizedName === "PRD" ? "PROD" : normalizedName;
  }
  return String(label || "").trim() ? "CUSTOM" : "UNCONFIGURED";
}

function environmentSafeguardStatus(publicConfig, environmentBanner) {
  const label = String(publicConfig?.environmentLabel || "").trim();
  if (!label) {
    return environmentBanner.active ? "missing-label-diagnostic" : "missing-label-hidden";
  }
  return environmentLabelSuppressesBanner(label)
    ? "production-banner-hidden"
    : "non-production-banner-visible";
}

function inactiveEnvironmentBanner() {
  return {
    active: false,
    message: "",
    source: ENVIRONMENT_BANNER_SOURCE,
    sourceTable: "",
    sourceTableRowKey: "",
    tone: "info",
  };
}

function environmentBannerFromPublicConfig(publicConfig, requestUrl) {
  const label = String(publicConfig?.environmentLabel || "").trim();
  if (label) {
    return environmentLabelSuppressesBanner(label)
      ? inactiveEnvironmentBanner()
      : {
          active: true,
          message: label,
          source: ENVIRONMENT_BANNER_SOURCE,
          sourceTable: "",
          sourceTableRowKey: "",
          tone: "warning",
        };
  }
  if (localApiRequestUrl(requestUrl)) {
    return {
      active: true,
      message: `Environment banner configuration is incomplete. Set ${PUBLIC_CONFIG_ENV_KEYS.environmentLabel} in .env and restart the site API.`,
      source: ENVIRONMENT_BANNER_SOURCE,
      sourceTable: "",
      sourceTableRowKey: "",
      tone: "danger",
    };
  }
  return inactiveEnvironmentBanner();
}

function publicConfigDiagnostics(publicConfig, environmentBanner) {
  return {
    apiUrlConfigured: Boolean(publicConfig.apiUrl),
    environmentBannerActive: environmentBanner.active,
    environmentBannerSource: environmentBanner.source || ENVIRONMENT_BANNER_SOURCE,
    environmentBannerTone: environmentBanner.tone,
    environmentLabelConfigured: Boolean(publicConfig.environmentLabel),
    environmentLabelNormalized: environmentLabelDiagnosticName(publicConfig.environmentLabel),
    environmentSafeguard: environmentSafeguardStatus(publicConfig, environmentBanner),
    secretsExposed: false,
    siteUrlConfigured: Boolean(publicConfig.siteUrl),
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

const SOURCE_CONTROLLED_TOOLBOX_TOOL_IDS = new Set(["game-hub", "idea-board", "messages", "tags", "text-to-speech", "users"]);
const SOURCE_CONTROLLED_TOOLBOX_METADATA_FIELDS = Object.freeze([
  "active",
  "adminOnly",
  "badge",
  "category",
  "colorGroup",
  "deferred",
  "description",
  "group",
  "hidden",
  "path",
  "releaseChannel",
  "releaseChannelLabel",
  "shortDescription",
  "shortLabel",
  "status",
  "subgroup",
  "toolImage",
  "toolName",
  "toolboxGroup",
  "visibleInToolsList",
]);

function isGameHubToolId(toolId) {
  return ["game-hub", "game-workspace"].includes(String(toolId || ""));
}

function isLegacyGameWorkspaceToolId(toolId) {
  return String(toolId || "") === "game-workspace";
}

function withoutLegacyGameWorkspaceToolRows(rows) {
  return Array.isArray(rows)
    ? rows.filter((row) => !isLegacyGameWorkspaceToolId(normalizedToolKey(row)))
    : [];
}
const SOURCE_CONTROLLED_TOOLBOX_PLANNING_FIELDS = Object.freeze([
  "progressChecklist",
]);

function shouldSyncSourceControlledTool(toolId) {
  return SOURCE_CONTROLLED_TOOLBOX_TOOL_IDS.has(String(toolId || ""));
}

function valuesMatchForSourceSync(left, right) {
  if (Array.isArray(left) || Array.isArray(right)) {
    return JSON.stringify(left || []) === JSON.stringify(right || []);
  }
  return left === right;
}

function applySourceControlledValues(target, defaults, fields) {
  let changed = false;
  fields.forEach((field) => {
    const value = defaults[field];
    if (!valuesMatchForSourceSync(target[field], value)) {
      target[field] = Array.isArray(value) ? [...value] : value;
      changed = true;
    }
  });
  return changed;
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

function applyApiCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
  response.setHeader("Access-Control-Allow-Origin", "*");
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

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function repositoryMethodError(message, statusCode = 502) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.operatorDiagnostic = message;
  return error;
}

const TAGS_API_SETUP_RESPONSE_MESSAGE = "Tags API database setup is unavailable. Verify the API database connection and apply the account, Game Hub, and Tags database setup before using Tags.";

function isTagsRepositoryRequest(parts) {
  return parts[1] === "toolbox" && parts[2] === "tags" && parts[3] === "repositories";
}

function isDatabaseSetupError(error) {
  const message = String(error?.operatorDiagnostic || error?.message || error || "");
  return /database|schema|relation|configured product data connection|GAMEFOUNDRY_DATABASE_URL|ECONNREFUSED|ENOTFOUND|permission denied|request failed/i.test(message);
}

function safeTagsApiResponseError(error) {
  const message = error?.name === "TagsApiSetupError"
    ? String(error.message || TAGS_API_SETUP_RESPONSE_MESSAGE)
    : TAGS_API_SETUP_RESPONSE_MESSAGE;
  const responseError = new Error(message);
  responseError.statusCode = typeof error?.statusCode === "number" ? error.statusCode : 503;
  return responseError;
}

function errorForApiResponse(error, parts) {
  if (isTagsRepositoryRequest(parts) && (error?.name === "TagsApiSetupError" || isDatabaseSetupError(error))) {
    return safeTagsApiResponseError(error);
  }
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

const GAME_CONFIGURATION_SAVE_METHODS = new Set([
  "createConfiguration",
  "resetAll",
  "resetConfiguration",
  "updateConfiguration",
]);

const GAME_CREW_SAVE_METHODS = new Set([
  "addMember",
  "removeMember",
]);

const GAME_JOURNEY_TOOL_STORE_METHODS = new Set([
  "addItem",
  "addNote",
  "addNoteType",
  "applySystemItemUpdate",
  "changeSelectedIndent",
  "deleteItem",
  "deleteNote",
  "injectTemplateDiagnostics",
  "moveSelectedItem",
  "selectItem",
  "selectNote",
  "updateItem",
  "updateNote",
  "updateRecommendedTarget",
  "updateSelectedNoteType",
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
      throw repositoryMethodError(`Server repository ${repositoryId}.getActiveGame returned a malformed active game payload. Open or create a Game Hub game before continuing.`);
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

export function sessionUserFromIdentityTables(tables, userKey, modeId, providerLabel) {
  const mode = FIXED_ACCOUNT_SESSION_MODE;
  const key = String(userKey || "").trim();
  if (!isUlidKey(key)) {
    return key
      ? guestSession(mode, `Selected ${providerLabel} user key ${key} is not a valid users.key.`)
      : guestSession(mode);
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

const BETA_INVITATION_PLAN_KEY = "BETA";
const INVITATION_STATUSES = Object.freeze(["pending", "accepted", "revoked", "expired"]);

function normalizedInvitationEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Beta invite requires a valid target email.");
  }
  return email;
}

function normalizedInvitationCode(value) {
  const code = String(value || "").trim();
  if (!code) {
    throw new Error("Beta invite acceptance requires an invitation code.");
  }
  return code;
}

function normalizedInvitationText(value, label, maxLength = 280) {
  const text = String(value || "").trim();
  if (text.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }
  return text;
}

function betaInvitationCode() {
  return `beta_${randomBytes(18).toString("base64url")}`;
}

function invitationExpiresAt(value) {
  const raw = String(value || "").trim();
  const date = raw ? new Date(raw) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Beta invite expiration must be a valid date.");
  }
  if (date.getTime() <= Date.now()) {
    throw new Error("Beta invite expiration must be in the future.");
  }
  return date.toISOString();
}

function invitationStatus(row) {
  const status = String(row?.status || "").trim().toLowerCase();
  return INVITATION_STATUSES.includes(status) ? status : "pending";
}

function invitationIsExpired(row, now = new Date()) {
  const expiresAt = Date.parse(String(row?.expiresAt || ""));
  return Number.isFinite(expiresAt) && expiresAt <= now.getTime();
}

function publicInvitation(row) {
  return {
    acceptedAt: row.acceptedAt || "",
    acceptedBy: row.acceptedBy || "",
    createdAt: row.createdAt || "",
    createdBy: row.createdBy || "",
    email: row.email || "",
    expiresAt: row.expiresAt || "",
    inviteSource: row.inviteSource || "",
    invitationCode: row.invitationCode || "",
    invitedBy: row.invitedBy || "",
    key: row.key || "",
    personalMessage: row.personalMessage || "",
    planKey: row.planKey || BETA_INVITATION_PLAN_KEY,
    recipientName: row.recipientName || "",
    relationshipNote: row.relationshipNote || "",
    status: invitationStatus(row),
    updatedAt: row.updatedAt || "",
    updatedBy: row.updatedBy || "",
  };
}

function findInvitationUser(tables, email, userKey = "") {
  const key = String(userKey || "").trim();
  const users = Array.isArray(tables.users) ? tables.users : [];
  if (key) {
    const user = users.find((candidate) => candidate.key === key && candidate.isActive !== false);
    if (!user) {
      throw new Error(`Beta invite acceptance user ${key} is missing from users.`);
    }
    if (normalizedInvitationEmail(user.email) !== email) {
      throw new Error("Beta invite acceptance email must match the selected user.");
    }
    return user;
  }
  const user = users.find((candidate) =>
    candidate.isActive !== false && normalizedInvitationEmail(candidate.email) === email);
  if (!user) {
    throw new Error(`Beta invite acceptance requires an active users record for ${email}.`);
  }
  return user;
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
  return runtimeGeneratedKeyForSource(`game-hub-game:${normalizedGameId}`);
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
  return normalizeOwnedTables("game-hub", {
    game_workspace_games: gameWorkspaceGames,
    game_workspace_progress: activeGame ? [{
      ...snapshotAuditFields(80, SEED_DB_KEYS.users.user1),
      key: runtimeGeneratedKeyForSource(`game-hub-progress:${activeGameKey}`),
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

function normalizeGameCrewRole(role) {
  if (role === "Owner") {
    return "Owner";
  }
  return "Member";
}

function projectMemberRecord(project, member, index = 0) {
  const projectKey = gameWorkspaceGameKey(project?.id || project?.key);
  const userKey = String(member?.userKey || "").trim();
  const audit = snapshotAuditFields(120 + index, project?.ownerKey || SEED_DB_KEYS.users.user1);
  const isOwner = userKey === project?.ownerKey;
  return {
    ...audit,
    invitedAt: null,
    invitedBy: null,
    joinedAt: audit.createdAt,
    key: runtimeGeneratedKeyForSource(`game-crew-member:${projectKey}:${userKey || index}`),
    projectKey,
    removedAt: null,
    role: isOwner ? "Owner" : "Member",
    status: "active",
    userKey,
  };
}

function gameCrewMemberRows(gameWorkspaceRepository) {
  const project = gameWorkspaceRepository.getActiveGame();
  if (!project) {
    return [];
  }
  return (project.members || []).map((member, index) => projectMemberRecord(project, member, index));
}

function gameCrewDisplayName(project, userKey) {
  const sourceMember = (project?.members || []).find((member) => member.userKey === userKey) || {};
  return sourceMember.displayName || GAME_CREW_KNOWN_USERS[userKey] || userKey;
}

function gameCrewSnapshot(gameWorkspaceRepository, stateRows = null) {
  const project = gameWorkspaceRepository.getActiveGame();
  const rows = Array.isArray(stateRows) ? stateRows : gameCrewMemberRows(gameWorkspaceRepository);
  const activeRows = rows.filter((row) => row.status !== "removed");
  const members = activeRows.map((row) => ({
    ...row,
    displayName: gameCrewDisplayName(project, row.userKey),
  }));
  const owner = members.find((member) => member.role === "Owner") || null;
  return {
    activeProject: project
      ? {
          key: gameWorkspaceGameKey(project.id),
          localRecordId: project.id,
          name: project.name,
          ownerDisplayName: project.ownerDisplayName,
          ownerKey: project.ownerKey,
          status: project.status,
        }
      : null,
    guidance: "Project crew membership is ready for owner and member planning. Invitations and permissions are planned for a later pass.",
    memberRoles: GAME_CREW_MEMBER_ROLES.slice(),
    members,
    owner,
    status: project ? "Ready" : "Needs Project",
    tableCounts: GAME_CREW_TABLES.map((table) => ({
      rows: activeRows.length,
      table,
    })),
    tables: {
      project_members: rows,
    },
  };
}

function createGameCrewApiRepository({
  gameWorkspaceRepository,
  sessionUserKey = () => "",
} = {}) {
  let memberRows = null;

  function currentProject() {
    return gameWorkspaceRepository.getActiveGame();
  }

  function ensureMemberRows() {
    const project = currentProject();
    const projectKey = gameWorkspaceGameKey(project?.id || project?.key);
    if (!memberRows || !memberRows.some((row) => row.projectKey === projectKey)) {
      memberRows = gameCrewMemberRows(gameWorkspaceRepository);
    }
    return memberRows;
  }

  function getSnapshot() {
    return gameCrewSnapshot(gameWorkspaceRepository, ensureMemberRows());
  }

  function getTables() {
    return getSnapshot().tables;
  }

  function listMembers() {
    return getSnapshot().members;
  }

  function addMember(userKey = GAME_CREW_TEST_MEMBER_KEY) {
    const signedIn = Boolean(typeof sessionUserKey === "function" ? sessionUserKey() : sessionUserKey);
    const project = currentProject();
    const projectKey = gameWorkspaceGameKey(project?.id || project?.key);
    const targetUserKey = String(userKey || GAME_CREW_TEST_MEMBER_KEY).trim();
    const rows = ensureMemberRows();
    const existing = rows.find((row) => row.projectKey === projectKey && row.userKey === targetUserKey);
    if (!signedIn) {
      return {
        added: false,
        message: "Sign in before changing project crew membership.",
        requiresSignIn: true,
        status: "Sign In Required",
      };
    }
    if (!project || !projectKey) {
      return {
        added: false,
        message: "Create or select a project before adding crew members.",
        snapshot: getSnapshot(),
        status: "Needs Project",
      };
    }
    if (existing && existing.status !== "removed") {
      return {
        added: false,
        member: { ...existing, displayName: gameCrewDisplayName(project, targetUserKey) },
        message: `${gameCrewDisplayName(project, targetUserKey)} is already on the project crew.`,
        snapshot: getSnapshot(),
        status: "Already Added",
      };
    }
    const audit = snapshotAuditFields(150 + rows.length, signedIn ? sessionUserKey() : SEED_DB_KEYS.users.user1);
    const row = existing || {
      key: runtimeGeneratedKeyForSource(`game-crew-member:${projectKey}:${targetUserKey}`),
      projectKey,
      userKey: targetUserKey,
    };
    Object.assign(row, {
      ...audit,
      invitedAt: null,
      invitedBy: null,
      joinedAt: audit.createdAt,
      removedAt: null,
      role: "Member",
      status: "active",
    });
    if (!existing) {
      rows.push(row);
    }
    return {
      added: true,
      member: { ...row, displayName: gameCrewDisplayName(project, targetUserKey) },
      message: `Added ${gameCrewDisplayName(project, targetUserKey)} as a Member.`,
      snapshot: getSnapshot(),
      status: "Ready",
    };
  }

  function removeMember(userKey = "") {
    return {
      ...removeMemberResult(userKey),
    };
  }

  function removeMemberResult(userKey = "") {
    const signedIn = Boolean(typeof sessionUserKey === "function" ? sessionUserKey() : sessionUserKey);
    const project = currentProject();
    const targetUserKey = String(userKey || "").trim();
    const rows = ensureMemberRows();
    const member = rows.find((row) => row.userKey === targetUserKey && row.status !== "removed") || null;
    if (!signedIn) {
      return {
        member,
        message: "Sign in before changing project crew membership.",
        removed: false,
        requiresSignIn: true,
        status: "Sign In Required",
      };
    }
    if (!member) {
      return {
        member: null,
        message: "Choose an active crew member before removing.",
        removed: false,
        snapshot: getSnapshot(),
        status: "Needs Member",
      };
    }
    if (member.role === "Owner") {
      return {
        member: { ...member, displayName: gameCrewDisplayName(project, member.userKey) },
        message: "Project owners stay on the crew while owner transfer is planned.",
        removed: false,
        snapshot: getSnapshot(),
        status: "Owner Locked",
      };
    }
    const audit = snapshotAuditFields(180 + rows.length, sessionUserKey());
    member.status = "removed";
    member.removedAt = audit.updatedAt;
    member.updatedAt = audit.updatedAt;
    member.updatedBy = audit.updatedBy;
    return {
      member: { ...member, displayName: gameCrewDisplayName(project, member.userKey) },
      message: `Removed ${gameCrewDisplayName(project, member.userKey)} from the project crew.`,
      removed: true,
      snapshot: getSnapshot(),
      status: "Ready",
    };
  }

  function readAddMemberPlaceholder() {
    return addMember();
  }

  function readRemoveMemberPlaceholder(userKey = "") {
    return removeMemberResult(userKey);
  }

  return {
    GAME_CREW_MEMBER_ROLES,
    GAME_CREW_TABLES,
    addMember,
    getSnapshot,
    getTables,
    listMembers,
    removeMember,
    readAddMemberPlaceholder,
    readRemoveMemberPlaceholder,
  };
}

function gameDesignTables(repository) {
  const tables = repository.getTables();
  return {
    game_design_documents: (tables.game_design_documents || []).map((record, index) => ({
      ...snapshotAuditFields(index + 100, SEED_DB_KEYS.users.user1),
      capabilityDemoAuthoring: Boolean(record.capabilityDemoAuthoring),
      capabilityDemoNotes: record.capabilityDemoNotes || "",
      coreLoop: record.coreLoop || "",
      designNotes: record.designNotes || "",
      gamePurpose: record.gamePurpose || record.projectPurpose || "Game",
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      gameType: record.gameType || "",
      genre: record.genre || "",
      loseCondition: record.loseCondition || "",
      playerMode: record.playerMode || "1 Player",
      playStyle: record.playStyle || "",
      story: record.story || "",
      status: record.status,
      summary: record.summary || record.designSummary || "",
      targetAudience: record.targetAudience || "",
      title: record.title || `${record.gamePurpose || record.projectPurpose || "Game"} Design`,
      winCondition: record.winCondition || "",
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
    game_design_validation_items: (tables.game_design_validation_items || []).map((record, index) => ({
      ...snapshotAuditFields(index + 140, SEED_DB_KEYS.users.user1),
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      field: record.field || "",
      label: record.label,
      status: record.status,
      action: record.action,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
    game_design_sections: (tables.game_design_sections || []).map((record, index) => ({
      ...snapshotAuditFields(index + 160, SEED_DB_KEYS.users.user1),
      body: record.body || "",
      documentKey: record.documentKey,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      heading: record.heading || "",
      key: record.key,
      sectionKey: record.sectionKey || "",
      sortOrder: Number.isFinite(Number(record.sortOrder)) ? Number(record.sortOrder) : index + 1,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
    game_design_capability_demos: (tables.game_design_capability_demos || []).map((record, index) => ({
      ...snapshotAuditFields(index + 170, SEED_DB_KEYS.users.user1),
      authoringMode: record.authoringMode || "Game-owned capability demo",
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId),
      gameName: record.gameName || "",
      gamePurpose: record.gamePurpose || "Capability Demo",
      key: record.key,
      status: record.status || "Under Construction",
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
  };
}

function gameConfigurationTables(repository) {
  const tables = repository.getTables();
  return normalizeOwnedTables("game-configuration", {
    game_configuration_records: (tables.game_configuration_records || []).map((record, index) => ({
      ...snapshotAuditFields(index + 180, SEED_DB_KEYS.users.user1),
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId || record.projectKey || record.projectId),
      gameDetails: record.gameDetails || "",
      version: record.version || "",
      resolution: record.resolution || "",
      platforms: record.platforms || "",
      visibility: record.visibility || "",
      startupSettings: record.startupSettings || "",
      playerMode: record.playerMode || "1 Player",
      gameBasics: record.gameBasics || "",
      gameRules: record.gameRules || "",
      playerSetup: record.playerSetup || "",
      worldSetup: record.worldSetup || "",
      objectSetup: record.objectSetup || "",
      audioSetup: record.audioSetup || "",
      testReadiness: record.testReadiness || "",
      status: record.status || record.readinessStatus || "Ready",
      summary: record.summary || record.gameBasics || "",
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy || SEED_DB_KEYS.users.user1,
      updatedBy: record.updatedBy || SEED_DB_KEYS.users.user1,
    })),
    game_configuration_validation_items: (tables.game_configuration_validation_items || []).map((record, index) => ({
      ...snapshotAuditFields(index + 220, SEED_DB_KEYS.users.user1),
      key: record.key,
      gameKey: gameWorkspaceGameKey(record.gameKey || record.gameId || record.projectKey || record.projectId),
      section: record.section,
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

function hitboxesTables(repository) {
  return normalizeOwnedTables("hitboxes", repository.getTables());
}

function controlsTables(repository) {
  return normalizeOwnedTables("controls", repository.getTables());
}

async function gameJourneyTables(repository) {
  return normalizeOwnedTables("game-journey", await repository.getTables());
}

function gameCrewTables(repository) {
  return repository.getTables();
}

function paletteTables(repository) {
  return normalizeOwnedTables("palette", {
    ...repository.getTables(),
    palette_source_swatches: createPaletteSourceMockDbRows(),
  });
}

function tagsTables(repository) {
  const tables = repository.getTables();
  return normalizeOwnedTables("tags", {
    project_tag_assignments: (tables.project_tag_assignments || []).map((record) => ({
      createdAt: record.createdAt,
      createdBy: record.createdBy,
      key: record.key,
      projectKey: gameWorkspaceGameKey(record.projectKey),
      tagKey: record.tagKey,
      updatedAt: record.updatedAt,
      updatedBy: record.updatedBy,
    })),
    project_tags: (tables.project_tags || []).map((record) => ({
      active: record.active !== false,
      createdAt: record.createdAt,
      createdBy: record.createdBy,
      description: record.description,
      key: record.key,
      label: record.label,
      slug: record.slug,
      updatedAt: record.updatedAt,
      updatedBy: record.updatedBy,
    })),
  });
}

function cachedTagsForAssetRepository(repository) {
  const tables = typeof repository?.getTables === "function" ? repository.getTables() : {};
  return (tables.project_tags || [])
    .filter((record) => record.active !== false)
    .map((record) => ({
      ...record,
      id: record.slug || record.key,
      name: record.label,
    }));
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
  constructor({
    gameJourneyCompletionMetricsPostgresClient = null,
    messagesPostgresClient = null,
    messagesService = null,
    repoRoot = process.cwd(),
    supabasePostgresClient = null,
  } = {}) {
    this.messagesService = messagesService || createMessagesPostgresService({ postgresClient: messagesPostgresClient });
    this.gameJourneyCompletionMetricsPostgresClient = gameJourneyCompletionMetricsPostgresClient;
    this.supabasePostgresClient = supabasePostgresClient;
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
    const adapter = new SupabasePostgresProviderAdapter({ postgresClient: this.supabasePostgresClient });
    adapter.connect();
    return adapter;
  }

  assertProductDatabaseProvider(action) {
    this.supabaseDatabaseAdapter(action);
    return SUPABASE_POSTGRES_PROVIDER_ID;
  }

  async readSupabaseIdentityTablesUnchecked(action) {
    const adapter = this.supabaseDatabaseAdapter(action);
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
    const snapshot = await this.snapshot();
    return this.upsertSupabaseProductTables(snapshot.tables, action);
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
        ? "Identity tables are missing. Run dev/build/database/ddl/account/supabase-identity-tables.sql through the approved Supabase SQL setup path."
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
    const selectedUserKey = String(this.sessionUserKey || "").trim();
    if (selectedUserKey && !isUlidKey(selectedUserKey)) {
      return guestSession(
        FIXED_ACCOUNT_SESSION_MODE,
        `Selected Local DB identity user key ${selectedUserKey} is not a valid users.key.`,
      );
    }
    const status = await this.authStatusForRoute();
    if (selectedUserKey) {
      try {
        const tables = await this.readSupabaseIdentityTablesUnchecked("Reading selected Local API session");
        return sessionUserFromIdentityTables(tables, selectedUserKey, this.sessionModeId, "Local DB identity");
      } catch (error) {
        const localSession = sessionUserFromIdentityTables(
          this.standaloneTables,
          selectedUserKey,
          this.sessionModeId,
          "Local DB identity",
        );
        if (localSession.authenticated) {
          return localSession;
        }
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
    this.sessionUserKey = String(userKey || "").trim();
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

  async currentStateSnapshot() {
    return this.snapshot({ includePostgresCompletionMetrics: false });
  }

  async resetStateSnapshot() {
    this.applyStateSnapshot({
      cleared: false,
      tables: createServerSeedTables(),
    });
    return this.currentStateSnapshot();
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
    if (!Array.isArray(this.standaloneTables.invitations)) {
      this.standaloneTables.invitations = [];
    }
    this.sharedOptions = {
      completionMetricsPostgresClient: this.gameJourneyCompletionMetricsPostgresClient,
      memoryDbTables: this.standaloneTables,
      sessionMode: this.sessionModeId,
      sessionUserKey: this.sessionUserKey,
    };
    this.gameWorkspaceRepository = createGameWorkspaceMockRepository();
    this.gameWorkspaceRepository.resetGameData();
    const alfaServiceOptions = {
      databaseAdapter: (action) => this.supabaseDatabaseAdapter(action),
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      sessionUserKey: () => this.sessionUserKey,
    };
    this.gameDesignRepository = createGameDesignApiService(alfaServiceOptions);
    this.gameConfigurationRepository = createGameConfigurationApiService({
      ...alfaServiceOptions,
      gameDesignService: this.gameDesignRepository,
    });
    this.paletteRepository = createGameWorkspacePaletteRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      ...this.sharedOptions,
    });
    this.tagsRepository = createTagsApiService({
      ...alfaServiceOptions,
      sessionUserKey: () => this.sessionUserKey,
      usageProvider: () => this.assetRepository?.listAssets() || [],
    });
    this.assetRepository = createAssetToolMockRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      paletteRepository: this.paletteRepository,
      projectAssetStorage: createConfiguredProjectAssetStorage(),
      tagsRepository: {
        listTags: () => cachedTagsForAssetRepository(this.tagsRepository),
      },
      ...this.sharedOptions,
      sessionUserKey: () => this.sessionUserKey,
    });
    this.objectsRepository = createObjectsApiService({
      ...alfaServiceOptions,
      sessionUserKey: () => this.sessionUserKey,
    });
    this.hitboxesRepository = createHitboxesToolMockRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      objectsRepository: {
        listObjects: (gameId = "") => this.objectsRepository.listCachedObjects(gameId),
      },
      ...this.sharedOptions,
      sessionUserKey: () => this.sessionUserKey,
    });
    this.inputMappingRepository = createInputMappingToolMockRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
      ...this.sharedOptions,
      sessionUserKey: () => this.sessionUserKey,
    });
    this.gameCrewRepository = createGameCrewApiRepository({
      gameWorkspaceRepository: this.gameWorkspaceRepository,
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

  async persistGameConfigurationProviderState(action) {
    const adapter = this.supabaseDatabaseAdapter(action);
    return adapter.upsertProductTables({
      ...gameWorkspaceTables(this.gameWorkspaceRepository),
      ...gameConfigurationTables(this.gameConfigurationRepository),
    });
  }

  async persistGameCrewProviderState(action) {
    const adapter = this.supabaseDatabaseAdapter(action);
    const workspaceTables = gameWorkspaceTables(this.gameWorkspaceRepository);
    const crewTables = gameCrewTables(this.gameCrewRepository);
    const written = {
      game_workspace_games: 0,
      game_workspace_progress: 0,
      project_members: 0,
    };
    if (workspaceTables.game_workspace_games?.length) {
      const rows = await adapter.upsertProductTable("game_workspace_games", workspaceTables.game_workspace_games);
      written.game_workspace_games = Array.isArray(rows) ? rows.length : workspaceTables.game_workspace_games.length;
    }
    if (workspaceTables.game_workspace_progress?.length) {
      const rows = await adapter.upsertProductTable("game_workspace_progress", workspaceTables.game_workspace_progress);
      written.game_workspace_progress = Array.isArray(rows) ? rows.length : workspaceTables.game_workspace_progress.length;
    }
    if (crewTables.project_members?.length) {
      const rows = await adapter.upsertProductTable("project_members", crewTables.project_members);
      written.project_members = Array.isArray(rows) ? rows.length : crewTables.project_members.length;
    }
    return {
      providerId: SUPABASE_POSTGRES_PROVIDER_ID,
      serverApiOwnsKeyGeneration: true,
      written,
    };
  }

  async persistGameWorkspaceProviderState(action) {
    return {
      action,
      database: "Local DB",
      databaseEngine: "Local DB adapter",
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
          : "Create or assign the first admin through Admin Operations before promotion.",
      },
      {
        action: "Create approved role records",
        id: "default-roles",
        label: "Default Responsibilities",
        status: missingDefaultRoles.length ? "WARN" : "PASS",
        message: missingDefaultRoles.length
          ? `Missing default responsibility slug(s): ${missingDefaultRoles.join(", ")}.`
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
      message: `Admin Operations setup status checked ${areas.length} setup areas.`,
      ownership: "Admin -> Operations",
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

  publicConfigForRoute(requestUrl) {
    const publicConfig = publicConfigFromEnvironment();
    const environmentBanner = environmentBannerFromPublicConfig(publicConfig, requestUrl);
    return {
      diagnostics: publicConfigDiagnostics(publicConfig, environmentBanner),
      environmentBanner,
      publicConfig,
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

  async requireAdminSession() {
    const session = await this.currentSessionForRoute();
    if (!session.isAdmin || !session.userKey) {
      throw httpError("Admin role required to use this Admin API route.", 403);
    }
    return session;
  }

  async requireOwnerSession() {
    const session = await this.currentSessionForRoute();
    if (!session.isOwner || !session.userKey) {
      throw httpError("Owner role required to use this Owner API route.", 403);
    }
    return session;
  }

  async ownerMembershipSettingsForRoute() {
    const session = await this.requireOwnerSession();
    try {
      return {
        ...readOwnerMembershipSettings(this.standaloneTables, { session }),
        diagnostic: "Loaded Owner membership settings.",
      };
    } catch (error) {
      if (error instanceof OwnerMembershipSettingsError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Owner membership settings failed."), 500);
    }
  }

  async updateOwnerMembershipSettingsForRoute(body = {}) {
    const session = await this.requireOwnerSession();
    try {
      return updateOwnerMembershipSettings(this.standaloneTables, body, { session });
    } catch (error) {
      if (error instanceof OwnerMembershipSettingsError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Owner membership settings update failed."), 500);
    }
  }

  async ownerAiCreditSettingsForRoute() {
    const session = await this.requireOwnerSession();
    try {
      return {
        ...readOwnerAiCreditSettings(this.standaloneTables, { session }),
        diagnostic: "Loaded Owner AI credit settings.",
      };
    } catch (error) {
      if (error instanceof OwnerAiCreditSettingsError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Owner AI credit settings failed."), 500);
    }
  }

  async updateOwnerAiCreditSettingsForRoute(body = {}) {
    const session = await this.requireOwnerSession();
    try {
      return updateOwnerAiCreditSettings(this.standaloneTables, body, { session });
    } catch (error) {
      if (error instanceof OwnerAiCreditSettingsError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Owner AI credit settings update failed."), 500);
    }
  }

  async adminActiveMembership(requestUrl) {
    const session = await this.requireAdminSession();
    const userKey = String(requestUrl?.searchParams?.get("userKey") || "").trim();
    try {
      return {
        ...resolveActiveUserMembership(this.standaloneTables, { userKey }, {
          actorKey: session.userKey,
          createKey: runtimeGeneratedUlid,
        }),
        diagnostic: `Resolved active membership for ${userKey}.`,
        sourceTable: "user_memberships",
      };
    } catch (error) {
      if (error instanceof MembershipAssignmentError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Membership resolution failed."), 500);
    }
  }

  async assignAdminMembership(body = {}) {
    const session = await this.requireAdminSession();
    try {
      return {
        ...assignUserMembership(this.standaloneTables, body, {
          actorKey: session.userKey,
          createKey: runtimeGeneratedUlid,
        }),
        diagnostic: `Assigned ${String(body.planCode || body.code || "").trim().toUpperCase()} membership to ${String(body.userKey || "").trim()}.`,
        sourceTable: "user_memberships",
      };
    } catch (error) {
      if (error instanceof MembershipAssignmentError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Membership assignment failed."), 500);
    }
  }

  async membershipsCatalogForRoute(requestUrl) {
    const session = await this.currentSessionForRoute();
    const requestedUserKey = String(requestUrl?.searchParams?.get("userKey") || "").trim();
    const userKey = requestedUserKey && session.isAdmin ? requestedUserKey : session.userKey || "";
    try {
      return {
        ...readMembershipCatalog(this.standaloneTables, { userKey }, {
          actorKey: session.userKey || SEED_DB_KEYS.users.admin,
          createKey: runtimeGeneratedUlid,
          isAdmin: session.isAdmin,
          isOwner: session.isOwner,
        }),
        authenticated: session.authenticated === true,
        currentUserKey: userKey,
        diagnostic: userKey
          ? `Loaded membership catalog for ${userKey}.`
          : "Loaded membership catalog without an active signed-in user.",
      };
    } catch (error) {
      if (error instanceof MembershipAssignmentError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Membership catalog failed."), 500);
    }
  }

  async aiCreditDisplayForRoute() {
    const session = await this.currentSessionForRoute();
    if (!session.authenticated || !session.userKey) {
      throw httpError("Sign in required to view AI credits.", 401);
    }
    try {
      return {
        ...readAiCreditDisplay(this.standaloneTables, { userKey: session.userKey }, {
          actorKey: session.userKey,
          createKey: runtimeGeneratedUlid,
        }),
        authenticated: true,
        diagnostic: `Loaded AI credit display for ${session.userKey}.`,
      };
    } catch (error) {
      if (error instanceof AiCreditError || error instanceof MembershipAssignmentError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "AI credit display failed."), 500);
    }
  }

  async marketplaceEntitlementsForRoute() {
    const session = await this.currentSessionForRoute();
    try {
      const userKey = session.userKey || "";
      return {
        ...readMarketplaceEntitlements(this.standaloneTables, { userKey }),
        authenticated: session.authenticated === true,
        sellerRevenueModel: readMarketplaceSellerRevenueModel(this.standaloneTables, { userKey }),
        diagnostic: session.userKey
          ? `Loaded marketplace entitlements for ${session.userKey}.`
          : "Loaded guest marketplace entitlements.",
      };
    } catch (error) {
      if (error instanceof MarketplaceEntitlementError || error instanceof MarketplaceRevenueError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Marketplace entitlements failed."), 500);
    }
  }

  marketplaceCategoriesForRoute() {
    try {
      return {
        ...readMarketplaceCategories(this.standaloneTables),
        diagnostic: "Loaded marketplace categories from the shared category source.",
      };
    } catch (error) {
      if (error instanceof MarketplaceCategoryError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Marketplace categories failed."), 500);
    }
  }

  legalDocumentForRoute(requestUrl) {
    try {
      return readPublishedLegalDocument(this.standaloneTables, {
        documentType: requestUrl.searchParams.get("documentType") || "",
        slug: requestUrl.searchParams.get("slug") || "",
      });
    } catch (error) {
      if (error instanceof LegalDocumentError) {
        throw error;
      }
      throw httpError(error instanceof Error ? error.message : String(error || "Legal document read failed."), 500);
    }
  }

  invitationRows() {
    if (!Array.isArray(this.standaloneTables.invitations)) {
      this.standaloneTables.invitations = [];
    }
    return this.standaloneTables.invitations;
  }

  refreshExpiredInvitations(actorKey = SEED_DB_KEYS.users.admin) {
    const now = new Date();
    this.invitationRows()
      .filter((row) => invitationStatus(row) === "pending" && invitationIsExpired(row, now))
      .forEach((row) => {
        const timestamp = now.toISOString();
        row.status = "expired";
        row.updatedAt = timestamp;
        row.updatedBy = actorKey;
      });
  }

  async adminInvitationsList() {
    const session = await this.requireAdminSession();
    this.refreshExpiredInvitations(session.userKey);
    const invitations = this.invitationRows()
      .map(publicInvitation)
      .sort((first, second) => String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
    return {
      invitations,
      message: `Loaded ${invitations.length} Beta invite record(s).`,
      plan: {
        code: BETA_INVITATION_PLAN_KEY,
        label: "Beta",
        membershipAssignment: "deferred-to-PR-26169-005",
        studioEquivalent: true,
      },
      sourceTable: "invitations",
      status: "PASS",
    };
  }

  async createAdminBetaInvitation(body = {}) {
    const session = await this.requireAdminSession();
    const email = normalizedInvitationEmail(body.email);
    const requestedPlan = String(body.planKey || body.planCode || BETA_INVITATION_PLAN_KEY).trim().toUpperCase();
    if (requestedPlan !== BETA_INVITATION_PLAN_KEY) {
      throw httpError("Admin invites currently support the invite-only BETA plan only.", 400);
    }
    this.refreshExpiredInvitations(session.userKey);
    const duplicate = this.invitationRows().find((row) =>
      row.email === email && row.planKey === BETA_INVITATION_PLAN_KEY && invitationStatus(row) === "pending");
    if (duplicate) {
      throw httpError(`A pending Beta invite already exists for ${email}.`, 409);
    }
    const timestamp = new Date().toISOString();
    const invitation = {
      acceptedAt: "",
      acceptedBy: "",
      createdAt: timestamp,
      createdBy: session.userKey,
      email,
      expiresAt: invitationExpiresAt(body.expiresAt),
      inviteSource: normalizedInvitationText(body.inviteSource, "Invite source", 80),
      invitationCode: betaInvitationCode(),
      invitedBy: session.userKey,
      key: runtimeGeneratedUlid(),
      personalMessage: normalizedInvitationText(body.personalMessage, "Personal message", 500),
      planKey: BETA_INVITATION_PLAN_KEY,
      recipientName: normalizedInvitationText(body.recipientName, "Recipient name", 120),
      relationshipNote: normalizedInvitationText(body.relationshipNote, "Relationship note", 280),
      status: "pending",
      updatedAt: timestamp,
      updatedBy: session.userKey,
    };
    this.invitationRows().push(invitation);
    return {
      invitation: publicInvitation(invitation),
      message: `Created pending Beta invite for ${email}.`,
      sourceTable: "invitations",
      status: "PASS",
    };
  }

  async revokeAdminBetaInvitation(body = {}) {
    const session = await this.requireAdminSession();
    this.refreshExpiredInvitations(session.userKey);
    const key = String(body.key || body.invitationKey || "").trim();
    const invitation = this.invitationRows().find((row) => row.key === key);
    if (!invitation) {
      throw httpError(`Beta invite ${key || "missing"} was not found.`, 404);
    }
    const status = invitationStatus(invitation);
    if (status === "accepted") {
      throw httpError("Accepted Beta invites cannot be revoked.", 409);
    }
    if (status === "revoked") {
      throw httpError("Beta invite is already revoked.", 409);
    }
    const timestamp = new Date().toISOString();
    invitation.status = "revoked";
    invitation.updatedAt = timestamp;
    invitation.updatedBy = session.userKey;
    return {
      invitation: publicInvitation(invitation),
      message: `Revoked Beta invite for ${invitation.email}.`,
      sourceTable: "invitations",
      status: "PASS",
    };
  }

  async expireAdminBetaInvitation(body = {}) {
    const session = await this.requireAdminSession();
    this.refreshExpiredInvitations(session.userKey);
    const key = String(body.key || body.invitationKey || "").trim();
    const invitation = this.invitationRows().find((row) => row.key === key);
    if (!invitation) {
      throw httpError(`Beta invite ${key || "missing"} was not found.`, 404);
    }
    const status = invitationStatus(invitation);
    if (status === "accepted") {
      throw httpError("Accepted Beta invites cannot be expired.", 409);
    }
    if (status === "revoked") {
      throw httpError("Revoked Beta invites cannot be expired.", 409);
    }
    if (status === "expired") {
      throw httpError("Beta invite is already expired.", 409);
    }
    const timestamp = new Date().toISOString();
    invitation.status = "expired";
    invitation.expiresAt = timestamp;
    invitation.updatedAt = timestamp;
    invitation.updatedBy = session.userKey;
    return {
      invitation: publicInvitation(invitation),
      message: `Expired Beta invite for ${invitation.email}.`,
      sourceTable: "invitations",
      status: "PASS",
    };
  }

  acceptBetaInvitation(body = {}) {
    this.refreshExpiredInvitations();
    const email = normalizedInvitationEmail(body.email);
    const invitationCode = normalizedInvitationCode(body.invitationCode || body.code);
    const invitation = this.invitationRows().find((row) => row.invitationCode === invitationCode);
    if (!invitation) {
      throw httpError("Beta invite code was not found.", 404);
    }
    const status = invitationStatus(invitation);
    if (status === "accepted") {
      throw httpError("Beta invite has already been accepted.", 409);
    }
    if (status === "revoked") {
      throw httpError("Beta invite has been revoked.", 409);
    }
    if (status === "expired" || invitationIsExpired(invitation)) {
      invitation.status = "expired";
      invitation.updatedAt = new Date().toISOString();
      invitation.updatedBy = invitation.invitedBy || SEED_DB_KEYS.users.admin;
      throw httpError("Beta invite has expired.", 410);
    }
    if (normalizedInvitationEmail(invitation.email) !== email) {
      throw httpError("Beta invite email does not match the invited address.", 403);
    }
    const user = findInvitationUser(this.standaloneTables, email, body.userKey);
    const timestamp = new Date().toISOString();
    invitation.acceptedAt = timestamp;
    invitation.acceptedBy = user.key;
    invitation.status = "accepted";
    invitation.updatedAt = timestamp;
    invitation.updatedBy = user.key;
    return {
      invitation: publicInvitation(invitation),
      membershipAssignmentStatus: "deferred-to-PR-26169-005",
      message: "Beta invite accepted. Membership assignment will be applied by PR_26169_005.",
      sourceTable: "invitations",
      status: "PASS",
      userKey: user.key,
    };
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
    const environmentIdentity = systemHealthEnvironmentIdentity();
    return {
      accessKeyConfigured: configured,
      accessKeyStatus: configured ? "PASS" : "WARN",
      bucket: safe.bucket || "",
      bucketStatus: safe.bucket ? "PASS" : "WARN",
      configured,
      endpoint: safe.endpoint || "",
      endpointStatus: safe.endpoint && safe.endpoint !== "invalid endpoint" ? "PASS" : "WARN",
      environmentFolder: environmentIdentity.storageFolder,
      environmentFolderStatus: environmentIdentity.storageFolderStatus,
      lastChecked: new Date().toISOString(),
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

  storageConnectivityEnvironmentFolder() {
    return systemHealthEnvironmentIdentity().storageFolder || "/local";
  }

  storageConnectivityTargetPrefix(storage, scope = "project-prefix") {
    if (scope === "environment-folder") {
      return `${this.storageConnectivityEnvironmentFolder()}/`.replace(/\/{2,}/g, "/");
    }
    return String(storage.config?.projectsPrefix || "").trim();
  }

  storageConnectivityTestObjectKey(storage, scope = "project-prefix") {
    if (scope === "environment-folder") {
      return `${this.storageConnectivityTargetPrefix(storage, scope)}${STORAGE_CONNECTIVITY_TEST_OBJECT_RELATIVE_PATH}`.replace(/\/{2,}/g, "/");
    }
    const projectsPrefix = String(storage.config?.projectsPrefix || "").trim();
    return `${projectsPrefix}${STORAGE_CONNECTIVITY_TEST_OBJECT_RELATIVE_PATH}`.replace(/\/{2,}/g, "/");
  }

  storageConnectivityConfigFailure(actionId, storage, scope = "project-prefix") {
    const missing = storage.config?.missingKeys?.join(", ") || storage.config?.validationError || "storage configuration incomplete";
    const action = STORAGE_CONNECTIVITY_ACTIONS.find((candidate) => candidate.id === actionId);
    return {
      actionId,
      cleanupStatus: "not-run",
      durationMs: 0,
      environmentFolder: scope === "environment-folder" ? this.storageConnectivityEnvironmentFolder() : "",
      executed: false,
      lastChecked: new Date().toISOString(),
      message: `Storage connectivity requires configured storage and GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX before this action can run. Missing or invalid: ${missing}.`,
      operation: action?.operation || "configuration",
      operationLabel: action?.label || "Storage configuration",
      permanentObjectCreated: false,
      projectsPrefix: String(storage.config?.projectsPrefix || "").trim(),
      secretEditingAllowed: false,
      secretsExposed: false,
      status: "FAIL",
      storageStatus: this.ownerStorageStatus(),
      targetPrefix: scope === "environment-folder" ? this.storageConnectivityEnvironmentFolder() : String(storage.config?.projectsPrefix || "").trim(),
    };
  }

  storageConnectivityResult({
    action,
    actionId,
    cleanupStatus = "not-applicable",
    durationMs = 0,
    environmentFolder = "",
    executed = true,
    keysListed = 0,
    message,
    objectKey,
    permanentObjectCreated = false,
    projectsPrefix,
    status,
    targetPrefix = "",
  }) {
    const resolvedAction = action || STORAGE_CONNECTIVITY_ACTIONS.find((candidate) => candidate.id === actionId) || {};
    return {
      actionId,
      cleanupStatus,
      durationMs,
      environmentFolder,
      executed,
      keysListed,
      lastChecked: new Date().toISOString(),
      message,
      operation: resolvedAction.operation || "",
      operationLabel: resolvedAction.label || actionId,
      permanentObjectCreated,
      projectsPrefix,
      secretEditingAllowed: false,
      secretsExposed: false,
      status,
      storageStatus: this.ownerStorageStatus(),
      targetPrefix,
      testObjectKey: objectKey,
    };
  }

  async runStorageConnectivityAction(actionId, options = {}) {
    if (actionId === SYSTEM_HEALTH_STORAGE_EXPANDED_VALIDATION_ACTION_ID) {
      return this.runStorageExpandedValidation(options);
    }
    const action = STORAGE_CONNECTIVITY_ACTIONS.find((candidate) => candidate.id === actionId);
    if (!action) {
      throw new Error(`Unknown storage connectivity action: ${actionId || "missing actionId"}.`);
    }

    const startedAt = Date.now();
    const scope = options.scope === "environment-folder" ? "environment-folder" : "project-prefix";
    const storage = createConfiguredProjectAssetStorage();
    const projectsPrefix = String(storage.config?.projectsPrefix || "").trim();
    if (!storage.configured || !projectsPrefix) {
      return this.storageConnectivityConfigFailure(action.id, storage, scope);
    }

    const environmentFolder = scope === "environment-folder" ? this.storageConnectivityEnvironmentFolder() : "";
    const targetPrefix = this.storageConnectivityTargetPrefix(storage, scope);
    const objectKey = this.storageConnectivityTestObjectKey(storage, scope);
    try {
      if (action.operation === "bucket-connectivity") {
        const result = await storage.listObjects(targetPrefix);
        const keysListed = Array.isArray(result.keys) ? result.keys.length : 0;
        return this.storageConnectivityResult({
          action,
          actionId: action.id,
          durationMs: Date.now() - startedAt,
          environmentFolder,
          keysListed,
          message: result.ok
            ? `Bucket connectivity validated for current environment folder ${targetPrefix}.`
            : `${result.message || "Storage bucket connectivity failed."} Verify the endpoint, bucket, credentials, and current environment folder ${targetPrefix}.`,
          objectKey,
          projectsPrefix,
          status: result.ok ? "PASS" : "FAIL",
          targetPrefix,
        });
      }

      if (action.operation === "list") {
        const result = scope === "environment-folder"
          ? await storage.listObjects(targetPrefix)
          : await storage.listProjectObjects();
        const keysListed = Array.isArray(result.keys) ? result.keys.length : 0;
        return this.storageConnectivityResult({
          action,
          actionId: action.id,
          durationMs: Date.now() - startedAt,
          environmentFolder,
          keysListed,
          message: result.ok
            ? `List completed under ${targetPrefix}; ${keysListed} object(s) returned.`
            : `${result.message || "Storage list failed."} Verify the endpoint, bucket, credentials, and target prefix ${targetPrefix}.`,
          objectKey,
          projectsPrefix,
          status: result.ok ? "PASS" : "FAIL",
          targetPrefix,
        });
      }

      if (action.operation === "upload") {
        const result = await storage.putObject({
          bytes: STORAGE_CONNECTIVITY_TEST_OBJECT_CONTENT,
          contentType: "text/plain; charset=utf-8",
          objectKey,
        });
        return this.storageConnectivityResult({
          action,
          actionId: action.id,
          cleanupStatus: result.ok ? "requires-delete-action" : "not-created",
          durationMs: Date.now() - startedAt,
          environmentFolder,
          message: result.ok
            ? `Upload test object completed at ${objectKey}.`
            : `${result.message || "Storage upload failed."} Verify upload permission for ${targetPrefix}.`,
          objectKey,
          permanentObjectCreated: result.ok === true,
          projectsPrefix,
          status: result.ok ? "PASS" : "FAIL",
          targetPrefix,
        });
      }

      if (action.operation === "read") {
        const result = await storage.readObject(objectKey);
        const text = result.ok ? Buffer.from(result.bytes || []).toString("utf8") : "";
        const contentMatches = text === STORAGE_CONNECTIVITY_TEST_OBJECT_CONTENT;
        return this.storageConnectivityResult({
          action,
          actionId: action.id,
          durationMs: Date.now() - startedAt,
          environmentFolder,
          message: result.ok && contentMatches
            ? `Read test object completed from ${objectKey}.`
            : `${result.message || "Storage read failed or returned unexpected content."} Run Upload first and verify read permission for ${targetPrefix}.`,
          objectKey,
          projectsPrefix,
          status: result.ok && contentMatches ? "PASS" : "FAIL",
          targetPrefix,
        });
      }

      const result = await storage.deleteObject(objectKey);
      return this.storageConnectivityResult({
        action,
        actionId: action.id,
        cleanupStatus: result.ok ? "completed" : "failed",
        durationMs: Date.now() - startedAt,
        environmentFolder,
        message: result.ok
          ? `Delete test object completed at ${objectKey}.`
          : `${result.message || "Storage delete failed."} Verify delete permission for ${targetPrefix}.`,
        objectKey,
        permanentObjectCreated: false,
        projectsPrefix,
        status: result.ok ? "PASS" : "FAIL",
        targetPrefix,
      });
    } catch (error) {
      return this.storageConnectivityResult({
        action,
        actionId: action.id,
        durationMs: Date.now() - startedAt,
        environmentFolder,
        message: `Storage connectivity action failed: ${error instanceof Error ? error.message : String(error || "Unknown storage error.")}`,
        objectKey,
        projectsPrefix,
        status: "FAIL",
        targetPrefix,
      });
    }
  }

  async runStorageExpandedValidation(options = {}) {
    const startedAt = Date.now();
    const scope = options.scope === "environment-folder" ? "environment-folder" : "project-prefix";
    const storage = createConfiguredProjectAssetStorage();
    const targetPrefix = this.storageConnectivityTargetPrefix(storage, scope);
    const objectKey = this.storageConnectivityTestObjectKey(storage, scope);
    const results = [];
    for (const actionId of SYSTEM_HEALTH_STORAGE_ACTION_IDS) {
      results.push(await this.runStorageConnectivityAction(actionId, { scope }));
    }
    const uploadResult = results.find((result) => result.actionId === "storage-upload-test-object");
    const deleteResult = results.find((result) => result.actionId === "storage-delete-test-object");
    const permanentObjectCreated = uploadResult?.status === "PASS" && deleteResult?.status !== "PASS";
    const status = overallHealthStatus(results);
    return {
      actionId: SYSTEM_HEALTH_STORAGE_EXPANDED_VALIDATION_ACTION_ID,
      cleanupStatus: permanentObjectCreated ? "failed" : "completed",
      durationMs: Date.now() - startedAt,
      environmentFolder: scope === "environment-folder" ? this.storageConnectivityEnvironmentFolder() : "",
      executed: true,
      lastChecked: new Date().toISOString(),
      message: permanentObjectCreated
        ? `Expanded R2 validation detected a cleanup failure for ${objectKey}; review storage credentials and delete permission.`
        : `Expanded R2 validation completed against ${targetPrefix}; test object cleanup was attempted in the same validation run.`,
      permanentObjectCreated,
      projectsPrefix: String(storage.config?.projectsPrefix || "").trim(),
      secretEditingAllowed: false,
      secretsExposed: false,
      status,
      storageDiagnostics: results,
      storageStatus: this.ownerStorageStatus(),
      targetPrefix,
      testObjectKey: objectKey,
    };
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
        message: "Plan a read-only DEV export through Local API from project metadata, asset references, and configured project asset storage object keys.",
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

  async ownerDatabaseStatus(environmentIdentity = systemHealthEnvironmentIdentity()) {
    const startedAt = Date.now();
    const databaseStatus = {
      ...databaseConfigStatus(),
      connectivity: "not configured",
      connectivityStatus: "WARN",
      databaseType: environmentIdentity.databaseModel || "PostgreSQL",
      lastChecked: new Date().toISOString(),
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
      responseTimeMs: null,
      status: "WARN",
      currentDatabaseName: "",
      currentDatabaseNameStatus: "WARN",
      currentSchema: "",
      currentSchemaStatus: "WARN",
      databaseSize: "",
      databaseSizeBytes: null,
      databaseSizeStatus: "WARN",
      tableCount: null,
      version: "",
      versionStatus: "WARN",
    };
    try {
      const adapter = this.supabaseDatabaseAdapter("Reading Admin System Health migration history");
      const databaseClient = adapter.databaseClient();
      const versionRows = await databaseClient.query("SELECT version() AS version;");
      const currentRows = await databaseClient.query("SELECT current_database() AS database_name, current_schema() AS schema_name;");
      const countRows = await databaseClient.query(`
SELECT "migrationType", count(*)::int AS count
FROM schema_migrations
GROUP BY "migrationType"
ORDER BY "migrationType";
`);
      const lastRows = await databaseClient.query(`
SELECT "migrationType", "migrationName", "appliedAt"
FROM schema_migrations
ORDER BY "appliedAt" DESC, key DESC
LIMIT 1;
`);
      const tableCountRows = await databaseClient.query(`
SELECT count(*)::int AS table_count
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_type = 'BASE TABLE';
`);
      const databaseSizeRows = await databaseClient.query(`
SELECT pg_database_size(current_database()) AS database_size_bytes,
       pg_size_pretty(pg_database_size(current_database())) AS database_size;
`);
      const counts = new Map(countRows.map((row) => [String(row.migrationType || ""), Number(row.count || 0)]));
      const currentRow = currentRows[0] || {};
      const lastRow = lastRows[0] || {};
      const tableCount = Number(tableCountRows[0]?.table_count);
      const databaseSizeBytes = Number(databaseSizeRows[0]?.database_size_bytes);
      const connectedStatus = {
        ...databaseStatus,
        connectivity: "connected",
        connectivityStatus: "PASS",
        currentDatabaseName: String(currentRow.database_name || ""),
        currentDatabaseNameStatus: currentRow.database_name ? "PASS" : "WARN",
        currentSchema: String(currentRow.schema_name || ""),
        currentSchemaStatus: currentRow.schema_name ? "PASS" : "WARN",
        databaseSize: String(databaseSizeRows[0]?.database_size || ""),
        databaseSizeBytes: Number.isFinite(databaseSizeBytes) ? databaseSizeBytes : null,
        databaseSizeStatus: databaseSizeRows[0]?.database_size ? "PASS" : "WARN",
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
        message: "Current environment database connection and safe Postgres metrics responded through the Admin System Health API.",
        responseTimeMs: Date.now() - startedAt,
        status: databaseStatus.configured === true ? "PASS" : "WARN",
        tableCount: Number.isFinite(tableCount) ? tableCount : null,
        version: String(versionRows[0]?.version || "").trim() || "not available",
        versionStatus: versionRows[0]?.version ? "PASS" : "WARN",
      };
      return {
        ...connectedStatus,
        postgresMetrics: systemHealthPostgresMetrics(connectedStatus, connectedStatus.lastChecked),
      };
    } catch (error) {
      const failedStatus = {
        ...databaseStatus,
        connectivity: "failed",
        connectivityStatus: "FAIL",
        message: `Current environment database health read failed: ${error instanceof Error ? error.message : String(error || "Unknown database error.")}`,
        responseTimeMs: Date.now() - startedAt,
        status: "FAIL",
      };
      return {
        ...failedStatus,
        postgresMetrics: systemHealthPostgresMetrics(failedStatus, failedStatus.lastChecked),
      };
    }
  }

  adminOperationsEnvironment() {
    const environmentStatus = storageProjectsPrefixStatus();
    const activeLane = Array.isArray(environmentStatus.rows)
      ? environmentStatus.rows.find((row) => row.active === true)
      : null;
    return activeLane?.lane || "UNKNOWN";
  }

  adminOperationGroups() {
    const currentEnvironment = this.adminOperationsEnvironment();
    return ADMIN_OPERATION_GROUPS.map((group) => ({
      ...group,
      actions: group.actions.filter((action) => action.devOnly !== true || currentEnvironment === "DEV"),
    }));
  }

  async adminOperationsStatus() {
    await this.requireAdminSession();
    return {
      actionGroups: clone(this.adminOperationGroups()),
      currentEnvironment: this.adminOperationsEnvironment(),
      message: "Admin Operations loaded. Health, readiness, database status, storage status, and configuration tables remain in Admin System Health.",
      secretEditingAllowed: false,
      status: "PASS",
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

  async adminSystemHealthStorageConnectivityAction(body = {}) {
    await this.requireAdminSession();
    return this.runStorageConnectivityAction(String(body.actionId || "").trim(), { scope: "environment-folder" });
  }

  async adminSystemHealthStorageHealthCheck() {
    const validation = await this.runStorageExpandedValidation({ scope: "environment-folder" });
    const results = Array.isArray(validation.storageDiagnostics) ? validation.storageDiagnostics : [];
    return {
      actionId: "storage-check",
      checkedAt: new Date().toISOString(),
      label: SYSTEM_HEALTH_MANUAL_ACTION_LABELS["storage-check"],
      message: validation.message || "Storage health check executed bucket connectivity, list, upload, read, and delete through the current deployment API.",
      permanentObjectCreated: validation.permanentObjectCreated === true,
      secretEditingAllowed: false,
      secretsExposed: false,
      status: validation.status || overallHealthStatus(results.map((result) => ({ status: result.status }))),
      storageDiagnostics: results,
      storageStatus: this.ownerStorageStatus(),
      validationDurationMs: validation.durationMs,
    };
  }

  async adminSystemHealthAction(body = {}) {
    const session = await this.requireAdminSession();
    const actionId = String(body.actionId || "").trim();
    const label = SYSTEM_HEALTH_MANUAL_ACTION_LABELS[actionId];
    if (!label) {
      throw httpError(`Unknown Admin System Health action: ${actionId || "missing actionId"}.`, 400);
    }
    const checkedAt = new Date().toISOString();
    const environmentIdentity = systemHealthEnvironmentIdentity(process.env, checkedAt);
    if (actionId === "refresh" || actionId === "full-health-check") {
      const statusSnapshot = await this.adminSystemHealthStatus();
      return {
        actionId,
        checkedAt,
        label,
        message: `${label} completed through the current deployment Admin System Health API.`,
        secretEditingAllowed: false,
        secretsExposed: false,
        status: statusSnapshot.status,
        statusSnapshot,
      };
    }
    if (actionId === "runtime-check") {
      const runtimeHealth = systemHealthRuntimeHealth(environmentIdentity, checkedAt);
      return {
        actionId,
        checkedAt,
        label,
        message: "Runtime health check completed through the current deployment API.",
        runtimeHealth,
        secretEditingAllowed: false,
        secretsExposed: false,
        status: runtimeHealth.status,
      };
    }
    if (actionId === "database-check") {
      const databaseStatus = await this.ownerDatabaseStatus(environmentIdentity);
      return {
        actionId,
        checkedAt,
        databaseStatus,
        label,
        message: "Database health check completed through the current deployment API.",
        secretEditingAllowed: false,
        secretsExposed: false,
        status: databaseStatus.connectivityStatus || databaseStatus.status,
      };
    }
    if (session.isAdmin !== true) {
      throw httpError("Admin role required.", 403);
    }
    return this.adminSystemHealthStorageHealthCheck();
  }

  async adminSystemHealthStatus() {
    const session = await this.requireAdminSession();
    const authStatus = this.authStatus();
    const checkedAt = new Date().toISOString();
    const apiContract = systemHealthApiContract(checkedAt);
    const adminApiRegistry = systemHealthAdminApiRegistry(checkedAt);
    const runtimeFeatureFlags = systemHealthRuntimeFeatureFlags(checkedAt);
    const environmentIdentity = systemHealthEnvironmentIdentity(process.env, checkedAt);
    const environmentMap = systemHealthEnvironmentMap();
    const environmentComparison = systemHealthEnvironmentComparison({ checkedAt, environmentIdentity });
    const databaseStatus = await this.ownerDatabaseStatus(environmentIdentity);
    const postgresMetrics = databaseStatus.postgresMetrics || systemHealthPostgresMetrics(databaseStatus, checkedAt);
    const storageStatus = this.ownerStorageStatus();
    const environmentStatus = storageProjectsPrefixStatus();
    const localApiStartup = systemHealthLocalApiStartupDiagnostics();
    const limitRows = systemHealthLimitRows();
    const limitsStatus = systemHealthLimitStatus(limitRows);
    const packageStatus = projectPackageReadinessStatus();
    const promotionFoundation = this.ownerPromotionFoundation();
    const r2Readiness = systemHealthR2Readiness(storageStatus);
    const runtimeEnvironment = systemHealthRuntimeEnvironment();
    const runtimeHealth = systemHealthRuntimeHealth(environmentIdentity, checkedAt);
    const serviceHealth = systemHealthServiceHealth({
      authStatus,
      checkedAt,
      databaseStatus,
      runtimeHealth,
      session,
      storageStatus,
    });
    const configurationSummary = systemHealthConfigurationSummary({
      authStatus,
      checkedAt,
      databaseStatus,
      environmentIdentity,
      storageStatus,
    });
    const environmentCapabilities = systemHealthEnvironmentCapabilities({
      authStatus,
      checkedAt,
      databaseStatus,
      environmentIdentity,
      storageStatus,
    });
    const scheduledMonitoring = systemHealthScheduledMonitoring(checkedAt);
    const notificationsFoundation = systemHealthNotificationsFoundation(checkedAt);
    const operationsHealth = adminOperationsHealth(this.standaloneTables);
    const healthCheckHistory = systemHealthCheckHistory({
      checkedAt,
      databaseStatus,
      environmentIdentity,
      runtimeHealth,
      runtimeEnvironment,
      storageStatus,
    });
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
        area: "Environment identity",
        status: environmentIdentity.status,
        summary: `Current deployment is ${environmentIdentity.name}; System Health does not actively check peer environments.`,
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
        status: limitsStatus,
        summary: limitsStatus === "PASS"
          ? "Required limits are configured correctly; live usage is NOT AVAILABLE until provider usage metrics are exposed safely."
          : "One or more required limits are missing or invalid in current .env.",
      },
      {
        area: "Local API startup diagnostics",
        status: localApiStartup.status,
        summary: localApiStartup.message,
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
      ...operationsHealth.summaryRows.map((row) => ({
        area: row.area,
        status: row.status,
        summary: row.diagnostic,
      })),
    ];
    return {
      details: [
        { area: "Account/session readiness", field: "Session", status: session.authenticated ? "PASS" : "FAIL", value: session.authenticated ? "authenticated" : "not authenticated" },
        { area: "Account/session readiness", field: "Role", status: session.isAdmin ? "PASS" : "FAIL", value: session.isAdmin ? "Admin" : "Admin required" },
        { area: "Environment identity", field: "Environment name", status: environmentIdentity.status, value: environmentIdentity.name },
        { area: "Environment identity", field: "Hosting model", status: "PASS", value: environmentIdentity.hostingModel },
        { area: "Environment identity", field: "Site URL", status: environmentIdentity.siteUrlStatus, value: environmentIdentity.siteUrl },
        { area: "Environment identity", field: "API URL", status: environmentIdentity.apiUrlStatus, value: environmentIdentity.apiUrl },
        { area: "Environment identity", field: "Database model", status: "PASS", value: environmentIdentity.databaseModel },
        { area: "Environment identity", field: "Storage folder", status: environmentIdentity.storageFolderStatus, value: environmentIdentity.storageFolder },
        { area: "Environment identity", field: "Last health check", status: "PASS", value: environmentIdentity.lastHealthCheck },
        { area: "Product Data / Local DB", field: "Database host", status: databaseStatus.hostStatus || "WARN", value: databaseStatus.host || "not configured" },
        { area: "Product Data / Local DB", field: "Database name", status: databaseStatus.databaseNameStatus || "WARN", value: databaseStatus.databaseName || "not configured" },
        { area: "Project Asset Storage / R2", field: "Endpoint", status: storageStatus.endpointStatus || "WARN", value: storageStatus.endpoint || "not configured" },
        { area: "Project Asset Storage / R2", field: "Bucket", status: storageStatus.bucketStatus || "WARN", value: storageStatus.bucket || "not configured" },
        { area: "Project Asset Storage / R2", field: "Projects prefix", status: storageStatus.projectsPrefixStatus || "WARN", value: storageStatus.projectsPrefix || "not configured" },
        { area: "Environment configuration", field: environmentStatus.variableName, status: environmentStatus.status, value: environmentStatus.configured ? "valid lane match" : "missing or invalid" },
        { area: "Secrets status", field: "Storage access key", status: storageStatus.accessKeyStatus || "WARN", value: storageStatus.accessKeyConfigured ? "configured; value hidden" : "not configured" },
        { area: "Secrets status", field: "Storage secret key", status: storageStatus.secretKeyStatus || "WARN", value: storageStatus.secretKeyConfigured ? "configured; value hidden" : "not configured" },
        ...localApiStartup.rows.map((row) => ({
          area: "Local API startup diagnostics",
          field: row.field,
          status: row.status,
          value: row.value,
        })),
        { area: "Migration status", field: "Migration counts", status: databaseStatus.migrationStatus || "WARN", value: `DDL=${databaseStatus.migrationCounts?.DDL || 0}; DML=${databaseStatus.migrationCounts?.DML || 0}` },
        { area: "Project package readiness", field: ".gfsp decision", status: packageStatus.status, value: packageStatus.decisionPath },
        { area: "Project package readiness", field: "Runtime scaffold", status: packageStatus.status, value: `${packageStatus.contract?.packageType || "Game Foundry Studio Project"} ${packageStatus.contract?.contractVersion || ""}`.trim() },
        { area: "Project package readiness", field: "Filename format", status: packageStatus.status, value: packageStatus.contract?.filenameFormat || GFSP_PACKAGE_FILENAME_PATTERN },
        { area: "Project package readiness", field: "Required files", status: packageStatus.status, value: (packageStatus.contract?.requiredFiles || GFSP_PACKAGE_REQUIRED_FILES).join(", ") },
        { area: "Promotion/package safety", field: "Browser destructive operations", status: promotionFoundation.destructiveOperationsAllowed === false ? "PASS" : "WARN", value: promotionFoundation.destructiveOperationsAllowed === false ? "disabled" : "review required" },
        { area: "Promotion/package safety", field: "Import overwrite", status: promotionFoundation.importOverwriteAllowed === false ? "PASS" : "WARN", value: promotionFoundation.importOverwritePolicy || "review required" },
        { area: "Membership operations", field: "Active assignments", status: operationsHealth.memberships.status, value: `${operationsHealth.memberships.activeCount} active of ${operationsHealth.memberships.totalCount} total` },
        { area: "Invitation support", field: "Status counts", status: operationsHealth.invitations.status, value: JSON.stringify(operationsHealth.invitations.countsByStatus) },
        { area: "AI credit monitoring", field: "Usage rows", status: operationsHealth.aiCredits.status, value: `${operationsHealth.aiCredits.usageCount} usage row(s); ${operationsHealth.aiCredits.totalBalance} total balance credits` },
        { area: "Marketplace revenue health", field: "Eligible sellers", status: operationsHealth.marketplace.status, value: `${operationsHealth.marketplace.sellerEligibleCount} active seller-eligible membership(s)` },
        { area: "Team enforcement health", field: "Limit violations", status: operationsHealth.teams.status, value: `${operationsHealth.teams.limitViolationCount} violation(s); ${operationsHealth.teams.blockedInvitationCount} blocked invitation(s)` },
        { area: "Required DB configuration", field: "Issue count", status: overallHealthStatus(operationsHealth.configIssues), value: `${operationsHealth.configIssues.length} issue row(s)` },
      ],
      links: {
        infrastructure: "/admin/infrastructure.html",
        adminOperations: "/admin/operations.html",
      },
      limits: limitRows,
      localApiStartup,
      message: "Admin System Health loaded safe status only.",
      environmentIdentity,
      environmentMap,
      environmentComparison,
      environmentCapabilities,
      healthCheckHistory,
      notificationsFoundation,
      operationsHealth,
      overview,
      postgresMetrics,
      pressureLabels: SYSTEM_HEALTH_LIMIT_PRESSURE_LABELS,
      connectionSummary: this.ownerConnectionSummary(),
      databaseStatus,
      adminApiRegistry,
      apiContract,
      configurationSummary,
      r2Readiness,
      secretEditingAllowed: false,
      secretsExposed: false,
      runtimeEnvironment,
      runtimeFeatureFlags,
      runtimeHealth,
      scheduledMonitoring,
      serviceHealth,
      storageStatus,
      summary: systemHealthSummary(overview),
      status: overallHealthStatus(overview),
    };
  }

  async runtimeHealthJsonStatus() {
    const checkedAt = new Date().toISOString();
    const environmentIdentity = systemHealthEnvironmentIdentity(process.env, checkedAt);
    const runtimeHealth = systemHealthRuntimeHealth(environmentIdentity, checkedAt);
    const databaseStatus = await this.ownerDatabaseStatus(environmentIdentity);
    const storageStatus = this.ownerStorageStatus();
    return {
      api: {
        status: runtimeHealth.status || "WARN",
        version: runtimeHealth.apiVersion || "not available",
      },
      database: {
        connectivity: databaseStatus.connectivity || "not configured",
        databaseType: databaseStatus.databaseType || environmentIdentity.databaseModel || "PostgreSQL",
        lastChecked: databaseStatus.lastChecked || checkedAt,
        responseTimeMs: Number.isFinite(databaseStatus.responseTimeMs) ? databaseStatus.responseTimeMs : null,
        status: databaseStatus.connectivityStatus || databaseStatus.status || "WARN",
        version: databaseStatus.version || "not available",
      },
      environment: {
        hostingModel: environmentIdentity.hostingModel || "not configured",
        name: environmentIdentity.name || "Unknown",
        storageFolder: environmentIdentity.storageFolder || "not configured",
      },
      message: "Runtime health JSON is server-owned and safe for Local API status consumers.",
      secretEditingAllowed: false,
      secretsExposed: false,
      status: overallHealthStatus([
        { status: runtimeHealth.status || "WARN" },
        { status: databaseStatus.connectivityStatus || databaseStatus.status || "WARN" },
        { status: storageStatus.status || "WARN" },
      ]),
      storage: {
        configured: storageStatus.configured === true,
        environmentFolder: storageStatus.environmentFolder || environmentIdentity.storageFolder || "not configured",
        lastChecked: storageStatus.lastChecked || checkedAt,
        status: storageStatus.status || "WARN",
      },
      timestamp: checkedAt,
    };
  }

  projectWorkspaceProjectsForRoute() {
    const activeProject = this.gameWorkspaceRepository.getActiveGame();
    const records = gameWorkspaceProjectRecords(this.gameWorkspaceRepository);
    const storageObjects = assetRuntimeTables(this.assetRepository).asset_storage_objects || [];
    const storageObjectKeys = storageObjects
      .map((row) => row.storageObjectKey || row.storedPath || "")
      .filter(Boolean);
    return {
      api: "Local API",
      apiOwnsAuthoritativeProjectKeys: true,
      activeProjectKey: activeProject ? gameWorkspaceGameKey(activeProject.id) : "",
      assetReferenceCount: storageObjectKeys.length,
      assetReferencesLinkedToStorage: storageObjectKeys.length
        ? storageObjectKeys.every((key) => String(key).trim().length > 0)
        : true,
      browserProductDataSsoT: false,
      database: "Local DB",
      databaseEngine: "Local DB adapter",
      guestBrowsingAllowed: true,
      guestSavingAllowed: false,
      pageLocalProductDataArrays: false,
      recordCount: records.length,
      records: records.map((record) => ({
        ...record,
        apiOwnsAuthoritativeProjectKey: true,
        assetReferenceCount: storageObjectKeys.length,
        assetReferencesLinkedToStorage: storageObjectKeys.length
          ? storageObjectKeys.every((key) => String(key).trim().length > 0)
          : true,
        storageObjectKeys,
      })),
      serviceContract: "Web UI -> Local API/Service Contract -> Local DB",
      source: "Local API",
      storageContract: "Asset references link to R2 object keys through API-owned asset metadata.",
      terminology: "Game Hub",
    };
  }

  async gameJourneyCompletionMetricsForRoute() {
    return this.gameJourneyRepository.getCompletionMetricsSnapshot();
  }

  async updateGameJourneyCompletionMetricForRoute(bucketKey, updates = {}) {
    const metric = await this.gameJourneyRepository.updateCompletionMetric(bucketKey, updates);
    return {
      ...(await this.gameJourneyCompletionMetricsForRoute()),
      updatedMetric: metric,
    };
  }

  async validateAdminConnection() {
    await this.requireAdminSession();
    const authStatus = await this.authStatusForRoute();
    let productCheck = {
      ready: false,
      status: "unavailable",
      message: "Product data connection was not validated.",
    };
    try {
      const connection = this.supabaseDatabaseAdapter("Validating Admin Operations Local DB connection").connect();
      productCheck = {
        ready: connection.ready === true,
        status: connection.ready === true ? "ready" : "unavailable",
        message: connection.ready === true
          ? "Local DB connection is configured."
          : "Local DB connection did not report ready.",
      };
    } catch (error) {
      productCheck = {
        ready: false,
        status: "unavailable",
        message: error instanceof Error ? error.message : String(error || "Local DB connection validation failed."),
      };
    }
    const accountReady = authStatus.ready === true;
    const status = accountReady && productCheck.ready ? "PASS" : "FAIL";
    return {
      actionId: "validate-current-connection",
      actionLabel: "Validate Current Connection",
      checks: [
        {
          id: "account-connection",
          label: "Account connection",
          status: accountReady ? "PASS" : "FAIL",
          message: authStatus.operatorDiagnostic || authStatus.message || "Account connection status unavailable.",
        },
        {
          id: "product-data-connection",
          label: "Local DB connection",
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
    };
  }

  async adminDatabaseConnectivityTest() {
    await this.requireAdminSession();
    try {
      const connection = this.supabaseDatabaseAdapter("Running Admin Operations database connectivity test").connect();
      const ready = connection.ready === true;
      return {
        actionId: "database-connectivity-test",
        actionLabel: "Database Connectivity Test",
        executed: true,
        message: ready
          ? "Database Connectivity Test completed for the configured Local DB."
          : "Database Connectivity Test did not report the configured Local DB as ready.",
        secretEditingAllowed: false,
        status: ready ? "PASS" : "FAIL",
      };
    } catch (error) {
      return {
        actionId: "database-connectivity-test",
        actionLabel: "Database Connectivity Test",
        executed: true,
        message: error instanceof Error ? error.message : String(error || "Database Connectivity Test failed."),
        secretEditingAllowed: false,
        status: "FAIL",
      };
    }
  }

  projectPackageExistingProjects() {
    return gameWorkspaceProjectRecords(this.gameWorkspaceRepository);
  }

  activeProjectPackageProject() {
    const activeGame = this.gameWorkspaceRepository.getActiveGame();
    if (!activeGame) {
      throw new Error("Export Project Package requires an open Game Hub project.");
    }
    const projectRecord = this.projectPackageExistingProjects()
      .find((record) => record.localRecordId === activeGame.id);
    return {
      id: activeGame.id,
      localRecordId: activeGame.id,
      name: activeGame.name,
      ownerKey: activeGame.ownerKey,
      projectKey: projectRecord?.projectKey || gameWorkspaceGameKey(activeGame.id),
      status: activeGame.status,
    };
  }

  projectPackageAssetReferences() {
    const tables = assetRuntimeTables(this.assetRepository);
    return (tables.asset_storage_objects || [])
      .filter((row) => row.storageObjectKey || row.storedPath)
      .map((row) => ({
        assetId: row.assetId || row.id || row.key,
        fileName: row.originalName || row.fileName || "",
        mimeType: row.mimeType || "",
        size: row.size || 0,
        storageObjectKey: row.storageObjectKey || row.storedPath,
        storedPath: row.storedPath,
      }));
  }

  exportProjectPackageAction() {
    const project = this.activeProjectPackageProject();
    const packageResult = createProjectPackage({
      assetReferences: this.projectPackageAssetReferences(),
      existingProjects: this.projectPackageExistingProjects(),
      project,
    });
    return {
      actionId: "export-project-package",
      actionLabel: "Export Project Package",
      executed: true,
      message: `Export Project Package generated ${packageResult.filename} with ${packageResult.fileCount} required file(s) and ${packageResult.metadata.assetReferenceCount} asset reference(s); export validation ${packageResult.validation.status}.`,
      package: packageResult,
      secretEditingAllowed: false,
      secretsExposed: false,
      status: packageResult.validation.status,
      validation: packageResult.validation,
    };
  }

  validateProjectPackageAction(body = {}) {
    const validation = validateProjectPackage({
      existingProjects: this.projectPackageExistingProjects(),
      fileName: body.packageFileName,
      packageBytesBase64: body.packageBytesBase64,
    });
    return {
      actionId: "validate-project-package",
      actionLabel: "Validate Project Package",
      executed: Boolean(body.packageBytesBase64),
      message: validation.message,
      secretEditingAllowed: false,
      secretsExposed: false,
      status: validation.status,
      validation,
    };
  }

  importProjectPackageAction(body = {}, session = {}) {
    const validation = validateProjectPackage({
      existingProjects: this.projectPackageExistingProjects(),
      fileName: body.packageFileName,
      packageBytesBase64: body.packageBytesBase64,
    });
    if (!validation.valid) {
      return {
        actionId: "import-project-package",
        actionLabel: "Import Project Package",
        executed: false,
        message: `Import Project Package blocked: ${validation.message}`,
        secretEditingAllowed: false,
        secretsExposed: false,
        status: "FAIL",
        validation,
      };
    }

    const importMode = String(body.importMode || "import-as-new").trim();
    const conflicts = validation.conflicts || [];
    const packageProject = validation.metadata?.project || {};
    if (importMode === "replace-existing") {
      if (!conflicts.length) {
        return {
          actionId: "import-project-package",
          actionLabel: "Import Project Package",
          executed: false,
          message: "Import Project Package blocked: Replace Existing was selected but no existing project conflict was detected. Use Import As New Project.",
          secretEditingAllowed: false,
          secretsExposed: false,
          status: "FAIL",
          validation,
        };
      }
      if (body.overwriteConfirmed !== true || String(body.confirmationPhrase || "").trim() !== "REPLACE") {
        return {
          actionId: "import-project-package",
          actionLabel: "Import Project Package",
          conflicts,
          executed: false,
          message: "Import Project Package blocked: existing project conflict detected. Confirm Replace Existing and type REPLACE before overwrite.",
          secretEditingAllowed: false,
          secretsExposed: false,
          status: "FAIL",
          validation,
        };
      }
      const existing = conflicts[0];
      const opened = this.gameWorkspaceRepository.openGame(existing.localRecordId);
      if (opened && packageProject.status) {
        this.gameWorkspaceRepository.updateGameStatus(existing.localRecordId, packageProject.status);
      }
      return {
        actionId: "import-project-package",
        actionLabel: "Import Project Package",
        conflicts,
        executed: true,
        importedProject: this.gameWorkspaceRepository.getActiveGame(),
        message: `Import Project Package replaced existing project ${existing.name} after explicit REPLACE confirmation.`,
        secretEditingAllowed: false,
        secretsExposed: false,
        status: "PASS",
        validation,
      };
    }

    const newName = conflicts.length ? `${packageProject.name} Imported` : packageProject.name;
    const importedProject = this.gameWorkspaceRepository.createGame({
      name: newName,
      ownerKey: session.userKey,
      purpose: "Game",
      status: packageProject.status,
    });
    return {
      actionId: "import-project-package",
      actionLabel: "Import Project Package",
      conflicts,
      executed: true,
      importedProject,
      message: conflicts.length
        ? `Import Project Package imported ${newName} as a new project; existing project was not overwritten.`
        : `Import Project Package imported ${newName} as a new project.`,
      secretEditingAllowed: false,
      secretsExposed: false,
      status: "PASS",
      validation,
    };
  }

  async validateBackupDatabaseConnection() {
    try {
      const adapter = this.supabaseDatabaseAdapter("Validating Create Backup database connection");
      await adapter.databaseClient().query("SELECT 1 AS backup_ready;");
      return {
        message: "Configured database connection validated before pg_dump.",
        status: "PASS",
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : String(error || "Database connection validation failed before pg_dump."),
        status: "FAIL",
      };
    }
  }

  async createBackupAction() {
    const currentEnvironment = this.adminOperationsEnvironment();
    const connectionValidation = await this.validateBackupDatabaseConnection();
    if (connectionValidation.status !== "PASS") {
      return {
        actionId: "create-backup",
        actionLabel: "Create Backup",
        checks: [
          {
            id: "database-connection",
            label: "Database connection",
            message: connectionValidation.message,
            status: "FAIL",
          },
        ],
        currentEnvironment,
        executed: false,
        message: `Create Backup blocked before pg_dump: ${connectionValidation.message}`,
        secretEditingAllowed: false,
        secretsExposed: false,
        status: "FAIL",
      };
    }
    return createPostgresBackup({
      backupStorage: createConfiguredBackupStorage(process.env),
      env: process.env,
      environment: currentEnvironment,
    });
  }

  restoreBackupAction() {
    return {
      actionId: "restore-from-backup",
      actionLabel: "Restore From Backup",
      executed: false,
      manualOnly: true,
      message: "Restore From Backup is scaffold-only. Server-side pg_restore safety, conflict validation, and explicit restore approval must be implemented before restore can run.",
      secretEditingAllowed: false,
      secretsExposed: false,
      status: "SKIP",
    };
  }

  async runAdminOperationAction(body = {}) {
    const session = await this.requireAdminSession();
    const actionId = String(body.actionId || "").trim();
    const action = this.adminOperationGroups()
      .flatMap((group) => group.actions)
      .find((candidate) => candidate.id === actionId);
    if (!action) {
      throw new Error(`Unknown Admin Operations action: ${actionId || "missing actionId"}.`);
    }
    if (action.id === "validate-current-connection") {
      return this.validateAdminConnection();
    }
    if (action.id === "database-connectivity-test") {
      return this.adminDatabaseConnectivityTest();
    }
    if (action.id === "export-project-package") {
      return this.exportProjectPackageAction();
    }
    if (action.id === "validate-project-package") {
      return this.validateProjectPackageAction(body);
    }
    if (action.id === "import-project-package") {
      return this.importProjectPackageAction(body, session);
    }
    if (action.id === "create-backup") {
      return this.createBackupAction();
    }
    if (action.id === "restore-from-backup") {
      return this.restoreBackupAction(body);
    }
    return {
      actionId: action.id,
      actionLabel: action.label,
      confirmationRequired: action.confirmationRequired === true,
      executed: false,
      manualOnly: true,
      message: `${action.label} is not implemented in Admin Operations. ${action.confirmationMessage || action.diagnostic || "Use reviewed server-side tooling before enabling this action."}`,
      secretEditingAllowed: false,
      status: "SKIP",
    };
  }

  guestSeedPackages() {
    const packages = readDocsBuildGuestSeedPackages();
    return {
      readOnly: true,
      route: "/api/guest/seed",
      source: "dev/build/database/seed/guest/",
      packages,
      status: packages.length ? "PASS" : "WARN",
      warning: packages.length ? "" : "No dev/build guest seed packages were found.",
    };
  }

  setMode(modeId) {
    const normalizedModeId = String(modeId || "").trim();
    if (normalizedModeId && normalizedModeId !== "local-db" && normalizedModeId !== FIXED_ACCOUNT_SESSION_MODE.id) {
      throw new Error(`Unknown local login environment: ${normalizedModeId}.`);
    }
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
      operatorDiagnostic = "Supabase Auth configuration is present; account actions validate upstream auth during the request.";
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
    const readinessStatus = status || this.authStatus();
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
    const activeSupabaseUsers = (tables.users || []).filter((user) => {
      if (user.isActive === false || user.authProvider !== SUPABASE_AUTH_PROVIDER_ID) {
        return false;
      }
      return true;
    });
    const matchingUser = activeSupabaseUsers.find((user) => authUserId && String(user.authProviderUserId || "") === authUserId);
    if (!matchingUser) {
      const matchingEmailUser = activeSupabaseUsers.find((user) =>
        authEmail && normalizedAuthEmail(user.email).toLowerCase() === authEmail.toLowerCase());
      const diagnostic = matchingEmailUser
        ? "Account authentication succeeded, but the users record is not linked to this account identity. Run the approved DEV identity sync before signing in."
        : "Account authentication succeeded, but no matching users record exists for this account.";
      throw authIdentitySetupError(action, diagnostic);
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

    const adapter = this.supabaseDatabaseAdapter(`${action} identity provisioning`);
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
    const operatorStatus = this.authStatus();
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
    const operatorStatus = this.authStatus();
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
    const operatorStatus = this.authStatus();
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
      if (shouldSyncSourceControlledTool(toolKey)) {
        applySourceControlledValues(normalizedValues, defaults, SOURCE_CONTROLLED_TOOLBOX_PLANNING_FIELDS);
      }

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
    let changed = false;
    for (let index = rows.length - 1; index >= 0; index -= 1) {
      if (isLegacyGameWorkspaceToolId(normalizedToolKey(rows[index]))) {
        rows.splice(index, 1);
        changed = true;
      }
    }
    const activeTools = getActiveToolRegistry();
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
      if (shouldSyncSourceControlledTool(tool.id)) {
        applySourceControlledValues(normalizedValues, defaults, SOURCE_CONTROLLED_TOOLBOX_METADATA_FIELDS);
      }
      Object.entries(normalizedValues).forEach(([key, value]) => {
        if (!valuesMatchForSourceSync(existingRow[key], value)) {
          existingRow[key] = Array.isArray(value) ? [...value] : value;
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
    const syncedRows = activeTools
      .filter((tool) => shouldSyncSourceControlledTool(tool.id) && rowsByToolKey.has(tool.id))
      .flatMap((tool) => {
        const row = rowsByToolKey.get(tool.id);
        const updatedRow = { ...row };
        return applySourceControlledValues(updatedRow, this.defaultToolboxPlanning(tool), SOURCE_CONTROLLED_TOOLBOX_PLANNING_FIELDS)
          ? [updatedRow]
          : [];
      });
    if (missingRows.length || syncedRows.length) {
      await adapter.upsertProductTable("toolbox_tool_planning", [...missingRows, ...syncedRows]);
      return adapter.getProductTableRows("toolbox_tool_planning");
    }
    return rows;
  }

  messagesActorKey() {
    return this.sessionUserKey || "";
  }

  async messagesApiContract(method, parts, body) {
    return handleMessagesApiContract({
      actorKey: this.messagesActorKey(),
      body,
      method,
      parts,
      service: this.messagesService,
    });
  }

  close() {
    this.messagesService.close();
  }

  async supabaseToolboxToolMetadataRows() {
    const adapter = this.supabaseDatabaseAdapter("Reading Supabase Toolbox tool metadata");
    const rows = withoutLegacyGameWorkspaceToolRows(await adapter.getProductTableRows("toolbox_tool_metadata"));
    const activeTools = getActiveToolRegistry();
    const rowsByToolKey = new Map(rows.map((row) => [row.toolKey || row.toolId, row]));
    const existingToolKeys = new Set(rowsByToolKey.keys());
    const missingRows = activeTools
      .filter((tool) => !existingToolKeys.has(tool.id))
      .map((tool, index) => ({
        key: this.toolboxToolMetadataKey(tool.id),
        ...this.defaultToolboxMetadata(tool, index),
        ...createMockDbAuditFields(index, SEED_DB_KEYS.users.forgeBot),
      }));
    const syncedRows = activeTools
      .filter((tool) => shouldSyncSourceControlledTool(tool.id) && rowsByToolKey.has(tool.id))
      .flatMap((tool, index) => {
        const row = rowsByToolKey.get(tool.id);
        const updatedRow = { ...row };
        return applySourceControlledValues(updatedRow, this.defaultToolboxMetadata(tool, index), SOURCE_CONTROLLED_TOOLBOX_METADATA_FIELDS)
          ? [updatedRow]
          : [];
      });
    if (missingRows.length || syncedRows.length) {
      await adapter.upsertProductTable("toolbox_tool_metadata", [...missingRows, ...syncedRows]);
      return withoutLegacyGameWorkspaceToolRows(await adapter.getProductTableRows("toolbox_tool_metadata"));
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
    const tools = withoutLegacyGameWorkspaceToolRows(this.ensureToolboxToolMetadataRows())
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
      adminMainItems: getAdminNavigationItems(),
      ownerMenuItems: getOwnerNavigationItems(),
      ownership: {
        adminMainItems: "www/src/api/admin-owner-navigation.js",
        ownerMenuItems: "www/src/api/admin-owner-navigation.js",
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
    if (isGameHubToolId(toolId)) return this.gameWorkspaceRepository;
    if (toolId === "game-crew") return this.gameCrewRepository;
    if (toolId === "game-design") return this.gameDesignRepository;
    if (toolId === "game-configuration") return this.gameConfigurationRepository;
    if (toolId === "objects") return this.objectsRepository;
    if (toolId === "hitboxes") return this.hitboxesRepository;
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
    if (isGameHubToolId(toolId)) {
      return {
        GAME_WORKSPACE_MEMBER_ROLES,
        GAME_WORKSPACE_GAME_PURPOSES,
        GAME_WORKSPACE_GAME_STATUSES,
      };
    }
    if (toolId === "game-crew") {
      return {
        GAME_CREW_MEMBER_ROLES,
        GAME_CREW_TABLES,
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
    if (toolId === "hitboxes") {
      return {
        DEV_SAMPLE_OBJECTS: this.hitboxesRepository.DEV_SAMPLE_OBJECTS,
        HITBOXES_TOOL_TABLES: this.hitboxesRepository.HITBOXES_TOOL_TABLES,
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
        GAME_JOURNEY_RECOMMENDED_TARGETS,
        GAME_JOURNEY_SUGGESTED_TOOLS,
        GAME_JOURNEY_TOOL_OWNERSHIP_AREAS,
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
      throw new Error("Sign in required to save Game Hub project records through Local API.");
    }
    if (repository === this.gameConfigurationRepository && GAME_CONFIGURATION_SAVE_METHODS.has(methodName) && !this.sessionUserKey) {
      throw httpError("Sign in required to save Game Configuration through the API.", 401);
    }
    if (repository === this.gameCrewRepository && GAME_CREW_SAVE_METHODS.has(methodName) && !this.sessionUserKey) {
      throw httpError("Sign in required to save project crew membership through the API.", 401);
    }
    const serviceWriteMethods = repository?.writeMethods instanceof Set ? repository.writeMethods : null;
    const requiresAuthenticatedWrite = repository?.requiresAuthenticatedWrites === true
      && (serviceWriteMethods ? serviceWriteMethods.has(methodName) : repositoryMethodRequiresPersistence(methodName));
    if (requiresAuthenticatedWrite && !this.sessionUserKey) {
      const error = new Error(repository.authenticationRequiredMessage || "Sign in required to save product data through the API.");
      error.statusCode = 401;
      throw error;
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
    if (repository === this.gameWorkspaceRepository && methodName === "createGame") {
      const journeyBootstrap = this.gameJourneyRepository.bootstrapGameJourneyForGame(result);
      if (!journeyBootstrap || !Array.isArray(journeyBootstrap.buckets)) {
        throw repositoryMethodError("Game Journey bootstrap did not return starter bucket records. Restore the Local API/service contract.");
      }
      result.journeyBootstrap = journeyBootstrap;
    }
    const methodPersistsThroughToolStore =
      repository === this.gameJourneyRepository && GAME_JOURNEY_TOOL_STORE_METHODS.has(methodName);
    if (repositoryMethodRequiresPersistence(methodName) && repository?.usesDatabasePersistence !== true && !methodPersistsThroughToolStore) {
      if (repository === this.gameWorkspaceRepository) {
        await this.persistGameWorkspaceProviderState(`Persisting ${methodName} result`);
      } else if (repository === this.gameCrewRepository) {
        await this.persistGameCrewProviderState(`Persisting ${methodName} result`);
      } else if (repository === this.gameConfigurationRepository) {
        await this.persistGameConfigurationProviderState(`Persisting ${methodName} result`);
      } else if (repository === this.assetRepository) {
        await this.persistAssetProviderState(`Persisting ${methodName} result`);
      } else {
        await this.persistProductProviderState(`Persisting ${methodName} result`);
      }
    }
    return result;
  }

  async snapshot({ includePostgresCompletionMetrics = true } = {}) {
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
      ...gameCrewTables(this.gameCrewRepository),
      ...objectsTables(this.objectsRepository),
      ...hitboxesTables(this.hitboxesRepository),
      ...controlsTables(this.inputMappingRepository),
      ...(includePostgresCompletionMetrics ? await gameJourneyTables(this.gameJourneyRepository) : {}),
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
    const baseline = await this.snapshot();
    const schemas = getMockDbTableSchemas();
    const tableDiagnostics = Array.isArray(providerSnapshot.tableDiagnostics)
      ? providerSnapshot.tableDiagnostics
      : [];
    const tables = Object.fromEntries(Object.keys(schemas).map((tableName) => [
      tableName,
      Array.isArray(providerSnapshot.tables?.[tableName]) ? providerSnapshot.tables[tableName] : [],
    ]));
    return {
      cleared: false,
      databaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      diagnostics: {
        tableReadFailures: tableDiagnostics,
      },
      owners: baseline.owners,
      provider: {
        databaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
        source: "supabase-postgres",
      },
      schemas,
      source: "supabase-postgres",
      tableDiagnostics,
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
export function createLocalApiRouter({
  gameJourneyCompletionMetricsPostgresClient = null,
  messagesPostgresClient = null,
  messagesService = null,
  repoRoot = process.cwd(),
  supabasePostgresClient = null,
} = {}) {
  const dataSource = new ApiRuntimeDataSource({
    gameJourneyCompletionMetricsPostgresClient,
    messagesPostgresClient,
    messagesService,
    repoRoot,
    supabasePostgresClient,
  });

  async function handleApiRuntimeRequest(request, response, requestUrl) {
    if (!requestUrl.pathname.startsWith("/api/")) {
      return false;
    }

    let parts = [];
    try {
      applyApiCorsHeaders(response);
      parts = requestUrl.pathname.split("/").filter(Boolean);
      if (request.method === "OPTIONS") {
        sendNoContent(response);
        return true;
      }
      if (request.method === "GET" && await handleAdminNotesDirectoryApiRequest(requestUrl, response, { repoRoot })) {
        return true;
      }
      if (parts[1] === "runtime" && request.method === "GET" && parts[2] === "health") {
        ok(response, await dataSource.runtimeHealthJsonStatus());
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
          ok(response, dataSource.authStatus());
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

      if (parts[1] === "local-db") {
        if (request.method === "GET" && parts[2] === "snapshot") {
          ok(response, await dataSource.currentStateSnapshot());
          return true;
        }
        if (request.method === "POST" && parts[2] === "seed") {
          ok(response, await dataSource.resetStateSnapshot());
          return true;
        }
      }

      if (parts[1] === "dev" && parts[2] === "testing" && request.method === "POST" && parts[3] === "mock-db-state") {
        const body = await readRequestJson(request);
        dataSource.applyStateSnapshot(body.state);
        ok(response, await dataSource.currentStateSnapshot());
        return true;
      }

      if (parts[1] === "project-workspace" && request.method === "GET" && parts[2] === "projects") {
        ok(response, dataSource.projectWorkspaceProjectsForRoute());
        return true;
      }

      if (parts[1] === "game-journey" && parts[2] === "completion-metrics") {
        if (request.method === "GET") {
          ok(response, await dataSource.gameJourneyCompletionMetricsForRoute());
          return true;
        }
        if ((request.method === "POST" || request.method === "PATCH") && parts[3]) {
          const body = await readRequestJson(request);
          ok(response, await dataSource.updateGameJourneyCompletionMetricForRoute(parts[3], body));
          return true;
        }
      }

      if (parts[1] === "public" && request.method === "GET" && parts[2] === "config") {
        ok(response, dataSource.publicConfigForRoute(requestUrl));
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

      if (parts[1] === "admin" && parts[2] === "system-health" && request.method === "POST" && parts[3] === "storage-connectivity-action") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.adminSystemHealthStorageConnectivityAction(body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "system-health" && request.method === "POST" && parts[3] === "action") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.adminSystemHealthAction(body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "operations" && request.method === "GET" && parts[3] === "status") {
        ok(response, await dataSource.adminOperationsStatus());
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "operations" && request.method === "POST" && parts[3] === "action") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.runAdminOperationAction(body));
        return true;
      }

      if (parts[1] === "owner" && parts[2] === "memberships" && request.method === "GET" && parts[3] === "settings") {
        ok(response, await dataSource.ownerMembershipSettingsForRoute());
        return true;
      }

      if (parts[1] === "owner" && parts[2] === "memberships" && request.method === "POST" && parts[3] === "settings") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.updateOwnerMembershipSettingsForRoute(body));
        return true;
      }

      if (parts[1] === "owner" && parts[2] === "ai-credits" && request.method === "GET" && parts[3] === "settings") {
        ok(response, await dataSource.ownerAiCreditSettingsForRoute());
        return true;
      }

      if (parts[1] === "owner" && parts[2] === "ai-credits" && request.method === "POST" && parts[3] === "settings") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.updateOwnerAiCreditSettingsForRoute(body));
        return true;
      }

      if (parts[1] === "ai-credits" && request.method === "GET" && parts[2] === "display") {
        ok(response, await dataSource.aiCreditDisplayForRoute());
        return true;
      }

      if (parts[1] === "marketplace" && request.method === "GET" && parts[2] === "entitlements") {
        ok(response, await dataSource.marketplaceEntitlementsForRoute());
        return true;
      }

      if (parts[1] === "marketplace" && request.method === "GET" && parts[2] === "categories") {
        ok(response, dataSource.marketplaceCategoriesForRoute());
        return true;
      }

      if (parts[1] === "legal" && request.method === "GET" && parts[2] === "document") {
        ok(response, dataSource.legalDocumentForRoute(requestUrl));
        return true;
      }

      if (parts[1] === "memberships" && request.method === "GET" && parts[2] === "catalog") {
        ok(response, await dataSource.membershipsCatalogForRoute(requestUrl));
        return true;
      }

      if (parts[1] === "messages") {
        const body = request.method === "POST" ? await readRequestJson(request) : {};
        ok(response, await dataSource.messagesApiContract(request.method, parts.slice(2), body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "memberships" && request.method === "GET" && parts[3] === "active") {
        ok(response, await dataSource.adminActiveMembership(requestUrl));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "memberships" && request.method === "POST" && parts[3] === "assign") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.assignAdminMembership(body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "invitations" && request.method === "GET" && parts[3] === "list") {
        ok(response, await dataSource.adminInvitationsList());
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "invitations" && request.method === "POST" && parts[3] === "create") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.createAdminBetaInvitation(body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "invitations" && request.method === "POST" && parts[3] === "revoke") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.revokeAdminBetaInvitation(body));
        return true;
      }

      if (parts[1] === "admin" && parts[2] === "invitations" && request.method === "POST" && parts[3] === "expire") {
        const body = await readRequestJson(request);
        ok(response, await dataSource.expireAdminBetaInvitation(body));
        return true;
      }

      if (parts[1] === "invitations" && request.method === "POST" && parts[2] === "accept") {
        const body = await readRequestJson(request);
        ok(response, dataSource.acceptBetaInvitation(body));
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
      const responseError = errorForApiResponse(error, parts);
      fail(response, responseError?.statusCode || error?.statusCode || 500, responseError);
      return true;
    }
  }

  handleApiRuntimeRequest.close = () => dataSource.close();
  return handleApiRuntimeRequest;
}
