import {
  areMasksColliding,
  arePolygonsColliding,
  getPolygonBounds,
  isColliding,
  isPointInPolygon
} from "../../../src/engine/collision/index.js";

const MODE_LABELS = Object.freeze({
  bounds: "Bounds",
  hybrid: "Hybrid",
  "pixel-sprite": "Pixel/Sprite",
  pixel: "Pixel/Sprite",
  sprite: "Pixel/Sprite",
  vector: "Vector"
});
const MODE_ALIASES = Object.freeze({
  pixel: "pixel-sprite",
  sprite: "pixel-sprite"
});
const OBJECT_LABELS = Object.freeze({
  a: "Object A",
  b: "Object B"
});
const ASTEROIDS_MANIFEST_PATH = "/games/Asteroids/game.manifest.json";
const POLYGON_SAMPLE_COUNT = 28;
const MASK_CELL_SIZE = 4;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundNumber(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(numberValue(value) * factor) / factor;
}

function roundPoint(point) {
  return {
    x: roundNumber(point?.x),
    y: roundNumber(point?.y)
  };
}

function roundBounds(bounds) {
  return {
    x: roundNumber(bounds?.x),
    y: roundNumber(bounds?.y),
    width: roundNumber(bounds?.width),
    height: roundNumber(bounds?.height)
  };
}

function normalizeMode(mode) {
  const rawMode = String(mode || "").trim().toLowerCase();
  return MODE_ALIASES[rawMode] || rawMode || "bounds";
}

function sortedShapes(object) {
  return [...(Array.isArray(object?.shapes) ? object.shapes : [])]
    .sort((left, right) => numberValue(left.order) - numberValue(right.order));
}

function sortedFrames(state) {
  return [...(Array.isArray(state?.frames) ? state.frames : [])]
    .sort((left, right) => numberValue(left.order) - numberValue(right.order));
}

function firstObjectFrame(object) {
  const states = Array.isArray(object?.states) ? object.states : [];
  const preferredState = states.find((state) => ["active", "idle"].includes(String(state?.id || "").trim().toLowerCase()))
    || states[0]
    || null;
  return sortedFrames(preferredState)[0] || null;
}

function shapeTool(shape) {
  const tool = String(shape?.tool || "").trim().toLowerCase();
  if (tool === "triangle") {
    return "polygon";
  }
  if (tool === "square") {
    return "rectangle";
  }
  return tool;
}

function shapeTransform(shape) {
  const transform = isPlainObject(shape?.transform) ? shape.transform : {};
  return {
    rotation: numberValue(transform.rotation),
    scaleX: numberValue(transform.scaleX, 1),
    scaleY: numberValue(transform.scaleY, 1),
    x: numberValue(transform.x),
    y: numberValue(transform.y)
  };
}

function objectOrigin(object) {
  return {
    x: numberValue(object?.objectOrigin?.x),
    y: numberValue(object?.objectOrigin?.y)
  };
}

function effectiveShapeForFrame(shape, frame, shapeIndex) {
  const effective = clone(shape);
  const override = Array.isArray(frame?.shapeOverrides)
    ? frame.shapeOverrides.find((entry) => entry.shapeIndex === shapeIndex)
    : null;
  if (override && Object.prototype.hasOwnProperty.call(override, "visible")) {
    effective.visible = override.visible;
  }
  if (isPlainObject(override?.transform)) {
    effective.transform = { ...effective.transform, ...override.transform };
  }
  return effective;
}

function rectanglePoints(x, y, width, height) {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height }
  ];
}

function ellipsePoints(cx, cy, rx, ry, count = POLYGON_SAMPLE_COUNT) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    return {
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry
    };
  });
}

function segmentPolygon(start, end, width) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length <= 0) {
    const radius = Math.max(1, width / 2);
    return rectanglePoints(start.x - radius, start.y - radius, radius * 2, radius * 2);
  }
  const nx = (-dy / length) * (width / 2);
  const ny = (dx / length) * (width / 2);
  return [
    { x: start.x + nx, y: start.y + ny },
    { x: end.x + nx, y: end.y + ny },
    { x: end.x - nx, y: end.y - ny },
    { x: start.x - nx, y: start.y - ny }
  ];
}

