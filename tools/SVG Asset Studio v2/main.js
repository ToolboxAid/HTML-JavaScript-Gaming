class SvgAssetStudioV2 {
  constructor() {
    console.log("[SVG_V2_ENTRY]");
    this.start();
  }

  start() {
    document.title = "SVG Asset Studio v2";
    document.body.className = "hub-page-home hub-page-home--viewport";
    document.body.dataset.toolId = "svg-asset-studio-v2";
    document.head.insertAdjacentHTML("beforeend", `
      <link rel="stylesheet" href="../../src/engine/theme/main.css" />
      <link rel="stylesheet" href="../../src/engine/ui/hubCommon.css" />
      <style>
        body[data-tool-id="svg-asset-studio-v2"] .page-shell { padding-bottom: 48px; }
        body[data-tool-id="svg-asset-studio-v2"] .is-collapsible { max-width: var(--wrap-max, 1180px); margin: 32px auto 0; }
        body[data-tool-id="svg-asset-studio-v2"] .is-collapsible__summary { font-weight: 800; }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-grid { display: grid; grid-template-columns: minmax(230px, 0.72fr) minmax(0, 1.7fr); gap: 18px; }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-panel { border: 1px solid var(--line); border-radius: 18px; background: linear-gradient(180deg, var(--panel) 0%, var(--panel2) 100%); padding: 18px; box-shadow: 0 18px 36px rgba(0, 0, 0, 0.18); }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-readout { white-space: pre-line; color: var(--muted); }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-frame { display: grid; min-height: 420px; place-items: center; border: 1px solid var(--line); border-radius: 18px; background: var(--surface-inline, rgba(43, 16, 91, 0.9)); overflow: auto; padding: 18px; }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-frame img { max-width: 100%; max-height: 72vh; background: rgba(255, 255, 255, 0.08); border-radius: 12px; }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-state { border: 1px dashed var(--line); border-radius: 16px; color: var(--muted); padding: 14px; }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-state--error { border-style: solid; border-color: #fca5a5; color: #fecaca; }
        body[data-tool-id="svg-asset-studio-v2"] .svg-v2-badge { display: inline-block; margin-top: 10px; }
        @media (max-width: 820px) { body[data-tool-id="svg-asset-studio-v2"] .svg-v2-grid { grid-template-columns: 1fr; } }
      </style>
    `);
    document.body.innerHTML = `
      <details class="is-collapsible" open>
        <summary class="is-collapsible__summary">SVG Asset Studio v2</summary>
        <div class="is-collapsible__content">
          <main class="page-shell">
            <section class="page-intro">
              <h1>SVG Asset Studio v2</h1>
              <p>Inspect an SVG asset from explicit Tool v2 session context only.</p>
            </section>
          </main>
        </div>
      </details>
      <main class="page-shell">
        <section class="content-section">
          <h2>Session SVG Asset</h2>
          <p id="svgV2SessionReadout" class="svg-v2-readout">Waiting for session context.</p>
          <div class="svg-v2-grid">
            <aside class="svg-v2-panel" data-menu-tool>
              <h3>menuTool</h3>
              <p id="svgV2ToolReadout" class="svg-v2-readout">SVG contract not loaded.</p>
            </aside>
            <section class="svg-v2-panel" aria-live="polite">
              <h3 id="svgV2AssetName">No SVG loaded</h3>
              <span id="svgV2StatusBadge" class="badge svg-v2-badge">0 bytes</span>
              <div id="svgV2State" class="svg-v2-state">No SVG session context found. Open SVG Asset Studio v2 with a valid hostContextId session.</div>
              <div id="svgV2Frame" class="svg-v2-frame" aria-label="SVG Asset Studio v2 preview"></div>
            </section>
            <aside class="svg-v2-panel" data-menu-workspace>
              <h3>menuWorkspace</h3>
              <p id="svgV2WorkspaceReadout" class="svg-v2-readout">Workspace actions are read-only in this isolated v2 entry.</p>
            </aside>
          </div>
        </section>
      </main>
    `;
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (new URL(window.location.href).searchParams.get("payloadJson")) {
        this.sessionContextId = new URL(window.location.href).searchParams.get("sessionId") || `svg-asset-studio-v2-${Date.now().toString(36)}`;
        window.sessionStorage.setItem(`toolboxaid.toolHost.context.${this.sessionContextId}`, JSON.stringify({
          schema: "tools.svg-asset-studio-v2.session/1",
          contextId: this.sessionContextId,
          toolId: "svg-asset-studio-v2",
          payloadJson: JSON.parse(new URL(window.location.href).searchParams.get("payloadJson"))
        }));
        window.history.replaceState(null, "", `${window.location.pathname}?hostContextId=${this.sessionContextId}`);
      }
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderEmpty("No hostContextId was provided. Open SVG Asset Studio v2 with a valid Tool v2 session URL.");
        return;
      }
      if (!window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)) {
        this.renderEmpty("No session context was found for the provided hostContextId.");
        return;
      }
      this.loadContract(JSON.parse(window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)));
    } catch (error) {
      this.renderError(`Unable to read SVG Asset Studio v2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  loadContract(sessionContext) {
    console.log("[SVG_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object") {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.");
      return;
    }
    if (sessionContext.payloadJson && typeof sessionContext.payloadJson === "object" && !Array.isArray(sessionContext.payloadJson)) {
      this.renderSvg(sessionContext.payloadJson, sessionContext);
      return;
    }
    if (sessionContext.sharedContext && typeof sessionContext.sharedContext === "object" && sessionContext.sharedContext.payloadJson && typeof sessionContext.sharedContext.payloadJson === "object" && !Array.isArray(sessionContext.sharedContext.payloadJson)) {
      this.renderSvg(sessionContext.sharedContext.payloadJson, sessionContext);
      return;
    }
    this.renderError("SVG session data is invalid. Expected payloadJson only.");
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
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated v2 entry.";
    document.getElementById("svgV2AssetName").textContent = typeof payloadJson.vectorAssetDocument.sourceName === "string" && payloadJson.vectorAssetDocument.sourceName.trim() ? payloadJson.vectorAssetDocument.sourceName.trim() : "Inline SVG";
    document.getElementById("svgV2StatusBadge").textContent = `${payloadJson.vectorAssetDocument.svgText.length} bytes`;
    document.getElementById("svgV2State").className = "svg-v2-state";
    document.getElementById("svgV2State").textContent = "SVG Asset Studio v2 loaded the session SVG asset.";
    document.getElementById("svgV2Frame").innerHTML = `<img alt="${this.escapeHtml(document.getElementById("svgV2AssetName").textContent)}" src="${URL.createObjectURL(new Blob([payloadJson.vectorAssetDocument.svgText], { type: "image/svg+xml" }))}" />`;
  }

  renderEmpty(message) {
    document.getElementById("svgV2SessionReadout").textContent = "Session: missing";
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson not loaded";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("svgV2AssetName").textContent = "No SVG loaded";
    document.getElementById("svgV2StatusBadge").textContent = "0 bytes";
    document.getElementById("svgV2State").className = "svg-v2-state";
    document.getElementById("svgV2State").textContent = message;
    document.getElementById("svgV2Frame").innerHTML = "";
  }

  renderError(message) {
    document.getElementById("svgV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("svgV2ToolReadout").textContent = "payloadJson invalid";
    document.getElementById("svgV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid SVG session data.";
    document.getElementById("svgV2AssetName").textContent = "SVG Asset Studio v2 error";
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
