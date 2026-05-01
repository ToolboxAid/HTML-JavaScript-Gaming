class SvgAssetStudioV2 {
  constructor() {
    console.log("[SvgAssetStudioV2]");
    this.previewObjectUrl = "";
    document.title = "SVG Asset Studio V2";
    document.body.dataset.toolId = "svg-asset-studio-v2";
    this.urlState = this.readUrlState();
    this.goBack = this.goBack.bind(this);
    this.handleNavigationState = this.handleNavigationState.bind(this);
    window.addEventListener("popstate", this.handleNavigationState);
    window.addEventListener("pageshow", this.handleNavigationState);
    document.getElementById("svgV2BackButton").addEventListener("click", this.goBack);
    this.renderNavigation();
    this.readSession();
  }

  goBack() {
    const targetToolId = this.toolLabel(this.urlState.fromTool) ? this.urlState.fromTool : "workspace-v2";
    window.location.href = this.buildToolUrl(targetToolId).toString();
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
    document.getElementById("svgV2Breadcrumb").textContent = `Workspace V2 -> ${sourceLabel} -> SVG Asset Studio V2`;
    document.getElementById("svgV2BackButton").textContent = `Back to ${sourceLabel}`;
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

  logStructuredError(type, message, details) {
    console.error({
      tool: "svg-asset-studio-v2",
      type,
      message,
      details: details && typeof details === "object" ? details : {}
    });
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!this.urlState.hostContextId) {
        this.renderMissing("No hostContextId was provided. Re-open SVG Asset Studio V2 from a valid Tool V2 session link.");
        return;
      }
      if (
        !window.sessionStorage.getItem(
          this.urlState.hostContextId
        )
      ) {
        this.renderMissing("No session data was found for the provided hostContextId. Re-open SVG Asset Studio V2 from the tools index or a host flow that creates the session context first.");
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
      const runtimeMessage = `Unable to read SVG Asset Studio V2 session context: ${error instanceof Error ? error.message : "unknown error"}`;
      this.logStructuredError("RUNTIME", runtimeMessage, { hostContextId: this.urlState.hostContextId || "" });
      this.renderError(runtimeMessage);
    }
  }

  loadContract(sessionContext) {
    console.log("[SVG_ASSET_STUDIO_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.vectorAssetDocument.");
      return;
    }
    if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
      this.renderError("SVG Asset Studio V2 session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!sessionContext.payloadJson.vectorAssetDocument || typeof sessionContext.payloadJson.vectorAssetDocument !== "object" || Array.isArray(sessionContext.payloadJson.vectorAssetDocument)) {
      this.renderError("SVG Asset Studio V2 session data is invalid. Expected payloadJson.vectorAssetDocument.");
      return;
    }
    this.renderSvg(sessionContext.payloadJson.vectorAssetDocument, sessionContext);
  }

  renderSvg(vectorAssetDocument, sessionContext) {
    if (typeof vectorAssetDocument.sourceName !== "string" || !vectorAssetDocument.sourceName.trim()) {
      this.renderError("SVG Asset Studio V2 session data is invalid. Expected vectorAssetDocument.sourceName.");
      return;
    }
    if (typeof vectorAssetDocument.svgText !== "string" || !vectorAssetDocument.svgText.trim()) {
      this.renderError("SVG Asset Studio V2 session data is invalid. Expected vectorAssetDocument.svgText.");
      return;
    }
    if (!/^\s*<svg[\s>]/i.test(vectorAssetDocument.svgText)) {
      this.renderError("SVG Asset Studio V2 session data is invalid. svgText must start with an <svg> document.");
      return;
    }

    document.getElementById("svgV2SessionReadout").textContent = `Session: loaded\nContext: ${this.urlState.hostContextId}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}${this.optionalUrlStateSummary() ? `\nURL State: ${this.optionalUrlStateSummary()}` : ""}`;
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson loaded\npayloadJson.vectorAssetDocument valid\nsvgText valid";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("svgV2AssetName").textContent = vectorAssetDocument.sourceName.trim();
    document.getElementById("svgV2StatusBadge").textContent = `${vectorAssetDocument.svgText.length} bytes`;
    document.getElementById("svgV2State").textContent = "SVG Asset Studio V2 loaded the session SVG asset.";
    document.getElementById("svgV2EmptyState").hidden = true;
    document.getElementById("svgV2InvalidState").hidden = true;
    document.getElementById("svgV2ValidState").hidden = false;

    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = "";
    }
    this.previewObjectUrl = URL.createObjectURL(new Blob([vectorAssetDocument.svgText], { type: "image/svg+xml" }));
    document.getElementById("svgV2Frame").replaceChildren();
    const svgImage = document.createElement("img");
    svgImage.alt = vectorAssetDocument.sourceName.trim();
    svgImage.src = this.previewObjectUrl;
    document.getElementById("svgV2Frame").appendChild(svgImage);
  }

  renderMissing(message) {
    this.logStructuredError("EMPTY", message, { hostContextId: this.urlState.hostContextId || "" });
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = "";
    }
    document.getElementById("svgV2SessionReadout").textContent = "Session: missing";
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson.vectorAssetDocument not loaded";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("svgV2AssetName").textContent = "No SVG loaded";
    document.getElementById("svgV2StatusBadge").textContent = "0 bytes";
    document.getElementById("svgV2EmptyState").textContent = message;
    document.getElementById("svgV2EmptyState").hidden = false;
    document.getElementById("svgV2InvalidState").hidden = true;
    document.getElementById("svgV2ValidState").hidden = true;
    document.getElementById("svgV2Frame").replaceChildren();
  }

  renderError(message) {
    this.logStructuredError("INVALID", message, { hostContextId: this.urlState.hostContextId || "" });
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = "";
    }
    document.getElementById("svgV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson.vectorAssetDocument invalid";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid SVG Asset Studio V2 session data.";
    document.getElementById("svgV2AssetName").textContent = "SVG Asset Studio V2 error";
    document.getElementById("svgV2StatusBadge").textContent = "0 bytes";
    document.getElementById("svgV2InvalidState").textContent = `${message} Re-open SVG Asset Studio V2 from a host session that provides payloadJson.vectorAssetDocument.`;
    document.getElementById("svgV2EmptyState").hidden = true;
    document.getElementById("svgV2InvalidState").hidden = false;
    document.getElementById("svgV2ValidState").hidden = true;
    document.getElementById("svgV2Frame").replaceChildren();
  }
}

new SvgAssetStudioV2();
