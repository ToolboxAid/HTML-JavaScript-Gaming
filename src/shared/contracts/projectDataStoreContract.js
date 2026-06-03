/*
Toolbox Aid
David Quesenberry
06/03/2026
projectDataStoreContract.js
*/

export const PROJECT_DATA_STORE_CONTRACT_ID = "gamefoundrystudio.project-data-store.contract";
export const PROJECT_DATA_STORE_CONTRACT_VERSION = "1.0.0";

export const PROJECT_DATA_STORE_RECORD_TYPES = Object.freeze({
  PROJECT: "project",
  MANIFEST: "manifest",
  ASSET: "asset",
  TOOL_OUTPUT: "toolOutput",
  CUSTOM_EXTENSION: "customExtension",
  CUSTOM_EXTENSION_APPROVAL: "customExtensionApproval",
  PUBLISH_STATE: "publishState",
});

export const PROJECT_DATA_STORE_RECORD_TYPE_LIST = Object.freeze(Object.values(PROJECT_DATA_STORE_RECORD_TYPES));

export const PROJECT_DATA_STORE_COLLECTIONS = Object.freeze({
  PROJECTS: "projects",
  MANIFESTS: "manifests",
  ASSETS: "assets",
  TOOL_OUTPUTS: "toolOutputs",
  CUSTOM_EXTENSIONS: "customExtensions",
  CUSTOM_EXTENSION_APPROVALS: "customExtensionApprovals",
  PUBLISH_STATES: "publishStates",
});

export const PROJECT_DATA_STORE_COLLECTION_LIST = Object.freeze(Object.values(PROJECT_DATA_STORE_COLLECTIONS));

export const PROJECT_DATA_STORE_COLLECTION_BY_RECORD_TYPE = Object.freeze({
  [PROJECT_DATA_STORE_RECORD_TYPES.PROJECT]: PROJECT_DATA_STORE_COLLECTIONS.PROJECTS,
  [PROJECT_DATA_STORE_RECORD_TYPES.MANIFEST]: PROJECT_DATA_STORE_COLLECTIONS.MANIFESTS,
  [PROJECT_DATA_STORE_RECORD_TYPES.ASSET]: PROJECT_DATA_STORE_COLLECTIONS.ASSETS,
  [PROJECT_DATA_STORE_RECORD_TYPES.TOOL_OUTPUT]: PROJECT_DATA_STORE_COLLECTIONS.TOOL_OUTPUTS,
  [PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION]: PROJECT_DATA_STORE_COLLECTIONS.CUSTOM_EXTENSIONS,
  [PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION_APPROVAL]: PROJECT_DATA_STORE_COLLECTIONS.CUSTOM_EXTENSION_APPROVALS,
  [PROJECT_DATA_STORE_RECORD_TYPES.PUBLISH_STATE]: PROJECT_DATA_STORE_COLLECTIONS.PUBLISH_STATES,
});

export const PROJECT_DATA_STORE_ADAPTER_METHODS = Object.freeze([
  "putRecord",
  "getRecord",
  "listRecords",
  "deleteRecord",
  "clear",
]);

export const PROJECT_DATA_STORE_RULES = Object.freeze({
  STORES_PROJECTS: true,
  STORES_MANIFESTS: true,
  STORES_ASSETS: true,
  STORES_TOOL_OUTPUTS: true,
  STORES_CUSTOM_EXTENSIONS: true,
  STORES_CUSTOM_EXTENSION_APPROVALS: true,
  STORES_PUBLISH_STATE: true,
  INDEPENDENT_FROM_UI_AND_TOOL_PAGES: true,
  SWAPPABLE_FOR_REAL_DATABASE: true,
  NO_LOCAL_STORAGE_AS_AUTHORITATIVE_STORE: true,
  NO_SESSION_STORAGE_AS_AUTHORITATIVE_STORE: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_WORKSPACE_STATE: true,
});

export const PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS = Object.freeze({
  DRAFT: "draft",
  PRIVATE: "private",
  SUBMITTED: "submitted",
  AI_VALIDATED: "aiValidated",
  AI_REJECTED: "aiRejected",
  HUMAN_APPROVED: "humanApproved",
  HUMAN_REJECTED: "humanRejected",
  PROMOTED_CANDIDATE: "promotedCandidate",
});

export const PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS_LIST = Object.freeze(
  Object.values(PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS)
);

export const PROJECT_DATA_STORE_PUBLISH_STATUS = Object.freeze({
  DRAFT: "draft",
  BLOCKED: "blocked",
  ELIGIBLE: "eligible",
  PUBLISHED: "published",
  RETIRED: "retired",
});

