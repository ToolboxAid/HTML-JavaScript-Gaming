/*
Toolbox Aid
David Quesenberry
03/24/2026
OrbitLabModel.test.mjs
*/
import assert from 'node:assert/strict';
import OrbitLabModel from '../../games/Orbit/game/OrbitLabModel.js';

function testPresetBehaviorOrdering() {
  const stable = new OrbitLabModel();
  stable.selectPreset('stable');
  for (let index = 0; index < 360; index += 1) {
    stable.update(1 / 60, {});
  }

  const elliptical = new OrbitLabModel();
  elliptical.selectPreset('elliptical');
  for (let index = 0; index < 360; index += 1) {
    elliptical.update(1 / 60, {});
  }

  const falling = new OrbitLabModel();
  falling.selectPreset('fall');
  for (let index = 0; index < 360; index += 1) {
    falling.update(1 / 60, {});
    if (falling.status !== 'live') {
      break;
    }
  }

  const escaping = new OrbitLabModel();
  escaping.selectPreset('escape');
  for (let index = 0; index < 360; index += 1) {
    escaping.update(1 / 60, {});
    if (escaping.status !== 'live') {
      break;
    }
  }

  const stableSpread = stable.maxDistance - stable.minDistance;
  const ellipticalSpread = elliptical.maxDistance - elliptical.minDistance;
  assert.equal(stableSpread < ellipticalSpread, true);
  assert.equal(falling.status === 'absorbed', true);
  assert.equal(escaping.status === 'escaped', true);
}

function testMotionStabilityLongRun() {
  const model = new OrbitLabModel();
  model.selectPreset('stable');

  for (let index = 0; index < 1200; index += 1) {
    model.update(1 / 120, {});
    assert.equal(Number.isFinite(model.body.x), true);
    assert.equal(Number.isFinite(model.body.y), true);
    assert.equal(Number.isFinite(model.body.vx), true);
    assert.equal(Number.isFinite(model.body.vy), true);
    assert.equal(Number.isFinite(model.lastAcceleration.x), true);
    assert.equal(Number.isFinite(model.lastAcceleration.y), true);
    assert.equal(model.trail.length <= 220, true);
    if (model.status !== 'live') {
      break;
    }
  }

  assert.equal(model.minDistance > model.world.attractor.radius, true);
}

function testResetRestoresPresetInitialState() {
  const model = new OrbitLabModel();
  model.selectPreset('elliptical');
  const initialX = model.body.x;
  const initialY = model.body.y;

  model.update(1, {});
  model.update(0, { resetPressed: true });

  assert.equal(model.body.x, initialX);
  assert.equal(model.body.y, initialY);
  assert.equal(model.status, 'live');
}

export function run() {
  testPresetBehaviorOrdering();
  testMotionStabilityLongRun();
  testResetRestoresPresetInitialState();
}
