import assert from "node:assert/strict";
import {
  attachFullscreenViewportFit,
  computeCoverSize,
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
  const exactFit = computeCoverSize({
    viewportWidth: 1920,
    viewportHeight: 1080,
    designWidth: 960,
    designHeight: 540,
  });
  assert.deepEqual(exactFit, { width: 1920, height: 1080 });

  const covered = computeCoverSize({
    viewportWidth: 1920,
    viewportHeight: 1200,
    designWidth: 960,
    designHeight: 540,
  });
  assert.deepEqual(covered, { width: 2133, height: 1200 });

  const canvas = {
    style: {
      width: "",
      height: "",
      maxWidth: "960px",
      maxHeight: "",
      margin: "",
      display: "",
      position: "",
      left: "",
      top: "",
      transform: "",
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
  assert.equal(canvas.style.width, "2133px");
  assert.equal(canvas.style.height, "1200px");
  assert.equal(canvas.style.maxWidth, "none");
  assert.equal(canvas.style.position, "fixed");
  assert.equal(canvas.style.left, "50%");
  assert.equal(canvas.style.top, "50%");
  assert.equal(canvas.style.transform, "translate(-50%, -50%)");

  windowRef.innerWidth = 1280;
  windowRef.innerHeight = 1024;
  windowRef.trigger("resize");
  assert.equal(canvas.style.width, "1820px");
  assert.equal(canvas.style.height, "1024px");

  documentRef.fullscreenElement = null;
  documentRef.trigger("fullscreenchange");
  assert.equal(canvas.style.width, "");
  assert.equal(canvas.style.height, "");
  assert.equal(canvas.style.maxWidth, "960px");
  assert.equal(canvas.style.position, "");
  assert.equal(canvas.style.left, "");
  assert.equal(canvas.style.top, "");
  assert.equal(canvas.style.transform, "");

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
