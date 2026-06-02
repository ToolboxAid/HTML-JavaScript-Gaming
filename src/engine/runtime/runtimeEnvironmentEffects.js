/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeEnvironmentEffects.js
*/

export const RUNTIME_ENVIRONMENT_EFFECT_ERRORS = Object.freeze({
  OBJECTS_INVALID: "RUNTIME_ENVIRONMENT_EFFECT_OBJECTS_INVALID",
  FORCES_INVALID: "RUNTIME_ENVIRONMENT_EFFECT_FORCES_INVALID",
  DELTA_INVALID: "RUNTIME_ENVIRONMENT_EFFECT_DELTA_INVALID",
});

export function applyRuntimeEnvironmentEffects(runtimeObjects, environmentForces, { deltaSeconds }) {
  const errors = [];

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createEnvironmentEffectError(RUNTIME_ENVIRONMENT_EFFECT_ERRORS.OBJECTS_INVALID, "Environment effects require runtimeObjects array.", "runtimeObjects"));
  }

  if (!Array.isArray(environmentForces)) {
    errors.push(createEnvironmentEffectError(RUNTIME_ENVIRONMENT_EFFECT_ERRORS.FORCES_INVALID, "Environment effects require environmentForces array.", "environmentForces"));
  }

  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
    errors.push(createEnvironmentEffectError(RUNTIME_ENVIRONMENT_EFFECT_ERRORS.DELTA_INVALID, "Environment effects require explicit non-negative deltaSeconds.", "deltaSeconds"));
  }

  if (errors.length > 0) {
    return createEnvironmentEffectResult({ runtimeObjects: [], errors });
  }

  const affectedObjects = runtimeObjects.map((runtimeObject) => {
    if (runtimeObject.objectType !== "dynamic") {
      return runtimeObject;
    }

    const velocity = environmentForces.reduce(
      (currentVelocity, force) => {
        if (!force.vector || !Number.isFinite(force.strength)) {
          return currentVelocity;
        }

        return {
          x: currentVelocity.x + force.vector.x * force.strength * deltaSeconds,
          y: currentVelocity.y + force.vector.y * force.strength * deltaSeconds,
        };
      },
      { x: runtimeObject.velocity.x, y: runtimeObject.velocity.y }
    );

    return Object.freeze({
      ...runtimeObject,
      velocity: Object.freeze(velocity),
    });
  });

  return createEnvironmentEffectResult({ runtimeObjects: affectedObjects, errors });
}

function createEnvironmentEffectResult({ runtimeObjects, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeObjects: Object.freeze(runtimeObjects),
    errors: Object.freeze(errors),
  });
}

function createEnvironmentEffectError(code, message, path) {
  return Object.freeze({ code, message, path });
}
