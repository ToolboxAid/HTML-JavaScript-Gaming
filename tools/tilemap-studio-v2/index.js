class TilemapStudioV2 {
  constructor() {
    console.log("[TilemapStudioV2]");
    document.title = "Tilemap Studio V2";
    document.body.dataset.toolId = "tilemap-studio-v2";
    this.readSession();
  }

  readSession() {
    console.log("[SESSION_CONTEXT_READ]");
    try {
      if (!new URL(window.location.href).searchParams.get("hostContextId")) {
        this.renderMissing("No hostContextId was provided. Re-open Tilemap Studio V2 from a valid Tool V2 session link.");
        return;
      }
      if (
        !window.sessionStorage.getItem(
          `toolboxaid.toolHost.context.${new URL(window.location.href).searchParams.get("hostContextId")}`
        )
      ) {
        this.renderMissing("No session data was found for the provided hostContextId. Re-open Tilemap Studio V2 from the tools index or a host flow that creates the session context first.");
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
      this.renderError(`Unable to read Tilemap Studio V2 session context: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  loadContract(sessionContext) {
    console.log("[TILEMAP_V2_CONTRACT_LOADED]");
    if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
      this.renderError("Session context is invalid. Expected an object containing payloadJson.tileMapDocument.");
      return;
    }
    if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
      this.renderError("Tilemap session data is invalid. Expected payloadJson only.");
      return;
    }
    if (!sessionContext.payloadJson.tileMapDocument || typeof sessionContext.payloadJson.tileMapDocument !== "object" || Array.isArray(sessionContext.payloadJson.tileMapDocument)) {
      this.renderError("Tilemap session data is invalid. Expected payloadJson.tileMapDocument.");
      return;
    }
    this.renderTilemap(sessionContext.payloadJson.tileMapDocument, sessionContext);
  }

  renderTilemap(tileMapDocument, sessionContext) {
    if (!tileMapDocument.map || typeof tileMapDocument.map !== "object" || Array.isArray(tileMapDocument.map)) {
      this.renderError("Tilemap session data is invalid. Expected tileMapDocument.map.");
      return;
    }
    if (typeof tileMapDocument.map.name !== "string" || !tileMapDocument.map.name.trim()) {
      this.renderError("Tilemap session data is invalid. Expected tileMapDocument.map.name.");
      return;
    }
    if (!Number.isFinite(Number(tileMapDocument.map.width)) || Number(tileMapDocument.map.width) <= 0 || !Number.isFinite(Number(tileMapDocument.map.height)) || Number(tileMapDocument.map.height) <= 0) {
      this.renderError("Tilemap session data is invalid. Expected positive numeric tileMapDocument.map.width and tileMapDocument.map.height.");
      return;
    }
    if (!Array.isArray(tileMapDocument.layers)) {
      this.renderError("Tilemap session data is invalid. Expected tileMapDocument.layers[].");
      return;
    }
    if (tileMapDocument.layers.some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.name !== "string" || !entry.name.trim() || typeof entry.kind !== "string" || !entry.kind.trim() || !Array.isArray(entry.data))) {
      this.renderError("Tilemap session data is invalid. Every layer requires name, kind, and data[].");
      return;
    }
    document.getElementById("tilemapV2SessionReadout").textContent = `Session: loaded\nContext: ${new URL(window.location.href).searchParams.get("hostContextId")}\nTool: ${typeof sessionContext.toolId === "string" && sessionContext.toolId.trim() ? sessionContext.toolId.trim() : "not provided"}`;
    document.getElementById("tilemapV2ContractReadout").textContent = "payloadJson loaded\npayloadJson.tileMapDocument valid\nlayers[] valid";
    document.getElementById("tilemapV2WorkspaceReadout").textContent = "Workspace session context was read. Workspace writes are deferred for this isolated V2 entry.";
    document.getElementById("tilemapV2Name").textContent = tileMapDocument.map.name.trim();
    document.getElementById("tilemapV2Count").textContent = `${tileMapDocument.layers.length} layer${tileMapDocument.layers.length === 1 ? "" : "s"}`;
    document.getElementById("tilemapV2State").textContent = "Tilemap Studio V2 loaded the session tilemap.";
    document.getElementById("tilemapV2EmptyState").hidden = true;
    document.getElementById("tilemapV2InvalidState").hidden = true;
    document.getElementById("tilemapV2ValidState").hidden = false;
    document.getElementById("tilemapV2LayerList").replaceChildren();
    tileMapDocument.layers.forEach((entry) => {
      const layerItem = document.createElement("li");
      const layerName = document.createElement("strong");
      const layerKind = document.createElement("div");
      layerName.textContent = entry.name.trim();
      layerKind.textContent = `${entry.kind.trim()} - ${entry.data.length} row${entry.data.length === 1 ? "" : "s"}`;
      layerItem.append(layerName, layerKind);
      document.getElementById("tilemapV2LayerList").appendChild(layerItem);
    });
    document.getElementById("tilemapV2Preview").replaceChildren();
    const tilemapPreview = document.createElement("pre");
    tilemapPreview.textContent = JSON.stringify(
      {
        map: tileMapDocument.map,
        layers: tileMapDocument.layers.map((entry) => ({
          name: entry.name,
          kind: entry.kind,
          rows: entry.data.length
        }))
      },
      null,
      2
    );
    document.getElementById("tilemapV2Preview").appendChild(tilemapPreview);
  }

  renderMissing(message) {
    document.getElementById("tilemapV2SessionReadout").textContent = "Session: missing";
    document.getElementById("tilemapV2ContractReadout").textContent = "payloadJson.tileMapDocument not loaded";
    document.getElementById("tilemapV2WorkspaceReadout").textContent = "Workspace session context is not available.";
    document.getElementById("tilemapV2Name").textContent = "No tilemap loaded";
    document.getElementById("tilemapV2Count").textContent = "0 layers";
    document.getElementById("tilemapV2EmptyState").textContent = message;
    document.getElementById("tilemapV2EmptyState").hidden = false;
    document.getElementById("tilemapV2InvalidState").hidden = true;
    document.getElementById("tilemapV2ValidState").hidden = true;
    document.getElementById("tilemapV2LayerList").replaceChildren();
    document.getElementById("tilemapV2Preview").replaceChildren();
  }

  renderError(message) {
    document.getElementById("tilemapV2SessionReadout").textContent = "Session: read attempted";
    document.getElementById("tilemapV2ContractReadout").textContent = "payloadJson.tileMapDocument invalid";
    document.getElementById("tilemapV2WorkspaceReadout").textContent = "Workspace writes are disabled for invalid Tilemap Studio V2 session data.";
    document.getElementById("tilemapV2Name").textContent = "Tilemap Studio V2 error";
    document.getElementById("tilemapV2Count").textContent = "0 layers";
    document.getElementById("tilemapV2InvalidState").textContent = `${message} Re-open Tilemap Studio V2 from a host session that provides payloadJson.tileMapDocument.`;
    document.getElementById("tilemapV2EmptyState").hidden = true;
    document.getElementById("tilemapV2InvalidState").hidden = false;
    document.getElementById("tilemapV2ValidState").hidden = true;
    document.getElementById("tilemapV2LayerList").replaceChildren();
    document.getElementById("tilemapV2Preview").replaceChildren();
  }
}

new TilemapStudioV2();
