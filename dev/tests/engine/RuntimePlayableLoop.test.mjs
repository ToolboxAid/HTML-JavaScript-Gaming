/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimePlayableLoop.test.mjs
*/
import assert from "node:assert/strict";
import { runRuntimePlayableFrame } from "../../../www/src/engine/runtime/runtimePlayableLoop.js";

export function run() {
  const world = Object.freeze({
    runtimeObjects: Object.freeze([
      Object.freeze({
        instanceId: "player.1",
        objectType: "dynamic",
        geometryRef: "geometry.player",
        position: Object.freeze({ x: 1, y: 1 }),
        previousPosition: Object.freeze({ x: 1, y: 1 }),
        size: Object.freeze({ width: 1, height: 1 }),
        velocity: Object.freeze({ x: 0, y: 0 }),
      }),
    ]),
    terrainMaterials: Object.freeze([
      Object.freeze({ materialId: "grass", passable: true, blocked: false, slide: null, friction: 0.1 }),
    ]),
    terrainAssignments: Object.freeze({ "player.1": "grass" }),
    terrainTiles: Object.freeze([]),
    environmentForces: Object.freeze([
      Object.freeze({ forceId: "wind", forceType: "wind", vector: Object.freeze({ x: 1, y: 0 }), strength: 1 }),
    ]),
    renderState: Object.freeze({
      targetId: "runtime-canvas",
      width: 320,
      height: 180,
      frame: 0,
      commands: Object.freeze([]),
    }),
    inputPipeline: Object.freeze({
      bindings: Object.freeze([
        Object.freeze({
          actionId: "move.right",
          keys: Object.freeze(["ArrowRight"]),
          targetInstanceId: "player.1",
          velocity: Object.freeze({ x: 10, y: 0 }),
        }),
      ]),
    }),
    fixedDeltaMs: 100,
  });
  const result = runRuntimePlayableFrame(world, [{ key: "ArrowRight", pressed: true }]);

  assert.equal(result.valid, true);
  assert.equal(result.frame.tick.frame, 0);
  assert.equal(result.world.tick.frame, 0);
  assert.equal(result.frame.actions.length, 1);
  assert.equal(result.frame.renderCommands.length, 1);
  assert.equal(result.world.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1").position.x > 1, true);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
