/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeMultiSceneLoading.js
*/

import { readManifestSceneDefinitions } from "./runtimeSceneDefinitionSupport.js";

export const RUNTIME_MULTI_SCENE_LOADING_ERRORS = Object.freeze({
  SCENE_DEFINITIONS_INVALID: "RUNTIME_SCENE_DEFINITIONS_INVALID",
  SCENE_ID_REQUIRED: "RUNTIME_SCENE_LOAD_ID_REQUIRED",
  SCENE_MISSING: "RUNTIME_SCENE_MISSING",
  TRANSITION_SOURCE_MISSING: "RUNTIME_SCENE_TRANSITION_SOURCE_MISSING",
  TRANSITION_TARGET_MISSING: "RUNTIME_SCENE_TRANSITION_TARGET_MISSING",
  TRANSITION_NOT_DECLARED: "RUNTIME_SCENE_TRANSITION_NOT_DECLARED",
});

export function createRuntimeSceneRegistry(manifest) {
  const sceneResult = readManifestSceneDefinitions(manifest);

  if (!sceneResult.valid) {
    return createSceneRegistryResult({
      sceneRegistry: null,
      scene: null,
      transition: null,
      errors: sceneResult.errors,
    });
  }

  return createSceneRegistryResult({
    sceneRegistry: Object.freeze({
      scenes: Object.freeze(sceneResult.sceneDefinitions),
      sceneIds: Object.freeze(sceneResult.sceneDefinitions.map((scene) => scene.sceneId)),
    }),
    scene: null,
    transition: null,
    errors: [],
  });
}

export function loadRuntimeScene(sceneRegistry, sceneId) {
  const errors = validateSceneRegistry(sceneRegistry);

  if (!hasNonEmptyString(sceneId)) {
    errors.push(createMultiSceneLoadingError(
      RUNTIME_MULTI_SCENE_LOADING_ERRORS.SCENE_ID_REQUIRED,
      "Runtime scene loading requires explicit sceneId.",
      "sceneId"
    ));
  }

  if (errors.length > 0) {
    return createSceneRegistryResult({ sceneRegistry, scene: null, transition: null, errors });
  }

  const scene = sceneRegistry.scenes.find((item) => item.sceneId === sceneId.trim());

  if (!scene) {
    return createSceneRegistryResult({
      sceneRegistry,
      scene: null,
      transition: null,
      errors: [
        createMultiSceneLoadingError(
          RUNTIME_MULTI_SCENE_LOADING_ERRORS.SCENE_MISSING,
          "Runtime scene loading could not find sceneId.",
          "sceneId"
        ),
      ],
    });
  }

  return createSceneRegistryResult({ sceneRegistry, scene, transition: null, errors: [] });
}

export function validateRuntimeSceneTransition(sceneRegistry, fromSceneId, toSceneId) {
  const errors = validateSceneRegistry(sceneRegistry);

  if (errors.length > 0) {
    return createSceneRegistryResult({ sceneRegistry, scene: null, transition: null, errors });
  }

  const sourceScene = sceneRegistry.scenes.find((scene) => scene.sceneId === fromSceneId);
  const targetScene = sceneRegistry.scenes.find((scene) => scene.sceneId === toSceneId);

  if (!sourceScene) {
    errors.push(createMultiSceneLoadingError(
      RUNTIME_MULTI_SCENE_LOADING_ERRORS.TRANSITION_SOURCE_MISSING,
      "Runtime scene transition source is missing.",
      "fromSceneId"
    ));
  }

  if (!targetScene) {
    errors.push(createMultiSceneLoadingError(
      RUNTIME_MULTI_SCENE_LOADING_ERRORS.TRANSITION_TARGET_MISSING,
      "Runtime scene transition target is missing.",
      "toSceneId"
    ));
  }

  if (sourceScene && targetScene && !sourceScene.transitionIds.includes(targetScene.sceneId)) {
    errors.push(createMultiSceneLoadingError(
      RUNTIME_MULTI_SCENE_LOADING_ERRORS.TRANSITION_NOT_DECLARED,
      "Runtime scene transition must be declared by the source scene.",
      "transitionIds"
    ));
  }

  if (errors.length > 0) {
    return createSceneRegistryResult({ sceneRegistry, scene: null, transition: null, errors });
  }

  return createSceneRegistryResult({
    sceneRegistry,
    scene: targetScene,
    transition: Object.freeze({ fromSceneId, toSceneId }),
    errors: [],
  });
}

function validateSceneRegistry(sceneRegistry) {
  if (sceneRegistry && Array.isArray(sceneRegistry.scenes)) {
    return [];
  }

  return [
    createMultiSceneLoadingError(
      RUNTIME_MULTI_SCENE_LOADING_ERRORS.SCENE_DEFINITIONS_INVALID,
      "Runtime scene registry is invalid.",
      "sceneRegistry"
    ),
  ];
}

function createSceneRegistryResult({ sceneRegistry, scene, transition, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    sceneRegistry,
    scene,
    transition,
    errors: Object.freeze(errors),
  });
}

function createMultiSceneLoadingError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
