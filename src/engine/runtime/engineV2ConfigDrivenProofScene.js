/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ConfigDrivenProofScene.js
*/

import { createFirstManifestDrivenPlayableScene } from "./firstManifestDrivenPlayableScene.js";
import { resolveEngineV2Inventory } from "./engineV2InventorySystem.js";
import { processRuntimeDamage } from "./runtimeDamageProcessing.js";
import { processEngineV2Objectives } from "./engineV2ObjectiveSystem.js";
import { evaluateRuntimeOutcomes } from "./runtimeOutcomeProcessing.js";
import { resolveEngineV2GameUi } from "./engineV2UiRuntime.js";
import { validateEngineV2SaveLoadFlow } from "./engineV2SaveLoadValidation.js";

export const ENGINE_V2_PROOF_SCENE_ERRORS = Object.freeze({
  MANIFEST_INVALID: "ENGINE_V2_PROOF_SCENE_MANIFEST_INVALID",
  PLAYABLE_SCENE_FAILED: "ENGINE_V2_PROOF_SCENE_PLAYABLE_SCENE_FAILED",
  EXTENSIONS_MISSING: "ENGINE_V2_PROOF_SCENE_EXTENSIONS_MISSING",
  INVENTORY_FAILED: "ENGINE_V2_PROOF_SCENE_INVENTORY_FAILED",
  COMBAT_FAILED: "ENGINE_V2_PROOF_SCENE_COMBAT_FAILED",
  OBJECTIVES_FAILED: "ENGINE_V2_PROOF_SCENE_OBJECTIVES_FAILED",
  OUTCOMES_FAILED: "ENGINE_V2_PROOF_SCENE_OUTCOMES_FAILED",
  UI_FAILED: "ENGINE_V2_PROOF_SCENE_UI_FAILED",
  SAVE_LOAD_FAILED: "ENGINE_V2_PROOF_SCENE_SAVE_LOAD_FAILED",
});

export function runEngineV2ConfigDrivenProofScene({ manifest, inputEvents, saveDefinition }) {
  const errors = [];

  if (!isRecord(manifest)) {
    errors.push(createProofSceneError(ENGINE_V2_PROOF_SCENE_ERRORS.MANIFEST_INVALID, "Config-driven proof scene requires manifest object.", "manifest"));
  }

  if (!Array.isArray(inputEvents)) {
    errors.push(createProofSceneError(ENGINE_V2_PROOF_SCENE_ERRORS.MANIFEST_INVALID, "Config-driven proof scene requires inputEvents array.", "inputEvents"));
  }

  if (!isRecord(saveDefinition)) {
    errors.push(createProofSceneError(ENGINE_V2_PROOF_SCENE_ERRORS.MANIFEST_INVALID, "Config-driven proof scene requires saveDefinition object.", "saveDefinition"));
  }

  if (errors.length > 0) {
    return createProofSceneResult({ scene: null, frame: null, validation: null, errors });
  }

  const playableResult = createFirstManifestDrivenPlayableScene(manifest, inputEvents);

  if (!playableResult.valid) {
    return createProofSceneResult({
      scene: null,
      frame: null,
      validation: null,
      errors: remapErrors(playableResult.errors, ENGINE_V2_PROOF_SCENE_ERRORS.PLAYABLE_SCENE_FAILED),
    });
  }

  const extensions = manifest.engineV2;

  if (!isRecord(extensions)) {
    return createProofSceneResult({
      scene: null,
      frame: null,
      validation: null,
      errors: [createProofSceneError(ENGINE_V2_PROOF_SCENE_ERRORS.EXTENSIONS_MISSING, "Proof scene manifest requires engineV2 extension data.", "manifest.engineV2")],
    });
  }

  const inventoryResult = resolveEngineV2Inventory(extensions.inventory);

  if (!inventoryResult.valid) {
    return createProofSceneResult({ scene: null, frame: null, validation: null, errors: remapErrors(inventoryResult.errors, ENGINE_V2_PROOF_SCENE_ERRORS.INVENTORY_FAILED) });
  }

  const damageResult = processRuntimeDamage(extensions.combat);

  if (!damageResult.valid) {
    return createProofSceneResult({ scene: null, frame: null, validation: null, errors: remapErrors(damageResult.errors, ENGINE_V2_PROOF_SCENE_ERRORS.COMBAT_FAILED) });
  }

  const objectiveRuntimeState = {
    ...extensions.objectives.runtimeState,
    scores: {
      ...extensions.objectives.runtimeState.scores,
      ...extensions.outcomes.runtimeState.scores,
    },
  };
  const objectiveResult = processEngineV2Objectives({
    ...extensions.objectives,
    runtimeState: objectiveRuntimeState,
  });

  if (!objectiveResult.valid) {
    return createProofSceneResult({ scene: null, frame: null, validation: null, errors: remapErrors(objectiveResult.errors, ENGINE_V2_PROOF_SCENE_ERRORS.OBJECTIVES_FAILED) });
  }

  const outcomeResult = evaluateRuntimeOutcomes(extensions.outcomes);

  if (!outcomeResult.valid) {
    return createProofSceneResult({ scene: null, frame: null, validation: null, errors: remapErrors(outcomeResult.errors, ENGINE_V2_PROOF_SCENE_ERRORS.OUTCOMES_FAILED) });
  }

  const uiRuntimeState = {
    ...extensions.ui.runtimeState,
    inventoryStates: inventoryResult.inventoryStates,
    healthRecords: damageResult.healthRecords,
    scores: extensions.outcomes.runtimeState.scores,
  };
  const uiResult = resolveEngineV2GameUi({
    uiDefinitions: extensions.ui.uiDefinitions,
    runtimeState: uiRuntimeState,
  });

  if (!uiResult.valid) {
    return createProofSceneResult({ scene: null, frame: null, validation: null, errors: remapErrors(uiResult.errors, ENGINE_V2_PROOF_SCENE_ERRORS.UI_FAILED) });
  }

  const runtimeState = {
    ...extensions.saveLoad.runtimeState,
    inventory: inventoryResult.inventoryStates,
    state: {
      ...extensions.saveLoad.runtimeState.state,
      objectives: objectiveResult.objectiveStates,
      health: damageResult.healthRecords,
      runtime: {
        ...extensions.saveLoad.runtimeState.state.runtime,
        matchedOutcomes: outcomeResult.matchedOutcomes,
      },
    },
  };
  const saveLoadResult = validateEngineV2SaveLoadFlow({
    saveDefinition,
    runtimeState,
    shutdownState: extensions.saveLoad.shutdownState,
    loadRequest: extensions.saveLoad.loadRequest,
    continueRequest: extensions.saveLoad.continueRequest,
  });

  if (!saveLoadResult.valid) {
    return createProofSceneResult({ scene: null, frame: null, validation: null, errors: remapErrors(saveLoadResult.errors, ENGINE_V2_PROOF_SCENE_ERRORS.SAVE_LOAD_FAILED) });
  }

  return createProofSceneResult({
    scene: playableResult.scene,
    frame: playableResult.frame,
    validation: Object.freeze({
      inventory: inventoryResult,
      combat: damageResult,
      objectives: objectiveResult,
      outcomes: outcomeResult,
      ui: uiResult,
      saveLoad: saveLoadResult,
    }),
    errors,
  });
}

function createProofSceneResult({ scene, frame, validation, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    scene,
    frame,
    validation,
    errors: Object.freeze(errors),
  });
}

function remapErrors(errors, code) {
  return errors.map((error) => Object.freeze({ code, message: error.message, path: error.path }));
}

function createProofSceneError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
