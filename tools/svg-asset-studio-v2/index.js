class SvgAssetStudioV2 {
  constructor() {
    console.log("[SvgAssetStudioV2]");
    this.previewObjectUrl = "";
    document.title = "SVG Asset Studio V2";
    document.body.dataset.toolId = "svg-asset-studio-v2";
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderMissing("No hostContextId was provided. Re-open SVG Asset Studio V2 from a valid Tool V2 session link.");
        return;
      }
      if (
        !window.sessionStorage.getItem(
          `toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`
        )
      ) {
        this.renderError("No session context was found for the provided hostContextId. Re-open SVG Asset Studio V2 from a host session that provides a valid hostContextId.");
        return;
      }
      this.loadContract(
        JSON.parse(
          window.sessionStorage.getItem(
            `toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`
          )
        )
      );
    } catch (error) {
      this.renderError(`Unable to read SVG Asset Studio V2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
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

    document.getElementById("svgV2SessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
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
