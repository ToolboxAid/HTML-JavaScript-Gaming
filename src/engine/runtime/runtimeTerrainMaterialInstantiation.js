/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeTerrainMaterialInstantiation.js
*/

export const RUNTIME_TERRAIN_MATERIAL_ERRORS = Object.freeze({
  MATERIALS_INVALID: "RUNTIME_TERRAIN_MATERIALS_INVALID",
  MATERIAL_ID_REQUIRED: "RUNTIME_TERRAIN_MATERIAL_ID_REQUIRED",
  PASSABLE_INVALID: "RUNTIME_TERRAIN_MATERIAL_PASSABLE_INVALID",
  BLOCKED_INVALID: "RUNTIME_TERRAIN_MATERIAL_BLOCKED_INVALID",
  PASSABLE_BLOCKED_CONFLICT: "RUNTIME_TERRAIN_MATERIAL_PASSABLE_BLOCKED_CONFLICT",
  SLIDE_INVALID: "RUNTIME_TERRAIN_MATERIAL_SLIDE_INVALID",
  DRAG_INVALID: "RUNTIME_TERRAIN_MATERIAL_DRAG_INVALID",
  FRICTION_INVALID: "RUNTIME_TERRAIN_MATERIAL_FRICTION_INVALID",
  SURFACE_DAMAGE_INVALID: "RUNTIME_TERRAIN_MATERIAL_SURFACE_DAMAGE_INVALID",
  SURFACE_HEALING_INVALID: "RUNTIME_TERRAIN_MATERIAL_SURFACE_HEALING_INVALID",
});

export function instantiateTerrainMaterials(materialDefinitions) {
  const errors = [];

  if (!isRecord(materialDefinitions) && !Array.isArray(materialDefinitions)) {
    errors.push(createTerrainMaterialError(
      RUNTIME_TERRAIN_MATERIAL_ERRORS.MATERIALS_INVALID,
      "Terrain material instantiation requires an object map or array.",
      "materialDefinitions"
    ));
    return createTerrainMaterialResult({ terrainMaterials: [], errors });
  }

  const entries = Array.isArray(materialDefinitions)
    ? materialDefinitions.map((definition, index) => ({ key: "", definition, path: `materialDefinitions[${index}]` }))
    : Object.entries(materialDefinitions).map(([key, definition]) => ({ key, definition, path: `materialDefinitions.${key}` }));
  const terrainMaterials = [];

  entries.forEach(({ key, definition, path }) => {
    if (!isRecord(definition)) {
      errors.push(createTerrainMaterialError(
        RUNTIME_TERRAIN_MATERIAL_ERRORS.MATERIALS_INVALID,
        "Terrain material definition must be an object.",
        path
      ));
      return;
    }

    const materialId = hasNonEmptyString(definition.materialId) ? definition.materialId.trim() : key.trim();

    if (!hasNonEmptyString(materialId)) {
      errors.push(createTerrainMaterialError(
        RUNTIME_TERRAIN_MATERIAL_ERRORS.MATERIAL_ID_REQUIRED,
        "Terrain material requires materialId.",
        `${path}.materialId`
      ));
    }

    if (typeof definition.passable !== "boolean") {
      errors.push(createTerrainMaterialError(
        RUNTIME_TERRAIN_MATERIAL_ERRORS.PASSABLE_INVALID,
        "Terrain material requires explicit passable boolean.",
        `${path}.passable`
      ));
    }

    if (typeof definition.blocked !== "boolean") {
      errors.push(createTerrainMaterialError(
        RUNTIME_TERRAIN_MATERIAL_ERRORS.BLOCKED_INVALID,
        "Terrain material requires explicit blocked boolean.",
        `${path}.blocked`
      ));
    }

    if (definition.passable === true && definition.blocked === true) {
      errors.push(createTerrainMaterialError(
        RUNTIME_TERRAIN_MATERIAL_ERRORS.PASSABLE_BLOCKED_CONFLICT,
        "Terrain material cannot be both passable and blocked.",
        path
      ));
    }

    validateOptionalPoint(definition.slide, `${path}.slide`, RUNTIME_TERRAIN_MATERIAL_ERRORS.SLIDE_INVALID, errors);
    validateOptionalNonNegativeNumber(definition.drag, `${path}.drag`, RUNTIME_TERRAIN_MATERIAL_ERRORS.DRAG_INVALID, errors);
    validateOptionalNonNegativeNumber(definition.friction, `${path}.friction`, RUNTIME_TERRAIN_MATERIAL_ERRORS.FRICTION_INVALID, errors);
    validateOptionalNonNegativeNumber(definition.surfaceDamage, `${path}.surfaceDamage`, RUNTIME_TERRAIN_MATERIAL_ERRORS.SURFACE_DAMAGE_INVALID, errors);
    validateOptionalNonNegativeNumber(definition.surfaceHealing, `${path}.surfaceHealing`, RUNTIME_TERRAIN_MATERIAL_ERRORS.SURFACE_HEALING_INVALID, errors);

    if (errors.some((error) => error.path.startsWith(path))) {
      return;
    }

    terrainMaterials.push(Object.freeze({
      materialId,
      passable: definition.passable,
      blocked: definition.blocked,
      slide: definition.slide === undefined ? null : freezePoint(definition.slide),
      drag: definition.drag,
      friction: definition.friction,
      surfaceDamage: definition.surfaceDamage,
      surfaceHealing: definition.surfaceHealing,
    }));
  });

  return createTerrainMaterialResult({
    terrainMaterials: errors.length === 0 ? terrainMaterials : [],
    errors,
  });
}

function createTerrainMaterialResult({ terrainMaterials, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    terrainMaterials: Object.freeze(terrainMaterials),
    errors: Object.freeze(errors),
  });
}

function createTerrainMaterialError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function validateOptionalPoint(value, path, code, errors) {
  if (value === undefined || isPoint(value)) {
    return;
  }

  errors.push(createTerrainMaterialError(code, "Terrain material point field must include numeric x and y when provided.", path));
}

function validateOptionalNonNegativeNumber(value, path, code, errors) {
  if (value === undefined || isNonNegativeNumber(value)) {
    return;
  }

  errors.push(createTerrainMaterialError(code, "Terrain material numeric field must be non-negative when provided.", path));
}

function freezePoint(value) {
  return Object.freeze({ x: value.x, y: value.y });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPoint(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function isNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0;
}
