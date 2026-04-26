import {
  getSampleToolLaunchDefinition,
  getWorkspaceManagerGameLaunchDefinition,
  validateLaunchDefinitionAccess
} from "./toolLaunchSSoTData.js";

const TOOLBOXAID_STORAGE_KEY_PREFIX = "toolboxaid.";
const WORKSPACE_MANAGER_GAME_MOUNT_MODE = "game";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSamplePresetPath(value) {
  const normalized = normalizeText(value).replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    return "";
  }
  if (normalized.startsWith("/samples/") || normalized.startsWith("/games/")) {
    return normalized;
  }
  return "";
}

function appendQuery(baseHref, queryValues) {
  if (!baseHref || !queryValues || typeof queryValues !== "object") {
    return baseHref;
  }
  const params = new URLSearchParams();
  Object.entries(queryValues).forEach(([key, value]) => {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) {
      return;
    }
    params.set(key, normalizedValue);
  });
  const queryString = params.toString();
  return queryString ? `${baseHref}?${queryString}` : baseHref;
}

function clearStorageKeysByPrefix(storageLike, keyPrefix) {
  if (!storageLike || typeof storageLike.length !== "number") {
    return;
  }
  const keysToRemove = [];
  for (let index = 0; index < storageLike.length; index += 1) {
    const key = normalizeText(storageLike.key(index));
    if (!key || !key.startsWith(keyPrefix)) {
      continue;
    }
    keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => {
    try {
      storageLike.removeItem(key);
    } catch {
      // Ignore storage errors to preserve launch navigation.
    }
  });
}

export function resolveSampleToolLaunchHref(toolId, options = {}) {
  const normalizedToolId = normalizeText(toolId);
  if (!normalizedToolId) {
    return { href: "", error: "toolId is required." };
  }

  const launchDefinitionResult = getSampleToolLaunchDefinition(normalizedToolId);
  if (!launchDefinitionResult.launchDefinition) {
    return { href: "", error: launchDefinitionResult.error || `Tool "${normalizedToolId}" launch metadata is missing in SSoT.` };
  }
  const accessError = validateLaunchDefinitionAccess(
    launchDefinitionResult.launchDefinition,
    options.launchSource,
    options.launchType
  );
  if (accessError) {
    return { href: "", error: accessError };
  }

  const sampleId = normalizeText(options.sampleId);
  if (!sampleId) {
    return { href: "", error: `Tool "${normalizedToolId}" launch is missing sampleId.` };
  }

  const samplePresetPath = normalizeSamplePresetPath(options.samplePresetPath);
  const href = appendQuery(launchDefinitionResult.launchDefinition.targetPath, {
    sampleId,
    sampleTitle: options.sampleTitle,
    samplePresetPath
  });
  return { href, error: "" };
}

export function resolveGameWorkspaceLaunchHref(gameId, options = {}) {
  const normalizedGameId = normalizeText(gameId);
  if (!normalizedGameId) {
    return { href: "", error: "gameId is required." };
  }

  const launchDefinitionResult = getWorkspaceManagerGameLaunchDefinition();
  if (!launchDefinitionResult.launchDefinition) {
    return { href: "", error: launchDefinitionResult.error || "Workspace Manager launch metadata is missing in SSoT." };
  }
  const accessError = validateLaunchDefinitionAccess(
    launchDefinitionResult.launchDefinition,
    options.launchSource,
    options.launchType
  );
  if (accessError) {
    return { href: "", error: accessError };
  }

  const href = appendQuery(launchDefinitionResult.launchDefinition.targetPath, {
    gameId: normalizedGameId,
    mount: WORKSPACE_MANAGER_GAME_MOUNT_MODE
  });
  return { href, error: "" };
}

export function clearExternalToolWorkspaceMemory() {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    clearStorageKeysByPrefix(window.localStorage, TOOLBOXAID_STORAGE_KEY_PREFIX);
  } catch {
    // Ignore storage access errors.
  }
  try {
    clearStorageKeysByPrefix(window.sessionStorage, TOOLBOXAID_STORAGE_KEY_PREFIX);
  } catch {
    // Ignore storage access errors.
  }
  return true;
}

export function launchWithExternalToolWorkspaceReset(href) {
  const normalizedHref = normalizeText(href);
  if (!normalizedHref || typeof window === "undefined" || !window.location) {
    return false;
  }
  clearExternalToolWorkspaceMemory();
  window.location.assign(normalizedHref);
  return true;
}
