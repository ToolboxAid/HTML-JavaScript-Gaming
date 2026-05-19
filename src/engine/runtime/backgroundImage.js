import {
  resolveGameImageConventionPaths,
  resolveManifestChromeAssetPaths,
  resolveRuntimeAssetUrl
} from "./gameImageConvention.js";

function createLayerState(path) {
  return {
    path,
    status: path ? "idle" : "unavailable",
    image: null,
    loadStarted: false
  };
}

function drawFullscreenImage(renderer, image) {
  if (!image || typeof renderer?.drawImageFrame !== "function") {
    return false;
  }

  const canvasSize = renderer?.getCanvasSize?.() || { width: 0, height: 0 };
  const width = Number(canvasSize.width) > 0 ? Number(canvasSize.width) : 0;
  const height = Number(canvasSize.height) > 0 ? Number(canvasSize.height) : 0;
  if (width <= 0 || height <= 0) {
    return false;
  }

  const sourceWidth = Number(image.width) > 0 ? Number(image.width) : width;
  const sourceHeight = Number(image.height) > 0 ? Number(image.height) : height;
  renderer.drawImageFrame(image, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);
  return true;
}

export default class backgroundImage {
  constructor(options = {}) {
    this.documentRef = options.documentRef || globalThis.document || null;
    const resolved = resolveGameImageConventionPaths({
      gameId: options.gameId,
      documentRef: this.documentRef
    });
    this.gameId = resolved.gameId;
    this.manifestPath = resolved.manifestPath;
    this.layer = createLayerState(resolved.backgroundPath);
    this.manifestPayload = options.manifestPayload && typeof options.manifestPayload === "object" && !Array.isArray(options.manifestPayload)
      ? options.manifestPayload
      : null;
    this.imageFactory = typeof options.imageFactory === "function"
      ? options.imageFactory
      : (typeof Image === "function" ? () => new Image() : null);
    this.manifestResolved = false;
    this.manifestResolvePromise = null;
  }

  getState() {
    return {
      gameId: this.gameId,
      path: this.layer.path,
      status: this.layer.status,
      manifestPath: this.manifestPath,
      manifestResolved: this.manifestResolved
    };
  }

  ensureManifestResolved() {
    if (this.manifestResolved) {
      return;
    }
    if (this.manifestResolvePromise) {
      return;
    }

    this.manifestResolvePromise = resolveManifestChromeAssetPaths({
      gameId: this.gameId,
      manifestPath: this.manifestPath,
      documentRef: this.documentRef,
      manifestPayload: this.manifestPayload
    })
      .then((resolved) => {
        this.gameId = resolved.gameId || this.gameId;
        this.manifestPath = resolved.manifestPath || this.manifestPath;
        this.layer.path = typeof resolved.backgroundPath === "string" ? resolved.backgroundPath.trim() : "";
        this.layer.status = this.layer.path ? "idle" : "unavailable";
      })
      .catch(() => {
        this.layer.path = "";
        this.layer.status = "unavailable";
      })
      .finally(() => {
        this.manifestResolved = true;
        this.manifestResolvePromise = null;
      });
  }

  ensureLoaded() {
    this.ensureManifestResolved();

    if (!this.manifestResolved) {
      return;
    }
    if (!this.layer.path) {
      this.layer.status = "unavailable";
      return;
    }
    if (this.layer.status === "ready" || this.layer.status === "missing" || this.layer.status === "loading") {
      return;
    }
    if (this.layer.loadStarted || typeof this.imageFactory !== "function") {
      return;
    }

    const runtimePath = resolveRuntimeAssetUrl(this.layer.path, this.documentRef);
    if (!runtimePath) {
      this.layer.status = "missing";
      return;
    }

    const image = this.imageFactory(runtimePath);
    if (!image || typeof image !== "object") {
      this.layer.status = "missing";
      return;
    }

    this.layer.loadStarted = true;
    this.layer.image = image;
    this.layer.status = "loading";
    image.onload = () => {
      this.layer.status = "ready";
    };
    image.onerror = () => {
      this.layer.status = "missing";
    };

    try {
      image.src = runtimePath;
    } catch {
      this.layer.status = "missing";
    }
  }

  render(renderer, options = {}) {
    this.ensureLoaded();
    if (this.layer.status !== "ready" || !this.layer.image) {
      return {
        drawn: false,
        reason: this.layer.status,
        path: this.layer.path
      };
    }

    const drawn = drawFullscreenImage(renderer, this.layer.image);
    return {
      drawn,
      reason: drawn ? "drawn" : "renderer-unavailable",
      path: this.layer.path
    };
  }
}
