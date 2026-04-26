import { getToolById } from "../toolRegistry.js";

const TOOLBOXAID_STORAGE_KEY_PREFIX = "toolboxaid.";
const WORKSPACE_MANAGER_ENTRY_POINT = "Workspace Manager/index.html";
const WORKSPACE_MANAGER_GAME_MOUNT_MODE = "game";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEntryPoint(value) {
  const normalized = normalizeText(value).replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    return "";
  }
  return normalized;
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

function buildToolHrefFromEntryPoint(entryPoint) {
  const normalizedEntryPoint = normalizeEntryPoint(entryPoint);
  if (!normalizedEntryPoint) {
    return "";
  }
  return `/tools/${encodeURI(normalizedEntryPoint)}`;
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

  const tool = getToolById(normalizedToolId);
  if (!tool) {
    return { href: "", error: `Tool "${normalizedToolId}" is not registered.` };
  }

  const baseHref = buildToolHrefFromEntryPoint(tool.entryPoint);
  if (!baseHref) {
    return { href: "", error: `Tool "${normalizedToolId}" is missing a valid entryPoint.` };
  }

  const sampleId = normalizeText(options.sampleId);
  if (!sampleId) {
    return { href: "", error: `Tool "${normalizedToolId}" launch is missing sampleId.` };
  }

  const samplePresetPath = normalizeSamplePresetPath(options.samplePresetPath);
  const href = appendQuery(baseHref, {
    sampleId,
    sampleTitle: options.sampleTitle,
    samplePresetPath
  });
  return { href, error: "" };
}

export function resolveGameWorkspaceLaunchHref(gameId) {
  const normalizedGameId = normalizeText(gameId);
  if (!normalizedGameId) {
    return { href: "", error: "gameId is required." };
  }

  const baseHref = buildToolHrefFromEntryPoint(WORKSPACE_MANAGER_ENTRY_POINT);
  if (!baseHref) {
    return { href: "", error: "Workspace Manager launch entryPoint is invalid." };
  }

  const href = appendQuery(baseHref, {
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
