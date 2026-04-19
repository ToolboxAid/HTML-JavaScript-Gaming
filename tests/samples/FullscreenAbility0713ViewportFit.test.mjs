import assert from "node:assert/strict";
import {
  attachFullscreenViewportFit,
  computeContainSize,
} from "../../samples/phase-07/0713/fullscreenViewportFit.js";
import FullscreenAbilityScene from "../../samples/phase-07/0713/FullscreenAbilityScene.js";

function createEventTarget(initialState = {}) {
  const listeners = new Map();
  return {
    ...initialState,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    trigger(type) {
      listeners.get(type)?.();
    },
  };
}

export function run() {
  const exactFit = computeContainSize({
    viewportWidth: 1920,
    viewportHeight: 1080,
    designWidth: 960,
    designHeight: 540,
  });
  assert.deepEqual(exactFit, { width: 1920, height: 1080 });

  const letterboxed = computeContainSize({
    viewportWidth: 1920,
    viewportHeight: 1200,
    designWidth: 960,
    designHeight: 540,
  });
  assert.deepEqual(letterboxed, { width: 1920, height: 1080 });

  const canvas = {
    style: {
      width: "",
      height: "",
      maxWidth: "960px",
      maxHeight: "",
      margin: "",
      display: "",
    },
  };
  const documentRef = createEventTarget({ fullscreenElement: null });
  const windowRef = createEventTarget({ innerWidth: 1920, innerHeight: 1200 });
  const fit = attachFullscreenViewportFit({
    canvas,
    documentRef,
    windowRef,
    designWidth: 960,
    designHeight: 540,
  });

  documentRef.fullscreenElement = canvas;
  fit.apply();
  assert.equal(canvas.style.width, "1920px");
  assert.equal(canvas.style.height, "1080px");
  assert.equal(canvas.style.maxWidth, "none");

  windowRef.innerWidth = 1280;
  windowRef.innerHeight = 1024;
  windowRef.trigger("resize");
  assert.equal(canvas.style.width, "1280px");
  assert.equal(canvas.style.height, "720px");

  documentRef.fullscreenElement = null;
  documentRef.trigger("fullscreenchange");
  assert.equal(canvas.style.width, "");
  assert.equal(canvas.style.height, "");
  assert.equal(canvas.style.maxWidth, "960px");

  const scene = new FullscreenAbilityScene();
  let requestCount = 0;
  let exitCount = 0;
  const engine = {
    fullscreen: {
      async request() {
        requestCount += 1;
      },
      async exit() {
        exitCount += 1;
      },
    },
  };
  return scene.handleCanvasClick(100, 490, engine).then(async (entered) => {
    assert.equal(entered, true);
    assert.equal(requestCount, 1);
    const exited = await scene.handleCanvasClick(340, 490, engine);
    assert.equal(exited, true);
    assert.equal(exitCount, 1);
  });
}