function boundsFromPoints(points) {
  if (!Array.isArray(points) || !points.length) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  return getPolygonBounds(points);
}

function shapeLocalPolygons(shape) {
  const geometry = isPlainObject(shape?.geometry) ? shape.geometry : {};
  const tool = shapeTool(shape);
  if (tool === "rectangle") {
    return [rectanglePoints(numberValue(geometry.x), numberValue(geometry.y), numberValue(geometry.width, 1), numberValue(geometry.height, 1))];
  }
  if (tool === "polygon") {
    const points = Array.isArray(geometry.points) ? geometry.points.map((point) => ({ x: numberValue(point.x), y: numberValue(point.y) })) : [];
    return points.length >= 3 ? [points] : [];
  }
  if (tool === "polyline") {
    const points = Array.isArray(geometry.points) ? geometry.points.map((point) => ({ x: numberValue(point.x), y: numberValue(point.y) })) : [];
    const strokeWidth = Math.max(2, numberValue(shape?.style?.strokeWidth, 2));
    return points.slice(1).map((point, index) => segmentPolygon(points[index], point, strokeWidth));
  }
  if (tool === "line") {
    const strokeWidth = Math.max(2, numberValue(shape?.style?.strokeWidth, 2));
    return [segmentPolygon(
      { x: numberValue(geometry.point1?.x), y: numberValue(geometry.point1?.y) },
      { x: numberValue(geometry.point2?.x), y: numberValue(geometry.point2?.y) },
      strokeWidth
    )];
  }
  if (tool === "circle") {
    const radius = Math.max(1, numberValue(geometry.r, 1));
    return [ellipsePoints(numberValue(geometry.cx), numberValue(geometry.cy), radius, radius)];
  }
  if (tool === "ellipse") {
    return [ellipsePoints(numberValue(geometry.cx), numberValue(geometry.cy), Math.max(1, numberValue(geometry.rx, 1)), Math.max(1, numberValue(geometry.ry, 1)))];
  }
  return [];
}

function transformShapePoint(point, transform, origin) {
  const radians = (transform.rotation * Math.PI) / 180;
  const scaledX = (point.x - origin.x) * transform.scaleX;
  const scaledY = (point.y - origin.y) * transform.scaleY;
  const rotatedX = scaledX * Math.cos(radians) - scaledY * Math.sin(radians);
  const rotatedY = scaledX * Math.sin(radians) + scaledY * Math.cos(radians);
  return {
    x: rotatedX + origin.x + transform.x,
    y: rotatedY + origin.y + transform.y
  };
}

function transformInstancePoint(point, origin, instance) {
  const radians = (numberValue(instance?.rotation) * Math.PI) / 180;
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return {
    x: (dx * Math.cos(radians) - dy * Math.sin(radians)) + origin.x + numberValue(instance?.x),
    y: (dx * Math.sin(radians) + dy * Math.cos(radians)) + origin.y + numberValue(instance?.y)
  };
}

function objectPolygons(object, instance) {
  const frame = firstObjectFrame(object);
  const origin = objectOrigin(object);
  return sortedShapes(object)
    .map((shape, shapeIndex) => effectiveShapeForFrame(shape, frame, shapeIndex))
    .filter((shape) => shape.visible !== false)
    .flatMap((shape) => {
      const transform = shapeTransform(shape);
      return shapeLocalPolygons(shape)
        .map((polygon) => polygon.map((point) => transformInstancePoint(transformShapePoint(point, transform, origin), origin, instance)))
        .filter((polygon) => polygon.length >= 3);
    });
}

