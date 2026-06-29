/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeTriggerProcessing.js
*/

import { resolveRuntimeActions } from "./runtimeActionSystem.js";
import { evaluateRuntimeConditions } from "./runtimeConditionSystem.js";
import { publishRuntimeEvents } from "./runtimeEventSystem.js";

export const RUNTIME_TRIGGER_PROCESSING_ERRORS = Object.freeze({
  INPUT_INVALID: "RUNTIME_TRIGGER_INPUT_INVALID",
  CONDITIONS_FAILED: "RUNTIME_TRIGGER_CONDITIONS_FAILED",
  EVENTS_FAILED: "RUNTIME_TRIGGER_EVENTS_FAILED",
  ACTIONS_FAILED: "RUNTIME_TRIGGER_ACTIONS_FAILED",
});

export function processRuntimeTriggers(triggerInput) {
  const inputErrors = validateTriggerInput(triggerInput);

  if (inputErrors.length > 0) {
    return createTriggerProcessingResult({
      conditionMatches: [],
      runtimeEvents: [],
      publishedEvents: [],
      actionOutcomes: [],
      errors: inputErrors,
    });
  }

  const conditionResult = evaluateRuntimeConditions(triggerInput.conditionDefinitions, triggerInput.runtimeFacts);

  if (!conditionResult.valid) {
    return createTriggerProcessingResult({
      conditionMatches: [],
      runtimeEvents: [],
      publishedEvents: [],
      actionOutcomes: [],
      errors: [
        createTriggerProcessingError(
          RUNTIME_TRIGGER_PROCESSING_ERRORS.CONDITIONS_FAILED,
          "Trigger processing stopped because condition evaluation failed.",
          "conditionDefinitions"
        ),
        ...conditionResult.errors,
      ],
    });
  }

  const eventResult = publishRuntimeEvents(conditionResult.conditionMatches, triggerInput.runtimeEvents);

  if (!eventResult.valid) {
    return createTriggerProcessingResult({
      conditionMatches: conditionResult.conditionMatches,
      runtimeEvents: [],
      publishedEvents: [],
      actionOutcomes: [],
      errors: [
        createTriggerProcessingError(
          RUNTIME_TRIGGER_PROCESSING_ERRORS.EVENTS_FAILED,
          "Trigger processing stopped because event publishing failed.",
          "runtimeEvents"
        ),
        ...eventResult.errors,
      ],
    });
  }

  const actionResult = resolveRuntimeActions(triggerInput.actionDefinitions, eventResult.runtimeEvents);

  if (!actionResult.valid) {
    return createTriggerProcessingResult({
      conditionMatches: conditionResult.conditionMatches,
      runtimeEvents: eventResult.runtimeEvents,
      publishedEvents: eventResult.publishedEvents,
      actionOutcomes: [],
      errors: [
        createTriggerProcessingError(
          RUNTIME_TRIGGER_PROCESSING_ERRORS.ACTIONS_FAILED,
          "Trigger processing stopped because action resolution failed.",
          "actionDefinitions"
        ),
        ...actionResult.errors,
      ],
    });
  }

  return createTriggerProcessingResult({
    conditionMatches: conditionResult.conditionMatches,
    runtimeEvents: eventResult.runtimeEvents,
    publishedEvents: eventResult.publishedEvents,
    actionOutcomes: actionResult.actionOutcomes,
    errors: [],
  });
}

function validateTriggerInput(triggerInput) {
  if (!isRecord(triggerInput)) {
    return [createTriggerProcessingError(
      RUNTIME_TRIGGER_PROCESSING_ERRORS.INPUT_INVALID,
      "Trigger processing requires triggerInput object.",
      "triggerInput"
    )];
  }

  return [];
}

function createTriggerProcessingResult({ conditionMatches, runtimeEvents, publishedEvents, actionOutcomes, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    conditionMatches: Object.freeze(conditionMatches),
    runtimeEvents: Object.freeze(runtimeEvents),
    publishedEvents: Object.freeze(publishedEvents),
    actionOutcomes: Object.freeze(actionOutcomes),
    errors: Object.freeze(errors),
  });
}

function createTriggerProcessingError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
