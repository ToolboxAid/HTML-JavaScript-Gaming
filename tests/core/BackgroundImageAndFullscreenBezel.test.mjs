import assert from "node:assert/strict";
import Engine from "../../src/engine/core/Engine.js";
import backgroundImage from "../../src/engine/runtime/backgroundImage.js";
import fullscreenBezel, {
  chooseBestOpeningFit,
  findTransparencyWindowFromEdges,
  fitAspectRatio
} from "../../src/engine/runtime/fullscreenBezel.js";
import { resolveGameImageConventionPaths, resolveRuntimeAssetUrl } from "../../src/engine/runtime/gameImageConvention.js";

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

function createElement(tagName, ownerDocument) {
  return {
    tagName: String(tagName || "").toUpperCase(),
    style: {},
    attributes: {},
    ownerDocument,
    children: [],
    parentElement: null,
    onload: null,
    onerror: null,
    width: 1920,
    height: 1080,
    naturalWidth: 1920,
    naturalHeight: 1080,
    clientWidth: 1600,
    clientHeight: 900,
    offsetWidth: 1600,
    offsetHeight: 900,
    requestFullscreen() {},
    getBoundingClientRect() {
      return { width: this.clientWidth, height: this.clientHeight, left: 0, top: 0 };
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
      return child;
    },
    remove() {
      if (!this.parentElement) {
        return;
      }
      const index = this.parentElement.children.indexOf(this);
      if (index >= 0) {
        this.parentElement.children.splice(index, 1);
      }
      this.parentElement = null;
    }
  };
}

function assertNear(actual, expected, epsilon = 0.51) {
  const delta = Math.abs(Number(actual) - Number(expected));
  assert.equal(delta <= epsilon, true);
}

function createDocumentStub(pathname = "/games/Asteroids/index.html") {
  const documentRef = {
    location: { pathname },
    body: null,
    createElement(tagName) {
      return createElement(tagName, documentRef);
    }
  };
  documentRef.body = createElement("body", documentRef);
  return documentRef;
}

function createRendererSpy(order) {
  return {
    getCanvasSize() {
      return { width: 960, height: 720 };
    },
    drawImageFrame(image) {
      order.push(`background:${image?.src || ""}`);
    }
  };
}

function createAnimationFrameStub() {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  let nextId = 1;

  globalThis.requestAnimationFrame = () => {
    const id = nextId;
    nextId += 1;
    return id;
  };
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

function createCanvasWithOrder(order, documentRef) {
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  canvas.style.margin = "0 auto";
  canvas.getContext = () => ({
    canvas,
    clearRect() {
      order.push("clear");
    },
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
      order.push(`background:${image?.src || ""}`);
    }
  });
  return canvas;
}

function testBackgroundGameplayGatingAndOrder() {
  const documentRef = { location: { pathname: "/games/Asteroids/index.html" } };
  const paths = resolveGameImageConventionPaths({ documentRef: { location: { pathname: "/games/Asteroids/index.html" } } });
  assert.equal(paths.backgroundPath, "games/Asteroids/assets/images/background.png");
  assert.equal(paths.bezelPath, "games/Asteroids/assets/images/bezel.png");
  const runtimeBackgroundPath = resolveRuntimeAssetUrl(paths.backgroundPath, documentRef);

  const layer = new backgroundImage({
    documentRef,
    imageFactory: createImageFactory(new Set([runtimeBackgroundPath]))
  });
  const order = [];
  const renderer = createRendererSpy(order);

  const menuResult = layer.render(renderer, { scene: { session: { mode: "menu" } } });
  assert.equal(menuResult.drawn, false);
  assert.equal(menuResult.reason, "non-gameplay-state");
  assert.deepEqual(order, []);

  const attractResult = layer.render(renderer, { scene: { mode: "attract" } });
  assert.equal(attractResult.drawn, false);
  assert.equal(attractResult.reason, "non-gameplay-state");
  assert.deepEqual(order, []);

  const gameplayResult = layer.render(renderer, { scene: { session: { mode: "playing" } } });
  assert.equal(gameplayResult.drawn, true);
  assert.equal(gameplayResult.path, "games/Asteroids/assets/images/background.png");
  assert.deepEqual(order, ["background:/games/Asteroids/assets/images/background.png"]);
}

function testNoOpWhenBackgroundMissing() {
  const layer = new backgroundImage({
    documentRef: { location: { pathname: "/games/MissingGame/index.html" } },
    imageFactory: createImageFactory(new Set())
  });
  const order = [];
  const result = layer.render(createRendererSpy(order), { scene: { session: { mode: "playing" } } });
  assert.equal(result.drawn, false);
  assert.equal(order.length, 0);
}

function testFullscreenBezelVisibilityAndHtmlAttachment() {
  const documentRef = createDocumentStub();
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({ canvas, documentRef });
  bezel.attach();
  assert.equal(bezel.getState().attached, true);
  assert.equal(bezel.element.parentElement, host);
  assert.equal(bezel.element.attributes["data-runtime-overlay"], "fullscreenBezel");
  assert.equal(bezel.element.src, "/games/Asteroids/assets/images/bezel.png");
  assert.equal(bezel.element.src.includes("/games/Asteroids/games/Asteroids/"), false);

  bezel.element.onload?.();
  let result = bezel.sync({ fullscreenActive: false, fullscreenElement: host });
  assert.equal(result.visible, false);
  assert.equal(bezel.element.style.display, "none");
  assert.equal(bezel.element.style.visibility, "hidden");
  assert.equal(bezel.element.style.opacity, "0");

  result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, true);
  assert.equal(result.canvasLayoutMode, "fallback");
  assert.equal(bezel.element.style.display, "block");
  assert.equal(bezel.element.style.visibility, "visible");
  assert.equal(bezel.element.style.opacity, "1");
  assert.equal(host.style.position, "relative");
  assert.equal(host.style.overflow, "hidden");
  assert.equal(host.style.isolation, "isolate");
  assert.equal(canvas.style.position, "relative");
  assert.equal(canvas.style.zIndex, "1");
  assert.equal(Number(bezel.element.style.zIndex) > Number(canvas.style.zIndex), true);
}

