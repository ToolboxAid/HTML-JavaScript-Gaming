function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function isWorkspaceManifest(value) {
  return isPlainObject(value)
    && value.documentKind === "workspace-manifest"
    && typeof value.schema === "string"
    && isPlainObject(value.tools);
}

const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";

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
    return new URL("../workspace-manager-v2/index.html", this.window.location.href).href;
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
      .filter((key) => !["$schema", "documentKind", "schema", "version", "id", "name", "gameId", "gameRoot", "assetsPath", "tools"].includes(key));
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
    const assetPayloadKeys = Object.keys(workspaceManifest.tools["asset-manager-v2"]);
    if (assetPayloadKeys.some((key) => key !== "assets")) {
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
    const workspaceManifest = this.workspaceManifestFromContext(contextResult.context);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 manifest context is invalid." };
    }
    const assetPayload = workspaceManifest.tools?.["asset-manager-v2"];
    if (!isPlainObject(assetPayload) || !isPlainObject(assetPayload.assets)) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing tools.asset-manager-v2.assets." };
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
    const workspaceManifest = clone(contextResult.context);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace Manager V2 manifest context is invalid." };
    }
    if (!isPlainObject(workspaceManifest.tools)) {
      return { ok: false, message: "Workspace Manager V2 session context is missing tools." };
    }
    if (!isPlainObject(workspaceManifest.tools["asset-manager-v2"]) || !isPlainObject(workspaceManifest.tools["asset-manager-v2"].assets)) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing tools.asset-manager-v2.assets." };
    }

    workspaceManifest.tools["asset-manager-v2"].assets = clone(payload.assets);
    this.window.sessionStorage.setItem(contextResult.hostContextId, JSON.stringify(workspaceManifest));
    return { ok: true, workspaceManifest: clone(workspaceManifest) };
  }
}
