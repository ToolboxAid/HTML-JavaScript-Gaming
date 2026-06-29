/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ConfigDrivenProofScene.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_PROOF_SCENE_ERRORS,
  runEngineV2ConfigDrivenProofScene,
} from "../../../www/src/engine/runtime/engineV2ConfigDrivenProofScene.js";
import { createEngineV2FeatureCompleteFixture } from "./EngineV2FeatureCompleteFixture.mjs";

export function run() {
  const fixture = createEngineV2FeatureCompleteFixture().proofScene;
  const result = runEngineV2ConfigDrivenProofScene(fixture);

  assert.equal(result.valid, true);
  assert.equal(result.scene.runtimeObjects.length, 3);
  assert.equal(result.frame.actions[0].actionId, "move.right");
  assert.equal(result.validation.inventory.inventoryStates[0].slots.find((slot) => slot.itemId === "item.gem").quantity, 3);
  assert.equal(result.validation.combat.damageEvents[0].alive, false);
  assert.deepEqual(result.validation.objectives.objectiveCompletions.map((objective) => objective.objectiveId), ["objective.collect.gems", "objective.defeat.bumblebee"]);
  assert.deepEqual(result.validation.outcomes.matchedOutcomes.map((outcome) => outcome.outcomeType), ["win", "lose"]);
  assert.deepEqual(result.validation.ui.uiCommands.map((command) => command.widgetType), ["healthBar", "score", "inventory"]);
  assert.deepEqual(result.validation.saveLoad.flowEvents.map((event) => event.flowStep), ["save", "shutdown", "load", "continue"]);

  const invalidManifestResult = runEngineV2ConfigDrivenProofScene({
    ...fixture,
    manifest: {
      ...fixture.manifest,
      engineV2: undefined,
    },
  });

  assert.equal(invalidManifestResult.valid, false);
  assert.deepEqual(invalidManifestResult.errors.map((error) => error.code), [ENGINE_V2_PROOF_SCENE_ERRORS.EXTENSIONS_MISSING]);

  const invalidSaveLoadResult = runEngineV2ConfigDrivenProofScene({
    ...fixture,
    manifest: {
      ...fixture.manifest,
      engineV2: {
        ...fixture.manifest.engineV2,
        saveLoad: {
          ...fixture.manifest.engineV2.saveLoad,
          shutdownState: { state: { leaked: true } },
        },
      },
    },
  });

  assert.equal(invalidSaveLoadResult.valid, false);
  assert.deepEqual(invalidSaveLoadResult.errors.map((error) => error.code), [ENGINE_V2_PROOF_SCENE_ERRORS.SAVE_LOAD_FAILED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
