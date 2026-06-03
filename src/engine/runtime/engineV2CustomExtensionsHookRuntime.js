/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2CustomExtensionsHookRuntime.js
*/

export const ENGINE_V2_CUSTOM_EXTENSION_HOOKS = Object.freeze({
  ON_PROJECT_LOAD: "onProjectLoad",
  ON_SCENE_START: "onSceneStart",
  ON_TICK: "onTick",
  ON_COLLISION: "onCollision",
  ON_TRIGGER: "onTrigger",
  ON_ACTION: "onAction",
  ON_SCENE_END: "onSceneEnd",
});

export const ENGINE_V2_CUSTOM_EXTENSION_HOOK_LIST = Object.freeze(Object.values(ENGINE_V2_CUSTOM_EXTENSION_HOOKS));

export const ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS = Object.freeze({
  APPROVED: "approved",
  UNAPPROVED: "unapproved",
});

export const ENGINE_V2_CUSTOM_EXTENSION_ALLOWED_CONTEXT_KEYS = Object.freeze([
  "projectId",
  "sceneId",
  "frameId",
  "deltaMs",
  "runtimeStateSummary",
  "collision",
  "trigger",
  "action",
  "metadata",
]);

export const ENGINE_V2_CUSTOM_EXTENSION_FORBIDDEN_CAPABILITIES = Object.freeze([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "network",
  "filesystem",
  "engineInternals",
  "eval",
  "newFunction",
  "globalMutation",
]);

export const ENGINE_V2_CUSTOM_EXTENSION_FORBIDDEN_FIELDS = Object.freeze([
  "code",
  "source",
  "sourceCode",
  "script",
  "functionBody",
  "handler",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "network",
  "filesystem",
  "engineInternals",
]);

export const ENGINE_V2_CUSTOM_EXTENSION_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_DEFINITIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_DEFINITION_INVALID",
  HOOK_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_HOOK_INVALID",
  MODE_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_MODE_INVALID",
  CONTEXT_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_CONTEXT_INVALID",
  CAPABILITY_FORBIDDEN: "ENGINE_V2_CUSTOM_EXTENSION_CAPABILITY_FORBIDDEN",
  FIELD_FORBIDDEN: "ENGINE_V2_CUSTOM_EXTENSION_FIELD_FORBIDDEN",
  RUNTIME_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_RUNTIME_INVALID",
  HOOK_NAME_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_HOOK_NAME_INVALID",
});

const APPROVAL_STATUS_LIST = Object.freeze(Object.values(ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS));