function objectShapeRotations(object) {
  const frame = firstObjectFrame(object);
  const rotations = sortedShapes(object)
    .map((shape, shapeIndex) => effectiveShapeForFrame(shape, frame, shapeIndex))
    .filter((shape) => shape.visible !== false)
    .map((shape) => roundNumber(shapeTransform(shape).rotation, 1));
  return [...new Set(rotations)];
}

function boundsFromPolygons(polygons) {
  const points = polygons.flat();
  if (!points.length) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  const bounds = boundsFromPoints(points);
  return {
    x: bounds.x,
    y: bounds.y,
    width: Math.max(1, bounds.width),
    height: Math.max(1, bounds.height)
  };
}

function anyPolygonsCollide(leftPolygons, rightPolygons) {
  return leftPolygons.some((left) => rightPolygons.some((right) => arePolygonsColliding(left, right)));
}

function maskFromPolygons(polygons, bounds) {
  const width = Math.max(1, Math.ceil(bounds.width / MASK_CELL_SIZE) + 2);
  const height = Math.max(1, Math.ceil(bounds.height / MASK_CELL_SIZE) + 2);
  const rows = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const point = {
        x: bounds.x + x * MASK_CELL_SIZE + MASK_CELL_SIZE / 2,
        y: bounds.y + y * MASK_CELL_SIZE + MASK_CELL_SIZE / 2
      };
      rows[y][x] = polygons.some((polygon) => isPointInPolygon(point, polygon)) ? 1 : 0;
    }
  }
  return { rows, width, height, cellSize: MASK_CELL_SIZE };
}

function intersectionRect(left, right) {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const width = Math.min(left.x + left.width, right.x + right.width) - x;
  const height = Math.min(left.y + left.height, right.y + right.height) - y;
  return width > 0 && height > 0 ? { x, y, width, height } : null;
}

function labelForObject(object) {
  return `${object?.name || "Object"} (${object?.id || "unknown"})`;
}

export class CollisionInspectorV2App {
  constructor({ elements, windowRef = window }) {
    this.elements = elements;
    this.window = windowRef;
    this.ctx = this.elements.canvas.getContext("2d");
    this.manifest = null;
    this.objects = [];
    this.instances = {
      a: { x: 360, y: 320, rotation: 0 },
      b: { x: 500, y: 320, rotation: 0 }
    };
    this.dragState = null;
    this.lastResult = null;
    this.logLines = [];
  }

  async start() {
    this.mountAccordions();
    this.mountEvents();
    this.syncLaunchMode();
    this.log("INFO Collision Inspector V2 ready.");
    await this.loadWorkspaceManifestIfAvailable();
    this.evaluateAndRender();
  }

  mountAccordions() {
    this.window.document.querySelectorAll(".accordion-v2").forEach((section) => {
      const header = section.querySelector(".accordion-v2__header");
      const content = section.querySelector(".accordion-v2__content");
      if (!header || !content || header.tagName !== "BUTTON") {
        return;
      }
      header.addEventListener("click", () => {
        const isOpen = section.classList.toggle("is-open");
        section.dataset.accordionV2Open = String(isOpen);
        header.setAttribute("aria-expanded", String(isOpen));
        content.hidden = !isOpen;
      });
    });
  }

  mountEvents() {
    this.elements.fileInput.addEventListener("change", () => {
      void this.loadManifestFile(this.elements.fileInput.files?.[0] || null);
    });
    this.elements.loadAsteroidsButton.addEventListener("click", () => {
      void this.loadManifestFromPath(ASTEROIDS_MANIFEST_PATH, "Asteroids validation path");
    });
    [this.elements.modeSelect, this.elements.objectASelect, this.elements.objectBSelect].forEach((control) => {
      control.addEventListener("change", () => {
        this.log(`INFO Collision controls changed: ${this.modeLabel()}.`);
        this.evaluateAndRender();
      });
    });
    [
      { key: "a", input: this.elements.rotationAInput },
      { key: "b", input: this.elements.rotationBInput }
    ].forEach(({ key, input }) => {
      input.addEventListener("input", () => {
        this.instances[key].rotation = numberValue(input.value);
        this.evaluateAndRender();
      });
    });
    this.elements.clearLogButton.addEventListener("click", () => {
      this.logLines = [];
      this.syncLog();
    });
    this.elements.resetButton.addEventListener("click", () => {
      this.resetSimulation();
    });
    this.elements.copyReportButton.addEventListener("click", () => {
      void this.copyReport();
    });
    this.elements.returnToWorkspaceButton.addEventListener("click", () => {
      this.window.location.href = this.workspaceReturnUrl();
    });
    this.elements.canvas.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    this.window.addEventListener("pointermove", (event) => this.handlePointerMove(event));
    this.window.addEventListener("pointerup", () => this.handlePointerUp());
  }

