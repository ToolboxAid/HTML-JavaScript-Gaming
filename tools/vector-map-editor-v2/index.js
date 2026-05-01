class VectorMapEditorV2 {
  constructor() {
    console.log("[VectorMapEditorV2]");
    this.sessionPayloadBytesLimit = 1024 * 1024;
    document.title = "Vector Map Editor V2";
    document.body.dataset.toolId = "vector-map-editor-v2";
    this.urlState = this.readUrlState();
    this.goBack = this.goBack.bind(this);
    this.handleNavigationState = this.handleNavigationState.bind(this);
    window.addEventListener("popstate", this.handleNavigationState);
    window.addEventListener("pageshow", this.handleNavigationState);
    document.getElementById("vectorMapV2BackButton").addEventListener("click", this.goBack);
    this.renderNavigation();
    this.registerSnapshotHook();
    this.readSession();
  }

  goBack() {
    const targetToolId = this.toolLabel(this.urlState.fromTool) ? this.urlState.fromTool : "workspace-v2";
    window.location.href = this.buildToolUrl(targetToolId).toString();
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
    document.getElementById("vectorMapV2Breadcrumb").textContent = `Workspace V2 -> ${sourceLabel} -> Vector Map Editor V2`;
    document.getElementById("vectorMapV2BackButton").textContent = `Back to ${sourceLabel}`;
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

  buildRuntimeSnapshot() {
    const serializedSession = this.urlState.hostContextId ? window.sessionStorage.getItem(this.urlState.hostContextId) : null;
    let parsedSession = null;
    let sessionError = "";
    if (typeof serializedSession === "string") {
      try {
        parsedSession = JSON.parse(serializedSession);
      } catch (error) {
        sessionError = error instanceof Error ? error.message : "unknown error";
      }
    }
    return {
      tool: "vector-map-editor-v2",
      url: window.location.href,
      hostContextId: this.urlState.hostContextId,
      session: parsedSession,
      sessionError
    };
  }

  registerSnapshotHook() {
    window.__v2RuntimeSnapshot = () => this.buildRuntimeSnapshot();
  }

  logStructuredError(type, message, details) {
    console.error({
      tool: "vector-map-editor-v2",
      type,
      message,
      details: details && typeof details === "object" ? details : {}
    });
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!this.urlState.hostContextId) {
        this.renderMissing("No hostContextId was provided. Re-open Vector Map Editor V2 from a valid Tool V2 session link.");
        return;
      }
      const serializedSession = window.sessionStorage.getItem(
        this.urlState.hostContextId
      );
      if (
        !serializedSession
      ) {
        this.renderMissing("No session data was found for the provided hostContextId. Re-open Vector Map Editor V2 from the tools index or a host flow that creates the session context first.");
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
      const runtimeMessage = `Unable to read Vector Map Editor V2 session context: ${error instanceof Error ? error.message : "unknown error"}`;
      this.logStructuredError("RUNTIME", runtimeMessage, { hostContextId: this.urlState.hostContextId || "" });
      this.renderError(runtimeMessage);
    }
  }

  loadContract(sessionContext) {
    console.log("[VECTOR_MAP_EDITOR_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.vectorMapDocument.");
      return;
    }
    const versionCheck = this.handleSessionVersion(sessionContext);
    if (!versionCheck.ok) {
      this.renderError(versionCheck.error);
      return;
    }
    if (!versionCheck.payload.payloadJson || typeof versionCheck.payload.payloadJson !== "object" || Array.isArray(versionCheck.payload.payloadJson)) {
      this.renderError("Vector Map Editor V2 session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!versionCheck.payload.payloadJson.vectorMapDocument || typeof versionCheck.payload.payloadJson.vectorMapDocument !== "object" || Array.isArray(versionCheck.payload.payloadJson.vectorMapDocument)) {
      this.renderError("Vector Map Editor V2 session data is invalid. Expected payloadJson.vectorMapDocument.");
      return;
    }
    this.renderVectorMap(versionCheck.payload.payloadJson.vectorMapDocument, versionCheck.payload);
  }

  renderVectorMap(vectorMapDocument, sessionContext) {
    if (typeof vectorMapDocument.name !== "string" || !vectorMapDocument.name.trim()) {
      this.renderError("Vector Map Editor V2 session data is invalid. Expected vectorMapDocument.name.");
      return;
    }
    if (!Number.isFinite(Number(vectorMapDocument.width)) || Number(vectorMapDocument.width) <= 0 || !Number.isFinite(Number(vectorMapDocument.height)) || Number(vectorMapDocument.height) <= 0) {
      this.renderError("Vector Map Editor V2 session data is invalid. Expected positive numeric vectorMapDocument.width and vectorMapDocument.height.");
      return;
    }
    if (typeof vectorMapDocument.background !== "string" || !vectorMapDocument.background.trim()) {
      this.renderError("Vector Map Editor V2 session data is invalid. Expected vectorMapDocument.background.");
      return;
    }
    if (!Array.isArray(vectorMapDocument.objects)) {
      this.renderError("Vector Map Editor V2 session data is invalid. Expected vectorMapDocument.objects[].");
      return;
    }
    if (
      vectorMapDocument.objects.some(
        (entry) =>
          !entry ||
          typeof entry !== "object" ||
          Array.isArray(entry) ||
          typeof entry.name !== "string" ||
          !entry.name.trim() ||
          typeof entry.kind !== "string" ||
          !entry.kind.trim() ||
          !entry.style ||
          typeof entry.style !== "object" ||
          Array.isArray(entry.style) ||
          typeof entry.style.stroke !== "string" ||
          !entry.style.stroke.trim() ||
          !Number.isFinite(Number(entry.style.lineWidth)) ||
          Number(entry.style.lineWidth) <= 0 ||
          !Array.isArray(entry.points) ||
          entry.points.length === 0
      )
    ) {
      this.renderError("Vector Map Editor V2 session data is invalid. Every object requires name, kind, style.stroke, positive style.lineWidth, and points[].");
      return;
    }
    if (
      vectorMapDocument.objects.some(
        (entry) =>
          (entry.kind === "polygon" || entry.closed === true) &&
          (typeof entry.style.fill !== "string" || !entry.style.fill.trim())
      )
    ) {
      this.renderError("Vector Map Editor V2 session data is invalid. Closed objects require style.fill.");
      return;
    }
    if (
      vectorMapDocument.objects.some(
        (entry) =>
          entry.points.some(
            (point) =>
              !point ||
              typeof point !== "object" ||
              Array.isArray(point) ||
              !Number.isFinite(Number(point.x)) ||
              !Number.isFinite(Number(point.y))
          )
      )
    ) {
      this.renderError("Vector Map Editor V2 session data is invalid. Every point requires numeric x and y.");
      return;
    }

    document.getElementById("vectorMapV2SessionReadout").textContent = `Session: loaded\nContext: ${this.urlState.hostContextId}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}${this.optionalUrlStateSummary() ? `\nURL State: ${this.optionalUrlStateSummary()}` : ""}`;
    document.getElementById("vectorMapV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.vectorMapDocument valid\nobjects[] valid";
    document.getElementById("vectorMapV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("vectorMapV2Name").textContent = vectorMapDocument.name.trim();
    document.getElementById("vectorMapV2Count").textContent = `${vectorMapDocument.objects.length} object${vectorMapDocument.objects.length === 1 ? "" : "s"}`;
    document.getElementById("vectorMapV2State").textContent = vectorMapDocument.objects.length === 0
      ? "Vector Map Editor V2 loaded a valid session map with zero objects."
      : "Vector Map Editor V2 loaded the session vector map.";
    document.getElementById("vectorMapV2EmptyState").hidden = true;
    document.getElementById("vectorMapV2InvalidState").hidden = true;
    document.getElementById("vectorMapV2ValidState").hidden = false;

    document.getElementById("vectorMapV2ObjectList").replaceChildren();
    vectorMapDocument.objects.forEach((entry) => {
      const objectItem = document.createElement("li");
      const objectName = document.createElement("strong");
      const objectMeta = document.createElement("div");
      objectName.textContent = entry.name.trim();
      objectMeta.textContent = `${entry.kind.trim()} - ${entry.points.length} point${entry.points.length === 1 ? "" : "s"}`;
      objectItem.append(objectName, objectMeta);
      document.getElementById("vectorMapV2ObjectList").appendChild(objectItem);
    });

    document.getElementById("vectorMapV2Stage").replaceChildren();
    const mapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const mapRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    mapSvg.setAttribute("viewBox", `0 0 ${Number(vectorMapDocument.width)} ${Number(vectorMapDocument.height)}`);
    mapSvg.setAttribute("role", "img");
    mapSvg.setAttribute("aria-label", "Vector Map Editor V2 rendered map");
    mapRect.setAttribute("width", "100%");
    mapRect.setAttribute("height", "100%");
    mapRect.setAttribute("fill", vectorMapDocument.background.trim());
    mapSvg.appendChild(mapRect);

    vectorMapDocument.objects.forEach((entry) => {
      if (entry.points.length === 1) {
        const pointCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pointCircle.setAttribute("cx", `${Number(entry.points[0].x)}`);
        pointCircle.setAttribute("cy", `${Number(entry.points[0].y)}`);
        pointCircle.setAttribute("r", "6");
        pointCircle.setAttribute("fill", entry.style.stroke.trim());
        mapSvg.appendChild(pointCircle);
        return;
      }

      let pointsText = "";
      entry.points.forEach((point, index) => {
        pointsText = `${pointsText}${index === 0 ? "" : " "}${Number(point.x)},${Number(point.y)}`;
      });

      if (entry.kind === "polygon" || entry.closed === true) {
        const polygonShape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygonShape.setAttribute("points", pointsText);
        polygonShape.setAttribute("fill", entry.style.fill.trim());
        polygonShape.setAttribute("stroke", entry.style.stroke.trim());
        polygonShape.setAttribute("stroke-width", `${Number(entry.style.lineWidth)}`);
        mapSvg.appendChild(polygonShape);
        return;
      }

      const polylineShape = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      polylineShape.setAttribute("points", pointsText);
      polylineShape.setAttribute("fill", "none");
      polylineShape.setAttribute("stroke", entry.style.stroke.trim());
      polylineShape.setAttribute("stroke-width", `${Number(entry.style.lineWidth)}`);
      polylineShape.setAttribute("stroke-linecap", "round");
      polylineShape.setAttribute("stroke-linejoin", "round");
      mapSvg.appendChild(polylineShape);
    });

    document.getElementById("vectorMapV2Stage").appendChild(mapSvg);
  }

  renderMissing(message) {
    this.logStructuredError("EMPTY", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("vectorMapV2SessionReadout").textContent = "Session: missing";
    document.getElementById("vectorMapV2ContractReadout").textContent = "payloadJson.vectorMapDocument not loaded";
    document.getElementById("vectorMapV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("vectorMapV2Name").textContent = "No vector map loaded";
    document.getElementById("vectorMapV2Count").textContent = "0 objects";
    document.getElementById("vectorMapV2EmptyState").textContent = message;
    document.getElementById("vectorMapV2EmptyState").hidden = false;
    document.getElementById("vectorMapV2InvalidState").hidden = true;
    document.getElementById("vectorMapV2ValidState").hidden = true;
    document.getElementById("vectorMapV2ObjectList").replaceChildren();
    document.getElementById("vectorMapV2Stage").replaceChildren();
  }

  renderError(message) {
    this.logStructuredError("INVALID", message, { hostContextId: this.urlState.hostContextId || "" });
    document.getElementById("vectorMapV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("vectorMapV2ContractReadout").textContent = "payloadJson.vectorMapDocument invalid";
    document.getElementById("vectorMapV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid Vector Map Editor V2 session data.";
    document.getElementById("vectorMapV2Name").textContent = "Vector Map Editor V2 error";
    document.getElementById("vectorMapV2Count").textContent = "0 objects";
    document.getElementById("vectorMapV2InvalidState").textContent = `${message} Re-open Vector Map Editor V2 from a host session that provides payloadJson.vectorMapDocument.`;
    document.getElementById("vectorMapV2EmptyState").hidden = true;
    document.getElementById("vectorMapV2InvalidState").hidden = false;
    document.getElementById("vectorMapV2ValidState").hidden = true;
    document.getElementById("vectorMapV2ObjectList").replaceChildren();
    document.getElementById("vectorMapV2Stage").replaceChildren();
  }
}

new VectorMapEditorV2();
