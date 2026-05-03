class AssetBrowserV2 {
  constructor() {
    console.log("[AssetBrowserV2]");
    this.sessionPayloadBytesLimit = 1024 * 1024;
    document.title = "Asset Manager V2";
    document.body.dataset.toolId = "asset-manager-v2";
    this.urlState = this.readUrlState();
    this.goBack = this.goBack.bind(this);
    this.openSvgAssetStudioV2 = this.openSvgAssetStudioV2.bind(this);
    this.addAssetEntry = this.addAssetEntry.bind(this);
    this.currentSessionContext = null;
    this.handleNavigationState = this.handleNavigationState.bind(this);
    window.addEventListener("popstate", this.handleNavigationState);
    window.addEventListener("pageshow", this.handleNavigationState);
    document.getElementById("assetBrowserV2BackButton").addEventListener("click", this.goBack);
    document.getElementById("assetBrowserV2OpenSvgAssetStudioV2Button").addEventListener("click", this.openSvgAssetStudioV2);
    document.getElementById("assetManagerV2AddButton").addEventListener("click", this.addAssetEntry);
    this.renderNavigation();
    this.registerSnapshotHook();
    this.readSession();
  }

  goBack() {
    const targetToolId = this.toolLabel(this.urlState.fromTool) ? this.urlState.fromTool : "workspace-v2";
    window.location.href = this.buildToolUrl(targetToolId).toString();
  }

  openSvgAssetStudioV2() {
    if (!this.urlState.hostContextId) {
      this.renderMissing("No hostContextId is available for launch. Re-open Asset Manager V2 from a valid Tool V2 session link.");
      return;
    }
    const targetUrl = this.buildToolUrl("svg-asset-studio-v2");
    targetUrl.searchParams.set("fromTool", "asset-manager-v2");
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
    if (toolId === "asset-manager-v2") return "Asset Manager V2";
    if (toolId === "palette-manager-v2") return "Palette Manager V2";
    if (toolId === "svg-asset-studio-v2") return "SVG Asset Studio V2";
    if (toolId === "tilemap-studio-v2") return "Tilemap Studio V2";
    if (toolId === "vector-map-editor-v2") return "Vector Map Editor V2";
    if (toolId === "workspace-v2") return "Workspace V2";
    return "";
  }

  renderNavigation() {
    const sourceLabel = this.toolLabel(this.urlState.fromTool) || "Workspace V2";
    document.getElementById("assetBrowserV2Breadcrumb").textContent = `Workspace V2 -> ${sourceLabel} -> Asset Manager V2`;
    document.getElementById("assetBrowserV2BackButton").textContent = `Back to ${sourceLabel}`;
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
      tool: "asset-manager-v2",
      url: window.location.href,
      hostContextId: this.urlState.hostContextId,
      session: parsedSession,
      sessionError
    };
  }

  registerSnapshotHook() {
    window.__v2RuntimeSnapshot = () => this.buildRuntimeSnapshot();
  }

  cloneSessionValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  setActionStatus(message) {
    document.getElementById("assetManagerV2ActionStatus").textContent = message;
  }

  normalizedAssetEntryFromForm() {
    const id = typeof document.getElementById("assetManagerV2AddId").value === "string" ? document.getElementById("assetManagerV2AddId").value.trim() : "";
    const label = typeof document.getElementById("assetManagerV2AddLabel").value === "string" ? document.getElementById("assetManagerV2AddLabel").value.trim() : "";
    const kind = typeof document.getElementById("assetManagerV2AddKind").value === "string" ? document.getElementById("assetManagerV2AddKind").value.trim() : "";
    const path = typeof document.getElementById("assetManagerV2AddPath").value === "string" ? document.getElementById("assetManagerV2AddPath").value.trim() : "";
    const missingFields = [];
    if (!id) missingFields.push("id");
    if (!label) missingFields.push("label");
    if (!kind) missingFields.push("kind");
    if (!path) missingFields.push("path");
    if (missingFields.length > 0) {
      return { ok: false, message: `Add blocked. Missing required field(s): ${missingFields.join(", ")}.`, entry: null };
    }
    return { ok: true, message: "", entry: { id, label, kind, path } };
  }

  clearAddAssetForm() {
    document.getElementById("assetManagerV2AddId").value = "";
    document.getElementById("assetManagerV2AddLabel").value = "";
    document.getElementById("assetManagerV2AddKind").value = "";
    document.getElementById("assetManagerV2AddPath").value = "";
  }

  addAssetEntry() {
    if (!this.currentSessionContext || typeof this.currentSessionContext !== "object" || Array.isArray(this.currentSessionContext)) {
      this.setActionStatus("Add blocked. No valid Asset Manager V2 session is loaded.");
      return;
    }
    if (!this.currentSessionContext.payloadJson || typeof this.currentSessionContext.payloadJson !== "object" || Array.isArray(this.currentSessionContext.payloadJson)) {
      this.setActionStatus("Add blocked. payloadJson is missing.");
      return;
    }
    if (!this.currentSessionContext.payloadJson.assetCatalog || typeof this.currentSessionContext.payloadJson.assetCatalog !== "object" || Array.isArray(this.currentSessionContext.payloadJson.assetCatalog)) {
      this.setActionStatus("Add blocked. payloadJson.assetCatalog is missing.");
      return;
    }
    if (!Array.isArray(this.currentSessionContext.payloadJson.assetCatalog.entries)) {
      this.setActionStatus("Add blocked. payloadJson.assetCatalog.entries must be an array.");
      return;
    }
    const newEntry = this.normalizedAssetEntryFromForm();
    if (!newEntry.ok) {
      this.setActionStatus(newEntry.message);
      return;
    }
    const normalizedId = newEntry.entry.id.trim();
    if (this.currentSessionContext.payloadJson.assetCatalog.entries.some((entry) => entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.id === "string" && entry.id.trim() === normalizedId)) {
      this.setActionStatus(`Add blocked. Asset id '${normalizedId}' already exists.`);
      return;
    }
    const nextSessionContext = this.cloneSessionValue(this.currentSessionContext);
    nextSessionContext.payloadJson.assetCatalog.entries.push(newEntry.entry);
    this.loadContract(nextSessionContext);
    this.clearAddAssetForm();
    this.setActionStatus(`Asset '${newEntry.entry.id}' added.`);
  }

  removeAssetEntryById(assetId) {
    if (!this.currentSessionContext || typeof this.currentSessionContext !== "object" || Array.isArray(this.currentSessionContext)) {
      this.setActionStatus("Remove blocked. No valid Asset Manager V2 session is loaded.");
      return;
    }
    if (!this.currentSessionContext.payloadJson || typeof this.currentSessionContext.payloadJson !== "object" || Array.isArray(this.currentSessionContext.payloadJson)) {
      this.setActionStatus("Remove blocked. payloadJson is missing.");
      return;
    }
    if (!this.currentSessionContext.payloadJson.assetCatalog || typeof this.currentSessionContext.payloadJson.assetCatalog !== "object" || Array.isArray(this.currentSessionContext.payloadJson.assetCatalog)) {
      this.setActionStatus("Remove blocked. payloadJson.assetCatalog is missing.");
      return;
    }
    if (!Array.isArray(this.currentSessionContext.payloadJson.assetCatalog.entries)) {
      this.setActionStatus("Remove blocked. payloadJson.assetCatalog.entries must be an array.");
      return;
    }
    if (typeof assetId !== "string" || !assetId.trim()) {
      this.setActionStatus("Remove blocked. Asset id is required.");
      return;
    }
    const normalizedId = assetId.trim();
    const nextSessionContext = this.cloneSessionValue(this.currentSessionContext);
    const startLength = nextSessionContext.payloadJson.assetCatalog.entries.length;
    nextSessionContext.payloadJson.assetCatalog.entries = nextSessionContext.payloadJson.assetCatalog.entries.filter((entry) => !entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.id !== "string" || entry.id.trim() !== normalizedId);
    if (nextSessionContext.payloadJson.assetCatalog.entries.length === startLength) {
      this.setActionStatus(`Remove blocked. Asset id '${normalizedId}' was not found.`);
      return;
    }
    this.loadContract(nextSessionContext);
    this.setActionStatus(`Asset '${normalizedId}' removed.`);
  }

  logStructuredError(type, message, details) {
    console.error({
      tool: "asset-manager-v2",
      type,
      message,
      details: details && typeof details === "object" ? details : {}
    });
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!this.urlState.hostContextId) {
        this.renderMissing("No hostContextId was provided. Re-open Asset Manager V2 from a valid Tool V2 session link.");
        return;
      }
      const serializedSession = window.sessionStorage.getItem(
        this.urlState.hostContextId
      );
      if (
        !serializedSession
      ) {
        this.renderMissing("No session data was found for the provided hostContextId. Re-open Asset Manager V2 from the tools index or a host flow that creates the session context first.");
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
      const runtimeMessage = `Unable to read Asset Manager V2 session context: ${error instanceof Error ? error.message : "unknown error"}`;
      this.logStructuredError("RUNTIME", runtimeMessage, { hostContextId: this.urlState.hostContextId || "" });
      this.renderError(runtimeMessage);
    }
  }

  loadContract(sessionContext) {
    console.log("[ASSET_BROWSER_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.assetCatalog.");
      return;
    }
    const versionCheck = this.handleSessionVersion(sessionContext);
    if (!versionCheck.ok) {
      this.renderError(versionCheck.error);
      return;
    }
    if (typeof versionCheck.payload.toolId !== "string" || versionCheck.payload.toolId.trim() !== "asset-manager-v2") {
      this.renderError("Asset Manager V2 session data is invalid. Expected toolId 'asset-manager-v2'.");
      return;
    }
    if (!versionCheck.payload.payloadJson || typeof versionCheck.payload.payloadJson !== "object" || Array.isArray(versionCheck.payload.payloadJson)) {
      this.renderError("Asset Manager V2 session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!versionCheck.payload.payloadJson.assetCatalog || typeof versionCheck.payload.payloadJson.assetCatalog !== "object" || Array.isArray(versionCheck.payload.payloadJson.assetCatalog)) {
      this.renderError("Asset Manager V2 session data is invalid. Expected payloadJson.assetCatalog.");
      return;
    }
    if (typeof versionCheck.payload.payloadJson.importName === "string" || typeof versionCheck.payload.payloadJson.importDestination === "string") {
      this.renderError("Asset Manager V2 session data is invalid. Remove payloadJson.importName/importDestination. Load assets from payloadJson.assetCatalog only.");
      return;
    }
    this.renderCatalog(versionCheck.payload.payloadJson.assetCatalog, versionCheck.payload);
  }

  persistValidSessionForWorkspace(sessionContext, assetCatalog) {
    if (!this.urlState.hostContextId) {
      return { ok: false, message: "No hostContextId is available for Workspace V2 persistence." };
    }
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      return { ok: false, message: "Session context is invalid for Workspace V2 persistence." };
    }
    if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
      return { ok: false, message: "payloadJson is invalid for Workspace V2 persistence." };
    }
    const payload = {
      version: "v2",
      toolId: "asset-manager-v2",
      payloadJson: {
        ...sessionContext.payloadJson,
        assetCatalog: {
          name: assetCatalog.name.trim(),
          entries: assetCatalog.entries.map((entry) => ({
            id: entry.id.trim(),
            label: entry.label.trim(),
            kind: entry.kind.trim(),
            path: entry.path.trim()
          }))
        }
      }
    };
    const serializedPayload = JSON.stringify(payload);
    if (serializedPayload.length > this.sessionPayloadBytesLimit) {
      return {
        ok: false,
        message: `Session size exceeds allowed limit for Workspace V2 persistence. Payload is ${serializedPayload.length} bytes and limit is ${this.sessionPayloadBytesLimit} bytes.`
      };
    }
    window.sessionStorage.setItem(this.urlState.hostContextId, serializedPayload);
    return { ok: true, message: "" };
  }

  renderCatalog(assetCatalog, sessionContext) {
    if (typeof assetCatalog.name !== "string" || !assetCatalog.name.trim()) {
      this.renderError("Asset Manager V2 session data is invalid. Expected assetCatalog.name.");
      return;
    }
    if (!Array.isArray(assetCatalog.entries)) {
      this.renderError("Asset Manager V2 session data is invalid. Expected assetCatalog.entries[].");
      return;
    }
    if (
      assetCatalog.entries.some(
        (entry) =>
          !entry ||
          typeof entry !== "object" ||
          Array.isArray(entry) ||
          typeof entry.id !== "string" ||
          !entry.id.trim() ||
          typeof entry.label !== "string" ||
          !entry.label.trim() ||
          typeof entry.kind !== "string" ||
          !entry.kind.trim() ||
          typeof entry.path !== "string" ||
          !entry.path.trim()
      )
    ) {
      this.renderError("Asset Manager V2 session data is invalid. Every entry requires id, label, kind, and path.");
      return;
    }

    document.getElementById("assetBrowserV2SessionReadout").textContent = `Session: loaded\nContext: ${this.urlState.hostContextId}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}${this.optionalUrlStateSummary() ? `\nURL State: ${this.optionalUrlStateSummary()}` : ""}`;
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.assetCatalog valid\nentries[] valid";
    const persistence = this.persistValidSessionForWorkspace(sessionContext, assetCatalog);
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = persistence.ok
      ? "Workspace session context was read and persisted for Workspace V2 export."
      : `Workspace session context was read but could not be persisted: ${persistence.message}`;
    document.getElementById("assetBrowserV2Title").textContent = assetCatalog.name.trim();
    document.getElementById("assetBrowserV2Count").textContent = `${assetCatalog.entries.length} asset${assetCatalog.entries.length === 1 ? "" : "s"}`;
    document.getElementById("assetBrowserV2State").textContent = assetCatalog.entries.length === 0
      ? "Asset Manager V2 loaded a valid session asset catalog with zero entries."
      : "Asset Manager V2 loaded the session asset catalog.";
    if (assetCatalog.entries.length === 0) {
      document.getElementById("assetBrowserV2EmptyState").textContent = "Asset catalog is valid but empty. Add assets to payloadJson.assetCatalog.entries and relaunch Asset Manager V2.";
      document.getElementById("assetBrowserV2EmptyState").hidden = false;
    } else {
      document.getElementById("assetBrowserV2EmptyState").hidden = true;
    }
    document.getElementById("assetBrowserV2InvalidState").hidden = true;
    document.getElementById("assetBrowserV2ValidState").hidden = false;
    this.currentSessionContext = this.cloneSessionValue(sessionContext);

    document.getElementById("assetBrowserV2List").replaceChildren();
    assetCatalog.entries.forEach((entry) => {
      const assetRow = document.createElement("div");
      const assetItem = document.createElement("button");
      const assetName = document.createElement("strong");
      const assetMeta = document.createElement("div");
      const removeButton = document.createElement("button");
      assetItem.type = "button";
      removeButton.type = "button";
      assetName.textContent = entry.label.trim();
      assetMeta.textContent = `${entry.kind.trim()} | ${entry.path.trim()}`;
      assetItem.append(assetName, assetMeta);
      removeButton.textContent = `Remove ${entry.id.trim()}`;
      assetItem.addEventListener("click", () => {
        document.getElementById("assetBrowserV2Preview").textContent = JSON.stringify(
          {
            id: entry.id.trim(),
            label: entry.label.trim(),
            kind: entry.kind.trim(),
            path: entry.path.trim()
          },
          null,
          2
        );
      });
      removeButton.addEventListener("click", () => {
        this.removeAssetEntryById(entry.id.trim());
      });
      assetRow.append(assetItem, removeButton);
      document.getElementById("assetBrowserV2List").appendChild(assetRow);
    });

    document.getElementById("assetBrowserV2Preview").textContent = assetCatalog.entries.length === 0
      ? "No assets are available in this session catalog."
      : "Select an asset entry to inspect its session metadata.";
  }

  renderMissing(message) {
    this.logStructuredError("EMPTY", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("assetBrowserV2SessionReadout").textContent = "Session: missing";
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson.assetCatalog not loaded";
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("assetBrowserV2Title").textContent = "No assets loaded";
    document.getElementById("assetBrowserV2Count").textContent = "0 assets";
    document.getElementById("assetBrowserV2EmptyState").textContent = message;
    document.getElementById("assetBrowserV2EmptyState").hidden = false;
    document.getElementById("assetBrowserV2InvalidState").hidden = true;
    document.getElementById("assetBrowserV2ValidState").hidden = true;
    document.getElementById("assetBrowserV2List").replaceChildren();
    document.getElementById("assetBrowserV2Preview").textContent = "";
    this.currentSessionContext = null;
    this.setActionStatus("No asset action yet.");
  }

  renderError(message) {
    this.logStructuredError("INVALID", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("assetBrowserV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson.assetCatalog invalid";
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid Asset Manager V2 session data.";
    document.getElementById("assetBrowserV2Title").textContent = "Asset Manager V2 error";
    document.getElementById("assetBrowserV2Count").textContent = "0 assets";
    document.getElementById("assetBrowserV2InvalidState").textContent = `${message} Re-open Asset Manager V2 from a host session that provides payloadJson.assetCatalog.`;
    document.getElementById("assetBrowserV2EmptyState").hidden = true;
    document.getElementById("assetBrowserV2InvalidState").hidden = false;
    document.getElementById("assetBrowserV2ValidState").hidden = true;
    document.getElementById("assetBrowserV2List").replaceChildren();
    document.getElementById("assetBrowserV2Preview").textContent = "";
    this.currentSessionContext = null;
    this.setActionStatus("No asset action yet.");
  }
}

new AssetBrowserV2();
