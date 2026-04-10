/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 EngineFullscreen.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '../../src/engine/core/Engine.js';
import { FullscreenService } from '../../src/engine/runtime/index.js';

function createCanvas() {
  const canvas = {
    width: 0,
    height: 0,
    requestFullscreen() {},
    getContext() {
      return context;
    },
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
    drawImage() {},
  };

  return canvas;
}

function createAnimationFrameStub() {
  const requested = [];
  const cancelled = [];
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  let nextId = 1;

  globalThis.requestAnimationFrame = (callback) => {
    const id = nextId;
    nextId += 1;
    requested.push({ id, callback });
    return id;
  };

  globalThis.cancelAnimationFrame = (id) => {
    cancelled.push(id);
  };

  return {
    requested,
    cancelled,
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
    },
  };
}

function createDocumentStub() {
  let fullscreenElement = null;
  const listeners = new Map();
  const added = [];
  const removed = [];

  return {
    listeners,
    added,
    removed,
    get fullscreenElement() {
      return fullscreenElement;
    },
    set fullscreenElement(value) {
      fullscreenElement = value;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
      added.push(type);
    },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) {
        listeners.delete(type);
      }
      removed.push(type);
    },
    async exitFullscreen() {
      fullscreenElement = null;
      listeners.get('fullscreenchange')?.();
    },
  };
}

function createEngine({ canvas = createCanvas(), fullscreen = null } = {}) {
  return new Engine({
    canvas,
    fullscreen,
    input: {
      attach() {},
      detach() {},
      update() {},
    },
    audio: {
      update() {},
    },
    metrics: {
      recordFrame() {},
    },
    logger: {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
  });
}

export function run() {
  const animationFrame = createAnimationFrameStub();
  const originalDocument = globalThis.document;

  try {
    const injectedCanvas = createCanvas();
    const attachedTargets = [];
    let detachCount = 0;
    const fullscreenDouble = {
      attach(target) {
        attachedTargets.push(target);
      },
      detach() {
        detachCount += 1;
      },
    };

    const engineWithDouble = createEngine({
      canvas: injectedCanvas,
      fullscreen: fullscreenDouble,
    });

    engineWithDouble.start();
    engineWithDouble.stop();

    assert.deepEqual(attachedTargets, [injectedCanvas]);
    assert.equal(detachCount, 1);

    const documentRef = createDocumentStub();
    globalThis.document = documentRef;

    const browserCanvas = createCanvas();
    const engineWithBrowserService = createEngine({ canvas: browserCanvas });

    assert.equal(engineWithBrowserService.fullscreen instanceof FullscreenService, true);
    assert.equal(engineWithBrowserService.fullscreen.documentRef, documentRef);
    assert.equal(engineWithBrowserService.fullscreen.target, browserCanvas);

    engineWithBrowserService.start();
    assert.deepEqual(documentRef.added, ['fullscreenchange', 'fullscreenerror']);
    assert.equal(engineWithBrowserService.fullscreen.isAttached, true);
    assert.equal(engineWithBrowserService.fullscreen.target, browserCanvas);

    engineWithBrowserService.stop();
    assert.deepEqual(documentRef.removed, ['fullscreenchange', 'fullscreenerror']);
    assert.equal(engineWithBrowserService.fullscreen.isAttached, false);

    assert.equal(animationFrame.requested.length, 2);
    assert.deepEqual(animationFrame.cancelled, [1, 2]);
  } finally {
    animationFrame.restore();

    if (originalDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = originalDocument;
    }
  }
}
