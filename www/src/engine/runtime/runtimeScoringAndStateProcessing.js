/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeScoringAndStateProcessing.js
*/

export const RUNTIME_SCORING_STATE_ERRORS = Object.freeze({
  STATE_INVALID: "RUNTIME_SCORING_STATE_INVALID",
  SCORING_DEFINITIONS_INVALID: "RUNTIME_SCORING_DEFINITIONS_INVALID",
  STATE_DEFINITIONS_INVALID: "RUNTIME_STATE_DEFINITIONS_INVALID",
  RULE_OUTCOMES_INVALID: "RUNTIME_SCORING_RULE_OUTCOMES_INVALID",
  SCORE_DEFINITION_INVALID: "RUNTIME_SCORE_DEFINITION_INVALID",
  STATE_DEFINITION_INVALID: "RUNTIME_STATE_DEFINITION_INVALID",
});

export function processRuntimeScoringAndState({ runtimeState, scoringDefinitions, stateDefinitions, ruleOutcomes }) {
  const errors = [];

  if (!isRecord(runtimeState) || !isRecord(runtimeState.scores) || !isRecord(runtimeState.flags)) {
    errors.push(createScoringStateError(RUNTIME_SCORING_STATE_ERRORS.STATE_INVALID, "Runtime state requires scores and flags objects.", "runtimeState"));
  }

  if (!Array.isArray(scoringDefinitions)) {
    errors.push(createScoringStateError(RUNTIME_SCORING_STATE_ERRORS.SCORING_DEFINITIONS_INVALID, "Scoring processing requires scoringDefinitions array.", "scoringDefinitions"));
  }

  if (!Array.isArray(stateDefinitions)) {
    errors.push(createScoringStateError(RUNTIME_SCORING_STATE_ERRORS.STATE_DEFINITIONS_INVALID, "State processing requires stateDefinitions array.", "stateDefinitions"));
  }

  if (!Array.isArray(ruleOutcomes)) {
    errors.push(createScoringStateError(RUNTIME_SCORING_STATE_ERRORS.RULE_OUTCOMES_INVALID, "Scoring/state processing requires ruleOutcomes array.", "ruleOutcomes"));
  }

  if (errors.length > 0) {
    return createScoringStateResult({ runtimeState: null, scoreEvents: [], stateEvents: [], errors });
  }

  const nextScores = { ...runtimeState.scores };
  const nextFlags = { ...runtimeState.flags };
  const scoreEvents = [];
  const stateEvents = [];

  ruleOutcomes.forEach((outcome) => {
    scoringDefinitions
      .filter((definition) => definition.ruleId === outcome.ruleId)
      .forEach((definition) => {
        if (!hasNonEmptyString(definition.scoreKey) || !Number.isFinite(definition.points)) {
          errors.push(createScoringStateError(RUNTIME_SCORING_STATE_ERRORS.SCORE_DEFINITION_INVALID, "Score definition requires scoreKey and numeric points.", "scoringDefinitions"));
          return;
        }

        nextScores[definition.scoreKey] = (nextScores[definition.scoreKey] ?? 0) + definition.points;
        scoreEvents.push(Object.freeze({ ruleId: definition.ruleId, scoreKey: definition.scoreKey, points: definition.points }));
      });

    stateDefinitions
      .filter((definition) => definition.ruleId === outcome.ruleId)
      .forEach((definition) => {
        if (!hasNonEmptyString(definition.stateKey) || !hasNonEmptyString(definition.operation)) {
          errors.push(createScoringStateError(RUNTIME_SCORING_STATE_ERRORS.STATE_DEFINITION_INVALID, "State definition requires stateKey and operation.", "stateDefinitions"));
          return;
        }

        if (definition.operation === "set") {
          nextFlags[definition.stateKey] = definition.value;
        } else if (definition.operation === "increment") {
          nextFlags[definition.stateKey] = (Number.isFinite(nextFlags[definition.stateKey]) ? nextFlags[definition.stateKey] : 0) + definition.value;
        } else {
          errors.push(createScoringStateError(RUNTIME_SCORING_STATE_ERRORS.STATE_DEFINITION_INVALID, "State definition operation must be set or increment.", "stateDefinitions"));
          return;
        }

        stateEvents.push(Object.freeze({ ruleId: definition.ruleId, stateKey: definition.stateKey, operation: definition.operation }));
      });
  });

  if (errors.length > 0) {
    return createScoringStateResult({ runtimeState: null, scoreEvents: [], stateEvents: [], errors });
  }

  return createScoringStateResult({
    runtimeState: Object.freeze({
      scores: Object.freeze(nextScores),
      flags: Object.freeze(nextFlags),
    }),
    scoreEvents,
    stateEvents,
    errors,
  });
}

function createScoringStateResult({ runtimeState, scoreEvents, stateEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeState,
    scoreEvents: Object.freeze(scoreEvents),
    stateEvents: Object.freeze(stateEvents),
    errors: Object.freeze(errors),
  });
}

function createScoringStateError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
