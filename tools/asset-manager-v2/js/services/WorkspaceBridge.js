import { isPlainObject } from '../../../../src/shared/utils/objectUtils.js';
import { deepClone as clone } from '../../../../src/shared/utils/jsonUtils.js';
function normalizeWorkspacePath(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "");
}

function normalizedGameRoot(value) {
  const path = normalizeWorkspacePath(value);
  return /^games\/[^/]+$/i.test(path) ? `${path}/` : "";
}

function normalizedAssetsPath(value) {
  const path = normalizeWorkspacePath(value);
  return /^games\/[^/]+\/assets$/i.test(path) ? path : "";
}

function hasOnlyGamesRoot(value) {
  const path = normalizeWorkspacePath(value);
  return path.startsWith("games/") && !path.includes("/samples/") && !path.includes("/tools/");
}

function isWorkspaceManifest(value) {
  return isPlainObject(value)
    && value.documentKind === "workspace-manifest"
    && typeof value.schema === "string"
    && isPlainObject(value.tools);
}

const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";
const ASSET_MANAGER_V2_TOOL_KEY = "asset-manager-v2";
const WORKSPACE_TOOL_SESSION_KEY_PREFIX = "workspace.tools.";
const WORKSPACE_RETURN_HISTORY_CONTEXT_KEY = "workspace-manager-v2-return-history-context-id";

function toolSessionKey(toolId) {
  return `${WORKSPACE_TOOL_SESSION_KEY_PREFIX}${toolId}`;
}

function normalizedToolSessionError(key) {
  return `${key} must use the normalized schema/workspace/data/dirty object shape.`;
}

export class WorkspaceBridge {
  constructor({ windowRef = window }) {
    this.window = windowRef;
  }

  isWorkspaceMode() {
    const params = new URLSearchParams(this.window.location.search);
    return params.get("launch") === "workspace" && params.get("fromTool") === "workspace-manager-v2";
  }

  hostContextId() {
    return new URLSearchParams(this.window.location.search).get("hostContextId") || "";
  }

  workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", this.window.location.href);
    const params = new URLSearchParams(this.window.location.search);
    const hostContextId = this.hostContextId();
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    if (params.get("workspaceMode")?.toLowerCase() === "uat") {
      url.searchParams.set("workspace", "uat");
    }
    return url.href;
  }

  returnToWorkspace() {
    const targetUrl = this.workspaceManagerUrl();
    if (this.window.sessionStorage.getItem(WORKSPACE_RETURN_HISTORY_CONTEXT_KEY) === this.hostContextId()
      && this.window.history.length > 1) {
      this.window.history.back();
      return;
    }
    this.window.location.href = targetUrl;
  }

  validateWorkspaceManagerContext(workspaceManifest) {
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 manifest context is invalid." };
    }
    if (!isWorkspaceManifest(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 launch requires a schema-valid workspace manifest." };
    }
    if (Object.prototype.hasOwnProperty.call(workspaceManifest, "workspaceManifest")
      || Object.prototype.hasOwnProperty.call(workspaceManifest, "toolId")
      || Object.prototype.hasOwnProperty.call(workspaceManifest, "activePalette")) {
      return { ok: false, message: "Workspace Manager V2 launch no longer accepts wrapper context JSON." };
    }
    const unsupportedManifestKeys = Object.keys(workspaceManifest)
      .filter((key) => !["$schema", "documentKind", "schema", "version", "id", "name", "gameId", "gameRoot", "assetsPath", "screen", "repoRoot", "repoPath", "tools"].includes(key));
    if (unsupportedManifestKeys.length) {
      return { ok: false, message: `Workspace Manager V2 manifest includes fields not allowed by the workspace manifest schema: ${unsupportedManifestKeys.join(", ")}.` };
    }
    const gameId = String(workspaceManifest.gameId || "").trim();
    const gameRoot = normalizedGameRoot(workspaceManifest.gameRoot);
    const assetsPath = normalizedAssetsPath(workspaceManifest.assetsPath);
    if (!gameId || !gameRoot || !assetsPath) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing gameRoot or assetsPath." };
    }
    if (!hasOnlyGamesRoot(gameRoot) || !hasOnlyGamesRoot(assetsPath)) {
      return { ok: false, message: "Workspace Manager V2 manifest must use games-only roots." };
    }
    if (assetsPath !== `${gameRoot.replace(/\/$/, "")}/assets`) {
      return { ok: false, message: "Workspace Manager V2 assetsPath must match the active game root assets folder." };
    }
    if (Object.prototype.hasOwnProperty.call(workspaceManifest.tools, "palette-browser")) {
      return { ok: false, message: "Workspace Manager V2 manifest must use tools.palette-manager-v2, not tools.palette-browser." };
    }
    const palettePayload = workspaceManifest.tools[PALETTE_MANAGER_V2_TOOL_KEY];
    if (!isPlainObject(palettePayload) || !Array.isArray(palettePayload.swatches) || !palettePayload.swatches.length) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing active palette swatches." };
    }
    if (!isPlainObject(workspaceManifest.tools?.["asset-manager-v2"]?.assets)) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing tools.asset-manager-v2.assets." };
    }
    if (Object.prototype.hasOwnProperty.call(workspaceManifest.tools, "asset-browser")) {
      return { ok: false, message: "Workspace Manager V2 manifest must use tools.asset-manager-v2, not tools.asset-browser." };
    }
    const allowedAssetPayloadKeys = new Set(["$schema", "schema", "version", "id", "name", "source", "assets"]);
    const assetPayloadKeys = Object.keys(workspaceManifest.tools["asset-manager-v2"]);
    if (assetPayloadKeys.some((key) => !allowedAssetPayloadKeys.has(key))) {
      return { ok: false, message: "Workspace Manager V2 asset payload must match the Asset Manager V2 asset schema." };
    }
    return { ok: true, gameId, gameRoot, assetsPath, activePalette: palettePayload, workspaceManifest };
  }

  readContext() {
    const hostContextId = this.hostContextId();
    if (!hostContextId) {
      return { ok: false, message: "Workspace mode requires a hostContextId." };
    }
    const rawValue = this.window.sessionStorage.getItem(hostContextId);
    if (!rawValue) {
      return { ok: false, message: "Workspace Manager V2 manifest was not found in sessionStorage." };
    }
    try {
      const workspaceManifest = JSON.parse(rawValue);
      if (!isPlainObject(workspaceManifest)) {
        return { ok: false, message: "Workspace Manager V2 manifest context is invalid." };
      }
      const validation = this.validateWorkspaceManagerContext(workspaceManifest);
      if (!validation.ok) {
        return validation;
      }
      return { ok: true, hostContextId, context: workspaceManifest, ...validation };
    } catch (error) {
      return { ok: false, message: `Workspace Manager V2 manifest JSON is invalid: ${error.message}` };
    }
  }

  readSessionJson(key) {
    const rawValue = this.window.sessionStorage.getItem(key);
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

  readWorkspaceToolSession(toolId, contextResult = null) {
    const context = contextResult || this.readContext();
    if (!context.ok) {
      return context;
    }
    const key = toolSessionKey(toolId);
    const sessionResult = this.readSessionJson(key);
    if (!sessionResult.ok) {
      return sessionResult;
    }
    const session = sessionResult.value;
    if (!isPlainObject(session.schema)
      || !isPlainObject(session.workspace)
      || !Object.prototype.hasOwnProperty.call(session, "data")
      || !isPlainObject(session.dirty)) {
      return { ok: false, message: normalizedToolSessionError(key) };
    }
    if (session.workspace.source !== "workspace-manager-v2") {
      return { ok: false, message: `${key}.workspace.source must be workspace-manager-v2.` };
    }
    if (session.workspace.toolId !== toolId) {
      return { ok: false, message: `${key}.workspace.toolId must match ${toolId}.` };
    }
    if (session.workspace.workspaceManifestId !== context.context.id) {
      return { ok: false, message: `${key}.workspace.workspaceManifestId must match ${context.context.id}.` };
    }
    if (session.workspace.gameId !== context.gameId) {
      return { ok: false, message: `${key}.workspace.gameId must match ${context.gameId}.` };
    }
    return { ok: true, context, key, session };
  }

  workspaceManifestFromContext(context) {
    if (isWorkspaceManifest(context)) {
      return context;
    }
    return null;
  }

  readWorkspaceAssetPayload() {
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const sessionResult = this.readWorkspaceToolSession(ASSET_MANAGER_V2_TOOL_KEY, contextResult);
    if (!sessionResult.ok) {
      return sessionResult;
    }
    const assetPayload = sessionResult.session.data;
    if (!isPlainObject(assetPayload) || !isPlainObject(assetPayload.assets)) {
      return { ok: false, message: `${sessionResult.key}.data.assets must contain the active workspace assets.` };
    }
    return {
      ok: true,
      payload: {
        assets: clone(assetPayload.assets)
      }
    };
  }

  readWorkspacePaletteSwatches() {
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const sessionResult = this.readWorkspaceToolSession(PALETTE_MANAGER_V2_TOOL_KEY, contextResult);
    if (!sessionResult.ok) {
      return sessionResult;
    }
    const activePalette = sessionResult.session.data;
    if (!isPlainObject(activePalette) || !Array.isArray(activePalette.swatches)) {
      return { ok: false, message: `${sessionResult.key}.data.swatches must contain the active workspace palette.` };
    }
    return { ok: true, swatches: clone(activePalette.swatches) };
  }

  readWorkspacePreviewContext() {
    if (!this.isWorkspaceMode()) {
      return {
        workspaceMode: false,
        workspaceAssetsPath: "",
        workspaceGameId: "",
        workspaceGameRoot: ""
      };
    }
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return {
        workspaceMode: true,
        workspaceAssetsPath: "",
        workspaceGameId: "",
        workspaceGameRoot: ""
      };
    }
    return {
      workspaceMode: true,
      workspaceAssetsPath: contextResult.assetsPath,
      workspaceGameId: contextResult.gameId,
      workspaceGameRoot: contextResult.gameRoot
    };
  }

  writeAssetsPayload(payload, changedKeys = ["data.assets"]) {
    if (!this.isWorkspaceMode()) {
      return { ok: false, message: "Asset insertion is only available when launched from Workspace Manager V2." };
    }
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const sessionResult = this.readWorkspaceToolSession(ASSET_MANAGER_V2_TOOL_KEY, contextResult);
    if (!sessionResult.ok) {
      return sessionResult;
    }
    const workspaceManifest = clone(contextResult.context);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 manifest context is invalid." };
    }
    if (!isPlainObject(workspaceManifest.tools)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing tools." };
    }
    if (!isPlainObject(payload?.assets)) {
      return { ok: false, message: "Asset Manager V2 payload must include assets." };
    }

    const session = sessionResult.session;
    const currentAssets = isPlainObject(session.data?.assets) ? session.data.assets : {};
    const nextData = {
      ...(isPlainObject(session.data) ? session.data : {}),
      assets: clone(payload.assets)
    };
    const assetsChanged = JSON.stringify(currentAssets) !== JSON.stringify(nextData.assets);
    const nextSession = {
      ...session,
      data: nextData,
      dirty: assetsChanged
        ? {
            isDirty: true,
            reason: "asset-updated",
            changedAt: new Date().toISOString(),
            changedKeys: Array.from(new Set((Array.isArray(changedKeys) ? changedKeys : ["data.assets"])
              .map((key) => String(key || "").trim())
              .filter(Boolean)))
          }
        : session.dirty
    };
    this.window.sessionStorage.setItem(sessionResult.key, JSON.stringify(nextSession));
    workspaceManifest.tools[ASSET_MANAGER_V2_TOOL_KEY] = clone(nextData);
    return {
      ok: true,
      changed: assetsChanged,
      session: clone(nextSession),
      workspaceManifest: clone(workspaceManifest)
    };
  }
}
