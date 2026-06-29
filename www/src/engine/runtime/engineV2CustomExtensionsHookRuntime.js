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
  DRAFT: "draft",
  PRIVATE: "private",
  SUBMITTED: "submitted",
  AI_VALIDATED: "aiValidated",
  AI_REJECTED: "aiRejected",
  HUMAN_APPROVED: "humanApproved",
  HUMAN_REJECTED: "humanRejected",
  PROMOTED_CANDIDATE: "promotedCandidate",
});

export const ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS = Object.freeze({
  SUBMIT: "submit",
  MARK_PRIVATE: "markPrivate",
  RETURN_TO_DRAFT: "returnToDraft",
  RECORD_AI_VALIDATED: "recordAiValidated",
  RECORD_AI_REJECTED: "recordAiRejected",
  PROMOTE_CANDIDATE: "promoteCandidate",
  HUMAN_APPROVE: "humanApprove",
  HUMAN_REJECT: "humanReject",
});

export const ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_BOUNDARY = Object.freeze({
  boundaryName: "Admin Custom Extension Approval",
  aiValidationAdvisoryOnly: true,
  humanApprovalRequiredForPublishEligibility: true,
  noOpenAiIntegrationImplementation: true,
  noAdminUiImplementation: true,
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
  APPROVAL_ACTION_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_ACTION_INVALID",
  APPROVAL_TRANSITION_INVALID: "ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_TRANSITION_INVALID",
});

const APPROVAL_STATUS_LIST = Object.freeze(Object.values(ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS));
const APPROVAL_ACTION_LIST = Object.freeze(Object.values(ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS));
const AI_ADVISORY_APPROVAL_STATUSES = new Set([
  ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_VALIDATED,
  ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_REJECTED,
]);
const PUBLISH_ELIGIBLE_APPROVAL_STATUSES = new Set([
  ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED,
]);
const ADMIN_APPROVAL_TRANSITIONS = Object.freeze({
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.DRAFT]: Object.freeze({
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.MARK_PRIVATE]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PRIVATE,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.SUBMIT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.SUBMITTED,
  }),
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PRIVATE]: Object.freeze({
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.RETURN_TO_DRAFT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.DRAFT,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.SUBMIT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.SUBMITTED,
  }),
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.SUBMITTED]: Object.freeze({
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.RECORD_AI_VALIDATED]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_VALIDATED,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.RECORD_AI_REJECTED]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_REJECTED,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_APPROVE]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_REJECT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_REJECTED,
  }),
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_VALIDATED]: Object.freeze({
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.PROMOTE_CANDIDATE]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PROMOTED_CANDIDATE,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_APPROVE]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_REJECT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_REJECTED,
  }),
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.AI_REJECTED]: Object.freeze({
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.SUBMIT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.SUBMITTED,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_REJECT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_REJECTED,
  }),
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PROMOTED_CANDIDATE]: Object.freeze({
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_APPROVE]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.HUMAN_REJECT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_REJECTED,
  }),
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_REJECTED]: Object.freeze({
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.MARK_PRIVATE]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.PRIVATE,
    [ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_ACTIONS.SUBMIT]: ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.SUBMITTED,
  }),
  [ENGINE_V2_CUSTOM_EXTENSION_APPROVAL_STATUS.HUMAN_APPROVED]: Object.freeze({}),
});

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
    const approvalState = createApprovalState(definition.approvalStatus);

    return definition.hookRegistrations.map((registration) => Object.freeze({
      extensionId: definition.extensionId,
      displayName: definition.displayName,
      hookName: registration.hookName,
      extensionMode: registration.extensionMode,
      allowedContextKeys: Object.freeze([...registration.allowedContextKeys]),
      approvalStatus: approvalState.approvalStatus,
      humanApproved: approvalState.humanApproved,
      aiValidationAdvisory: approvalState.aiValidationAdvisory,
      humanApprovalRequiredForPublishEligibility: approvalState.humanApprovalRequiredForPublishEligibility,
      creatorPrivate: approvalState.creatorPrivate,
      publishEligible: approvalState.publishEligible,
    }));
  });
  const publishEligible = registeredHooks.every((hook) => hook.publishEligible);
  const runtime = Object.freeze({
    registeredHooks: Object.freeze(registeredHooks),
    publishEligibility: Object.freeze({
      eligible: publishEligible,
      humanApprovalRequired: !publishEligible,
      blockedByExtensionIds: freezeUnique(registeredHooks.filter((hook) => !hook.publishEligible).map((hook) => hook.extensionId)),
    }),
  });

  return createCustomExtensionRuntimeResult({
    runtime,
    registeredHooks,
    publishEligibility: runtime.publishEligibility,
    errors,
  });
}

