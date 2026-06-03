/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2AbilitySystem.js
*/

export const ENGINE_V2_ABILITY_TYPES = Object.freeze({
  ACTIVE: "active",
  PASSIVE: "passive",
});

export const ENGINE_V2_ABILITY_TRIGGER_TYPES = Object.freeze({
  CONDITION: "condition",
  EVENT: "event",
  ACTION: "action",
});

export const ENGINE_V2_ABILITY_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_ABILITY_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_ABILITY_STATES_INVALID",
  CONDITIONS_INVALID: "ENGINE_V2_ABILITY_CONDITIONS_INVALID",
  EVENTS_INVALID: "ENGINE_V2_ABILITY_EVENTS_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_ABILITY_ACTIONS_INVALID",
  COOLDOWN_RESULT_INVALID: "ENGINE_V2_ABILITY_COOLDOWN_RESULT_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_ABILITY_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_ABILITY_STATE_INVALID",
  TRIGGER_INVALID: "ENGINE_V2_ABILITY_TRIGGER_INVALID",
  ACTIVE_COOLDOWN_REQUIRED: "ENGINE_V2_ACTIVE_ABILITY_COOLDOWN_REQUIRED",
  STATE_MISSING: "ENGINE_V2_ABILITY_STATE_MISSING",
});

