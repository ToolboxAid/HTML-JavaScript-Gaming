/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 GravityWell.test.mjs
*/
import assert from 'node:assert/strict';
import GravityWellWorld from '../../games/GravityWell/game/GravityWellWorld.js';

function createInput(activeKeys = []) {
  const keys = new Set(activeKeys);
  return {
    isDown(code) {
      return keys.has(code);
    },
  };
}

export function run() {
  const gravityWorld = new GravityWellWorld({ width: 960, height: 720 });
  gravityWorld.ship.x = 180;
  gravityWorld.ship.y = 180;
  gravityWorld.ship.vx = 0;
  gravityWorld.ship.vy = 0;
  const beforeDistance = Math.hypot(
    gravityWorld.ship.x - gravityWorld.planets[0].x,
    gravityWorld.ship.y - gravityWorld.planets[0].y,
  );
  gravityWorld.update(0.5, createInput());
  const afterDistance = Math.hypot(
    gravityWorld.ship.x - gravityWorld.planets[0].x,
    gravityWorld.ship.y - gravityWorld.planets[0].y,
  );
  assert.equal(afterDistance < beforeDistance, true);

  const beaconWorld = new GravityWellWorld({ width: 960, height: 720 });
  const beacon = beaconWorld.beacons[0];
  beaconWorld.ship.x = beacon.x;
  beaconWorld.ship.y = beacon.y;
  beaconWorld.ship.vx = 0;
  beaconWorld.ship.vy = 0;
  const beaconResult = beaconWorld.update(0, createInput());
  assert.equal(beaconResult.collectedBeacon, true);
  assert.equal(beacon.collected, true);
  assert.equal(beaconWorld.collectedCount, 1);

  const lossWorld = new GravityWellWorld({ width: 960, height: 720 });
  lossWorld.ship.x = lossWorld.planets[1].x;
  lossWorld.ship.y = lossWorld.planets[1].y;
  lossWorld.ship.vx = 0;
  lossWorld.ship.vy = 0;
  const lossResult = lossWorld.update(0.016, createInput());
  assert.equal(lossResult.status, 'lost');
  assert.equal(lossWorld.status, 'lost');

  const winWorld = new GravityWellWorld({ width: 960, height: 720 });
  winWorld.beacons.slice(0, 2).forEach((target) => {
    target.collected = true;
  });
  winWorld.collectedCount = 2;
  const finalBeacon = winWorld.beacons[2];
  winWorld.ship.x = finalBeacon.x;
  winWorld.ship.y = finalBeacon.y;
  winWorld.ship.vx = 0;
  winWorld.ship.vy = 0;
  const winResult = winWorld.update(0, createInput());
  assert.equal(winResult.status, 'won');
  assert.equal(winWorld.status, 'won');
}