export function resolveEngineV2AdminCustomExtensionApprovalBoundary({ extensionDefinition, approvalAction }) {
  const errors = [];
  const definitionErrors = validateExtensionDefinition(extensionDefinition, "extensionDefinition");
  definitionErrors.forEach((error) => errors.push(error));

  const actionType = isRecord(approvalAction) ? approvalAction.actionType : approvalAction;

  if (!APPROVAL_ACTION_LIST.includes(actionType)) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.APPROVAL_ACTION_INVALID, "Admin Custom Extension Approval requires an approved approval action.", "approvalAction.actionType"));
  }

  if (errors.length > 0) {
    return createApprovalBoundaryResult({
      previousApprovalStatus: isRecord(extensionDefinition) ? extensionDefinition.approvalStatus : null,
      nextApprovalStatus: null,
      publishEligibility: null,
      errors,
    });
  }

  const nextApprovalStatus = ADMIN_APPROVAL_TRANSITIONS[extensionDefinition.approvalStatus][actionType];

  if (!nextApprovalStatus) {
    errors.push(createCustomExtensionError(ENGINE_V2_CUSTOM_EXTENSION_ERRORS.APPROVAL_TRANSITION_INVALID, "Admin Custom Extension Approval action is not valid for the current approval status.", "approvalAction.actionType"));
    return createApprovalBoundaryResult({
      previousApprovalStatus: extensionDefinition.approvalStatus,
      nextApprovalStatus: null,
      publishEligibility: null,
      errors,
    });
  }

  const approvalState = createApprovalState(nextApprovalStatus);

  return createApprovalBoundaryResult({
    previousApprovalStatus: extensionDefinition.approvalStatus,
    nextApprovalStatus,
    publishEligibility: Object.freeze({
      eligible: approvalState.publishEligible,
      humanApprovalRequired: approvalState.humanApprovalRequiredForPublishEligibility,
      blockedByExtensionIds: approvalState.publishEligible ? Object.freeze([]) : Object.freeze([extensionDefinition.extensionId]),
    }),
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

function createApprovalState(approvalStatus) {
  const humanApproved = PUBLISH_ELIGIBLE_APPROVAL_STATUSES.has(approvalStatus);

  return Object.freeze({
    approvalStatus,
    humanApproved,
    aiValidationAdvisory: AI_ADVISORY_APPROVAL_STATUSES.has(approvalStatus),
    humanApprovalRequiredForPublishEligibility: !humanApproved,
    creatorPrivate: !humanApproved,
    publishEligible: humanApproved,
  });
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

function createApprovalBoundaryResult({ previousApprovalStatus, nextApprovalStatus, publishEligibility, errors }) {
  const nextApprovalState = nextApprovalStatus ? createApprovalState(nextApprovalStatus) : null;

  return Object.freeze({
    valid: errors.length === 0,
    boundary: ENGINE_V2_ADMIN_CUSTOM_EXTENSION_APPROVAL_BOUNDARY,
    previousApprovalStatus,
    nextApprovalStatus,
    aiValidationAdvisory: nextApprovalState ? nextApprovalState.aiValidationAdvisory : false,
    humanApprovalRequiredForPublishEligibility: nextApprovalState ? nextApprovalState.humanApprovalRequiredForPublishEligibility : true,
    creatorPrivate: nextApprovalState ? nextApprovalState.creatorPrivate : true,
    publishEligibility,
    errors: Object.freeze(errors),
  });
}

function createCustomExtensionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function freezeJsonClone(value) {
  return Object.freeze(JSON.parse(JSON.stringify(value)));
}

function freezeUnique(values) {
  return Object.freeze([...new Set(values)]);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
