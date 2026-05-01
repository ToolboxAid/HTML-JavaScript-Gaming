class VectorMapEditorV2 {
  constructor() {
    console.log("[VECTOR_MAP_V2_ENTRY]");
    this.start();
  }

  start() {
    document.title = "Vector Map Editor V2";
    document.body.dataset.toolId = "vector-map-editor-v2";
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (new URL(window.location.href).searchParams.get("payloadJson")) {
        this.writeUrlPayloadToSession();
      }
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderEmpty("No hostContextId was provided. Open Vector Map Editor V2 with a valid Tool V2 session URL.");
        return;
      }
      if (!window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)) {
        this.renderEmpty("No session context was found for the provided hostContextId.");
        return;
      }
      this.loadContract(JSON.parse(window.sessionStorage.getItem(`toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`)));
    } catch (error) {
      this.renderError(`Unable to read Vector Map Editor V2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  writeUrlPayloadToSession() {
    this.sessionContextId = new URL(window.location.href).searchParams.get("sessionId") || `vector-map-editor-v2-${Date.now().toString(36)}`;
    window.sessionStorage.setItem(`toolboxaid.toolHost.context.${this.sessionContextId}`, JSON.stringify({
      schema: "tools.vector-map-editor-v2.session/1",
      contextId: this.sessionContextId,
      toolId: "vector-map-editor-v2",
      payloadJson: JSON.parse(new URL(window.location.href).searchParams.get("payloadJson"))
    }));
    window.history.replaceState(null, "", `${window.location.pathname}?hostContextId=${this.sessionContextId}`);
  }

  loadContract(sessionContext) {
    console.log("[VECTOR_MAP_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.vectorMapDocument.");
      return;
    }
    if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
      this.renderError("Vector map session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!sessionContext.payloadJson.vectorMapDocument || typeof sessionContext.payloadJson.vectorMapDocument !== "object" || Array.isArray(sessionContext.payloadJson.vectorMapDocument)) {
      this.renderError("Vector map session data is invalid. Expected payloadJson.vectorMapDocument.");
      return;
    }
    this.renderVectorMap(sessionContext.payloadJson.vectorMapDocument, sessionContext);
  }

  renderVectorMap(vectorMapDocument, sessionContext) {
    if (!Array.isArray(vectorMapDocument.objects)) {
      this.renderError("Vector map session data is invalid. Expected vectorMapDocument.objects[].");
      return;
    }
    if (typeof vectorMapDocument.name !== "string" || !vectorMapDocument.name.trim()) {
      this.renderError("Vector map session data is invalid. Expected vectorMapDocument.name.");
      return;
    }
    if (!Number.isFinite(Number(vectorMapDocument.width)) || Number(vectorMapDocument.width) <= 0 || !Number.isFinite(Number(vectorMapDocument.height)) || Number(vectorMapDocument.height) <= 0) {
      this.renderError("Vector map session data is invalid. Expected positive numeric vectorMapDocument.width and vectorMapDocument.height.");
      return;
    }
    if (typeof vectorMapDocument.background !== "string" || !vectorMapDocument.background.trim()) {
      this.renderError("Vector map session data is invalid. Expected vectorMapDocument.background.");
      return;
    }
    if (vectorMapDocument.objects.length === 0) {
      this.renderEmpty("Vector Map Editor V2 loaded a valid vector map document with zero objects.");
      return;
    }
    if (vectorMapDocument.objects.some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry) || !Array.isArray(entry.points))) {
      this.renderError("Vector map session data is invalid. Every vectorMapDocument.objects[] entry must include points[].");
      return;
    }
    if (vectorMapDocument.objects.some((entry) => typeof entry.name !== "string" || !entry.name.trim() || typeof entry.kind !== "string" || !entry.kind.trim())) {
      this.renderError("Vector map session data is invalid. Every object requires name and kind.");
      return;
    }
    if (vectorMapDocument.objects.some((entry) => !entry.style || typeof entry.style !== "object" || typeof entry.style.stroke !== "string" || !entry.style.stroke.trim() || !Number.isFinite(Number(entry.style.lineWidth)) || Number(entry.style.lineWidth) <= 0)) {
      this.renderError("Vector map session data is invalid. Every object requires style.stroke and positive style.lineWidth.");
      return;
    }
    if (vectorMapDocument.objects.some((entry) => (entry.kind === "polygon" || entry.closed === true) && (typeof entry.style.fill !== "string" || !entry.style.fill.trim()))) {
      this.renderError("Vector map session data is invalid. Every closed object requires style.fill.");
      return;
    }
    if (vectorMapDocument.objects.some((entry) => entry.points.some((point) => !point || typeof point !== "object" || !Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.y))))) {
      this.renderError("Vector map session data is invalid. Every point requires numeric x and y coordinates.");
      return;
    }
    document.getElementById("vectorMapV2SessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
    document.getElementById("vectorMapV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.vectorMapDocument valid\nobjects[] valid";
    document.getElementById("vectorMapV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("vectorMapV2Name").textContent = vectorMapDocument.name.trim();
    document.getElementById("vectorMapV2Count").textContent = `${vectorMapDocument.objects.length} object${vectorMapDocument.objects.length === 1 ? "" : "s"}`;
    document.getElementById("vectorMapV2State").className = "vector-map-v2-state";
    document.getElementById("vectorMapV2State").textContent = "Vector Map Editor V2 loaded the session vector map.";
    document.getElementById("vectorMapV2ObjectList").innerHTML = vectorMapDocument.objects.map((entry) => `<li><strong>${this.escapeHtml(entry.name.trim())}</strong><br>${this.escapeHtml(entry.kind.trim())} - ${entry.points.length} point${entry.points.length === 1 ? "" : "s"}</li>`).join("");
    document.getElementById("vectorMapV2Stage").innerHTML = this.renderSvgMarkup(vectorMapDocument);
  }

  renderSvgMarkup(vectorMapDocument) {
    return `<svg viewBox="0 0 ${Number(vectorMapDocument.width)} ${Number(vectorMapDocument.height)}" role="img" aria-label="Vector Map Editor V2 rendered map" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${this.escapeHtml(vectorMapDocument.background.trim())}" />${vectorMapDocument.objects.map((entry) => this.renderObjectMarkup(entry)).join("")}</svg>`;
  }

  renderObjectMarkup(entry) {
    if (entry.points.length === 1) {
      return `<circle cx="${Number(entry.points[0].x)}" cy="${Number(entry.points[0].y)}" r="6" fill="${this.escapeHtml(this.objectStroke(entry))}" />`;
    }
    if (entry.kind === "polygon" || entry.closed === true) {
      return `<polygon points="${this.pointsAttribute(entry.points)}" fill="${this.escapeHtml(this.objectFill(entry))}" stroke="${this.escapeHtml(this.objectStroke(entry))}" stroke-width="${this.objectLineWidth(entry)}" />`;
    }
    return `<polyline points="${this.pointsAttribute(entry.points)}" fill="none" stroke="${this.escapeHtml(this.objectStroke(entry))}" stroke-width="${this.objectLineWidth(entry)}" stroke-linecap="round" stroke-linejoin="round" />`;
  }

  pointsAttribute(points) {
    return points.map((point) => `${Number(point.x)},${Number(point.y)}`).join(" ");
  }

  objectStroke(entry) {
    return entry.style.stroke.trim();
  }

  objectFill(entry) {
    return entry.style.fill.trim();
  }

  objectLineWidth(entry) {
    return Number(entry.style.lineWidth);
  }

  renderEmpty(message) {
    document.getElementById("vectorMapV2SessionReadout").textContent = "Session: missing";
    document.getElementById("vectorMapV2ContractReadout").textContent = "payloadJson.vectorMapDocument not loaded";
    document.getElementById("vectorMapV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("vectorMapV2Name").textContent = "No vector map loaded";
    document.getElementById("vectorMapV2Count").textContent = "0 objects";
    document.getElementById("vectorMapV2State").className = "vector-map-v2-state";
    document.getElementById("vectorMapV2State").textContent = message;
    document.getElementById("vectorMapV2ObjectList").innerHTML = "";
    document.getElementById("vectorMapV2Stage").innerHTML = "";
  }

  renderError(message) {
    document.getElementById("vectorMapV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("vectorMapV2ContractReadout").textContent = "payloadJson.vectorMapDocument invalid";
    document.getElementById("vectorMapV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid Vector Map Editor V2 session data.";
    document.getElementById("vectorMapV2Name").textContent = "Vector Map Editor V2 error";
    document.getElementById("vectorMapV2Count").textContent = "0 objects";
    document.getElementById("vectorMapV2State").className = "vector-map-v2-state vector-map-v2-state--error";
    document.getElementById("vectorMapV2State").textContent = message;
    document.getElementById("vectorMapV2ObjectList").innerHTML = "";
    document.getElementById("vectorMapV2Stage").innerHTML = "";
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
  }
}

new VectorMapEditorV2();
