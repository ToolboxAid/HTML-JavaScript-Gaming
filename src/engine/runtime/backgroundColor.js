import {
  resolveGameImageConventionPaths,
  resolveManifestChromeAssetPaths
} from "./gameImageConvention.js";

const COLOR_HEX_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;

function createLayerState({ assetId = "", hex = "", name = "", path = "" } = {}) {
  return {
    assetId,
    hex,
    name,
    path,
    status: hex ? "ready" : "unavailable"
  };
}

function normalizeHex(value) {
  const color = typeof value === "string" ? value.trim() : "";
  return COLOR_HEX_PATTERN.test(color) ? color : "";
}

export default class backgroundColor {
  constructor(options = {}) {
    this.documentRef = options.documentRef || globalThis.document || null;
    const resolved = resolveGameImageConventionPaths({
      gameId: options.gameId,
      documentRef: this.documentRef,
      manifestPath: options.manifestPath
    });
    this.gameId = resolved.gameId;
    this.manifestPath = resolved.manifestPath;
    this.layer = createLayerState({
      assetId: resolved.backgroundColorAssetId,
      hex: normalizeHex(resolved.backgroundColorHex),
      name: resolved.backgroundColorName,
      path: resolved.backgroundColorPath
    });
    this.manifestResolved = false;
    this.manifestResolvePromise = null;
  }

  getState() {
    return {
      gameId: this.gameId,
      manifestPath: this.manifestPath,
      manifestResolved: this.manifestResolved,
      assetId: this.layer.assetId,
      hex: this.layer.hex,
      name: this.layer.name,
      path: this.layer.path,
      status: this.layer.status
    };
  }

  ensureManifestResolved() {
    if (this.manifestResolved || this.manifestResolvePromise) {
      return;
    }

    this.manifestResolvePromise = resolveManifestChromeAssetPaths({
      gameId: this.gameId,
      manifestPath: this.manifestPath,
      documentRef: this.documentRef
    })
      .then((resolved) => {
        this.gameId = resolved.gameId || this.gameId;
        this.manifestPath = resolved.manifestPath || this.manifestPath;
        const hex = normalizeHex(resolved.backgroundColorHex);
        this.layer = createLayerState({
          assetId: resolved.backgroundColorAssetId,
          hex,
          name: resolved.backgroundColorName,
          path: resolved.backgroundColorPath
        });
      })
      .catch(() => {
        this.layer = createLayerState();
      })
      .finally(() => {
        this.manifestResolved = true;
        this.manifestResolvePromise = null;
      });
  }

  render(renderer) {
    this.ensureManifestResolved();
    if (!this.layer.hex) {
      return {
        drawn: false,
        reason: this.layer.status,
        assetId: this.layer.assetId
      };
    }

    const canvasSize = renderer?.getCanvasSize?.() || { width: 0, height: 0 };
    const width = Number(canvasSize.width) > 0 ? Number(canvasSize.width) : 0;
    const height = Number(canvasSize.height) > 0 ? Number(canvasSize.height) : 0;
    if (width <= 0 || height <= 0 || typeof renderer?.drawRect !== "function") {
      return {
        drawn: false,
        reason: "renderer-unavailable",
        assetId: this.layer.assetId
      };
    }

    renderer.drawRect(0, 0, width, height, this.layer.hex);
    return {
      drawn: true,
      reason: "drawn",
      assetId: this.layer.assetId,
      hex: this.layer.hex
    };
  }
}
