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
  MOCK_DB_KEYS,
  getMockDbTableSchemas,
} from "../persistence/mock-db-store.js";

const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SEED_SOURCE_DIRECTORY = path.join("docs_build", "database", "seed");
const DEV_SEED_AUDIT_USER_KEY = MOCK_DB_KEYS.users.admin;

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
      key: MOCK_DB_KEYS.users.user1,
      displayName: "User 1",
      email: "user1@example.invalid",
      authProvider: "dev-static-seed",
      authProviderUserId: "user-1",
      isActive: true,
      ...auditFields(1),
    },
    {
      key: MOCK_DB_KEYS.users.user2,
      displayName: "User 2",
      email: "user2@example.invalid",
      authProvider: "dev-static-seed",
      authProviderUserId: "user-2",
      isActive: true,
      ...auditFields(2),
    },
    {
      key: MOCK_DB_KEYS.users.user3,
      displayName: "User 3",
      email: "user3@example.invalid",
      authProvider: "dev-static-seed",
      authProviderUserId: "user-3",
      isActive: true,
      ...auditFields(3),
    },
    {
      key: MOCK_DB_KEYS.users.admin,
      displayName: "DavidQ admin",
      email: "admin@example.invalid",
      authProvider: "dev-static-seed",
      authProviderUserId: "davidq-admin",
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
      name: "User",
      description: "Standard creator user.",
      isSystemRole: false,
      isActive: true,
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
  ];
}

function userRoleRows(roles) {
  const roleBySlug = new Map(roles.map((role) => [role.roleSlug, role.key]));
  return [
    { key: MOCK_DB_KEYS.userRoles.user1User, userKey: MOCK_DB_KEYS.users.user1, roleKey: roleBySlug.get("user") },
    { key: MOCK_DB_KEYS.userRoles.user2User, userKey: MOCK_DB_KEYS.users.user2, roleKey: roleBySlug.get("user") },
    { key: MOCK_DB_KEYS.userRoles.user3User, userKey: MOCK_DB_KEYS.users.user3, roleKey: roleBySlug.get("user") },
    { key: MOCK_DB_KEYS.userRoles.adminUser, userKey: MOCK_DB_KEYS.users.admin, roleKey: roleBySlug.get("user") },
    { key: MOCK_DB_KEYS.userRoles.adminAdmin, userKey: MOCK_DB_KEYS.users.admin, roleKey: roleBySlug.get("admin") },
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

function humanToolStateSampleRows(generateKey) {
  const tools = activeToolRows();
  const toolByKey = new Map(tools.map((tool) => [tool.toolKey, tool]));
  const users = [
    { displayName: "User 1", toolKey: "game-journey", userKey: MOCK_DB_KEYS.users.user1 },
    { displayName: "User 2", toolKey: "palette", userKey: MOCK_DB_KEYS.users.user2 },
    { displayName: "User 3", toolKey: "asset", userKey: MOCK_DB_KEYS.users.user3 },
    { displayName: "DavidQ admin", toolKey: "game-workspace", userKey: MOCK_DB_KEYS.users.admin },
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
  tables.tool_state_samples = humanToolStateSampleRows(generateKey);
  return tables;
}
