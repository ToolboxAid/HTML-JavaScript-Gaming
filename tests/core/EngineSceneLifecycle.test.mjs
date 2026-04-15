/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 EngineSceneLifecycle.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '../../src/engine/core/Engine.js';
import SceneTransition from '../../src/engine/scene/SceneTransition.js';
import TransitionScene from '../../src/engine/scene/TransitionScene.js';
import { Camera3D } from '../../src/engine/camera/index.js';

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

function createEngine() {
  return new Engine({
    canvas: createCanvas(),
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
  });
}

function createScene(name, log) {
  return {
    enter(currentEngine) {
      log.push(`${name}:enter:${currentEngine !== null}`);
    },
    exit(currentEngine) {
      log.push(`${name}:exit:${currentEngine !== null}`);
    },
    update() {},
    render() {},
  };
}

export function run() {
  const engine = createEngine();
  assert.equal(engine.camera3D instanceof Camera3D, true);
  const log = [];
  const firstScene = createScene('first', log);
  const secondScene = createScene('second', log);

  engine.setScene(firstScene);
  engine.setScene(secondScene);
  engine.setScene(secondScene);

  assert.deepEqual(log, [
    'first:enter:true',
    'first:exit:true',
    'second:enter:true',
  ]);
  assert.equal(firstScene.camera3D, engine.camera3D);
  assert.equal(secondScene.camera3D, engine.camera3D);

  const transitionLog = [];
  const fromScene = createScene('from', transitionLog);
  const toScene = createScene('to', transitionLog);
  const transitionScene = new TransitionScene({
    fromScene,
    toScene,
    transition: new SceneTransition({ durationSeconds: 0.1 }),
  });

  transitionScene.exit = (currentEngine) => {
    transitionLog.push(`transition:exit:${currentEngine !== null}`);
  };

  engine.setScene(fromScene);
  engine.setScene(transitionScene);
  transitionScene.update(0.1, engine);

  assert.deepEqual(transitionLog, [
    'from:enter:true',
    'from:exit:true',
    'transition:exit:true',
    'to:enter:true',
  ]);
}
