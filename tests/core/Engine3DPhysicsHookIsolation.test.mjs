/*
 Toolbox Aid
 David Quesenberry
 04/15/2026
 Engine3DPhysicsHookIsolation.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '../../src/engine/core/Engine.js';
import { Camera2D } from '../../src/engine/camera/index.js';
import { stepSceneBodies3D } from '../../src/engine/physics/index.js';

function createCanvas() {
  const canvas = {
    width: 0,
    height: 0,
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

function withAnimationFrameStub(run) {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  let nextId = 1;

  globalThis.requestAnimationFrame = () => nextId++;
  globalThis.cancelAnimationFrame = () => {};

  try {
    run();
  } finally {
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
}

export function run() {
  withAnimationFrameStub(() => {
    const warnings = [];
    let updateCount = 0;
    const camera2D = new Camera2D({
      x: 7,
      y: 9,
      viewportWidth: 64,
      viewportHeight: 64,
      worldWidth: 256,
      worldHeight: 256,
    });

    const scene = {
      bodies3D: [
        {
          x: 0,
          y: 0,
          z: 0,
          width: 2,
          height: 2,
          depth: 2,
          velocityX: 6,
          velocityY: 0,
          velocityZ: 0,
        },
      ],
      staticColliders3D: [
        { x: 4, y: 0, z: 0, width: 2, height: 2, depth: 2 },
      ],
      step3DPhysics(dtSeconds) {
        return stepSceneBodies3D(this, dtSeconds);
      },
      update() {
        updateCount += 1;
      },
      render() {},
    };

    const engine = new Engine({
      canvas: createCanvas(),
      frameClock: {
        reset() {},
        tick() {
          return { deltaMs: 500, deltaSeconds: 0.5 };
        },
      },
      fixedTicker: {
        reset() {},
        advance(deltaMs, onStep) {
          onStep(deltaMs / 1000, deltaMs);
          return { steps: 1, alpha: 0 };
        },
      },
      input: { attach() {}, detach() {}, update() {} },
      audio: { attach() {}, detach() {}, update() {} },
      fullscreen: { attach() {}, detach() {}, getState() { return { active: false }; }, documentRef: null },
      backgroundImageLayer: { render() {} },
      fullscreenBezelLayer: { attach() {}, detach() {}, sync() {} },
      metrics: { recordFrame() {} },
      logger: {
        debug() {},
        info() {},
        warn(message, meta) {
          warnings.push({ message, meta });
        },
        error() {},
      },
    });

    engine.setScene(scene);
    engine.start();
    engine.tick(500);

    assert.equal(updateCount, 1);
    assert.equal(scene.bodies3D[0].x, 2);
    assert.equal(scene.bodies3D[0].velocityX, 0);
    assert.equal(camera2D.x, 7);
    assert.equal(camera2D.y, 9);
    assert.equal(warnings.length, 0);

    scene.step3DPhysics = () => {
      throw new Error('test-failure');
    };

    engine.tick(1000);
    assert.equal(updateCount, 2);
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].message, 'Engine scene step3DPhysics hook failed.');

    engine.stop();
  });
}
