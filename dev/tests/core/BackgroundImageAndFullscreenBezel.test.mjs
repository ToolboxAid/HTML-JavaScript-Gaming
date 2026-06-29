import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import Engine from "../../../www/src/engine/core/Engine.js";
import backgroundImage from "../../../www/src/engine/runtime/backgroundImage.js";
import fullscreenBezel, {
  chooseBestOpeningFit,
  ensureBezelStretchConfigFile,
  resolveBezelStretchConfigPath,
  findTransparencyWindowFromEdges,
  fitAspectRatio,
  resolvePreferredFullscreenTarget
} from "../../../www/src/engine/runtime/fullscreenBezel.js";
import {
  resolveBezelStretchOverridePath,
  resolveGameImageConventionPaths,
  resolveManifestChromeAssetPaths,
  resolveRuntimeAssetUrl
} from "../../../www/src/engine/runtime/gameImageConvention.js";

const ASTEROIDS_BACKGROUND_RUNTIME_PATH = "/archive/v1-v2/games/Asteroids/assets/images/deluxe.png";
const ASTEROIDS_BEZEL_RUNTIME_PATH = "/archive/v1-v2/games/Asteroids/assets/images/bezel.png";

function createAssetManagerManifest({ includeBackground = true, includeBezel = true } = {}) {
  const assets = {
    "assets.color.background.game": {
      path: "palette://workspace/space-black",
      type: "color",
      kind: "hex",
      role: "background",
      color: {
        hex: "#020617",
        name: "Space Black"
      }
    },
  };
  if (includeBezel) {
    assets["assets.image.bezel.bezel"] = {
      path: "assets/images/bezel.png",
      type: "image",
      kind: "png",
      role: "bezel",
      stretchOverride: {
        uniformEdgeStretchPx: 10
      }
    };
  }
  if (includeBackground) {
    assets["assets.image.background.deluxe"] = {
      path: "assets/images/deluxe.png",
      type: "image",
      kind: "png",
      role: "background"
    };
  }
  return {
    tools: {
      "asset-manager-v2": {
        assets
      }
    }
  };
}

async function attachResolvedBezel(bezel, options = {}) {
  bezel.attach();
  if (bezel.manifestResolvePromise) {
    await bezel.manifestResolvePromise;
  }
  bezel.sync(options);
  return bezel.element;
}

