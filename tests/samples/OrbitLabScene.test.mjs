/*
Toolbox Aid
David Quesenberry
03/24/2026
OrbitLabScene.test.mjs
*/
import assert from 'node:assert/strict';
import OrbitLabScene from '../../samples/phase-06/0614/game/OrbitLabScene.js';

function createMutableInput() {
  let down = new Set();
  return {
    setState(codesDown = []) {
      down = new Set(codesDown);
    },
    isDown(code) {
      return down.has(code);
    },
  };
}

export function run() {
  const input = createMutableInput();
  const scene = new OrbitLabScene();

  input.setState(['Digit2']);
  scene.update(1 / 60, { input });
  assert.equal(scene.model.selectedPresetId, 'elliptical');

  const beforeTime = scene.model.elapsedSeconds;
  input.setState(['KeyP']);
  scene.update(1 / 60, { input });
  assert.equal(scene.isPaused, true);

  input.setState([]);
  scene.update(0.5, { input });
  assert.equal(scene.model.elapsedSeconds, beforeTime);

  input.setState(['KeyP']);
  scene.update(1 / 60, { input });
  assert.equal(scene.isPaused, false);

  input.setState(['KeyR']);
  scene.update(1 / 60, { input });
  assert.equal(scene.model.status, 'live');
}