export function resolveEngineV2Abilities({ abilityDefinitions, abilityStates, conditionMatches, runtimeEvents, actionOutcomes, cooldownResult }) {
  const errors = [];

  if (!Array.isArray(abilityDefinitions)) {
    errors.push(createAbilityError(ENGINE_V2_ABILITY_ERRORS.DEFINITIONS_INVALID, "Ability runtime requires abilityDefinitions array.", "abilityDefinitions"));
  }

  if (!Array.isArray(abilityStates)) {
    errors.push(createAbilityError(ENGINE_V2_ABILITY_ERRORS.STATES_INVALID, "Ability runtime requires abilityStates array.", "abilityStates"));
  }

  if (!Array.isArray(conditionMatches)) {
    errors.push(createAbilityError(ENGINE_V2_ABILITY_ERRORS.CONDITIONS_INVALID, "Ability runtime requires conditionMatches array.", "conditionMatches"));
  }

  if (!Array.isArray(runtimeEvents)) {
    errors.push(createAbilityError(ENGINE_V2_ABILITY_ERRORS.EVENTS_INVALID, "Ability runtime requires runtimeEvents array.", "runtimeEvents"));
  }

  if (!Array.isArray(actionOutcomes)) {
    errors.push(createAbilityError(ENGINE_V2_ABILITY_ERRORS.ACTIONS_INVALID, "Ability runtime requires actionOutcomes array.", "actionOutcomes"));
  }

  if (!isCooldownResult(cooldownResult)) {
    errors.push(createAbilityError(ENGINE_V2_ABILITY_ERRORS.COOLDOWN_RESULT_INVALID, "Ability runtime requires cooldownResult with acceptedRequests and blockedRequests arrays.", "cooldownResult"));
  }

  if (errors.length > 0) {
    return createAbilityResult({ abilityEvents: [], abilityActionRequests: [], blockedAbilityEvents: [], errors });
  }

  abilityDefinitions.forEach((definition, index) => {
    validateAbilityDefinition(definition, `abilityDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  abilityStates.forEach((state, index) => {
    validateAbilityState(state, `abilityStates[${index}]`).forEach((error) => errors.push(error));
  });

  abilityDefinitions.forEach((definition, index) => {
    if (!abilityStates.some((state) => state.abilityId === definition.abilityId)) {
      errors.push(createAbilityError(
        ENGINE_V2_ABILITY_ERRORS.STATE_MISSING,
        "Ability definition requires matching ability state.",
        `abilityDefinitions[${index}].abilityId`
      ));
    }
  });

  if (errors.length > 0) {
    return createAbilityResult({ abilityEvents: [], abilityActionRequests: [], blockedAbilityEvents: [], errors });
  }

  const statesById = new Map(abilityStates.map((state) => [state.abilityId, state]));
  const abilityEvents = [];
  const abilityActionRequests = [];
  const blockedAbilityEvents = [];

  abilityDefinitions.forEach((definition) => {
    const state = statesById.get(definition.abilityId);

    if (!state.enabled) {
      return;
    }

    const triggerMatches = getTriggerMatches(definition.trigger, { conditionMatches, runtimeEvents, actionOutcomes });

    triggerMatches.forEach((triggerMatch) => {
      if (definition.abilityType === ENGINE_V2_ABILITY_TYPES.ACTIVE) {
        const acceptedCooldown = cooldownResult.acceptedRequests.find((request) => request.cooldownId === definition.cooldownId);
        const blockedCooldown = cooldownResult.blockedRequests.find((request) => request.cooldownId === definition.cooldownId);

        if (!acceptedCooldown) {
          blockedAbilityEvents.push(Object.freeze({
            abilityId: definition.abilityId,
            ownerInstanceId: definition.ownerInstanceId,
            cooldownId: definition.cooldownId,
            reason: blockedCooldown ? "cooldownBlocked" : "cooldownNotAccepted",
          }));
          return;
        }
      }

      const abilityEvent = Object.freeze({
        abilityId: definition.abilityId,
        abilityType: definition.abilityType,
        ownerInstanceId: definition.ownerInstanceId,
        sourceType: triggerMatch.sourceType,
        sourceId: triggerMatch.sourceId,
      });

      abilityEvents.push(abilityEvent);
      definition.actionIds.forEach((actionId) => {
        abilityActionRequests.push(Object.freeze({
          abilityId: definition.abilityId,
          ownerInstanceId: definition.ownerInstanceId,
          actionId,
          sourceId: triggerMatch.sourceId,
        }));
      });
    });
  });

  return createAbilityResult({ abilityEvents, abilityActionRequests, blockedAbilityEvents, errors });
}

function getTriggerMatches(trigger, { conditionMatches, runtimeEvents, actionOutcomes }) {
  if (trigger.triggerType === ENGINE_V2_ABILITY_TRIGGER_TYPES.CONDITION) {
    return conditionMatches
      .filter((conditionMatch) => conditionMatch.conditionId === trigger.conditionId)
      .map((conditionMatch) => ({
        sourceType: "condition",
        sourceId: conditionMatch.conditionId,
      }));
  }

  if (trigger.triggerType === ENGINE_V2_ABILITY_TRIGGER_TYPES.EVENT) {
    return runtimeEvents
      .filter((runtimeEvent) => runtimeEvent.eventType === trigger.eventType)
      .map((runtimeEvent) => ({
        sourceType: "event",
        sourceId: runtimeEvent.eventId,
      }));
  }

  if (trigger.triggerType === ENGINE_V2_ABILITY_TRIGGER_TYPES.ACTION) {
    return actionOutcomes
      .filter((actionOutcome) => actionOutcome.actionType === trigger.actionType)
      .map((actionOutcome) => ({
        sourceType: "action",
        sourceId: actionOutcome.actionId,
      }));
  }

  return [];
}

function validateAbilityDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition) || !hasNonEmptyString(definition.abilityId) || !hasNonEmptyString(definition.ownerInstanceId) || ![ENGINE_V2_ABILITY_TYPES.ACTIVE, ENGINE_V2_ABILITY_TYPES.PASSIVE].includes(definition.abilityType) || !isStringArray(definition.actionIds)) {
    errors.push(createAbilityError(
      ENGINE_V2_ABILITY_ERRORS.DEFINITION_INVALID,
      "Ability definition requires abilityId, ownerInstanceId, abilityType, and actionIds.",
      path
    ));
    return errors;
  }

  validateTrigger(definition.trigger, `${path}.trigger`).forEach((error) => errors.push(error));

  if (definition.abilityType === ENGINE_V2_ABILITY_TYPES.ACTIVE && !hasNonEmptyString(definition.cooldownId)) {
    errors.push(createAbilityError(
      ENGINE_V2_ABILITY_ERRORS.ACTIVE_COOLDOWN_REQUIRED,
      "Active ability definition requires cooldownId.",
      `${path}.cooldownId`
    ));
  }

  return errors;
}

function validateTrigger(trigger, path) {
  if (!isRecord(trigger)) {
    return [createAbilityError(ENGINE_V2_ABILITY_ERRORS.TRIGGER_INVALID, "Ability trigger must be an object.", path)];
  }

  if (trigger.triggerType === ENGINE_V2_ABILITY_TRIGGER_TYPES.CONDITION && hasNonEmptyString(trigger.conditionId)) {
    return [];
  }

  if (trigger.triggerType === ENGINE_V2_ABILITY_TRIGGER_TYPES.EVENT && hasNonEmptyString(trigger.eventType)) {
    return [];
  }

  if (trigger.triggerType === ENGINE_V2_ABILITY_TRIGGER_TYPES.ACTION && hasNonEmptyString(trigger.actionType)) {
    return [];
  }

  return [createAbilityError(
    ENGINE_V2_ABILITY_ERRORS.TRIGGER_INVALID,
    "Ability trigger requires triggerType plus matching conditionId, eventType, or actionType.",
    path
  )];
}

function validateAbilityState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.abilityId) || typeof state.enabled !== "boolean") {
    return [createAbilityError(
      ENGINE_V2_ABILITY_ERRORS.STATE_INVALID,
      "Ability state requires abilityId and enabled.",
      path
    )];
  }

  return [];
}

function createAbilityResult({ abilityEvents, abilityActionRequests, blockedAbilityEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    abilityEvents: Object.freeze(abilityEvents),
    abilityActionRequests: Object.freeze(abilityActionRequests),
    blockedAbilityEvents: Object.freeze(blockedAbilityEvents),
    errors: Object.freeze(errors),
  });
}

function createAbilityError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isCooldownResult(value) {
  return isRecord(value) && Array.isArray(value.acceptedRequests) && Array.isArray(value.blockedRequests);
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
