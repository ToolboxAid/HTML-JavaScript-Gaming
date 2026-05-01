class PaletteManagerV2 {
  constructor() {
    console.log("[PaletteManagerV2]");
    document.title = "Palette Manager V2";
    document.body.dataset.toolId = "palette-manager-v2";
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderMissing("No hostContextId was provided. Re-open Palette Manager V2 from a valid Tool V2 session link.");
        return;
      }
      if (
        !window.sessionStorage.getItem(
          `toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`
        )
      ) {
        this.renderError("No session context was found for the provided hostContextId. Re-open Palette Manager V2 from a host session that provides a valid hostContextId.");
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
      this.renderError(`Unable to read Palette Manager V2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  loadContract(sessionContext) {
    console.log("[PALETTE_MANAGER_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing paletteJson.");
      return;
    }
    if (!sessionContext.paletteJson || typeof sessionContext.paletteJson !== "object" || Array.isArray(sessionContext.paletteJson)) {
      this.renderError("Palette Manager V2 session data is invalid. Expected paletteJson only.");
      return;
    }
    this.renderPalette(sessionContext.paletteJson, sessionContext);
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

    document.getElementById("paletteManagerSessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
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
