const WORKSPACE_TOOL_SESSION_KEY = "workspace.tools.object-vector-studio-v2";
const TOOL_DISPLAY_MODE_KEY = "object-vector-studio-v2.toolDisplayMode";
const DEFAULT_OBJECT_TYPE = "object";
const SVG_NS = "http://www.w3.org/2000/svg";

const OBJECT_TYPE_DETAILS = Object.freeze({
  actor: "Actor entity metadata framework for reusable gameplay participants.",
  enemy: "Enemy entity metadata framework for hostile reusable objects.",
  object: "Generic reusable gameplay object metadata framework.",
  pickup: "Pickup entity metadata framework for collectibles and rewards.",
  ship: "Ship entity metadata framework for player, NPC, or vehicle objects.",
  ui: "UI vector asset metadata framework for interface objects.",
  weapon: "Weapon entity metadata framework for projectile or attack objects."
});

const SHAPE_TYPE_DETAILS = Object.freeze({
  arc: "Arc primitive metadata with center, radius, and angle span.",
  circle: "Circle primitive metadata with center point and radius.",
  ellipse: "Ellipse primitive metadata with center point and radius pair.",
  line: "Line primitive metadata with start and end points.",
  polygon: "Polygon primitive metadata with ordered point ownership.",
  rectangle: "Rectangle primitive metadata with position and dimensions.",
  text: "Text primitive metadata with position, font size, and content."
});

const PRIMITIVE_TOOLS = Object.freeze(["rectangle", "circle", "ellipse", "line", "polygon", "arc", "text"]);

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

function shapeTypeLabel(shape) {
  return shape.type.replace(/(^|-)([a-z])/g, (match) => match.toUpperCase()).replaceAll("-", " ");
}

function objectCountLabel(count) {
  return `${count} ${count === 1 ? "object" : "objects"}`;
}

function shapeCountLabel(count) {
  return `${count} ${count === 1 ? "shape" : "shapes"}`;
}

function slugifyObjectName(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "object";
}

function sortedShapes(object) {
  return [...(object?.shapes || [])].sort((left, right) => left.order - right.order);
}