function createImageFactory(presentPaths, onCreate = null) {
  return (requestedPath) => {
    onCreate?.(String(requestedPath || ""));
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
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name)
        ? this.attributes[name]
        : null;
    },
    appendChild(child) {
      if (child?.parentElement && child.parentElement !== this) {
        const fromParent = child.parentElement;
        const index = fromParent.children.indexOf(child);
        if (index >= 0) {
          fromParent.children.splice(index, 1);
        }
      }
      child.parentElement = this;
      this.children.push(child);
      return child;
    },
    insertBefore(child, referenceChild) {
      if (!referenceChild || !this.children.includes(referenceChild)) {
        return this.appendChild(child);
      }
      if (child?.parentElement && child.parentElement !== this) {
        const fromParent = child.parentElement;
        const index = fromParent.children.indexOf(child);
        if (index >= 0) {
          fromParent.children.splice(index, 1);
        }
      }
      const targetIndex = this.children.indexOf(referenceChild);
      child.parentElement = this;
      this.children.splice(targetIndex, 0, child);
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

function createDocumentStub(pathname = "/archive/v1-v2/games/Asteroids/index.html") {
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

async function testBackgroundManifestRenderOrder() {
  const documentRef = { location: { pathname: "/archive/v1-v2/games/Asteroids/index.html" } };
  const manifestPayload = createAssetManagerManifest();
  const paths = resolveGameImageConventionPaths({ documentRef });
  assert.equal(paths.backgroundPath, "");
  assert.equal(paths.bezelPath, "");
  const manifestPaths = await resolveManifestChromeAssetPaths({ documentRef, manifestPayload });
  assert.equal(manifestPaths.backgroundPath, ASTEROIDS_BACKGROUND_RUNTIME_PATH);
  assert.equal(manifestPaths.bezelPath, ASTEROIDS_BEZEL_RUNTIME_PATH);
  const runtimeBackgroundPath = resolveRuntimeAssetUrl(manifestPaths.backgroundPath, documentRef);

  const layer = new backgroundImage({
    documentRef,
    manifestPayload,
    imageFactory: createImageFactory(new Set([runtimeBackgroundPath]))
  });
  const order = [];
  const renderer = createRendererSpy(order);

  const menuResult = layer.render(renderer, { scene: { session: { mode: "menu" } } });
  if (layer.manifestResolvePromise) {
    await layer.manifestResolvePromise;
  }
  assert.equal(menuResult.drawn, false);
  assert.equal(menuResult.reason, "unavailable");
  assert.deepEqual(order, []);

  const resolvedMenuResult = layer.render(renderer, { scene: { session: { mode: "menu" } } });
  assert.equal(resolvedMenuResult.drawn, true);
  assert.equal(resolvedMenuResult.path, ASTEROIDS_BACKGROUND_RUNTIME_PATH);
  assert.deepEqual(order, [`background:${ASTEROIDS_BACKGROUND_RUNTIME_PATH}`]);

  order.length = 0;
  const attractResult = layer.render(renderer, { scene: { mode: "attract" } });
  assert.equal(attractResult.drawn, true);
  assert.equal(attractResult.path, ASTEROIDS_BACKGROUND_RUNTIME_PATH);
  assert.deepEqual(order, [`background:${ASTEROIDS_BACKGROUND_RUNTIME_PATH}`]);

  order.length = 0;
  const gameplayResult = layer.render(renderer, { scene: { session: { mode: "playing" } } });
  assert.equal(gameplayResult.drawn, true);
  assert.equal(gameplayResult.path, ASTEROIDS_BACKGROUND_RUNTIME_PATH);
  assert.deepEqual(order, [`background:${ASTEROIDS_BACKGROUND_RUNTIME_PATH}`]);

  order.length = 0;
  const backToMenuResult = layer.render(renderer, { scene: { session: { mode: "menu" } } });
  assert.equal(backToMenuResult.drawn, true);
  assert.equal(backToMenuResult.path, ASTEROIDS_BACKGROUND_RUNTIME_PATH);
  assert.deepEqual(order, [`background:${ASTEROIDS_BACKGROUND_RUNTIME_PATH}`]);
}

async function testGameImageConventionsAreGameAgnostic() {
  const asteroidsPaths = resolveGameImageConventionPaths({
    documentRef: { location: { pathname: "/archive/v1-v2/games/Asteroids/index.html" } }
  });
  assert.equal(asteroidsPaths.backgroundPath, "");
  assert.equal(asteroidsPaths.bezelPath, "");
  assert.equal(
    resolveBezelStretchOverridePath({ documentRef: { location: { pathname: "/archive/v1-v2/games/Asteroids/index.html" } } }),
    "/archive/v1-v2/games/Asteroids/game.manifest.json"
  );
  const asteroidsManifestPaths = await resolveManifestChromeAssetPaths({
    documentRef: { location: { pathname: "/archive/v1-v2/games/Asteroids/index.html" } },
    manifestPayload: createAssetManagerManifest()
  });
  assert.equal(asteroidsManifestPaths.backgroundPath, ASTEROIDS_BACKGROUND_RUNTIME_PATH);

  const templatePaths = resolveGameImageConventionPaths({
    documentRef: { location: { pathname: "/archive/v1-v2/games/_template/index.html" } }
  });
  assert.equal(templatePaths.backgroundPath, "");
  assert.equal(templatePaths.bezelPath, "");
  assert.equal(
    resolveBezelStretchOverridePath({ documentRef: { location: { pathname: "/archive/v1-v2/games/_template/index.html" } } }),
    "/archive/v1-v2/games/_template/game.manifest.json"
  );
}

function testResolvePreferredFullscreenTargetKeepsCanvasOnlyParent() {
  const documentRef = createDocumentStub("/archive/v1-v2/games/Gravity/index.html");
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const target = resolvePreferredFullscreenTarget({ canvas, documentRef });
  assert.equal(target, host);
  assert.equal(canvas.parentElement, host);
  assert.equal(host.children.length, 1);
}

function testResolvePreferredFullscreenTargetCreatesCanvasOnlyHost() {
  const documentRef = createDocumentStub("/archive/v1-v2/games/Gravity/index.html");
  const main = createElement("main", documentRef);
  const heading = createElement("h1", documentRef);
  const canvas = createElement("canvas", documentRef);
  const section = createElement("section", documentRef);
  main.appendChild(heading);
  main.appendChild(canvas);
  main.appendChild(section);
  documentRef.body.appendChild(main);

  const target = resolvePreferredFullscreenTarget({ canvas, documentRef });
  assert.notEqual(target, main);
  assert.equal(target.getAttribute("data-runtime-fullscreen-host"), "canvas");
  assert.equal(canvas.parentElement, target);
  assert.equal(target.children.includes(canvas), true);
  assert.equal(main.children.includes(heading), true);
  assert.equal(main.children.includes(section), true);
}

async function testNoOpWhenBackgroundMissing() {
  let imageCreateCount = 0;
  const layer = new backgroundImage({
    documentRef: { location: { pathname: "/archive/v1-v2/games/MissingGame/index.html" } },
    manifestPayload: createAssetManagerManifest({ includeBackground: false }),
    imageFactory: createImageFactory(new Set(), () => {
      imageCreateCount += 1;
    })
  });
  const order = [];
  const result = layer.render(createRendererSpy(order), { scene: { session: { mode: "playing" } } });
  if (layer.manifestResolvePromise) {
    await layer.manifestResolvePromise;
  }
  const resolvedResult = layer.render(createRendererSpy(order), { scene: { session: { mode: "playing" } } });
  assert.equal(result.drawn, false);
  assert.equal(resolvedResult.drawn, false);
  assert.equal(resolvedResult.path, "");
  assert.equal(imageCreateCount, 0);
  assert.equal(order.length, 0);
}

async function testSampleGameBackgroundAndBezelNoOpWhenMissing() {
  const documentRef = createDocumentStub("/archive/v1-v2/games/SpaceInvaders/index.html");
  const paths = resolveGameImageConventionPaths({ documentRef });
  assert.equal(paths.backgroundPath, "");
  assert.equal(paths.bezelPath, "");

  const backgroundLayer = new backgroundImage({
    documentRef,
    imageFactory: createImageFactory(new Set())
  });
  const backgroundOrder = [];
  const backgroundResult = backgroundLayer.render(createRendererSpy(backgroundOrder), {
    scene: { session: { mode: "playing" } }
  });
  assert.equal(backgroundResult.drawn, false);
  assert.equal(backgroundResult.path, "");
  assert.equal(backgroundOrder.length, 0);

  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({
    canvas,
    documentRef,
    manifestPayload: createAssetManagerManifest({ includeBackground: false, includeBezel: false })
  });
  await attachResolvedBezel(bezel, { fullscreenActive: false, fullscreenElement: host });
  assert.equal(bezel.element, null);
  const bezelResult = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(bezelResult.visible, false);
  assert.equal(bezelResult.canvasLayoutMode, "fullscreen-fit");
  assertNear(parseFloat(canvas.style.width), 1200, 0.6);
  assertNear(parseFloat(canvas.style.height), 900, 0.6);
}

async function testFullscreenBezelVisibilityAndHtmlAttachment() {
  const documentRef = createDocumentStub();
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({ canvas, documentRef, manifestPayload: createAssetManagerManifest() });
  await attachResolvedBezel(bezel, { fullscreenActive: false, fullscreenElement: host });
  assert.equal(bezel.getState().attached, true);
  assert.equal(bezel.element.parentElement, host);
  assert.equal(bezel.element.attributes["data-runtime-overlay"], "fullscreenBezel");
  assert.equal(bezel.element.src, ASTEROIDS_BEZEL_RUNTIME_PATH);
  assert.equal(bezel.element.src.includes("/archive/v1-v2/games/Asteroids/archive/v1-v2/games/Asteroids/"), false);

  bezel.element.onload?.();
  let result = bezel.sync({ fullscreenActive: false, fullscreenElement: host });
  assert.equal(result.visible, false);
  assert.equal(bezel.element.style.display, "none");
  assert.equal(bezel.element.style.visibility, "hidden");
  assert.equal(bezel.element.style.opacity, "0");

  result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, true);
  assert.equal(result.canvasLayoutMode, "fullscreen-fit");
  assert.equal(bezel.element.style.display, "block");
  assert.equal(bezel.element.style.visibility, "visible");
  assert.equal(bezel.element.style.opacity, "1");
  assert.equal(host.style.position, "relative");
  assert.equal(host.style.overflow, "hidden");
  assert.equal(host.style.isolation, "isolate");
  assert.equal(canvas.style.position, "absolute");
  assert.equal(canvas.style.zIndex, "1");
  assert.equal(Number(bezel.element.style.zIndex) > Number(canvas.style.zIndex), true);
}

async function testNoOpWhenBezelMissing() {
  const documentRef = createDocumentStub("/archive/v1-v2/games/MissingGame/index.html");
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({
    canvas,
    documentRef,
    manifestPayload: createAssetManagerManifest({ includeBackground: false, includeBezel: false })
  });
  await attachResolvedBezel(bezel, { fullscreenActive: false, fullscreenElement: host });
  assert.equal(bezel.element, null);
  const result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, false);
  assert.equal(result.canvasLayoutMode, "fullscreen-fit");
  assertNear(parseFloat(canvas.style.width), 1200, 0.6);
  assertNear(parseFloat(canvas.style.height), 900, 0.6);
}

