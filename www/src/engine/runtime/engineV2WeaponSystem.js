/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2WeaponSystem.js
*/

export const ENGINE_V2_WEAPON_TYPES = Object.freeze({
  MELEE: "melee",
  RANGED: "ranged",
  AREA: "area",
  CUSTOM: "custom",
});

export const ENGINE_V2_WEAPON_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_WEAPON_TYPES));

export const ENGINE_V2_WEAPON_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_WEAPON_DEFINITIONS_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_WEAPON_REQUESTS_INVALID",
  ABILITIES_INVALID: "ENGINE_V2_WEAPON_ABILITIES_INVALID",
  PROJECTILES_INVALID: "ENGINE_V2_WEAPON_PROJECTILES_INVALID",
  STATUS_EFFECTS_INVALID: "ENGINE_V2_WEAPON_STATUS_EFFECTS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_WEAPON_DEFINITION_INVALID",
  REQUEST_INVALID: "ENGINE_V2_WEAPON_REQUEST_INVALID",
  WEAPON_MISSING: "ENGINE_V2_WEAPON_MISSING",
  ABILITY_MISSING: "ENGINE_V2_WEAPON_ABILITY_MISSING",
  PROJECTILE_MISSING: "ENGINE_V2_WEAPON_PROJECTILE_MISSING",
  STATUS_EFFECT_MISSING: "ENGINE_V2_WEAPON_STATUS_EFFECT_MISSING",
});

export function resolveEngineV2Weapons({ weaponDefinitions, weaponRequests, abilityEvents, projectileDefinitions, statusEffectDefinitions }) {
  const errors = [];

  if (!Array.isArray(weaponDefinitions)) {
    errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.DEFINITIONS_INVALID, "Weapon runtime requires weaponDefinitions array.", "weaponDefinitions"));
  }

  if (!Array.isArray(weaponRequests)) {
    errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.REQUESTS_INVALID, "Weapon runtime requires weaponRequests array.", "weaponRequests"));
  }

  if (!Array.isArray(abilityEvents)) {
    errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.ABILITIES_INVALID, "Weapon runtime requires abilityEvents array.", "abilityEvents"));
  }

  if (!Array.isArray(projectileDefinitions)) {
    errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.PROJECTILES_INVALID, "Weapon runtime requires projectileDefinitions array.", "projectileDefinitions"));
  }

  if (!Array.isArray(statusEffectDefinitions)) {
    errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.STATUS_EFFECTS_INVALID, "Weapon runtime requires statusEffectDefinitions array.", "statusEffectDefinitions"));
  }

  if (errors.length > 0) {
    return createWeaponResult({ weaponEvents: [], damageSources: [], projectileRequests: [], statusApplications: [], abilityRefs: [], errors });
  }

  weaponDefinitions.forEach((definition, index) => {
    validateWeaponDefinition(definition, `weaponDefinitions[${index}]`).forEach((error) => errors.push(error));
  });
  weaponRequests.forEach((request, index) => {
    validateWeaponRequest(request, `weaponRequests[${index}]`).forEach((error) => errors.push(error));
  });

  const weaponsById = new Map(weaponDefinitions.map((definition) => [definition.weaponId, definition]));
  const projectileIds = new Set(projectileDefinitions.map((definition) => definition.projectileDefinitionId));
  const statusEffectIds = new Set(statusEffectDefinitions.map((definition) => definition.statusEffectId));
  const abilityIds = new Set(abilityEvents.map((abilityEvent) => abilityEvent.abilityId));

  weaponDefinitions.forEach((definition, index) => {
    definition.abilityIds.forEach((abilityId) => {
      if (!abilityIds.has(abilityId)) {
        errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.ABILITY_MISSING, "Weapon definition references missing ability event.", `weaponDefinitions[${index}].abilityIds`));
      }
    });

    definition.projectileDefinitionIds.forEach((projectileDefinitionId) => {
      if (!projectileIds.has(projectileDefinitionId)) {
        errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.PROJECTILE_MISSING, "Weapon definition references missing projectile definition.", `weaponDefinitions[${index}].projectileDefinitionIds`));
      }
    });

    definition.statusEffectIds.forEach((statusEffectId) => {
      if (!statusEffectIds.has(statusEffectId)) {
        errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.STATUS_EFFECT_MISSING, "Weapon definition references missing status effect definition.", `weaponDefinitions[${index}].statusEffectIds`));
      }
    });
  });

  weaponRequests.forEach((request, index) => {
    if (!weaponsById.has(request.weaponId)) {
      errors.push(createWeaponError(ENGINE_V2_WEAPON_ERRORS.WEAPON_MISSING, "Weapon request references missing weapon definition.", `weaponRequests[${index}].weaponId`));
    }
  });

  if (errors.length > 0) {
    return createWeaponResult({ weaponEvents: [], damageSources: [], projectileRequests: [], statusApplications: [], abilityRefs: [], errors });
  }

  const weaponEvents = [];
  const damageSources = [];
  const projectileRequests = [];
  const statusApplications = [];
  const abilityRefs = [];

  weaponRequests.forEach((request) => {
    const definition = weaponsById.get(request.weaponId);

    weaponEvents.push(Object.freeze({
      requestId: request.requestId,
      weaponId: definition.weaponId,
      weaponType: definition.weaponType,
      ownerInstanceId: request.ownerInstanceId,
    }));
    definition.abilityIds.forEach((abilityId) => {
      abilityRefs.push(Object.freeze({ requestId: request.requestId, weaponId: definition.weaponId, abilityId }));
    });

    if (definition.weaponType === ENGINE_V2_WEAPON_TYPES.RANGED) {
      definition.projectileDefinitionIds.forEach((projectileDefinitionId) => {
        projectileRequests.push(Object.freeze({
          requestId: `${request.requestId}.${projectileDefinitionId}`,
          projectileDefinitionId,
          sourceInstanceId: request.ownerInstanceId,
          position: Object.freeze({ ...request.position }),
          direction: Object.freeze({ ...request.direction }),
        }));
      });
      return;
    }

    const targetInstanceIds = definition.weaponType === ENGINE_V2_WEAPON_TYPES.AREA
      ? request.targetInstanceIds
      : [request.targetInstanceId].filter((targetInstanceId) => hasNonEmptyString(targetInstanceId));

    targetInstanceIds.forEach((targetInstanceId) => {
      if (definition.damageAmount > 0) {
        damageSources.push(Object.freeze({
          sourceId: request.requestId,
          sourceType: "action",
          targetInstanceId,
          amount: definition.damageAmount,
        }));
      }

      definition.statusEffectIds.forEach((statusEffectId) => {
        statusApplications.push(Object.freeze({
          applicationId: `${request.requestId}.${targetInstanceId}.${statusEffectId}`,
          statusEffectId,
          targetInstanceId,
          sourceId: request.requestId,
        }));
      });
    });
  });

  return createWeaponResult({ weaponEvents, damageSources, projectileRequests, statusApplications, abilityRefs, errors });
}

function validateWeaponDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.weaponId) || !ENGINE_V2_WEAPON_TYPE_LIST.includes(definition.weaponType) || !hasNonEmptyString(definition.ownerInstanceId) || !Array.isArray(definition.abilityIds) || !Array.isArray(definition.projectileDefinitionIds) || !Array.isArray(definition.statusEffectIds) || !Number.isFinite(definition.damageAmount) || definition.damageAmount < 0) {
    return [createWeaponError(ENGINE_V2_WEAPON_ERRORS.DEFINITION_INVALID, "Weapon definition requires weaponId, weaponType, ownerInstanceId, ability/projectile/status arrays, and damageAmount.", path)];
  }

  return [];
}

function validateWeaponRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.weaponId) || !hasNonEmptyString(request.ownerInstanceId)) {
    return [createWeaponError(ENGINE_V2_WEAPON_ERRORS.REQUEST_INVALID, "Weapon request requires requestId, weaponId, and ownerInstanceId.", path)];
  }

  return [];
}

function createWeaponResult({ weaponEvents, damageSources, projectileRequests, statusApplications, abilityRefs, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    weaponEvents: Object.freeze(weaponEvents),
    damageSources: Object.freeze(damageSources),
    projectileRequests: Object.freeze(projectileRequests),
    statusApplications: Object.freeze(statusApplications),
    abilityRefs: Object.freeze(abilityRefs),
    errors: Object.freeze(errors),
  });
}

function createWeaponError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
