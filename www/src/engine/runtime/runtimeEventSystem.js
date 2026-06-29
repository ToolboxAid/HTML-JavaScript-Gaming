/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeEventSystem.js
*/

import { cloneRuntimeValue } from "../../shared/runtime/snapshotClone.js";

export const RUNTIME_EVENT_ERRORS = Object.freeze({
  CONDITION_MATCHES_INVALID: "RUNTIME_EVENT_CONDITION_MATCHES_INVALID",
  RUNTIME_EVENTS_INVALID: "RUNTIME_EVENT_RUNTIME_EVENTS_INVALID",
  CONDITION_MATCH_INVALID: "RUNTIME_EVENT_CONDITION_MATCH_INVALID",
  RUNTIME_EVENT_INVALID: "RUNTIME_EVENT_RUNTIME_EVENT_INVALID",
  EVENT_TYPE_REQUIRED: "RUNTIME_EVENT_TYPE_REQUIRED",
  EVENT_ID_REQUIRED: "RUNTIME_EVENT_ID_REQUIRED",
});

export function publishRuntimeEvents(conditionMatches, runtimeEvents) {
  const errors = [];

  if (!Array.isArray(conditionMatches)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.CONDITION_MATCHES_INVALID,
      "Runtime event publishing requires conditionMatches array.",
      "conditionMatches"
    ));
  }

  if (!Array.isArray(runtimeEvents)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.RUNTIME_EVENTS_INVALID,
      "Runtime event publishing requires runtimeEvents array.",
      "runtimeEvents"
    ));
  }

  if (errors.length > 0) {
    return createEventPublishResult({ runtimeEvents: [], publishedEvents: [], errors });
  }

  runtimeEvents.forEach((runtimeEvent, index) => {
    validateRuntimeEvent(runtimeEvent, `runtimeEvents[${index}]`).forEach((error) => errors.push(error));
  });

  conditionMatches.forEach((conditionMatch, index) => {
    validateConditionMatch(conditionMatch, `conditionMatches[${index}]`).forEach((error) => errors.push(error));
  });

  if (errors.length > 0) {
    return createEventPublishResult({ runtimeEvents: [], publishedEvents: [], errors });
  }

  const publishedEvents = conditionMatches.map((conditionMatch, index) => Object.freeze({
    eventId: `event.${conditionMatch.eventType}.${conditionMatch.conditionId}.${index}`,
    eventType: conditionMatch.eventType,
    conditionId: conditionMatch.conditionId,
    payload: Object.freeze(cloneRuntimeValue(conditionMatch.payload)),
  }));

  return createEventPublishResult({
    runtimeEvents: [...runtimeEvents, ...publishedEvents].map((runtimeEvent) => Object.freeze(cloneRuntimeValue(runtimeEvent))),
    publishedEvents,
    errors,
  });
}

function validateConditionMatch(conditionMatch, path) {
  const errors = [];

  if (!isRecord(conditionMatch)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.CONDITION_MATCH_INVALID,
      "Condition match must be an object.",
      path
    ));
    return errors;
  }

  if (!hasNonEmptyString(conditionMatch.conditionId)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.CONDITION_MATCH_INVALID,
      "Condition match requires conditionId.",
      `${path}.conditionId`
    ));
  }

  if (!hasNonEmptyString(conditionMatch.eventType)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.EVENT_TYPE_REQUIRED,
      "Condition match requires eventType.",
      `${path}.eventType`
    ));
  }

  if (!isRecord(conditionMatch.payload)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.CONDITION_MATCH_INVALID,
      "Condition match requires payload object.",
      `${path}.payload`
    ));
  }

  return errors;
}

function validateRuntimeEvent(runtimeEvent, path) {
  const errors = [];

  if (!isRecord(runtimeEvent)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.RUNTIME_EVENT_INVALID,
      "Runtime event must be an object.",
      path
    ));
    return errors;
  }

  if (!hasNonEmptyString(runtimeEvent.eventId)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.EVENT_ID_REQUIRED,
      "Runtime event requires eventId.",
      `${path}.eventId`
    ));
  }

  if (!hasNonEmptyString(runtimeEvent.eventType)) {
    errors.push(createEventError(
      RUNTIME_EVENT_ERRORS.EVENT_TYPE_REQUIRED,
      "Runtime event requires eventType.",
      `${path}.eventType`
    ));
  }

  return errors;
}

function createEventPublishResult({ runtimeEvents, publishedEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeEvents: Object.freeze(runtimeEvents),
    publishedEvents: Object.freeze(publishedEvents),
    errors: Object.freeze(errors),
  });
}

function createEventError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
