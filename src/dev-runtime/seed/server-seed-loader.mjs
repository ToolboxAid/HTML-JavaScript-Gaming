import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  getActiveToolRegistry,
  getToolReleaseChannel,
  getToolReleaseChannelLabel,
  getToolRoute,
} from "../guest-seeds/tool-metadata-inventory.js";
import {
  getMockDbTableSchemas,
} from "../persistence/mock-db-store.js";
import { SEED_DB_KEYS } from "./seed-db-keys.mjs";

const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SEED_SOURCE_DIRECTORY = path.join("docs_build", "database", "seed");
const DEV_SEED_AUDIT_USER_KEY = SEED_DB_KEYS.users.admin;

function encodeBase32(value, length) {
  let remaining = BigInt(value);
  let encoded = "";
  for (let index = 0; index < length; index += 1) {
    encoded = ULID_ALPHABET[Number(remaining % 32n)] + encoded;
    remaining /= 32n;
  }
  return encoded;
}

function randomBase32(length) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => ULID_ALPHABET[byte % 32]).join("");
}

function createServerUlidFactory() {
  const usedKeys = new Set();
  return function serverGeneratedUlid() {
    let key = "";
    do {
      key = `${encodeBase32(Date.now(), 10)}${randomBase32(16)}`;
    } while (usedKeys.has(key));
    usedKeys.add(key);
    return key;
  };
}

