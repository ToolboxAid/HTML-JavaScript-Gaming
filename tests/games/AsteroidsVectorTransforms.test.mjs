/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 AsteroidsVectorTransforms.test.mjs
*/
import assert from 'node:assert/strict';
import Asteroid from '../../games/Asteroids/entities/Asteroid.js';
import Bullet from '../../games/Asteroids/entities/Bullet.js';
import Ship from '../../games/Asteroids/entities/Ship.js';
import Ufo from '../../games/Asteroids/entities/Ufo.js';
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsObjectGeometry
} from './asteroidsManifestObjectGeometry.mjs';
import {
  getAsteroidsObjectGeometryPoints,
} from '../../games/Asteroids/game/asteroidsObjectGeometryManifest.js';

function assertPointClose(actual, expected) {
  assert.equal(Math.abs(actual.x - expected.x) < 1e-9, true);
  assert.equal(Math.abs(actual.y - expected.y) < 1e-9, true);
}

export function run() {
  const asteroidGeometryProfiles = createAsteroidsTestGeometryProfiles();
  const objectGeometry = loadAsteroidsObjectGeometry();
  const ship = new Ship(100, 200, {
    collisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, 'ship'),
  });
  ship.angle = Math.PI / 2;
  const shipPoints = ship.getPoints();
  assert.equal(shipPoints.length, 6);
  assertPointClose(shipPoints[0], { x: 100, y: 214 });
  assertPointClose(shipPoints[1], { x: 108, y: 190 });
  assertPointClose(shipPoints[4], { x: 92, y: 190 });

  const asteroid = new Asteroid(320, 240, 3, () => 0.5, asteroidGeometryProfiles);
  asteroid.angle = 0;
  asteroid.scale = 1;
  const asteroidPoints = asteroid.getPoints();
  assert.equal(asteroidPoints.length, 12);
  assertPointClose(asteroidPoints[0], { x: 326.5, y: 282.5 });
  assertPointClose(asteroidPoints[5], { x: 346.5, y: 197.5 });

  const bullet = new Bullet(50, 60, 0, 0, 1, {
    collisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, 'bullet'),
  });
  const bulletPoints = bullet.getCollisionPolygon();
  assert.equal(bulletPoints.length, 4);
  assertPointClose(bulletPoints[0], { x: 48, y: 58 });
  assertPointClose(bulletPoints[2], { x: 52, y: 62 });

  const ufo = new Ufo({ width: 960, height: 720 }, 'small', 1, () => 0.5, {
    bulletCollisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, 'bullet'),
    collisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, 'ufoSmall'),
  });
  ufo.x = 400;
  ufo.y = 220;
  const ufoPolygon = ufo.getCollisionPolygon();
  assert.equal(ufoPolygon.length, 15);
  assertPointClose(ufoPolygon[0], { x: 386, y: 223 });
  assertPointClose(ufoPolygon[9], { x: 402, y: 211 });
}
