import { getActiveToolRegistry } from "../../../www/toolbox/tool-registry-api-client.js";
import { normalizeText, normalizeToken } from "../string/strings.js";

const ALLOWED_LAUNCH_SOURCES = Object.freeze(["samples", "games", "tools", "workspace", "internal"]);
const ALLOWED_LAUNCH_TYPES = Object.freeze(["sample-to-tool", "game-to-workspace", "tool-internal", "workspace-internal"]);
const SAMPLE_TOOL_LAUNCH_SOURCES = Object.freeze(["samples", "tools", "workspace", "internal"]);
const SAMPLE_TOOL_LAUNCH_TYPES = Object.freeze(["sample-to-tool", "tool-internal", "workspace-internal"]);

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
  return `/toolbox/${encodeURI(normalizedEntryPoint)}`;
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
  const displayName = normalizeText(tool?.displayName);
  const targetPath = buildTargetPathFromEntryPoint(tool?.entryPoint);
  return {
    launchId: safeToolId ? `tool.${safeToolId}` : "",
    displayName,
    targetPath,
    allowedLaunchSources: [...SAMPLE_TOOL_LAUNCH_SOURCES],
    allowedLaunchTypes: [...SAMPLE_TOOL_LAUNCH_TYPES]
  };
}

function findActiveVisibleToolById(toolId) {
  const normalizedToolId = normalizeToken(toolId);
  if (!normalizedToolId) {
    return null;
  }
  const activeVisibleTools = getActiveToolRegistry().filter((tool) => tool.visibleInToolsList === true);
  return activeVisibleTools.find((tool) => normalizeToken(tool.id) === normalizedToolId) || null;
}

export function listToolLaunchIds() {
  return getActiveToolRegistry()
    .filter((tool) => tool.visibleInToolsList === true)
    .map((tool) => normalizeText(tool.id))
    .filter(Boolean)
    .map((toolId) => `tool.${toolId}`);
}

export function getSampleToolLaunchDefinition(toolId) {
  const normalizedToolId = normalizeText(toolId);
  if (!normalizedToolId) {
    return { launchDefinition: null, error: "toolId is required." };
  }

  const tool = findActiveVisibleToolById(normalizedToolId);
  if (!tool) {
    return { launchDefinition: null, error: `Tool "${normalizedToolId}" is not available in launch SSoT.` };
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