export function registerEngineV2CustomExtensionHooks({ extensionDefinitions }) {
  const errors = [];

  if (!Array.isArray(extensionDefinitions)) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.DEFINITIONS_INVALID, "Custom Extensions hook runtime requires extensionDefinitions array.", "extensionDefinitions"));
    return createCustomExtensionRuntimeResult({ runtime: null, registeredHooks: [], publishEligibility: null, errors });
  }

  extensionDefinitions.forEach((definition, index) => {
    validateExtensionDefinition(definition, `extensionDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  if (errors.length > 0) {
    return createCustomExtensionRuntimeResult({ runtime: null, registeredHooks: [], publishEligibility: null, errors });
  }

  const registeredHooks = extensionDefinitions.flatMap((definition) => {
    const approved = definition.approvalStatus === ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.APPROVED;

    return definition.hookRegistrations.map((registration) => Object.freeze({
      extensionId: definition.extensionId,
      displayName: definition.displayName,
      hookName: registration.hookName,
      extensionMode: registration.extensionMode,
      allowedContextKeys: Object.freeze([...registration.allowedContextKeys]),
      approved,
      creatorPrivate: !approved,
      publishEligible: approved,
    }));
  });
  const publishEligible = registeredHooks.every((hook) => hook.publishEligible);
  const runtime = Object.freeze({
    registeredHooks: Object.freeze(registeredHooks),
    publishEligibility: Object.freeze({
      eligible: publishEligible,
      blockedByExtensionIds: Object.freeze(registeredHooks.filter((hook) => !hook.publishEligible).map((hook) => hook.extensionId)),
    }),
  });

  return createCustomExtensionRuntimeResult({
    runtime,
    registeredHooks,
    publishEligibility: runtime.publishEligibility,
    errors,
  });
}

export function dispatchEngineV2CustomExtensionHook({ runtime, hookName, runtimeContext }) {
  const errors = [];

  if (!isRecord(runtime) || !Array.isArray(runtime.registeredHooks)) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.RUNTIME_INVALID, "Custom Extensions dispatch requires registered runtime.", "runtime"));
  }

  if (!ENGINE_V2_CUSTOM_EXTENSION_HOOK_LIST.includes(hookName)) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.HOOK_NAME_INVALID, "Custom Extensions dispatch requires approved hookName.", "hookName"));
  }

  if (!isRecord(runtimeContext)) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.CONTEXT_INVALID, "Custom Extensions dispatch requires runtimeContext object.", "runtimeContext"));
  }

  if (errors.length > 0) {
    return createCustomExtensionDispatchResult({ hookInvocations: [], errors });
  }

  const hookInvocations = runtime.registeredHooks
    .filter((hook) => hook.hookName === hookName)
    .map((hook) => Object.freeze({
      extensionId: hook.extensionId,
      hookName: hook.hookName,
      context: createLimitedContext(runtimeContext, hook.allowedContextKeys),
    }));

  return createCustomExtensionDispatchResult({ hookInvocations, errors });
}

function validateExtensionDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition) || !hasNonEmptyString(definition.extensionId) || !hasNonEmptyString(definition.displayName) || !APPROVAL_STATUS_LIST.includes(definition.approvalStatus) || !Array.isArray(definition.hookRegistrations)) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.DEFINITION_INVALID, "Custom Extension definition requires extensionId, displayName, approvalStatus, and hookRegistrations.", path));
    return errors;
  }

  validateNoForbiddenFields(definition, path).forEach((error) => errors.push(error));
  validateRequestedCapabilities(definition.requestedCapabilities || [], `${path}.requestedCapabilities`).forEach((error) => errors.push(error));

  if (definition.hookRegistrations.length === 0) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.DEFINITION_INVALID, "Custom Extension definition requires at least one hook registration.", `${path}.hookRegistrations`));
  }

  definition.hookRegistrations.forEach((registration, index) => {
    validateHookRegistration(registration, `${path}.hookRegistrations[${index}]`).forEach((error) => errors.push(error));
  });

  return errors;
}

function validateHookRegistration(registration, path) {
  const errors = [];

  if (!isRecord(registration) || !ENGINE_V2_CUSTOM_EXTENSION_HOOK_LIST.includes(registration.hookName) || !Array.isArray(registration.allowedContextKeys)) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.HOOK_INVALID, "Hook registration requires approved hookName and allowedContextKeys.", path));
    return errors;
  }

  if (registration.extensionMode !== "enhance") {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.MODE_INVALID, "Custom Extensions must enhance Engine V2 behavior, not replace it.", `${path}.extensionMode`));
  }

  registration.allowedContextKeys.forEach((key, index) => {
    if (!ENGINE_V2_CUSTOM_EXTENSION_ALLOWED_CONTEXT_KEYS.includes(key)) {
      errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.CONTEXT_INVALID, "Hook allowedContextKeys must use the approved limited context list.", `${path}.allowedContextKeys[${index}]`));
    }
  });

  validateNoForbiddenFields(registration, path).forEach((error) => errors.push(error));
  validateRequestedCapabilities(registration.requestedCapabilities || [], `${path}.requestedCapabilities`).forEach((error) => errors.push(error));

  return errors;
}

function validateNoForbiddenFields(value, path) {
  return ENGINE_V2_CUSTOM_EXTENSION_FORBIDDEN_FIELDS
    .filter((field) => Object.hasOwn(value, field))
    .map((field) => createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.FIELD_FORBIDDEN, "Custom Extensions registration cannot include executable source or direct forbidden access fields.", `${path}.${field}`));
}

function validateRequestedCapabilities(capabilities, path) {
  if (!Array.isArray(capabilities)) {
    return [createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.CAPABILITY_FORBIDDEN, "Custom Extensions requestedCapabilities must be an array when provided.", path)];
  }

  return capabilities
    .filter((capability) => ENGINE_V2_CUSTOM_EXTENSION_FORBIDDEN_CAPABILITIES.includes(capability))
    .map((capability) => createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.CAPABILITY_FORBIDDEN, "Custom Extensions cannot request forbidden runtime capability.", `${path}.${capability}`));
}

function createLimitedContext(runtimeContext, allowedContextKeys) {
  const limitedContext = {};

  allowedContextKeys.forEach((key) => {
    if (Object.hasOwn(runtimeContext, key)) {
      limitedContext[key] = freezeJsonClone(runtimeContext[key]);
    }
  });

  return Object.freeze(limitedContext);
}

function createCustomExtensionRuntimeResult({ runtime, registeredHooks, publishEligibility, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtime,
    registeredHooks: Object.freeze(registeredHooks),
    publishEligibility,
    errors: Object.freeze(errors),
  });
}

function createCustomExtensionDispatchResult({ hookInvocations, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    hookInvocations: Object.freeze(hookInvocations),
    errors: Object.freeze(errors),
  });
}

function createCustomExtensionError(code, message, path) {
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
