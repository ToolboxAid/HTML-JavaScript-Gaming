/*
Toolbox Aid
David Quesenberry
03/24/2026
ProjectileLabScene.test.mjs
*/
import assert from 'node:assert/strict';
import ProjectileLabScene from '../../samples/phase-02/0225/game/ProjectileLabScene.js';

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
  const scene = new ProjectileLabScene();

  input.setState(['Digit4', 'Space']);
  scene.update(1 / 60, { input });
  assert.equal(scene.model.selectedPresetId, 'burst');
  assert.equal(scene.model.projectiles.length, 3);

  input.setState(['KeyP']);
  scene.update(1 / 60, { input });
  assert.equal(scene.isPaused, true);

  const pausedCount = scene.model.projectiles.length;
  input.setState(['Space']);
  scene.update(1 / 60, { input });
  assert.equal(scene.model.projectiles.length, pausedCount);

  input.setState([]);
  scene.update(1 / 60, { input });
  input.setState(['KeyP']);
  scene.update(1 / 60, { input });
  assert.equal(scene.isPaused, false);
}
