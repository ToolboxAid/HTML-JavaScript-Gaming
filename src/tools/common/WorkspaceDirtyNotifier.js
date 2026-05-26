import { deepClone } from "../../shared/json/clone.js";
import { isPlainObject } from "../../shared/object/objects.js";

const WORKSPACE_TOOL_SESSION_KEY_PREFIX = "workspace.tools.";

function workspaceToolSessionKey(toolId) {
  return `${WORKSPACE_TOOL_SESSION_KEY_PREFIX}${toolId}`;
}

function readJson(sessionStorageRef, key) {
  const rawValue = sessionStorageRef?.getItem(key);
  if (!rawValue) {
    return { ok: false, message: `${key} was not found in sessionStorage.` };
  }
  try {
    const value = JSON.parse(rawValue);
    return isPlainObject(value)
      ? { ok: true, value }
      : { ok: false, message: `${key} must contain a JSON object.` };
  } catch (error) {
    return { ok: false, message: `${key} contains invalid JSON: ${error.message}` };
  }
}

function changedKeysForDirty(nextChangedKeys, previousDirty = {}) {
  return Array.from(new Set([
    ...(Array.isArray(previousDirty.changedKeys) ? previousDirty.changedKeys : []),
    ...(Array.isArray(nextChangedKeys) ? nextChangedKeys : ["data"])
  ]
    .map((key) => String(key || "").trim())
    .filter(Boolean)));
}

export function notifyWorkspaceToolDirty({
  changedKeys = ["data"],
  payload,
  reason = "tool-payload-updated",
  toolId,
  windowRef = window
} = {}) {
  const params = new URLSearchParams(windowRef.location?.search || "");
  if (params.get("launch") !== "workspace" || params.get("fromTool") !== "workspace-manager-v2") {
    return { ok: true, skipped: true, message: "Not launched from Workspace Manager V2." };
  }

  const normalizedToolId = String(toolId || "").trim();
  const hostContextId = String(params.get("hostContextId") || "").trim();
  if (!normalizedToolId) {
    return { ok: false, message: "Workspace dirty notification requires a tool id." };
  }
  if (!hostContextId) {
    return { ok: false, message: "Workspace dirty notification requires hostContextId." };
  }

  const sessionStorageRef = windowRef.sessionStorage;
  const sessionKey = workspaceToolSessionKey(normalizedToolId);
  const sessionResult = readJson(sessionStorageRef, sessionKey);
  if (!sessionResult.ok) {
    return sessionResult;
  }
  const session = sessionResult.value;
  if (!isPlainObject(session.schema)
    || !isPlainObject(session.workspace)
    || !Object.prototype.hasOwnProperty.call(session, "data")
    || !isPlainObject(session.dirty)) {
    return { ok: false, message: `${sessionKey} must use the normalized schema/workspace/data/dirty object shape.` };
  }
  if (session.workspace.source !== "workspace-manager-v2" || session.workspace.toolId !== normalizedToolId) {
    return { ok: false, message: `${sessionKey}.workspace must be for ${normalizedToolId}.` };
  }

  const nextData = deepClone(payload);
  if (JSON.stringify(session.data) === JSON.stringify(nextData)) {
    return { ok: true, changed: false, key: sessionKey, session: deepClone(session) };
  }

  const nextSession = {
    ...session,
    data: nextData,
    dirty: {
      isDirty: true,
      reason,
      changedAt: new Date().toISOString(),
      changedKeys: changedKeysForDirty(changedKeys, session.dirty)
    }
  };
  sessionStorageRef.setItem(sessionKey, JSON.stringify(nextSession));

  const contextResult = readJson(sessionStorageRef, hostContextId);
  if (contextResult.ok && isPlainObject(contextResult.value.tools)) {
    const nextContext = deepClone(contextResult.value);
    nextContext.tools[normalizedToolId] = deepClone(nextData);
    sessionStorageRef.setItem(hostContextId, JSON.stringify(nextContext));
  }

  return { ok: true, changed: true, key: sessionKey, session: deepClone(nextSession) };
}
