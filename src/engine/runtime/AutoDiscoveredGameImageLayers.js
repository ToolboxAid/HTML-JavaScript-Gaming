function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizePath(value) {
  return safeText(value, "").replace(/\\/g, "/");
}

function toImagePath(gameId, fileName) {
  const id = safeText(gameId, "");
  if (!id) {
    return "";
  }
  return `games/${id}/assets/images/${fileName}`;
}

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

export function discoverGameIdFromDocument(documentRef) {
  const pathname = normalizePath(documentRef?.location?.pathname || "");
  if (!pathname) {
    return "";
  }
  const match = pathname.match(/\/games\/([^/]+)\//i);
  return match ? safeText(match[1], "") : "";
}

export function resolveGameImageConventionPaths(gameIdInput, documentRef) {
  const gameId = safeText(gameIdInput, "") || discoverGameIdFromDocument(documentRef);
  return {
    gameId,
    backgroundPath: toImagePath(gameId, "background.png"),
    bezelPath: toImagePath(gameId, "bezel.png")
  };
}

export default class AutoDiscoveredGameImageLayers {
  constructor(options = {}) {
    const resolved = resolveGameImageConventionPaths(options.gameId, options.documentRef || globalThis.document || null);
    this.gameId = resolved.gameId;
    this.background = createLayerState(resolved.backgroundPath);
    this.bezel = createLayerState(resolved.bezelPath);
    this.imageFactory = typeof options.imageFactory === "function"
      ? options.imageFactory
      : (typeof Image === "function" ? () => new Image() : null);
  }

  getState() {
    return {
      gameId: this.gameId,
      background: {
        path: this.background.path,
        status: this.background.status
      },
      bezel: {
        path: this.bezel.path,
        status: this.bezel.status
      }
    };
  }

  ensureLoaded(layer) {
    if (!layer.path) {
      layer.status = "unavailable";
      return;
    }
    if (layer.status === "ready" || layer.status === "missing" || layer.status === "loading") {
      return;
    }
    if (layer.loadStarted) {
      return;
    }
    if (typeof this.imageFactory !== "function") {
      layer.status = "unsupported";
      return;
    }

    const image = this.imageFactory(layer.path);
    if (!image || typeof image !== "object") {
      layer.status = "unsupported";
      return;
    }

    layer.loadStarted = true;
    layer.image = image;
    layer.status = "loading";
    image.onload = () => {
      layer.status = "ready";
    };
    image.onerror = () => {
      layer.status = "missing";
    };

    try {
      image.src = layer.path;
    } catch {
      layer.status = "missing";
    }
  }

  renderBackground(renderer) {
    this.ensureLoaded(this.background);
    if (this.background.status !== "ready" || !this.background.image) {
      return {
        drawn: false,
        reason: this.background.status,
        path: this.background.path
      };
    }

    const drawn = drawFullscreenImage(renderer, this.background.image);
    return {
      drawn,
      reason: drawn ? "drawn" : "renderer-unavailable",
      path: this.background.path
    };
  }

  renderBezel(renderer, options = {}) {
    if (options.fullscreenActive !== true) {
      return {
        drawn: false,
        reason: "fullscreen-inactive",
        path: this.bezel.path
      };
    }

    this.ensureLoaded(this.bezel);
    if (this.bezel.status !== "ready" || !this.bezel.image) {
      return {
        drawn: false,
        reason: this.bezel.status,
        path: this.bezel.path
      };
    }

    const drawn = drawFullscreenImage(renderer, this.bezel.image);
    return {
      drawn,
      reason: drawn ? "drawn" : "renderer-unavailable",
      path: this.bezel.path
    };
  }
}
