/*
Toolbox Aid
David Quesenberry
06/02/2026
migrationPlanContract.js
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
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";
import {
  UPDATE_CHANNEL_TYPES,
} from "./updateChannelContract.js";
import {
  VERSION_COMPATIBILITY_STATES,
} from "./versionCompatibilityContract.js";

export const MIGRATION_PLAN_CONTRACT_ID = "gamefoundrystudio.migration.plan.contract";
export const MIGRATION_PLAN_CONTRACT_VERSION = "1.0.0";

export const MIGRATION_PLAN_FIELDS = Object.freeze({
  MIGRATION_PLAN_ID: "migrationPlanId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  TARGET_RELEASE: "targetRelease",
  VERSION_COMPATIBILITY: "versionCompatibility",
  UPDATE_CHANNEL: "updateChannel",
  LIBRARY_ITEM: "libraryItem",
  INSTALL_RECEIPT: "installReceipt",
  SOURCE_VERSION: "sourceVersion",
  TARGET_VERSION: "targetVersion",
  SCHEMA_VERSION: "schemaVersion",
  MIGRATION_STATE: "migrationState",
  PLANNED_AT: "plannedAt",
  COMPLETED_AT: "completedAt",
  MIGRATION_NOTES: "migrationNotes",
});

export const MIGRATION_PLAN_FIELD_LIST = Object.freeze([
  MIGRATION_PLAN_FIELDS.MIGRATION_PLAN_ID,
  MIGRATION_PLAN_FIELDS.OWNER,
  MIGRATION_PLAN_FIELDS.PROJECT,
  MIGRATION_PLAN_FIELDS.TARGET_RELEASE,
  MIGRATION_PLAN_FIELDS.VERSION_COMPATIBILITY,
  MIGRATION_PLAN_FIELDS.UPDATE_CHANNEL,
  MIGRATION_PLAN_FIELDS.LIBRARY_ITEM,
  MIGRATION_PLAN_FIELDS.INSTALL_RECEIPT,
  MIGRATION_PLAN_FIELDS.SOURCE_VERSION,
  MIGRATION_PLAN_FIELDS.TARGET_VERSION,
  MIGRATION_PLAN_FIELDS.SCHEMA_VERSION,
  MIGRATION_PLAN_FIELDS.MIGRATION_STATE,
  MIGRATION_PLAN_FIELDS.PLANNED_AT,
  MIGRATION_PLAN_FIELDS.COMPLETED_AT,
  MIGRATION_PLAN_FIELDS.MIGRATION_NOTES,
]);

export const MIGRATION_PLAN_STATES = Object.freeze({
  NOT_REQUIRED: "notRequired",
  REQUIRED: "required",
  BLOCKED: "blocked",
  COMPLETED: "completed",
});

export const MIGRATION_PLAN_STATE_LIST = Object.freeze([
  MIGRATION_PLAN_STATES.NOT_REQUIRED,
  MIGRATION_PLAN_STATES.REQUIRED,
  MIGRATION_PLAN_STATES.BLOCKED,
  MIGRATION_PLAN_STATES.COMPLETED,
]);

export const MIGRATION_PLAN_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_TARGET_RELEASE: true,
  REQUIRES_VERSION_COMPATIBILITY: true,
  REQUIRES_UPDATE_CHANNEL: true,
  REQUIRES_LIBRARY_ITEM: true,
  REQUIRES_INSTALL_RECEIPT: true,
  REQUIRES_SOURCE_VERSION: true,
  REQUIRES_TARGET_VERSION: true,
  REQUIRES_SCHEMA_VERSION: true,
  REQUIRES_VALID_MIGRATION_STATE: true,
  REQUIRES_PLANNED_AT: true,
  COMPLETED_MIGRATIONS_REQUIRE_COMPLETED_AT: true,
  REQUIRES_OWNER_COMPATIBILITY_LINKAGE: true,
  REQUIRES_OWNER_UPDATE_CHANNEL_LINKAGE: true,
  REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_PROJECT_RELEASE_LINKAGE: true,
  REQUIRES_PROJECT_COMPATIBILITY_LINKAGE: true,
  REQUIRES_PROJECT_UPDATE_CHANNEL_LINKAGE: true,
  REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_RELEASE_COMPATIBILITY_LINKAGE: true,
  REQUIRES_RELEASE_UPDATE_CHANNEL_LINKAGE: true,
  REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_COMPATIBILITY_UPDATE_CHANNEL_PUBLISH_LINKAGE: true,
  REQUIRES_COMPATIBILITY_LIBRARY_ITEM_PUBLISH_LINKAGE: true,
  REQUIRES_COMPATIBILITY_INSTALL_RECEIPT_PUBLISH_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE: true,
  TARGET_VERSION_MUST_MATCH_RELEASE_VERSION: true,
  TARGET_VERSION_MUST_MATCH_COMPATIBILITY_TARGET: true,
  SCHEMA_VERSION_MUST_MATCH_COMPATIBILITY_SCHEMA: true,
  NOT_REQUIRED_REQUIRES_EQUAL_SOURCE_TARGET_VERSION: true,
  REQUIRED_OR_COMPLETED_REQUIRES_NEWER_TARGET_VERSION: true,
  BLOCKED_OR_INCOMPATIBLE_COMPATIBILITY_REQUIRES_BLOCKED_PLAN: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_INSTALLER_STATE: true,
  NO_UPDATER_IMPLEMENTATION_DETAILS: true,
  NO_MIGRATION_IMPLEMENTATION_CODE: true,
  NO_FILE_BYTES: true,
  NO_DOWNLOAD_STATE: true,
});

export const MIGRATION_PLAN_FORBIDDEN_FIELDS = Object.freeze([
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
  "functionBody",
  "installPlan",
  "installSession",
  "installState",
  "installSteps",
  "installedFiles",
  "installerImplementation",
  "installerState",
  "localStorage",
  "migrationCode",
  "migrationFunction",
  "migrationImplementation",
  "migrationJobId",
  "migrationLog",
  "migrationPayload",
  "migrationResult",
  "migrationRuntime",
  "migrationScript",
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
  "transformCode",
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

export const MIGRATION_PLAN_CONTRACT_ERRORS = Object.freeze({
  MIGRATION_PLAN_ID_REQUIRED: "MIGRATION_PLAN_ID_REQUIRED",
  OWNER_REQUIRED: "MIGRATION_PLAN_OWNER_REQUIRED",
  PROJECT_REQUIRED: "MIGRATION_PLAN_PROJECT_REQUIRED",
  TARGET_RELEASE_REQUIRED: "MIGRATION_PLAN_TARGET_RELEASE_REQUIRED",
  TARGET_RELEASE_INVALID: "MIGRATION_PLAN_TARGET_RELEASE_INVALID",
  VERSION_COMPATIBILITY_REQUIRED: "MIGRATION_PLAN_VERSION_COMPATIBILITY_REQUIRED",
  VERSION_COMPATIBILITY_INVALID: "MIGRATION_PLAN_VERSION_COMPATIBILITY_INVALID",
  UPDATE_CHANNEL_REQUIRED: "MIGRATION_PLAN_UPDATE_CHANNEL_REQUIRED",
  UPDATE_CHANNEL_INVALID: "MIGRATION_PLAN_UPDATE_CHANNEL_INVALID",
  LIBRARY_ITEM_REQUIRED: "MIGRATION_PLAN_LIBRARY_ITEM_REQUIRED",
  LIBRARY_ITEM_INVALID: "MIGRATION_PLAN_LIBRARY_ITEM_INVALID",
  INSTALL_RECEIPT_REQUIRED: "MIGRATION_PLAN_INSTALL_RECEIPT_REQUIRED",
  INSTALL_RECEIPT_INVALID: "MIGRATION_PLAN_INSTALL_RECEIPT_INVALID",
  SOURCE_VERSION_REQUIRED: "MIGRATION_PLAN_SOURCE_VERSION_REQUIRED",
  SOURCE_VERSION_INVALID: "MIGRATION_PLAN_SOURCE_VERSION_INVALID",
  TARGET_VERSION_REQUIRED: "MIGRATION_PLAN_TARGET_VERSION_REQUIRED",
  TARGET_VERSION_INVALID: "MIGRATION_PLAN_TARGET_VERSION_INVALID",
  SCHEMA_VERSION_REQUIRED: "MIGRATION_PLAN_SCHEMA_VERSION_REQUIRED",
  SCHEMA_VERSION_INVALID: "MIGRATION_PLAN_SCHEMA_VERSION_INVALID",
  MIGRATION_STATE_REQUIRED: "MIGRATION_PLAN_STATE_REQUIRED",
  MIGRATION_STATE_INVALID: "MIGRATION_PLAN_STATE_INVALID",
  PLANNED_AT_REQUIRED: "MIGRATION_PLAN_PLANNED_AT_REQUIRED",
  PLANNED_AT_INVALID: "MIGRATION_PLAN_PLANNED_AT_INVALID",
  COMPLETED_AT_REQUIRED: "MIGRATION_PLAN_COMPLETED_AT_REQUIRED",
  COMPLETED_AT_INVALID: "MIGRATION_PLAN_COMPLETED_AT_INVALID",
  MIGRATION_NOTES_INVALID: "MIGRATION_PLAN_NOTES_INVALID",
  OWNER_COMPATIBILITY_MISMATCH: "MIGRATION_PLAN_OWNER_COMPATIBILITY_MISMATCH",
  OWNER_UPDATE_CHANNEL_MISMATCH: "MIGRATION_PLAN_OWNER_UPDATE_CHANNEL_MISMATCH",
  OWNER_LIBRARY_ITEM_MISMATCH: "MIGRATION_PLAN_OWNER_LIBRARY_ITEM_MISMATCH",
  OWNER_INSTALL_RECEIPT_MISMATCH: "MIGRATION_PLAN_OWNER_INSTALL_RECEIPT_MISMATCH",
  PROJECT_RELEASE_MISMATCH: "MIGRATION_PLAN_PROJECT_RELEASE_MISMATCH",
  PROJECT_COMPATIBILITY_MISMATCH: "MIGRATION_PLAN_PROJECT_COMPATIBILITY_MISMATCH",
  PROJECT_UPDATE_CHANNEL_MISMATCH: "MIGRATION_PLAN_PROJECT_UPDATE_CHANNEL_MISMATCH",
  PROJECT_LIBRARY_ITEM_MISMATCH: "MIGRATION_PLAN_PROJECT_LIBRARY_ITEM_MISMATCH",
  PROJECT_INSTALL_RECEIPT_MISMATCH: "MIGRATION_PLAN_PROJECT_INSTALL_RECEIPT_MISMATCH",
  RELEASE_COMPATIBILITY_MISMATCH: "MIGRATION_PLAN_RELEASE_COMPATIBILITY_MISMATCH",
  RELEASE_UPDATE_CHANNEL_MISMATCH: "MIGRATION_PLAN_RELEASE_UPDATE_CHANNEL_MISMATCH",
  RELEASE_LIBRARY_ITEM_MISMATCH: "MIGRATION_PLAN_RELEASE_LIBRARY_ITEM_MISMATCH",
  RELEASE_INSTALL_RECEIPT_MISMATCH: "MIGRATION_PLAN_RELEASE_INSTALL_RECEIPT_MISMATCH",
  PUBLISH_COMPATIBILITY_UPDATE_CHANNEL_MISMATCH: "MIGRATION_PLAN_PUBLISH_COMPATIBILITY_UPDATE_CHANNEL_MISMATCH",
  PUBLISH_COMPATIBILITY_LIBRARY_ITEM_MISMATCH: "MIGRATION_PLAN_PUBLISH_COMPATIBILITY_LIBRARY_ITEM_MISMATCH",
  PUBLISH_COMPATIBILITY_INSTALL_RECEIPT_MISMATCH: "MIGRATION_PLAN_PUBLISH_COMPATIBILITY_INSTALL_RECEIPT_MISMATCH",
  LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH: "MIGRATION_PLAN_LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH",
  TARGET_RELEASE_VERSION_MISMATCH: "MIGRATION_PLAN_TARGET_RELEASE_VERSION_MISMATCH",
  VERSION_COMPATIBILITY_TARGET_MISMATCH: "MIGRATION_PLAN_VERSION_COMPATIBILITY_TARGET_MISMATCH",
  SCHEMA_VERSION_MISMATCH: "MIGRATION_PLAN_SCHEMA_VERSION_MISMATCH",
  NOT_REQUIRED_VERSION_MISMATCH: "MIGRATION_PLAN_NOT_REQUIRED_VERSION_MISMATCH",
  TARGET_VERSION_NOT_NEWER: "MIGRATION_PLAN_TARGET_VERSION_NOT_NEWER",
  COMPATIBILITY_GATE_BLOCKED: "MIGRATION_PLAN_COMPATIBILITY_GATE_BLOCKED",
  FIELD_NOT_ALLOWED: "MIGRATION_PLAN_FIELD_NOT_ALLOWED",
});

export function isMigrationPlanState(value) {
  return MIGRATION_PLAN_STATE_LIST.includes(value);
}

export function isMigrationPlanVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isMigrationPlanTargetRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.projectId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isMigrationPlanVersionCompatibility(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.versionCompatibilityId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && isMigrationPlanVersion(value.targetVersion)
    && isMigrationPlanVersion(value.supportedSchemaVersion)
    && Object.values(VERSION_COMPATIBILITY_STATES).includes(value.compatibilityState);
}

export function isMigrationPlanUpdateChannel(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.updateChannelId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.channelType)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && Object.values(UPDATE_CHANNEL_TYPES).includes(value.channelType);
}

export function isMigrationPlanLibraryItem(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.libraryStatus === undefined || Object.values(LIBRARY_ITEM_STATUS).includes(value.libraryStatus));
}

export function isMigrationPlanInstallReceipt(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.installReceiptId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.receiptStatus === undefined || Object.values(INSTALL_RECEIPT_STATUS).includes(value.receiptStatus));
}

export function validateMigrationPlanContract(migrationPlan) {
  const errors = [];

  collectForbiddenFieldErrors(migrationPlan, errors);

  if (!hasNonEmptyString(migrationPlan?.migrationPlanId)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.MIGRATION_PLAN_ID_REQUIRED,
      "Migration Plan records require migrationPlanId.",
      MIGRATION_PLAN_FIELDS.MIGRATION_PLAN_ID
    ));
  }

  if (!hasNonEmptyString(migrationPlan?.ownerId)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Migration Plan records require ownerId.",
      MIGRATION_PLAN_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(migrationPlan?.projectId)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Migration Plan records require projectId.",
      MIGRATION_PLAN_FIELDS.PROJECT
    ));
  }

  validateReference(migrationPlan, errors, "targetRelease", MIGRATION_PLAN_FIELDS.TARGET_RELEASE, MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_RELEASE_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_RELEASE_INVALID, isMigrationPlanTargetRelease, "Migration Plan records require targetRelease.", "Migration Plan targetRelease must reference a published or retired Release.");
  validateReference(migrationPlan, errors, "versionCompatibility", MIGRATION_PLAN_FIELDS.VERSION_COMPATIBILITY, MIGRATION_PLAN_CONTRACT_ERRORS.VERSION_COMPATIBILITY_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.VERSION_COMPATIBILITY_INVALID, isMigrationPlanVersionCompatibility, "Migration Plan records require versionCompatibility.", "Migration Plan versionCompatibility must reference a Version Compatibility record.");
  validateReference(migrationPlan, errors, "updateChannel", MIGRATION_PLAN_FIELDS.UPDATE_CHANNEL, MIGRATION_PLAN_CONTRACT_ERRORS.UPDATE_CHANNEL_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.UPDATE_CHANNEL_INVALID, isMigrationPlanUpdateChannel, "Migration Plan records require updateChannel.", "Migration Plan updateChannel must reference an Update Channel.");
  validateReference(migrationPlan, errors, "libraryItem", MIGRATION_PLAN_FIELDS.LIBRARY_ITEM, MIGRATION_PLAN_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.LIBRARY_ITEM_INVALID, isMigrationPlanLibraryItem, "Migration Plan records require libraryItem.", "Migration Plan libraryItem must reference a Library Item.");
  validateReference(migrationPlan, errors, "installReceipt", MIGRATION_PLAN_FIELDS.INSTALL_RECEIPT, MIGRATION_PLAN_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.INSTALL_RECEIPT_INVALID, isMigrationPlanInstallReceipt, "Migration Plan records require installReceipt.", "Migration Plan installReceipt must reference an Install Receipt.");

  collectLinkageErrors(migrationPlan, errors);
  validateVersions(migrationPlan, errors);
  validateStateAndGate(migrationPlan, errors);

  if (!hasNonEmptyString(migrationPlan?.plannedAt)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.PLANNED_AT_REQUIRED,
      "Migration Plan records require plannedAt.",
      MIGRATION_PLAN_FIELDS.PLANNED_AT
    ));
  } else if (!isTimestamp(migrationPlan.plannedAt)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.PLANNED_AT_INVALID,
      "Migration Plan plannedAt must be a valid timestamp.",
      MIGRATION_PLAN_FIELDS.PLANNED_AT
    ));
  }

  if (migrationPlan?.migrationState === MIGRATION_PLAN_STATES.COMPLETED) {
    if (!hasNonEmptyString(migrationPlan?.completedAt)) {
      errors.push(createContractError(
        MIGRATION_PLAN_CONTRACT_ERRORS.COMPLETED_AT_REQUIRED,
        "Completed Migration Plan records require completedAt.",
        MIGRATION_PLAN_FIELDS.COMPLETED_AT
      ));
    } else if (!isTimestamp(migrationPlan.completedAt)) {
      errors.push(createContractError(
        MIGRATION_PLAN_CONTRACT_ERRORS.COMPLETED_AT_INVALID,
        "Migration Plan completedAt must be a valid timestamp.",
        MIGRATION_PLAN_FIELDS.COMPLETED_AT
      ));
    }
  } else if (migrationPlan?.completedAt !== undefined && migrationPlan.completedAt !== null && !isTimestamp(migrationPlan.completedAt)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.COMPLETED_AT_INVALID,
      "Migration Plan completedAt must be a valid timestamp when provided.",
      MIGRATION_PLAN_FIELDS.COMPLETED_AT
    ));
  }

  if (migrationPlan?.migrationNotes !== undefined && migrationPlan.migrationNotes !== null && typeof migrationPlan.migrationNotes !== "string") {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.MIGRATION_NOTES_INVALID,
      "Migration Plan migrationNotes must be a string when provided.",
      MIGRATION_PLAN_FIELDS.MIGRATION_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isMigrationPlanNotRequired(migrationPlan) {
  return migrationPlan?.migrationState === MIGRATION_PLAN_STATES.NOT_REQUIRED;
}

export function isMigrationPlanRequired(migrationPlan) {
  return migrationPlan?.migrationState === MIGRATION_PLAN_STATES.REQUIRED;
}

export function isMigrationPlanBlocked(migrationPlan) {
  return migrationPlan?.migrationState === MIGRATION_PLAN_STATES.BLOCKED;
}

export function isMigrationPlanCompleted(migrationPlan) {
  return migrationPlan?.migrationState === MIGRATION_PLAN_STATES.COMPLETED
    && isTimestamp(migrationPlan.completedAt);
}

export function isMigrationPlanVisibleToActor({
  actorId,
  migrationPlan,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === migrationPlan?.ownerId;
}

export function canActorAccessMigrationPlan({
  actorId,
  role,
  permission,
  migrationPlan,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === migrationPlan?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: migrationPlan.ownerId,
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
        ownerId: migrationPlan?.ownerId,
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

function collectLinkageErrors(migrationPlan, errors) {
  compareReference(migrationPlan?.versionCompatibility, migrationPlan, "ownerId", MIGRATION_PLAN_CONTRACT_ERRORS.OWNER_COMPATIBILITY_MISMATCH, "Migration Plan versionCompatibility.ownerId must match ownerId.", MIGRATION_PLAN_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(migrationPlan?.updateChannel, migrationPlan, "ownerId", MIGRATION_PLAN_CONTRACT_ERRORS.OWNER_UPDATE_CHANNEL_MISMATCH, "Migration Plan updateChannel.ownerId must match ownerId.", MIGRATION_PLAN_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(migrationPlan?.libraryItem, migrationPlan, "ownerId", MIGRATION_PLAN_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH, "Migration Plan libraryItem.ownerId must match ownerId.", MIGRATION_PLAN_FIELDS.LIBRARY_ITEM, errors);
  compareReference(migrationPlan?.installReceipt, migrationPlan, "ownerId", MIGRATION_PLAN_CONTRACT_ERRORS.OWNER_INSTALL_RECEIPT_MISMATCH, "Migration Plan installReceipt.ownerId must match ownerId.", MIGRATION_PLAN_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(migrationPlan?.targetRelease, migrationPlan, "projectId", MIGRATION_PLAN_CONTRACT_ERRORS.PROJECT_RELEASE_MISMATCH, "Migration Plan targetRelease.projectId must match projectId.", MIGRATION_PLAN_FIELDS.TARGET_RELEASE, errors);
  compareReference(migrationPlan?.versionCompatibility, migrationPlan, "projectId", MIGRATION_PLAN_CONTRACT_ERRORS.PROJECT_COMPATIBILITY_MISMATCH, "Migration Plan versionCompatibility.projectId must match projectId.", MIGRATION_PLAN_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(migrationPlan?.updateChannel, migrationPlan, "projectId", MIGRATION_PLAN_CONTRACT_ERRORS.PROJECT_UPDATE_CHANNEL_MISMATCH, "Migration Plan updateChannel.projectId must match projectId.", MIGRATION_PLAN_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(migrationPlan?.libraryItem, migrationPlan, "projectId", MIGRATION_PLAN_CONTRACT_ERRORS.PROJECT_LIBRARY_ITEM_MISMATCH, "Migration Plan libraryItem.projectId must match projectId.", MIGRATION_PLAN_FIELDS.LIBRARY_ITEM, errors);
  compareReference(migrationPlan?.installReceipt, migrationPlan, "projectId", MIGRATION_PLAN_CONTRACT_ERRORS.PROJECT_INSTALL_RECEIPT_MISMATCH, "Migration Plan installReceipt.projectId must match projectId.", MIGRATION_PLAN_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(migrationPlan?.versionCompatibility, migrationPlan?.targetRelease, "releaseId", MIGRATION_PLAN_CONTRACT_ERRORS.RELEASE_COMPATIBILITY_MISMATCH, "Migration Plan versionCompatibility.releaseId must match targetRelease.releaseId.", MIGRATION_PLAN_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(migrationPlan?.updateChannel, migrationPlan?.targetRelease, "releaseId", MIGRATION_PLAN_CONTRACT_ERRORS.RELEASE_UPDATE_CHANNEL_MISMATCH, "Migration Plan updateChannel.releaseId must match targetRelease.releaseId.", MIGRATION_PLAN_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(migrationPlan?.libraryItem, migrationPlan?.targetRelease, "releaseId", MIGRATION_PLAN_CONTRACT_ERRORS.RELEASE_LIBRARY_ITEM_MISMATCH, "Migration Plan libraryItem.releaseId must match targetRelease.releaseId.", MIGRATION_PLAN_FIELDS.LIBRARY_ITEM, errors);
  compareReference(migrationPlan?.installReceipt, migrationPlan?.targetRelease, "releaseId", MIGRATION_PLAN_CONTRACT_ERRORS.RELEASE_INSTALL_RECEIPT_MISMATCH, "Migration Plan installReceipt.releaseId must match targetRelease.releaseId.", MIGRATION_PLAN_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(migrationPlan?.updateChannel, migrationPlan?.versionCompatibility, "publishId", MIGRATION_PLAN_CONTRACT_ERRORS.PUBLISH_COMPATIBILITY_UPDATE_CHANNEL_MISMATCH, "Migration Plan updateChannel.publishId must match versionCompatibility.publishId.", MIGRATION_PLAN_FIELDS.UPDATE_CHANNEL, errors);
  compareReference(migrationPlan?.libraryItem, migrationPlan?.versionCompatibility, "publishId", MIGRATION_PLAN_CONTRACT_ERRORS.PUBLISH_COMPATIBILITY_LIBRARY_ITEM_MISMATCH, "Migration Plan libraryItem.publishId must match versionCompatibility.publishId.", MIGRATION_PLAN_FIELDS.LIBRARY_ITEM, errors);
  compareReference(migrationPlan?.installReceipt, migrationPlan?.versionCompatibility, "publishId", MIGRATION_PLAN_CONTRACT_ERRORS.PUBLISH_COMPATIBILITY_INSTALL_RECEIPT_MISMATCH, "Migration Plan installReceipt.publishId must match versionCompatibility.publishId.", MIGRATION_PLAN_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(migrationPlan?.installReceipt, migrationPlan?.libraryItem, "libraryItemId", MIGRATION_PLAN_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH, "Migration Plan installReceipt.libraryItemId must match libraryItem.libraryItemId.", MIGRATION_PLAN_FIELDS.INSTALL_RECEIPT, errors);
}

function validateVersions(migrationPlan, errors) {
  validateVersionField(migrationPlan, errors, "sourceVersion", MIGRATION_PLAN_CONTRACT_ERRORS.SOURCE_VERSION_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.SOURCE_VERSION_INVALID, MIGRATION_PLAN_FIELDS.SOURCE_VERSION);
  validateVersionField(migrationPlan, errors, "targetVersion", MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_VERSION_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_VERSION_INVALID, MIGRATION_PLAN_FIELDS.TARGET_VERSION);
  validateVersionField(migrationPlan, errors, "schemaVersion", MIGRATION_PLAN_CONTRACT_ERRORS.SCHEMA_VERSION_REQUIRED, MIGRATION_PLAN_CONTRACT_ERRORS.SCHEMA_VERSION_INVALID, MIGRATION_PLAN_FIELDS.SCHEMA_VERSION);

  if (isReferenceObject(migrationPlan?.targetRelease)
    && isMigrationPlanVersion(migrationPlan?.targetVersion)
    && isMigrationPlanVersion(migrationPlan.targetRelease.version)
    && migrationPlan.targetVersion !== migrationPlan.targetRelease.version) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_RELEASE_VERSION_MISMATCH,
      "Migration Plan targetVersion must match targetRelease.version.",
      MIGRATION_PLAN_FIELDS.TARGET_VERSION
    ));
  }

  if (isReferenceObject(migrationPlan?.versionCompatibility)
    && isMigrationPlanVersion(migrationPlan?.targetVersion)
    && isMigrationPlanVersion(migrationPlan.versionCompatibility.targetVersion)
    && migrationPlan.targetVersion !== migrationPlan.versionCompatibility.targetVersion) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.VERSION_COMPATIBILITY_TARGET_MISMATCH,
      "Migration Plan targetVersion must match versionCompatibility.targetVersion.",
      MIGRATION_PLAN_FIELDS.TARGET_VERSION
    ));
  }

  if (isReferenceObject(migrationPlan?.versionCompatibility)
    && isMigrationPlanVersion(migrationPlan?.schemaVersion)
    && isMigrationPlanVersion(migrationPlan.versionCompatibility.supportedSchemaVersion)
    && migrationPlan.schemaVersion !== migrationPlan.versionCompatibility.supportedSchemaVersion) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.SCHEMA_VERSION_MISMATCH,
      "Migration Plan schemaVersion must match versionCompatibility.supportedSchemaVersion.",
      MIGRATION_PLAN_FIELDS.SCHEMA_VERSION
    ));
  }
}

function validateStateAndGate(migrationPlan, errors) {
  if (!hasNonEmptyString(migrationPlan?.migrationState)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.MIGRATION_STATE_REQUIRED,
      "Migration Plan records require migrationState.",
      MIGRATION_PLAN_FIELDS.MIGRATION_STATE
    ));
    return;
  }

  if (!isMigrationPlanState(migrationPlan.migrationState)) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.MIGRATION_STATE_INVALID,
      "Migration Plan state must be notRequired, required, blocked, or completed.",
      MIGRATION_PLAN_FIELDS.MIGRATION_STATE
    ));
    return;
  }

  if (isMigrationPlanVersion(migrationPlan?.sourceVersion) && isMigrationPlanVersion(migrationPlan?.targetVersion)) {
    if (migrationPlan.migrationState === MIGRATION_PLAN_STATES.NOT_REQUIRED && migrationPlan.sourceVersion !== migrationPlan.targetVersion) {
      errors.push(createContractError(
        MIGRATION_PLAN_CONTRACT_ERRORS.NOT_REQUIRED_VERSION_MISMATCH,
        "Migration Plan notRequired state requires sourceVersion to match targetVersion.",
        MIGRATION_PLAN_FIELDS.MIGRATION_STATE
      ));
    }

    if ((migrationPlan.migrationState === MIGRATION_PLAN_STATES.REQUIRED || migrationPlan.migrationState === MIGRATION_PLAN_STATES.COMPLETED)
      && migrationPlan.targetVersion <= migrationPlan.sourceVersion) {
      errors.push(createContractError(
        MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_VERSION_NOT_NEWER,
        "Migration Plan required and completed states require targetVersion to be newer than sourceVersion.",
        MIGRATION_PLAN_FIELDS.TARGET_VERSION
      ));
    }
  }

  if (isReferenceObject(migrationPlan?.versionCompatibility)
    && (migrationPlan.versionCompatibility.compatibilityState === VERSION_COMPATIBILITY_STATES.BLOCKED
      || migrationPlan.versionCompatibility.compatibilityState === VERSION_COMPATIBILITY_STATES.INCOMPATIBLE)
    && migrationPlan.migrationState !== MIGRATION_PLAN_STATES.BLOCKED) {
    errors.push(createContractError(
      MIGRATION_PLAN_CONTRACT_ERRORS.COMPATIBILITY_GATE_BLOCKED,
      "Migration Plan must be blocked when versionCompatibility is blocked or incompatible.",
      MIGRATION_PLAN_FIELDS.VERSION_COMPATIBILITY
    ));
  }
}

function validateVersionField(record, errors, fieldName, requiredError, invalidError, path) {
  if (record?.[fieldName] === undefined || record?.[fieldName] === null) {
    errors.push(createContractError(
      requiredError,
      `Migration Plan records require ${fieldName}.`,
      path
    ));
  } else if (!isMigrationPlanVersion(record[fieldName])) {
    errors.push(createContractError(
      invalidError,
      `Migration Plan ${fieldName} must be a positive integer.`,
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

  for (const fieldName of MIGRATION_PLAN_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Migration Plan records must not carry runtime, toolState, installer, updater, migration implementation code, file bytes, or download state.",
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
