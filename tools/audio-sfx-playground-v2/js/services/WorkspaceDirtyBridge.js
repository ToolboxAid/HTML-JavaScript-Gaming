const TOOL_ID = "audio-sfx-playground-v2";
const TOOL_SCHEMA_PATH = "tools/schemas/tools/audio-sfx-playground-v2.schema.json";
const WORKSPACE_TOOL_SESSION_KEY = `workspace.tools.${TOOL_ID}`;

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function toolStateFromPayload(payload) {
  return {
    $schema: TOOL_SCHEMA_PATH,
    schema: "html-js-gaming.tool-state",
    version: 1,
    toolId: TOOL_ID,
    payload
  };
}

function uniqueChangedKeys(changedKeys, existingChangedKeys = []) {
  return Array.from(new Set([
    ...existingChangedKeys.filter((key) => typeof key === "string" && key.trim()),
    ...changedKeys.filter((key) => typeof key === "string" && key.trim())
  ]));
}

export class WorkspaceDirtyBridge {
  constructor({ serializer, windowRef = window }) {
    this.serializer = serializer;
    this.window = windowRef;
  }

  isWorkspaceLaunch() {
    const params = new URLSearchParams(this.window.location?.search || "");
    return params.get("launch") === "workspace" && params.get("fromTool") === "workspace-manager-v2";
  }

  readSession() {
    if (!this.isWorkspaceLaunch()) {
      return { ok: true, skipped: true, message: "Not launched from Workspace V2." };
    }
    const rawSession = this.window.sessionStorage?.getItem(WORKSPACE_TOOL_SESSION_KEY);
    if (!rawSession) {
      return { ok: false, message: `Workspace session is missing: ${WORKSPACE_TOOL_SESSION_KEY}.` };
    }
    try {
      const session = JSON.parse(rawSession);
      if (!isPlainObject(session)) {
        return { ok: false, message: "Workspace session must be an object." };
      }
      return { ok: true, session };
    } catch (error) {
      return { ok: false, message: `Workspace session JSON is invalid: ${error.message}` };
    }
  }

  readPayload() {
    const sessionResult = this.readSession();
    if (!sessionResult.ok || sessionResult.skipped) {
      return sessionResult;
    }
    if (sessionResult.session.data === null || typeof sessionResult.session.data === "undefined") {
      return { ok: true, skipped: true, message: "Workspace session has no Audio / SFX payload yet." };
    }
    if (!isPlainObject(sessionResult.session.data)) {
      return { ok: false, message: "Workspace Audio / SFX payload must be an object." };
    }
    const validation = this.serializer.readToolState(toolStateFromPayload(sessionResult.session.data));
    return validation.valid
      ? { ok: true, value: validation.value }
      : { ok: false, message: validation.message };
  }

  syncToolState(toolState, { reason = "audio-sfx-edited", changedKeys = ["data.sounds"] } = {}) {
    const sessionResult = this.readSession();
    if (!sessionResult.ok || sessionResult.skipped) {
      return sessionResult;
    }
    const validation = this.serializer.readToolState(toolState);
    if (!validation.valid) {
      return { ok: false, message: validation.message };
    }
    const payload = cloneJson(toolState.payload);
    const session = sessionResult.session;
    if (JSON.stringify(session.data) === JSON.stringify(payload)) {
      return { ok: true, changed: false, message: "Workspace Audio / SFX payload is already current." };
    }
    const dirty = isPlainObject(session.dirty) ? session.dirty : {};
    const nextSession = {
      ...session,
      data: payload,
      dirty: {
        isDirty: true,
        reason,
        changedAt: new Date().toISOString(),
        changedKeys: uniqueChangedKeys(changedKeys, Array.isArray(dirty.changedKeys) ? dirty.changedKeys : [])
      }
    };
    this.window.sessionStorage.setItem(WORKSPACE_TOOL_SESSION_KEY, JSON.stringify(nextSession));
    return {
      ok: true,
      changed: true,
      reason: nextSession.dirty.reason,
      changedKeys: nextSession.dirty.changedKeys
    };
  }
}
