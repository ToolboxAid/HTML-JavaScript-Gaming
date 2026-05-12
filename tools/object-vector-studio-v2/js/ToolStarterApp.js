const WORKSPACE_TOOL_SESSION_KEY = "workspace.tools.object-vector-studio-v2";
const DEFAULT_OBJECT_TYPE = "object";

const OBJECT_TYPE_DETAILS = Object.freeze({
  actor: "Actor entity metadata framework for reusable gameplay participants.",
  enemy: "Enemy entity metadata framework for hostile reusable objects.",
  object: "Generic reusable gameplay object metadata framework.",
  pickup: "Pickup entity metadata framework for collectibles and rewards.",
  ship: "Ship entity metadata framework for player, NPC, or vehicle objects.",
  ui: "UI vector asset metadata framework for interface objects.",
  weapon: "Weapon entity metadata framework for projectile or attack objects."
});

function objectTypeKey(object) {
  const rawType = object?.type || object?.metadata?.objectType || DEFAULT_OBJECT_TYPE;
  const key = String(rawType).trim().toLowerCase();
  return key || DEFAULT_OBJECT_TYPE;
}

function objectTypeLabel(object) {
  return objectTypeKey(object).replace(/(^|-)([a-z])/g, (match) => match.toUpperCase()).replaceAll("-", " ");
}

function objectTypeDescription(object) {
  return OBJECT_TYPE_DETAILS[objectTypeKey(object)] || OBJECT_TYPE_DETAILS.object;
}

function objectCountLabel(count) {
  return `${count} ${count === 1 ? "object" : "objects"}`;
}

