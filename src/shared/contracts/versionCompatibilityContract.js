/*
Toolbox Aid
David Quesenberry
06/02/2026
versionCompatibilityContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";
import {
  INSTALL_RECEIPT_STATUS,
} from "./installReceiptContract.js";
import {
  LIBRARY_ITEM_STATUS,
} from "./libraryItemContract.js";
import {
  PUBLISH_STATUS,
} from "./publishContract.js";
import {
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";
import {
  UPDATE_CHANNEL_TYPES,
} from "./updateChannelContract.js";

export const VERSION_COMPATIBILITY_CONTRACT_ID = "gamefoundrystudio.version.compatibility.contract";
export const VERSION_COMPATIBILITY_CONTRACT_VERSION = "1.0.0";

export const VERSION_COMPATIBILITY_FIELDS = Object.freeze({
  VERSION_COMPATIBILITY_ID: "versionCompatibilityId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  UPDATE_CHANNEL: "updateChannel",
  LIBRARY_ITEM: "libraryItem",
  INSTALL_RECEIPT: "installReceipt",
  MINIMUM_VERSION: "minimumVersion",
  MAXIMUM_VERSION: "maximumVersion",
  TARGET_VERSION: "targetVersion",
  SUPPORTED_SCHEMA_VERSION: "supportedSchemaVersion",
  COMPATIBILITY_STATE: "compatibilityState",
  EVALUATED_AT: "evaluatedAt",
  COMPATIBILITY_NOTES: "compatibilityNotes",
});

export const VERSION_COMPATIBILITY_FIELD_LIST = Object.freeze([
  VERSION_COMPATIBILITY_FIELDS.VERSION_COMPATIBILITY_ID,
  VERSION_COMPATIBILITY_FIELDS.OWNER,
  VERSION_COMPATIBILITY_FIELDS.PROJECT,
  VERSION_COMPATIBILITY_FIELDS.SOURCE_RELEASE,
  VERSION_COMPATIBILITY_FIELDS.SOURCE_PUBLISH,
  VERSION_COMPATIBILITY_FIELDS.UPDATE_CHANNEL,
  VERSION_COMPATIBILITY_FIELDS.LIBRARY_ITEM,
  VERSION_COMPATIBILITY_FIELDS.INSTALL_RECEIPT,
  VERSION_COMPATIBILITY_FIELDS.MINIMUM_VERSION,
  VERSION_COMPATIBILITY_FIELDS.MAXIMUM_VERSION,
  VERSION_COMPATIBILITY_FIELDS.TARGET_VERSION,
  VERSION_COMPATIBILITY_FIELDS.SUPPORTED_SCHEMA_VERSION,
  VERSION_COMPATIBILITY_FIELDS.COMPATIBILITY_STATE,
  VERSION_COMPATIBILITY_FIELDS.EVALUATED_AT,
  VERSION_COMPATIBILITY_FIELDS.COMPATIBILITY_NOTES,
]);

export const VERSION_COMPATIBILITY_STATES = Object.freeze({
  INCOMPATIBLE: "incompatible",
  COMPATIBLE: "compatible",
  DEPRECATED: "deprecated",
  BLOCKED: "blocked",
});

export const VERSION_COMPATIBILITY_STATE_LIST = Object.freeze([
  VERSION_COMPATIBILITY_STATES.INCOMPATIBLE,
  VERSION_COMPATIBILITY_STATES.COMPATIBLE,
  VERSION_COMPATIBILITY_STATES.DEPRECATED,
  VERSION_COMPATIBILITY_STATES.BLOCKED,
]);

export const VERSION_COMPATIBILITY_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_UPDATE_CHANNEL: true,
  REQUIRES_LIBRARY_ITEM: true,
  REQUIRES_INSTALL_RECEIPT: true,
  REQUIRES_MINIMUM_VERSION: true,
  REQUIRES_MAXIMUM_VERSION: true,
  REQUIRES_TARGET_VERSION: true,
  REQUIRES_SUPPORTED_SCHEMA_VERSION: true,
  REQUIRES_VALID_COMPATIBILITY_STATE: true,
  REQUIRES_EVALUATED_AT: true,
  REQUIRES_OWNER_UPDATE_CHANNEL_LINKAGE: true,
  REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_PROJECT_RELEASE_LINKAGE: true,
  REQUIRES_PROJECT_PUBLISH_LINKAGE: true,
  REQUIRES_PROJECT_UPDATE_CHANNEL_LINKAGE: true,
  REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_RELEASE_PUBLISH_LINKAGE: true,
  REQUIRES_RELEASE_UPDATE_CHANNEL_LINKAGE: true,
  REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_PUBLISH_UPDATE_CHANNEL_LINKAGE: true,
  REQUIRES_PUBLISH_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PUBLISH_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE: true,
  TARGET_VERSION_MUST_MATCH_RELEASE_VERSION: true,
  TARGET_VERSION_MUST_BE_IN_RANGE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_INSTALLER_STATE: true,
  NO_UPDATER_IMPLEMENTATION_DETAILS: true,
  NO_MIGRATION_IMPLEMENTATION_DETAILS: true,
  NO_FILE_BYTES: true,
  NO_DOWNLOAD_STATE: true,
});

export const VERSION_COMPATIBILITY_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "arrayBuffer",
  "base64",
  "binary",
  "blob",
  "buffer",
  "bytes",
  "content",
  "dirty",
  "downloadGrant",
  "downloadGrantId",
  "downloadSession",
  "downloadState",
  "downloadToken",
  "downloadUrl",
  "downloadedAt",
  "downloads",
  "fileBytes",
  "fileData",
  "installPlan",
  "installSession",
  "installState",
  "installSteps",
  "installedFiles",
  "installerImplementation",
  "installerState",
  "localStorage",
  "migrationImplementation",
  "migrationJobId",
  "migrationLog",
  "migrationPlan",
  "migrationResult",
  "migrationRuntime",
  "migrationScript",
  "migrationState",
  "migrationSteps",
  "migratedPayload",
  "payload",
  "payloadJson",
  "patchBytes",
  "patchUrl",
  "recoveryAvailable",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "toolState",
  "toolStateId",
  "toolStates",
  "updateJobId",
  "updateManifestUrl",
  "updatePlan",
  "updateSession",
  "updateState",
  "updateUrl",
  "updaterImplementation",
  "updaterSession",
  "updaterState",
  "workspace",
  "workspaceState",
]);

export const VERSION_COMPATIBILITY_CONTRACT_ERRORS = Object.freeze({
  VERSION_COMPATIBILITY_ID_REQUIRED: "VERSION_COMPATIBILITY_ID_REQUIRED",
  OWNER_REQUIRED: "VERSION_COMPATIBILITY_OWNER_REQUIRED",
  PROJECT_REQUIRED: "VERSION_COMPATIBILITY_PROJECT_REQUIRED",
  SOURCE_RELEASE_REQUIRED: "VERSION_COMPATIBILITY_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "VERSION_COMPATIBILITY_SOURCE_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "VERSION_COMPATIBILITY_SOURCE_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "VERSION_COMPATIBILITY_SOURCE_PUBLISH_INVALID",
  UPDATE_CHANNEL_REQUIRED: "VERSION_COMPATIBILITY_UPDATE_CHANNEL_REQUIRED",
  UPDATE_CHANNEL_INVALID: "VERSION_COMPATIBILITY_UPDATE_CHANNEL_INVALID",
  LIBRARY_ITEM_REQUIRED: "VERSION_COMPATIBILITY_LIBRARY_ITEM_REQUIRED",
  LIBRARY_ITEM_INVALID: "VERSION_COMPATIBILITY_LIBRARY_ITEM_INVALID",
  INSTALL_RECEIPT_REQUIRED: "VERSION_COMPATIBILITY_INSTALL_RECEIPT_REQUIRED",
  INSTALL_RECEIPT_INVALID: "VERSION_COMPATIBILITY_INSTALL_RECEIPT_INVALID",
  MINIMUM_VERSION_REQUIRED: "VERSION_COMPATIBILITY_MINIMUM_VERSION_REQUIRED",
  MINIMUM_VERSION_INVALID: "VERSION_COMPATIBILITY_MINIMUM_VERSION_INVALID",
  MAXIMUM_VERSION_REQUIRED: "VERSION_COMPATIBILITY_MAXIMUM_VERSION_REQUIRED",
  MAXIMUM_VERSION_INVALID: "VERSION_COMPATIBILITY_MAXIMUM_VERSION_INVALID",
  TARGET_VERSION_REQUIRED: "VERSION_COMPATIBILITY_TARGET_VERSION_REQUIRED",
  TARGET_VERSION_INVALID: "VERSION_COMPATIBILITY_TARGET_VERSION_INVALID",
  SUPPORTED_SCHEMA_VERSION_REQUIRED: "VERSION_COMPATIBILITY_SUPPORTED_SCHEMA_VERSION_REQUIRED",
  SUPPORTED_SCHEMA_VERSION_INVALID: "VERSION_COMPATIBILITY_SUPPORTED_SCHEMA_VERSION_INVALID",
  VERSION_RANGE_INVALID: "VERSION_COMPATIBILITY_RANGE_INVALID",
  TARGET_VERSION_OUT_OF_RANGE: "VERSION_COMPATIBILITY_TARGET_VERSION_OUT_OF_RANGE",
  TARGET_RELEASE_VERSION_MISMATCH: "VERSION_COMPATIBILITY_TARGET_RELEASE_VERSION_MISMATCH",
  COMPATIBILITY_STATE_REQUIRED: "VERSION_COMPATIBILITY_STATE_REQUIRED",
  COMPATIBILITY_STATE_INVALID: "VERSION_COMPATIBILITY_STATE_INVALID",
  EVALUATED_AT_REQUIRED: "VERSION_COMPATIBILITY_EVALUATED_AT_REQUIRED",
  EVALUATED_AT_INVALID: "VERSION_COMPATIBILITY_EVALUATED_AT_INVALID",
  COMPATIBILITY_NOTES_INVALID: "VERSION_COMPATIBILITY_NOTES_INVALID",
  OWNER_UPDATE_CHANNEL_MISMATCH: "VERSION_COMPATIBILITY_OWNER_UPDATE_CHANNEL_MISMATCH",
  OWNER_LIBRARY_ITEM_MISMATCH: "VERSION_COMPATIBILITY_OWNER_LIBRARY_ITEM_MISMATCH",
  OWNER_INSTALL_RECEIPT_MISMATCH: "VERSION_COMPATIBILITY_OWNER_INSTALL_RECEIPT_MISMATCH",
  PROJECT_RELEASE_MISMATCH: "VERSION_COMPATIBILITY_PROJECT_RELEASE_MISMATCH",
  PROJECT_PUBLISH_MISMATCH: "VERSION_COMPATIBILITY_PROJECT_PUBLISH_MISMATCH",
  PROJECT_UPDATE_CHANNEL_MISMATCH: "VERSION_COMPATIBILITY_PROJECT_UPDATE_CHANNEL_MISMATCH",
  PROJECT_LIBRARY_ITEM_MISMATCH: "VERSION_COMPATIBILITY_PROJECT_LIBRARY_ITEM_MISMATCH",
  PROJECT_INSTALL_RECEIPT_MISMATCH: "VERSION_COMPATIBILITY_PROJECT_INSTALL_RECEIPT_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "VERSION_COMPATIBILITY_RELEASE_PUBLISH_MISMATCH",
  RELEASE_UPDATE_CHANNEL_MISMATCH: "VERSION_COMPATIBILITY_RELEASE_UPDATE_CHANNEL_MISMATCH",
  RELEASE_LIBRARY_ITEM_MISMATCH: "VERSION_COMPATIBILITY_RELEASE_LIBRARY_ITEM_MISMATCH",
  RELEASE_INSTALL_RECEIPT_MISMATCH: "VERSION_COMPATIBILITY_RELEASE_INSTALL_RECEIPT_MISMATCH",
  PUBLISH_UPDATE_CHANNEL_MISMATCH: "VERSION_COMPATIBILITY_PUBLISH_UPDATE_CHANNEL_MISMATCH",
  PUBLISH_LIBRARY_ITEM_MISMATCH: "VERSION_COMPATIBILITY_PUBLISH_LIBRARY_ITEM_MISMATCH",
  PUBLISH_INSTALL_RECEIPT_MISMATCH: "VERSION_COMPATIBILITY_PUBLISH_INSTALL_RECEIPT_MISMATCH",
  LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH: "VERSION_COMPATIBILITY_LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH",
  FIELD_NOT_ALLOWED: "VERSION_COMPATIBILITY_FIELD_NOT_ALLOWED",
});

export function isVersionCompatibilityState(value) {
  return VERSION_COMPATIBILITY_STATE_LIST.includes(value);
}

export function isVersionCompatibilityVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isTargetVersionInCompatibilityRange(versionCompatibility) {
  return isVersionCompatibilityVersion(versionCompatibility?.minimumVersion)
    && isVersionCompatibilityVersion(versionCompatibility?.maximumVersion)
    && isVersionCompatibilityVersion(versionCompatibility?.targetVersion)
    && versionCompatibility.minimumVersion <= versionCompatibility.maximumVersion
    && versionCompatibility.targetVersion >= versionCompatibility.minimumVersion
    && versionCompatibility.targetVersion <= versionCompatibility.maximumVersion;
}

export function isVersionCompatibilitySourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.projectId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isVersionCompatibilitySourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function isVersionCompatibilityUpdateChannel(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.updateChannelId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.channelType)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && Object.values(UPDATE_CHANNEL_TYPES).includes(value.channelType);
}

export function isVersionCompatibilityLibraryItem(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.libraryStatus === undefined || Object.values(LIBRARY_ITEM_STATUS).includes(value.libraryStatus));
}

export function isVersionCompatibilityInstallReceipt(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.installReceiptId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.receiptStatus === undefined || Object.values(INSTALL_RECEIPT_STATUS).includes(value.receiptStatus));
}

export function validateVersionCompatibilityContract(versionCompatibility) {
  const errors = [];

  collectForbiddenFieldErrors(versionCompatibility, errors);

  if (!hasNonEmptyString(versionCompatibility?.versionCompatibilityId)) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.VERSION_COMPATIBILITY_ID_REQUIRED,
      "Version Compatibility records require versionCompatibilityId.",
      VERSION_COMPATIBILITY_FIELDS.VERSION_COMPATIBILITY_ID
    ));
  }

  if (!hasNonEmptyString(versionCompatibility?.ownerId)) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Version Compatibility records require ownerId.",
      VERSION_COMPATIBILITY_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(versionCompatibility?.projectId)) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Version Compatibility records require projectId.",
      VERSION_COMPATIBILITY_FIELDS.PROJECT
    ));
  }

  validateReference(versionCompatibility, errors, "sourceRelease", VERSION_COMPATIBILITY_FIELDS.SOURCE_RELEASE, VERSION_COMPATIBILITY_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID, isVersionCompatibilitySourceRelease, "Version Compatibility records require sourceRelease.", "Version Compatibility sourceRelease must reference a published or retired Release.");
  validateReference(versionCompatibility, errors, "sourcePublish", VERSION_COMPATIBILITY_FIELDS.SOURCE_PUBLISH, VERSION_COMPATIBILITY_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID, isVersionCompatibilitySourcePublish, "Version Compatibility records require sourcePublish.", "Version Compatibility sourcePublish must reference a published or retired Publish record.");
  validateReference(versionCompatibility, errors, "updateChannel", VERSION_COMPATIBILITY_FIELDS.UPDATE_CHANNEL, VERSION_COMPATIBILITY_CONTRACT_ERRORS.UPDATE_CHANNEL_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.UPDATE_CHANNEL_INVALID, isVersionCompatibilityUpdateChannel, "Version Compatibility records require updateChannel.", "Version Compatibility updateChannel must reference an Update Channel.");
  validateReference(versionCompatibility, errors, "libraryItem", VERSION_COMPATIBILITY_FIELDS.LIBRARY_ITEM, VERSION_COMPATIBILITY_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.LIBRARY_ITEM_INVALID, isVersionCompatibilityLibraryItem, "Version Compatibility records require libraryItem.", "Version Compatibility libraryItem must reference a Library Item.");
  validateReference(versionCompatibility, errors, "installReceipt", VERSION_COMPATIBILITY_FIELDS.INSTALL_RECEIPT, VERSION_COMPATIBILITY_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.INSTALL_RECEIPT_INVALID, isVersionCompatibilityInstallReceipt, "Version Compatibility records require installReceipt.", "Version Compatibility installReceipt must reference an Install Receipt.");

  collectLinkageErrors(versionCompatibility, errors);
  validateVersionRange(versionCompatibility, errors);

  if (!hasNonEmptyString(versionCompatibility?.compatibilityState)) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.COMPATIBILITY_STATE_REQUIRED,
      "Version Compatibility records require compatibilityState.",
      VERSION_COMPATIBILITY_FIELDS.COMPATIBILITY_STATE
    ));
  } else if (!isVersionCompatibilityState(versionCompatibility.compatibilityState)) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.COMPATIBILITY_STATE_INVALID,
      "Version Compatibility state must be incompatible, compatible, deprecated, or blocked.",
      VERSION_COMPATIBILITY_FIELDS.COMPATIBILITY_STATE
    ));
  }

  if (!hasNonEmptyString(versionCompatibility?.evaluatedAt)) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.EVALUATED_AT_REQUIRED,
      "Version Compatibility records require evaluatedAt.",
      VERSION_COMPATIBILITY_FIELDS.EVALUATED_AT
    ));
  } else if (!isTimestamp(versionCompatibility.evaluatedAt)) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.EVALUATED_AT_INVALID,
      "Version Compatibility evaluatedAt must be a valid timestamp.",
      VERSION_COMPATIBILITY_FIELDS.EVALUATED_AT
    ));
  }

  if (versionCompatibility?.compatibilityNotes !== undefined && versionCompatibility.compatibilityNotes !== null && typeof versionCompatibility.compatibilityNotes !== "string") {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.COMPATIBILITY_NOTES_INVALID,
      "Version Compatibility compatibilityNotes must be a string when provided.",
      VERSION_COMPATIBILITY_FIELDS.COMPATIBILITY_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isVersionCompatibilityCompatible(versionCompatibility) {
  return versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.COMPATIBLE;
}

export function isVersionCompatibilityIncompatible(versionCompatibility) {
  return versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.INCOMPATIBLE;
}

export function isVersionCompatibilityDeprecated(versionCompatibility) {
  return versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.DEPRECATED;
}

export function isVersionCompatibilityBlocked(versionCompatibility) {
  return versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.BLOCKED;
}

export function isVersionCompatibilityVisibleToActor({
  actorId,
  versionCompatibility,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === versionCompatibility?.ownerId;
}

export function canActorAccessVersionCompatibility({
  actorId,
  role,
  permission,
  versionCompatibility,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === versionCompatibility?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: versionCompatibility.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.PRIVATE,
      },
    });
  }

  if (permission === IDENTITY_PERMISSIONS.ADMINISTER) {
    return canActorPerformPermission({
      actorId,
      role,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.PLATFORM,
      grantedScopes,
      object: {
        ownerId: versionCompatibility?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function validateReference(record, errors, recordField, contractPath, requiredError, invalidError, referenceValidator, requiredMessage, invalidMessage) {
  if (record?.[recordField] === undefined || record?.[recordField] === null) {
    errors.push(createContractError(requiredError, requiredMessage, contractPath));
    return;
  }

  collectForbiddenFieldErrors(record[recordField], errors, contractPath);

  if (!referenceValidator(record[recordField])) {
    errors.push(createContractError(invalidError, invalidMessage, contractPath));
  }
}

function collectLinkageErrors(versionCompatibility, errors) {
  compareReference(versionCompatibility?.updateChannel, versionCompatibility, "ownerId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.OWNER_UPDATE_CHANNEL_MISMATCH, "Version Compatibility updateChannel.ownerId must match ownerId.", VERSION_COMPATIBILITY_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(versionCompatibility?.libraryItem, versionCompatibility, "ownerId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH, "Version Compatibility libraryItem.ownerId must match ownerId.", VERSION_COMPATIBILITY_FIELDS.LIBRARY_ITEM, errors);
  compareReference(versionCompatibility?.installReceipt, versionCompatibility, "ownerId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.OWNER_INSTALL_RECEIPT_MISMATCH, "Version Compatibility installReceipt.ownerId must match ownerId.", VERSION_COMPATIBILITY_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(versionCompatibility?.sourceRelease, versionCompatibility, "projectId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PROJECT_RELEASE_MISMATCH, "Version Compatibility sourceRelease.projectId must match projectId.", VERSION_COMPATIBILITY_FIELDS.SOURCE_RELEASE, errors);
  compareReference(versionCompatibility?.sourcePublish, versionCompatibility, "projectId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PROJECT_PUBLISH_MISMATCH, "Version Compatibility sourcePublish.projectId must match projectId.", VERSION_COMPATIBILITY_FIELDS.SOURCE_PUBLISH, errors);
  compareReference(versionCompatibility?.updateChannel, versionCompatibility, "projectId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PROJECT_UPDATE_CHANNEL_MISMATCH, "Version Compatibility updateChannel.projectId must match projectId.", VERSION_COMPATIBILITY_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(versionCompatibility?.libraryItem, versionCompatibility, "projectId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PROJECT_LIBRARY_ITEM_MISMATCH, "Version Compatibility libraryItem.projectId must match projectId.", VERSION_COMPATIBILITY_FIELDS.LIBRARY_ITEM, errors);
  compareReference(versionCompatibility?.installReceipt, versionCompatibility, "projectId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PROJECT_INSTALL_RECEIPT_MISMATCH, "Version Compatibility installReceipt.projectId must match projectId.", VERSION_COMPATIBILITY_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(versionCompatibility?.sourcePublish, versionCompatibility?.sourceRelease, "releaseId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH, "Version Compatibility sourcePublish.releaseId must match sourceRelease.releaseId.", VERSION_COMPATIBILITY_FIELDS.SOURCE_PUBLISH, errors);
  compareReference(versionCompatibility?.updateChannel, versionCompatibility?.sourceRelease, "releaseId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.RELEASE_UPDATE_CHANNEL_MISMATCH, "Version Compatibility updateChannel.releaseId must match sourceRelease.releaseId.", VERSION_COMPATIBILITY_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(versionCompatibility?.libraryItem, versionCompatibility?.sourceRelease, "releaseId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.RELEASE_LIBRARY_ITEM_MISMATCH, "Version Compatibility libraryItem.releaseId must match sourceRelease.releaseId.", VERSION_COMPATIBILITY_FIELDS.LIBRARY_ITEM, errors);
  compareReference(versionCompatibility?.installReceipt, versionCompatibility?.sourceRelease, "releaseId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.RELEASE_INSTALL_RECEIPT_MISMATCH, "Version Compatibility installReceipt.releaseId must match sourceRelease.releaseId.", VERSION_COMPATIBILITY_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(versionCompatibility?.updateChannel, versionCompatibility?.sourcePublish, "publishId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PUBLISH_UPDATE_CHANNEL_MISMATCH, "Version Compatibility updateChannel.publishId must match sourcePublish.publishId.", VERSION_COMPATIBILITY_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(versionCompatibility?.libraryItem, versionCompatibility?.sourcePublish, "publishId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PUBLISH_LIBRARY_ITEM_MISMATCH, "Version Compatibility libraryItem.publishId must match sourcePublish.publishId.", VERSION_COMPATIBILITY_FIELDS.LIBRARY_ITEM, errors);
  compareReference(versionCompatibility?.installReceipt, versionCompatibility?.sourcePublish, "publishId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PUBLISH_INSTALL_RECEIPT_MISMATCH, "Version Compatibility installReceipt.publishId must match sourcePublish.publishId.", VERSION_COMPATIBILITY_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(versionCompatibility?.installReceipt, versionCompatibility?.libraryItem, "libraryItemId", VERSION_COMPATIBILITY_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH, "Version Compatibility installReceipt.libraryItemId must match libraryItem.libraryItemId.", VERSION_COMPATIBILITY_FIELDS.INSTALL_RECEIPT, errors);
}

function validateVersionRange(versionCompatibility, errors) {
  validateVersionField(versionCompatibility, errors, "minimumVersion", VERSION_COMPATIBILITY_CONTRACT_ERRORS.MINIMUM_VERSION_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.MINIMUM_VERSION_INVALID, VERSION_COMPATIBILITY_FIELDS.MINIMUM_VERSION);
  validateVersionField(versionCompatibility, errors, "maximumVersion", VERSION_COMPATIBILITY_CONTRACT_ERRORS.MAXIMUM_VERSION_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.MAXIMUM_VERSION_INVALID, VERSION_COMPATIBILITY_FIELDS.MAXIMUM_VERSION);
  validateVersionField(versionCompatibility, errors, "targetVersion", VERSION_COMPATIBILITY_CONTRACT_ERRORS.TARGET_VERSION_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.TARGET_VERSION_INVALID, VERSION_COMPATIBILITY_FIELDS.TARGET_VERSION);
  validateVersionField(versionCompatibility, errors, "supportedSchemaVersion", VERSION_COMPATIBILITY_CONTRACT_ERRORS.SUPPORTED_SCHEMA_VERSION_REQUIRED, VERSION_COMPATIBILITY_CONTRACT_ERRORS.SUPPORTED_SCHEMA_VERSION_INVALID, VERSION_COMPATIBILITY_FIELDS.SUPPORTED_SCHEMA_VERSION);

  if (isVersionCompatibilityVersion(versionCompatibility?.minimumVersion)
    && isVersionCompatibilityVersion(versionCompatibility?.maximumVersion)) {
    if (versionCompatibility.minimumVersion > versionCompatibility.maximumVersion) {
      errors.push(createContractError(
        VERSION_COMPATIBILITY_CONTRACT_ERRORS.VERSION_RANGE_INVALID,
        "Version Compatibility minimumVersion must be less than or equal to maximumVersion.",
        VERSION_COMPATIBILITY_FIELDS.MINIMUM_VERSION
      ));
    } else if (isVersionCompatibilityVersion(versionCompatibility?.targetVersion) && !isTargetVersionInCompatibilityRange(versionCompatibility)) {
      errors.push(createContractError(
        VERSION_COMPATIBILITY_CONTRACT_ERRORS.TARGET_VERSION_OUT_OF_RANGE,
        "Version Compatibility targetVersion must be inside the minimumVersion and maximumVersion range.",
        VERSION_COMPATIBILITY_FIELDS.TARGET_VERSION
      ));
    }
  }

  if (isReferenceObject(versionCompatibility?.sourceRelease)
    && isVersionCompatibilityVersion(versionCompatibility?.targetVersion)
    && isVersionCompatibilityVersion(versionCompatibility.sourceRelease.version)
    && versionCompatibility.targetVersion !== versionCompatibility.sourceRelease.version) {
    errors.push(createContractError(
      VERSION_COMPATIBILITY_CONTRACT_ERRORS.TARGET_RELEASE_VERSION_MISMATCH,
      "Version Compatibility targetVersion must match sourceRelease.version.",
      VERSION_COMPATIBILITY_FIELDS.TARGET_VERSION
    ));
  }
}

function validateVersionField(record, errors, fieldName, requiredError, invalidError, path) {
  if (record?.[fieldName] === undefined || record?.[fieldName] === null) {
    errors.push(createContractError(
      requiredError,
      `Version Compatibility records require ${fieldName}.`,
      path
    ));
  } else if (!isVersionCompatibilityVersion(record[fieldName])) {
    errors.push(createContractError(
      invalidError,
      `Version Compatibility ${fieldName} must be a positive integer.`,
      path
    ));
  }
}

function compareReference(left, right, fieldName, errorCode, message, path, errors) {
  if (isReferenceObject(left)
    && isReferenceObject(right)
    && hasNonEmptyString(left[fieldName])
    && hasNonEmptyString(right[fieldName])
    && left[fieldName] !== right[fieldName]) {
    errors.push(createContractError(errorCode, message, path));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of VERSION_COMPATIBILITY_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Version Compatibility records must not carry runtime, toolState, installer, updater, migration implementation, file bytes, or download state.",
        pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName
      ));
    }
  }
}

function isReferenceObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isTimestamp(value) {
  return hasNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