  syncLaunchMode() {
    const params = new URLSearchParams(this.window.location.search || "");
    const workspaceLaunch = params.get("launch") === "workspace";
    this.elements.toolNav.hidden = workspaceLaunch;
    this.elements.workspaceNav.hidden = !workspaceLaunch;
  }

  workspaceReturnUrl() {
    const params = new URLSearchParams(this.window.location.search || "");
    const url = new URL("../workspace-manager-v2/index.html", this.window.location.href);
    const hostContextId = params.get("hostContextId") || "";
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    if (params.get("workspaceMode") === "uat") {
      url.searchParams.set("workspace", "uat");
    }
    return url.href;
  }

  async loadWorkspaceManifestIfAvailable() {
    const params = new URLSearchParams(this.window.location.search || "");
    const manifestPath = params.get("manifestPath") || params.get("gameManifestPath") || "";
    if (manifestPath) {
      await this.loadManifestFromPath(manifestPath, "URL manifest path");
      return;
    }
    if (params.get("gameId") === "Asteroids") {
      await this.loadManifestFromPath(ASTEROIDS_MANIFEST_PATH, "Asteroids validation path");
      return;
    }
    if (params.get("launch") !== "workspace") {
      return;
    }
    const hostContextId = params.get("hostContextId") || "";
    const raw = hostContextId ? this.window.sessionStorage.getItem(hostContextId) : "";
    if (!raw) {
      this.log("FAIL Workspace launch did not provide a stored manifest context.");
      return;
    }
    try {
      this.loadManifest(JSON.parse(raw), `workspace:${hostContextId}`);
    } catch (error) {
      this.log(`FAIL Workspace manifest JSON could not be parsed: ${error.message}`);
    }
  }