function slugifyObjectName(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "object";
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
    this.bindObjectActions();
    this.bindToolToggles();
    this.renderEmptyState("Schema-only loading is idle. Import JSON or launch with workspace toolState data that includes a palette.");
    this.statusLog.write("OK Object Vector Studio V2 layout shell ready.");
    if (this.actionNav.isWorkspaceLaunch()) {
      this.loadWorkspaceToolState();
    }
  }

  bindObjectActions() {
    this.elements.addObjectButton.addEventListener("click", () => this.addObject());
    this.elements.renameObjectButton.addEventListener("click", () => this.renameSelectedObject());
    this.elements.deleteObjectButton.addEventListener("click", () => this.deleteSelectedObject());
    this.elements.flattenObjectButton.addEventListener("click", () => this.flattenSelectedObject());
  }

  bindToolToggles() {
    this.elements.toolLabelModeButton.addEventListener("click", () => {
      const isCompact = !this.elements.toolToggleGrid.classList.contains("is-icon-only");
      this.elements.toolToggleGrid.classList.toggle("is-icon-only", isCompact);
      this.elements.toolLabelModeButton.setAttribute("aria-pressed", String(isCompact));
      this.elements.toolLabelModeButton.textContent = isCompact ? "Icons" : "Icon/Text";
      this.statusLog.write(`OK Shape/Tools display mode set to ${isCompact ? "compact icons" : "icons with text"}.`);
    });

    this.elements.toolToggles.forEach((button) => {
      button.addEventListener("click", () => {
        this.elements.toolToggles.forEach((candidate) => {
          candidate.classList.toggle("is-active", candidate === button);
          candidate.setAttribute("aria-pressed", String(candidate === button));
        });
        this.statusLog.write(`OK Shape/Tools shell toggle selected: ${button.dataset.shapeTool || "unknown"}.`);
      });
    });
  }

  renderEmptyState(message) {
    this.currentPayload = null;
    this.selectedObjectId = "";
    this.elements.sourceSummary.value = "No schema-loaded payload";
    this.elements.paletteGate.value = "Required before render";
    this.elements.objectCount.value = objectCountLabel(0);
    this.elements.objectNameInput.value = "";
    this.elements.loadStatus.textContent = message;
    this.elements.paletteSummary.textContent = "Palette required before render.";
    this.elements.objectDetails.textContent = "No object selected.";
    this.elements.selectedItemVisibility.textContent = "No schema-valid object selected.";
    this.elements.jsonDetails.textContent = "{}";
    this.elements.objectTiles.replaceChildren(this.createEmptyObjectTile());
    this.actionNav.setJsonPayloadActionsEnabled(false);
    this.actionNav.setImportEnabled(!this.actionNav.isWorkspaceLaunch());
    this.updateObjectActionState();
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
    this.updateObjectActionState();
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
    this.elements.objectCount.value = objectCountLabel(this.currentPayload.objects.length);
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
        this.selectObject(object.id, "tile");
      });
      this.elements.objectTiles.append(tile);
    });
  }

  renderSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.elements.objectNameInput.value = "";
      this.elements.objectDetails.textContent = "No object selected.";
      this.elements.selectedItemVisibility.textContent = "No schema-valid object selected.";
      this.elements.jsonDetails.textContent = "{}";
      return;
    }

    this.elements.objectNameInput.value = selected.name;
    this.elements.objectDetails.replaceChildren(this.createObjectDetails(selected));
    this.elements.selectedItemVisibility.textContent = `Selected item visible: ${selected.name}`;
    this.elements.jsonDetails.textContent = JSON.stringify(selected, null, 2);
  }

  createObjectDetails(object) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-vector-studio-v2__object-detail-grid";
    [
      ["Name", object.name],
      ["ID", object.id],
      ["Type", objectTypeLabel(object)],
      ["Type Metadata", objectTypeDescription(object)],
      ["Flatten State", object.flattened ? "Flattened metadata foundation" : "Not flattened"]
    ].forEach(([label, value]) => {
      const labelElement = document.createElement("span");
      labelElement.className = "object-vector-studio-v2__detail-label";
      labelElement.textContent = label;
      const valueElement = document.createElement("span");
      valueElement.className = "object-vector-studio-v2__detail-value";
      valueElement.textContent = value;
      wrapper.append(labelElement, valueElement);
    });
    return wrapper;
  }

  selectObject(objectId, sourceLabel) {
    if (!this.currentPayload?.objects.some((object) => object.id === objectId)) {
      this.statusLog.write(`WARN Select object skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }

    this.selectedObjectId = objectId;
    this.renderPayload();
    const selected = this.selectedObject();
    this.statusLog.write(`OK Selected object from ${sourceLabel}: ${selected.name}.`);
  }

  addObject() {
    const name = this.elements.objectNameInput.value.trim();
    if (!this.currentPayload) {
      this.statusLog.write("FAIL Add object blocked: load a schema-valid palette-backed payload before adding objects.");
      return;
    }
    if (!name) {
      this.statusLog.write("FAIL Add object blocked: enter an object name.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const id = this.uniqueObjectId(name, nextPayload.objects);
    nextPayload.objects.push({
      id,
      metadata: {
        objectType: DEFAULT_OBJECT_TYPE,
        source: "Object Vector Studio V2 object management foundation"
      },
      name,
      shapes: [],
      type: DEFAULT_OBJECT_TYPE
    });
    this.commitPayloadUpdate(nextPayload, id, `OK Added object ${name} with id ${id}.`, "Add object failed schema validation");
  }

  renameSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Rename object skipped: no object is selected.");
      return;
    }

    const name = this.elements.objectNameInput.value.trim();
    if (!name) {
      this.statusLog.write("FAIL Rename object blocked: enter an object name.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    nextObject.name = name;
    this.commitPayloadUpdate(nextPayload, selected.id, `OK Renamed object ${selected.id} to ${name}.`, "Rename object failed schema validation");
  }

  deleteSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Delete object skipped: no object is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    nextPayload.objects = nextPayload.objects.filter((object) => object.id !== selected.id);
    const selectedObjectId = nextPayload.objects[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, selectedObjectId, `OK Deleted object ${selected.name}.`, "Delete object failed schema validation");
  }

  flattenSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Flatten object skipped: no object is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    nextObject.flattened = true;
    nextObject.metadata = {
      ...(nextObject.metadata || {}),
      flattenState: "flattened",
      objectType: objectTypeKey(nextObject)
    };
    this.commitPayloadUpdate(nextPayload, selected.id, `OK Flattened object metadata for ${selected.name}.`, "Flatten object failed schema validation");
  }

  commitPayloadUpdate(nextPayload, selectedObjectId, okMessage, failPrefix) {
    const validation = this.schemaService.validatePayload(nextPayload);
    if (!validation.ok) {
      this.statusLog.write(`FAIL ${failPrefix}: ${validation.errors.join(" ")}`);
      return;
    }

    this.currentPayload = validation.payload;
    this.selectedObjectId = selectedObjectId;
    this.actionNav.setJsonPayloadActionsEnabled(true);
    this.renderPayload();
    this.statusLog.write(okMessage);
  }

  cloneCurrentPayload() {
    if (typeof this.window.structuredClone === "function") {
      return this.window.structuredClone(this.currentPayload);
    }
    return JSON.parse(JSON.stringify(this.currentPayload));
  }

  selectedObject() {
    return this.currentPayload?.objects.find((object) => object.id === this.selectedObjectId) || null;
  }

  uniqueObjectId(name, objects) {
    const baseId = slugifyObjectName(name);
    const usedIds = new Set(objects.map((object) => object.id));
    if (!usedIds.has(baseId)) {
      return baseId;
    }

    let suffix = 2;
    let candidate = `${baseId}-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${baseId}-${suffix}`;
    }
    return candidate;
  }

  updateObjectActionState() {
    const hasSelectedObject = Boolean(this.selectedObject());
    this.elements.renameObjectButton.disabled = !hasSelectedObject;
    this.elements.deleteObjectButton.disabled = !hasSelectedObject;
    this.elements.flattenObjectButton.disabled = !hasSelectedObject;
  }

  async copyJson() {
    if (!this.currentPayload) {
      this.statusLog.write("FAIL Copy JSON blocked: no schema-valid Object Vector Studio V2 payload is loaded.");
      return;
    }

    const json = JSON.stringify(this.currentPayload, null, 2);
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.write("WARN Clipboard API unavailable. JSON Details remains read-only on the active object.");
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
