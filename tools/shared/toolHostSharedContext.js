const TOOL_HOST_CONTEXT_KEY_PREFIX = "toolboxaid.toolHost.context.";

function getHostStorage() {
  try {
    if (globalThis.sessionStorage) {
      return globalThis.sessionStorage;
    }
  } catch {}

  try {
    if (globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {}

  return null;
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

function buildContextStorageKey(contextId) {
  return `${TOOL_HOST_CONTEXT_KEY_PREFIX}${contextId}`;
}

function createContextId(toolId = "") {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${toolId || "tool"}-${Date.now().toString(36)}-${suffix}`;
}

function sanitizeToolId(toolId) {
  return typeof toolId === "string" ? toolId.trim() : "";
}

export function createToolHostSharedContext(payload = {}) {
  const toolId = sanitizeToolId(payload.toolId);
  const source = typeof payload.source === "string" ? payload.source : "";
  const sharedContext = payload.sharedContext && typeof payload.sharedContext === "object" ? payload.sharedContext : {};
  const contextId = typeof payload.contextId === "string" && payload.contextId.trim()
    ? payload.contextId.trim()
    : createContextId(toolId);

  return {
    schema: "tools.tool-host-context/1",
    contextId,
    toolId,
    source,
    hosted: true,
    requestedAt: typeof payload.requestedAt === "string" ? payload.requestedAt : new Date().toISOString(),
    sharedContext: { ...sharedContext },
    state: payload.state === undefined ? null : payload.state
  };
}

export function writeToolHostSharedContext(payload = {}) {
  const storage = getHostStorage();
  if (!storage) {
    return null;
  }

  const context = createToolHostSharedContext(payload);
  storage.setItem(buildContextStorageKey(context.contextId), JSON.stringify(context));
  return context;
}

export function readToolHostSharedContextById(contextId) {
  const normalized = typeof contextId === "string" ? contextId.trim() : "";
  if (!normalized) {
    return null;
  }

  const storage = getHostStorage();
  if (!storage) {
    return null;
  }

  return safeParseJson(storage.getItem(buildContextStorageKey(normalized)));
}

export function removeToolHostSharedContextById(contextId) {
  const normalized = typeof contextId === "string" ? contextId.trim() : "";
  if (!normalized) {
    return false;
  }

  const storage = getHostStorage();
  if (!storage) {
    return false;
  }

  storage.removeItem(buildContextStorageKey(normalized));
  return true;
}

export function readToolHostSharedContextFromLocation(locationLike = null) {
  const rawHref = typeof locationLike === "string"
    ? locationLike
    : (locationLike && typeof locationLike.href === "string" ? locationLike.href : (typeof window !== "undefined" ? window.location.href : ""));

  if (!rawHref) {
    return null;
  }

  let params = null;
  try {
    params = new URL(rawHref).searchParams;
  } catch {
    return null;
  }

  const contextId = params.get("hostContextId") || "";
  if (!contextId) {
    return null;
  }

  return readToolHostSharedContextById(contextId);
}
