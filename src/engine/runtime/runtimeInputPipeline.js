/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeInputPipeline.js
*/

export const RUNTIME_INPUT_PIPELINE_ERRORS = Object.freeze({
  BINDINGS_INVALID: "RUNTIME_INPUT_BINDINGS_INVALID",
  ACTION_ID_REQUIRED: "RUNTIME_INPUT_ACTION_ID_REQUIRED",
  KEYS_INVALID: "RUNTIME_INPUT_KEYS_INVALID",
  VELOCITY_INVALID: "RUNTIME_INPUT_VELOCITY_INVALID",
});

export function createRuntimeInputPipeline(bindings) {
  const errors = [];

  if (!Array.isArray(bindings)) {
    errors.push(createInputPipelineError(RUNTIME_INPUT_PIPELINE_ERRORS.BINDINGS_INVALID, "Input pipeline requires bindings array.", "bindings"));
    return createInputPipelineResult({ inputPipeline: null, actions: [], errors });
  }

  const normalizedBindings = bindings.map((binding, index) => {
    const path = `bindings[${index}]`;

    if (!hasNonEmptyString(binding.actionId)) {
      errors.push(createInputPipelineError(RUNTIME_INPUT_PIPELINE_ERRORS.ACTION_ID_REQUIRED, "Input binding requires actionId.", `${path}.actionId`));
    }

    if (!isStringArray(binding.keys)) {
      errors.push(createInputPipelineError(RUNTIME_INPUT_PIPELINE_ERRORS.KEYS_INVALID, "Input binding requires explicit keys.", `${path}.keys`));
    }

    if (binding.velocity !== undefined && !isPoint(binding.velocity)) {
      errors.push(createInputPipelineError(RUNTIME_INPUT_PIPELINE_ERRORS.VELOCITY_INVALID, "Input binding velocity must include numeric x and y when provided.", `${path}.velocity`));
    }

    return Object.freeze({
      actionId: hasNonEmptyString(binding.actionId) ? binding.actionId.trim() : "",
      keys: Object.freeze(isStringArray(binding.keys) ? binding.keys.map((key) => key.trim()) : []),
      targetInstanceId: hasNonEmptyString(binding.targetInstanceId) ? binding.targetInstanceId.trim() : "",
      velocity: binding.velocity === undefined ? null : Object.freeze({ x: binding.velocity.x, y: binding.velocity.y }),
    });
  });

  if (errors.length > 0) {
    return createInputPipelineResult({ inputPipeline: null, actions: [], errors });
  }

  return createInputPipelineResult({
    inputPipeline: Object.freeze({ bindings: Object.freeze(normalizedBindings) }),
    actions: [],
    errors,
  });
}

export function resolveRuntimeInputActions(inputPipeline, inputEvents) {
  const errors = [];

  if (!inputPipeline || !Array.isArray(inputPipeline.bindings)) {
    errors.push(createInputPipelineError(RUNTIME_INPUT_PIPELINE_ERRORS.BINDINGS_INVALID, "Input action resolution requires inputPipeline.", "inputPipeline"));
  }

  if (!Array.isArray(inputEvents)) {
    errors.push(createInputPipelineError(RUNTIME_INPUT_PIPELINE_ERRORS.BINDINGS_INVALID, "Input action resolution requires inputEvents array.", "inputEvents"));
  }

  if (errors.length > 0) {
    return createInputPipelineResult({ inputPipeline, actions: [], errors });
  }

  const pressedKeys = new Set(inputEvents.filter((event) => event.pressed === true).map((event) => event.key));
  const actions = inputPipeline.bindings
    .filter((binding) => binding.keys.some((key) => pressedKeys.has(key)))
    .map((binding) => Object.freeze({
      actionId: binding.actionId,
      targetInstanceId: binding.targetInstanceId,
      velocity: binding.velocity,
    }));

  return createInputPipelineResult({ inputPipeline, actions, errors });
}

function createInputPipelineResult({ inputPipeline, actions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    inputPipeline,
    actions: Object.freeze(actions),
    errors: Object.freeze(errors),
  });
}

function createInputPipelineError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isPoint(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => hasNonEmptyString(item));
}
