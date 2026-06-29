/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ModifierStack.js
*/

export const ENGINE_V2_MODIFIER_SOURCE_TYPES = Object.freeze({
  TERRAIN: "terrain",
  OBJECT: "object",
  ENVIRONMENT: "environment",
  STATUS_EFFECT: "statusEffect",
  EQUIPMENT: "equipment",
  ABILITY: "ability",
  RULE: "rule",
});

export const ENGINE_V2_MODIFIER_SOURCE_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_MODIFIER_SOURCE_TYPES));

export const ENGINE_V2_MODIFIER_OPERATIONS = Object.freeze({
  SET: "set",
  ADD: "add",
  MULTIPLY: "multiply",
});

export const ENGINE_V2_MODIFIER_OPERATION_LIST = Object.freeze(Object.values(ENGINE_V2_MODIFIER_OPERATIONS));

export const ENGINE_V2_MODIFIER_ERRORS = Object.freeze({
  MODIFIERS_INVALID: "ENGINE_V2_MODIFIERS_INVALID",
  BASE_VALUES_INVALID: "ENGINE_V2_MODIFIER_BASE_VALUES_INVALID",
  MODIFIER_INVALID: "ENGINE_V2_MODIFIER_INVALID",
  BASE_VALUE_MISSING: "ENGINE_V2_MODIFIER_BASE_VALUE_MISSING",
});

export function resolveEngineV2ModifierStack({ modifiers, baseValues }) {
  const errors = [];

  if (!Array.isArray(modifiers)) {
    errors.push(createModifierError(ENGINE_V2_MODIFIER_ERRORS.MODIFIERS_INVALID, "Modifier stack requires modifiers array.", "modifiers"));
  }

  if (!isRecord(baseValues)) {
    errors.push(createModifierError(ENGINE_V2_MODIFIER_ERRORS.BASE_VALUES_INVALID, "Modifier stack requires explicit baseValues object.", "baseValues"));
  }

  if (errors.length > 0) {
    return createModifierResult({ resolvedValues: [], appliedModifiers: [], errors });
  }

  modifiers.forEach((modifier, index) => validateModifier(modifier, `modifiers[${index}]`).forEach((error) => errors.push(error)));

  modifiers.forEach((modifier, index) => {
    const key = modifierValueKey(modifier.targetInstanceId, modifier.channel);

    if (!Number.isFinite(baseValues[key])) {
      errors.push(createModifierError(ENGINE_V2_MODIFIER_ERRORS.BASE_VALUE_MISSING, "Modifier target/channel requires explicit numeric base value.", `modifiers[${index}]`));
    }
  });

  if (errors.length > 0) {
    return createModifierResult({ resolvedValues: [], appliedModifiers: [], errors });
  }

  const sortedModifiers = [...modifiers].sort(compareModifiers);
  const currentValues = new Map(Object.entries(baseValues));
  const appliedModifiers = [];

  sortedModifiers.forEach((modifier) => {
    const key = modifierValueKey(modifier.targetInstanceId, modifier.channel);
    const beforeValue = currentValues.get(key);
    const afterValue = applyModifierOperation(beforeValue, modifier);
    currentValues.set(key, afterValue);
    appliedModifiers.push(Object.freeze({
      modifierId: modifier.modifierId,
      sourceType: modifier.sourceType,
      targetInstanceId: modifier.targetInstanceId,
      channel: modifier.channel,
      operation: modifier.operation,
      value: modifier.value,
      order: modifier.order,
      beforeValue,
      afterValue,
    }));
  });

  return createModifierResult({
    resolvedValues: Array.from(currentValues.entries()).map(([key, value]) => Object.freeze({ key, value })),
    appliedModifiers,
    errors,
  });
}

function applyModifierOperation(beforeValue, modifier) {
  if (modifier.operation === ENGINE_V2_MODIFIER_OPERATIONS.SET) {
    return modifier.value;
  }

  if (modifier.operation === ENGINE_V2_MODIFIER_OPERATIONS.ADD) {
    return beforeValue + modifier.value;
  }

  return beforeValue * modifier.value;
}

function compareModifiers(left, right) {
  if (left.order !== right.order) {
    return left.order - right.order;
  }

  const sourceCompare = ENGINE_V2_MODIFIER_SOURCE_TYPE_LIST.indexOf(left.sourceType) - ENGINE_V2_MODIFIER_SOURCE_TYPE_LIST.indexOf(right.sourceType);

  if (sourceCompare !== 0) {
    return sourceCompare;
  }

  return left.modifierId.localeCompare(right.modifierId);
}

function validateModifier(modifier, path) {
  if (!isRecord(modifier)
    || !hasNonEmptyString(modifier.modifierId)
    || !ENGINE_V2_MODIFIER_SOURCE_TYPE_LIST.includes(modifier.sourceType)
    || !hasNonEmptyString(modifier.targetInstanceId)
    || !hasNonEmptyString(modifier.channel)
    || !ENGINE_V2_MODIFIER_OPERATION_LIST.includes(modifier.operation)
    || !Number.isFinite(modifier.value)
    || !Number.isFinite(modifier.order)) {
    return [createModifierError(ENGINE_V2_MODIFIER_ERRORS.MODIFIER_INVALID, "Modifier requires modifierId, approved sourceType, targetInstanceId, channel, operation, numeric value, and numeric order.", path)];
  }

  return [];
}

function createModifierResult({ resolvedValues, appliedModifiers, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    resolvedValues: Object.freeze(resolvedValues),
    appliedModifiers: Object.freeze(appliedModifiers),
    errors: Object.freeze(errors),
  });
}

function createModifierError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function modifierValueKey(targetInstanceId, channel) {
  return `${targetInstanceId}.${channel}`;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
