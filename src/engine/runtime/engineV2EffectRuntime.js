/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2EffectRuntime.js
*/

export const ENGINE_V2_EFFECT_TYPES = Object.freeze({
  EXPLOSION: "explosion",
  DUST: "dust",
  SNOW: "snow",
  RAIN: "rain",
  FIRE: "fire",
  SMOKE: "smoke",
  SPARKLES: "sparkles",
  HIT: "hit",
  PICKUP: "pickup",
});

export const ENGINE_V2_EFFECT_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_EFFECT_TYPES));

export const ENGINE_V2_EFFECT_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_EFFECT_DEFINITIONS_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_EFFECT_REQUESTS_INVALID",
  ACTIVE_EFFECTS_INVALID: "ENGINE_V2_ACTIVE_EFFECTS_INVALID",
  DELTA_INVALID: "ENGINE_V2_EFFECT_DELTA_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_EFFECT_DEFINITION_INVALID",
  REQUEST_INVALID: "ENGINE_V2_EFFECT_REQUEST_INVALID",
  ACTIVE_EFFECT_INVALID: "ENGINE_V2_ACTIVE_EFFECT_INVALID",
  DEFINITION_MISSING: "ENGINE_V2_EFFECT_DEFINITION_MISSING",
});

export function processEngineV2Effects({ effectDefinitions, effectRequests, activeEffects, deltaMs }) {
  const errors = [];

  if (!Array.isArray(effectDefinitions)) {
    errors.push(createEffectError(ENGINE_V2_EFFECT_ERRORS.DEFINITIONS_INVALID, "Effect runtime requires effectDefinitions array.", "effectDefinitions"));
  }

  if (!Array.isArray(effectRequests)) {
    errors.push(createEffectError(ENGINE_V2_EFFECT_ERRORS.REQUESTS_INVALID, "Effect runtime requires effectRequests array.", "effectRequests"));
  }

  if (!Array.isArray(activeEffects)) {
    errors.push(createEffectError(ENGINE_V2_EFFECT_ERRORS.ACTIVE_EFFECTS_INVALID, "Effect runtime requires activeEffects array.", "activeEffects"));
  }

  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    errors.push(createEffectError(ENGINE_V2_EFFECT_ERRORS.DELTA_INVALID, "Effect runtime requires non-negative numeric deltaMs.", "deltaMs"));
  }

  if (errors.length > 0) {
    return createEffectResult({ effectInstances: [], effectEvents: [], errors });
  }

  effectDefinitions.forEach((definition, index) => validateEffectDefinition(definition, `effectDefinitions[${index}]`).forEach((error) => errors.push(error)));
  effectRequests.forEach((request, index) => validateEffectRequest(request, `effectRequests[${index}]`).forEach((error) => errors.push(error)));
  activeEffects.forEach((effect, index) => validateActiveEffect(effect, `activeEffects[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createEffectResult({ effectInstances: [], effectEvents: [], errors });
  }

  const definitionsById = new Map(effectDefinitions.map((definition) => [definition.effectId, definition]));
  const spawnedEffects = effectRequests.map((request, index) => {
    const definition = definitionsById.get(request.effectId);

    if (!definition) {
      errors.push(createEffectError(ENGINE_V2_EFFECT_ERRORS.DEFINITION_MISSING, "Effect request references missing manifest effect definition.", `effectRequests[${index}].effectId`));
      return null;
    }

    return Object.freeze({
      effectInstanceId: request.requestId,
      effectId: request.effectId,
      effectType: definition.effectType,
      targetInstanceId: request.targetInstanceId || null,
      position: freezeJsonClone(request.position),
      remainingMs: request.durationMs ?? definition.durationMs,
      payload: freezeJsonClone(definition.payload),
    });
  }).filter((effect) => effect !== null);

  if (errors.length > 0) {
    return createEffectResult({ effectInstances: [], effectEvents: [], errors });
  }

  const advancedActiveEffects = activeEffects
    .map((effect) => Object.freeze({ ...effect, remainingMs: effect.remainingMs - deltaMs }))
    .filter((effect) => effect.remainingMs > 0);
  const effectInstances = [...advancedActiveEffects, ...spawnedEffects];
  const effectEvents = spawnedEffects.map((effect) => Object.freeze({
    effectInstanceId: effect.effectInstanceId,
    effectId: effect.effectId,
    effectType: effect.effectType,
  }));

  return createEffectResult({ effectInstances, effectEvents, errors });
}

function validateEffectDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.effectId) || !ENGINE_V2_EFFECT_TYPE_LIST.includes(definition.effectType) || !Number.isFinite(definition.durationMs) || definition.durationMs <= 0 || !isRecord(definition.payload)) {
    return [createEffectError(ENGINE_V2_EFFECT_ERRORS.DEFINITION_INVALID, "Effect definition requires effectId, approved effectType, positive durationMs, and payload.", path)];
  }

  return [];
}

function validateEffectRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.effectId) || !isPoint(request.position)) {
    return [createEffectError(ENGINE_V2_EFFECT_ERRORS.REQUEST_INVALID, "Effect request requires requestId, effectId, and explicit position.", path)];
  }

  if (request.durationMs !== undefined && (!Number.isFinite(request.durationMs) || request.durationMs <= 0)) {
    return [createEffectError(ENGINE_V2_EFFECT_ERRORS.REQUEST_INVALID, "Effect request durationMs must be positive when provided.", `${path}.durationMs`)];
  }

  return [];
}

function validateActiveEffect(effect, path) {
  if (!isRecord(effect) || !hasNonEmptyString(effect.effectInstanceId) || !hasNonEmptyString(effect.effectId) || !ENGINE_V2_EFFECT_TYPE_LIST.includes(effect.effectType) || !Number.isFinite(effect.remainingMs)) {
    return [createEffectError(ENGINE_V2_EFFECT_ERRORS.ACTIVE_EFFECT_INVALID, "Active effect requires effectInstanceId, effectId, approved effectType, and remainingMs.", path)];
  }

  return [];
}

function createEffectResult({ effectInstances, effectEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    effectInstances: Object.freeze(effectInstances),
    effectEvents: Object.freeze(effectEvents),
    errors: Object.freeze(errors),
  });
}

function createEffectError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isPoint(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
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
