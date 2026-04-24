import { resolveWorkspaceGameAssetPath } from "../../shared/workspaceGameAssetCatalog.js";

const ASTEROIDS_GAME_ID = "Asteroids";
const DEFAULT_FULLSCREEN_BEZEL_ASSET_ID = "image.asteroids.bezel";
const FULLSCREEN_BEZEL_DRAW_MODES = Object.freeze(["overlay", "underlay"]);

function toSafeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function resolveFullscreenBezelAssetPath(assetPath) {
  const explicitPath = toSafeString(assetPath, "");
  if (explicitPath) {
    return explicitPath;
  }
  return toSafeString(
    resolveWorkspaceGameAssetPath(ASTEROIDS_GAME_ID, DEFAULT_FULLSCREEN_BEZEL_ASSET_ID),
    ""
  );
}

export function normalizeFullscreenBezelDrawMode(drawMode) {
  const normalized = toSafeString(drawMode, "overlay").toLowerCase();
  return FULLSCREEN_BEZEL_DRAW_MODES.includes(normalized) ? normalized : "overlay";
}

export { DEFAULT_FULLSCREEN_BEZEL_ASSET_ID, FULLSCREEN_BEZEL_DRAW_MODES };

export default class FullscreenBezelOverlay {
  constructor(options = {}) {
    this.assetPath = resolveFullscreenBezelAssetPath(options.assetPath);
    this.drawMode = normalizeFullscreenBezelDrawMode(options.drawMode);
    this.enabled = options.enabled !== false;
    this.image = options.image || null;
    this.imageStatus = this.image ? "provided" : "unloaded";
    this.imageLoadStarted = false;
  }

  getContract() {
    return Object.freeze({
      assetPath: this.assetPath,
      drawMode: this.drawMode,
      fullscreenOnly: true,
      coordinateSpace: "screen-space"
    });
  }

  ensureImageLoaded() {
    if (!this.enabled || this.image || this.imageLoadStarted || typeof Image !== "function") {
      return;
    }

    this.imageLoadStarted = true;
    const image = new Image();
    image.onload = () => {
      this.image = image;
      this.imageStatus = "loaded";
    };
    image.onerror = () => {
      this.imageStatus = "error";
    };
    image.src = this.assetPath;
    this.imageStatus = "loading";
  }

  evaluateRenderGate(options = {}) {
    if (!this.enabled) {
      return { allowed: false, reason: "disabled" };
    }

    if (options.fullscreenActive !== true) {
      return { allowed: false, reason: "fullscreen-inactive" };
    }

    const stage = normalizeFullscreenBezelDrawMode(options.stage);
    if (stage !== this.drawMode) {
      return {
        allowed: false,
        reason: "draw-mode-mismatch",
        expectedStage: this.drawMode,
        receivedStage: stage
      };
    }

    return { allowed: true, stage };
  }

  render(renderer, options = {}) {
    const gate = this.evaluateRenderGate(options);
    if (!gate.allowed) {
      return {
        drawn: false,
        ...gate,
        assetPath: this.assetPath
      };
    }

    this.ensureImageLoaded();
    const image = options.image || this.image;
    if (!image || typeof renderer?.drawImageFrame !== "function") {
      return {
        drawn: false,
        reason: "image-unavailable",
        drawMode: this.drawMode,
        assetPath: this.assetPath
      };
    }

    const canvasSize = renderer?.getCanvasSize?.() || options.canvasSize || { width: 0, height: 0 };
    const width = Number(canvasSize.width) > 0 ? Number(canvasSize.width) : 0;
    const height = Number(canvasSize.height) > 0 ? Number(canvasSize.height) : 0;
    if (width <= 0 || height <= 0) {
      return {
        drawn: false,
        reason: "invalid-canvas-size",
        drawMode: this.drawMode,
        assetPath: this.assetPath
      };
    }

    const sourceWidth = Number(image.width) > 0 ? Number(image.width) : width;
    const sourceHeight = Number(image.height) > 0 ? Number(image.height) : height;
    renderer.drawImageFrame(image, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);
    return {
      drawn: true,
      drawMode: this.drawMode,
      fullscreenOnly: true,
      coordinateSpace: "screen-space",
      assetPath: this.assetPath,
      width,
      height
    };
  }
}
