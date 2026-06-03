/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2PatrolBehavior.js
*/

export const ENGINE_V2_PATROL_MODES = Object.freeze({
  LOOP: "loop",
  PING_PONG: "pingPong",
});

export const ENGINE_V2_PATROL_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_PATROL_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_PATROL_STATES_INVALID",
  OBJECTS_INVALID: "ENGINE_V2_PATROL_OBJECTS_INVALID",
  DELTA_INVALID: "ENGINE_V2_PATROL_DELTA_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_PATROL_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_PATROL_STATE_INVALID",
  WAYPOINT_INVALID: "ENGINE_V2_PATROL_WAYPOINT_INVALID",
  OBJECT_MISSING: "ENGINE_V2_PATROL_OBJECT_MISSING",
  STATE_MISSING: "ENGINE_V2_PATROL_STATE_MISSING",
});

export function updateEngineV2PatrolBehaviors({ patrolDefinitions, patrolStates, runtimeObjects, deltaMs }) {
  const errors = [];

  if (!Array.isArray(patrolDefinitions)) {
    errors.push(createPatrolError(ENGINE_V2_PATROL_ERRORS.DEFINITIONS_INVALID, "Patrol runtime requires patrolDefinitions array.", "patrolDefinitions"));
  }

  if (!Array.isArray(patrolStates)) {
    errors.push(createPatrolError(ENGINE_V2_PATROL_ERRORS.STATES_INVALID, "Patrol runtime requires patrolStates array.", "patrolStates"));
  }

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createPatrolError(ENGINE_V2_PATROL_ERRORS.OBJECTS_INVALID, "Patrol runtime requires runtimeObjects array.", "runtimeObjects"));
  }

  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    errors.push(createPatrolError(ENGINE_V2_PATROL_ERRORS.DELTA_INVALID, "Patrol runtime requires non-negative numeric deltaMs.", "deltaMs"));
  }

  if (errors.length > 0) {
    return createPatrolResult({ patrolStates: [], movementCommands: [], waypointEvents: [], errors });
  }

  patrolDefinitions.forEach((definition, index) => {
    validatePatrolDefinition(definition, `patrolDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  patrolStates.forEach((state, index) => {
    validatePatrolState(state, `patrolStates[${index}]`).forEach((error) => errors.push(error));
  });

  patrolDefinitions.forEach((definition, index) => {
    if (!runtimeObjects.some((runtimeObject) => runtimeObject.instanceId === definition.instanceId)) {
      errors.push(createPatrolError(
        ENGINE_V2_PATROL_ERRORS.OBJECT_MISSING,
        "Patrol definition references missing runtime object.",
        `patrolDefinitions[${index}].instanceId`
      ));
    }

    if (!patrolStates.some((state) => state.behaviorId === definition.behaviorId)) {
      errors.push(createPatrolError(
        ENGINE_V2_PATROL_ERRORS.STATE_MISSING,
        "Patrol definition requires matching patrol state.",
        `patrolDefinitions[${index}].behaviorId`
      ));
    }
  });

  if (errors.length > 0) {
    return createPatrolResult({ patrolStates: [], movementCommands: [], waypointEvents: [], errors });
  }

  const statesById = new Map(patrolStates.map((state) => [state.behaviorId, state]));
  const objectsById = new Map(runtimeObjects.map((runtimeObject) => [runtimeObject.instanceId, runtimeObject]));
  const nextPatrolStates = [];
  const movementCommands = [];
  const waypointEvents = [];
  const deltaSeconds = deltaMs / 1000;

  patrolDefinitions.forEach((definition) => {
    const currentState = statesById.get(definition.behaviorId);
    const runtimeObject = objectsById.get(definition.instanceId);
    const update = advancePatrol(definition, currentState, runtimeObject, deltaMs, deltaSeconds);

    nextPatrolStates.push(Object.freeze(update.patrolState));
    movementCommands.push(Object.freeze(update.movementCommand));

    if (update.waypointEvent) {
      waypointEvents.push(Object.freeze(update.waypointEvent));
    }
  });

  return createPatrolResult({
    patrolStates: nextPatrolStates,
    movementCommands,
    waypointEvents,
    errors,
  });
}

function advancePatrol(definition, currentState, runtimeObject, deltaMs, deltaSeconds) {
  if (currentState.pauseRemainingMs > 0) {
    const pauseRemainingMs = Math.max(0, currentState.pauseRemainingMs - deltaMs);

    return {
      patrolState: {
        ...currentState,
        pauseRemainingMs,
      },
      movementCommand: createMovementCommand(definition.instanceId, runtimeObject.position, { x: 0, y: 0 }, false),
      waypointEvent: null,
    };
  }

  const targetWaypoint = definition.waypoints[currentState.waypointIndex];
  const deltaX = targetWaypoint.x - runtimeObject.position.x;
  const deltaY = targetWaypoint.y - runtimeObject.position.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= definition.tolerance) {
    const nextStep = resolveNextWaypoint(definition, currentState);

    return {
      patrolState: {
        behaviorId: currentState.behaviorId,
        waypointIndex: nextStep.waypointIndex,
        direction: nextStep.direction,
        pauseRemainingMs: targetWaypoint.pauseMs,
      },
      movementCommand: createMovementCommand(definition.instanceId, targetWaypoint, { x: 0, y: 0 }, true),
      waypointEvent: {
        behaviorId: definition.behaviorId,
        instanceId: definition.instanceId,
        waypointIndex: currentState.waypointIndex,
      },
    };
  }

  const step = Math.min(definition.speed * deltaSeconds, distance);
  const velocity = {
    x: distance > 0 ? (deltaX / distance) * definition.speed : 0,
    y: distance > 0 ? (deltaY / distance) * definition.speed : 0,
  };
  const position = {
    x: runtimeObject.position.x + (deltaX / Math.max(distance, 1)) * step,
    y: runtimeObject.position.y + (deltaY / Math.max(distance, 1)) * step,
  };

  return {
    patrolState: { ...currentState },
    movementCommand: createMovementCommand(definition.instanceId, position, velocity, false),
    waypointEvent: null,
  };
}

function resolveNextWaypoint(definition, currentState) {
  if (definition.mode === ENGINE_V2_PATROL_MODES.LOOP) {
    return {
      waypointIndex: (currentState.waypointIndex + 1) % definition.waypoints.length,
      direction: 1,
    };
  }

  if (currentState.waypointIndex >= definition.waypoints.length - 1 && currentState.direction > 0) {
    return {
      waypointIndex: currentState.waypointIndex - 1,
      direction: -1,
    };
  }

  if (currentState.waypointIndex <= 0 && currentState.direction < 0) {
    return {
      waypointIndex: currentState.waypointIndex + 1,
      direction: 1,
    };
  }

  return {
    waypointIndex: currentState.waypointIndex + currentState.direction,
    direction: currentState.direction,
  };
}

function validatePatrolDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition) || !hasNonEmptyString(definition.behaviorId) || !hasNonEmptyString(definition.instanceId) || ![ENGINE_V2_PATROL_MODES.LOOP, ENGINE_V2_PATROL_MODES.PING_PONG].includes(definition.mode) || !Number.isFinite(definition.speed) || definition.speed <= 0 || !Number.isFinite(definition.tolerance) || definition.tolerance < 0 || !Array.isArray(definition.waypoints) || definition.waypoints.length < 2) {
    errors.push(createPatrolError(
      ENGINE_V2_PATROL_ERRORS.DEFINITION_INVALID,
      "Patrol definition requires behaviorId, instanceId, mode, speed, tolerance, and at least two waypoints.",
      path
    ));
    return errors;
  }

  definition.waypoints.forEach((waypoint, index) => {
    if (!isRecord(waypoint) || !Number.isFinite(waypoint.x) || !Number.isFinite(waypoint.y) || !Number.isFinite(waypoint.pauseMs) || waypoint.pauseMs < 0) {
      errors.push(createPatrolError(
        ENGINE_V2_PATROL_ERRORS.WAYPOINT_INVALID,
        "Patrol waypoint requires numeric x, y, and non-negative pauseMs.",
        `${path}.waypoints[${index}]`
      ));
    }
  });

  return errors;
}

function validatePatrolState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.behaviorId) || !Number.isInteger(state.waypointIndex) || state.waypointIndex < 0 || ![1, -1].includes(state.direction) || !Number.isFinite(state.pauseRemainingMs) || state.pauseRemainingMs < 0) {
    return [createPatrolError(
      ENGINE_V2_PATROL_ERRORS.STATE_INVALID,
      "Patrol state requires behaviorId, waypointIndex, direction, and pauseRemainingMs.",
      path
    )];
  }

  return [];
}

function createMovementCommand(instanceId, position, velocity, reachedWaypoint) {
  return {
    command: "setRuntimeObjectMotion",
    instanceId,
    position: Object.freeze({ x: position.x, y: position.y }),
    velocity: Object.freeze({ x: velocity.x, y: velocity.y }),
    reachedWaypoint,
  };
}

function createPatrolResult({ patrolStates, movementCommands, waypointEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    patrolStates: Object.freeze(patrolStates),
    movementCommands: Object.freeze(movementCommands),
    waypointEvents: Object.freeze(waypointEvents),
    errors: Object.freeze(errors),
  });
}

function createPatrolError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
