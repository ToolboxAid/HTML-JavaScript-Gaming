/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeMovementProcessing.js
*/

export const RUNTIME_MOVEMENT_ERRORS = Object.freeze({
  OBJECTS_INVALID: "RUNTIME_MOVEMENT_OBJECTS_INVALID",
  DELTA_INVALID: "RUNTIME_MOVEMENT_DELTA_INVALID",
  POSITION_INVALID: "RUNTIME_MOVEMENT_POSITION_INVALID",
  VELOCITY_INVALID: "RUNTIME_MOVEMENT_VELOCITY_INVALID",
});

export function processRuntimeMovement(runtimeObjects, { deltaSeconds }) {
  const errors = [];

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createMovementError(RUNTIME_MOVEMENT_ERRORS.OBJECTS_INVALID, "Runtime movement requires runtimeObjects array.", "runtimeObjects"));
  }

  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
    errors.push(createMovementError(RUNTIME_MOVEMENT_ERRORS.DELTA_INVALID, "Runtime movement requires explicit non-negative deltaSeconds.", "deltaSeconds"));
  }

  if (errors.length > 0) {
    return createMovementResult({ runtimeObjects: [], errors });
  }

  const movedObjects = runtimeObjects.map((runtimeObject, index) => {
    const path = `runtimeObjects[${index}]`;

    if (!isPoint(runtimeObject.position)) {
      errors.push(createMovementError(RUNTIME_MOVEMENT_ERRORS.POSITION_INVALID, "Runtime movement requires explicit object position.", `${path}.position`));
    }

    if (!isPoint(runtimeObject.velocity)) {
      errors.push(createMovementError(RUNTIME_MOVEMENT_ERRORS.VELOCITY_INVALID, "Runtime movement requires explicit object velocity.", `${path}.velocity`));
    }

    if (errors.some((error) => error.path.startsWith(path))) {
      return runtimeObject;
    }

    if (runtimeObject.objectType !== "dynamic") {
      return runtimeObject;
    }

    return Object.freeze({
      ...runtimeObject,
      previousPosition: freezePoint(runtimeObject.position),
      position: Object.freeze({
        x: runtimeObject.position.x + runtimeObject.velocity.x * deltaSeconds,
        y: runtimeObject.position.y + runtimeObject.velocity.y * deltaSeconds,
      }),
    });
  });

  return createMovementResult({
    runtimeObjects: errors.length === 0 ? movedObjects : [],
    errors,
  });
}

function createMovementResult({ runtimeObjects, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeObjects: Object.freeze(runtimeObjects),
    errors: Object.freeze(errors),
  });
}

function createMovementError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function freezePoint(value) {
  return Object.freeze({ x: value.x, y: value.y });
}

function isPoint(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}
