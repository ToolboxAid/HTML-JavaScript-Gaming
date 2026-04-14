import { resolveGameImageConventionPaths } from "./gameImageConvention.js";

const NON_GAMEPLAY_MODE_TOKENS = Object.freeze([
  "menu",
  "title",
  "attract",
  "select-player",
  "player-select",
  "intro",
  "splash",
  "game-over",
  "credits",
  "pause"
]);

const GAMEPLAY_MODE_TOKENS = Object.freeze([
  "playing",
  "gameplay",
  "in-game",
  "ingame",
  "combat",
  "runtime",
  "active"
]);

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

function toModeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function sceneModeCandidates(scene) {
  if (!scene || typeof scene !== "object") {
    return [];
  }

  return [
    scene.mode,
    scene.state,
    scene.status,
    scene.screen,
    scene.view,
    scene.phase,
    scene.session?.mode,
    scene.session?.state,
    scene.session?.status
  ]
    .map(toModeText)
    .filter(Boolean);
}

export default class backgroundImage {
  constructor(options = {}) {
    const resolved = resolveGameImageConventionPaths({
      gameId: options.gameId,
      documentRef: options.documentRef || globalThis.document || null
    });
    this.gameId = resolved.gameId;
    this.layer = createLayerState(resolved.backgroundPath);
    this.imageFactory = typeof options.imageFactory === "function"
      ? options.imageFactory
      : (typeof Image === "function" ? () => new Image() : null);
  }

  getState() {
    return {
      gameId: this.gameId,
      path: this.layer.path,
      status: this.layer.status
    };
  }

  isGameplayState(scene) {
    if (!scene || typeof scene !== "object") {
      return true;
    }

    if (typeof scene.isGameplayStateActive === "function") {
      const explicit = scene.isGameplayStateActive();
      if (typeof explicit === "boolean") {
        return explicit;
      }
    }
    if (typeof scene.isGameplayStateActive === "boolean") {
      return scene.isGameplayStateActive;
    }

    const modes = sceneModeCandidates(scene);
    for (const mode of modes) {
      if (NON_GAMEPLAY_MODE_TOKENS.some((token) => mode.includes(token))) {
        return false;
      }
      if (GAMEPLAY_MODE_TOKENS.some((token) => mode.includes(token))) {
        return true;
      }
    }

    if (scene.attractController?.active === true) {
      return false;
    }

    return true;
  }

  ensureLoaded() {
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

    const image = this.imageFactory(this.layer.path);
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
      image.src = this.layer.path;
    } catch {
      this.layer.status = "missing";
    }
  }

  render(renderer, options = {}) {
    if (!this.isGameplayState(options.scene)) {
      return {
        drawn: false,
        reason: "non-gameplay-state",
        path: this.layer.path
      };
    }

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