function swatchColor(swatch) {
  return swatch?.value || swatch?.hex || swatch?.color || "";
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
    this.selectedShapeId = "";
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
    this.applyToolDisplayMode(this.window.sessionStorage?.getItem(TOOL_DISPLAY_MODE_KEY) || "words", false);
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
      const nextMode = this.elements.toolToggleGrid.classList.contains("is-icon-only") ? "words" : "icons";
      this.applyToolDisplayMode(nextMode, true);
    });

    this.elements.toolToggles.forEach((button) => {
      button.addEventListener("click", () => {
        const tool = button.dataset.shapeTool || "unknown";
        this.setActiveToolButton(button);
        if (PRIMITIVE_TOOLS.includes(tool)) {
          this.createShape(tool);
          return;
        }
        this.statusLog.write(`OK Shape/Tools mode selected: ${tool}.`);
      });
    });
  }

  applyToolDisplayMode(mode, shouldLog) {
    const isCompact = mode === "icons";
    this.elements.toolToggleGrid.classList.toggle("is-icon-only", isCompact);
    this.elements.toolLabelModeButton.setAttribute("aria-pressed", String(isCompact));
    this.elements.toolLabelModeButton.textContent = isCompact ? "Words" : "Icons";
    this.window.sessionStorage?.setItem(TOOL_DISPLAY_MODE_KEY, isCompact ? "icons" : "words");
    if (shouldLog) {
      this.statusLog.write(`OK Shape/Tools display mode set to ${isCompact ? "compact icons" : "words and icons"}.`);
    }
  }

  setActiveToolButton(button) {
    this.elements.toolToggles.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === button);
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
  }

  renderEmptyState(message) {
    this.currentPayload = null;
    this.selectedObjectId = "";
    this.selectedShapeId = "";
    this.elements.sourceSummary.value = "No schema-loaded payload";
    this.elements.paletteGate.value = "Required before render";
    this.elements.objectCount.value = objectCountLabel(0);
    this.elements.shapeCount.value = shapeCountLabel(0);
    this.elements.objectNameInput.value = "";
    this.elements.loadStatus.textContent = message;
    this.elements.paletteSummary.textContent = "Palette required before render.";
    this.elements.objectDetails.textContent = "No object selected.";
    this.elements.selectedItemVisibility.textContent = "No schema-valid object selected.";
    this.elements.jsonDetails.textContent = "{}";
    this.elements.renderSummary.textContent = "Render mode: idle. Capture mode: none.";
    this.elements.renderSurface.replaceChildren();
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
    this.selectedShapeId = sortedShapes(this.currentPayload.objects[0])[0]?.id || "";
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

    const validation = this.schemaService.validatePayload(this.currentPayload);
    if (!validation.ok) {
      const message = `Render blocked by Object Vector Studio V2 schema validation: ${validation.errors.join(" ")}`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    this.currentPayload = validation.payload;
    this.ensureSelectedShape();
    this.renderPalette();
    this.renderObjectTiles();
    this.renderSelectedObject();
    this.renderWorkSurface();
    this.updateObjectActionState();
  }

  renderPalette() {
    const swatchCount = this.currentPayload.palette.swatches.length;
    this.elements.paletteSummary.replaceChildren();
    const heading = document.createElement("p");
    heading.textContent = `Palette ${this.currentPayload.palette.id}: ${swatchCount} swatches.`;
    const list = document.createElement("div");
    list.className = "object-vector-studio-v2__palette-swatch-list";
    this.currentPayload.palette.swatches.forEach((swatch, index) => {
      const label = swatch?.name || swatch?.id || `swatch-${index + 1}`;
      const color = swatchColor(swatch);
      const item = document.createElement("button");
      item.className = "object-vector-studio-v2__palette-swatch";
      item.type = "button";
      item.dataset.paletteColor = color;
      item.textContent = `${label}: ${color || "value unavailable"}`;
      if (color) {
        item.style.setProperty("--object-vector-studio-v2-swatch", color);
      }
      item.addEventListener("click", () => this.applyPaletteColor(color, label));
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
      meta.textContent = `${object.id} - ${objectTypeLabel(object)} - ${shapeCountLabel(object.shapes.length)}`;

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
      this.elements.shapeCount.value = shapeCountLabel(0);
      this.elements.objectDetails.textContent = "No object selected.";
      this.elements.selectedItemVisibility.textContent = "No schema-valid object selected.";
      this.elements.jsonDetails.textContent = "{}";
      return;
    }

    const shape = this.selectedShape();
    this.elements.objectNameInput.value = selected.name;
    this.elements.shapeCount.value = shapeCountLabel(selected.shapes.length);
    this.elements.objectDetails.replaceChildren(this.createObjectDetails(selected, shape));
    this.elements.selectedItemVisibility.textContent = shape
      ? `Selected item visible: ${selected.name} / ${shape.id} (${shape.type})`
      : `Selected item visible: ${selected.name}`;
    this.elements.jsonDetails.textContent = JSON.stringify({
      object: selected,
      selectedShape: shape
    }, null, 2);
  }

  createObjectDetails(object, shape) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-vector-studio-v2__object-detail-stack";
    wrapper.append(this.createDetailGrid([
      ["Object Name", object.name],
      ["Object ID", object.id],
      ["Object Type", objectTypeLabel(object)],
      ["Object Metadata", objectTypeDescription(object)],
      ["Shape Count", shapeCountLabel(object.shapes.length)],
      ["Flatten State", object.flattened ? "Flattened metadata foundation" : "Not flattened"]
    ]));

    const shapePanel = document.createElement("section");
    shapePanel.className = "object-vector-studio-v2__shape-panel";
    const heading = document.createElement("h3");
    heading.textContent = shape ? `Selected Shape: ${shape.id}` : "Selected Shape";
    shapePanel.append(heading);
    if (!shape) {
      const empty = document.createElement("p");
      empty.textContent = "No shape selected. Create a primitive from Shape/Tools.";
      shapePanel.append(empty);
      wrapper.append(shapePanel);
      return wrapper;
    }

    shapePanel.append(this.createDetailGrid([
      ["Shape Type", shapeTypeLabel(shape)],
      ["Shape Metadata", SHAPE_TYPE_DETAILS[shape.type]],
      ["Order", String(shape.order)],
      ["Visible", shape.visible ? "Visible" : "Hidden"],
      ["Locked", shape.locked ? "Locked" : "Unlocked"],
      ["Color", shape.style.fill === "none" ? shape.style.stroke : shape.style.fill]
    ]));
    shapePanel.append(this.createShapeActions(shape));
    wrapper.append(shapePanel);
    return wrapper;
  }

  createDetailGrid(entries) {
    const grid = document.createElement("div");
    grid.className = "object-vector-studio-v2__object-detail-grid";
    entries.forEach(([label, value]) => {
      const labelElement = document.createElement("span");
      labelElement.className = "object-vector-studio-v2__detail-label";
      labelElement.textContent = label;
      const valueElement = document.createElement("span");
      valueElement.className = "object-vector-studio-v2__detail-value";
      valueElement.textContent = value;
      grid.append(labelElement, valueElement);
    });
    return grid;
  }

  createShapeActions(shape) {
    const actions = document.createElement("div");
    actions.className = "object-vector-studio-v2__shape-actions";
    [
      ["objectVectorStudioV2ShapeVisibilityButton", shape.visible ? "Hide Shape" : "Show Shape", () => this.toggleSelectedShapeVisibility()],
      ["objectVectorStudioV2ShapeLockButton", shape.locked ? "Unlock Shape" : "Lock Shape", () => this.toggleSelectedShapeLock()],
      ["objectVectorStudioV2ShapeMoveUpButton", "Move Up", () => this.moveSelectedShape(-1)],
      ["objectVectorStudioV2ShapeMoveDownButton", "Move Down", () => this.moveSelectedShape(1)]
    ].forEach(([id, label, handler]) => {
      const button = document.createElement("button");
      button.id = id;
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", handler);
      actions.append(button);
    });
    return actions;
  }

  renderWorkSurface() {
    const object = this.selectedObject();
    this.elements.renderSurface.replaceChildren();
    if (!object) {
      this.elements.renderSummary.textContent = "Render mode: idle. Capture mode: none.";
      return;
    }

    let renderedCount = 0;
    sortedShapes(object).forEach((shape) => {
      if (!shape.visible) {
        return;
      }
      try {
        const element = this.createSvgShape(shape);
        element.dataset.shapeId = shape.id;
        element.dataset.shapeType = shape.type;
        element.classList.add("object-vector-studio-v2__shape");
        element.classList.toggle("is-selected", shape.id === this.selectedShapeId);
        element.setAttribute("tabindex", "0");
        element.addEventListener("click", () => this.selectShape(shape.id, "render surface"));
        this.elements.renderSurface.append(element);
        renderedCount += 1;
      } catch (error) {
        this.statusLog.write(`FAIL Render mode svg-work-surface failed for shape ${shape.id} (${shape.type}): ${error.message}`);
      }
    });

    const message = `Render mode svg-work-surface: rendered ${object.name} with ${renderedCount} visible shapes; capture mode none.`;
    this.elements.renderSummary.textContent = message;
    this.statusLog.write(`OK ${message}`);
  }

  createSvgShape(shape) {
    if (shape.type === "rectangle") {
      const element = document.createElementNS(SVG_NS, "rect");
      element.setAttribute("x", shape.geometry.x);
      element.setAttribute("y", shape.geometry.y);
      element.setAttribute("width", shape.geometry.width);
      element.setAttribute("height", shape.geometry.height);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "circle") {
      const element = document.createElementNS(SVG_NS, "circle");
      element.setAttribute("cx", shape.geometry.cx);
      element.setAttribute("cy", shape.geometry.cy);
      element.setAttribute("r", shape.geometry.r);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "ellipse") {
      const element = document.createElementNS(SVG_NS, "ellipse");
      element.setAttribute("cx", shape.geometry.cx);
      element.setAttribute("cy", shape.geometry.cy);
      element.setAttribute("rx", shape.geometry.rx);
      element.setAttribute("ry", shape.geometry.ry);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "line") {
      const element = document.createElementNS(SVG_NS, "line");
      element.setAttribute("x1", shape.geometry.x1);
      element.setAttribute("y1", shape.geometry.y1);
      element.setAttribute("x2", shape.geometry.x2);
      element.setAttribute("y2", shape.geometry.y2);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "polygon") {
      const element = document.createElementNS(SVG_NS, "polygon");
      element.setAttribute("points", shape.geometry.points.map((point) => `${point.x},${point.y}`).join(" "));
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "arc") {
      const element = document.createElementNS(SVG_NS, "path");
      element.setAttribute("d", this.arcPath(shape.geometry));
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "text") {
      const element = document.createElementNS(SVG_NS, "text");
      element.setAttribute("x", shape.geometry.x);
      element.setAttribute("y", shape.geometry.y);
      element.setAttribute("font-size", shape.geometry.fontSize);
      element.textContent = shape.geometry.text;
      this.applySvgStyle(element, shape);
      return element;
    }
    throw new Error(`unsupported shape type ${shape.type}`);
  }

  applySvgStyle(element, shape) {
    element.setAttribute("fill", shape.style.fill);
    element.setAttribute("stroke", shape.style.stroke);
    element.setAttribute("stroke-width", shape.style.strokeWidth);
  }

  arcPath(geometry) {
    const start = this.polarPoint(geometry.cx, geometry.cy, geometry.r, geometry.startAngle);
    const end = this.polarPoint(geometry.cx, geometry.cy, geometry.r, geometry.endAngle);
    const largeArc = Math.abs(geometry.endAngle - geometry.startAngle) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${geometry.r} ${geometry.r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  polarPoint(cx, cy, radius, degrees) {
    const radians = (degrees - 90) * Math.PI / 180;
    return {
      x: Number((cx + radius * Math.cos(radians)).toFixed(3)),
      y: Number((cy + radius * Math.sin(radians)).toFixed(3))
    };
  }

  selectObject(objectId, sourceLabel) {
    if (!this.currentPayload?.objects.some((object) => object.id === objectId)) {
      this.statusLog.write(`WARN Select object skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }

    this.selectedObjectId = objectId;
    this.selectedShapeId = sortedShapes(this.selectedObject())[0]?.id || "";
    this.renderPayload();
    const selected = this.selectedObject();
    this.statusLog.write(`OK Selected object from ${sourceLabel}: ${selected.name}.`);
  }

  selectShape(shapeId, sourceLabel) {
    const object = this.selectedObject();
    if (!object?.shapes.some((shape) => shape.id === shapeId)) {
      this.statusLog.write(`WARN Select shape skipped: shape id ${shapeId || "unknown"} is not available.`);
      return;
    }

    this.selectedShapeId = shapeId;
    this.renderPayload();
    const shape = this.selectedShape();
    this.statusLog.write(`OK Selected shape from ${sourceLabel}: ${shape.id} (${shape.type}).`);
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
    this.commitPayloadUpdate(nextPayload, id, "", `OK Added object ${name} with id ${id}.`, "Add object failed schema validation");
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
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeId, `OK Renamed object ${selected.id} to ${name}.`, "Rename object failed schema validation");
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
    const selectedShapeId = sortedShapes(nextPayload.objects[0])[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeId, `OK Deleted object ${selected.name}.`, "Delete object failed schema validation");
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
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeId, `OK Flattened object metadata for ${selected.name}.`, "Flatten object failed schema validation");
  }

  createShape(type) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write(`FAIL Create ${type} blocked: select a schema-valid object first.`);
      return;
    }

    const color = this.firstPaletteColor();
    if (!color) {
      this.statusLog.write(`FAIL Create ${type} blocked: palette swatches do not provide a usable color value.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const order = nextObject.shapes.length ? Math.max(...nextObject.shapes.map((shape) => shape.order)) + 1 : 1;
    const shape = this.createPrimitiveShape(type, this.uniqueShapeId(type, nextObject.shapes), order, color);
    nextObject.shapes.push(shape);
    this.commitPayloadUpdate(nextPayload, nextObject.id, shape.id, `OK Created ${type} shape ${shape.id} on ${nextObject.name}.`, `Create ${type} failed schema validation`);
  }

  createPrimitiveShape(type, id, order, color) {
    const base = {
      id,
      locked: false,
      metadata: {
        renderMode: "svg-work-surface",
        shapeType: type
      },
      order,
      style: {
        fill: ["arc", "line"].includes(type) ? "none" : color,
        stroke: color,
        strokeWidth: 3
      },
      type,
      visible: true
    };
    if (type === "rectangle") {
      return { ...base, geometry: { height: 62, width: 86, x: 34, y: 48 } };
    }
    if (type === "circle") {
      return { ...base, geometry: { cx: 244, cy: 72, r: 30 } };
    }
    if (type === "ellipse") {
      return { ...base, geometry: { cx: 238, cy: 152, rx: 52, ry: 26 } };
    }
    if (type === "line") {
      return { ...base, geometry: { x1: 42, x2: 142, y1: 174, y2: 128 } };
    }
    if (type === "polygon") {
      return {
        ...base,
        geometry: {
          points: [
            { x: 154, y: 34 },
            { x: 194, y: 106 },
            { x: 116, y: 106 }
          ]
        }
      };
    }
    if (type === "arc") {
      return { ...base, geometry: { cx: 158, cy: 162, endAngle: 135, r: 42, startAngle: -135 } };
    }
    if (type === "text") {
      return { ...base, geometry: { fontSize: 24, text: "Text", x: 132, y: 124 } };
    }
    return base;
  }

  applyPaletteColor(color, label) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("FAIL Palette color application blocked: select a shape first.");
      return;
    }
    if (!color) {
      this.statusLog.write(`FAIL Palette color application blocked: swatch ${label} has no usable color value.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Palette color application skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    if (["arc", "line"].includes(shape.type)) {
      shape.style.stroke = color;
    } else {
      shape.style.fill = color;
    }
    shape.metadata = {
      ...(shape.metadata || {}),
      paletteSwatch: label
    };
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Applied palette color ${color} from ${label} to shape ${selected.id}.`, "Palette color application failed schema validation");
  }

  toggleSelectedShapeVisibility() {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Shape visibility skipped: no shape is selected.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Shape visibility skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    shape.visible = !shape.visible;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Shape ${selected.id} visibility set to ${shape.visible ? "visible" : "hidden"}.`, "Shape visibility failed schema validation");
  }

  toggleSelectedShapeLock() {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Shape lock skipped: no shape is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    shape.locked = !shape.locked;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Shape ${selected.id} lock set to ${shape.locked ? "locked" : "unlocked"}.`, "Shape lock failed schema validation");
  }

  moveSelectedShape(direction) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Shape order skipped: no shape is selected.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Shape order skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = nextPayload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    const shapes = sortedShapes(object);
    const index = shapes.findIndex((shape) => shape.id === selected.id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= shapes.length) {
      this.statusLog.write(`WARN Shape order skipped: shape ${selected.id} is already at the ${direction < 0 ? "front" : "back"}.`);
      return;
    }

    const currentOrder = shapes[index].order;
    shapes[index].order = shapes[swapIndex].order;
    shapes[swapIndex].order = currentOrder;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Shape ${selected.id} order changed to ${shapes[index].order}.`, "Shape order failed schema validation");
  }

  commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeId, okMessage, failPrefix) {
    const validation = this.schemaService.validatePayload(nextPayload);
    if (!validation.ok) {
      this.statusLog.write(`FAIL ${failPrefix}: ${validation.errors.join(" ")}`);
      return;
    }

    this.currentPayload = validation.payload;
    this.selectedObjectId = selectedObjectId;
    this.selectedShapeId = selectedShapeId || "";
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

  selectedShape() {
    return this.selectedObject()?.shapes.find((shape) => shape.id === this.selectedShapeId) || null;
  }

  ensureSelectedShape() {
    const object = this.selectedObject();
    if (!object) {
      this.selectedShapeId = "";
      return;
    }
    if (object.shapes.some((shape) => shape.id === this.selectedShapeId)) {
      return;
    }
    this.selectedShapeId = sortedShapes(object)[0]?.id || "";
  }

  findShapeInPayload(payload, shapeId) {
    return payload.objects
      .find((object) => object.id === this.selectedObjectId)
      ?.shapes.find((shape) => shape.id === shapeId);
  }

  firstPaletteColor() {
    const swatch = this.currentPayload?.palette.swatches.find((candidate) => swatchColor(candidate));
    return swatchColor(swatch);
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

  uniqueShapeId(type, shapes) {
    const usedIds = new Set(shapes.map((shape) => shape.id));
    let suffix = shapes.length + 1;
    let candidate = `${type}-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${type}-${suffix}`;
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
