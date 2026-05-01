class SvgAssetStudioV2 {
  constructor() {
    console.log("[SVG_V2_ENTRY]");
    this.start();
  }

  start() {
    document.title = "SVG Asset Studio V2";
    document.body.dataset.toolId = "svg-asset-studio-v2";
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (new URL(window.location.href).searchParams.get("payloadJson")) {
        this.writeUrlPayloadToSession();
      }
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderEmpty("No hostContextId was provided. Open SVG Asset Studio V2 with a valid Tool V2 session URL.");
        return;
      }
      if (!window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)) {
        this.renderEmpty("No session context was found for the provided hostContextId.");
        return;
      }
      this.loadContract(JSON.parse(window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)));
    } catch (error) {
      this.renderError(`Unable to read SVG Asset Studio V2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  writeUrlPayloadToSession() {
    this.sessionContextId = new URL(window.location.href).searchParams.get("sessionId") || `svg-asset-studio-v2-${Date.now().toString(36)}`;
    window.sessionStorage.setItem(`toolboxaid.toolHost.context.${this.sessionContextId}`, JSON.stringify({
      schema: "tools.svg-asset-studio-v2.session/1",
      contextId: this.sessionContextId,
      toolId: "svg-asset-studio-v2",
      payloadJson: JSON.parse(new URL(window.location.href).searchParams.get("payloadJson"))
    }));
    window.history.replaceState(null, "", `${window.location.pathname}?hostContextId=${this.sessionContextId}`);
  }

  loadContract(sessionContext) {
    console.log("[SVG_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.vectorAssetDocument.");
      return;
    }
    if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
      this.renderError("SVG session data is invalid. Expected payloadJson only.");
      return;
    }
    this.renderSvg(sessionContext.payloadJson, sessionContext);
  }

  renderSvg(payloadJson, sessionContext) {
    if (!payloadJson.vectorAssetDocument || typeof payloadJson.vectorAssetDocument !== "object" || Array.isArray(payloadJson.vectorAssetDocument)) {
      this.renderError("SVG session data is invalid. Expected payloadJson.vectorAssetDocument.");
      return;
    }
    if (typeof payloadJson.vectorAssetDocument.svgText !== "string" || !payloadJson.vectorAssetDocument.svgText.trim()) {
      this.renderError("SVG session data is invalid. Expected payloadJson.vectorAssetDocument.svgText.");
      return;
    }
    if (!/^\s*<svg[\s>]/i.test(payloadJson.vectorAssetDocument.svgText)) {
      this.renderError("SVG session data is invalid. svgText must start with an <svg> document.");
      return;
    }
    document.getElementById("svgV2SessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson loaded\npayloadJson.vectorAssetDocument valid\nsvgText valid";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("svgV2AssetName").textContent = typeof payloadJson.vectorAssetDocument.sourceName === "string" && payloadJson.vectorAssetDocument.sourceName.trim() ? payloadJson.vectorAssetDocument.sourceName.trim() : "Inline SVG";
    document.getElementById("svgV2StatusBadge").textContent = `${payloadJson.vectorAssetDocument.svgText.length} bytes`;
    document.getElementById("svgV2State").className = "svg-v2-state";
    document.getElementById("svgV2State").textContent = "SVG Asset Studio V2 loaded the session SVG asset.";
    document.getElementById("svgV2Frame").innerHTML = `<img alt="${this.escapeHtml(document.getElementById("svgV2AssetName").textContent)}" src="${URL.createObjectURL(new Blob([payloadJson.vectorAssetDocument.svgText], { type: "image/svg+xml" }))}" />`;
  }

  renderEmpty(message) {
    document.getElementById("svgV2SessionReadout").textContent = "Session: missing";
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson.vectorAssetDocument not loaded";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("svgV2AssetName").textContent = "No SVG loaded";
    document.getElementById("svgV2StatusBadge").textContent = "0 bytes";
    document.getElementById("svgV2State").className = "svg-v2-state";
    document.getElementById("svgV2State").textContent = message;
    document.getElementById("svgV2Frame").innerHTML = "";
  }

  renderError(message) {
    document.getElementById("svgV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson.vectorAssetDocument invalid";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid SVG Asset Studio V2 session data.";
    document.getElementById("svgV2AssetName").textContent = "SVG Asset Studio V2 error";
    document.getElementById("svgV2StatusBadge").textContent = "0 bytes";
    document.getElementById("svgV2State").className = "svg-v2-state svg-v2-state--error";
    document.getElementById("svgV2State").textContent = message;
    document.getElementById("svgV2Frame").innerHTML = "";
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
  }
}

new SvgAssetStudioV2();