function testMalformedBezelImageIsTreatedAsUnavailable() {
  const documentRef = createDocumentStub("/archive/v1-v2/games/Asteroids/index.html");
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  const bezel = new fullscreenBezel({ canvas, documentRef });
  bezel.attach();
  bezel.element.naturalWidth = 0;
  bezel.element.naturalHeight = 0;
  bezel.element.width = 0;
  bezel.element.height = 0;
  bezel.element.onload?.();

  const result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, false);
  assert.equal(bezel.getState().visible, false);
  assert.equal(bezel.getState().canvasLayoutMode, "fullscreen-fit");
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
  assert.equal(
    resolveBezelStretchConfigPath("archive/v1-v2/games/Asteroids/assets/images/bezel.png"),
    "archive/v1-v2/games/Asteroids/game.manifest.json#tools.asset-browser.assets.image.asteroids.bezel.stretchOverride"
  );
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

function testFullscreenBezelSharedStretchAffectsAllSides() {
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

  const alphaInspector = () => ({ x: 460, y: 220, width: 1000, height: 500 });
  const baseline = new fullscreenBezel({
    canvas,
    documentRef,
    alphaInspector,
    stretchConfigProvider() {
      return { uniformEdgeStretchPx: 0 };
    }
  });
  baseline.attach();
  baseline.element.naturalWidth = 1920;
  baseline.element.naturalHeight = 1080;
  baseline.element.onload?.();
  baseline.sync({ fullscreenActive: true, fullscreenElement: host });
  const baselineLeft = parseFloat(canvas.style.left);
  const baselineTop = parseFloat(canvas.style.top);
  const baselineWidth = parseFloat(canvas.style.width);
  const baselineHeight = parseFloat(canvas.style.height);
  const baselineCenterX = baselineLeft + (baselineWidth * 0.5);
  const baselineCenterY = baselineTop + (baselineHeight * 0.5);
  baseline.detach();

  const stretched = new fullscreenBezel({
    canvas,
    documentRef,
    alphaInspector,
    stretchConfigProvider() {
      return { uniformEdgeStretchPx: 20 };
    }
  });
  stretched.attach();
  stretched.element.naturalWidth = 1920;
  stretched.element.naturalHeight = 1080;
  stretched.element.onload?.();
  stretched.sync({ fullscreenActive: true, fullscreenElement: host });
  const stretchedLeft = parseFloat(canvas.style.left);
  const stretchedTop = parseFloat(canvas.style.top);
  const stretchedWidth = parseFloat(canvas.style.width);
  const stretchedHeight = parseFloat(canvas.style.height);
  const stretchedCenterX = stretchedLeft + (stretchedWidth * 0.5);
  const stretchedCenterY = stretchedTop + (stretchedHeight * 0.5);

  assert.equal(stretched.getState().uniformEdgeStretchPx, 20);
  assert.equal(stretchedWidth >= baselineWidth, true);
  assert.equal(stretchedHeight >= baselineHeight, true);
  assertNear(stretchedCenterX, baselineCenterX, 0.51);
  assertNear(stretchedCenterY, baselineCenterY, 0.51);
}

