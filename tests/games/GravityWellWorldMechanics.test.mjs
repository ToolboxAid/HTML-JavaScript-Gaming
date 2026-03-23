/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 GravityWellWorldMechanics.test.mjs
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

function assertClose(actual, expected, tolerance = 1e-6) {
  assert.equal(Math.abs(actual - expected) <= tolerance, true);
}

export function run() {
  const gravityOnlyWorld = new GravityWellWorld({ width: 960, height: 720 });
  gravityOnlyWorld.ship.x = 180;
  gravityOnlyWorld.ship.y = 180;
  gravityOnlyWorld.ship.vx = 0;
  gravityOnlyWorld.ship.vy = 0;
  const gravityBaselineDistance = Math.hypot(
    gravityOnlyWorld.ship.x - gravityOnlyWorld.planets[0].x,
    gravityOnlyWorld.ship.y - gravityOnlyWorld.planets[0].y,
  );
  gravityOnlyWorld.update(0.5, createInput());
  const gravityAfterDistance = Math.hypot(
    gravityOnlyWorld.ship.x - gravityOnlyWorld.planets[0].x,
    gravityOnlyWorld.ship.y - gravityOnlyWorld.planets[0].y,
  );
  assert.equal(gravityAfterDistance < gravityBaselineDistance, true);
  assert.equal(gravityOnlyWorld.lastGravity.x > 0, true);
  assert.equal(gravityOnlyWorld.lastGravity.y > 0, true);

  const thrustOnlyWorld = new GravityWellWorld({ width: 960, height: 720 });
  thrustOnlyWorld.planets = [];
  thrustOnlyWorld.ship.x = 420;
  thrustOnlyWorld.ship.y = 360;
  thrustOnlyWorld.ship.vx = 0;
  thrustOnlyWorld.ship.vy = 0;
  thrustOnlyWorld.ship.angle = 0;
  thrustOnlyWorld.update(0.25, createInput(['ArrowUp']));
  assert.equal(thrustOnlyWorld.ship.vx, 0);
  assert.equal(thrustOnlyWorld.ship.vy < 0, true);
  assert.equal(thrustOnlyWorld.ship.thrusting, true);
  assertClose(thrustOnlyWorld.lastGravity.x, 0);
  assertClose(thrustOnlyWorld.lastGravity.y, -210);

  const combinedWorld = new GravityWellWorld({ width: 960, height: 720 });
  combinedWorld.planets = [
    { x: 400, y: 200, radius: 20, strength: 100000, color: '#fff' },
  ];
  combinedWorld.ship.x = 200;
  combinedWorld.ship.y = 200;
  combinedWorld.ship.vx = 0;
  combinedWorld.ship.vy = 0;
  combinedWorld.ship.angle = 0;
  combinedWorld.update(0.25, createInput(['ArrowUp']));
  assert.equal(combinedWorld.ship.vx > 0, true);
  assert.equal(combinedWorld.ship.vy < 0, true);
  assert.equal(combinedWorld.lastGravity.x > 0, true);
  assert.equal(combinedWorld.lastGravity.y < 0, true);

  const brakeWorld = new GravityWellWorld({ width: 960, height: 720 });
  brakeWorld.planets = [];
  brakeWorld.ship.vx = 100;
  brakeWorld.ship.vy = -50;
  brakeWorld.update(0.25, createInput(['Space']));
  assert.equal(brakeWorld.getShipSpeed() < Math.hypot(100, -50), true);
  assert.equal(brakeWorld.ship.vx > 0, true);
  assert.equal(brakeWorld.ship.vy < 0, true);
  assertClose(brakeWorld.ship.vx / brakeWorld.ship.vy, -2, 1e-6);

  const clampedWorld = new GravityWellWorld({ width: 960, height: 720 });
  clampedWorld.planets = [];
  clampedWorld.ship.vx = 1000;
  clampedWorld.ship.vy = 1000;
  clampedWorld.update(0, createInput());
  assert.equal(clampedWorld.getShipSpeed() <= 450.000001, true);
  assertClose(clampedWorld.getShipSpeed(), 450, 1e-4);

  const thresholdWorld = new GravityWellWorld({ width: 960, height: 720 });
  thresholdWorld.planets = [];
  const thresholdBeacon = thresholdWorld.beacons[0];
  thresholdWorld.ship.x = thresholdBeacon.x + thresholdWorld.ship.radius + thresholdBeacon.radius + 2;
  thresholdWorld.ship.y = thresholdBeacon.y;
  thresholdWorld.ship.vx = 0;
  thresholdWorld.ship.vy = 0;
  const thresholdResult = thresholdWorld.update(0, createInput());
  assert.equal(thresholdResult.collectedBeacon, true);
  assert.equal(thresholdBeacon.collected, true);
  assert.equal(thresholdWorld.collectedCount, 1);

  const outsideBoundaryWorld = new GravityWellWorld({ width: 960, height: 720 });
  outsideBoundaryWorld.planets = [];
  const outsideBeacon = outsideBoundaryWorld.beacons[0];
  outsideBoundaryWorld.ship.x = outsideBeacon.x + outsideBoundaryWorld.ship.radius + outsideBeacon.radius + 2.01;
  outsideBoundaryWorld.ship.y = outsideBeacon.y;
  outsideBoundaryWorld.ship.vx = 0;
  outsideBoundaryWorld.ship.vy = 0;
  const outsideResult = outsideBoundaryWorld.update(0, createInput());
  assert.equal(outsideResult.collectedBeacon, false);
  assert.equal(outsideBeacon.collected, false);
  assert.equal(outsideBoundaryWorld.collectedCount, 0);
  assert.equal(outsideBoundaryWorld.status, 'running');

  const noDoubleCountWorld = new GravityWellWorld({ width: 960, height: 720 });
  noDoubleCountWorld.planets = [];
  const noDoubleCountBeacon = noDoubleCountWorld.beacons[0];
  noDoubleCountWorld.ship.x = noDoubleCountBeacon.x;
  noDoubleCountWorld.ship.y = noDoubleCountBeacon.y;
  noDoubleCountWorld.ship.vx = 0;
  noDoubleCountWorld.ship.vy = 0;
  const firstCollect = noDoubleCountWorld.update(0, createInput());
  const secondCollect = noDoubleCountWorld.update(0, createInput());
  assert.equal(firstCollect.collectedBeacon, true);
  assert.equal(secondCollect.collectedBeacon, false);
  assert.equal(noDoubleCountWorld.collectedCount, 1);

  const winWorld = new GravityWellWorld({ width: 960, height: 720 });
  winWorld.planets = [];
  winWorld.beacons.slice(0, 2).forEach((beacon) => {
    beacon.collected = true;
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
  assert.equal(finalBeacon.collected, true);
  assert.equal(winWorld.collectedCount, 3);

  const planetLossWorld = new GravityWellWorld({ width: 960, height: 720 });
  planetLossWorld.ship.x = planetLossWorld.planets[1].x;
  planetLossWorld.ship.y = planetLossWorld.planets[1].y;
  planetLossWorld.ship.vx = 0;
  planetLossWorld.ship.vy = 0;
  const planetLossResult = planetLossWorld.update(0.016, createInput());
  assert.equal(planetLossResult.status, 'lost');
  assert.equal(planetLossWorld.status, 'lost');

  const outOfBoundsWorld = new GravityWellWorld({ width: 960, height: 720 });
  outOfBoundsWorld.planets = [];
  outOfBoundsWorld.ship.x = outOfBoundsWorld.width + 91;
  outOfBoundsWorld.ship.y = 300;
  outOfBoundsWorld.ship.vx = 0;
  outOfBoundsWorld.ship.vy = 0;
  const outOfBoundsResult = outOfBoundsWorld.update(0, createInput());
  assert.equal(outOfBoundsResult.status, 'lost');
  assert.equal(outOfBoundsWorld.status, 'lost');

  const orderingWorld = new GravityWellWorld({ width: 960, height: 720 });
  orderingWorld.planets = [
    { x: 300, y: 300, radius: 30, strength: 0, color: '#fff' },
  ];
  orderingWorld.beacons = [
    { x: 300, y: 300, radius: 14, color: '#fff', collected: false },
  ];
  orderingWorld.ship.x = 300;
  orderingWorld.ship.y = 300;
  orderingWorld.ship.vx = 0;
  orderingWorld.ship.vy = 0;
  const orderingResult = orderingWorld.update(0, createInput());
  assert.equal(orderingResult.status, 'lost');
  assert.equal(orderingResult.collectedBeacon, false);
  assert.equal(orderingWorld.status, 'lost');
  assert.equal(orderingWorld.beacons[0].collected, false);
  assert.equal(orderingWorld.collectedCount, 0);
}
