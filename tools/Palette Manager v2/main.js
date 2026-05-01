class PaletteManagerToolV2 {
  constructor() {
    console.log("[PALETTE_V2_ENTRY]");
    this.start();
  }

  start() {
    document.title = "Palette Manager V2";
    document.body.className = "hub-page-home hub-page-home--viewport";
    document.body.dataset.toolId = "palette-manager";
    document.head.insertAdjacentHTML("beforeend", `
      <link rel="stylesheet" href="../../src/engine/theme/main.css" />
      <link rel="stylesheet" href="../../src/engine/ui/hubCommon.css" />
      <style>
        body[data-tool-id="palette-manager"] .page-shell { padding-bottom: 48px; }
        body[data-tool-id="palette-manager"] #shared-theme-header + .page-shell { padding-top: 32px; }
        body[data-tool-id="palette-manager"] .is-collapsible { margin-top: 18px; }
        body[data-tool-id="palette-manager"] .is-collapsible__summary { font-weight: 800; }
        body[data-tool-id="palette-manager"] .palette-manager-grid { display: grid; grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.6fr); gap: 18px; }
        body[data-tool-id="palette-manager"] .palette-manager-panel { border: 1px solid var(--line); border-radius: 18px; background: linear-gradient(180deg, var(--panel) 0%, var(--panel2) 100%); padding: 18px; box-shadow: 0 18px 36px rgba(0, 0, 0, 0.18); }
        body[data-tool-id="palette-manager"] .palette-manager-readout { white-space: pre-line; color: var(--muted); }
        body[data-tool-id="palette-manager"] .palette-manager-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 14px; margin-top: 18px; }
        body[data-tool-id="palette-manager"] .palette-manager-swatch { overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: var(--surface-inline, rgba(43, 16, 91, 0.9)); }
        body[data-tool-id="palette-manager"] .palette-manager-chip { min-height: 86px; border-bottom: 1px solid var(--line); }
        body[data-tool-id="palette-manager"] .palette-manager-swatch-body { display: grid; gap: 4px; padding: 12px; }
        body[data-tool-id="palette-manager"] .palette-manager-swatch-name { color: var(--text); font-weight: 800; overflow-wrap: anywhere; }
        body[data-tool-id="palette-manager"] .palette-manager-swatch-meta { color: var(--muted); overflow-wrap: anywhere; }
        body[data-tool-id="palette-manager"] .palette-manager-state { border: 1px dashed var(--line); border-radius: 16px; color: var(--muted); padding: 14px; }
        body[data-tool-id="palette-manager"] .palette-manager-state--error { border-style: solid; border-color: #fca5a5; color: #fecaca; }
        body[data-tool-id="palette-manager"] .palette-manager-count { display: inline-block; margin-top: 10px; }
        @media (max-width: 820px) { body[data-tool-id="palette-manager"] .palette-manager-grid { grid-template-columns: 1fr; } }
      </style>
    `);
    document.body.innerHTML = `
      <div id="shared-theme-header"></div>
      <main class="page-shell">
        <section class="content-section">
          <details class="is-collapsible" open>
            <summary class="is-collapsible__summary">Palette Manager V2 Session</summary>
            <div class="is-collapsible__content">
              <p id="paletteManagerSessionReadout" class="palette-manager-readout">Waiting for session context.</p>
              <div class="palette-manager-grid">
                <aside class="palette-manager-panel" data-menu-tool>
                  <h3>menuTool</h3>
                  <p id="paletteManagerContractReadout" class="palette-manager-readout">paletteJson not loaded.</p>
                </aside>
                <section class="palette-manager-panel" aria-live="polite">
                  <h3 id="paletteManagerName">No palette loaded</h3>
                  <span id="paletteManagerCount" class="badge palette-manager-count">0 colors</span>
                  <div id="paletteManagerState" class="palette-manager-state">No palette session data found. Open Palette Manager V2 with a valid hostContextId session.</div>
                  <div id="paletteManagerSwatches" class="palette-manager-swatches" aria-label="Palette Manager V2 swatches"></div>
                </section>
                <aside class="palette-manager-panel" data-menu-workspace>
                  <h3>menuWorkspace</h3>
                  <p id="paletteManagerWorkspaceReadout" class="palette-manager-readout">Workspace actions are read-only in this isolated v2 entry.</p>
                </aside>
              </div>
            </div>
          </details>
        </section>
      </main>
    `;
    document.body.appendChild(Object.assign(document.createElement("script"), {
      type: "module",
      src: "../../src/engine/theme/mount-shared-header.js"
    }));
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
    if (!sessionContext || typeof sessionContext !== "object") {
      this.renderError("Session context is invalid. Expected an object containing paletteJson.");
      return;
    }
    if (sessionContext.paletteJson && typeof sessionContext.paletteJson === "object" && !Array.isArray(sessionContext.paletteJson)) {
      this.renderPalette(sessionContext.paletteJson, sessionContext);
      return;
    }
    if (sessionContext.sharedContext && typeof sessionContext.sharedContext === "object" && sessionContext.sharedContext.paletteJson && typeof sessionContext.sharedContext.paletteJson === "object" && !Array.isArray(sessionContext.sharedContext.paletteJson)) {
      this.renderPalette(sessionContext.sharedContext.paletteJson, sessionContext);
      return;
    }
    this.renderError("Palette session data is invalid. Expected paletteJson only.");
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
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated v2 entry.";
    document.getElementById("paletteManagerName").textContent = paletteJson.name.trim();
    document.getElementById("paletteManagerCount").textContent = `${paletteJson.colors.length} color${paletteJson.colors.length === 1 ? "" : "s"}`;
    document.getElementById("paletteManagerState").className = "palette-manager-state";
    document.getElementById("paletteManagerState").textContent = "Palette Manager V2 loaded the session palette.";
    document.getElementById("paletteManagerSwatches").innerHTML = paletteJson.colors.map((entry, index) => `
      <article class="palette-manager-swatch">
        <div class="palette-manager-chip" style="background:${this.escapeHtml(this.colorFrom(entry))}"></div>
        <div class="palette-manager-swatch-body">
          <div class="palette-manager-swatch-name">${this.escapeHtml(this.nameFrom(entry, index))}</div>
          <div class="palette-manager-swatch-meta">${this.escapeHtml(this.colorFrom(entry))}</div>
        </div>
      </article>
    `).join("");
  }

  renderEmpty(message) {
    document.getElementById("paletteManagerSessionReadout").textContent = "Session: missing";
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson not loaded";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("paletteManagerName").textContent = "No palette loaded";
    document.getElementById("paletteManagerCount").textContent = "0 colors";
    document.getElementById("paletteManagerState").className = "palette-manager-state";
    document.getElementById("paletteManagerState").textContent = message;
    document.getElementById("paletteManagerSwatches").innerHTML = "";
  }

  renderError(message) {
    document.getElementById("paletteManagerSessionReadout").textContent = "Session: read attempted";
    document.getElementById("paletteManagerContractReadout").textContent = "paletteJson invalid";
    document.getElementById("paletteManagerWorkspaceReadout").textContent = "Workspace writes are disabled for invalid Palette Manager V2 session data.";
    document.getElementById("paletteManagerName").textContent = "Palette Manager V2 error";
    document.getElementById("paletteManagerCount").textContent = "0 colors";
    document.getElementById("paletteManagerState").className = "palette-manager-state palette-manager-state--error";
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

  nameFrom(entry, index) {
    if (entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.name === "string" && entry.name.trim()) {
      return entry.name.trim();
    }
    return `Color ${index + 1}`;
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
  }
}

new PaletteManagerToolV2();
