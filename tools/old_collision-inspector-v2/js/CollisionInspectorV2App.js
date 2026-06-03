import { evaluateObjectVectorCollisionPair, normalizeObjectVectorCollisionMode, OBJECT_VECTOR_COLLISION_MODE_LABELS, recommendObjectVectorCollisionMode } from "../../../src/engine/collision/objectVector.js";
import { CANONICAL_WORLD_TO_SCREEN_SCALE } from '../../../src/engine/rendering/WorldScreenTransform.js';
import { resolveManifestScreenDimensions } from "../../../src/tools/common/GameManifestLoader.js";
import { asFiniteNumber } from "../../../src/shared/number/numbers.js";
import { deepClone } from "../../../src/shared/json/clone.js";
import {
  clampCollisionZoom,
  COLLISION_ZOOM_DEFAULT,
  COLLISION_ZOOM_STEP,
  collisionZoomToPercent,
  OBJECT_LABELS,
  roundNumber
} from "./constants.js";

export class CollisionInspectorV2App {
  constructor({
    controls,
    logger,
    manifestLoader,
    renderer,
    shell,
    windowRef = window
  }) {
    this.controls = controls;
    this.logger = logger;
    this.manifestLoader = manifestLoader;
    this.renderer = renderer;
    this.shell = shell;
    this.window = windowRef;
    this.manifest = null;
    this.objects = [];
    this.screen = null;
    this.instances = this.defaultInstances();
    this.collisionMode = "vector";
    this.manualModeOverride = false;
    this.dragState = null;
    this.lastResult = null;
    this.zoom = COLLISION_ZOOM_DEFAULT;
  }

  async start() {
    this.shell.mount();
    this.controls.mount({
      onClearLog: () => this.logger.clear(),
      onManifestFile: (file) => {
        void this.loadManifestFile(file);
      },
      onModeChange: (mode) => this.setManualMode(mode),
      onObjectPairChange: () => this.handleObjectPairChange(),
      onPointerDown: (event) => this.handlePointerDown(event),
      onPointerMove: (event) => this.handlePointerMove(event),
      onPointerUp: () => this.handlePointerUp(),
      onReset: () => this.resetSimulation(),
      onReturnToWorkspace: () => {
        this.shell.returnToWorkspace();
      },
      onRotationChange: (key, rotation) => this.setRotation(key, rotation),
      onCanvasWheel: (event) => this.handleCanvasWheel(event),
      onZoomChange: (zoom) => this.setZoom(zoom)
    });
    this.controls.setLaunchMode(this.isWorkspaceLaunch());
    this.controls.setZoom(this.zoom);
    this.logger.write("INFO Collision Inspector V2 ready.");
    this.logger.write(`INFO Shared world-to-screen scale is ${CANONICAL_WORLD_TO_SCREEN_SCALE}:1; Collision Inspector zoom is additional user zoom only.`);
    await this.loadInitialManifest();
    if (this.hasRenderableManifest()) {
      this.evaluateAndRender();
    }
  }

  isWorkspaceLaunch() {
    return this.shell.isWorkspaceLaunch();
  }

  defaultInstances() {
    if (!this.screen) {
      return {
        a: { x: 0, y: 0, rotation: 0, rotationUnit: "degrees" },
        b: { x: 0, y: 0, rotation: 0, rotationUnit: "degrees" }
      };
    }
    return {
      a: { x: this.screen.width * 0.375, y: this.screen.height * (4 / 9), rotation: 0, rotationUnit: "degrees" },
      b: { x: this.screen.width * (125 / 240), y: this.screen.height * (4 / 9), rotation: 0, rotationUnit: "degrees" }
    };
  }

  hasRenderableManifest() {
    return Boolean(this.manifest && this.screen && this.objects.length);
  }

  async loadInitialManifest() {
    const result = await this.manifestLoader.loadInitialManifest();
    this.applyManifestLoadResult(result);
  }

  async loadManifestFromPath(path, sourceLabel = path) {
    const result = await this.manifestLoader.loadFromPath(path, sourceLabel);
    this.applyManifestLoadResult(result);
  }

