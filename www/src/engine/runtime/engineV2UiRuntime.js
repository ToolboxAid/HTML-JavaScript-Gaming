/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2UiRuntime.js
*/

export const ENGINE_V2_UI_WIDGET_TYPES = Object.freeze({
  HEALTH_BAR: "healthBar",
  SCORE: "score",
  INVENTORY: "inventory",
  DIALOGUE: "dialogue",
  QUEST_TRACKER: "questTracker",
  TIMER: "timer",
  STATUS: "status",
  PAUSE_MENU: "pauseMenu",
});

export const ENGINE_V2_UI_WIDGET_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_UI_WIDGET_TYPES));

export const ENGINE_V2_UI_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_UI_DEFINITIONS_INVALID",
  RUNTIME_STATE_INVALID: "ENGINE_V2_UI_RUNTIME_STATE_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_UI_DEFINITION_INVALID",
  SOURCE_MISSING: "ENGINE_V2_UI_SOURCE_MISSING",
});

export function resolveEngineV2GameUi({ uiDefinitions, runtimeState }) {
  const errors = [];

  if (!Array.isArray(uiDefinitions)) {
    errors.push(createUiError(ENGINE_V2_UI_ERRORS.DEFINITIONS_INVALID, "Game UI runtime requires uiDefinitions array.", "uiDefinitions"));
  }

  if (!isRecord(runtimeState)) {
    errors.push(createUiError(ENGINE_V2_UI_ERRORS.RUNTIME_STATE_INVALID, "Game UI runtime requires runtimeState object.", "runtimeState"));
  }

  if (errors.length > 0) {
    return createUiResult({ uiCommands: [], errors });
  }

  uiDefinitions.forEach((definition, index) => validateUiDefinition(definition, `uiDefinitions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createUiResult({ uiCommands: [], errors });
  }

  const uiCommands = uiDefinitions.map((definition, index) => {
    const sourceValue = resolveWidgetSource(definition, runtimeState);

    if (sourceValue === undefined) {
      errors.push(createUiError(ENGINE_V2_UI_ERRORS.SOURCE_MISSING, "Game UI widget source is missing from runtimeState.", `uiDefinitions[${index}].source`));
      return null;
    }

    return Object.freeze({
      widgetId: definition.widgetId,
      widgetType: definition.widgetType,
      label: definition.label,
      source: Object.freeze({ ...definition.source }),
      value: freezeJsonClone(sourceValue),
    });
  }).filter((command) => command !== null);

  if (errors.length > 0) {
    return createUiResult({ uiCommands: [], errors });
  }

  return createUiResult({ uiCommands, errors });
}

function validateUiDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.widgetId) || !ENGINE_V2_UI_WIDGET_TYPE_LIST.includes(definition.widgetType) || !hasNonEmptyString(definition.label) || !isRecord(definition.source)) {
    return [createUiError(ENGINE_V2_UI_ERRORS.DEFINITION_INVALID, "Game UI definition requires widgetId, approved widgetType, label, and source.", path)];
  }

  if (!sourceMatchesWidgetType(definition)) {
    return [createUiError(ENGINE_V2_UI_ERRORS.DEFINITION_INVALID, "Game UI source must match widgetType.", `${path}.source`)];
  }

  return [];
}

function sourceMatchesWidgetType(definition) {
  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.HEALTH_BAR) {
    return hasNonEmptyString(definition.source.instanceId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.SCORE) {
    return hasNonEmptyString(definition.source.scoreKey);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.INVENTORY) {
    return hasNonEmptyString(definition.source.inventoryId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.DIALOGUE) {
    return hasNonEmptyString(definition.source.dialogueId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.QUEST_TRACKER) {
    return hasNonEmptyString(definition.source.questId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.TIMER) {
    return hasNonEmptyString(definition.source.timerKey);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.STATUS) {
    return hasNonEmptyString(definition.source.targetInstanceId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.PAUSE_MENU) {
    return hasNonEmptyString(definition.source.stateKey);
  }

  return false;
}

function resolveWidgetSource(definition, runtimeState) {
  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.HEALTH_BAR) {
    return runtimeState.healthRecords?.find((record) => record.instanceId === definition.source.instanceId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.SCORE) {
    const value = runtimeState.scores?.[definition.source.scoreKey];
    return value === undefined ? undefined : value;
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.INVENTORY) {
    return runtimeState.inventoryStates?.find((state) => state.inventoryId === definition.source.inventoryId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.DIALOGUE) {
    return runtimeState.dialogueStates?.find((state) => state.dialogueId === definition.source.dialogueId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.QUEST_TRACKER) {
    return runtimeState.questStates?.find((state) => state.questId === definition.source.questId);
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.TIMER) {
    const value = runtimeState.timers?.[definition.source.timerKey];
    return value === undefined ? undefined : value;
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.STATUS) {
    const effects = runtimeState.statusEffects?.filter((effect) => effect.targetInstanceId === definition.source.targetInstanceId);
    return effects === undefined || effects.length === 0 ? undefined : effects;
  }

  if (definition.widgetType === ENGINE_V2_UI_WIDGET_TYPES.PAUSE_MENU) {
    const value = runtimeState.pauseState?.[definition.source.stateKey];
    return value === undefined ? undefined : value;
  }

  return undefined;
}

function createUiResult({ uiCommands, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    uiCommands: Object.freeze(uiCommands),
    errors: Object.freeze(errors),
  });
}

function createUiError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function freezeJsonClone(value) {
  return Object.freeze(JSON.parse(JSON.stringify(value)));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
