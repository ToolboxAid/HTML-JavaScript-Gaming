class PaletteManagerV2 {
  constructor() {
    console.log("[PaletteManagerV2]");
    this.sessionPayloadBytesLimit = 1024 * 1024;
    document.title = "Palette Manager V2";
    document.body.dataset.toolId = "palette-manager-v2";
    this.urlState = this.readUrlState();
    this.goBack = this.goBack.bind(this);
    this.openVectorMapEditorV2 = this.openVectorMapEditorV2.bind(this);
    this.handleNavigationState = this.handleNavigationState.bind(this);
    window.addEventListener("popstate", this.handleNavigationState);
    window.addEventListener("pageshow", this.handleNavigationState);
    document.getElementById("paletteManagerBackButton").addEventListener("click", this.goBack);
    document.getElementById("paletteManagerOpenVectorMapEditorV2Button").addEventListener("click", this.openVectorMapEditorV2);
    this.renderNavigation();
    this.readSession();
  }

  goBack() {
    const targetToolId = this.toolLabel(this.urlState.fromTool) ? this.urlState.fromTool : "workspace-v2";
    window.location.href = this.buildToolUrl(targetToolId).toString();
  }

  openVectorMapEditorV2() {
    if (!this.urlState.hostContextId) {
      this.renderMissing("No hostContextId is available for launch. Re-open Palette Manager V2 from a valid Tool V2 session link.");
      return;
    }
    const targetUrl = this.buildToolUrl("vector-map-editor-v2");
    targetUrl.searchParams.set("fromTool", "palette-manager-v2");
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
    document.getElementById("paletteManagerBreadcrumb").textContent = `Workspace V2 -> ${sourceLabel} -> Palette Manager V2`;
    document.getElementById("paletteManagerBackButton").textContent = `Back to ${sourceLabel}`;
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

  logStructuredError(type, message, details) {
    console.error({
      tool: "palette-manager-v2",
      type,
      message,
      details: details && typeof details === "object" ? details : {}
    });
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!this.urlState.hostContextId) {
        this.renderMissing("No hostContextId was provided. Re-open Palette Manager V2 from a valid Tool V2 session link.");
        return;
      }
      const serializedSession = window.sessionStorage.getItem(
        this.urlState.hostContextId
      );
      if (
        !serializedSession
      ) {
        this.renderMissing("No session data was found for the provided hostContextId. Re-open Palette Manager V2 from the tools index or a host flow that creates the session context first.");
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
      const runtimeMessage = `Unable to read Palette Manager V2 session context: ${error instanceof Error ? error.message : "unknown error"}`;
      this.logStructuredError("RUNTIME", runtimeMessage, { hostContextId: this.urlState.hostContextId || "" });
      this.renderError(runtimeMessage);
    }
  }

  loadContract(sessionContext) {
    console.log("[PALETTE_MANAGER_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing paletteJson.");
      return;
    }
    const versionCheck = this.handleSessionVersion(sessionContext);
    if (!versionCheck.ok) {
      this.renderError(versionCheck.error);
      return;
    }
    if (!versionCheck.payload.paletteJson || typeof versionCheck.payload.paletteJson !== "object" || Array.isArray(versionCheck.payload.paletteJson)) {
      this.renderError("Palette Manager V2 session data is invalid. Expected paletteJson only.");
      return;
    }
    this.renderPalette(versionCheck.payload.paletteJson, versionCheck.payload);
  }

  renderPalette(paletteJson, sessionContext) {
    if (typeof paletteJson.name !== "string" || !paletteJson.name.trim()) {
      this.renderError("Palette Manager V2 session data is invalid. Expected paletteJson.name.");
      return;
    }
    if (!Array.isArray(paletteJson.colors)) {
      this.renderError("Palette Manager V2 session data is invalid. Expected paletteJson.colors[].");
      return;
    }

    const normalizedColors = [];
    for (let index = 0; index < paletteJson.colors.length; index += 1) {
      let colorValue = "";
      let colorLabel = "";
      if (typeof paletteJson.colors[index] === "string") {
        colorValue = paletteJson.colors[index].trim().toUpperCase();
        colorLabel = colorValue;
      }
      if (
        paletteJson.colors[index] &&
        typeof paletteJson.colors[index] === "object" &&
        !Array.isArray(paletteJson.colors[index]) &&
        typeof paletteJson.colors[index].hex === "string"
      ) {
        colorValue = paletteJson.colors[index].hex.trim().toUpperCase();
        colorLabel = typeof paletteJson.colors[index].name === "string" && paletteJson.colors[index].name.trim()
          ? paletteJson.colors[index].name.trim()
          : colorValue;
      }
      if (
        paletteJson.colors[index] &&
        typeof paletteJson.colors[index] === "object" &&
        !Array.isArray(paletteJson.colors[index]) &&
        typeof paletteJson.colors[index].color === "string"
      ) {
        colorValue = paletteJson.colors[index].color.trim().toUpperCase();
        colorLabel = typeof paletteJson.colors[index].name === "string" && paletteJson.colors[index].name.trim()
          ? paletteJson.colors[index].name.trim()
          : colorValue;
      }
      if (!/^#([0-9A-F]{6}|[0-9A-F]{8})$/.test(colorValue)) {
        this.renderError("Palette Manager V2 session data is invalid. Every paletteJson.colors[] entry must include #RRGGBB or #RRGGBBAA.");
        return;
      }
      normalizedColors.push({ label: colorLabel, color: colorValue });
    }

    document.getElementById("paletteManagerSessionReadout").textContent = `Session: loaded\nContext: ${this.urlState.hostContextId}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}${this.optionalUrlStateSummary() ? `\nURL State: ${this.optionalUrlStateSummary()}` : ""}`;
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson loaded\npaletteJson.name valid\npaletteJson.colors[] valid";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("paletteManagerName").textContent = paletteJson.name.trim();
    document.getElementById("paletteManagerCount").textContent = `${normalizedColors.length} color${normalizedColors.length === 1 ? "" : "s"}`;
    document.getElementById("paletteManagerState").textContent = normalizedColors.length === 0
      ? "Palette Manager V2 loaded a valid session palette with zero colors."
      : "Palette Manager V2 loaded the session palette.";
    document.getElementById("paletteManagerEmptyState").hidden = true;
    document.getElementById("paletteManagerInvalidState").hidden = true;
    document.getElementById("paletteManagerValidState").hidden = false;

    document.getElementById("paletteManagerSwatches").replaceChildren();
    normalizedColors.forEach((entry) => {
      const swatch = document.createElement("article");
      const chip = document.createElement("div");
      const swatchBody = document.createElement("div");
      const swatchName = document.createElement("div");
      const swatchColor = document.createElement("div");
      swatch.className = "palette-manager-v2-swatch";
      chip.className = "palette-manager-v2-chip";
      chip.style.backgroundColor = entry.color;
      swatchBody.className = "palette-manager-v2-swatch-body";
      swatchName.textContent = entry.label;
      swatchColor.textContent = entry.color;
      swatchBody.append(swatchName, swatchColor);
      swatch.append(chip, swatchBody);
      document.getElementById("paletteManagerSwatches").appendChild(swatch);
    });
  }

  renderMissing(message) {
    this.logStructuredError("EMPTY", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("paletteManagerSessionReadout").textContent = "Session: missing";
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson not loaded";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("paletteManagerName").textContent = "No palette loaded";
    document.getElementById("paletteManagerCount").textContent = "0 colors";
    document.getElementById("paletteManagerEmptyState").textContent = message;
    document.getElementById("paletteManagerEmptyState").hidden = false;
    document.getElementById("paletteManagerInvalidState").hidden = true;
    document.getElementById("paletteManagerValidState").hidden = true;
    document.getElementById("paletteManagerSwatches").replaceChildren();
  }

  renderError(message) {
    this.logStructuredError("INVALID", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("paletteManagerSessionReadout").textContent = "Session: read attempted";
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson invalid";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace writes are disabled for invalid Palette Manager V2 session data.";
    document.getElementById("paletteManagerName").textContent = "Palette Manager V2 error";
    document.getElementById("paletteManagerCount").textContent = "0 colors";
    document.getElementById("paletteManagerInvalidState").textContent = `${message} Re-open Palette Manager V2 from a host session that provides paletteJson.`;
    document.getElementById("paletteManagerEmptyState").hidden = true;
    document.getElementById("paletteManagerInvalidState").hidden = false;
    document.getElementById("paletteManagerValidState").hidden = true;
    document.getElementById("paletteManagerSwatches").replaceChildren();
  }
}

new PaletteManagerV2();
