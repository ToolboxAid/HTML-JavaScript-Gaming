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
  ASTEROIDS_OBJECT_GEOMETRY_IDS,
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
    collisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, ASTEROIDS_OBJECT_GEOMETRY_IDS.ship),
  });
  ship.angle = Math.PI / 2;
  const shipPoints = ship.getPoints();
  assert.equal(shipPoints.length, 6);
  assertPointClose(shipPoints[0], { x: 104, y: 194 });
  assertPointClose(shipPoints[1], { x: 96, y: 194 });
  assertPointClose(shipPoints[4], { x: 108, y: 190 });

  const asteroid = new Asteroid(320, 240, 3, () => 0.5, asteroidGeometryProfiles);
  asteroid.angle = 0;
  asteroid.scale = 1;
  const asteroidPoints = asteroid.getPoints();
  assert.equal(asteroidPoints.length, 10);
  assertPointClose(asteroidPoints[0], { x: 320, y: 256 });
  assertPointClose(asteroidPoints[5], { x: 328, y: 208 });

  const bullet = new Bullet(50, 60, 0, 0, 1, {
    collisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, ASTEROIDS_OBJECT_GEOMETRY_IDS.bullet),
  });
  const bulletPoints = bullet.getCollisionPolygon();
  assert.equal(bulletPoints.length, 4);
  assertPointClose(bulletPoints[0], { x: 50.5, y: 61.5 });
  assertPointClose(bulletPoints[2], { x: 48.5, y: 63.5 });
  const angledBullet = new Bullet(50, 60, 0, 0, 1, {
    angle: Math.PI / 3,
    collisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, ASTEROIDS_OBJECT_GEOMETRY_IDS.bullet),
  });
  assert.equal(angledBullet.angle, Math.PI / 3);
  const angledBulletPoints = angledBullet.getCollisionPolygon();
  assertPointClose(angledBulletPoints[0], { x: 48.95096189432334, y: 61.18301270189222 });
  assertPointClose(angledBulletPoints[2], { x: 46.21891108675447, y: 60.45096189432334 });

  const ufo = new Ufo({ width: 960, height: 720 }, 'small', 1, () => 0.5, {
    bulletCollisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, ASTEROIDS_OBJECT_GEOMETRY_IDS.bullet),
    collisionPoints: getAsteroidsObjectGeometryPoints(objectGeometry, ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoSmall),
  });
  ufo.x = 400;
  ufo.y = 220;
  const ufoPolygon = ufo.getCollisionPolygon();
  assert.equal(ufoPolygon.length, 10);
  assertPointClose(ufoPolygon[0], { x: 390, y: 222 });
  assertPointClose(ufoPolygon[9], { x: 410, y: 222 });
}
