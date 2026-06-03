/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ChaseFleeBehavior.js
*/

export const ENGINE_V2_STEERING_BEHAVIOR_TYPES = Object.freeze({
  CHASE: "chase",
  FLEE: "flee",
});

export const ENGINE_V2_TARGET_SELECTOR_TYPES = Object.freeze({
  INSTANCE_ID: "instanceId",
  TAG: "tag",
});

export const ENGINE_V2_CHASE_FLEE_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_CHASE_FLEE_DEFINITIONS_INVALID",
  OBJECTS_INVALID: "ENGINE_V2_CHASE_FLEE_OBJECTS_INVALID",
  DELTA_INVALID: "ENGINE_V2_CHASE_FLEE_DELTA_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_CHASE_FLEE_DEFINITION_INVALID",
  SELECTOR_INVALID: "ENGINE_V2_CHASE_FLEE_SELECTOR_INVALID",
  ACTOR_MISSING: "ENGINE_V2_CHASE_FLEE_ACTOR_MISSING",
  TARGET_MISSING: "ENGINE_V2_CHASE_FLEE_TARGET_MISSING",
});

export function resolveEngineV2ChaseFleeBehaviors({ behaviorDefinitions, runtimeObjects, deltaMs }) {
  const errors = [];

  if (!Array.isArray(behaviorDefinitions)) {
    errors.push(createChaseFleeError(ENGINE_V2_CHASE_FLEE_ERRORS.DEFINITIONS_INVALID, "Chase/flee runtime requires behaviorDefinitions array.", "behaviorDefinitions"));
  }

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createChaseFleeError(ENGINE_V2_CHASE_FLEE_ERRORS.OBJECTS_INVALID, "Chase/flee runtime requires runtimeObjects array.", "runtimeObjects"));
  }

  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    errors.push(createChaseFleeError(ENGINE_V2_CHASE_FLEE_ERRORS.DELTA_INVALID, "Chase/flee runtime requires non-negative numeric deltaMs.", "deltaMs"));
  }

  if (errors.length > 0) {
    return createChaseFleeResult({ movementCommands: [], behaviorEvents: [], errors });
  }

  behaviorDefinitions.forEach((definition, index) => {
    validateBehaviorDefinition(definition, `behaviorDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  behaviorDefinitions.forEach((definition, index) => {
    if (!runtimeObjects.some((runtimeObject) => runtimeObject.instanceId === definition.instanceId)) {
      errors.push(createChaseFleeError(
        ENGINE_V2_CHASE_FLEE_ERRORS.ACTOR_MISSING,
        "Chase/flee definition references missing actor.",
        `behaviorDefinitions[${index}].instanceId`
      ));
      return;
    }

    if (!resolveTarget(definition.targetSelector, runtimeObjects, definition.instanceId)) {
      errors.push(createChaseFleeError(
        ENGINE_V2_CHASE_FLEE_ERRORS.TARGET_MISSING,
        "Chase/flee target selector did not resolve to a runtime object.",
        `behaviorDefinitions[${index}].targetSelector`
      ));
    }
  });

  if (errors.length > 0) {
    return createChaseFleeResult({ movementCommands: [], behaviorEvents: [], errors });
  }

  const movementCommands = [];
  const behaviorEvents = [];
  const deltaSeconds = deltaMs / 1000;

  behaviorDefinitions.forEach((definition) => {
    const actor = runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === definition.instanceId);
    const target = resolveTarget(definition.targetSelector, runtimeObjects, definition.instanceId);
    const movement = definition.behaviorType === ENGINE_V2_STEERING_BEHAVIOR_TYPES.CHASE
      ? resolveChaseMovement(definition, actor, target, deltaSeconds)
      : resolveFleeMovement(definition, actor, target, deltaSeconds);

    movementCommands.push(Object.freeze(movement.movementCommand));
    behaviorEvents.push(Object.freeze({
      behaviorId: definition.behaviorId,
      behaviorType: definition.behaviorType,
      instanceId: definition.instanceId,
      targetInstanceId: target.instanceId,
      active: movement.active,
      distance: movement.distance,
    }));
  });

  return createChaseFleeResult({ movementCommands, behaviorEvents, errors });
}

function resolveChaseMovement(definition, actor, target, deltaSeconds) {
  const offset = getCenterOffset(actor, target);
  const distance = Math.hypot(offset.x, offset.y);

  if (distance <= definition.stopDistance) {
    return {
      active: false,
      distance,
      movementCommand: createMovementCommand(definition.instanceId, actor.position, { x: 0, y: 0 }, false),
    };
  }

  return createSteeringMovement(definition.instanceId, actor.position, offset, distance, definition.speed, deltaSeconds, true);
}

function resolveFleeMovement(definition, actor, target, deltaSeconds) {
  const offset = getCenterOffset(target, actor);
  const distance = Math.hypot(offset.x, offset.y);

  if (distance >= definition.desiredDistance) {
    return {
      active: false,
      distance,
      movementCommand: createMovementCommand(definition.instanceId, actor.position, { x: 0, y: 0 }, false),
    };
  }

  return createSteeringMovement(definition.instanceId, actor.position, offset, distance, definition.speed, deltaSeconds, true);
}

function createSteeringMovement(instanceId, position, offset, distance, speed, deltaSeconds, active) {
  const velocity = {
    x: distance > 0 ? (offset.x / distance) * speed : 0,
    y: distance > 0 ? (offset.y / distance) * speed : 0,
  };
  const nextPosition = {
    x: position.x + velocity.x * deltaSeconds,
    y: position.y + velocity.y * deltaSeconds,
  };

  return {
    active,
    distance,
    movementCommand: createMovementCommand(instanceId, nextPosition, velocity, active),
  };
}

function resolveTarget(targetSelector, runtimeObjects, actorInstanceId) {
  if (targetSelector.selectorType === ENGINE_V2_TARGET_SELECTOR_TYPES.INSTANCE_ID) {
    return runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === targetSelector.instanceId && runtimeObject.instanceId !== actorInstanceId) ?? null;
  }

  if (targetSelector.selectorType === ENGINE_V2_TARGET_SELECTOR_TYPES.TAG) {
    return runtimeObjects
      .filter((runtimeObject) => runtimeObject.instanceId !== actorInstanceId)
      .filter((runtimeObject) => Array.isArray(runtimeObject.tags) && runtimeObject.tags.includes(targetSelector.tag))
      .sort((left, right) => left.instanceId.localeCompare(right.instanceId))[0] ?? null;
  }

  return null;
}

function validateBehaviorDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition) || !hasNonEmptyString(definition.behaviorId) || !hasNonEmptyString(definition.instanceId) || ![ENGINE_V2_STEERING_BEHAVIOR_TYPES.CHASE, ENGINE_V2_STEERING_BEHAVIOR_TYPES.FLEE].includes(definition.behaviorType) || !Number.isFinite(definition.speed) || definition.speed <= 0 || !Number.isFinite(definition.stopDistance) || definition.stopDistance < 0 || !Number.isFinite(definition.desiredDistance) || definition.desiredDistance < 0) {
    errors.push(createChaseFleeError(
      ENGINE_V2_CHASE_FLEE_ERRORS.DEFINITION_INVALID,
      "Chase/flee definition requires behaviorId, instanceId, behaviorType, speed, stopDistance, and desiredDistance.",
      path
    ));
    return errors;
  }

  validateTargetSelector(definition.targetSelector, `${path}.targetSelector`).forEach((error) => errors.push(error));

  return errors;
}

function validateTargetSelector(targetSelector, path) {
  if (!isRecord(targetSelector)) {
    return [createChaseFleeError(
      ENGINE_V2_CHASE_FLEE_ERRORS.SELECTOR_INVALID,
      "Target selector must be an object.",
      path
    )];
  }

  if (targetSelector.selectorType === ENGINE_V2_TARGET_SELECTOR_TYPES.INSTANCE_ID && hasNonEmptyString(targetSelector.instanceId)) {
    return [];
  }

  if (targetSelector.selectorType === ENGINE_V2_TARGET_SELECTOR_TYPES.TAG && hasNonEmptyString(targetSelector.tag)) {
    return [];
  }

  return [createChaseFleeError(
    ENGINE_V2_CHASE_FLEE_ERRORS.SELECTOR_INVALID,
    "Target selector requires selectorType plus matching instanceId or tag.",
    path
  )];
}

function getCenterOffset(source, target) {
  return {
    x: (target.position.x + target.size.width / 2) - (source.position.x + source.size.width / 2),
    y: (target.position.y + target.size.height / 2) - (source.position.y + source.size.height / 2),
  };
}

function createMovementCommand(instanceId, position, velocity, active) {
  return {
    command: "setRuntimeObjectMotion",
    instanceId,
    position: Object.freeze({ x: position.x, y: position.y }),
    velocity: Object.freeze({ x: velocity.x, y: velocity.y }),
    active,
  };
}

function createChaseFleeResult({ movementCommands, behaviorEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    movementCommands: Object.freeze(movementCommands),
    behaviorEvents: Object.freeze(behaviorEvents),
    errors: Object.freeze(errors),
  });
}

function createChaseFleeError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