export const PROJECT_DATA_STORE_PUBLISH_STATUS_LIST = Object.freeze(
  Object.values(PROJECT_DATA_STORE_PUBLISH_STATUS)
);

export const PROJECT_DATA_STORE_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authSession",
  "authState",
  "databaseConnection",
  "document",
  "domNode",
  "fallbackData",
  "html",
  "localStorage",
  "networkConnection",
  "pageRoute",
  "session",
  "sessionStorage",
  "toolPage",
  "uiState",
  "window",
  "workspace",
  "workspaceState",
]);

export const PROJECT_DATA_STORE_CONTRACT_ERRORS = Object.freeze({
  STORE_INVALID: "PROJECT_DATA_STORE_INVALID",
  COLLECTION_REQUIRED: "PROJECT_DATA_STORE_COLLECTION_REQUIRED",
  COLLECTION_INVALID: "PROJECT_DATA_STORE_COLLECTION_INVALID",
  COLLECTION_RECORD_TYPE_MISMATCH: "PROJECT_DATA_STORE_COLLECTION_RECORD_TYPE_MISMATCH",
  RECORD_INVALID: "PROJECT_DATA_STORE_RECORD_INVALID",
  RECORD_TYPE_INVALID: "PROJECT_DATA_STORE_RECORD_TYPE_INVALID",
  RECORD_ID_REQUIRED: "PROJECT_DATA_STORE_RECORD_ID_REQUIRED",
  OWNER_REQUIRED: "PROJECT_DATA_STORE_OWNER_REQUIRED",
  PROJECT_REQUIRED: "PROJECT_DATA_STORE_PROJECT_REQUIRED",
  PAYLOAD_REQUIRED: "PROJECT_DATA_STORE_PAYLOAD_REQUIRED",
  PAYLOAD_INVALID: "PROJECT_DATA_STORE_PAYLOAD_INVALID",
  APPROVAL_STATUS_INVALID: "PROJECT_DATA_STORE_APPROVAL_STATUS_INVALID",
  PUBLISH_STATUS_INVALID: "PROJECT_DATA_STORE_PUBLISH_STATUS_INVALID",
  FIELD_NOT_ALLOWED: "PROJECT_DATA_STORE_FIELD_NOT_ALLOWED",
  ADAPTER_INVALID: "PROJECT_DATA_STORE_ADAPTER_INVALID",
});

export function isProjectDataStoreRecordType(value) {
  return PROJECT_DATA_STORE_RECORD_TYPE_LIST.includes(value);
}

export function isProjectDataStoreCollection(value) {
  return PROJECT_DATA_STORE_COLLECTION_LIST.includes(value);
}

export function isProjectDataStoreCustomExtensionApprovalStatus(value) {
  return PROJECT_DATA_STORE_CUSTOM_EXTENSION_APPROVAL_STATUS_LIST.includes(value);
}

export function isProjectDataStorePublishStatus(value) {
  return PROJECT_DATA_STORE_PUBLISH_STATUS_LIST.includes(value);
}

export function projectDataStoreCollectionForType(recordType) {
  return PROJECT_DATA_STORE_COLLECTION_BY_RECORD_TYPE[recordType] || null;
}

export function createProjectDataStoreKey(recordType, recordId) {
  if (!isProjectDataStoreRecordType(recordType) || !hasNonEmptyString(recordId)) {
    return null;
  }

  return `${recordType}:${recordId}`;
}

export function createEmptyProjectDataStoreSnapshot() {
  return Object.freeze({
    [PROJECT_DATA_STORE_COLLECTIONS.PROJECTS]: Object.freeze([]),
    [PROJECT_DATA_STORE_COLLECTIONS.MANIFESTS]: Object.freeze([]),
    [PROJECT_DATA_STORE_COLLECTIONS.ASSETS]: Object.freeze([]),
    [PROJECT_DATA_STORE_COLLECTIONS.TOOL_OUTPUTS]: Object.freeze([]),
    [PROJECT_DATA_STORE_COLLECTIONS.CUSTOM_EXTENSIONS]: Object.freeze([]),
    [PROJECT_DATA_STORE_COLLECTIONS.CUSTOM_EXTENSION_APPROVALS]: Object.freeze([]),
    [PROJECT_DATA_STORE_COLLECTIONS.PUBLISH_STATES]: Object.freeze([]),
  });
}

