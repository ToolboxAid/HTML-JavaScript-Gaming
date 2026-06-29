import {
  getSampleToolLaunchDefinition,
  validateLaunchDefinitionAccess
} from "./toolLaunchSSoTData.js";
import LocalStorageService from '../../engine/persistence/LocalStorageService.js';
import SessionStorageService from '../../engine/persistence/SessionStorageService.js';
import { normalizeText } from "../string/strings.js";

const TOOLBOXAID_STORAGE_KEY_PREFIX = "toolboxaid.";

function normalizeSamplePresetPath(value) {
  const normalized = normalizeText(value).replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    return "";
  }
  if (normalized.startsWith("/archive/v1-v2/samples/") || normalized.startsWith("/archive/v1-v2/games/")) {
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

function clearStorageKeysByPrefix(storage, keyPrefix) {
  const keysToRemove = storage.entries().map(({ key }) => normalizeText(key))
    .filter((key) => {
      if (!key || !key.startsWith(keyPrefix)) {
        return false;
      }
      return true;
    });
  keysToRemove.forEach((key) => {
    storage.removeItem(key);
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
  return {
    href: "",
    error: `Workspace launch surface was removed; game "${normalizedGameId}" has no active workspace launch target.`
  };
}

export function clearExternalToolWorkspaceMemory() {
  if (typeof window === "undefined") {
    return false;
  }
  clearStorageKeysByPrefix(new LocalStorageService(), TOOLBOXAID_STORAGE_KEY_PREFIX);
  clearStorageKeysByPrefix(new SessionStorageService(), TOOLBOXAID_STORAGE_KEY_PREFIX);
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
