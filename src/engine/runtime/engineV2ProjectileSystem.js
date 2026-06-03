/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ProjectileSystem.js
*/

export const ENGINE_V2_PROJECTILE_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_PROJECTILE_DEFINITIONS_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_PROJECTILE_REQUESTS_INVALID",
  RECORDS_INVALID: "ENGINE_V2_PROJECTILE_RECORDS_INVALID",
  COLLISIONS_INVALID: "ENGINE_V2_PROJECTILE_COLLISIONS_INVALID",
  DELTA_INVALID: "ENGINE_V2_PROJECTILE_DELTA_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_PROJECTILE_DEFINITION_INVALID",
  REQUEST_INVALID: "ENGINE_V2_PROJECTILE_REQUEST_INVALID",
  RECORD_INVALID: "ENGINE_V2_PROJECTILE_RECORD_INVALID",
  COLLISION_INVALID: "ENGINE_V2_PROJECTILE_COLLISION_INVALID",
  DEFINITION_MISSING: "ENGINE_V2_PROJECTILE_DEFINITION_MISSING",
});

export function resolveEngineV2Projectiles({ projectileDefinitions, projectileRequests, projectileRecords, collisionEvents, deltaMs }) {
  const errors = [];

  if (!Array.isArray(projectileDefinitions)) {
    errors.push(createProjectileError(ENGINE_V2_PROJECTILE_ERRORS.DEFINITIONS_INVALID, "Projectile runtime requires projectileDefinitions array.", "projectileDefinitions"));
  }

  if (!Array.isArray(projectileRequests)) {
    errors.push(createProjectileError(ENGINE_V2_PROJECTILE_ERRORS.REQUESTS_INVALID, "Projectile runtime requires projectileRequests array.", "projectileRequests"));
  }

  if (!Array.isArray(projectileRecords)) {
    errors.push(createProjectileError(ENGINE_V2_PROJECTILE_ERRORS.RECORDS_INVALID, "Projectile runtime requires projectileRecords array.", "projectileRecords"));
  }

  if (!Array.isArray(collisionEvents)) {
    errors.push(createProjectileError(ENGINE_V2_PROJECTILE_ERRORS.COLLISIONS_INVALID, "Projectile runtime requires collisionEvents array.", "collisionEvents"));
  }

  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    errors.push(createProjectileError(ENGINE_V2_PROJECTILE_ERRORS.DELTA_INVALID, "Projectile runtime requires non-negative numeric deltaMs.", "deltaMs"));
  }

  if (errors.length > 0) {
    return createProjectileResult({ projectileRecords: [], spawnedProjectiles: [], movementCommands: [], collisionActions: [], statusApplications: [], despawnedProjectileIds: [], errors });
  }

  projectileDefinitions.forEach((definition, index) => {
    validateProjectileDefinition(definition, `projectileDefinitions[${index}]`).forEach((error) => errors.push(error));
  });
  projectileRequests.forEach((request, index) => {
    validateProjectileRequest(request, `projectileRequests[${index}]`).forEach((error) => errors.push(error));
  });
  projectileRecords.forEach((record, index) => {
    validateProjectileRecord(record, `projectileRecords[${index}]`).forEach((error) => errors.push(error));
  });
  collisionEvents.forEach((collisionEvent, index) => {
    validateCollisionEvent(collisionEvent, `collisionEvents[${index}]`).forEach((error) => errors.push(error));
  });

  const definitionsById = new Map(projectileDefinitions.map((definition) => [definition.projectileDefinitionId, definition]));

  projectileRequests.forEach((request, index) => {
    if (!definitionsById.has(request.projectileDefinitionId)) {
      errors.push(createProjectileError(
        ENGINE_V2_PROJECTILE_ERRORS.DEFINITION_MISSING,
        "Projectile request references missing definition.",
        `projectileRequests[${index}].projectileDefinitionId`
      ));
    }
  });

  if (errors.length > 0) {
    return createProjectileResult({ projectileRecords: [], spawnedProjectiles: [], movementCommands: [], collisionActions: [], statusApplications: [], despawnedProjectileIds: [], errors });
  }

  const spawnedProjectiles = projectileRequests.map((request) => Object.freeze(createProjectileRecord(request, definitionsById.get(request.projectileDefinitionId))));
  const collisionIds = new Set(collisionEvents.map((collisionEvent) => collisionEvent.projectileInstanceId));
  const despawnedProjectileIds = [...collisionIds];
  const activeExistingRecords = projectileRecords
    .filter((record) => !collisionIds.has(record.projectileInstanceId))
    .map((record) => Object.freeze({
      ...record,
      remainingMs: record.remainingMs - deltaMs,
    }))
    .filter((record) => record.remainingMs > 0);
  const projectileRecordsResult = [...activeExistingRecords, ...spawnedProjectiles];
  const movementCommands = projectileRecordsResult.map((record) => Object.freeze({
    command: "setRuntimeObjectMotion",
    projectileInstanceId: record.projectileInstanceId,
    position: Object.freeze({ ...record.position }),
    velocity: Object.freeze({ ...record.velocity }),
  }));
  const collisionActions = [];
  const statusApplications = [];

  collisionEvents.forEach((collisionEvent) => {
    const record = projectileRecords.find((projectileRecord) => projectileRecord.projectileInstanceId === collisionEvent.projectileInstanceId);

    if (!record) {
      return;
    }

    const definition = definitionsById.get(record.projectileDefinitionId);

    collisionActions.push(Object.freeze({
      sourceId: collisionEvent.projectileInstanceId,
      sourceType: "collision",
      targetInstanceId: collisionEvent.targetInstanceId,
      amount: definition.collisionAction.damageAmount,
    }));
    definition.collisionAction.statusEffectIds.forEach((statusEffectId) => {
      statusApplications.push(Object.freeze({
        applicationId: `${collisionEvent.projectileInstanceId}.${statusEffectId}`,
        statusEffectId,
        targetInstanceId: collisionEvent.targetInstanceId,
        sourceId: collisionEvent.projectileInstanceId,
      }));
    });
  });

  return createProjectileResult({
    projectileRecords: projectileRecordsResult,
    spawnedProjectiles,
    movementCommands,
    collisionActions,
    statusApplications,
    despawnedProjectileIds,
    errors,
  });
}

