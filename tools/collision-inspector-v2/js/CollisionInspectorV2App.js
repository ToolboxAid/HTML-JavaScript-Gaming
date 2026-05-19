import {
  evaluateObjectVectorCollisionPair,
  normalizeObjectVectorCollisionMode,
  OBJECT_VECTOR_COLLISION_MODE_LABELS,
  recommendObjectVectorCollisionMode
} from "../../../src/engine/collision/index.js";
import {
  ASTEROIDS_MANIFEST_PATH,
  clone,
  numberValue,
  OBJECT_LABELS,
  roundNumber
} from "./constants.js";

export class CollisionInspectorV2App {
  constructor({
    controls,
    logger,
    manifestLoader,
    renderer,
    windowRef = window
  }) {
    this.controls = controls;
    this.logger = logger;
    this.manifestLoader = manifestLoader;
    this.renderer = renderer;
    this.window = windowRef;
    this.manifest = null;
    this.objects = [];
    this.instances = {
      a: { x: 360, y: 320, rotation: 0 },
      b: { x: 500, y: 320, rotation: 0 }
    };
    this.collisionMode = "vector";
    this.manualModeOverride = false;
    this.dragState = null;
    this.lastResult = null;
    this.zoom = 1;
  }

  async start() {
    this.controls.mount({
      onClearLog: () => this.logger.clear(),
      onLoadAsteroids: () => {
        void this.loadManifestFromPath(ASTEROIDS_MANIFEST_PATH, "Asteroids validation path");
      },
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
        this.window.location.href = this.workspaceReturnUrl();
      },
      onRotationChange: (key, rotation) => this.setRotation(key, rotation),
      onZoomChange: (zoom) => this.setZoom(zoom)
    });
    this.controls.setLaunchMode(this.isWorkspaceLaunch());
    this.controls.setZoom(this.zoom);
    this.logger.write("INFO Collision Inspector V2 ready.");
    await this.loadInitialManifest();
    this.evaluateAndRender();
  }

  isWorkspaceLaunch() {
    return new URLSearchParams(this.window.location.search || "").get("launch") === "workspace";
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
      this.logger.write(`FAIL ${result?.message || "Manifest load failed."}`);
      return;
    }
    this.loadManifest(result.manifest, result.sourceLabel);
  }

  loadManifest(manifest, sourceLabel) {
    const objects = Array.isArray(manifest?.tools?.["object-vector-studio-v2"]?.objects)
      ? manifest.tools["object-vector-studio-v2"].objects
      : [];
    if (!objects.length) {
      this.manifest = null;
      this.objects = [];
      this.controls.setObjectOptions([]);
      this.controls.setManifestSummary("Manifest has no Object Vector Studio V2 objects.");
      this.logger.write(`FAIL ${sourceLabel} has no Object Vector Studio V2 objects.`);
      this.evaluateAndRender();
      return;
    }
    this.manifest = manifest;
    this.objects = objects.map((object) => clone(object));
    this.controls.setObjectOptions(this.objects);
    this.resetSimulation({ silent: true });
    const gameName = manifest?.game?.name || manifest?.name || manifest?.gameId || "Loaded manifest";
    this.controls.setManifestSummary(`${gameName}: ${this.objects.length} vector objects loaded.`);
    this.logger.write(`OK Loaded manifest ${sourceLabel}: ${this.objects.length} vector objects.`);
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
    this.instances[key].rotation = numberValue(rotation);
    this.evaluateAndRender();
  }

  setZoom(zoom) {
    this.zoom = Math.max(0.5, Math.min(2, numberValue(zoom, 1)));
    this.renderer.setZoom(this.zoom);
    this.controls.setZoom(this.zoom);
    this.evaluateAndRender();
  }

  resetSimulation({ silent = false } = {}) {
    this.instances = {
      a: { x: 360, y: 320, rotation: 0 },
      b: { x: 500, y: 320, rotation: 0 }
    };
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
    this.lastResult = this.evaluateCollision();
    this.controls.syncResult(this.lastResult);
    this.renderer.render(this.lastResult);
  }

  handlePointerDown(event) {
    const point = this.renderer.canvasPoint(event);
    const key = this.renderer.hitObjectAt(point, this.lastResult) || "a";
    this.dragState = {
      key,
      lastPoint: point
    };
    this.renderer.setDragging(true);
    this.renderer.capturePointer(event.pointerId);
    event.preventDefault();
  }

  handlePointerMove(event) {
    if (!this.dragState) {
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
    const key = this.dragState.key;
    this.dragState = null;
    this.renderer.setDragging(false);
    this.logger.write(`INFO Dragged ${OBJECT_LABELS[key]} to ${Math.round(this.instances[key].x)}, ${Math.round(this.instances[key].y)}; rotation=${roundNumber(this.instances[key].rotation)}; collision=${this.lastResult?.collided === true}.`);
  }
}
