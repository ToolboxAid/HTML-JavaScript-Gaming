/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2AnimationRuntime.js
*/

export const ENGINE_V2_ANIMATION_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_ANIMATION_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_ANIMATION_STATES_INVALID",
  RUNTIME_OBJECT_STATES_INVALID: "ENGINE_V2_ANIMATION_RUNTIME_OBJECT_STATES_INVALID",
  DELTA_INVALID: "ENGINE_V2_ANIMATION_DELTA_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_ANIMATION_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_ANIMATION_STATE_INVALID",
  ANIMATION_MISSING: "ENGINE_V2_ANIMATION_MISSING",
  RUNTIME_ANIMATION_MISSING: "ENGINE_V2_RUNTIME_ANIMATION_MISSING",
});

export function updateEngineV2Animations({ animationDefinitions, objectAnimationStates, runtimeObjectStates, deltaMs }) {
  const errors = [];

  if (!Array.isArray(animationDefinitions)) {
    errors.push(createAnimationError(
      ENGINE_V2_ANIMATION_ERRORS.DEFINITIONS_INVALID,
      "Engine V2 animation runtime requires animationDefinitions array.",
      "animationDefinitions"
    ));
  }

  if (!Array.isArray(objectAnimationStates)) {
    errors.push(createAnimationError(
      ENGINE_V2_ANIMATION_ERRORS.STATES_INVALID,
      "Engine V2 animation runtime requires objectAnimationStates array.",
      "objectAnimationStates"
    ));
  }

  if (!isRecord(runtimeObjectStates)) {
    errors.push(createAnimationError(
      ENGINE_V2_ANIMATION_ERRORS.RUNTIME_OBJECT_STATES_INVALID,
      "Engine V2 animation runtime requires runtimeObjectStates object.",
      "runtimeObjectStates"
    ));
  }

  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    errors.push(createAnimationError(
      ENGINE_V2_ANIMATION_ERRORS.DELTA_INVALID,
      "Engine V2 animation runtime requires non-negative numeric deltaMs.",
      "deltaMs"
    ));
  }

  if (errors.length > 0) {
    return createAnimationResult({ animationStates: [], frameCommands: [], errors });
  }

  animationDefinitions.forEach((definition, index) => {
    validateAnimationDefinition(definition, `animationDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  objectAnimationStates.forEach((animationState, index) => {
    validateAnimationState(animationState, `objectAnimationStates[${index}]`).forEach((error) => errors.push(error));
  });

  if (errors.length > 0) {
    return createAnimationResult({ animationStates: [], frameCommands: [], errors });
  }

  const definitionsById = new Map(animationDefinitions.map((definition) => [definition.animationId, definition]));

  objectAnimationStates.forEach((animationState, index) => {
    if (!definitionsById.has(animationState.animationId)) {
      errors.push(createAnimationError(
        ENGINE_V2_ANIMATION_ERRORS.ANIMATION_MISSING,
        "Object animation state references missing animation definition.",
        `objectAnimationStates[${index}].animationId`
      ));
    }

    const runtimeObjectState = runtimeObjectStates[animationState.instanceId];

    if (isRecord(runtimeObjectState) && Object.prototype.hasOwnProperty.call(runtimeObjectState, "animationId") && !definitionsById.has(runtimeObjectState.animationId)) {
      errors.push(createAnimationError(
        ENGINE_V2_ANIMATION_ERRORS.RUNTIME_ANIMATION_MISSING,
        "Runtime object state references missing animation definition.",
        `runtimeObjectStates.${animationState.instanceId}.animationId`
      ));
    }
  });

  if (errors.length > 0) {
    return createAnimationResult({ animationStates: [], frameCommands: [], errors });
  }

  const animationStates = objectAnimationStates.map((animationState) => Object.freeze(advanceAnimationState(
    animationState,
    runtimeObjectStates[animationState.instanceId],
    definitionsById,
    deltaMs
  )));
  const frameCommands = animationStates.map((animationState) => {
    const definition = definitionsById.get(animationState.animationId);

    return Object.freeze({
      command: "setAnimationFrame",
      instanceId: animationState.instanceId,
      animationId: animationState.animationId,
      frame: definition.frames[animationState.frameIndex],
      frameIndex: animationState.frameIndex,
      finished: animationState.finished,
    });
  });

  return createAnimationResult({ animationStates, frameCommands, errors });
}

function advanceAnimationState(animationState, runtimeObjectState, definitionsById, deltaMs) {
  const requestedAnimationId = isRecord(runtimeObjectState) && hasNonEmptyString(runtimeObjectState.animationId)
    ? runtimeObjectState.animationId
    : animationState.animationId;
  const animationChanged = requestedAnimationId !== animationState.animationId;
  const definition = definitionsById.get(requestedAnimationId);
  const nextState = {
    instanceId: animationState.instanceId,
    animationId: requestedAnimationId,
    frameIndex: animationChanged ? 0 : animationState.frameIndex,
    elapsedMs: animationChanged ? 0 : animationState.elapsedMs,
    finished: animationChanged ? false : animationState.finished,
  };

  if (nextState.finished && definition.loop === false) {
    return nextState;
  }

  nextState.elapsedMs += deltaMs;

  while (nextState.elapsedMs >= definition.frameDurationMs && !nextState.finished) {
    nextState.elapsedMs -= definition.frameDurationMs;

    if (nextState.frameIndex < definition.frames.length - 1) {
      nextState.frameIndex += 1;
      continue;
    }

    if (definition.loop === false) {
      nextState.finished = true;
      nextState.frameIndex = definition.frames.length - 1;
      nextState.elapsedMs = 0;
      break;
    }

    nextState.frameIndex = 0;
  }

  return nextState;
}

function validateAnimationDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.animationId) || !isStringArray(definition.frames) || !Number.isFinite(definition.frameDurationMs) || definition.frameDurationMs <= 0 || typeof definition.loop !== "boolean") {
    return [createAnimationError(
      ENGINE_V2_ANIMATION_ERRORS.DEFINITION_INVALID,
      "Animation definition requires animationId, frames, frameDurationMs, and loop.",
      path
    )];
  }

  return [];
}

function validateAnimationState(animationState, path) {
  if (!isRecord(animationState) || !hasNonEmptyString(animationState.instanceId) || !hasNonEmptyString(animationState.animationId) || !Number.isInteger(animationState.frameIndex) || animationState.frameIndex < 0 || !Number.isFinite(animationState.elapsedMs) || animationState.elapsedMs < 0 || typeof animationState.finished !== "boolean") {
    return [createAnimationError(
      ENGINE_V2_ANIMATION_ERRORS.STATE_INVALID,
      "Animation state requires instanceId, animationId, frameIndex, elapsedMs, and finished.",
      path
    )];
  }

  return [];
}

function createAnimationResult({ animationStates, frameCommands, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    animationStates: Object.freeze(animationStates),
    frameCommands: Object.freeze(frameCommands),
    errors: Object.freeze(errors),
  });
}

function createAnimationError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => hasNonEmptyString(item));
}