export function validateProjectDataStoreRecord(record) {
  const errors = [];

  if (!isRecord(record)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.RECORD_INVALID,
      "Project data store records must be objects.",
      "record"
    ));

    return createValidationResult(errors);
  }

  collectForbiddenFieldErrors(record, errors);

  if (!isProjectDataStoreRecordType(record.recordType)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.RECORD_TYPE_INVALID,
      "Project data store recordType must be approved.",
      "recordType"
    ));
  }

  if (!hasNonEmptyString(record.recordId)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.RECORD_ID_REQUIRED,
      "Project data store records require recordId.",
      "recordId"
    ));
  }

  if (!hasNonEmptyString(record.ownerId)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Project data store records require ownerId.",
      "ownerId"
    ));
  }

  if (!hasNonEmptyString(record.projectId)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Project data store records require projectId.",
      "projectId"
    ));
  }

  if (record.payload === undefined || record.payload === null) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.PAYLOAD_REQUIRED,
      "Project data store records require payload.",
      "payload"
    ));
  } else if (!isRecord(record.payload)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.PAYLOAD_INVALID,
      "Project data store record payload must be an object.",
      "payload"
    ));
  } else {
    collectForbiddenFieldErrors(record.payload, errors, "payload");
    validateTypeSpecificPayload(record, errors);
  }

  return createValidationResult(errors);
}

export function validateProjectDataStoreSnapshot(snapshot) {
  const errors = [];

  if (!isRecord(snapshot)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.STORE_INVALID,
      "Project data store snapshot must be an object.",
      "store"
    ));

    return createValidationResult(errors);
  }

  collectForbiddenFieldErrors(snapshot, errors);

  for (const collectionName of PROJECT_DATA_STORE_COLLECTION_LIST) {
    if (!Object.hasOwn(snapshot, collectionName)) {
      errors.push(createContractError(
        PROJECT_DATA_STORE_CONTRACT_ERRORS.COLLECTION_REQUIRED,
        "Project data store snapshot requires every approved collection.",
        collectionName
      ));
      continue;
    }

    if (!Array.isArray(snapshot[collectionName])) {
      errors.push(createContractError(
        PROJECT_DATA_STORE_CONTRACT_ERRORS.COLLECTION_INVALID,
        "Project data store collections must be arrays.",
        collectionName
      ));
      continue;
    }

    snapshot[collectionName].forEach((record, index) => {
      const validation = validateProjectDataStoreRecord(record);
      validation.errors.forEach((error) => errors.push(error));

      const expectedCollection = projectDataStoreCollectionForType(record?.recordType);
      if (expectedCollection && expectedCollection !== collectionName) {
        errors.push(createContractError(
          PROJECT_DATA_STORE_CONTRACT_ERRORS.COLLECTION_RECORD_TYPE_MISMATCH,
          "Project data store record is in the wrong collection.",
          `${collectionName}[${index}]`
        ));
      }
    });
  }

  return createValidationResult(errors);
}

export function validateProjectDataStoreAdapter(adapter) {
  const errors = [];

  if (!isRecord(adapter)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.ADAPTER_INVALID,
      "Project data store adapter must be an object.",
      "adapter"
    ));

    return createValidationResult(errors);
  }

  PROJECT_DATA_STORE_ADAPTER_METHODS.forEach((methodName) => {
    if (typeof adapter[methodName] !== "function") {
      errors.push(createContractError(
        PROJECT_DATA_STORE_CONTRACT_ERRORS.ADAPTER_INVALID,
        "Project data store adapter must implement the shared method surface.",
        methodName
      ));
    }
  });

  return createValidationResult(errors);
}

function validateTypeSpecificPayload(record, errors) {
  if (record.recordType === PROJECT_DATA_STORE_RECORD_TYPES.CUSTOM_EXTENSION_APPROVAL
    && !isProjectDataStoreCustomExtensionApprovalStatus(record.payload.approvalStatus)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.APPROVAL_STATUS_INVALID,
      "Custom Extension approval records require an approved approvalStatus.",
      "payload.approvalStatus"
    ));
  }

  if (record.recordType === PROJECT_DATA_STORE_RECORD_TYPES.PUBLISH_STATE
    && !isProjectDataStorePublishStatus(record.payload.publishStatus)) {
    errors.push(createContractError(
      PROJECT_DATA_STORE_CONTRACT_ERRORS.PUBLISH_STATUS_INVALID,
      "Publish state records require an approved publishStatus.",
      "payload.publishStatus"
    ));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isRecord(record)) {
    return;
  }

  PROJECT_DATA_STORE_FORBIDDEN_FIELDS.forEach((fieldName) => {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        PROJECT_DATA_STORE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Project data store records must not contain UI, tool page, auth session, browser storage, or runtime workspace state.",
        pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName
      ));
    }
  });
}

function createValidationResult(errors) {
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
