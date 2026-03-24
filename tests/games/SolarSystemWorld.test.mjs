/*
Toolbox Aid
David Quesenberry
03/24/2026
SolarSystemWorld.test.mjs
*/
import assert from 'node:assert/strict';
import SolarSystemWorld from '../../games/SolarSystem/game/SolarSystemWorld.js';

function createControls(overrides = {}) {
  return {
    resetPressed: false,
    toggleLabelsPressed: false,
    timeScaleIndex: null,
    ...overrides,
  };
}

function testBodyCountsAndInitialState() {
  const world = new SolarSystemWorld({ width: 960, height: 720 });
  assert.equal(world.planets.length, 8);
  assert.equal(world.moons.length >= 5, true);
  assert.equal(world.labelsVisible, true);
  assert.equal(world.getTimeScale().label, 'x2');
}

function testTimeAdvanceMovesBodiesStably() {
  const world = new SolarSystemWorld({ width: 960, height: 720 });
  const earthBefore = world.planets.find((body) => body.id === 'earth');
  const startX = earthBefore.x;
  const startY = earthBefore.y;

  world.update(2, createControls());
  const earthAfter = world.planets.find((body) => body.id === 'earth');
  assert.equal(earthAfter.x !== startX || earthAfter.y !== startY, true);

  for (let index = 0; index < 1200; index += 1) {
    world.update(1 / 60, createControls());
    world.planets.forEach((body) => {
      assert.equal(Number.isFinite(body.x), true);
      assert.equal(Number.isFinite(body.y), true);
    });
    world.moons.forEach((body) => {
      assert.equal(Number.isFinite(body.x), true);
      assert.equal(Number.isFinite(body.y), true);
    });
  }
}

function testTimeControlsAndReset() {
  const world = new SolarSystemWorld({ width: 960, height: 720 });
  world.update(1, createControls({ timeScaleIndex: 3 }));
  assert.equal(world.getTimeScale().label, 'x4');
  assert.equal(world.elapsedDays >= 4, true);

  world.update(0, createControls({ toggleLabelsPressed: true }));
  assert.equal(world.labelsVisible, false);

  world.update(0, createControls({ resetPressed: true }));
  assert.equal(world.elapsedDays, 0);
  assert.equal(world.labelsVisible, false);
}

export function run() {
  testBodyCountsAndInitialState();
  testTimeAdvanceMovesBodiesStably();
  testTimeControlsAndReset();
}
