const ASSET_MANAGER_TOOL_ID = "asset-manager-v2";
const HOST_CONTEXT_STORAGE_KEY = "workspace-v2-active-host-context-id";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeHostContextId() {
  return `workspace-v2-assets-${Date.now().toString(36)}`;
}

class WorkspaceV2AssetHost {
  constructor({ documentRef = document, windowRef = window } = {}) {
    this.document = documentRef;
    this.window = windowRef;
    this.openAssetManagerButton = this.document.getElementById("workspaceV2OpenAssetManagerButton");
    this.refreshButton = this.document.getElementById("workspaceV2RefreshButton");
    this.manifestText = this.document.getElementById("workspaceManifestText");
    this.statusLog = this.document.getElementById("workspaceStatusLog");
    this.hostContextId = "";
  }

  start() {
    this.openAssetManagerButton.addEventListener("click", () => this.openAssetManagerFromWorkspace());
    this.refreshButton.addEventListener("click", () => this.refreshManifestFromContext());
    this.restoreOrCreateContext();
    this.refreshManifestFromContext();
    this.writeStatus("OK Workspace V2 asset host ready.");
  }

  restoreOrCreateContext() {
    const existingHostContextId = this.window.sessionStorage.getItem(HOST_CONTEXT_STORAGE_KEY);
    if (existingHostContextId && this.window.sessionStorage.getItem(existingHostContextId)) {
      this.hostContextId = existingHostContextId;
      this.syncActiveGameContext();
      return;
    }
    this.hostContextId = makeHostContextId();
    this.window.sessionStorage.setItem(HOST_CONTEXT_STORAGE_KEY, this.hostContextId);
    this.persistContext(this.buildWorkspaceManifest());
  }

  activeGameId() {
    const params = new URLSearchParams(this.window.location.search);
    return String(params.get("gameId") || params.get("game") || "").trim();
  }

  buildWorkspaceManifest() {
    return {
      documentKind: "workspace-manifest",
      schema: "html-js-gaming.project",
      version: 1,
      id: `workspace-v2-${this.hostContextId}`,
      name: "Workspace V2 Asset Session",
      tools: {
        "palette-browser": {
          schema: "html-js-gaming.palette",
          version: 1,
          name: "Workspace Active Palette",
          swatches: []
        },
        "asset-browser": {
          assets: {}
        }
      }
    };
  }

  persistContext(workspaceManifest) {
    const hostContextId = this.hostContextId;
    const payload = {
      version: "v2",
      toolId: ASSET_MANAGER_TOOL_ID,
      ...(this.activeGameId() ? { gameId: this.activeGameId() } : {}),
      workspaceManifest: clone(workspaceManifest)
    };
    sessionStorage.setItem(hostContextId, JSON.stringify(payload));
  }

  syncActiveGameContext() {
    const gameId = this.activeGameId();
    if (!gameId) {
      return;
    }
    const context = this.readContext();
    if (!context || context.gameId === gameId) {
      return;
    }
    context.gameId = gameId;
    sessionStorage.setItem(this.hostContextId, JSON.stringify(context));
  }

  readContext() {
    const rawValue = this.window.sessionStorage.getItem(this.hostContextId);
    if (!rawValue) {
      return null;
    }
    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  refreshManifestFromContext() {
    const context = this.readContext();
    const workspaceManifest = context?.workspaceManifest;
    if (!workspaceManifest?.tools?.["asset-browser"]?.assets) {
      this.writeStatus("FAIL Workspace context is missing tools.asset-browser.assets.");
      return;
    }
    this.manifestText.value = JSON.stringify(workspaceManifest, null, 2);
    const assetCount = Object.keys(workspaceManifest.tools["asset-browser"].assets).length;
    this.writeStatus(`OK Workspace manifest shows ${assetCount} assets in tools.asset-browser.assets.`);
  }

  openAssetManagerFromWorkspace() {
    const toolUrl = new URL("../asset-manager-v2/index.html", this.window.location.href);
    const hostContextId = this.hostContextId;
    toolUrl.searchParams.set("launch", "workspace");
    toolUrl.searchParams.set("hostContextId", hostContextId);
    toolUrl.searchParams.set("fromTool", "workspace-v2");
    if (this.activeGameId()) {
      toolUrl.searchParams.set("gameId", this.activeGameId());
    }
    this.window.location.href = toolUrl.href;
  }

  writeStatus(message) {
    const timestamp = new Date().toLocaleTimeString();
    const nextLine = `[${timestamp}] ${message}`;
    this.statusLog.value = this.statusLog.value ? `${this.statusLog.value}\n${nextLine}` : nextLine;
    this.statusLog.scrollTop = this.statusLog.scrollHeight;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new WorkspaceV2AssetHost().start();
});
