function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readGameIdFrom(value) {
  if (!isPlainObject(value)) {
    return "";
  }
  return String(
    value.gameId
    || value.game
    || value.metadata?.gameId
    || value.workspaceMetadata?.gameId
    || ""
  ).trim();
}

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

  validateWorkspaceManagerContext(context) {
    if (!isPlainObject(context)) {
      return { ok: false, message: "Workspace Manager V2 session context is invalid." };
    }
    if (context.version !== "workspace-manager-v2" || context.toolId !== "asset-manager-v2") {
      return { ok: false, message: "Workspace Manager V2 session context is required." };
    }
    const workspaceManifest = this.workspaceManifestFromContext(context);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing workspaceManifest." };
    }
    const gameId = readGameIdFrom(context) || readGameIdFrom(workspaceManifest);
    const gameRoot = normalizedGameRoot(context.gameRoot || workspaceManifest.workspaceMetadata?.gameRoot);
    const assetsPath = normalizedAssetsPath(context.assetsPath || workspaceManifest.workspaceMetadata?.assetsPath);
    if (!gameId || !gameRoot || !assetsPath) {
      return { ok: false, message: "Workspace Manager V2 session context is missing gameRoot or assetsPath." };
    }
    if (!hasOnlyGamesRoot(gameRoot) || !hasOnlyGamesRoot(assetsPath)) {
      return { ok: false, message: "Workspace Manager V2 session context must use games-only roots." };
    }
    if (assetsPath !== `${gameRoot.replace(/\/$/, "")}/assets`) {
      return { ok: false, message: "Workspace Manager V2 assetsPath must match the active game root assets folder." };
    }
    const activePalette = context.activePalette;
    if (!isPlainObject(activePalette) || !Array.isArray(activePalette.swatches) || !activePalette.swatches.length) {
      return { ok: false, message: "Workspace Manager V2 session context is missing active palette swatches." };
    }
    if (workspaceManifest.workspaceMetadata?.owner !== "workspace-manager-v2") {
      return { ok: false, message: "Workspace Manager V2 session context is missing workspace-manager-v2 ownership metadata." };
    }
    if (!isPlainObject(workspaceManifest.tools?.["asset-browser"]?.assets)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing tools.asset-browser.assets." };
    }
    return { ok: true, gameId, gameRoot, assetsPath, activePalette, workspaceManifest };
  }

  readContext() {
    const hostContextId = this.hostContextId();
    if (!hostContextId) {
      return { ok: false, message: "Workspace mode requires a hostContextId." };
    }
    const rawValue = this.window.sessionStorage.getItem(hostContextId);
    if (!rawValue) {
      return { ok: false, message: "Workspace Manager V2 session context was not found in sessionStorage." };
    }
    try {
      const context = JSON.parse(rawValue);
      if (!isPlainObject(context)) {
        return { ok: false, message: "Workspace Manager V2 session context is invalid." };
      }
      const validation = this.validateWorkspaceManagerContext(context);
      if (!validation.ok) {
        return validation;
      }
      return { ok: true, hostContextId, context, ...validation };
    } catch (error) {
      return { ok: false, message: `Workspace Manager V2 session context JSON is invalid: ${error.message}` };
    }
  }

  workspaceManifestFromContext(context) {
    if (isPlainObject(context.workspaceManifest)) {
      return context.workspaceManifest;
    }
    return null;
  }

  readWorkspaceAssetPayload() {
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const workspaceManifest = this.workspaceManifestFromContext(contextResult.context);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing workspaceManifest." };
    }
    const assetPayload = workspaceManifest.tools?.["asset-browser"];
    if (!isPlainObject(assetPayload) || !isPlainObject(assetPayload.assets)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing tools.asset-browser.assets." };
    }
    return { ok: true, payload: { assets: clone(assetPayload.assets) } };
  }

  readWorkspacePaletteSwatches() {
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const activePalette = contextResult.activePalette;
    if (!isPlainObject(activePalette) || !Array.isArray(activePalette.swatches)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing active palette swatches." };
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

  writeAssetsPayload(payload) {
    if (!this.isWorkspaceMode()) {
      return { ok: false, message: "Asset insertion is only available when launched from Workspace Manager V2." };
    }
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const nextContext = clone(contextResult.context);
    const workspaceManifest = this.workspaceManifestFromContext(nextContext);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing workspaceManifest." };
    }
    if (!isPlainObject(workspaceManifest.tools)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing tools." };
    }
    if (!isPlainObject(workspaceManifest.tools["asset-browser"]) || !isPlainObject(workspaceManifest.tools["asset-browser"].assets)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing tools.asset-browser.assets." };
    }

    workspaceManifest.tools["asset-browser"].assets = clone(payload.assets);
    nextContext.workspaceManifest = workspaceManifest;
    this.window.sessionStorage.setItem(contextResult.hostContextId, JSON.stringify(nextContext));
    return { ok: true, workspaceManifest: clone(workspaceManifest) };
  }
}
