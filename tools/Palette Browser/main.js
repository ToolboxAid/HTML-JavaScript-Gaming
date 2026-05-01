import { resolvePaletteSessionFromLocation } from "../common/sessionContext.js";
import { validatePaletteContract } from "../common/toolContract.js";

console.log("[PALETTE_V2_ENTRY]", {
  path: window.location.pathname,
  search: window.location.search
});

class PaletteDomRefs {
  constructor(root = document) {
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

class PaletteStatusPanel {
  constructor(refs) {
    this.refs = refs;
  }

  setContext(sessionResult) {
    const contextId = sessionResult.contextId || "none";
    const source = sessionResult.source || "none";
    const found = sessionResult.found ? "found" : "missing";
    this.refs.contextReadout.textContent = `Session: ${found}\nSource: ${source}\nContext: ${contextId}`;
    this.refs.workspaceReadout.textContent = sessionResult.found
      ? "Workspace/session context was read. Workspace write controls are deferred."
      : "No workspace/session context is available for this launch.";
  }

  setContract(contractResult) {
    const status = contractResult.valid ? "valid" : "invalid";
    this.refs.contractReadout.textContent = `Palette contract: ${status}`;
    this.refs.validationReadout.textContent = contractResult.valid
      ? "paletteJson.name and paletteJson.colors[] are valid."
      : contractResult.issues.join("\n");
  }
}

class PaletteView {
  constructor(refs) {
    this.refs = refs;
  }

  renderEmpty() {
    this.refs.paletteName.textContent = "No palette loaded";
    this.refs.swatchCount.textContent = "0 colors";
    this.refs.paletteMessage.className = "tool-state-empty";
    this.refs.paletteMessage.textContent = "No palette session data exists for this launch.";
    this.refs.swatchGrid.innerHTML = "";
  }

  renderError(issues) {
    this.refs.paletteName.textContent = "Palette session error";
    this.refs.swatchCount.textContent = "0 colors";
    this.refs.paletteMessage.className = "tool-state-error";
    this.refs.paletteMessage.innerHTML = `<strong>Malformed palette session data.</strong>${this.renderIssues(issues)}`;
    this.refs.swatchGrid.innerHTML = "";
  }

  renderPalette(palette) {
    this.refs.paletteName.textContent = palette.name;
    this.refs.swatchCount.textContent = `${palette.colors.length} color${palette.colors.length === 1 ? "" : "s"}`;
    this.refs.paletteMessage.className = "tool-state-empty";
    this.refs.paletteMessage.textContent = palette.colors.length
      ? "Loaded from session-backed paletteJson."
      : "Palette contract is valid and contains zero colors.";
    this.refs.swatchGrid.innerHTML = palette.colors.map((entry) => this.renderSwatch(entry)).join("");
  }

  renderSwatch(entry) {
    const name = this.escapeHtml(entry.name || entry.hex);
    const hex = this.escapeHtml(entry.hex);
    const symbol = this.escapeHtml(entry.symbol || "");
    return `
      <article class="palette-browser__swatch">
        <div class="palette-browser__swatch-chip" style="background:${hex}"></div>
        <div class="palette-browser__swatch-body">
          <div class="palette-browser__swatch-name">${name}</div>
          <div class="palette-browser__swatch-hex">${hex}</div>
          ${symbol ? `<div class="palette-browser__swatch-symbol">Symbol: ${symbol}</div>` : ""}
        </div>
      </article>
    `;
  }

  renderIssues(issues) {
    if (!Array.isArray(issues) || issues.length === 0) {
      return "";
    }
    return `<ul class="palette-browser__issues">${issues.map((issue) => `<li>${this.escapeHtml(issue)}</li>`).join("")}</ul>`;
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;"
    }[character]));
  }
}

class PaletteBrowserApp {
  constructor() {
    this.refs = new PaletteDomRefs();
    this.statusPanel = new PaletteStatusPanel(this.refs);
    this.view = new PaletteView(this.refs);
  }

  async start() {
    let sessionResult;
    try {
      sessionResult = await resolvePaletteSessionFromLocation(window.location);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to read session context.";
      sessionResult = {
        found: false,
        source: "error",
        contextId: "",
        paletteJson: null,
        errors: [message]
      };
    }

    console.log("[SESSION_CONTEXT_READ]", {
      found: sessionResult.found,
      source: sessionResult.source,
      contextId: sessionResult.contextId,
      hasPaletteJson: Boolean(sessionResult.paletteJson)
    });
    this.statusPanel.setContext(sessionResult);

    if (!sessionResult.paletteJson) {
      const emptyContract = {
        valid: false,
        issues: sessionResult.errors || ["No paletteJson was found in session context."],
        palette: null
      };
      this.statusPanel.setContract(emptyContract);
      this.view.renderEmpty();
      return;
    }

    const contractResult = validatePaletteContract(sessionResult.paletteJson);
    console.log("[PALETTE_V2_CONTRACT_LOADED]", {
      valid: contractResult.valid,
      name: contractResult.palette?.name || "",
      colorCount: contractResult.palette?.colors.length || 0,
      issueCount: contractResult.issues.length
    });
    this.statusPanel.setContract(contractResult);

    if (!contractResult.valid) {
      this.view.renderError(contractResult.issues);
      return;
    }

    this.view.renderPalette(contractResult.palette);
  }
}

const app = new PaletteBrowserApp();
void app.start();
