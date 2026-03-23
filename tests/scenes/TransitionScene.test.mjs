/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 TransitionScene.test.mjs
*/
import assert from 'node:assert/strict';
import SceneTransition from '../../engine/scenes/SceneTransition.js';
import TransitionScene from '../../engine/scenes/TransitionScene.js';

function createRenderer(log) {
  const renderer = {
    drawRect(x, y, width, height, color) {
      log.push({ type: 'overlay', x, y, width, height, color });
    },
    getCanvasSize() {
      return { width: 320, height: 180 };
    },
  };

  Object.defineProperty(renderer, 'ctx', {
    get() {
      throw new Error('TransitionScene should not reach into renderer.ctx.');
    },
  });

  return renderer;
}

function createScene(name, log) {
  return {
    render(_renderer, _engine, alpha) {
      log.push({ type: 'scene', name, alpha });
    },
  };
}

export function run() {
  const log = [];
  const renderer = createRenderer(log);
  const scene = new TransitionScene({
    fromScene: createScene('from', log),
    toScene: createScene('to', log),
    transition: new SceneTransition({ durationSeconds: 1 }),
  });

  scene.enter({});
  scene.update(0.25, {});
  scene.render(renderer, {}, 0.4);

  scene.update(0.5, {});
  scene.render(renderer, {}, 0.7);

  assert.deepEqual(log, [
    { type: 'scene', name: 'from', alpha: 0.4 },
    { type: 'overlay', x: 0, y: 0, width: 320, height: 180, color: 'rgba(0, 0, 0, 0.5)' },
    { type: 'scene', name: 'to', alpha: 0.7 },
    { type: 'overlay', x: 0, y: 0, width: 320, height: 180, color: 'rgba(0, 0, 0, 0.5)' },
  ]);
}
