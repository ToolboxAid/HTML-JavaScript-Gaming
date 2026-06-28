import {
  requireServerApiData,
  safeRequestServerApi,
} from "../../src/api/server-api-client.js";

let registrySnapshot = null;
let registryDiagnostic = "";

export const TOOL_IMAGE_FALLBACK = "/assets/theme-v2/images/image-missing.svg";

function readToolRegistrySnapshot() {
  if (registrySnapshot) {
    return registrySnapshot;
  }

  try {
    registrySnapshot = requireServerApiData(
      safeRequestServerApi("/toolbox/registry/snapshot"),
      "Toolbox registry snapshot",
    );
    registryDiagnostic = "";
  } catch (error) {
    registryDiagnostic = error instanceof Error ? error.message : String(error || "Toolbox registry API unavailable.");
    registrySnapshot = null;
  }

  return registrySnapshot;
}

function requireToolRegistrySnapshot() {
  const snapshot = readToolRegistrySnapshot();
  if (!snapshot) {
    throw new Error(registryDiagnostic || "Toolbox registry snapshot unavailable. Restore the Browser -> Server API -> Data Source contract.");
  }
  return snapshot;
}

export function getToolRegistryApiDiagnostic() {
  readToolRegistrySnapshot();
  return registryDiagnostic;
}

export function getToolRegistry() {
  return requireToolRegistrySnapshot().tools.map((tool) => ({ ...tool }));
}

export function getActiveToolRegistry() {
  return requireToolRegistrySnapshot().activeTools.map((tool) => ({ ...tool }));
}

export function getToolboxContract() {
  const contract = requireToolRegistrySnapshot().toolboxContract || {};
  return JSON.parse(JSON.stringify(contract));
}

export function getToolProgressReadiness(status) {
  const snapshot = requireToolRegistrySnapshot();
  return snapshot.readinessByStatus?.[status] || "No";
}

export function getToolRoute(tool) {
  return tool?.route || "";
}

export function getToolImageSource(tool, kind) {
  return tool?.imageSources?.[kind] || TOOL_IMAGE_FALLBACK;
}

export function getToolImageDiagnostics(tool) {
  return Array.isArray(tool?.imageDiagnostics) ? [...tool.imageDiagnostics] : [];
}

export function toolRegistryMetadataDiagnostic(tool) {
  return tool?.statusDiagnostic || "";
}

export function getToolById(toolId) {
  const resolvedToolId = resolveToolIdAlias(toolId);
  return getToolRegistry().find((tool) => tool.id === resolvedToolId) || null;
}

export function getToolBySlug(toolSlug) {
  const normalizedToolSlug = typeof toolSlug === "string" ? toolSlug.trim() : "";
  if (!normalizedToolSlug) {
    return null;
  }
  return getToolRegistry().find((tool) => (
    tool.id === normalizedToolSlug
    || tool.path === normalizedToolSlug
    || tool.folderName === normalizedToolSlug
  )) || null;
}

export function resolveToolIdAlias(toolId) {
  return typeof toolId === "string" ? toolId.trim() : "";
}

function disabledToolTarget(label) {
  return {
    disabled: true,
    group: "",
    href: "",
    kind: "disabled",
    label,
  };
}

function resolvedToolTarget(tool) {
  const route = getToolRoute(tool);
  if (!route) {
    return disabledToolTarget(`${tool.displayName || tool.name || "Tool"} planned`);
  }
  return {
    disabled: false,
    group: "",
    href: route,
    kind: "tool",
    label: tool.displayName || tool.name,
  };
}

function toToolGroupSlug(groupName) {
  return String(groupName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function groupedToolTarget(groupName) {
  const groupSlug = toToolGroupSlug(groupName);
  return {
    disabled: !groupSlug,
    group: groupSlug,
    href: groupSlug ? `toolbox/index.html?view=group&group=${groupSlug}` : "",
    kind: "group",
    label: groupName ? `${groupName} Tools` : "Toolbox Group",
  };
}

function navigationCandidateIds(tool, direction, activeTools) {
  const configuredIds = tool?.navigation?.[`${direction}ToolIds`];
  if (Array.isArray(configuredIds) && configuredIds.length > 0) {
    return configuredIds;
  }

  const currentIndex = activeTools.findIndex((candidate) => candidate.id === tool.id);
  const adjacentIndex = direction === "previous" ? currentIndex - 1 : currentIndex + 1;
  return activeTools[adjacentIndex] ? [activeTools[adjacentIndex].id] : [];
}

function navigationTarget(tool, direction, activeTools) {
  const candidates = navigationCandidateIds(tool, direction, activeTools)
    .map((candidateId) => getToolById(candidateId))
    .filter(Boolean);

  if (candidates.length === 0) {
    return disabledToolTarget(direction === "previous" ? "No previous tool" : "No next tool");
  }

  if (candidates.length === 1) {
    return resolvedToolTarget(candidates[0]);
  }

  const configuredGroup = tool.navigation?.[`${direction}Group`];
  return groupedToolTarget(configuredGroup || candidates[0].category);
}

export function getToolNavigationTargets(toolSlug) {
  const tool = getToolBySlug(toolSlug);
  const activeTools = getActiveToolRegistry();
  if (!tool || !activeTools.some((candidate) => candidate.id === tool.id)) {
    return {
      next: disabledToolTarget("No next tool"),
      previous: disabledToolTarget("No previous tool"),
      tool: null,
    };
  }

  return {
    next: navigationTarget(tool, "next", activeTools),
    previous: navigationTarget(tool, "previous", activeTools),
    tool,
  };
}
