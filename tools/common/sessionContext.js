const TOOL_HOST_CONTEXT_KEY_PREFIX = "toolboxaid.toolHost.context.";
const COMMON_SESSION_CONTEXT_SCHEMA = "tools.common.session-context/1";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createContextId(toolId = "palette-browser") {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${normalizeText(toolId) || "tool"}-${Date.now().toString(36)}-${suffix}`;
}

function getSessionStorage() {
  try {
    return globalThis.sessionStorage || null;
  } catch {
    return null;
  }
}

function safeParseJson(rawValue) {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return null;
  }
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function getLocationHref(locationLike = null) {
  if (typeof locationLike === "string") {
    return locationLike;
  }
  if (locationLike && typeof locationLike.href === "string") {
    return locationLike.href;
  }
  return typeof window !== "undefined" && window.location ? window.location.href : "";
}

function getSearchParams(locationLike = null) {
  const href = getLocationHref(locationLike);
  if (!href) {
    return new URLSearchParams();
  }
  try {
    return new URL(href).searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function buildStorageKey(contextId) {
  return `${TOOL_HOST_CONTEXT_KEY_PREFIX}${contextId}`;
}

function readStoredContext(contextId) {
  const normalizedContextId = normalizeText(contextId);
  const storage = getSessionStorage();
  if (!normalizedContextId || !storage) {
    return null;
  }
  return safeParseJson(storage.getItem(buildStorageKey(normalizedContextId)));
}

function extractPaletteJson(context) {
  if (!context || typeof context !== "object") {
    return null;
  }
  if (context.paletteJson && typeof context.paletteJson === "object" && !Array.isArray(context.paletteJson)) {
    return context.paletteJson;
  }
  const sharedContext = context.sharedContext && typeof context.sharedContext === "object"
    ? context.sharedContext
    : null;
  return sharedContext && sharedContext.paletteJson && typeof sharedContext.paletteJson === "object" && !Array.isArray(sharedContext.paletteJson)
    ? sharedContext.paletteJson
    : null;
}

function normalizeContextRecord(context, source = "session") {
  const normalized = context && typeof context === "object" ? context : null;
  const contextId = normalizeText(normalized?.contextId);
  return {
    found: Boolean(normalized),
    source,
    contextId,
    toolId: normalizeText(normalized?.toolId),
    schema: normalizeText(normalized?.schema),
    paletteJson: extractPaletteJson(normalized),
    rawContext: normalized
  };
}

function writePaletteSession(paletteJson, options = {}) {
  const storage = getSessionStorage();
  if (!storage) {
    return {
      found: false,
      source: "url",
      contextId: "",
      toolId: "palette-browser",
      schema: COMMON_SESSION_CONTEXT_SCHEMA,
      paletteJson: null,
      rawContext: null,
      errors: ["sessionStorage is not available"]
    };
  }

  const contextId = normalizeText(options.contextId) || createContextId(options.toolId);
  const context = {
    schema: COMMON_SESSION_CONTEXT_SCHEMA,
    contextId,
    toolId: normalizeText(options.toolId) || "palette-browser",
    source: normalizeText(options.source) || "tool-url",
    hosted: false,
    requestedAt: new Date().toISOString(),
    paletteJson
  };
  storage.setItem(buildStorageKey(contextId), JSON.stringify(context));
  return normalizeContextRecord(context, context.source);
}

function parsePaletteJsonParam(params) {
  const rawValue = params.get("paletteJson") || params.get("paletteData") || "";
  if (!rawValue.trim()) {
    return null;
  }
  return safeParseJson(rawValue);
}

async function fetchPaletteJsonFromUrl(params) {
  const paletteUrl = normalizeText(params.get("paletteUrl"));
  if (!paletteUrl) {
    return null;
  }
  const response = await fetch(paletteUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Palette URL request failed: ${response.status}`);
  }
  return response.json();
}

export function readSessionContextById(contextId) {
  return normalizeContextRecord(readStoredContext(contextId), "hostContextId");
}

export async function resolvePaletteSessionFromLocation(locationLike = null) {
  const params = getSearchParams(locationLike);
  const hostContextId = normalizeText(params.get("hostContextId"));
  if (hostContextId) {
    return readSessionContextById(hostContextId);
  }

  const inlinePalette = parsePaletteJsonParam(params);
  if (inlinePalette) {
    return writePaletteSession(inlinePalette, {
      contextId: normalizeText(params.get("sessionId")),
      source: "tool-url-paletteJson",
      toolId: "palette-browser"
    });
  }

  const fetchedPalette = await fetchPaletteJsonFromUrl(params);
  if (fetchedPalette) {
    return writePaletteSession(fetchedPalette, {
      contextId: normalizeText(params.get("sessionId")),
      source: "tool-url-paletteUrl",
      toolId: "palette-browser"
    });
  }

  return {
    found: false,
    source: "none",
    contextId: "",
    toolId: "palette-browser",
    schema: "",
    paletteJson: null,
    rawContext: null
  };
}
