const WORKSPACE_TOOL_SESSION_KEY = "workspace.tools.object-vector-studio-v2";

function objectTypeLabel(object) {
  return String(object?.type || object?.kind || "object").trim() || "object";
}

export class ToolStarterApp {
  constructor({ accordions, actionNav, elements, schemaService, shell, statusLog, windowRef = window }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.elements = elements;
    this.schemaService = schemaService;
    this.shell = shell;
    this.statusLog = statusLog;
    this.window = windowRef;
    this.currentPayload = null;
    this.selectedObjectId = "";
  }

  start() {
    this.window.__objectVectorStudioV2App = this;
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onCopyJson: () => {
        void this.copyJson();
      },
      onExportJson: () => this.exportJson(),
      onImportJson: (file) => {
        void this.importJson(file);
      },
      onReturnToWorkspace: (url) => {
        this.window.location.href = url;
      }
    });
    this.statusLog.mount();
    this.bindToolToggles();
    this.renderEmptyState("Schema-only loading is idle. Import JSON or launch with workspace toolState data that includes a palette.");
    this.statusLog.write("Object Vector Studio V2 layout shell ready.");
    if (this.actionNav.isWorkspaceLaunch()) {
      this.loadWorkspaceToolState();
    }
  }

  bindToolToggles() {
    this.elements.toolToggles.forEach((button) => {
      button.addEventListener("click", () => {
        this.elements.toolToggles.forEach((candidate) => {
          candidate.classList.toggle("is-active", candidate === button);
          candidate.setAttribute("aria-pressed", String(candidate === button));
        });
        this.statusLog.write(`INFO Shape/Tools shell toggle selected: ${button.dataset.shapeTool || "unknown"}.`);
      });
    });
  }

  renderEmptyState(message) {
    this.currentPayload = null;
    this.selectedObjectId = "";
    this.elements.sourceSummary.value = "No schema-loaded payload";
    this.elements.paletteGate.value = "Required before render";
    this.elements.loadStatus.textContent = message;
    this.elements.paletteSummary.textContent = "Palette required before render.";
    this.elements.objectDetails.textContent = "No object selected.";
    this.elements.selectedItemVisibility.textContent = "No schema-valid object selected.";
    this.elements.jsonDetails.textContent = "{}";
    this.elements.objectTiles.replaceChildren(this.createEmptyObjectTile());
    this.actionNav.setJsonPayloadActionsEnabled(false);
    this.actionNav.setImportEnabled(!this.actionNav.isWorkspaceLaunch());
  }

  createEmptyObjectTile() {
    const tile = document.createElement("article");
    tile.className = "object-vector-studio-v2__object-tile object-vector-studio-v2__object-tile--empty";
    tile.textContent = "No objects loaded. Import schema-valid JSON with a palette to show object tiles.";
    return tile;
  }

  async importJson(file) {
    if (!file) {
      this.statusLog.write("FAIL Import JSON blocked: choose an Object Vector Studio V2 JSON file.");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch (error) {
      this.statusLog.write(`FAIL Import JSON blocked: ${file.name || "selected file"} is invalid JSON: ${error.message}`);
      return;
    }

    this.loadPayload(payload, `import:${file.name || "selected file"}`);
  }

  loadWorkspaceToolState() {
    const storedPayload = this.window.sessionStorage?.getItem(WORKSPACE_TOOL_SESSION_KEY) || "";
    if (!storedPayload) {
      const message = `Schema-only workspace loading blocked: ${WORKSPACE_TOOL_SESSION_KEY} is missing. A palette-backed Object Vector Studio V2 payload is required.`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    let payload;
    try {
      payload = JSON.parse(storedPayload);
    } catch (error) {
      const message = `Schema-only workspace loading blocked: ${WORKSPACE_TOOL_SESSION_KEY} is invalid JSON: ${error.message}`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    this.loadPayload(payload, WORKSPACE_TOOL_SESSION_KEY);
  }

  loadPayload(payload, sourceLabel) {
    const validation = this.schemaService.validatePayload(payload);
    if (!validation.ok) {
      const message = `Object Vector Studio V2 schema validation failed from ${sourceLabel}: ${validation.errors.join(" ")}`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    this.currentPayload = validation.payload;
    this.selectedObjectId = this.currentPayload.objects[0]?.id || "";
    this.elements.sourceSummary.value = sourceLabel;
    this.elements.paletteGate.value = "Palette loaded";
    this.elements.loadStatus.textContent = `Schema-valid payload loaded from ${sourceLabel}.`;
    this.actionNav.setJsonPayloadActionsEnabled(true);
    this.actionNav.setImportEnabled(!this.actionNav.isWorkspaceLaunch());
    this.renderPayload();
    this.statusLog.write(`OK Loaded Object Vector Studio V2 schema payload from ${sourceLabel}: ${this.currentPayload.objects.length} objects, ${this.currentPayload.palette.swatches.length} palette swatches.`);
  }

  renderPayload() {
    if (!this.currentPayload) {
      return;
    }

    this.renderPalette();
    this.renderObjectTiles();
    this.renderSelectedObject();
    this.elements.jsonDetails.textContent = JSON.stringify(this.currentPayload, null, 2);
  }

  renderPalette() {
    const swatchCount = this.currentPayload.palette.swatches.length;
    this.elements.paletteSummary.replaceChildren();
    const heading = document.createElement("p");
    heading.textContent = `Palette ${this.currentPayload.palette.id}: ${swatchCount} swatches.`;
    const list = document.createElement("ul");
    this.currentPayload.palette.swatches.forEach((swatch, index) => {
      const item = document.createElement("li");
      const label = swatch?.name || swatch?.id || `swatch-${index + 1}`;
      const value = swatch?.value || swatch?.hex || swatch?.color || "value unavailable";
      item.textContent = `${label}: ${value}`;
      list.append(item);
    });
    this.elements.paletteSummary.append(heading, list);
  }

  renderObjectTiles() {
    this.elements.objectTiles.replaceChildren();
    if (!this.currentPayload.objects.length) {
      this.elements.objectTiles.append(this.createEmptyObjectTile());
      return;
    }

    this.currentPayload.objects.forEach((object) => {
      const tile = document.createElement("button");
      tile.className = "object-vector-studio-v2__object-tile";
      tile.type = "button";
      tile.dataset.objectId = object.id;
      tile.setAttribute("aria-pressed", String(object.id === this.selectedObjectId));
      tile.classList.toggle("is-selected", object.id === this.selectedObjectId);

      const name = document.createElement("span");
      name.className = "object-vector-studio-v2__object-tile-name";
      name.textContent = object.name;

      const meta = document.createElement("span");
      meta.className = "object-vector-studio-v2__object-tile-meta";
      meta.textContent = `${object.id} - ${objectTypeLabel(object)}`;

      tile.append(name, meta);
      tile.addEventListener("click", () => {
        this.selectedObjectId = object.id;
        this.renderPayload();
        this.statusLog.write(`INFO Selected object tile: ${object.name}.`);
      });
      this.elements.objectTiles.append(tile);
    });
  }

  renderSelectedObject() {
    const selected = this.currentPayload.objects.find((object) => object.id === this.selectedObjectId) || null;
    if (!selected) {
      this.elements.objectDetails.textContent = "No object selected.";
      this.elements.selectedItemVisibility.textContent = "No schema-valid object selected.";
      return;
    }

    this.elements.objectDetails.textContent = `Selected ${selected.name} (${objectTypeLabel(selected)}) with id ${selected.id}.`;
    this.elements.selectedItemVisibility.textContent = `Selected item visible: ${selected.name}`;
  }

  async copyJson() {
    if (!this.currentPayload) {
      this.statusLog.write("FAIL Copy JSON blocked: no schema-valid Object Vector Studio V2 payload is loaded.");
      return;
    }

    const json = JSON.stringify(this.currentPayload, null, 2);
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.elements.jsonDetails.textContent = json;
      this.statusLog.write("WARN Clipboard API unavailable. JSON Details contains the schema-valid payload.");
      return;
    }

    try {
      await this.window.navigator.clipboard.writeText(json);
      this.statusLog.write("OK Object Vector Studio V2 JSON copied.");
    } catch (error) {
      this.statusLog.write(`FAIL Copy JSON failed: ${error.message}`);
    }
  }

  exportJson() {
    if (!this.currentPayload) {
      this.statusLog.write("FAIL Export blocked: no schema-valid Object Vector Studio V2 payload is loaded.");
      return;
    }

    const blob = new Blob([JSON.stringify(this.currentPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = this.window.document.createElement("a");
    anchor.href = url;
    anchor.download = "object-vector-studio-v2.json";
    anchor.click();
    URL.revokeObjectURL(url);
    this.statusLog.write(`OK Export prepared for ${this.currentPayload.objects.length} Object Vector Studio V2 objects.`);
  }
}
