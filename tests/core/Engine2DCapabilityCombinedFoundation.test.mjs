/*
Toolbox Aid
David Quesenberry
04/14/2026
Engine2DCapabilityCombinedFoundation.test.mjs
*/
import assert from 'node:assert/strict';
import { Engine } from '../../src/engine/core/index.js';
import { Scene } from '../../src/engine/scene/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '../../src/engine/camera/index.js';
import { Tilemap, renderTilemap } from '../../src/engine/tilemap/index.js';
import { isColliding, runHybridCollision } from '../../src/engine/collision/index.js';
import { moveRectWithTilemapCollision } from '../../src/engine/systems/index.js';
import { GameModeState, runIfGameplayMode } from '../../src/engine/game/index.js';

function createCanvasHarness() {
  const calls = [];
  const canvas = {
    width: 0,
    height: 0,
    getContext() {
      return context;
    },
  };

  const context = {
    canvas,
    calls,
    clearRect(...args) { calls.push(['clearRect', ...args]); },
    fillRect(...args) { calls.push(['fillRect', ...args]); },
    strokeRect(...args) { calls.push(['strokeRect', ...args]); },
    beginPath() { calls.push(['beginPath']); },
    arc(...args) { calls.push(['arc', ...args]); },
    fill() { calls.push(['fill']); },
    moveTo(...args) { calls.push(['moveTo', ...args]); },
    lineTo(...args) { calls.push(['lineTo', ...args]); },
    stroke() { calls.push(['stroke']); },
    closePath() { calls.push(['closePath']); },
    fillText(...args) { calls.push(['fillText', ...args]); },
    drawImage(...args) { calls.push(['drawImage', ...args]); },
  };

  return { canvas, calls };
}

function withAnimationFrameStub(run) {
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  let nextId = 1;
  globalThis.requestAnimationFrame = () => nextId++;
  globalThis.cancelAnimationFrame = () => {};

  try {
    run();
  } finally {
    if (originalRaf === undefined) {
      delete globalThis.requestAnimationFrame;
    } else {
      globalThis.requestAnimationFrame = originalRaf;
    }

    if (originalCancel === undefined) {
      delete globalThis.cancelAnimationFrame;
    } else {
      globalThis.cancelAnimationFrame = originalCancel;
    }
  }
}

class CapabilityScene extends Scene {
  constructor() {
    super();
    this.entered = 0;
    this.gameplayUpdates = 0;
    this.renders = 0;
    this.mode = new GameModeState('title');
    this.tilemap = new Tilemap({
      tileSize: 16,
      tiles: [
        [0, 1],
        [0, 0],
      ],
      palette: { 0: '#111111', 1: '#ff0000' },
      definitions: {
        0: { solid: false, color: '#111111' },
        1: { solid: true, color: '#ff0000' },
      },
    });
    this.player = { x: 0, y: 0, width: 14, height: 14 };
    this.velocity = { x: 1000, y: 0 };
    this.camera = new Camera2D({
      viewportWidth: 64,
      viewportHeight: 64,
      worldWidth: 128,
      worldHeight: 128,
    });
    this.lastCollision = null;
  }

  enter() {
    this.entered += 1;
  }

  update(dtSeconds) {
    runIfGameplayMode(this.mode, () => {
      followCameraTarget(this.camera, this.player, true);
      this.lastCollision = moveRectWithTilemapCollision(this.player, this.velocity, dtSeconds, this.tilemap);
      this.gameplayUpdates += 1;
    });
  }

  render(renderer) {
    this.renders += 1;
    const screen = this.camera.getOffset();
    renderTilemap(renderer, this.tilemap, screen);

    runIfGameplayMode(this.mode, () => {
      const drawRect = worldRectToScreen(this.camera, this.player);
      renderer.drawRect(drawRect.x, drawRect.y, drawRect.width, drawRect.height, '#00ffff');
    });
  }
}

export function run() {
  withAnimationFrameStub(() => {
    const { canvas, calls } = createCanvasHarness();
    let tickCount = 0;
    const engine = new Engine({
      canvas,
      width: 64,
      height: 64,
      frameClock: {
        reset() {},
        tick() {
          tickCount += 1;
          return { deltaMs: 16, deltaSeconds: 0.016 };
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
      logger: { debug() {}, info() {}, warn() {}, error() {} },
    });

    const scene = new CapabilityScene();
    engine.setScene(scene);
    assert.equal(scene.entered, 1);

    engine.start();

    // Title-mode tick: scene still renders but gameplay hook stays inactive.
    engine.tick(16);
    assert.equal(scene.gameplayUpdates, 0);
    assert.equal(scene.renders >= 1, true);

    // Switch to gameplay, then validate gameplay update/collision/camera behavior.
    scene.mode.setMode('playing');
    engine.tick(32);

    assert.equal(tickCount >= 2, true);
    assert.equal(scene.gameplayUpdates, 1);
    assert.equal(scene.lastCollision.hitX, true);
    assert.equal(scene.velocity.x, 0);

    assert.equal(
      isColliding(scene.player, {
        x: scene.lastCollision.tileX.x,
        y: scene.lastCollision.tileX.y,
        width: scene.lastCollision.tileX.width,
        height: scene.lastCollision.tileX.height,
      }),
      false
    );

    const hybrid = runHybridCollision({
      boundsA: { x: 0, y: 0, width: 10, height: 10 },
      boundsB: { x: 5, y: 5, width: 10, height: 10 },
      polygonA: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }],
      polygonB: [{ x: 5, y: 5 }, { x: 15, y: 5 }, { x: 5, y: 15 }],
    });
    assert.equal(hybrid.collided, true);

    const clearCalls = calls.filter((entry) => entry[0] === 'clearRect');
    const fillCalls = calls.filter((entry) => entry[0] === 'fillRect');
    assert.equal(clearCalls.length >= 2, true);
    assert.equal(fillCalls.length >= 4, true);

    engine.stop();
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
