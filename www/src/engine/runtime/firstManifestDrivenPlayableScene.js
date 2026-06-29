/*
Toolbox Aid
David Quesenberry
06/02/2026
firstManifestDrivenPlayableScene.js
*/

import { attachRuntimeRules } from "./runtimeRuleAttachment.js";
import { composeRuntimeBehavior } from "./runtimeBehaviorComposition.js";
import { createRuntimeInputPipeline } from "./runtimeInputPipeline.js";
import { createRuntimeObjectRecords } from "./runtimeObjectRecordFactory.js";
import { createRuntimeRenderingBootstrap } from "./runtimeRenderingBootstrap.js";
import { instantiateEnvironmentForces } from "./runtimeEnvironmentForceInstantiation.js";
import { instantiateRuntimeObjects } from "./runtimeObjectInstantiation.js";
import { instantiateTerrainMaterials } from "./runtimeTerrainMaterialInstantiation.js";
import { parseManifestRuntimePayload } from "./manifestRuntimeParser.js";
import { readManifestObjectDefinitions } from "./objectDefinitionReader.js";
import { readManifestRuleDefinitions } from "./ruleDefinitionReader.js";
import { runRuntimePlayableFrame } from "./runtimePlayableLoop.js";

export const FIRST_MANIFEST_DRIVEN_SCENE_ERRORS = Object.freeze({
  MANIFEST_INVALID: "FIRST_MANIFEST_SCENE_MANIFEST_INVALID",
  OBJECT_DEFINITIONS_INVALID: "FIRST_MANIFEST_SCENE_OBJECT_DEFINITIONS_INVALID",
  OBJECT_RECORDS_INVALID: "FIRST_MANIFEST_SCENE_OBJECT_RECORDS_INVALID",
  OBJECTS_INVALID: "FIRST_MANIFEST_SCENE_OBJECTS_INVALID",
  TERRAIN_INVALID: "FIRST_MANIFEST_SCENE_TERRAIN_INVALID",
  ENVIRONMENT_INVALID: "FIRST_MANIFEST_SCENE_ENVIRONMENT_INVALID",
  RULES_INVALID: "FIRST_MANIFEST_SCENE_RULES_INVALID",
  RULE_ATTACHMENT_INVALID: "FIRST_MANIFEST_SCENE_RULE_ATTACHMENT_INVALID",
  COMPOSITION_INVALID: "FIRST_MANIFEST_SCENE_COMPOSITION_INVALID",
  RENDER_INVALID: "FIRST_MANIFEST_SCENE_RENDER_INVALID",
  INPUT_INVALID: "FIRST_MANIFEST_SCENE_INPUT_INVALID",
  PLAYABLE_FRAME_INVALID: "FIRST_MANIFEST_SCENE_PLAYABLE_FRAME_INVALID",
});

export function createFirstManifestDrivenPlayableScene(manifest, inputEvents = []) {
  const manifestResult = parseManifestRuntimePayload(manifest, { sourcePath: "manifest-driven-scene" });

  if (!manifestResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(manifestResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.MANIFEST_INVALID) });
  }

  const objectDefinitionResult = readManifestObjectDefinitions(manifestResult.manifest);

  if (!objectDefinitionResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(objectDefinitionResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.OBJECT_DEFINITIONS_INVALID) });
  }

  const objectRecordResult = createRuntimeObjectRecords(objectDefinitionResult.objectDefinitions);

  if (!objectRecordResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(objectRecordResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.OBJECT_RECORDS_INVALID) });
  }

  const objectResult = instantiateRuntimeObjects(objectRecordResult.records, manifest.objectInstances);

  if (!objectResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(objectResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.OBJECTS_INVALID) });
  }

  const terrainResult = instantiateTerrainMaterials(manifest.terrainMaterials);

  if (!terrainResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(terrainResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.TERRAIN_INVALID) });
  }

  const environmentResult = instantiateEnvironmentForces(manifest.environmentForces);

  if (!environmentResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(environmentResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.ENVIRONMENT_INVALID) });
  }

  const ruleResult = readManifestRuleDefinitions(manifestResult.manifest);

  if (!ruleResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(ruleResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.RULES_INVALID) });
  }

  const attachmentResult = attachRuntimeRules(objectResult.runtimeObjects, ruleResult.ruleDefinitions);

  if (!attachmentResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(attachmentResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.RULE_ATTACHMENT_INVALID) });
  }

  const compositionResult = composeRuntimeBehavior({
    runtimeObjects: attachmentResult.runtimeObjects,
    terrainMaterials: terrainResult.terrainMaterials,
    environmentForces: environmentResult.environmentForces,
    terrainAssignments: manifest.terrainAssignments,
  });

  if (!compositionResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(compositionResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.COMPOSITION_INVALID) });
  }

  const renderResult = createRuntimeRenderingBootstrap(manifest.rendering);

  if (!renderResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(renderResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.RENDER_INVALID) });
  }

  const inputResult = createRuntimeInputPipeline(manifest.inputBindings);

  if (!inputResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(inputResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.INPUT_INVALID) });
  }

  const scene = Object.freeze({
    runtimeObjects: attachmentResult.runtimeObjects,
    terrainMaterials: terrainResult.terrainMaterials,
    terrainAssignments: Object.freeze({ ...manifest.terrainAssignments }),
    terrainTiles: Object.freeze(manifest.terrainTiles),
    environmentForces: environmentResult.environmentForces,
    behaviorCompositions: compositionResult.compositions,
    renderState: renderResult.renderState,
    inputPipeline: inputResult.inputPipeline,
    fixedDeltaMs: manifest.fixedDeltaMs,
  });
  const frameResult = runRuntimePlayableFrame(scene, inputEvents);

  if (!frameResult.valid) {
    return createSceneResult({ scene: null, frame: null, errors: remapErrors(frameResult.errors, FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.PLAYABLE_FRAME_INVALID) });
  }

  return createSceneResult({ scene: frameResult.world, frame: frameResult.frame, errors: [] });
}

function createSceneResult({ scene, frame, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    scene,
    frame,
    errors: Object.freeze(errors),
  });
}

function remapErrors(errors, code) {
  return errors.map((error) => Object.freeze({ code, message: error.message, path: error.path }));
}
