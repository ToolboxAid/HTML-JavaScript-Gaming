import { getActiveToolRegistry, getToolById } from "../toolRegistry.js";

const ALLOWED_LAUNCH_SOURCES = Object.freeze(["samples", "games", "tools", "workspace", "internal"]);
const ALLOWED_LAUNCH_TYPES = Object.freeze(["sample-to-tool", "game-to-workspace", "tool-internal", "workspace-internal"]);
const SAMPLE_TOOL_LAUNCH_SOURCES = Object.freeze(["samples", "tools", "workspace", "internal"]);
const SAMPLE_TOOL_LAUNCH_TYPES = Object.freeze(["sample-to-tool", "tool-internal", "workspace-internal"]);
const WORKSPACE_MANAGER_GAME_LAUNCH_ID = "workspace-manager.game-to-workspace";
const WORKSPACE_MANAGER_GAME_DISPLAY_NAME = "Workspace Manager";
const WORKSPACE_MANAGER_ENTRY_POINT = "Workspace Manager/index.html";
const WORKSPACE_MANAGER_GAME_LAUNCH_SOURCES = Object.freeze(["games", "workspace", "internal"]);
const WORKSPACE_MANAGER_GAME_LAUNCH_TYPES = Object.freeze(["game-to-workspace", "workspace-internal"]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeEntryPoint(value) {
  const normalized = normalizeText(value).replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    return "";
  }
  return normalized;
}

function buildTargetPathFromEntryPoint(entryPoint) {
  const normalizedEntryPoint = normalizeEntryPoint(entryPoint);
  if (!normalizedEntryPoint) {
    return "";
  }
  return `/tools/${encodeURI(normalizedEntryPoint)}`;
}

function cloneLaunchDefinition(definition) {
  if (!definition || typeof definition !== "object") {
    return null;
  }
  return {
    launchId: normalizeText(definition.launchId),
    displayName: normalizeText(definition.displayName),
    targetPath: normalizeText(definition.targetPath),
    allowedLaunchSources: Array.isArray(definition.allowedLaunchSources) ? definition.allowedLaunchSources.map((value) => normalizeToken(value)).filter(Boolean) : [],
    allowedLaunchTypes: Array.isArray(definition.allowedLaunchTypes) ? definition.allowedLaunchTypes.map((value) => normalizeToken(value)).filter(Boolean) : []
  };
}

function createSampleToolLaunchDefinition(tool) {
  const safeToolId = normalizeText(tool?.id);
  const displayName = normalizeText(tool?.displayName) || normalizeText(tool?.name) || safeToolId;
  const targetPath = buildTargetPathFromEntryPoint(tool?.entryPoint);
  return {
    launchId: safeToolId ? `tool.${safeToolId}` : "",
    displayName,
    targetPath,
    allowedLaunchSources: [...SAMPLE_TOOL_LAUNCH_SOURCES],
    allowedLaunchTypes: [...SAMPLE_TOOL_LAUNCH_TYPES]
  };
}

function createWorkspaceManagerGameLaunchDefinition() {
  return {
    launchId: WORKSPACE_MANAGER_GAME_LAUNCH_ID,
    displayName: WORKSPACE_MANAGER_GAME_DISPLAY_NAME,
    targetPath: buildTargetPathFromEntryPoint(WORKSPACE_MANAGER_ENTRY_POINT),
    allowedLaunchSources: [...WORKSPACE_MANAGER_GAME_LAUNCH_SOURCES],
    allowedLaunchTypes: [...WORKSPACE_MANAGER_GAME_LAUNCH_TYPES]
  };
}

export function listToolLaunchIds() {
  const toolLaunchIds = getActiveToolRegistry()
    .filter((tool) => tool.visibleInToolsList === true)
    .map((tool) => normalizeText(tool.id))
    .filter(Boolean)
    .map((toolId) => `tool.${toolId}`);
  return [...toolLaunchIds, WORKSPACE_MANAGER_GAME_LAUNCH_ID];
}

export function getSampleToolLaunchDefinition(toolId) {
  const normalizedToolId = normalizeText(toolId);
  if (!normalizedToolId) {
    return { launchDefinition: null, error: "toolId is required." };
  }

  const tool = getToolById(normalizedToolId);
  if (!tool) {
    return { launchDefinition: null, error: `Tool "${normalizedToolId}" is not registered.` };
  }

  const launchDefinition = createSampleToolLaunchDefinition(tool);
  if (!launchDefinition.launchId) {
    return { launchDefinition: null, error: `Tool "${normalizedToolId}" launch id is missing in SSoT.` };
  }
  if (!launchDefinition.displayName) {
    return { launchDefinition: null, error: `Tool "${normalizedToolId}" displayName is missing in SSoT.` };
  }
  if (!launchDefinition.targetPath) {
    return { launchDefinition: null, error: `Tool "${normalizedToolId}" target path is missing in SSoT.` };
  }

  return { launchDefinition, error: "" };
}

export function getWorkspaceManagerGameLaunchDefinition() {
  const launchDefinition = createWorkspaceManagerGameLaunchDefinition();
  if (!launchDefinition.launchId) {
    return { launchDefinition: null, error: "Workspace Manager launch id is missing in SSoT." };
  }
  if (!launchDefinition.displayName) {
    return { launchDefinition: null, error: "Workspace Manager displayName is missing in SSoT." };
  }
  if (!launchDefinition.targetPath) {
    return { launchDefinition: null, error: "Workspace Manager target path is missing in SSoT." };
  }
  return { launchDefinition, error: "" };
}

export function validateLaunchDefinitionAccess(launchDefinition, launchSource, launchType) {
  const safeLaunchDefinition = cloneLaunchDefinition(launchDefinition);
  if (!safeLaunchDefinition) {
    return "launchDefinition is required.";
  }
  const normalizedSource = normalizeToken(launchSource);
  if (!normalizedSource) {
    return `Launch "${safeLaunchDefinition.launchId || "unknown"}" is missing launchSource.`;
  }
  if (!ALLOWED_LAUNCH_SOURCES.includes(normalizedSource)) {
    return `Launch "${safeLaunchDefinition.launchId || "unknown"}" has invalid launchSource "${normalizedSource}".`;
  }
  const normalizedType = normalizeToken(launchType);
  if (!normalizedType) {
    return `Launch "${safeLaunchDefinition.launchId || "unknown"}" is missing launchType.`;
  }
  if (!ALLOWED_LAUNCH_TYPES.includes(normalizedType)) {
    return `Launch "${safeLaunchDefinition.launchId || "unknown"}" has invalid launchType "${normalizedType}".`;
  }
  if (!safeLaunchDefinition.allowedLaunchSources.includes(normalizedSource)) {
    return `Launch "${safeLaunchDefinition.launchId || "unknown"}" does not allow source "${normalizedSource}".`;
  }
  if (!safeLaunchDefinition.allowedLaunchTypes.includes(normalizedType)) {
    return `Launch "${safeLaunchDefinition.launchId || "unknown"}" does not allow type "${normalizedType}".`;
  }
  return "";
}

