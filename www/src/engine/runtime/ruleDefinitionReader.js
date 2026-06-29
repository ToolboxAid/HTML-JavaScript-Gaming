/*
Toolbox Aid
David Quesenberry
06/02/2026
ruleDefinitionReader.js
*/

export const RUNTIME_RULE_TYPES = Object.freeze({
  MOVEMENT: "movement",
  BOUNCE: "bounce",
  GRAVITY: "gravity",
  HEALTH: "health",
  DAMAGE: "damage",
  COLLISION: "collision",
  SPAWN: "spawn",
  DESPAWN: "despawn",
  SCORING: "scoring",
  COOLDOWN: "cooldown",
});

export const RUNTIME_RULE_TYPE_LIST = Object.freeze([
  RUNTIME_RULE_TYPES.MOVEMENT,
  RUNTIME_RULE_TYPES.BOUNCE,
  RUNTIME_RULE_TYPES.GRAVITY,
  RUNTIME_RULE_TYPES.HEALTH,
  RUNTIME_RULE_TYPES.DAMAGE,
  RUNTIME_RULE_TYPES.COLLISION,
  RUNTIME_RULE_TYPES.SPAWN,
  RUNTIME_RULE_TYPES.DESPAWN,
  RUNTIME_RULE_TYPES.SCORING,
  RUNTIME_RULE_TYPES.COOLDOWN,
]);

export const RULE_DEFINITION_READER_ERRORS = Object.freeze({
  RULES_INVALID: "RULE_DEFINITIONS_INVALID",
  RULE_ID_REQUIRED: "RULE_DEFINITION_ID_REQUIRED",
  RULE_TYPE_REQUIRED: "RULE_DEFINITION_TYPE_REQUIRED",
  RULE_TYPE_INVALID: "RULE_DEFINITION_TYPE_INVALID",
  TARGETS_INVALID: "RULE_DEFINITION_TARGETS_INVALID",
});

export function readManifestRuleDefinitions(manifest = {}) {
  const errors = [];
  const rules = manifest?.rules;

  if (rules === undefined || rules === null) {
    return createRuleReaderResult({ ruleDefinitions: [], errors });
  }

  if (!isRecord(rules) && !Array.isArray(rules)) {
    errors.push(createRuleDefinitionError(
      RULE_DEFINITION_READER_ERRORS.RULES_INVALID,
      "Manifest rule definitions must be an object map or array.",
      "rules"
    ));
    return createRuleReaderResult({ ruleDefinitions: [], errors });
  }

  const entries = Array.isArray(rules)
    ? rules.map((definition, index) => ({ key: "", definition, path: `rules[${index}]` }))
    : Object.entries(rules).map(([key, definition]) => ({ key, definition, path: `rules.${key}` }));

  const ruleDefinitions = [];

  entries.forEach(({ key, definition, path }) => {
    if (!isRecord(definition)) {
      errors.push(createRuleDefinitionError(
        RULE_DEFINITION_READER_ERRORS.RULES_INVALID,
        "Manifest rule definition must be an object.",
        path
      ));
      return;
    }

    const ruleId = hasNonEmptyString(definition.ruleId) ? definition.ruleId.trim() : key.trim();
    const ruleType = hasNonEmptyString(definition.ruleType) ? definition.ruleType.trim() : "";

    if (!hasNonEmptyString(ruleId)) {
      errors.push(createRuleDefinitionError(
        RULE_DEFINITION_READER_ERRORS.RULE_ID_REQUIRED,
        "Manifest rule definition requires ruleId.",
        `${path}.ruleId`
      ));
    }

    if (!hasNonEmptyString(ruleType)) {
      errors.push(createRuleDefinitionError(
        RULE_DEFINITION_READER_ERRORS.RULE_TYPE_REQUIRED,
        "Manifest rule definition requires ruleType.",
        `${path}.ruleType`
      ));
    } else if (!isRuntimeRuleType(ruleType)) {
      errors.push(createRuleDefinitionError(
        RULE_DEFINITION_READER_ERRORS.RULE_TYPE_INVALID,
        "Manifest rule definition uses an unsupported ruleType.",
        `${path}.ruleType`
      ));
    }

    if (definition.targets !== undefined && !isStringArray(definition.targets)) {
      errors.push(createRuleDefinitionError(
        RULE_DEFINITION_READER_ERRORS.TARGETS_INVALID,
        "Manifest rule definition targets must be an array of non-empty object ids when provided.",
        `${path}.targets`
      ));
    }

    ruleDefinitions.push(Object.freeze({
      ruleId,
      ruleType,
      targets: Object.freeze(isStringArray(definition.targets) ? definition.targets.map((targetId) => targetId.trim()) : []),
      parameters: isRecord(definition.parameters) ? Object.freeze(cloneJson(definition.parameters)) : Object.freeze({}),
    }));
  });

  return createRuleReaderResult({ ruleDefinitions, errors });
}

export function isRuntimeRuleType(value) {
  return RUNTIME_RULE_TYPE_LIST.includes(value);
}

function createRuleReaderResult({ ruleDefinitions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    ruleDefinitions: Object.freeze(ruleDefinitions),
    errors: Object.freeze(errors),
  });
}

function createRuleDefinitionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => hasNonEmptyString(item));
}
