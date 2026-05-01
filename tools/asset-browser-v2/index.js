class AssetBrowserV2 {
  constructor() {
    console.log("[ASSET_BROWSER_V2_ENTRY]");
    this.assets = [];
    this.start();
  }

  start() {
    document.title = "Asset Browser V2";
    document.body.dataset.toolId = "asset-browser-v2";
    this.bindAssetSelection();
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderEmpty("No hostContextId was provided. Open Asset Browser V2 with a valid Tool V2 session URL.");
        return;
      }
      if (!window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)) {
        this.renderEmpty("No session context was found for the provided hostContextId.");
        return;
      }
      this.loadContract(JSON.parse(window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)));
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
      this.renderError("Asset catalog session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!sessionContext.payloadJson.assetCatalog || typeof sessionContext.payloadJson.assetCatalog !== "object" || Array.isArray(sessionContext.payloadJson.assetCatalog)) {
      this.renderError("Asset catalog session data is invalid. Expected payloadJson.assetCatalog.");
      return;
    }
    this.renderCatalog(sessionContext.payloadJson.assetCatalog, sessionContext);
  }

  renderCatalog(assetCatalog, sessionContext) {
    if (typeof assetCatalog.name !== "string" || !assetCatalog.name.trim()) {
      this.renderError("Asset catalog session data is invalid. Expected assetCatalog.name.");
      return;
    }
    if (!Array.isArray(assetCatalog.entries)) {
      this.renderError("Asset catalog session data is invalid. Expected assetCatalog.entries[].");
      return;
    }
    if (assetCatalog.entries.length === 0) {
      this.assets = [];
      document.getElementById("assetBrowserV2SessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
      document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.assetCatalog valid\nentries[] valid but empty";
      document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
      document.getElementById("assetBrowserV2Title").textContent = assetCatalog.name.trim();
      document.getElementById("assetBrowserV2Count").textContent = "0 assets";
      document.getElementById("assetBrowserV2State").textContent = "Asset Browser V2 loaded a valid session asset catalog with zero entries. Add explicit entries to assetCatalog.entries[].";
      document.getElementById("assetBrowserV2List").innerHTML = "";
      document.getElementById("assetBrowserV2Preview").textContent = "";
      return;
    }
    if (assetCatalog.entries.some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.id !== "string" || !entry.id.trim() || typeof entry.label !== "string" || !entry.label.trim() || typeof entry.kind !== "string" || !entry.kind.trim() || typeof entry.path !== "string" || !entry.path.trim())) {
      this.renderError("Asset catalog session data is invalid. Every entry requires id, label, kind, and path.");
      return;
    }
    this.assets = assetCatalog.entries.map((entry) => ({
      id: entry.id.trim(),
      label: entry.label.trim(),
      kind: entry.kind.trim(),
      path: entry.path.trim()
    }));
    document.getElementById("assetBrowserV2SessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.assetCatalog valid\nentries[] valid";
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("assetBrowserV2Title").textContent = assetCatalog.name.trim();
    document.getElementById("assetBrowserV2Count").textContent = `${this.assets.length} asset${this.assets.length === 1 ? "" : "s"}`;
    document.getElementById("assetBrowserV2State").textContent = "Asset Browser V2 loaded the session asset catalog.";
    document.getElementById("assetBrowserV2List").innerHTML = this.assets.map((entry) => `<button type="button" data-asset-id="${this.escapeHtml(entry.id)}"><strong>${this.escapeHtml(entry.label)}</strong><br><span>${this.escapeHtml(entry.kind)} | ${this.escapeHtml(entry.path)}</span></button>`).join("");
    document.getElementById("assetBrowserV2Preview").textContent = "Select an asset entry to inspect its session-backed metadata.";
  }

  bindAssetSelection() {
    document.getElementById("assetBrowserV2List").addEventListener("click", (event) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-asset-id]")) {
        return;
      }
      if (!this.assets.some((entry) => entry.id === event.target.closest("[data-asset-id]").dataset.assetId)) {
        return;
      }
      document.getElementById("assetBrowserV2Preview").textContent = JSON.stringify(this.assets.find((entry) => entry.id === event.target.closest("[data-asset-id]").dataset.assetId), null, 2);
    });
  }

  renderEmpty(message) {
    this.assets = [];
    document.getElementById("assetBrowserV2SessionReadout").textContent = "Session: missing";
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson.assetCatalog not loaded";
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("assetBrowserV2Title").textContent = "No assets loaded";
    document.getElementById("assetBrowserV2Count").textContent = "0 assets";
    document.getElementById("assetBrowserV2State").textContent = message;
    document.getElementById("assetBrowserV2List").innerHTML = "";
    document.getElementById("assetBrowserV2Preview").textContent = "";
  }

  renderError(message) {
    this.assets = [];
    document.getElementById("assetBrowserV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("assetBrowserV2ContractReadout").textContent = "payloadJson.assetCatalog invalid";
    document.getElementById("assetBrowserV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid Asset Browser V2 session data.";
    document.getElementById("assetBrowserV2Title").textContent = "Asset Browser V2 error";
    document.getElementById("assetBrowserV2Count").textContent = "0 assets";
    document.getElementById("assetBrowserV2State").textContent = message;
    document.getElementById("assetBrowserV2List").innerHTML = "";
    document.getElementById("assetBrowserV2Preview").textContent = "";
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
  }
}

new AssetBrowserV2();
