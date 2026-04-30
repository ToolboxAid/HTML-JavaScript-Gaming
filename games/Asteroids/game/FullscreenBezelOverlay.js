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
    this.imageStatus = "deprecated-engine-owned";
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
    return {
      drawn: false,
      reason: "deprecated-engine-owned",
      assetPath: this.assetPath,
      drawMode: this.drawMode
    };
  }
}
