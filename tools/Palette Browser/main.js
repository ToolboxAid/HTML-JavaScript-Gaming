import { resolvePaletteSessionFromLocation } from "../common/sessionContext.js";
import { validatePaletteContract } from "../common/toolContract.js";

console.log("[PALETTE_V2_ENTRY]", {
  path: window.location.pathname,
  search: window.location.search
});

class PaletteManagerRefs {
  constructor(root = document) {
    this.headerAccordion = root.querySelector("[data-header-accordion]");
    this.contextReadout = root.getElementById("contextReadout");
    this.contractReadout = root.getElementById("contractReadout");
    this.workspaceReadout = root.getElementById("workspaceReadout");
    this.validationReadout = root.getElementById("validationReadout");
    this.paletteName = root.getElementById("paletteName");
    this.swatchCount = root.getElementById("swatchCount");
    this.paletteMessage = root.getElementById("paletteMessage");
    this.swatchGrid = root.getElementById("swatchGrid");
  }
}

class HeaderAccordionController {
  constructor(refs) {
    this.accordion = refs.headerAccordion;
  }

  bind() {
    if (!(this.accordion instanceof HTMLDetailsElement)) {
      return;
    }
    this.accordion.addEventListener("toggle", () => {
      this.accordion.dataset.state = this.accordion.open ? "open" : "closed";
    });
    this.accordion.dataset.state = this.accordion.open ? "open" : "closed";
  }
}

class MenuReadoutController {
  constructor(refs) {
    this.refs = refs;
  }

  setContext(sessionResult) {
    const contextId = sessionResult.contextId || "none";
    const source = sessionResult.source || "none";
    const found = sessionResult.found ? "found" : "missing";
    this.refs.contextReadout.textContent = `Palette Manager session: ${found}\nSource: ${source}\nContext: ${contextId}`;
    this.refs.workspaceReadout.textContent = sessionResult.found
      ? "Palette Manager read the workspace/session context. Workspace write controls are deferred."
      : "Palette Manager did not find workspace/session context for this launch.";
  }

  setContract(contractResult) {
    const status = contractResult.valid ? "valid" : "invalid";
    this.refs.contractReadout.textContent = `Palette Manager contract: ${status}`;
    this.refs.validationReadout.textContent = contractResult.valid
      ? "paletteJson.name and paletteJson.colors[] are valid."
      : contractResult.issues.join("\n");
  }
}

class PaletteSwatchRenderer {
  renderSwatches(colors) {
    return colors.map((entry) => this.renderSwatch(entry)).join("");
  }

  renderSwatch(entry) {
    const name = this.escapeHtml(entry.name || entry.hex);
    const hex = this.escapeHtml(entry.hex);
    const symbol = this.escapeHtml(entry.symbol || "");
    return `
      <article class="palette-manager__swatch">
        <div class="palette-manager__swatch-chip" style="background:${hex}"></div>
        <div class="palette-manager__swatch-body">
          <div class="palette-manager__swatch-name">${name}</div>
          <div class="palette-manager__swatch-hex">${hex}</div>
          ${symbol ? `<div class="palette-manager__swatch-symbol">Symbol: ${symbol}</div>` : ""}
        </div>
      </article>
    `;
  }

  renderIssues(issues) {
    if (!Array.isArray(issues) || issues.length === 0) {
      return "";
    }
    return `<ul class="palette-manager__issues">${issues.map((issue) => `<li>${this.escapeHtml(issue)}</li>`).join("")}</ul>`;
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;"
    }[character]));
  }
}

class PaletteStateRenderer {
  constructor(refs, swatchRenderer) {
    this.refs = refs;
    this.swatchRenderer = swatchRenderer;
  }

  renderEmpty() {
    this.refs.paletteName.textContent = "No palette loaded";
    this.refs.swatchCount.textContent = "0 colors";
    this.refs.paletteMessage.className = "tool-state-empty";
    this.refs.paletteMessage.textContent = "No Palette Manager session data found. Open Palette Manager with a valid Tool v2 session context.";
    this.refs.swatchGrid.innerHTML = "";
  }

  renderError(issues) {
    this.refs.paletteName.textContent = "Palette Manager session error";
    this.refs.swatchCount.textContent = "0 colors";
    this.refs.paletteMessage.className = "tool-state-error";
    this.refs.paletteMessage.innerHTML = `<strong>Palette session data is invalid. Expected paletteJson.name and paletteJson.colors[].</strong>${this.swatchRenderer.renderIssues(issues)}`;
    this.refs.swatchGrid.innerHTML = "";
  }

  renderPalette(palette) {
    this.refs.paletteName.textContent = palette.name;
    this.refs.swatchCount.textContent = `${palette.colors.length} color${palette.colors.length === 1 ? "" : "s"}`;
    this.refs.paletteMessage.className = "tool-state-empty";
    this.refs.paletteMessage.textContent = "Palette Manager loaded session-backed paletteJson.";
    this.refs.swatchGrid.innerHTML = this.swatchRenderer.renderSwatches(palette.colors);
  }
}

class PaletteManagerApp {
  constructor() {
    this.refs = new PaletteManagerRefs();
    this.headerAccordion = new HeaderAccordionController(this.refs);
    this.menuReadouts = new MenuReadoutController(this.refs);
    this.swatchRenderer = new PaletteSwatchRenderer();
    this.stateRenderer = new PaletteStateRenderer(this.refs, this.swatchRenderer);
  }

  async start() {
    this.headerAccordion.bind();
    const sessionResult = await this.readSessionContext();
    this.menuReadouts.setContext(sessionResult);

    if (!sessionResult.paletteJson) {
      const emptyContract = {
        valid: false,
        issues: sessionResult.errors || ["No paletteJson was found in Palette Manager session context."],
        palette: null
      };
      this.menuReadouts.setContract(emptyContract);
      this.stateRenderer.renderEmpty();
      return;
    }

    const contractResult = validatePaletteContract(sessionResult.paletteJson);
    console.log("[PALETTE_V2_CONTRACT_LOADED]", {
      valid: contractResult.valid,
      name: contractResult.palette?.name || "",
      colorCount: contractResult.palette?.colors.length || 0,
      issueCount: contractResult.issues.length
    });
    this.menuReadouts.setContract(contractResult);

    if (!contractResult.valid) {
      this.stateRenderer.renderError(contractResult.issues);
      return;
    }

    this.stateRenderer.renderPalette(contractResult.palette);
  }

  async readSessionContext() {
    try {
      const sessionResult = await resolvePaletteSessionFromLocation(window.location);
      console.log("[SESSION_CONTEXT_READ]", {
        found: sessionResult.found,
        source: sessionResult.source,
        contextId: sessionResult.contextId,
        hasPaletteJson: Boolean(sessionResult.paletteJson)
      });
      return sessionResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to read Palette Manager session context.";
      const sessionResult = {
        found: false,
        source: "error",
        contextId: "",
        paletteJson: null,
        errors: [message]
      };
      console.log("[SESSION_CONTEXT_READ]", {
        found: false,
        source: "error",
        contextId: "",
        hasPaletteJson: false
      });
      return sessionResult;
    }
  }
}

const app = new PaletteManagerApp();
void app.start();