function testFullscreenBezelCyclesAndResizeKeepLayoutStable() {
  const documentRef = createDocumentStub("/archive/v1-v2/games/Asteroids/index.html");
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

  let result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, true);
  assert.equal(result.canvasLayoutMode, "transparent-window-fit");
  const firstWidth = parseFloat(canvas.style.width);
  const firstHeight = parseFloat(canvas.style.height);

  result = bezel.sync({ fullscreenActive: false, fullscreenElement: host });
  assert.equal(result.visible, false);
  assert.equal(result.canvasLayoutMode, "fallback");
  assert.equal(canvas.style.width, "960px");
  assert.equal(canvas.style.height, "720px");

  host.clientWidth = 1920;
  host.clientHeight = 1080;
  host.offsetWidth = 1920;
  host.offsetHeight = 1080;
  result = bezel.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, true);
  assert.equal(result.canvasLayoutMode, "transparent-window-fit");
  const resizedWidth = parseFloat(canvas.style.width);
  const resizedHeight = parseFloat(canvas.style.height);
  assert.equal(resizedWidth > firstWidth, true);
  assert.equal(resizedHeight > firstHeight, true);
}

function testMalformedAndExtremeStretchConfigValuesAreSafe() {
  const documentRef = createDocumentStub("/archive/v1-v2/games/Asteroids/index.html");
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

  const malformed = new fullscreenBezel({
    canvas,
    documentRef,
    alphaInspector: () => ({ x: 460, y: 220, width: 1000, height: 500 }),
    stretchConfigProvider: () => ({ uniformEdgeStretchPx: "abc" })
  });
  malformed.attach();
  malformed.element.naturalWidth = 1920;
  malformed.element.naturalHeight = 1080;
  malformed.element.onload?.();
  malformed.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(malformed.getState().uniformEdgeStretchPx, 0);
  malformed.detach();

  const extreme = new fullscreenBezel({
    canvas,
    documentRef,
    alphaInspector: () => ({ x: 460, y: 220, width: 1000, height: 500 }),
    stretchConfigProvider: () => ({ uniformEdgeStretchPx: Number.MAX_SAFE_INTEGER })
  });
  extreme.attach();
  extreme.element.naturalWidth = 1920;
  extreme.element.naturalHeight = 1080;
  extreme.element.onload?.();
  const result = extreme.sync({ fullscreenActive: true, fullscreenElement: host });
  assert.equal(result.visible, true);
  assert.equal(extreme.getState().uniformEdgeStretchPx > 0, true);
  assert.equal(parseFloat(canvas.style.width) <= 1600.01, true);
  assert.equal(parseFloat(canvas.style.height) <= 900.01, true);
}

