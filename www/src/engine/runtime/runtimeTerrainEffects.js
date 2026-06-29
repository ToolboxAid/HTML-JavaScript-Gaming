/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeTerrainEffects.js
*/

export const RUNTIME_TERRAIN_EFFECT_ERRORS = Object.freeze({
  OBJECTS_INVALID: "RUNTIME_TERRAIN_EFFECT_OBJECTS_INVALID",
  MATERIALS_INVALID: "RUNTIME_TERRAIN_EFFECT_MATERIALS_INVALID",
  ASSIGNMENTS_INVALID: "RUNTIME_TERRAIN_EFFECT_ASSIGNMENTS_INVALID",
  DELTA_INVALID: "RUNTIME_TERRAIN_EFFECT_DELTA_INVALID",
  MATERIAL_MISSING: "RUNTIME_TERRAIN_EFFECT_MATERIAL_MISSING",
  HEALTH_REQUIRED: "RUNTIME_TERRAIN_EFFECT_HEALTH_REQUIRED",
});

export function applyRuntimeTerrainEffects(runtimeObjects, terrainMaterials, terrainAssignments, { deltaSeconds }) {
  const errors = [];

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createTerrainEffectError(RUNTIME_TERRAIN_EFFECT_ERRORS.OBJECTS_INVALID, "Terrain effects require runtimeObjects array.", "runtimeObjects"));
  }

  if (!Array.isArray(terrainMaterials)) {
    errors.push(createTerrainEffectError(RUNTIME_TERRAIN_EFFECT_ERRORS.MATERIALS_INVALID, "Terrain effects require terrainMaterials array.", "terrainMaterials"));
  }

  if (!isRecord(terrainAssignments)) {
    errors.push(createTerrainEffectError(RUNTIME_TERRAIN_EFFECT_ERRORS.ASSIGNMENTS_INVALID, "Terrain effects require terrainAssignments object.", "terrainAssignments"));
  }

  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
    errors.push(createTerrainEffectError(RUNTIME_TERRAIN_EFFECT_ERRORS.DELTA_INVALID, "Terrain effects require explicit non-negative deltaSeconds.", "deltaSeconds"));
  }

  if (errors.length > 0) {
    return createTerrainEffectResult({ runtimeObjects: [], errors });
  }

  const materialsById = new Map(terrainMaterials.map((material) => [material.materialId, material]));
  const affectedObjects = runtimeObjects.map((runtimeObject) => {
    const materialId = terrainAssignments[runtimeObject.instanceId];

    if (materialId === undefined) {
      return runtimeObject;
    }

    const material = materialsById.get(materialId);

    if (!material) {
      errors.push(createTerrainEffectError(
        RUNTIME_TERRAIN_EFFECT_ERRORS.MATERIAL_MISSING,
        "Terrain effect assignment references a missing material.",
        `terrainAssignments.${runtimeObject.instanceId}`
      ));
      return runtimeObject;
    }

    if ((material.surfaceDamage !== undefined || material.surfaceHealing !== undefined) && !Number.isFinite(runtimeObject.health)) {
      errors.push(createTerrainEffectError(
        RUNTIME_TERRAIN_EFFECT_ERRORS.HEALTH_REQUIRED,
        "Surface damage or healing requires explicit object health.",
        `${runtimeObject.instanceId}.health`
      ));
      return runtimeObject;
    }

    const dragMultiplier = material.drag === undefined ? 1 : Math.max(0, 1 - material.drag * deltaSeconds);
    const frictionMultiplier = material.friction === undefined ? 1 : Math.max(0, 1 - material.friction * deltaSeconds);
    const slideX = material.slide === null ? 0 : material.slide.x * deltaSeconds;
    const slideY = material.slide === null ? 0 : material.slide.y * deltaSeconds;
    const surfaceDamage = material.surfaceDamage === undefined ? 0 : material.surfaceDamage * deltaSeconds;
    const surfaceHealing = material.surfaceHealing === undefined ? 0 : material.surfaceHealing * deltaSeconds;

    return Object.freeze({
      ...runtimeObject,
      velocity: Object.freeze({
        x: runtimeObject.velocity.x * dragMultiplier * frictionMultiplier + slideX,
        y: runtimeObject.velocity.y * dragMultiplier * frictionMultiplier + slideY,
      }),
      health: Number.isFinite(runtimeObject.health) ? runtimeObject.health - surfaceDamage + surfaceHealing : runtimeObject.health,
    });
  });

  return createTerrainEffectResult({
    runtimeObjects: errors.length === 0 ? affectedObjects : [],
    errors,
  });
}

function createTerrainEffectResult({ runtimeObjects, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeObjects: Object.freeze(runtimeObjects),
    errors: Object.freeze(errors),
  });
}

function createTerrainEffectError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