function testNoOpWhenBezelMissing() {
  const documentRef = createDocumentStub("/games/MissingGame/index.html");
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({ canvas, documentRef });
  bezel.attach();
  bezel.element.onerror?.();
  const result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, false);
  assert.equal(bezel.element.style.display, "none");
}

function testTransparentWindowDetectionAndAspectFit() {
  const width = 6;
  const height = 5;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 255;
    }
  }

  const transparentPoints = [
    [1, 2],
    [2, 3],
    [3, 1],
    [4, 2],
  ];
  for (const [x, y] of transparentPoints) {
    const index = (y * width + x) * 4;
    data[index + 3] = 0;
  }

  const rect = findTransparencyWindowFromEdges({ data }, width, height);
  assert.deepEqual(rect, { x: 1, y: 1, width: 4, height: 3 });

  const fit = fitAspectRatio(960, 720, 1000, 500);
  assertNear(fit.width, 666.67, 0.6);
  assertNear(fit.height, 500, 0.01);

  const bestFit = chooseBestOpeningFit(960, 720, 1000, 500);
  assertNear(bestFit.width, 666.67, 0.6);
  assertNear(bestFit.height, 500, 0.01);
  assert.equal(bestFit.width <= 1000.01, true);
  assert.equal(bestFit.height <= 500.01, true);
}

function testFullscreenBezelTransparentWindowCanvasFit() {
  const documentRef = createDocumentStub();
  const host = createElement("div", documentRef);
  host.clientWidth = 1600;
  host.clientHeight = 900;
  host.offsetWidth = 1600;
  host.offsetHeight = 900;
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({
    canvas,
    documentRef,
    alphaInspector() {
      return { x: 460, y: 220, width: 1000, height: 500 };
    }
  });
  bezel.attach();
  bezel.element.naturalWidth = 1920;
  bezel.element.naturalHeight = 1080;
  bezel.element.onload?.();

  const result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, true);
  assert.equal(result.canvasLayoutMode, "transparent-window-fit");
  assert.equal(canvas.style.position, "absolute");
  assertNear(parseFloat(canvas.style.width), 555.56, 0.6);
  assertNear(parseFloat(canvas.style.height), 416.67, 0.6);
  assertNear(parseFloat(canvas.style.left), 522.22, 0.6);
  assertNear(parseFloat(canvas.style.top), 183.33, 0.6);
  assert.equal(canvas.width, 960);
  assert.equal(canvas.height, 720);
}

function testEngineRuntimeIntegration() {
  const animationFrame = createAnimationFrameStub();
  const originalDocument = globalThis.document;
  const originalImage = globalThis.Image;
  const order = [];

  try {
    const documentRef = createDocumentStub();
    const host = createElement("div", documentRef);
    const canvas = createCanvasWithOrder(order, documentRef);
    host.appendChild(canvas);
    documentRef.body.appendChild(host);
    globalThis.document = documentRef;

    const availablePaths = new Set([
      "/games/Asteroids/assets/images/background.png",
      "/games/Asteroids/assets/images/bezel.png"
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

    let fullscreenActive = false;
    let attachedFullscreenTarget = null;
    const scene = {
      session: { mode: "menu" },
      update() {},
      render() {
        order.push("scene");
      }
    };

    const engine = new Engine({
      canvas,
      width: 960,
      height: 720,
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
        attach(target) {
          attachedFullscreenTarget = target;
        },
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
    engine.setScene(scene);
    engine.start();
    assert.equal(attachedFullscreenTarget, host);
    assert.equal(engine.canvas.width, 960);
    assert.equal(engine.canvas.height, 720);
    assert.equal(engine.canvas.style.margin, "0 auto");
    assert.equal(engine.canvas.style.width, "960px");
    assert.equal(engine.canvas.style.height, "720px");
    assert.equal(engine.fullscreenBezelLayer.element.src, "/games/Asteroids/assets/images/bezel.png");
    assert.equal(engine.fullscreenBezelLayer.element.src.includes("/games/Asteroids/games/Asteroids/"), false);

    engine.tick(1000);
    assert.deepEqual(order, ["clear", "scene"]);
    assert.equal(engine.fullscreenBezelLayer.getState().visible, false);

    scene.session.mode = "playing";
    order.length = 0;
    engine.tick(1016);
    assert.deepEqual(order, [
      "clear",
      "background:/games/Asteroids/assets/images/background.png",
      "scene"
    ]);

    fullscreenActive = true;
    engine.fullscreenBezelLayer.element.onload?.();
    order.length = 0;
    engine.tick(1032);
    assert.deepEqual(order, [
      "clear",
      "background:/games/Asteroids/assets/images/background.png",
      "scene"
    ]);
    assert.equal(engine.fullscreenBezelLayer.getState().visible, true);
    assert.equal(order.some((entry) => entry.includes("bezel")), false);
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
  testBackgroundGameplayGatingAndOrder();
  testNoOpWhenBackgroundMissing();
  testFullscreenBezelVisibilityAndHtmlAttachment();
  testNoOpWhenBezelMissing();
  testTransparentWindowDetectionAndAspectFit();
  testFullscreenBezelTransparentWindowCanvasFit();
  testEngineRuntimeIntegration();
}
