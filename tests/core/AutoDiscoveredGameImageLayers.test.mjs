import assert from "node:assert/strict";
import Engine from "../../src/engine/core/Engine.js";
import AutoDiscoveredGameImageLayers, {
  resolveGameImageConventionPaths
} from "../../src/engine/runtime/AutoDiscoveredGameImageLayers.js";

function createRendererSpy() {
  const drawCalls = [];
  return {
    drawCalls,
    getCanvasSize() {
      return { width: 960, height: 720 };
    },
    drawImageFrame(image) {
      drawCalls.push(image?.src || "");
    }
  };
}

function createImageFactory(presentPaths) {
  return () => {
    const image = {
      width: 1920,
      height: 1080,
      onload: null,
      onerror: null
    };
    Object.defineProperty(image, "src", {
      configurable: true,
      enumerable: true,
      get() {
        return image._src || "";
      },
      set(value) {
        image._src = String(value || "");
        if (presentPaths.has(image._src)) {
          image.onload?.();
        } else {
          image.onerror?.();
        }
      }
    });
    return image;
  };
}

function createAnimationFrameStub() {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};

  return {
    restore() {
      if (originalRequestAnimationFrame === undefined) {
        delete globalThis.requestAnimationFrame;
      } else {
        globalThis.requestAnimationFrame = originalRequestAnimationFrame;
      }

      if (originalCancelAnimationFrame === undefined) {
        delete globalThis.cancelAnimationFrame;
      } else {
        globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
      }
    }
  };
}

function createCanvas(order) {
  const canvas = {
    width: 0,
    height: 0,
    getContext() {
      return context;
    }
  };

  const context = {
    canvas,
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    closePath() {},
    fillText() {},
    drawImage(image) {
      order.push(`image:${image?.src || ""}`);
    }
  };

  return canvas;
}

function testAutodiscoveryAndFullscreenGating() {
  const paths = resolveGameImageConventionPaths("", { location: { pathname: "/games/Asteroids/index.html" } });
  assert.equal(paths.gameId, "Asteroids");
  assert.equal(paths.backgroundPath, "games/Asteroids/assets/images/background.png");
  assert.equal(paths.bezelPath, "games/Asteroids/assets/images/bezel.png");
  assert.equal(paths.bezelPath.includes("/parallax/"), false);

  const presentPaths = new Set([paths.backgroundPath, paths.bezelPath]);
  const visuals = new AutoDiscoveredGameImageLayers({
    documentRef: { location: { pathname: "/games/Asteroids/index.html" } },
    imageFactory: createImageFactory(presentPaths)
  });
  const renderer = createRendererSpy();

  const background = visuals.renderBackground(renderer);
  assert.equal(background.drawn, true);
  assert.equal(renderer.drawCalls[0], "games/Asteroids/assets/images/background.png");

  const bezelBlocked = visuals.renderBezel(renderer, { fullscreenActive: false });
  assert.equal(bezelBlocked.drawn, false);
  assert.equal(bezelBlocked.reason, "fullscreen-inactive");

  const bezelDrawn = visuals.renderBezel(renderer, { fullscreenActive: true });
  assert.equal(bezelDrawn.drawn, true);
  assert.equal(renderer.drawCalls[1], "games/Asteroids/assets/images/bezel.png");
}

function testNoOpWhenAssetsMissing() {
  const visuals = new AutoDiscoveredGameImageLayers({
    documentRef: { location: { pathname: "/games/MissingGame/index.html" } },
    imageFactory: createImageFactory(new Set())
  });
  const renderer = createRendererSpy();

  const background = visuals.renderBackground(renderer);
  const bezel = visuals.renderBezel(renderer, { fullscreenActive: true });
  assert.equal(background.drawn, false);
  assert.equal(bezel.drawn, false);
  assert.equal(renderer.drawCalls.length, 0);
}

function testEngineDrawOrderWithoutPerGameCode() {
  const animationFrame = createAnimationFrameStub();
  const originalDocument = globalThis.document;
  const originalImage = globalThis.Image;
  const order = [];

  try {
    globalThis.document = {
      location: {
        pathname: "/games/Asteroids/index.html"
      }
    };

    const availablePaths = new Set([
      "games/Asteroids/assets/images/background.png",
      "games/Asteroids/assets/images/bezel.png"
    ]);
    globalThis.Image = function StubImage() {
      this.width = 1920;
      this.height = 1080;
      this.onload = null;
      this.onerror = null;
      Object.defineProperty(this, "src", {
        configurable: true,
        enumerable: true,
        get() {
          return this._src || "";
        },
        set(value) {
          this._src = String(value || "");
          if (availablePaths.has(this._src)) {
            this.onload?.();
          } else {
            this.onerror?.();
          }
        }
      });
    };

    let fullscreenActive = true;
    const engine = new Engine({
      canvas: createCanvas(order),
      input: {
        attach() {},
        detach() {},
        update() {}
      },
      audio: {
        attach() {},
        detach() {},
        update() {}
      },
      metrics: {
        recordFrame() {}
      },
      fullscreen: {
        attach() {},
        detach() {},
        getState() {
          return { available: true, active: fullscreenActive };
        }
      },
      logger: {
        debug() {},
        info() {},
        warn() {},
        error() {}
      }
    });
    engine.setScene({
      update() {},
      render() {
        order.push("scene");
      }
    });

    engine.tick(1000);
    assert.deepEqual(order, [
      "image:games/Asteroids/assets/images/background.png",
      "scene",
      "image:games/Asteroids/assets/images/bezel.png"
    ]);

    fullscreenActive = false;
    order.length = 0;
    engine.tick(1016);
    assert.deepEqual(order, [
      "image:games/Asteroids/assets/images/background.png",
      "scene"
    ]);
  } finally {
    animationFrame.restore();
    if (originalDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = originalDocument;
    }
    if (originalImage === undefined) {
      delete globalThis.Image;
    } else {
      globalThis.Image = originalImage;
    }
  }
}

export function run() {
  testAutodiscoveryAndFullscreenGating();
  testNoOpWhenAssetsMissing();
  testEngineDrawOrderWithoutPerGameCode();
}
