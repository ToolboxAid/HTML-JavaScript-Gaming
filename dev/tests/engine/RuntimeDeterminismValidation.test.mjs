/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeDeterminismValidation.test.mjs
*/
import assert from "node:assert/strict";
import { createFirstManifestDrivenPlayableScene } from "../../../www/src/engine/runtime/firstManifestDrivenPlayableScene.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const inputEvents = Object.freeze([
    Object.freeze({ key: "ArrowRight", pressed: true }),
  ]);
  const firstRun = createFirstManifestDrivenPlayableScene(manifest, inputEvents);
  const secondRun = createFirstManifestDrivenPlayableScene(manifest, inputEvents);

  assert.equal(firstRun.valid, true);
  assert.equal(secondRun.valid, true);
  assert.deepEqual(secondRun.frame, firstRun.frame);
  assert.deepEqual(secondRun.scene.runtimeObjects, firstRun.scene.runtimeObjects);
  assert.deepEqual(secondRun.scene.renderState.commands, firstRun.scene.renderState.commands);

  const player = firstRun.scene.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1");
  assert.equal(Number(player.position.x.toFixed(4)), 1.9999);
  assert.equal(Number(player.position.y.toFixed(5)), 1.09702);
  assert.equal(firstRun.frame.actions[0].actionId, "move.right");
  assert.equal(firstRun.frame.renderCommands[0].instanceId, "player.1");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