function timestamp(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

function auditFields(offsetMinutes = 0, userKey = DEV_SEED_AUDIT_USER_KEY) {
  const value = timestamp(offsetMinutes);
  return {
    createdAt: value,
    updatedAt: value,
    createdBy: userKey,
    updatedBy: userKey,
  };
}

function activeToolRows() {
  return getActiveToolRegistry().map((tool) => {
    const toolKey = tool.id || tool.key || tool.slug || tool.name || "tool";
    return {
      route: getToolRoute(tool) || "toolbox/index.html",
      tool,
      toolKey,
      toolName: tool.displayName || tool.name || tool.label || tool.title || toolKey,
    };
  });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readGroupedSeedManifests(rootDirectory = process.cwd()) {
  const seedDirectory = path.join(rootDirectory, SEED_SOURCE_DIRECTORY);
  return readdirSync(seedDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => {
      const filePath = path.join(seedDirectory, fileName);
      return {
        ...readJson(filePath),
        source: path.join(SEED_SOURCE_DIRECTORY, fileName).replaceAll(path.sep, "/"),
      };
    });
}

function emptyTables() {
  return Object.fromEntries(
    Object.keys(getMockDbTableSchemas()).map((tableName) => [tableName, []]),
  );
}

function userRows() {
  return [
    {
      key: SEED_DB_KEYS.users.user1,
      displayName: "User 1",
      email: "user1@example.invalid",
      authProvider: "supabase-auth",
      authProviderUserId: "user-1",
      isActive: true,
      ...auditFields(1),
    },
    {
      key: SEED_DB_KEYS.users.user2,
      displayName: "User 2",
      email: "user2@example.invalid",
      authProvider: "supabase-auth",
      authProviderUserId: "user-2",
      isActive: true,
      ...auditFields(2),
    },
    {
      key: SEED_DB_KEYS.users.user3,
      displayName: "User 3",
      email: "user3@example.invalid",
      authProvider: "supabase-auth",
      authProviderUserId: "user-3",
      isActive: true,
      ...auditFields(3),
    },
    {
      key: SEED_DB_KEYS.users.admin,
      displayName: "DavidQ",
      email: "qbytes.dq@gmail.com",
      authProvider: "supabase-auth",
      authProviderUserId: "davidq",
      isActive: true,
      ...auditFields(4),
    },
  ];
}

function roleRows(generateKey) {
  return [
    {
      key: generateKey(),
      roleSlug: "user",
      name: "Deprecated User",
      description: "Deprecated compatibility role. Authenticated accounts use creator.",
      isSystemRole: false,
      isActive: false,
      ...auditFields(5),
    },
    {
      key: generateKey(),
      roleSlug: "admin",
      name: "Admin",
      description: "Administrative user.",
      isSystemRole: false,
      isActive: true,
      ...auditFields(6),
    },
    {
      key: generateKey(),
      roleSlug: "creator",
      name: "Creator",
      description: "Authenticated game creator.",
      isSystemRole: false,
      isActive: true,
      ...auditFields(7),
    },
    {
      key: generateKey(),
      roleSlug: "guest",
      name: "Guest",
      description: "Unauthenticated visitor and starter flow role.",
      isSystemRole: false,
      isActive: true,
      ...auditFields(8),
    },
  ];
}

function userRoleRows(roles) {
  const roleBySlug = new Map(roles.map((role) => [role.roleSlug, role.key]));
  return [
    { key: SEED_DB_KEYS.userRoles.user1User, userKey: SEED_DB_KEYS.users.user1, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.user2User, userKey: SEED_DB_KEYS.users.user2, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.user3User, userKey: SEED_DB_KEYS.users.user3, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.adminUser, userKey: SEED_DB_KEYS.users.admin, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.adminAdmin, userKey: SEED_DB_KEYS.users.admin, roleKey: roleBySlug.get("admin") },
  ].map((row, index) => ({
    ...row,
    ...auditFields(10 + index),
  }));
}

function toolboxToolMetadataRows(generateKey) {
  return activeToolRows().map(({ tool, toolKey, toolName }, index) => {
    const releaseChannel = getToolReleaseChannel(tool);
    return {
      key: generateKey(),
      toolKey,
      toolName,
      shortLabel: tool.shortLabel || toolName,
      shortDescription: tool.shortDescription || tool.description || "",
      description: tool.description || tool.shortDescription || "",
      group: tool.category || "Platform",
      category: tool.category || "Platform",
      colorGroup: tool.colorGroup || "",
      toolboxGroup: tool.toolboxGroup || "",
      subgroup: tool.subgroup || "",
      path: getToolRoute(tool) || "",
      order: Math.max(1, Math.round(Number(tool.order) || index + 1)),
      status: releaseChannel,
      badge: tool.badge || "",
      toolImage: tool.tool || "",
      active: tool.active !== false,
      adminOnly: tool.adminOnly === true,
      hidden: tool.hidden === true,
      deferred: tool.deferred === true,
      visibleInToolsList: tool.visibleInToolsList === true,
      capabilityLabel: tool.capabilityLabel || "",
      childCapabilities: Array.isArray(tool.childCapabilities) ? [...tool.childCapabilities] : [],
      requiredRole: typeof tool.requiredRole === "string" ? tool.requiredRole : "",
      statusDiagnostic: tool.statusDiagnostic || "",
      toolId: toolKey,
      releaseChannel,
      releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
      ...auditFields(60 + index),
    };
  });
}

function toolboxToolPlanningRows(generateKey) {
  return activeToolRows().map(({ tool, toolKey }, index) => ({
    key: generateKey(),
    toolKey,
    readiness: tool.readiness || "",
    requiredForPlayable: tool.requiredForPlayable === true,
    requiredForTestable: tool.requiredForTestable === true,
    requiredForPublish: tool.requiredForPublish === true,
    requires: Array.isArray(tool.requires) ? [...tool.requires] : [],
    progressChecklist: Array.isArray(tool.progressChecklist) ? [...tool.progressChecklist] : [],
    ...auditFields(90 + index),
  }));
}

function platformSettingRows(generateKey) {
  return [
    {
      key: generateKey(),
      settingKey: "site.setup.status",
      settingValue: "ready",
      settingType: "string",
      description: "Starter Site Setup status setting owned by Admin setup.",
      isActive: true,
      ...auditFields(120),
    },
    {
      key: generateKey(),
      settingKey: "platform.banner.enabled",
      settingValue: "false",
      settingType: "boolean",
      description: "Controls whether the platform banner renders.",
      isActive: true,
      ...auditFields(121),
    },
    {
      key: generateKey(),
      settingKey: "platform.banner.message",
      settingValue: "",
      settingType: "string",
      description: "Platform banner message text.",
      isActive: true,
      ...auditFields(122),
    },
    {
      key: generateKey(),
      settingKey: "platform.banner.tone",
      settingValue: "info",
      settingType: "string",
      description: "Platform banner visual tone.",
      isActive: true,
      ...auditFields(123),
    },
    {
      key: generateKey(),
      settingKey: "platform.banner.kind",
      settingValue: "general",
      settingType: "string",
      description: "Platform banner notice kind.",
      isActive: true,
      ...auditFields(124),
    },
  ];
}

function supportCategoryRows(generateKey) {
  return [
    {
      key: generateKey(),
      categorySlug: "general-help",
      name: "General Help",
      description: "Starter support category for creator questions.",
      isActive: true,
      sortOrder: 1,
      ...auditFields(130),
    },
  ];
}

function humanToolStateSampleRows(generateKey) {
  const tools = activeToolRows();
  const toolByKey = new Map(tools.map((tool) => [tool.toolKey, tool]));
  const users = [
    { displayName: "User 1", toolKey: "game-journey", userKey: SEED_DB_KEYS.users.user1 },
    { displayName: "User 2", toolKey: "palette", userKey: SEED_DB_KEYS.users.user2 },
    { displayName: "User 3", toolKey: "asset", userKey: SEED_DB_KEYS.users.user3 },
    { displayName: "DavidQ", toolKey: "game-workspace", userKey: SEED_DB_KEYS.users.admin },
  ];
  return users.map((user, index) => {
    const tool = toolByKey.get(user.toolKey) || tools[index] || {
      route: "toolbox/index.html",
      toolKey: user.toolKey,
      toolName: user.toolKey,
    };
    const gameKey = generateKey();
    const toolStateKey = generateKey();
    return {
      key: generateKey(),
      audience: "user",
      userKey: user.userKey,
      displayName: user.displayName,
      toolKey: tool.toolKey,
      toolName: tool.toolName,
      route: tool.route,
      gameKey,
      toolStateKey,
      manifestPath: `local-seeds/${user.displayName.toLowerCase().replaceAll(" ", "-")}/${tool.toolKey}.manifest.json`,
      sampleLabel: `${user.displayName} ${tool.toolName} seed`,
      sampleKind: "toolState",
      loadablePath: `${tool.route}?toolState=${toolStateKey}`,
      toolStatePayload: {
        audience: "user",
        ownerUserKey: user.userKey,
        gameKey,
        toolKey: tool.toolKey,
        toolStateKey,
      },
      ...auditFields(30 + index, user.userKey),
    };
  });
}

export function createServerSeedTables(options = {}) {
  const generateKey = options.generateKey || createServerUlidFactory();
  readGroupedSeedManifests(options.rootDirectory || process.cwd());
  const tables = emptyTables();
  const roles = roleRows(generateKey);
  tables.users = userRows();
  tables.roles = roles;
  tables.user_roles = userRoleRows(roles);
  tables.toolbox_tool_metadata = toolboxToolMetadataRows(generateKey);
  tables.toolbox_tool_planning = toolboxToolPlanningRows(generateKey);
  tables.toolbox_votes = [];
  tables.platform_settings = platformSettingRows(generateKey);
  tables.support_categories = supportCategoryRows(generateKey);
  tables.tool_state_samples = humanToolStateSampleRows(generateKey);
  return tables;
}
