class PaletteManagerToolV2 {
  constructor() {
    console.log("[PALETTE_V2_ENTRY]");
    this.start();
  }

  start() {
    document.title = "Palette Manager V2";
    document.body.dataset.toolId = "palette-manager-v2";
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderEmpty("No hostContextId was provided. Open Palette Manager V2 with a valid Tool V2 session URL.");
        return;
      }
      if (!window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)) {
        this.renderEmpty("No session context was found for the provided hostContextId.");
        return;
      }
      this.loadContract(JSON.parse(window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)));
    } catch (error) {
      this.renderError(`Unable to read Palette Manager V2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  loadContract(sessionContext) {
    console.log("[PALETTE_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing paletteJson.");
      return;
    }
    if (!sessionContext.paletteJson || typeof sessionContext.paletteJson !== "object" || Array.isArray(sessionContext.paletteJson)) {
      this.renderError("Palette session data is invalid. Expected paletteJson only.");
      return;
    }
    this.renderPalette(sessionContext.paletteJson, sessionContext);
  }

  renderPalette(paletteJson, sessionContext) {
    if (typeof paletteJson.name !== "string" || !paletteJson.name.trim()) {
      this.renderError("Palette session data is invalid. Expected paletteJson.name.");
      return;
    }
    if (!Array.isArray(paletteJson.colors) || paletteJson.colors.length === 0) {
      this.renderError("Palette session data is invalid. Expected paletteJson.colors[].");
      return;
    }
    if (paletteJson.colors.some((entry) => !this.colorFrom(entry))) {
      this.renderError("Palette session data is invalid. Every paletteJson.colors[] entry must provide an explicit #RRGGBB or #RRGGBBAA color.");
      return;
    }
    document.getElementById("paletteManagerSessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson loaded\npaletteJson.name valid\npaletteJson.colors[] valid";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("paletteManagerName").textContent = paletteJson.name.trim();
    document.getElementById("paletteManagerCount").textContent = `${paletteJson.colors.length} color${paletteJson.colors.length === 1 ? "" : "s"}`;
    document.getElementById("paletteManagerState").className = "palette-manager-v2-state";
    document.getElementById("paletteManagerState").textContent = "Palette Manager V2 loaded the session palette.";
    document.getElementById("paletteManagerSwatches").innerHTML = paletteJson.colors.map((entry) => `<article class="palette-manager-v2-swatch"><div class="palette-manager-v2-chip" style="background:${this.escapeHtml(this.colorFrom(entry))}"></div><div class="palette-manager-v2-swatch-body"><div>${this.escapeHtml(this.labelFrom(entry))}</div><div>${this.escapeHtml(this.colorFrom(entry))}</div></div></article>`).join("");
  }

  renderEmpty(message) {
    document.getElementById("paletteManagerSessionReadout").textContent = "Session: missing";
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson not loaded";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("paletteManagerName").textContent = "No palette loaded";
    document.getElementById("paletteManagerCount").textContent = "0 colors";
    document.getElementById("paletteManagerState").className = "palette-manager-v2-state";
    document.getElementById("paletteManagerState").textContent = message;
    document.getElementById("paletteManagerSwatches").innerHTML = "";
  }

  renderError(message) {
    document.getElementById("paletteManagerSessionReadout").textContent = "Session: read attempted";
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson invalid";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace writes are disabled for invalid Palette Manager V2 session data.";
    document.getElementById("paletteManagerName").textContent = "Palette Manager V2 error";
    document.getElementById("paletteManagerCount").textContent = "0 colors";
    document.getElementById("paletteManagerState").className = "palette-manager-v2-state palette-manager-v2-state--error";
    document.getElementById("paletteManagerState").textContent = message;
    document.getElementById("paletteManagerSwatches").innerHTML = "";
  }

  colorFrom(entry) {
    if (typeof entry === "string" && /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(entry.trim())) {
      return entry.trim().toUpperCase();
    }
    if (entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.hex === "string" && /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(entry.hex.trim())) {
      return entry.hex.trim().toUpperCase();
    }
    if (entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.color === "string" && /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(entry.color.trim())) {
      return entry.color.trim().toUpperCase();
    }
    return "";
  }

  labelFrom(entry) {
    if (entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.name === "string" && entry.name.trim()) {
      return entry.name.trim();
    }
    return this.colorFrom(entry);
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
  }
}

new PaletteManagerToolV2();
