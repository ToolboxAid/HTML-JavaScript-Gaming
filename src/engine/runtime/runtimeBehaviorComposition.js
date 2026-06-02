/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeBehaviorComposition.js
*/

export const RUNTIME_BEHAVIOR_COMPOSITION_ERRORS = Object.freeze({
  OBJECTS_INVALID: "RUNTIME_BEHAVIOR_OBJECTS_INVALID",
  MATERIALS_INVALID: "RUNTIME_BEHAVIOR_MATERIALS_INVALID",
  FORCES_INVALID: "RUNTIME_BEHAVIOR_FORCES_INVALID",
  ASSIGNMENTS_INVALID: "RUNTIME_BEHAVIOR_ASSIGNMENTS_INVALID",
  MATERIAL_MISSING: "RUNTIME_BEHAVIOR_MATERIAL_MISSING",
});

export function composeRuntimeBehavior({ runtimeObjects, terrainMaterials, environmentForces, terrainAssignments }) {
  const errors = [];

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createBehaviorCompositionError(
      RUNTIME_BEHAVIOR_COMPOSITION_ERRORS.OBJECTS_INVALID,
      "Runtime behavior composition requires runtimeObjects array.",
      "runtimeObjects"
    ));
  }

  if (!Array.isArray(terrainMaterials)) {
    errors.push(createBehaviorCompositionError(
      RUNTIME_BEHAVIOR_COMPOSITION_ERRORS.MATERIALS_INVALID,
      "Runtime behavior composition requires terrainMaterials array.",
      "terrainMaterials"
    ));
  }

  if (!Array.isArray(environmentForces)) {
    errors.push(createBehaviorCompositionError(
      RUNTIME_BEHAVIOR_COMPOSITION_ERRORS.FORCES_INVALID,
      "Runtime behavior composition requires environmentForces array.",
      "environmentForces"
    ));
  }

  if (!isRecord(terrainAssignments)) {
    errors.push(createBehaviorCompositionError(
      RUNTIME_BEHAVIOR_COMPOSITION_ERRORS.ASSIGNMENTS_INVALID,
      "Runtime behavior composition requires terrainAssignments object.",
      "terrainAssignments"
    ));
  }

  if (errors.length > 0) {
    return createBehaviorCompositionResult({ compositions: [], errors });
  }

  const materialsById = new Map(terrainMaterials.map((material) => [material.materialId, material]));
  const compositions = [];

  runtimeObjects.forEach((runtimeObject) => {
    const materialId = terrainAssignments[runtimeObject.instanceId];
    const terrainMaterial = materialId === undefined ? null : materialsById.get(materialId);

    if (materialId !== undefined && !terrainMaterial) {
      errors.push(createBehaviorCompositionError(
        RUNTIME_BEHAVIOR_COMPOSITION_ERRORS.MATERIAL_MISSING,
        "Runtime behavior composition references a missing terrain material.",
        `terrainAssignments.${runtimeObject.instanceId}`
      ));
      return;
    }

    compositions.push(Object.freeze({
      instanceId: runtimeObject.instanceId,
      objectCapabilities: Object.freeze([...runtimeObject.capabilities]),
      terrainMaterialId: terrainMaterial ? terrainMaterial.materialId : "",
      terrainEffects: terrainMaterial ? freezeTerrainEffects(terrainMaterial) : Object.freeze({}),
      environmentForces: Object.freeze(environmentForces
        .filter((force) => affectsRuntimeObject(force, runtimeObject))
        .map((force) => force.forceId)),
    }));
  });

  return createBehaviorCompositionResult({
    compositions: errors.length === 0 ? compositions : [],
    errors,
  });
}

function createBehaviorCompositionResult({ compositions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    compositions: Object.freeze(compositions),
    errors: Object.freeze(errors),
  });
}

function createBehaviorCompositionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function freezeTerrainEffects(material) {
  return Object.freeze({
    slide: material.slide !== null,
    drag: material.drag !== undefined,
    friction: material.friction !== undefined,
    surfaceDamage: material.surfaceDamage !== undefined,
    surfaceHealing: material.surfaceHealing !== undefined,
    blocked: material.blocked,
    passable: material.passable,
  });
}

function affectsRuntimeObject(force, runtimeObject) {
  if (force.forceType === "weather") {
    return true;
  }

  return runtimeObject.objectType === "dynamic";
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
