class TilemapStudioV2 {
  constructor() {
    console.log("[TilemapStudioV2]");
    this.sessionPayloadBytesLimit = 1024 * 1024;
    document.title = "Tilemap Studio V2";
    document.body.dataset.toolId = "tilemap-studio-v2";
    this.urlState = this.readUrlState();
    this.goBack = this.goBack.bind(this);
    this.openAssetBrowserV2 = this.openAssetBrowserV2.bind(this);
    this.handleNavigationState = this.handleNavigationState.bind(this);
    window.addEventListener("popstate", this.handleNavigationState);
    window.addEventListener("pageshow", this.handleNavigationState);
    document.getElementById("tilemapV2BackButton").addEventListener("click", this.goBack);
    document.getElementById("tilemapV2OpenAssetBrowserV2Button").addEventListener("click", this.openAssetBrowserV2);
    this.renderNavigation();
    this.registerSnapshotHook();
    this.readSession();
  }

  goBack() {
    const targetToolId = this.toolLabel(this.urlState.fromTool) ? this.urlState.fromTool : "workspace-v2";
    window.location.href = this.buildToolUrl(targetToolId).toString();
  }

  openAssetBrowserV2() {
    if (!this.urlState.hostContextId) {
      this.renderMissing("No hostContextId is available for launch. Re-open Tilemap Studio V2 from a valid Tool V2 session link.");
      return;
    }
    const targetUrl = this.buildToolUrl("asset-browser-v2");
    targetUrl.searchParams.set("fromTool", "tilemap-studio-v2");
    window.location.href = targetUrl.toString();
  }

  handleNavigationState() {
    this.urlState = this.readUrlState();
    this.renderNavigation();
    this.readSession();
  }

  readUrlState() {
    const urlStateParams = new URL(window.location.href).searchParams;
    return {
      hostContextId: typeof urlStateParams.get("hostContextId") === "string" ? urlStateParams.get("hostContextId").trim() : "",
      fromTool: typeof urlStateParams.get("fromTool") === "string" ? urlStateParams.get("fromTool").trim() : "",
      view: typeof urlStateParams.get("view") === "string" ? urlStateParams.get("view").trim() : "",
      selection: typeof urlStateParams.get("selection") === "string" ? urlStateParams.get("selection").trim() : "",
      zoom: typeof urlStateParams.get("zoom") === "string" ? urlStateParams.get("zoom").trim() : "",
      panel: typeof urlStateParams.get("panel") === "string" ? urlStateParams.get("panel").trim() : ""
    };
  }

  toolLabel(toolId) {
    if (toolId === "asset-browser-v2") return "Asset Browser V2";
    if (toolId === "palette-manager-v2") return "Palette Manager V2";
    if (toolId === "svg-asset-studio-v2") return "SVG Asset Studio V2";
    if (toolId === "tilemap-studio-v2") return "Tilemap Studio V2";
    if (toolId === "vector-map-editor-v2") return "Vector Map Editor V2";
    if (toolId === "workspace-v2") return "Workspace V2";
    return "";
  }

  renderNavigation() {
    const sourceLabel = this.toolLabel(this.urlState.fromTool) || "Workspace V2";
    document.getElementById("tilemapV2Breadcrumb").textContent = `Workspace V2 -> ${sourceLabel} -> Tilemap Studio V2`;
    document.getElementById("tilemapV2BackButton").textContent = `Back to ${sourceLabel}`;
  }

  buildToolUrl(toolId) {
    const targetUrl = new URL(`../${toolId}/index.html`, window.location.href);
    if (this.urlState.hostContextId) {
      targetUrl.searchParams.set("hostContextId", this.urlState.hostContextId);
    }
    return targetUrl;
  }

  optionalUrlStateSummary() {
    const urlStateParts = [];
    if (this.urlState.view) urlStateParts.push(`view=${this.urlState.view}`);
    if (this.urlState.selection) urlStateParts.push(`selection=${this.urlState.selection}`);
    if (this.urlState.zoom) urlStateParts.push(`zoom=${this.urlState.zoom}`);
    if (this.urlState.panel) urlStateParts.push(`panel=${this.urlState.panel}`);
    return urlStateParts.join(", ");
  }