  async loadManifestFromPath(path, sourceLabel = path) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      this.loadManifest(await response.json(), sourceLabel || path);
    } catch (error) {
      this.log(`FAIL Manifest load failed from ${path}: ${error.message}`);
    }
  }

  async loadManifestFile(file) {
    if (!file) {
      return;
    }
    try {
      const payload = JSON.parse(await file.text());
      this.loadManifest(payload, file.name);
    } catch (error) {
      this.log(`FAIL Manifest load failed: ${error.message}`);
    } finally {
      this.elements.fileInput.value = "";
    }
  }

  loadManifest(manifest, sourceLabel) {
    const objects = Array.isArray(manifest?.tools?.["object-vector-studio-v2"]?.objects)
      ? manifest.tools["object-vector-studio-v2"].objects
      : [];
    if (!objects.length) {
      this.manifest = null;
      this.objects = [];
      this.renderObjectOptions();
      this.elements.manifestSummary.textContent = "Manifest has no Object Vector Studio V2 objects.";
      this.log(`FAIL ${sourceLabel} has no Object Vector Studio V2 objects.`);
      this.evaluateAndRender();
      return;
    }
    this.manifest = manifest;
    this.objects = objects.map((object) => clone(object));
    this.renderObjectOptions();
    this.resetSimulation({ silent: true });
    const gameName = manifest?.game?.name || manifest?.name || manifest?.gameId || "Loaded manifest";
    this.elements.manifestSummary.textContent = `${gameName}: ${this.objects.length} vector objects loaded.`;
    this.log(`OK Loaded manifest ${sourceLabel}: ${this.objects.length} vector objects.`);
    this.evaluateAndRender();
  }

  renderObjectOptions() {
    const options = this.objects.map((object, index) => {
      const option = this.window.document.createElement("option");
      option.value = object.id || String(index);
      option.textContent = object.name || object.id || `Object ${index + 1}`;
      return option;
    });
    this.elements.objectASelect.replaceChildren(...options.map((option) => option.cloneNode(true)));
    this.elements.objectBSelect.replaceChildren(...options.map((option) => option.cloneNode(true)));
    if (this.objects[0]) {
      this.elements.objectASelect.value = this.objects[0].id;
    }
    if (this.objects[1]) {
      this.elements.objectBSelect.value = this.objects[1].id;
    } else if (this.objects[0]) {
      this.elements.objectBSelect.value = this.objects[0].id;
    }
  }

  resetSimulation({ silent = false } = {}) {
    this.instances = {
      a: { x: 360, y: 320, rotation: 0 },
      b: { x: 500, y: 320, rotation: 0 }
    };
    this.syncRotationInputs();
    if (!silent) {
      this.log("INFO Simulation reset.");
    }
    this.evaluateAndRender();
  }

  selectedObject(key) {
    const select = key === "a" ? this.elements.objectASelect : this.elements.objectBSelect;
    return this.objects.find((object) => object.id === select.value) || null;
  }

  geometryFor(key) {
    const object = this.selectedObject(key);
    const instance = this.instances[key];
    const origin = object ? objectOrigin(object) : { x: 0, y: 0 };
    const polygons = object ? objectPolygons(object, instance) : [];
    const bounds = boundsFromPolygons(polygons);
    const transformedPoints = polygons.flat().slice(0, 24).map(roundPoint);
    return {
      bounds,
      instance: { ...instance },
      object,
      origin,
      originWorld: object ? roundPoint(transformInstancePoint(origin, origin, instance)) : { x: 0, y: 0 },
      polygons,
      shapeRotations: object ? objectShapeRotations(object) : [],
      transformedPoints
    };
  }

  currentMode() {
    return normalizeMode(this.elements.modeSelect.value);
  }

  modeLabel() {
    return MODE_LABELS[this.currentMode()] || "Vector";
  }

  syncRotationInputs() {
    this.elements.rotationAInput.value = String(roundNumber(this.instances.a.rotation, 1));
    this.elements.rotationBInput.value = String(roundNumber(this.instances.b.rotation, 1));
  }

  evaluateCollision() {
    const mode = this.currentMode();
    const a = this.geometryFor("a");
    const b = this.geometryFor("b");
    if (!a.object || !b.object) {
      return {
        mode,
        modeLabel: this.modeLabel(),
        boundsOverlap: false,
        vectorOverlap: false,
        pixelOverlap: false,
        collided: false,
        objectA: "",
        objectB: "",
        boundsA: a.bounds,
        boundsB: b.bounds,
        instanceA: a.instance,
        instanceB: b.instance,
        objectOriginA: a.origin,
        objectOriginB: b.origin,
        originWorldA: a.originWorld,
        originWorldB: b.originWorld,
        polygonsA: 0,
        polygonsB: 0,
        shapeRotationsA: [],
        shapeRotationsB: [],
        transformedPointsA: [],
        transformedPointsB: []
      };
    }
    const boundsOverlap = isColliding(a.bounds, b.bounds);
    const vectorOverlap = boundsOverlap && anyPolygonsCollide(a.polygons, b.polygons);
    const maskA = maskFromPolygons(a.polygons, a.bounds);
    const maskB = maskFromPolygons(b.polygons, b.bounds);
    const pixelOverlap = boundsOverlap && areMasksColliding(maskA, a.bounds.x, a.bounds.y, maskB, b.bounds.x, b.bounds.y);
    const modeCollision = {
      bounds: boundsOverlap,
      hybrid: boundsOverlap && vectorOverlap && pixelOverlap,
      "pixel-sprite": pixelOverlap,
      vector: vectorOverlap
    };
    return {
      mode,
      modeLabel: this.modeLabel(),
      boundsOverlap,
      vectorOverlap,
      pixelOverlap,
      collided: modeCollision[mode] === true,
      objectA: a.object ? labelForObject(a.object) : "",
      objectB: b.object ? labelForObject(b.object) : "",
      boundsA: a.bounds,
      boundsB: b.bounds,
      instanceA: a.instance,
      instanceB: b.instance,
      objectOriginA: a.origin,
      objectOriginB: b.origin,
      originWorldA: a.originWorld,
      originWorldB: b.originWorld,
      polygonsA: a.polygons.length,
      polygonsB: b.polygons.length,
      shapeRotationsA: a.shapeRotations,
      shapeRotationsB: b.shapeRotations,
      transformedPointsA: a.transformedPoints,
      transformedPointsB: b.transformedPoints
    };
  }

  evaluateAndRender() {
    this.lastResult = this.evaluateCollision();
    this.syncResult();
    this.renderCanvas();
  }

  syncResult() {
    const result = this.lastResult || {};
    this.elements.resultBadge.dataset.collisionState = result.collided ? "hit" : "clear";
    this.elements.resultBadge.textContent = result.collided ? "Collision" : "No Collision";
    this.elements.overlapState.textContent = String(result.boundsOverlap === true);
    this.elements.modeState.textContent = result.modeLabel || "Vector";
    this.elements.boundsState.textContent = result.boundsOverlap ? "overlap" : "clear";
    this.elements.originState.textContent = `A ${result.originWorldA?.x ?? 0},${result.originWorldA?.y ?? 0} / B ${result.originWorldB?.x ?? 0},${result.originWorldB?.y ?? 0}`;
    this.elements.rotationState.textContent = `A ${roundNumber(result.instanceA?.rotation)} / B ${roundNumber(result.instanceB?.rotation)}`;
    this.elements.pointsState.textContent = `A ${result.transformedPointsA?.length || 0} / B ${result.transformedPointsB?.length || 0}`;
    this.elements.summary.textContent = JSON.stringify({
      mode: result.mode,
      collision: result.collided,
      overlap: result.boundsOverlap,
      bounds: {
        objectA: roundBounds(result.boundsA),
        objectB: roundBounds(result.boundsB)
      },
      vector: result.vectorOverlap,
      pixel: result.pixelOverlap,
      objectA: result.objectA,
      objectB: result.objectB,
      objectOrigins: {
        objectA: roundPoint(result.objectOriginA),
        objectB: roundPoint(result.objectOriginB)
      },
      worldOrigins: {
        objectA: result.originWorldA,
        objectB: result.originWorldB
      },
      rotation: {
        objectA: roundNumber(result.instanceA?.rotation),
        objectB: roundNumber(result.instanceB?.rotation),
        shapeRotationsA: result.shapeRotationsA,
        shapeRotationsB: result.shapeRotationsB
      },
      polygonsA: result.polygonsA,
      polygonsB: result.polygonsB,
      transformedPoints: {
        objectA: result.transformedPointsA,
        objectB: result.transformedPointsB
      }
    }, null, 2);
  }

  renderCanvas() {
    const canvas = this.elements.canvas;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#070b0c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawGrid(ctx, canvas);
    const a = this.geometryFor("a");
    const b = this.geometryFor("b");
    this.drawGeometry(ctx, a, {
      fill: "rgba(13, 148, 136, 0.18)",
      label: "A",
      stroke: "#2dd4bf"
    });
    this.drawGeometry(ctx, b, {
      fill: "rgba(180, 83, 9, 0.18)",
      label: "B",
      stroke: "#f59e0b"
    });
    this.drawOrigin(ctx, a, "#2dd4bf");
    this.drawOrigin(ctx, b, "#f59e0b");
    const overlap = intersectionRect(a.bounds, b.bounds);
    if (overlap) {
      ctx.save();
      ctx.fillStyle = "rgba(220, 38, 38, 0.24)";
      ctx.fillRect(overlap.x, overlap.y, overlap.width, overlap.height);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(overlap.x, overlap.y, overlap.width, overlap.height);
      ctx.restore();
    }
  }

  drawGrid(ctx, canvas) {
    ctx.save();
    ctx.strokeStyle = "rgba(226, 232, 240, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawOrigin(ctx, geometry, color) {
    if (!geometry.object) {
      return;
    }
    const origin = geometry.originWorld;
    const rotationRadians = (numberValue(geometry.instance?.rotation) * Math.PI) / 180;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + Math.cos(rotationRadians) * 34, origin.y + Math.sin(rotationRadians) * 34);
    ctx.stroke();
    ctx.restore();
  }

  drawGeometry(ctx, geometry, style) {
    ctx.save();
    geometry.polygons.forEach((polygon) => {
      if (!polygon.length) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = style.fill;
      ctx.fill();
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.strokeStyle = style.stroke;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(geometry.bounds.x, geometry.bounds.y, geometry.bounds.width, geometry.bounds.height);
    ctx.setLineDash([]);
    ctx.fillStyle = style.stroke;
    ctx.font = "700 16px ui-monospace, monospace";
    ctx.fillText(style.label, geometry.bounds.x + 6, geometry.bounds.y - 8);
    ctx.restore();
  }

  canvasPoint(event) {
    const rect = this.elements.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * this.elements.canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * this.elements.canvas.height
    };
  }

  hitObjectAt(point) {
    const candidates = ["b", "a"].map((key) => ({ key, geometry: this.geometryFor(key) }));
    return candidates.find(({ geometry }) => (
      point.x >= geometry.bounds.x
      && point.x <= geometry.bounds.x + geometry.bounds.width
      && point.y >= geometry.bounds.y
      && point.y <= geometry.bounds.y + geometry.bounds.height
    ))?.key || "";
  }

  handlePointerDown(event) {
    const point = this.canvasPoint(event);
    const key = this.hitObjectAt(point) || "a";
    this.dragState = {
      key,
      lastPoint: point
    };
    this.elements.canvas.classList.add("is-dragging");
    this.elements.canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  handlePointerMove(event) {
    if (!this.dragState) {
      return;
    }
    const point = this.canvasPoint(event);
    const delta = {
      x: point.x - this.dragState.lastPoint.x,
      y: point.y - this.dragState.lastPoint.y
    };
    const instance = this.instances[this.dragState.key];
    instance.x += delta.x;
    instance.y += delta.y;
    this.dragState.lastPoint = point;
    this.evaluateAndRender();
  }

  handlePointerUp() {
    if (!this.dragState) {
      return;
    }
    const key = this.dragState.key;
    this.dragState = null;
    this.elements.canvas.classList.remove("is-dragging");
    this.log(`INFO Dragged ${OBJECT_LABELS[key]} to ${Math.round(this.instances[key].x)}, ${Math.round(this.instances[key].y)}; rotation=${roundNumber(this.instances[key].rotation)}; collision=${this.lastResult?.collided === true}.`);
  }

  async copyReport() {
    const text = `${this.elements.summary.textContent}\n\n${this.elements.log.value}`;
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.log("FAIL Copy Report failed: Clipboard API is unavailable.");
      return;
    }
    try {
      await this.window.navigator.clipboard.writeText(text);
      this.log(`OK Copied collision report (${text.length} characters).`);
    } catch (error) {
      this.log(`FAIL Copy Report failed: ${error.message}`);
    }
  }

  log(message) {
    this.logLines.push(message);
    if (this.logLines.length > 80) {
      this.logLines.splice(0, this.logLines.length - 80);
    }
    this.syncLog();
  }

  syncLog() {
    this.elements.log.value = this.logLines.join("\n");
    this.elements.log.scrollTop = this.elements.log.scrollHeight;
  }
}
