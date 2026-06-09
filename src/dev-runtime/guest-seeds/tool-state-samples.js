import {
  getActiveToolRegistry,
  getToolReleaseChannel,
  getToolReleaseChannelLabel,
  getToolRoute,
} from "./tool-metadata-inventory.js";
import {
  MOCK_DB_KEYS,
  getStandaloneMockDbSeedTables,
} from "../persistence/mock-db-store.js";

const HUMAN_SEED_USERS = Object.freeze([
  Object.freeze({ displayName: "User 1", toolKey: "project-journey", userKey: MOCK_DB_KEYS.users.user1 }),
  Object.freeze({ displayName: "User 2", toolKey: "palette", userKey: MOCK_DB_KEYS.users.user2 }),
  Object.freeze({ displayName: "User 3", toolKey: "asset", userKey: MOCK_DB_KEYS.users.user3 }),
  Object.freeze({ displayName: "DavidQ", toolKey: "workspace", userKey: MOCK_DB_KEYS.users.admin }),
]);

function activeToolSamplesByKey() {
  return getActiveToolRegistry().map((tool) => {
    const toolKey = tool.id || tool.key || tool.slug || tool.name || "tool";
    return {
      route: getToolRoute(tool) || "toolbox/index.html",
      toolKey,
      toolName: tool.name || tool.label || tool.title || toolKey,
    };
  });
}

function serverSeedUlid(sequence) {
  return `01K2GFSJ0Y${String(sequence).padStart(16, "0")}`;
}

function serverSeedAuditFields(offsetMinutes = 0, userKey = MOCK_DB_KEYS.users.forgeBot) {
  const timestamp = new Date(Date.now() + offsetMinutes * 60_000).toISOString();
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: userKey,
    updatedBy: userKey,
  };
}

function guestToolStateSampleRows() {
  return activeToolSamplesByKey().map((tool, index) => ({
    key: serverSeedUlid(7_001 + index),
    audience: "guest",
    userKey: "",
    displayName: "Guest",
    toolKey: tool.toolKey,
    toolName: tool.toolName,
    route: tool.route,
    projectKey: "",
    toolStateKey: serverSeedUlid(7_501 + index),
    manifestPath: "",
    sampleLabel: `Guest ${tool.toolName} starter`,
    sampleKind: "toolState",
    loadablePath: tool.route,
    toolStatePayload: {
      audience: "guest",
      loadable: true,
      toolKey: tool.toolKey,
    },
    ...serverSeedAuditFields(index, MOCK_DB_KEYS.users.forgeBot),
  }));
}

function humanToolStateSampleRows() {
  const availableTools = activeToolSamplesByKey();
  const toolSamples = new Map(availableTools.map((tool) => [tool.toolKey, tool]));
  return HUMAN_SEED_USERS.map((user, index) => {
    const tool = toolSamples.get(user.toolKey) || availableTools[index] || {
      route: "toolbox/index.html",
      toolKey: user.toolKey,
      toolName: user.toolKey,
    };
    const projectKey = serverSeedUlid(7_801 + index);
    const toolStateKey = serverSeedUlid(7_901 + index);
    return {
      key: serverSeedUlid(7_701 + index),
      audience: "user",
      userKey: user.userKey,
      displayName: user.displayName,
      toolKey: tool.toolKey,
      toolName: tool.toolName,
      route: tool.route,
      projectKey,
      toolStateKey,
      manifestPath: `local-seeds/${user.displayName.toLowerCase().replaceAll(" ", "-")}/${tool.toolKey}.manifest.json`,
      sampleLabel: `${user.displayName} ${tool.toolName} seed`,
      sampleKind: "toolState",
      loadablePath: `${tool.route}?toolState=${toolStateKey}`,
      toolStatePayload: {
        audience: "user",
        ownerUserKey: user.userKey,
        projectKey,
        toolKey: tool.toolKey,
        toolStateKey,
      },
      ...serverSeedAuditFields(30 + index, user.userKey),
    };
  });
}

function toolboxToolMetadataRows() {
  return getActiveToolRegistry()
    .map((tool, index) => {
      const releaseChannel = getToolReleaseChannel(tool);
      const toolKey = tool.id;
      return {
        key: serverSeedUlid(8_401 + index),
        toolKey,
        toolName: tool.displayName || tool.name || tool.id,
        shortLabel: tool.shortLabel || tool.displayName || tool.name || tool.id,
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
        requires: Array.isArray(tool.requires) ? [...tool.requires] : [],
        requiredForPlayable: tool.requiredForPlayable === true,
        requiredForTestable: tool.requiredForTestable === true,
        requiredForPublish: tool.requiredForPublish === true,
        progressChecklist: Array.isArray(tool.progressChecklist) ? [...tool.progressChecklist] : [],
        readiness: tool.readiness || "",
        statusDiagnostic: tool.statusDiagnostic || "",
        toolId: toolKey,
        releaseChannel,
        releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
        ...serverSeedAuditFields(60 + index, MOCK_DB_KEYS.users.forgeBot),
      };
    });
}

export function createServerSeedTables() {
  const tables = getStandaloneMockDbSeedTables();
  tables.toolbox_tool_metadata = toolboxToolMetadataRows();
  tables.toolbox_votes = [];
  tables.tool_state_samples = [
    ...guestToolStateSampleRows(),
    ...humanToolStateSampleRows(),
  ];
  return tables;
}
