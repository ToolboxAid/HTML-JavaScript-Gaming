/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 EventBusNaming.test.mjs
*/
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import Engine from '../../src/engine/core/Engine.js';
import EventBus from '../../src/engine/events/EventBus.js';

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

function createEngine(overrides = {}) {
  return new Engine({
    canvas: createCanvas(),
    metrics: {
      recordFrame() {},
    },
    input: {
      attach() {},
      detach() {},
      update() {},
    },
    audio: {
      update() {},
    },
    fullscreen: {
      attach() {},
      detach() {},
    },
    logger: {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
    ...overrides,
  });
}

export function run() {
  const eventFiles = readdirSync(new URL('../../src/engine/events/', import.meta.url));
  assert.equal(eventFiles.includes('EventBus.js'), true);
  assert.equal(eventFiles.includes('eventBus.js'), false);

  [
    '../../src/engine/core/Engine.js',
    '../../src/engine/events/index.js',
    '../../tests/events/EventBus.test.mjs',
    '../../tests/world/WorldSystems.test.mjs',
  ].forEach((relativePath) => {
    const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
    assert.equal(source.includes('EventBus.js'), true);
    assert.equal(source.includes('eventBus.js'), false);
  });

  const injectedBus = new EventBus();
  const engineWithInjectedBus = createEngine({ events: injectedBus });
  assert.equal(engineWithInjectedBus.events, injectedBus);

  const defaultEngine = createEngine();
  assert.equal(defaultEngine.events instanceof EventBus, true);
  assert.notEqual(defaultEngine.events, injectedBus);
}
