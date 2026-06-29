/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeCollisionProcessing.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_COLLISION_ERRORS,
  processRuntimeCollisions,
} from "../../../www/src/engine/runtime/runtimeCollisionProcessing.js";

export function run() {
  const terrainTiles = [
    Object.freeze({
      tileId: "tile.wall.1",
      material: Object.freeze({ blocked: true, passable: false }),
      bounds: Object.freeze({ x: 10, y: 1, width: 1, height: 1 }),
    }),
  ];
  const runtimeObjects = [
    Object.freeze({
      instanceId: "player.1",
      objectType: "dynamic",
      position: Object.freeze({ x: 1, y: 1 }),
      previousPosition: Object.freeze({ x: 1, y: 1 }),
      size: Object.freeze({ width: 1, height: 1 }),
      velocity: Object.freeze({ x: 0, y: 0 }),
    }),
  ];
  const collidingObjects = runtimeObjects.map((runtimeObject) => runtimeObject.instanceId === "player.1"
    ? Object.freeze({ ...runtimeObject, position: Object.freeze({ x: 10, y: 1 }), previousPosition: Object.freeze({ x: 9, y: 1 }) })
    : runtimeObject);
  const result = processRuntimeCollisions(collidingObjects, terrainTiles);

  assert.equal(result.valid, true);
  assert.equal(result.collisions.some((collision) => collision.collisionType === "blockedTerrain"), true);
  assert.deepEqual(result.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1").position, { x: 9, y: 1 });

  const invalidResult = processRuntimeCollisions(runtimeObjects, "bad");
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_COLLISION_ERRORS.TILES_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
