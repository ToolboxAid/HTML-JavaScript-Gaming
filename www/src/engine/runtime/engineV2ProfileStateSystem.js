/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ProfileStateSystem.js
*/

export const ENGINE_V2_PROFILE_ACTIONS = Object.freeze({
  SET: "set",
  INCREMENT: "increment",
  UNLOCK: "unlock",
});

export const ENGINE_V2_PROFILE_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_PROFILE_DEFINITIONS_INVALID",
  STATE_INVALID: "ENGINE_V2_PROFILE_STATE_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_PROFILE_ACTIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_PROFILE_DEFINITION_INVALID",
  ACTION_INVALID: "ENGINE_V2_PROFILE_ACTION_INVALID",
  KEY_MISSING: "ENGINE_V2_PROFILE_KEY_MISSING",
});

export function processEngineV2ProfileState({ profileDefinitions, profileState, profileActions }) {
  const errors = [];

  if (!Array.isArray(profileDefinitions)) {
    errors.push(createProfileError(ENGINE_V2_PROFILE_ERRORS.DEFINITIONS_INVALID, "Profile-state system requires profileDefinitions array.", "profileDefinitions"));
  }

  if (!isRecord(profileState) || !hasNonEmptyString(profileState.profileId) || !isRecord(profileState.values)) {
    errors.push(createProfileError(ENGINE_V2_PROFILE_ERRORS.STATE_INVALID, "Profile state requires profileId and values.", "profileState"));
  }

  if (!Array.isArray(profileActions)) {
    errors.push(createProfileError(ENGINE_V2_PROFILE_ERRORS.ACTIONS_INVALID, "Profile-state system requires profileActions array.", "profileActions"));
  }

  if (errors.length > 0) {
    return createProfileResult({ profileState: null, profileEvents: [], errors });
  }

  profileDefinitions.forEach((definition, index) => validateProfileDefinition(definition, `profileDefinitions[${index}]`).forEach((error) => errors.push(error)));
  profileActions.forEach((action, index) => validateProfileAction(action, `profileActions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createProfileResult({ profileState: null, profileEvents: [], errors });
  }

  const definitionsByKey = new Map(profileDefinitions.map((definition) => [definition.profileKey, definition]));
  const values = { ...profileState.values };
  const profileEvents = [];

  profileActions.forEach((action, index) => {
    const path = `profileActions[${index}]`;
    const definition = definitionsByKey.get(action.profileKey);

    if (!definition) {
      errors.push(createProfileError(ENGINE_V2_PROFILE_ERRORS.KEY_MISSING, "Profile action references missing profile definition.", `${path}.profileKey`));
      return;
    }

    if (action.actionType === ENGINE_V2_PROFILE_ACTIONS.SET) {
      values[action.profileKey] = action.value;
    } else if (action.actionType === ENGINE_V2_PROFILE_ACTIONS.INCREMENT) {
      values[action.profileKey] = (Number.isFinite(values[action.profileKey]) ? values[action.profileKey] : 0) + action.amount;
    } else {
      values[action.profileKey] = true;
    }

    profileEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, profileKey: action.profileKey }));
  });

  if (errors.length > 0) {
    return createProfileResult({ profileState: null, profileEvents: [], errors });
  }

  return createProfileResult({
    profileState: Object.freeze({ profileId: profileState.profileId, values: Object.freeze(values) }),
    profileEvents,
    errors,
  });
}

function validateProfileDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.profileKey) || !hasNonEmptyString(definition.valueType)) {
    return [createProfileError(ENGINE_V2_PROFILE_ERRORS.DEFINITION_INVALID, "Profile definition requires profileKey and valueType.", path)];
  }

  return [];
}

function validateProfileAction(action, path) {
  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !hasNonEmptyString(action.profileKey) || !Object.values(ENGINE_V2_PROFILE_ACTIONS).includes(action.actionType)) {
    return [createProfileError(ENGINE_V2_PROFILE_ERRORS.ACTION_INVALID, "Profile action requires actionId, profileKey, and actionType.", path)];
  }

  if (action.actionType === ENGINE_V2_PROFILE_ACTIONS.INCREMENT && !Number.isFinite(action.amount)) {
    return [createProfileError(ENGINE_V2_PROFILE_ERRORS.ACTION_INVALID, "Increment profile action requires numeric amount.", path)];
  }

  if (action.actionType === ENGINE_V2_PROFILE_ACTIONS.SET && !Object.hasOwn(action, "value")) {
    return [createProfileError(ENGINE_V2_PROFILE_ERRORS.ACTION_INVALID, "Set profile action requires value.", path)];
  }

  return [];
}

function createProfileResult({ profileState, profileEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    profileState,
    profileEvents: Object.freeze(profileEvents),
    errors: Object.freeze(errors),
  });
}

function createProfileError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