function createProjectileRecord(request, definition) {
  const magnitude = Math.hypot(request.direction.x, request.direction.y);
  const normalizedDirection = {
    x: request.direction.x / magnitude,
    y: request.direction.y / magnitude,
  };

  return {
    projectileInstanceId: `${definition.projectileDefinitionId}.${request.requestId}`,
    projectileDefinitionId: definition.projectileDefinitionId,
    sourceInstanceId: request.sourceInstanceId,
    position: Object.freeze({ ...request.position }),
    size: Object.freeze({ ...definition.size }),
    velocity: Object.freeze({
      x: normalizedDirection.x * definition.speed,
      y: normalizedDirection.y * definition.speed,
    }),
    remainingMs: definition.lifetimeMs,
  };
}

function validateProjectileDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.projectileDefinitionId) || !hasNonEmptyString(definition.ownerInstanceId) || !Number.isFinite(definition.speed) || definition.speed <= 0 || !Number.isFinite(definition.lifetimeMs) || definition.lifetimeMs <= 0 || !isSize(definition.size) || !isCollisionAction(definition.collisionAction)) {
    return [createProjectileError(
      ENGINE_V2_PROJECTILE_ERRORS.DEFINITION_INVALID,
      "Projectile definition requires projectileDefinitionId, ownerInstanceId, speed, lifetimeMs, size, and collisionAction.",
      path
    )];
  }

  return [];
}

function validateProjectileRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.projectileDefinitionId) || !hasNonEmptyString(request.sourceInstanceId) || !isPosition(request.position) || !isDirection(request.direction)) {
    return [createProjectileError(
      ENGINE_V2_PROJECTILE_ERRORS.REQUEST_INVALID,
      "Projectile request requires requestId, projectileDefinitionId, sourceInstanceId, position, and non-zero direction.",
      path
    )];
  }

  return [];
}

function validateProjectileRecord(record, path) {
  if (!isRecord(record) || !hasNonEmptyString(record.projectileInstanceId) || !hasNonEmptyString(record.projectileDefinitionId) || !hasNonEmptyString(record.sourceInstanceId) || !isPosition(record.position) || !isSize(record.size) || !isPosition(record.velocity) || !Number.isFinite(record.remainingMs)) {
    return [createProjectileError(
      ENGINE_V2_PROJECTILE_ERRORS.RECORD_INVALID,
      "Projectile record requires projectileInstanceId, projectileDefinitionId, sourceInstanceId, position, size, velocity, and remainingMs.",
      path
    )];
  }

  return [];
}

function validateCollisionEvent(collisionEvent, path) {
  if (!isRecord(collisionEvent) || !hasNonEmptyString(collisionEvent.projectileInstanceId) || !hasNonEmptyString(collisionEvent.targetInstanceId)) {
    return [createProjectileError(
      ENGINE_V2_PROJECTILE_ERRORS.COLLISION_INVALID,
      "Projectile collision event requires projectileInstanceId and targetInstanceId.",
      path
    )];
  }

  return [];
}

function createProjectileResult({ projectileRecords, spawnedProjectiles, movementCommands, collisionActions, statusApplications, despawnedProjectileIds, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    projectileRecords: Object.freeze(projectileRecords),
    spawnedProjectiles: Object.freeze(spawnedProjectiles),
    movementCommands: Object.freeze(movementCommands),
    collisionActions: Object.freeze(collisionActions),
    statusApplications: Object.freeze(statusApplications),
    despawnedProjectileIds: Object.freeze(despawnedProjectileIds),
    errors: Object.freeze(errors),
  });
}

function createProjectileError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isCollisionAction(value) {
  return isRecord(value) && Number.isFinite(value.damageAmount) && value.damageAmount >= 0 && Array.isArray(value.statusEffectIds) && value.statusEffectIds.every((statusEffectId) => hasNonEmptyString(statusEffectId));
}

function isSize(value) {
  return isRecord(value) && Number.isFinite(value.width) && value.width > 0 && Number.isFinite(value.height) && value.height > 0;
}

function isDirection(value) {
  return isPosition(value) && Math.hypot(value.x, value.y) > 0;
}

function isPosition(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
