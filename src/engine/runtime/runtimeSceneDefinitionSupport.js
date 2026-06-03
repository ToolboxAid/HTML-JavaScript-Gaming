/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeSceneDefinitionSupport.js
*/

export const RUNTIME_SCENE_DEFINITION_ERRORS = Object.freeze({
  SCENES_INVALID: "RUNTIME_SCENE_DEFINITIONS_INVALID",
  SCENE_ID_REQUIRED: "RUNTIME_SCENE_ID_REQUIRED",
  OBJECT_INSTANCES_INVALID: "RUNTIME_SCENE_OBJECT_INSTANCES_INVALID",
  TERRAIN_ASSIGNMENTS_INVALID: "RUNTIME_SCENE_TERRAIN_ASSIGNMENTS_INVALID",
  TERRAIN_TILES_INVALID: "RUNTIME_SCENE_TERRAIN_TILES_INVALID",
  ENVIRONMENT_FORCE_IDS_INVALID: "RUNTIME_SCENE_ENVIRONMENT_FORCE_IDS_INVALID",
  TRANSITION_IDS_INVALID: "RUNTIME_SCENE_TRANSITION_IDS_INVALID",
});

export function readManifestSceneDefinitions(manifest) {
  const errors = [];
  const scenes = manifest?.scenes;

  if (!Array.isArray(scenes)) {
    errors.push(createSceneDefinitionError(
      RUNTIME_SCENE_DEFINITION_ERRORS.SCENES_INVALID,
      "Manifest scenes must be an explicit array of scene records.",
      "scenes"
    ));
    return createSceneDefinitionResult({ sceneDefinitions: [], errors });
  }

  const sceneDefinitions = [];

  scenes.forEach((definition, index) => {
    const path = `scenes[${index}]`;

    if (!isRecord(definition)) {
      errors.push(createSceneDefinitionError(
        RUNTIME_SCENE_DEFINITION_ERRORS.SCENES_INVALID,
        "Manifest scene definition must be an object.",
        path
      ));
      return;
    }

    if (!hasNonEmptyString(definition.sceneId)) {
      errors.push(createSceneDefinitionError(
        RUNTIME_SCENE_DEFINITION_ERRORS.SCENE_ID_REQUIRED,
        "Manifest scene definition requires sceneId.",
        `${path}.sceneId`
      ));
    }

    if (!Array.isArray(definition.objectInstances)) {
      errors.push(createSceneDefinitionError(
        RUNTIME_SCENE_DEFINITION_ERRORS.OBJECT_INSTANCES_INVALID,
        "Manifest scene definition requires objectInstances array.",
        `${path}.objectInstances`
      ));
    }

    if (!isRecord(definition.terrainAssignments)) {
      errors.push(createSceneDefinitionError(
        RUNTIME_SCENE_DEFINITION_ERRORS.TERRAIN_ASSIGNMENTS_INVALID,
        "Manifest scene definition requires terrainAssignments object.",
        `${path}.terrainAssignments`
      ));
    }

    if (!Array.isArray(definition.terrainTiles)) {
      errors.push(createSceneDefinitionError(
        RUNTIME_SCENE_DEFINITION_ERRORS.TERRAIN_TILES_INVALID,
        "Manifest scene definition requires terrainTiles array.",
        `${path}.terrainTiles`
      ));
    }

    if (!isStringArray(definition.environmentForceIds)) {
      errors.push(createSceneDefinitionError(
        RUNTIME_SCENE_DEFINITION_ERRORS.ENVIRONMENT_FORCE_IDS_INVALID,
        "Manifest scene definition requires environmentForceIds string array.",
        `${path}.environmentForceIds`
      ));
    }

    if (!isStringArray(definition.transitionIds)) {
      errors.push(createSceneDefinitionError(
        RUNTIME_SCENE_DEFINITION_ERRORS.TRANSITION_IDS_INVALID,
        "Manifest scene definition requires transitionIds string array.",
        `${path}.transitionIds`
      ));
    }

    if (errors.some((error) => error.path.startsWith(path))) {
      return;
    }

    sceneDefinitions.push(Object.freeze({
      sceneId: definition.sceneId.trim(),
      objectInstances: Object.freeze(cloneJson(definition.objectInstances)),
      terrainAssignments: Object.freeze(cloneJson(definition.terrainAssignments)),
      terrainTiles: Object.freeze(cloneJson(definition.terrainTiles)),
      environmentForceIds: Object.freeze(definition.environmentForceIds.map((forceId) => forceId.trim())),
      transitionIds: Object.freeze(definition.transitionIds.map((sceneId) => sceneId.trim())),
      spawnDefinitions: Object.freeze(Array.isArray(definition.spawnDefinitions) ? cloneJson(definition.spawnDefinitions) : []),
      scoringDefinitions: Object.freeze(Array.isArray(definition.scoringDefinitions) ? cloneJson(definition.scoringDefinitions) : []),
      stateDefinitions: Object.freeze(Array.isArray(definition.stateDefinitions) ? cloneJson(definition.stateDefinitions) : []),
    }));
  });

  return createSceneDefinitionResult({
    sceneDefinitions: errors.length === 0 ? sceneDefinitions : [],
    errors,
  });
}

function createSceneDefinitionResult({ sceneDefinitions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    sceneDefinitions: Object.freeze(sceneDefinitions),
    errors: Object.freeze(errors),
  });
}

function createSceneDefinitionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => hasNonEmptyString(item));
}
