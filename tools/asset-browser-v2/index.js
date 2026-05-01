class AssetBrowserV2 {
  constructor() {
    console.log("[AssetBrowserV2]");
    document.title = "Asset Browser V2";
    document.body.dataset.toolId = "asset-browser-v2";
    this.urlState = this.readUrlState();
    this.handleNavigationState = this.handleNavigationState.bind(this);
    window.addEventListener("popstate", this.handleNavigationState);
    window.addEventListener("pageshow", this.handleNavigationState);
    this.readSession();
  }

  handleNavigationState() {
    this.urlState = this.readUrlState();
    this.readSession();
  }

  readUrlState() {
    const urlStateParams = new URL(window.location.href).searchParams;
    return {
      hostContextId: typeof urlStateParams.get("hostContextId") === "string" ? urlStateParams.get("hostContextId").trim() : "",
      view: typeof urlStateParams.get("view") === "string" ? urlStateParams.get("view").trim() : "",
      selection: typeof urlStateParams.get("selection") === "string" ? urlStateParams.get("selection").trim() : "",
      zoom: typeof urlStateParams.get("zoom") === "string" ? urlStateParams.get("zoom").trim() : "",
      panel: typeof urlStateParams.get("panel") === "string" ? urlStateParams.get("panel").trim() : ""
    };
  }

  optionalUrlStateSummary() {
    const urlStateParts = [];
    if (this.urlState.view) urlStateParts.push(`view=${this.urlState.view}`);
    if (this.urlState.selection) urlStateParts.push(`selection=${this.urlState.selection}`);
    if (this.urlState.zoom) urlStateParts.push(`zoom=${this.urlState.zoom}`);
    if (this.urlState.panel) urlStateParts.push(`panel=${this.urlState.panel}`);
    return urlStateParts.join(", ");
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!this.urlState.hostContextId) {
        this.renderMissing("No hostContextId was provided. Re-open Asset Browser V2 from a valid Tool V2 session link.");
        return;
      }
      if (
        !window.sessionStorage.getItem(
          this.urlState.hostContextId
        )
      ) {
        this.renderMissing("No session data was found for the provided hostContextId. Re-open Asset Browser V2 from the tools index or a host flow that creates the session context first.");
        return;
      }
      this.loadContract(
        JSON.parse(
          window.sessionStorage.getItem(
            this.urlState.hostContextId
          )
        )
      );
    } catch (error) {
      this.renderError(`Unable to read Asset Browser V2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  loadContract(sessionContext) {
    console.log("[ASSET_BROWSER_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.assetCatalog.");
      return;
    }
    if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
      this.renderError("Asset Browser V2 session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!sessionContext.payloadJson.assetCatalog || typeof sessionContext.payloadJson.assetCatalog !== "object" || Array.isArray(sessionContext.payloadJson.assetCatalog)) {
      this.renderError("Asset Browser V2 session data is invalid. Expected payloadJson.assetCatalog.");
      return;
    }
    this.renderCatalog(sessionContext.payloadJson.assetCatalog, sessionContext);
  }

  renderCatalog(assetCatalog, sessionContext) {
    if (typeof assetCatalog.name !== "string" || !assetCatalog.name.trim()) {
      this.renderError("Asset Browser V2 session data is invalid. Expected assetCatalog.name.");
      return;
    }
    if (!Array.isArray(assetCatalog.entries)) {
      this.renderError("Asset Browser V2 session data is invalid. Expected assetCatalog.entries[].");
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
      this.renderError("Asset Browser V2 session data is invalid. Every entry requires id, label, kind, and path.");
      return;
    }

    document.getElementById("assetBrowserV2SessionReadout").textContent = `Session: loaded\nContext: ${this.urlState.hostContextId}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}${this.optionalUrlStateSummary() ? `\nURL State: ${this.optionalUrlStateSummary()}` : ""}`;
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.assetCatalog valid\nentries[] valid";
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("assetBrowserV2Title").textContent = assetCatalog.name.trim();
    document.getElementById("assetBrowserV2Count").textContent = `${assetCatalog.entries.length} asset${assetCatalog.entries.length === 1 ? "" : "s"}`;
    document.getElementById("assetBrowserV2State").textContent = assetCatalog.entries.length === 0
      ? "Asset Browser V2 loaded a valid session asset catalog with zero entries."
      : "Asset Browser V2 loaded the session asset catalog.";
    document.getElementById("assetBrowserV2EmptyState").hidden = true;
    document.getElementById("assetBrowserV2InvalidState").hidden = true;
    document.getElementById("assetBrowserV2ValidState").hidden = false;

    document.getElementById("assetBrowserV2List").replaceChildren();
    assetCatalog.entries.forEach((entry) => {
      const assetItem = document.createElement("button");
      const assetName = document.createElement("strong");
      const assetMeta = document.createElement("div");
      assetItem.type = "button";
      assetName.textContent = entry.label.trim();
      assetMeta.textContent = `${entry.kind.trim()} | ${entry.path.trim()}`;
      assetItem.append(assetName, assetMeta);
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
      document.getElementById("assetBrowserV2List").appendChild(assetItem);
    });

    document.getElementById("assetBrowserV2Preview").textContent = assetCatalog.entries.length === 0
      ? "No assets are available in this session catalog."
      : "Select an asset entry to inspect its session metadata.";
  }

  renderMissing(message) {
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
  }

  renderError(message) {
    document.getElementById("assetBrowserV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson.assetCatalog invalid";
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid Asset Browser V2 session data.";
    document.getElementById("assetBrowserV2Title").textContent = "Asset Browser V2 error";
    document.getElementById("assetBrowserV2Count").textContent = "0 assets";
    document.getElementById("assetBrowserV2InvalidState").textContent = `${message} Re-open Asset Browser V2 from a host session that provides payloadJson.assetCatalog.`;
    document.getElementById("assetBrowserV2EmptyState").hidden = true;
    document.getElementById("assetBrowserV2InvalidState").hidden = false;
    document.getElementById("assetBrowserV2ValidState").hidden = true;
    document.getElementById("assetBrowserV2List").replaceChildren();
    document.getElementById("assetBrowserV2Preview").textContent = "";
  }
}

new AssetBrowserV2();