  async loadManifestFile(file) {
    const result = await this.manifestLoader.loadFromFile(file);
    this.controls.clearManifestInput();
    this.applyManifestLoadResult(result);
  }

  applyManifestLoadResult(result) {
    if (result?.skipped) {
      return;
    }
    if (!result?.ok) {
      this.failManifestLoad(result?.message || "Manifest load failed.");
      return;
    }
    this.loadManifest(result.manifest, result.sourceLabel);
  }

  failManifestLoad(message, sourceLabel = "Manifest") {
    this.manifest = null;
    this.objects = [];
    this.screen = null;
    this.instances = this.defaultInstances();
    this.controls.setObjectOptions([]);
    this.controls.setManifestSummary(message);
    this.controls.setFailureState(message);
    this.renderer.clear();
    this.logger.write(`FAIL ${sourceLabel}: ${message}`);
  }

  loadManifest(manifest, sourceLabel) {
    const screenResult = resolveManifestScreenDimensions(manifest);
    if (!screenResult.ok) {
      this.failManifestLoad(screenResult.message, sourceLabel);
      return;
    }
    const objects = Array.isArray(manifest?.tools?.["object-vector-studio-v2"]?.objects)
      ? manifest.tools["object-vector-studio-v2"].objects
      : [];
    if (!objects.length) {
      this.failManifestLoad("Manifest has no Object Vector Studio V2 objects.", sourceLabel);
      return;
    }
    this.manifest = manifest;
    this.objects = objects.map((object) => deepClone(object));
    this.screen = { width: screenResult.width, height: screenResult.height };
    this.controls.setViewportSize(this.screen.width, this.screen.height);
    this.renderer.setViewportSize(this.screen.width, this.screen.height);
    this.renderer.resetViewportPan();
    this.controls.setObjectOptions(this.objects);
    this.resetSimulation({ silent: true });
    const gameName = manifest?.game?.name || manifest?.name || manifest?.gameId || "Loaded manifest";
    this.controls.setManifestSummary(`${gameName}: ${this.objects.length} objects loaded; screen ${this.screen.width}x${this.screen.height}.`);
    this.logger.write(`OK Loaded manifest ${sourceLabel}: ${this.objects.length} objects; screen ${this.screen.width}x${this.screen.height}.`);
    this.autoSelectMode("manifest load");
    this.evaluateAndRender();
  }

  selectedObject(key) {
    const selectedId = this.controls.selectedObjectId(key);
    return this.objects.find((object) => object.id === selectedId) || null;
  }

  handleObjectPairChange() {
    this.manualModeOverride = false;
    this.autoSelectMode("selected object pair");
    this.evaluateAndRender();
  }

  setManualMode(mode) {
    this.collisionMode = normalizeObjectVectorCollisionMode(mode);
    this.manualModeOverride = true;
    const label = OBJECT_VECTOR_COLLISION_MODE_LABELS[this.collisionMode] || this.collisionMode;
    this.logger.write(`INFO Manual collision mode override: ${label}.`);
    this.evaluateAndRender();
  }

  autoSelectMode(reason) {
    const objectA = this.selectedObject("a");
    const objectB = this.selectedObject("b");
    this.collisionMode = recommendObjectVectorCollisionMode(objectA, objectB);
    this.controls.setMode(this.collisionMode);
    this.manualModeOverride = false;
    const label = OBJECT_VECTOR_COLLISION_MODE_LABELS[this.collisionMode] || this.collisionMode;
    this.logger.write(`INFO Auto-selected ${label} collision mode for ${reason}.`);
  }

  setRotation(key, rotation) {
    if (!this.instances[key]) {
      return;
    }
    this.instances[key].rotation = asFiniteNumber(rotation);
    this.instances[key].rotationUnit = "degrees";
    this.evaluateAndRender();
  }

  setZoom(zoom) {
    this.zoom = clampCollisionZoom(zoom);
    this.renderer.setZoom(this.zoom);
    this.controls.setZoom(this.zoom);
    this.evaluateAndRender();
  }

