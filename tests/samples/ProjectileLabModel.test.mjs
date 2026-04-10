/*
Toolbox Aid
David Quesenberry
03/24/2026
ProjectileLabModel.test.mjs
*/
import assert from 'node:assert/strict';
import ProjectileLabModel from '../../games/ProjectileLab/game/ProjectileLabModel.js';

function testPresetSelectionAndSpawnCounts() {
  const model = new ProjectileLabModel();

  model.selectPreset('single');
  model.fireSelectedPreset();
  assert.equal(model.projectiles.length, 1);

  model.projectiles.length = 0;
  model.selectPreset('burst');
  model.fireSelectedPreset();
  assert.equal(model.projectiles.length, 3);

  model.projectiles.length = 0;
  model.selectPreset('angled');
  model.fireSelectedPreset();
  assert.equal(model.projectiles.length, 1);
  assert.equal(model.projectiles[0].velocityY < 0, true);
}

function testRepeatedFiringStabilityAndCleanup() {
  const model = new ProjectileLabModel();
  model.selectPreset('fast');

  for (let index = 0; index < 180; index += 1) {
    model.update(1 / 60, { fireDown: true });
  }

  assert.equal(model.totalFired > 20, true);
  assert.equal(model.projectiles.length < model.totalFired, true);

  for (let index = 0; index < 300; index += 1) {
    model.update(1 / 60, {});
  }

  assert.equal(model.projectiles.length, 0);
}

function testSlowPresetOutlivesFastPreset() {
  const fastModel = new ProjectileLabModel();
  fastModel.selectPreset('fast');
  fastModel.fireSelectedPreset();

  const slowModel = new ProjectileLabModel();
  slowModel.selectPreset('slow');
  slowModel.fireSelectedPreset();

  for (let index = 0; index < 60; index += 1) {
    fastModel.update(1 / 60, {});
    slowModel.update(1 / 60, {});
  }

  assert.equal(fastModel.projectiles.length, 0);
  assert.equal(slowModel.projectiles.length > 0, true);
}

export function run() {
  testPresetSelectionAndSpawnCounts();
  testRepeatedFiringStabilityAndCleanup();
  testSlowPresetOutlivesFastPreset();
}
