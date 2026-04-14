import assert from "node:assert/strict";
import Engine from "../../src/engine/core/Engine.js";
import backgroundImage from "../../src/engine/runtime/backgroundImage.js";
import fullscreenBezel from "../../src/engine/runtime/fullscreenBezel.js";
import { resolveGameImageConventionPaths } from "../../src/engine/runtime/gameImageConvention.js";

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

function createRendererSpy(order) {
  return {
    clear() {
      order.push("clear");
    },
    getCanvasSize() {
      return { width: 960, height: 720 };
    },
    drawImageFrame(image) {
      order.push(`background:${image?.src || ""}`);
    }
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

function createDocumentStub() {
  const documentRef = {
    location: {
      pathname: "/games/Asteroids/index.html"
    },
    body: null,
    createElement(tagName) {
      return createElement(tagName, documentRef);
    }
  };
  documentRef.body = createElement("body", documentRef);
  return documentRef;
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

function createCanvasWithOrder(order, documentRef) {
  const canvas = createElement("canvas", documentRef);
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

function testBackgroundDrawAfterClearBeforeWorldRender() {
  const paths = resolveGameImageConventionPaths({ documentRef: { location: { pathname: "/games/Asteroids/index.html" } } });
  assert.equal(paths.backgroundPath, "games/Asteroids/assets/images/background.png");
  assert.equal(paths.bezelPath, "games/Asteroids/assets/images/bezel.png");

  const order = [];
  const layer = new backgroundImage({
    documentRef: { location: { pathname: "/games/Asteroids/index.html" } },
    imageFactory: createImageFactory(new Set([paths.backgroundPath]))
  });

  const result = layer.render(createRendererSpy(order));
  assert.equal(result.drawn, true);
  assert.deepEqual(order, ["background:games/Asteroids/assets/images/background.png"]);

  const missingLayer = new backgroundImage({
    documentRef: { location: { pathname: "/games/Missing/index.html" } },
    imageFactory: createImageFactory(new Set())
  });
  const missingOrder = [];
  const missingResult = missingLayer.render(createRendererSpy(missingOrder));
  assert.equal(missingResult.drawn, false);
  assert.deepEqual(missingOrder, []);
}

function testFullscreenBezelHtmlAttachmentAndFullscreenVisibility() {
  const documentRef = createDocumentStub();
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({
    canvas,
    documentRef
  });
  bezel.attach();
  assert.equal(bezel.getState().attached, true);
  assert.equal(bezel.getState().hostTagName, "DIV");
  assert.equal(bezel.element.attributes["data-runtime-overlay"], "fullscreenBezel");

  bezel.element.onerror?.();
  let syncResult = bezel.sync({ fullscreenActive: true });
  assert.equal(syncResult.visible, false);
  assert.equal(bezel.element.style.display, "none");

  const readyBezel = new fullscreenBezel({
    canvas,
    documentRef
  });
  readyBezel.attach();
  readyBezel.element.onload?.();
  syncResult = readyBezel.sync({ fullscreenActive: false });
  assert.equal(syncResult.visible, false);
  assert.equal(readyBezel.element.style.display, "none");
  syncResult = readyBezel.sync({ fullscreenActive: true });
  assert.equal(syncResult.visible, true);
  assert.equal(readyBezel.element.style.display, "block");
}

function testEngineSplitPathsBackgroundCanvasAndBezelHtml() {
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

    let fullscreenActive = false;
    const engine = new Engine({
      canvas,
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
    engine.start();

    engine.tick(1000);
    assert.deepEqual(order, [
      "clear",
      "background:games/Asteroids/assets/images/background.png",
      "scene"
    ]);
    assert.equal(engine.fullscreenBezelLayer.getState().visible, false);

    fullscreenActive = true;
    engine.fullscreenBezelLayer.element.onload?.();
    order.length = 0;
    engine.tick(1016);
    assert.deepEqual(order, [
      "clear",
      "background:games/Asteroids/assets/images/background.png",
      "scene"
    ]);
    assert.equal(engine.fullscreenBezelLayer.getState().visible, true);
    assert.equal(engine.fullscreenBezelLayer.getState().path, "games/Asteroids/assets/images/bezel.png");
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
  testBackgroundDrawAfterClearBeforeWorldRender();
  testFullscreenBezelHtmlAttachmentAndFullscreenVisibility();
  testEngineSplitPathsBackgroundCanvasAndBezelHtml();
}