async function testBezelStretchConfigAutoCreate() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "bezel-stretch-config-"));
  const configPath = "archive/v1-v2/games/TestGame/assets/images/bezel.stretch.override.json";

  try {
    const config = await ensureBezelStretchConfigFile(configPath, {
      cwd: tempRoot,
      fsModule: { mkdir, readFile, writeFile },
      pathModule: path
    });
    assert.deepEqual(config, { uniformEdgeStretchPx: 0 });

    const absolutePath = path.resolve(tempRoot, configPath);
    const saved = JSON.parse(await readFile(absolutePath, "utf8"));
    assert.deepEqual(saved, { uniformEdgeStretchPx: 0 });

    const existingContent = { uniformEdgeStretchPx: 12 };
    await writeFile(absolutePath, `${JSON.stringify(existingContent, null, 2)}\n`, "utf8");
    const loadedExisting = await ensureBezelStretchConfigFile(configPath, {
      cwd: tempRoot,
      fsModule: { mkdir, readFile, writeFile },
      pathModule: path
    });
    const savedAfterReload = JSON.parse(await readFile(absolutePath, "utf8"));
    assert.deepEqual(loadedExisting, existingContent);
    assert.deepEqual(savedAfterReload, existingContent);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function testBezelDetectionTriggersStretchConfigAutoCreate() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "bezel-detected-config-"));
  const documentRef = createDocumentStub("/archive/v1-v2/games/_template/index.html");
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  try {
    let providerCalls = 0;
    const bezel = new fullscreenBezel({
      canvas,
      documentRef,
      stretchConfigProvider(configPath) {
        providerCalls += 1;
        return ensureBezelStretchConfigFile(configPath, {
          cwd: tempRoot,
          fsModule: { mkdir, readFile, writeFile },
          pathModule: path
        });
      }
    });
    bezel.attach();
    assert.equal(providerCalls, 0);
    bezel.element.naturalWidth = 1920;
    bezel.element.naturalHeight = 1080;
    bezel.element.onload?.();
    assert.equal(providerCalls, 1);
    bezel.sync({ fullscreenActive: false, fullscreenElement: host });
    assert.equal(providerCalls, 1);
    if (bezel.stretchConfigPromise) {
      await bezel.stretchConfigPromise;
    }

    const createdPath = path.resolve(tempRoot, "archive/v1-v2/games/_template/assets/images/bezel.stretch.override.json");
    const saved = JSON.parse(await readFile(createdPath, "utf8"));
    assert.deepEqual(saved, { uniformEdgeStretchPx: 0 });
    assert.equal(bezel.getState().stretchConfigPath, "archive/v1-v2/games/_template/assets/images/bezel.stretch.override.json");
    assert.equal(bezel.getState().stretchConfigInitialized, true);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function testBezelDetectionDoesNotOverwriteExistingStretchConfig() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "bezel-detected-existing-config-"));
  const documentRef = createDocumentStub("/archive/v1-v2/games/_template/index.html");
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  try {
    const expectedConfig = { uniformEdgeStretchPx: 14 };
    const configPath = path.resolve(tempRoot, "archive/v1-v2/games/_template/assets/images/bezel.stretch.override.json");
    await mkdir(path.dirname(configPath), { recursive: true });
    await writeFile(configPath, `${JSON.stringify(expectedConfig, null, 2)}\n`, "utf8");

    const bezel = new fullscreenBezel({
      canvas,
      documentRef,
      stretchConfigProvider(runtimeConfigPath) {
        return ensureBezelStretchConfigFile(runtimeConfigPath, {
          cwd: tempRoot,
          fsModule: { mkdir, readFile, writeFile },
          pathModule: path
        });
      }
    });
    bezel.attach();
    bezel.element.naturalWidth = 1920;
    bezel.element.naturalHeight = 1080;
    bezel.element.onload?.();
    if (bezel.stretchConfigPromise) {
      await bezel.stretchConfigPromise;
    }

    const savedAfterStartup = JSON.parse(await readFile(configPath, "utf8"));
    assert.deepEqual(savedAfterStartup, expectedConfig);
    assert.equal(bezel.getState().uniformEdgeStretchPx, expectedConfig.uniformEdgeStretchPx);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function testMalformedStretchConfigFileFallsBackWithoutOverwrite() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "bezel-malformed-config-"));
  const configPath = path.resolve(tempRoot, "archive/v1-v2/games/TestGame/assets/images/bezel.stretch.override.json");
  try {
    await mkdir(path.dirname(configPath), { recursive: true });
    const malformedContent = "{not-valid-json";
    await writeFile(configPath, malformedContent, "utf8");

    const loaded = await ensureBezelStretchConfigFile("archive/v1-v2/games/TestGame/assets/images/bezel.stretch.override.json", {
      cwd: tempRoot,
      fsModule: { mkdir, readFile, writeFile },
      pathModule: path
    });
    const savedAfterLoad = await readFile(configPath, "utf8");
    assert.deepEqual(loaded, { uniformEdgeStretchPx: 0 });
    assert.equal(savedAfterLoad, malformedContent);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function testSampleGameBezelDetectionCreatesStretchConfig() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "bezel-detected-spaceinvaders-config-"));
  const documentRef = createDocumentStub("/archive/v1-v2/games/SpaceInvaders/index.html");
  const host = createElement("div", documentRef);
  const canvas = createElement("canvas", documentRef);
  canvas.width = 960;
  canvas.height = 720;
  host.appendChild(canvas);
  documentRef.body.appendChild(host);

  try {
    const bezel = new fullscreenBezel({
      canvas,
      documentRef,
      stretchConfigProvider(configPath) {
        return ensureBezelStretchConfigFile(configPath, {
          cwd: tempRoot,
          fsModule: { mkdir, readFile, writeFile },
          pathModule: path
        });
      }
    });

    bezel.attach();
    bezel.element.naturalWidth = 1920;
    bezel.element.naturalHeight = 1080;
    bezel.element.onload?.();
    if (bezel.stretchConfigPromise) {
      await bezel.stretchConfigPromise;
    }

    const createdPath = path.resolve(tempRoot, "archive/v1-v2/games/SpaceInvaders/assets/images/bezel.stretch.override.json");
    const saved = JSON.parse(await readFile(createdPath, "utf8"));
    assert.deepEqual(saved, { uniformEdgeStretchPx: 0 });
    assert.equal(bezel.getState().stretchConfigPath, "archive/v1-v2/games/SpaceInvaders/assets/images/bezel.stretch.override.json");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function testEngineRuntimeIntegration() {
  const animationFrame = createAnimationFrameStub();
  const originalDocument = globalThis.document;
  const originalImage = globalThis.Image;
  const originalFetch = globalThis.fetch;
  const order = [];

  try {
    const documentRef = createDocumentStub();
    const host = createElement("div", documentRef);
    const canvas = createCanvasWithOrder(order, documentRef);
    host.appendChild(canvas);
    documentRef.body.appendChild(host);
    globalThis.document = documentRef;

    const availablePaths = new Set([
      ASTEROIDS_BACKGROUND_RUNTIME_PATH,
      "/archive/v1-v2/games/Asteroids/assets/images/bezel.png"
    ]);
    const manifestPayload = createAssetManagerManifest();
    globalThis.fetch = async (url) => {
      const requestUrl = String(url?.url || url || "");
      if (requestUrl.endsWith("/archive/v1-v2/games/Asteroids/game.manifest.json")) {
        return {
          ok: true,
          async json() {
            return manifestPayload;
          }
        };
      }
      return {
        ok: false,
        async json() {
          return null;
        }
      };
    };
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
    assert.equal(engine.fullscreenBezelLayer.element, null);

    engine.tick(1000);
    await Promise.all([
      engine.backgroundColorLayer.manifestResolvePromise,
      engine.backgroundImageLayer.manifestResolvePromise,
      engine.fullscreenBezelLayer.manifestResolvePromise
    ].filter(Boolean));
    assert.deepEqual(order, ["clear", "scene"]);
    assert.equal(engine.fullscreenBezelLayer.getState().visible, false);

    order.length = 0;
    engine.tick(1008);
    assert.deepEqual(order, [
      "clear",
      `background:${ASTEROIDS_BACKGROUND_RUNTIME_PATH}`,
      "scene"
    ]);
    assert.equal(engine.fullscreenBezelLayer.element.src, ASTEROIDS_BEZEL_RUNTIME_PATH);
    assert.equal(engine.fullscreenBezelLayer.element.src.includes("/archive/v1-v2/games/Asteroids/archive/v1-v2/games/Asteroids/"), false);

    scene.session.mode = "playing";
    order.length = 0;
    engine.tick(1016);
    assert.deepEqual(order, [
      "clear",
      `background:${ASTEROIDS_BACKGROUND_RUNTIME_PATH}`,
      "scene"
    ]);

    fullscreenActive = true;
    engine.fullscreenBezelLayer.element.onload?.();
    order.length = 0;
    engine.tick(1032);
    assert.deepEqual(order, [
      "clear",
      `background:${ASTEROIDS_BACKGROUND_RUNTIME_PATH}`,
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
    if (originalFetch === undefined) {
      delete globalThis.fetch;
    } else {
      globalThis.fetch = originalFetch;
    }
  }
}

export async function run() {
  await testBackgroundManifestRenderOrder();
  await testGameImageConventionsAreGameAgnostic();
  testResolvePreferredFullscreenTargetKeepsCanvasOnlyParent();
  testResolvePreferredFullscreenTargetCreatesCanvasOnlyHost();
  await testNoOpWhenBackgroundMissing();
  await testSampleGameBackgroundAndBezelNoOpWhenMissing();
  await testFullscreenBezelVisibilityAndHtmlAttachment();
  await testNoOpWhenBezelMissing();
  testMalformedBezelImageIsTreatedAsUnavailable();
  testTransparentWindowDetectionAndAspectFit();
  testFullscreenBezelTransparentWindowCanvasFit();
  testFullscreenBezelSharedStretchAffectsAllSides();
  testFullscreenBezelCyclesAndResizeKeepLayoutStable();
  testMalformedAndExtremeStretchConfigValuesAreSafe();
  await testBezelStretchConfigAutoCreate();
  await testBezelDetectionTriggersStretchConfigAutoCreate();
  await testBezelDetectionDoesNotOverwriteExistingStretchConfig();
  await testMalformedStretchConfigFileFallsBackWithoutOverwrite();
  await testSampleGameBezelDetectionCreatesStretchConfig();
  await testEngineRuntimeIntegration();
}