  handleCanvasWheel(event) {
    if (!this.hasRenderableManifest() || this.dragState) {
      return;
    }
    const deltaY = Number(event.deltaY) || 0;
    if (!deltaY) {
      return;
    }
    event.preventDefault();
    const direction = deltaY < 0 ? 1 : -1;
    const nextZoom = clampCollisionZoom(Number((this.zoom + direction * COLLISION_ZOOM_STEP).toFixed(3)));
    if (nextZoom === this.zoom) {
      return;
    }
    this.zoom = nextZoom;
    this.renderer.setZoomAtClientPoint(this.zoom, event);
    this.controls.setZoom(this.zoom);
    this.evaluateAndRender();
    this.logger.write(`INFO Canvas zoom set to ${collisionZoomToPercent(this.zoom)}%.`);
  }

  resetSimulation({ silent = false } = {}) {
    if (!this.screen || !this.objects.length) {
      this.logger.write("FAIL Load a manifest with root.screen.width, root.screen.height, and Object Vector Studio V2 objects before resetting.");
      return;
    }
    this.instances = this.defaultInstances();
    this.controls.setRotations(this.instances);
    this.autoSelectMode("reset");
    if (!silent) {
      this.logger.write("INFO Simulation reset.");
    }
    this.evaluateAndRender();
  }

  evaluateCollision() {
    const objectA = this.selectedObject("a");
    const objectB = this.selectedObject("b");
    const result = evaluateObjectVectorCollisionPair({
      instanceA: this.instances.a,
      instanceB: this.instances.b,
      mode: this.collisionMode,
      objectA,
      objectB
    });
    return {
      ...result,
      manualModeOverride: this.manualModeOverride,
      objectA,
      objectB,
      zoom: this.zoom
    };
  }

  evaluateAndRender() {
    if (!this.hasRenderableManifest()) {
      return;
    }
    this.lastResult = this.evaluateCollision();
    this.controls.syncResult(this.lastResult);
    this.renderer.render(this.lastResult);
  }

  handlePointerDown(event) {
    if (!this.hasRenderableManifest()) {
      return;
    }
    const point = this.renderer.canvasPoint(event);
    const key = this.renderer.hitObjectAt(point, this.lastResult);
    if (!key) {
      this.dragState = {
        lastClient: { x: Number(event.clientX) || 0, y: Number(event.clientY) || 0 },
        mode: "pan",
        moved: false
      };
      this.renderer.setDragging(true);
      this.renderer.capturePointer(event.pointerId);
      event.preventDefault();
      return;
    }
    this.dragState = {
      key,
      lastPoint: point,
      mode: "object"
    };
    this.renderer.setDragging(true);
    this.renderer.capturePointer(event.pointerId);
    event.preventDefault();
  }

  handlePointerMove(event) {
    if (!this.dragState) {
      return;
    }
    if (this.dragState.mode === "pan") {
      const clientX = Number(event.clientX) || 0;
      const clientY = Number(event.clientY) || 0;
      const deltaX = clientX - this.dragState.lastClient.x;
      const deltaY = clientY - this.dragState.lastClient.y;
      this.dragState.lastClient = { x: clientX, y: clientY };
      if (deltaX || deltaY) {
        this.dragState.moved = true;
        this.renderer.panViewportByClientDelta(deltaX, deltaY);
        this.evaluateAndRender();
      }
      event.preventDefault();
      return;
    }
    const point = this.renderer.canvasPoint(event);
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
    if (this.dragState.mode === "pan") {
      const pan = { ...this.renderer.viewportPan };
      const moved = this.dragState.moved;
      this.dragState = null;
      this.renderer.setDragging(false);
      if (moved) {
        this.logger.write(`INFO Panned viewport to ${roundNumber(pan.x)}, ${roundNumber(pan.y)}.`);
      }
      return;
    }
    const key = this.dragState.key;
    this.dragState = null;
    this.renderer.setDragging(false);
    this.logger.write(`INFO Dragged ${OBJECT_LABELS[key]} to ${Math.round(this.instances[key].x)}, ${Math.round(this.instances[key].y)}; rotation=${roundNumber(this.instances[key].rotation)}; collision=${this.lastResult?.collided === true}.`);
  }
}