  handleSessionVersion(payload) {
    if (payload && payload.version === "v2") return { ok: true, payload };
    return {
      ok: false,
      error: "Unsupported session version",
      code: "UNSUPPORTED_VERSION"
    };
  }

  buildRuntimeSnapshot() {
    const serializedSession = this.urlState.hostContextId ? window.sessionStorage.getItem(this.urlState.hostContextId) : null;
    let parsedSession = null;
    let sessionError = "";
    if (typeof serializedSession === "string") {
      try {
        parsedSession = JSON.parse(serializedSession);
      } catch (error) {
        sessionError = error instanceof Error ? error.message : "unknown error";
      }
    }
    return {
      tool: "tilemap-studio-v2",
      url: window.location.href,
      hostContextId: this.urlState.hostContextId,
      session: parsedSession,
      sessionError
    };
  }

  registerSnapshotHook() {
    window.__v2RuntimeSnapshot = () => this.buildRuntimeSnapshot();
  }

  logStructuredError(type, message, details) {
    console.error({
      tool: "tilemap-studio-v2",
      type,
      message,
      details: details && typeof details === "object" ? details : {}
    });
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!this.urlState.hostContextId) {
        this.renderMissing("No hostContextId was provided. Re-open Tilemap Studio V2 from a valid Tool V2 session link.");
        return;
      }
      const serializedSession = window.sessionStorage.getItem(
        this.urlState.hostContextId
      );
      if (
        !serializedSession
      ) {
        this.renderMissing("No session data was found for the provided hostContextId. Re-open Tilemap Studio V2 from the tools index or a host flow that creates the session context first.");
        return;
      }
      if (serializedSession.length > this.sessionPayloadBytesLimit) {
        this.renderError(`Session size exceeds allowed limit. Payload is ${serializedSession.length} bytes and limit is ${this.sessionPayloadBytesLimit} bytes.`);
        return;
      }
      this.loadContract(
        JSON.parse(serializedSession)
      );
    } catch (error) {
      const runtimeMessage = `Unable to read Tilemap Studio V2 session context: ${error instanceof Error ? error.message : "unknown error"}`;
      this.logStructuredError("RUNTIME", runtimeMessage, { hostContextId: this.urlState.hostContextId || "" });
      this.renderError(runtimeMessage);
    }
  }

  loadContract(sessionContext) {
    console.log("[TILEMAP_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.tileMapDocument.");
      return;
    }
    const versionCheck = this.handleSessionVersion(sessionContext);
    if (!versionCheck.ok) {
      this.renderError(versionCheck.error);
      return;
    }
    if (!versionCheck.payload.payloadJson || typeof versionCheck.payload.payloadJson !== "object" || Array.isArray(versionCheck.payload.payloadJson)) {
      this.renderError("Tilemap session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!versionCheck.payload.payloadJson.tileMapDocument || typeof versionCheck.payload.payloadJson.tileMapDocument !== "object" || Array.isArray(versionCheck.payload.payloadJson.tileMapDocument)) {
      this.renderError("Tilemap session data is invalid. Expected payloadJson.tileMapDocument.");
      return;
    }
    this.renderTilemap(versionCheck.payload.payloadJson.tileMapDocument, versionCheck.payload);
  }

  renderTilemap(tileMapDocument, sessionContext) {
    if (!tileMapDocument.map || typeof tileMapDocument.map !== "object" || Array.isArray(tileMapDocument.map)) {
      this.renderError("Tilemap session data is invalid. Expected tileMapDocument.map.");
      return;
    }
    if (typeof tileMapDocument.map.name !== "string" || !tileMapDocument.map.name.trim()) {
      this.renderError("Tilemap session data is invalid. Expected tileMapDocument.map.name.");
      return;
    }
    if (!Number.isFinite(Number(tileMapDocument.map.width)) || Number(tileMapDocument.map.width) <= 0 || !Number.isFinite(Number(tileMapDocument.map.height)) || Number(tileMapDocument.map.height) <= 0) {
      this.renderError("Tilemap session data is invalid. Expected positive numeric tileMapDocument.map.width and tileMapDocument.map.height.");
      return;
    }
    if (!Array.isArray(tileMapDocument.layers)) {
      this.renderError("Tilemap session data is invalid. Expected tileMapDocument.layers[].");
      return;
    }
    if (tileMapDocument.layers.some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.name !== "string" || !entry.name.trim() || typeof entry.kind !== "string" || !entry.kind.trim() || !Array.isArray(entry.data))) {
      this.renderError("Tilemap session data is invalid. Every layer requires name, kind, and data[].");
      return;
    }
    document.getElementById("tilemapV2SessionReadout").textContent = `Session: loaded\nContext: ${this.urlState.hostContextId}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}${this.optionalUrlStateSummary() ? `\nURL State: ${this.optionalUrlStateSummary()}` : ""}`;
    document.getElementById("tilemapV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.tileMapDocument valid\nlayers[] valid";
    document.getElementById("tilemapV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("tilemapV2Name").textContent = tileMapDocument.map.name.trim();
    document.getElementById("tilemapV2Count").textContent = `${tileMapDocument.layers.length} layer${tileMapDocument.layers.length === 1 ? "" : "s"}`;
    document.getElementById("tilemapV2State").textContent = "Tilemap Studio V2 loaded the session tilemap.";
    document.getElementById("tilemapV2EmptyState").hidden = true;
    document.getElementById("tilemapV2InvalidState").hidden = true;
    document.getElementById("tilemapV2ValidState").hidden = false;
    document.getElementById("tilemapV2LayerList").replaceChildren();
    tileMapDocument.layers.forEach((entry) => {
      const layerItem = document.createElement("li");
      const layerName = document.createElement("strong");
      const layerKind = document.createElement("div");
      layerName.textContent = entry.name.trim();
      layerKind.textContent = `${entry.kind.trim()} - ${entry.data.length} row${entry.data.length === 1 ? "" : "s"}`;
      layerItem.append(layerName, layerKind);
      document.getElementById("tilemapV2LayerList").appendChild(layerItem);
    });
    document.getElementById("tilemapV2Preview").replaceChildren();
    const tilemapPreview = document.createElement("pre");
    tilemapPreview.textContent = JSON.stringify(
      {
        map: tileMapDocument.map,
        layers: tileMapDocument.layers.map((entry) => ({
          name: entry.name,
          kind: entry.kind,
          rows: entry.data.length
        }))
      },
      null,
      2
    );
    document.getElementById("tilemapV2Preview").appendChild(tilemapPreview);
  }

  renderMissing(message) {
    this.logStructuredError("EMPTY", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("tilemapV2SessionReadout").textContent = "Session: missing";
    document.getElementById("tilemapV2ContractReadout").textContent = "payloadJson.tileMapDocument not loaded";
    document.getElementById("tilemapV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("tilemapV2Name").textContent = "No tilemap loaded";
    document.getElementById("tilemapV2Count").textContent = "0 layers";
    document.getElementById("tilemapV2EmptyState").textContent = message;
    document.getElementById("tilemapV2EmptyState").hidden = false;
    document.getElementById("tilemapV2InvalidState").hidden = true;
    document.getElementById("tilemapV2ValidState").hidden = true;
    document.getElementById("tilemapV2LayerList").replaceChildren();
    document.getElementById("tilemapV2Preview").replaceChildren();
  }

  renderError(message) {
    this.logStructuredError("INVALID", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("tilemapV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("tilemapV2ContractReadout").textContent = "payloadJson.tileMapDocument invalid";
    document.getElementById("tilemapV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid Tilemap Studio V2 session data.";
    document.getElementById("tilemapV2Name").textContent = "Tilemap Studio V2 error";
    document.getElementById("tilemapV2Count").textContent = "0 layers";
    document.getElementById("tilemapV2InvalidState").textContent = `${message} Re-open Tilemap Studio V2 from a host session that provides payloadJson.tileMapDocument.`;
    document.getElementById("tilemapV2EmptyState").hidden = true;
    document.getElementById("tilemapV2InvalidState").hidden = false;
    document.getElementById("tilemapV2ValidState").hidden = true;
    document.getElementById("tilemapV2LayerList").replaceChildren();
    document.getElementById("tilemapV2Preview").replaceChildren();
  }
}

new TilemapStudioV2();
