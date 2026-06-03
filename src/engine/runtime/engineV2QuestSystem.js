/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2QuestSystem.js
*/

export const ENGINE_V2_QUEST_STATUS = Object.freeze({
  LOCKED: "locked",
  AVAILABLE: "available",
  ACTIVE: "active",
  COMPLETED: "completed",
});

export const ENGINE_V2_QUEST_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_QUEST_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_QUEST_STATES_INVALID",
  OBJECTIVES_INVALID: "ENGINE_V2_QUEST_OBJECTIVES_INVALID",
  TRIGGERS_INVALID: "ENGINE_V2_QUEST_TRIGGERS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_QUEST_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_QUEST_STATE_INVALID",
  STATE_MISSING: "ENGINE_V2_QUEST_STATE_MISSING",
  OBJECTIVE_MISSING: "ENGINE_V2_QUEST_OBJECTIVE_MISSING",
});

const QUEST_STATUS_LIST = Object.freeze(Object.values(ENGINE_V2_QUEST_STATUS));

export function processEngineV2Quests({ questDefinitions, questStates, objectiveStates, triggerEvents }) {
  const errors = [];

  if (!Array.isArray(questDefinitions)) {
    errors.push(createQuestError(ENGINE_V2_QUEST_ERRORS.DEFINITIONS_INVALID, "Quest system requires questDefinitions array.", "questDefinitions"));
  }

  if (!Array.isArray(questStates)) {
    errors.push(createQuestError(ENGINE_V2_QUEST_ERRORS.STATES_INVALID, "Quest system requires questStates array.", "questStates"));
  }

  if (!Array.isArray(objectiveStates)) {
    errors.push(createQuestError(ENGINE_V2_QUEST_ERRORS.OBJECTIVES_INVALID, "Quest system requires objectiveStates array.", "objectiveStates"));
  }

  if (!Array.isArray(triggerEvents)) {
    errors.push(createQuestError(ENGINE_V2_QUEST_ERRORS.TRIGGERS_INVALID, "Quest system requires triggerEvents array.", "triggerEvents"));
  }

  if (errors.length > 0) {
    return createQuestResult({ questStates: [], questEvents: [], rewardRequests: [], triggerRequests: [], errors });
  }

  questDefinitions.forEach((definition, index) => validateQuestDefinition(definition, `questDefinitions[${index}]`).forEach((error) => errors.push(error)));
  questStates.forEach((state, index) => validateQuestState(state, `questStates[${index}]`).forEach((error) => errors.push(error)));

  questDefinitions.forEach((definition, index) => {
    if (!questStates.some((state) => state.questId === definition.questId)) {
      errors.push(createQuestError(ENGINE_V2_QUEST_ERRORS.STATE_MISSING, "Quest definition requires matching quest state.", `questDefinitions[${index}].questId`));
    }
    definition.steps.forEach((step) => {
      if (!objectiveStates.some((state) => state.objectiveId === step.objectiveId)) {
        errors.push(createQuestError(ENGINE_V2_QUEST_ERRORS.OBJECTIVE_MISSING, "Quest step references missing objective state.", `questDefinitions[${index}].steps`));
      }
    });
  });

  if (errors.length > 0) {
    return createQuestResult({ questStates: [], questEvents: [], rewardRequests: [], triggerRequests: [], errors });
  }

  const statesById = new Map(questStates.map((state) => [state.questId, state]));
  const objectiveStatesById = new Map(objectiveStates.map((state) => [state.objectiveId, state]));
  const questEvents = [];
  const rewardRequests = [];
  const triggerRequests = [];

  const nextStates = questDefinitions.map((definition) => {
    const state = statesById.get(definition.questId);
    const prerequisitesComplete = definition.prerequisiteQuestIds.every((questId) => statesById.get(questId)?.status === ENGINE_V2_QUEST_STATUS.COMPLETED);
    const triggered = definition.triggerIds.length === 0 || definition.triggerIds.some((triggerId) => triggerEvents.some((event) => event.triggerId === triggerId));
    const stepCompletions = definition.steps.map((step) => objectiveStatesById.get(step.objectiveId)?.completed === true);
    const stepsComplete = stepCompletions.every(Boolean);
    let status = state.status;

    if (status === ENGINE_V2_QUEST_STATUS.LOCKED && prerequisitesComplete && triggered) {
      status = ENGINE_V2_QUEST_STATUS.AVAILABLE;
      questEvents.push(Object.freeze({ questId: definition.questId, eventType: "available" }));
    }

    if ((status === ENGINE_V2_QUEST_STATUS.AVAILABLE || status === ENGINE_V2_QUEST_STATUS.ACTIVE) && stepsComplete) {
      status = ENGINE_V2_QUEST_STATUS.COMPLETED;
      questEvents.push(Object.freeze({ questId: definition.questId, eventType: "completed" }));
      definition.rewards.inventoryActions.forEach((action) => rewardRequests.push(Object.freeze({ rewardType: "inventory", questId: definition.questId, ...action })));
      definition.rewards.economyActions.forEach((action) => rewardRequests.push(Object.freeze({ rewardType: "economy", questId: definition.questId, ...action })));
      definition.rewards.triggerIds.forEach((triggerId) => triggerRequests.push(Object.freeze({ questId: definition.questId, triggerId })));
    }

    return Object.freeze({
      questId: state.questId,
      status,
      completedStepIds: Object.freeze(definition.steps.filter((step, index) => stepCompletions[index]).map((step) => step.stepId)),
    });
  });

  return createQuestResult({ questStates: nextStates, questEvents, rewardRequests, triggerRequests, errors });
}

function validateQuestDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.questId) || !Array.isArray(definition.prerequisiteQuestIds) || !Array.isArray(definition.triggerIds) || !Array.isArray(definition.steps) || !isRewards(definition.rewards)) {
    return [createQuestError(ENGINE_V2_QUEST_ERRORS.DEFINITION_INVALID, "Quest definition requires questId, prerequisites, triggers, steps, and rewards.", path)];
  }

  if (!definition.steps.every((step) => isRecord(step) && hasNonEmptyString(step.stepId) && hasNonEmptyString(step.objectiveId))) {
    return [createQuestError(ENGINE_V2_QUEST_ERRORS.DEFINITION_INVALID, "Quest steps require stepId and objectiveId.", `${path}.steps`)];
  }

  return [];
}

function validateQuestState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.questId) || !QUEST_STATUS_LIST.includes(state.status)) {
    return [createQuestError(ENGINE_V2_QUEST_ERRORS.STATE_INVALID, "Quest state requires questId and valid status.", path)];
  }

  return [];
}

function isRewards(value) {
  return isRecord(value) && Array.isArray(value.inventoryActions) && Array.isArray(value.economyActions) && Array.isArray(value.triggerIds);
}

function createQuestResult({ questStates, questEvents, rewardRequests, triggerRequests, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    questStates: Object.freeze(questStates),
    questEvents: Object.freeze(questEvents),
    rewardRequests: Object.freeze(rewardRequests),
    triggerRequests: Object.freeze(triggerRequests),
    errors: Object.freeze(errors),
  });
}

function createQuestError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
