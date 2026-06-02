/*
Toolbox Aid
David Quesenberry
06/02/2026
backupSnapshotContract.js
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
  MIGRATION_PLAN_STATES,
} from "./migrationPlanContract.js";
import {
  PUBLISH_STATUS,
} from "./publishContract.js";
import {
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";

export const BACKUP_SNAPSHOT_CONTRACT_ID = "gamefoundrystudio.backup.snapshot.contract";
export const BACKUP_SNAPSHOT_CONTRACT_VERSION = "1.0.0";

export const BACKUP_SNAPSHOT_FIELDS = Object.freeze({
  BACKUP_SNAPSHOT_ID: "backupSnapshotId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  LIBRARY_ITEM: "libraryItem",
  INSTALL_RECEIPT: "installReceipt",
  MIGRATION_PLAN: "migrationPlan",
  SNAPSHOT_VERSION: "snapshotVersion",
  SCHEMA_VERSION: "schemaVersion",
  CREATED_AT: "createdAt",
  BACKUP_NOTES: "backupNotes",
});

export const BACKUP_SNAPSHOT_FIELD_LIST = Object.freeze([
  BACKUP_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT_ID,
  BACKUP_SNAPSHOT_FIELDS.OWNER,
  BACKUP_SNAPSHOT_FIELDS.PROJECT,
  BACKUP_SNAPSHOT_FIELDS.SOURCE_RELEASE,
  BACKUP_SNAPSHOT_FIELDS.SOURCE_PUBLISH,
  BACKUP_SNAPSHOT_FIELDS.LIBRARY_ITEM,
  BACKUP_SNAPSHOT_FIELDS.INSTALL_RECEIPT,
  BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN,
  BACKUP_SNAPSHOT_FIELDS.SNAPSHOT_VERSION,
  BACKUP_SNAPSHOT_FIELDS.SCHEMA_VERSION,
  BACKUP_SNAPSHOT_FIELDS.CREATED_AT,
  BACKUP_SNAPSHOT_FIELDS.BACKUP_NOTES,
]);

export const BACKUP_SNAPSHOT_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_LIBRARY_ITEM: true,
  REQUIRES_INSTALL_RECEIPT: true,
  REQUIRES_MIGRATION_PLAN: true,
  REQUIRES_SNAPSHOT_VERSION: true,
  REQUIRES_SCHEMA_VERSION: true,
  REQUIRES_CREATED_AT: true,
  REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_OWNER_MIGRATION_PLAN_LINKAGE: true,
  REQUIRES_PROJECT_RELEASE_LINKAGE: true,
  REQUIRES_PROJECT_PUBLISH_LINKAGE: true,
  REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_PROJECT_MIGRATION_PLAN_LINKAGE: true,
  REQUIRES_RELEASE_PUBLISH_LINKAGE: true,
  REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_RELEASE_MIGRATION_PLAN_LINKAGE: true,
  REQUIRES_PUBLISH_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PUBLISH_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_PUBLISH_MIGRATION_PLAN_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_MIGRATION_PLAN_LINKAGE: true,
  REQUIRES_INSTALL_RECEIPT_MIGRATION_PLAN_LINKAGE: true,
  SNAPSHOT_VERSION_MUST_MATCH_RELEASE_VERSION: true,
  SNAPSHOT_VERSION_MUST_MATCH_MIGRATION_PLAN_TARGET: true,
  SCHEMA_VERSION_MUST_MATCH_MIGRATION_PLAN_SCHEMA: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_FILE_BYTES: true,
  NO_AUTH_SESSION_STATE: true,
  NO_INSTALLER_STATE: true,
  NO_UPDATER_IMPLEMENTATION_DETAILS: true,
  NO_STORAGE_IMPLEMENTATION_DETAILS: true,
});

export const BACKUP_SNAPSHOT_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "arrayBuffer",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "backupBytes",
  "backupPayload",
  "base64",
  "binary",
  "blob",
  "bucketName",
  "buffer",
  "bytes",
  "cdnKey",
  "cdnProvider",
  "cdnUrl",
  "content",
  "credentials",
  "databaseId",
  "dirty",
  "fileBytes",
  "fileData",
  "filePath",
  "installLog",
  "installPath",
  "installPlan",
  "installSession",
  "installState",
  "installSteps",
  "installedFiles",
  "installerImplementation",
  "installerState",
  "localStorage",
  "objectKey",
  "payload",
  "payloadJson",
  "recoveryAvailable",
  "s3Bucket",
  "s3Key",
  "session",
  "sessionStorage",
  "signedUrl",
  "snapshotBytes",
  "snapshotData",
  "sourceToolStates",
  "storageBucket",
  "storageKey",
  "storagePath",
  "storageProvider",
  "storageRegion",
  "toolState",
  "toolStateId",
  "toolStates",
  "token",
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

export const BACKUP_SNAPSHOT_CONTRACT_ERRORS = Object.freeze({
  BACKUP_SNAPSHOT_ID_REQUIRED: "BACKUP_SNAPSHOT_ID_REQUIRED",
  OWNER_REQUIRED: "BACKUP_SNAPSHOT_OWNER_REQUIRED",
  PROJECT_REQUIRED: "BACKUP_SNAPSHOT_PROJECT_REQUIRED",
  SOURCE_RELEASE_REQUIRED: "BACKUP_SNAPSHOT_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "BACKUP_SNAPSHOT_SOURCE_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "BACKUP_SNAPSHOT_SOURCE_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "BACKUP_SNAPSHOT_SOURCE_PUBLISH_INVALID",
  LIBRARY_ITEM_REQUIRED: "BACKUP_SNAPSHOT_LIBRARY_ITEM_REQUIRED",
  LIBRARY_ITEM_INVALID: "BACKUP_SNAPSHOT_LIBRARY_ITEM_INVALID",
  INSTALL_RECEIPT_REQUIRED: "BACKUP_SNAPSHOT_INSTALL_RECEIPT_REQUIRED",
  INSTALL_RECEIPT_INVALID: "BACKUP_SNAPSHOT_INSTALL_RECEIPT_INVALID",
  MIGRATION_PLAN_REQUIRED: "BACKUP_SNAPSHOT_MIGRATION_PLAN_REQUIRED",
  MIGRATION_PLAN_INVALID: "BACKUP_SNAPSHOT_MIGRATION_PLAN_INVALID",
  SNAPSHOT_VERSION_REQUIRED: "BACKUP_SNAPSHOT_VERSION_REQUIRED",
  SNAPSHOT_VERSION_INVALID: "BACKUP_SNAPSHOT_VERSION_INVALID",
  SCHEMA_VERSION_REQUIRED: "BACKUP_SNAPSHOT_SCHEMA_VERSION_REQUIRED",
  SCHEMA_VERSION_INVALID: "BACKUP_SNAPSHOT_SCHEMA_VERSION_INVALID",
  CREATED_AT_REQUIRED: "BACKUP_SNAPSHOT_CREATED_AT_REQUIRED",
  CREATED_AT_INVALID: "BACKUP_SNAPSHOT_CREATED_AT_INVALID",
  BACKUP_NOTES_INVALID: "BACKUP_SNAPSHOT_NOTES_INVALID",
  OWNER_LIBRARY_ITEM_MISMATCH: "BACKUP_SNAPSHOT_OWNER_LIBRARY_ITEM_MISMATCH",
  OWNER_INSTALL_RECEIPT_MISMATCH: "BACKUP_SNAPSHOT_OWNER_INSTALL_RECEIPT_MISMATCH",
  OWNER_MIGRATION_PLAN_MISMATCH: "BACKUP_SNAPSHOT_OWNER_MIGRATION_PLAN_MISMATCH",
  PROJECT_RELEASE_MISMATCH: "BACKUP_SNAPSHOT_PROJECT_RELEASE_MISMATCH",
  PROJECT_PUBLISH_MISMATCH: "BACKUP_SNAPSHOT_PROJECT_PUBLISH_MISMATCH",
  PROJECT_LIBRARY_ITEM_MISMATCH: "BACKUP_SNAPSHOT_PROJECT_LIBRARY_ITEM_MISMATCH",
  PROJECT_INSTALL_RECEIPT_MISMATCH: "BACKUP_SNAPSHOT_PROJECT_INSTALL_RECEIPT_MISMATCH",
  PROJECT_MIGRATION_PLAN_MISMATCH: "BACKUP_SNAPSHOT_PROJECT_MIGRATION_PLAN_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "BACKUP_SNAPSHOT_RELEASE_PUBLISH_MISMATCH",
  RELEASE_LIBRARY_ITEM_MISMATCH: "BACKUP_SNAPSHOT_RELEASE_LIBRARY_ITEM_MISMATCH",
  RELEASE_INSTALL_RECEIPT_MISMATCH: "BACKUP_SNAPSHOT_RELEASE_INSTALL_RECEIPT_MISMATCH",
  RELEASE_MIGRATION_PLAN_MISMATCH: "BACKUP_SNAPSHOT_RELEASE_MIGRATION_PLAN_MISMATCH",
  PUBLISH_LIBRARY_ITEM_MISMATCH: "BACKUP_SNAPSHOT_PUBLISH_LIBRARY_ITEM_MISMATCH",
  PUBLISH_INSTALL_RECEIPT_MISMATCH: "BACKUP_SNAPSHOT_PUBLISH_INSTALL_RECEIPT_MISMATCH",
  PUBLISH_MIGRATION_PLAN_MISMATCH: "BACKUP_SNAPSHOT_PUBLISH_MIGRATION_PLAN_MISMATCH",
  LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH: "BACKUP_SNAPSHOT_LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH",
  LIBRARY_ITEM_MIGRATION_PLAN_MISMATCH: "BACKUP_SNAPSHOT_LIBRARY_ITEM_MIGRATION_PLAN_MISMATCH",
  INSTALL_RECEIPT_MIGRATION_PLAN_MISMATCH: "BACKUP_SNAPSHOT_INSTALL_RECEIPT_MIGRATION_PLAN_MISMATCH",
  RELEASE_VERSION_MISMATCH: "BACKUP_SNAPSHOT_RELEASE_VERSION_MISMATCH",
  MIGRATION_PLAN_TARGET_VERSION_MISMATCH: "BACKUP_SNAPSHOT_MIGRATION_PLAN_TARGET_VERSION_MISMATCH",
  MIGRATION_PLAN_SCHEMA_MISMATCH: "BACKUP_SNAPSHOT_MIGRATION_PLAN_SCHEMA_MISMATCH",
  FIELD_NOT_ALLOWED: "BACKUP_SNAPSHOT_FIELD_NOT_ALLOWED",
});

export function isBackupSnapshotVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isBackupSnapshotSourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.projectId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isBackupSnapshotSourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function isBackupSnapshotLibraryItem(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.libraryStatus === undefined || Object.values(LIBRARY_ITEM_STATUS).includes(value.libraryStatus));
}

export function isBackupSnapshotInstallReceipt(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.installReceiptId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.receiptStatus === undefined || Object.values(INSTALL_RECEIPT_STATUS).includes(value.receiptStatus));
}

export function isBackupSnapshotMigrationPlan(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.migrationPlanId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.installReceiptId)
    && isBackupSnapshotVersion(value.targetVersion)
    && isBackupSnapshotVersion(value.schemaVersion)
    && Object.values(MIGRATION_PLAN_STATES).includes(value.migrationState);
}

export function validateBackupSnapshotContract(backupSnapshot) {
  const errors = [];

  collectForbiddenFieldErrors(backupSnapshot, errors);

  if (!hasNonEmptyString(backupSnapshot?.backupSnapshotId)) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.BACKUP_SNAPSHOT_ID_REQUIRED,
      "Backup Snapshot records require backupSnapshotId.",
      BACKUP_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT_ID
    ));
  }

  if (!hasNonEmptyString(backupSnapshot?.ownerId)) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Backup Snapshot records require ownerId.",
      BACKUP_SNAPSHOT_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(backupSnapshot?.projectId)) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Backup Snapshot records require projectId.",
      BACKUP_SNAPSHOT_FIELDS.PROJECT
    ));
  }

  validateReference(backupSnapshot, errors, "sourceRelease", BACKUP_SNAPSHOT_FIELDS.SOURCE_RELEASE, BACKUP_SNAPSHOT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED, BACKUP_SNAPSHOT_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID, isBackupSnapshotSourceRelease, "Backup Snapshot records require sourceRelease.", "Backup Snapshot sourceRelease must reference a published or retired Release.");
  validateReference(backupSnapshot, errors, "sourcePublish", BACKUP_SNAPSHOT_FIELDS.SOURCE_PUBLISH, BACKUP_SNAPSHOT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED, BACKUP_SNAPSHOT_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID, isBackupSnapshotSourcePublish, "Backup Snapshot records require sourcePublish.", "Backup Snapshot sourcePublish must reference a published or retired Publish record.");
  validateReference(backupSnapshot, errors, "libraryItem", BACKUP_SNAPSHOT_FIELDS.LIBRARY_ITEM, BACKUP_SNAPSHOT_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED, BACKUP_SNAPSHOT_CONTRACT_ERRORS.LIBRARY_ITEM_INVALID, isBackupSnapshotLibraryItem, "Backup Snapshot records require libraryItem.", "Backup Snapshot libraryItem must reference a Library Item.");
  validateReference(backupSnapshot, errors, "installReceipt", BACKUP_SNAPSHOT_FIELDS.INSTALL_RECEIPT, BACKUP_SNAPSHOT_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED, BACKUP_SNAPSHOT_CONTRACT_ERRORS.INSTALL_RECEIPT_INVALID, isBackupSnapshotInstallReceipt, "Backup Snapshot records require installReceipt.", "Backup Snapshot installReceipt must reference an Install Receipt.");
  validateReference(backupSnapshot, errors, "migrationPlan", BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN, BACKUP_SNAPSHOT_CONTRACT_ERRORS.MIGRATION_PLAN_REQUIRED, BACKUP_SNAPSHOT_CONTRACT_ERRORS.MIGRATION_PLAN_INVALID, isBackupSnapshotMigrationPlan, "Backup Snapshot records require migrationPlan.", "Backup Snapshot migrationPlan must reference a Migration Plan.");

  collectLinkageErrors(backupSnapshot, errors);
  validateVersions(backupSnapshot, errors);

  if (!hasNonEmptyString(backupSnapshot?.createdAt)) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.CREATED_AT_REQUIRED,
      "Backup Snapshot records require createdAt.",
      BACKUP_SNAPSHOT_FIELDS.CREATED_AT
    ));
  } else if (!isTimestamp(backupSnapshot.createdAt)) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.CREATED_AT_INVALID,
      "Backup Snapshot createdAt must be a valid timestamp.",
      BACKUP_SNAPSHOT_FIELDS.CREATED_AT
    ));
  }

  if (backupSnapshot?.backupNotes !== undefined && backupSnapshot.backupNotes !== null && typeof backupSnapshot.backupNotes !== "string") {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.BACKUP_NOTES_INVALID,
      "Backup Snapshot backupNotes must be a string when provided.",
      BACKUP_SNAPSHOT_FIELDS.BACKUP_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isBackupSnapshotVisibleToActor({
  actorId,
  backupSnapshot,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === backupSnapshot?.ownerId;
}

export function canActorAccessBackupSnapshot({
  actorId,
  role,
  permission,
  backupSnapshot,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === backupSnapshot?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: backupSnapshot.ownerId,
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
        ownerId: backupSnapshot?.ownerId,
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

function collectLinkageErrors(backupSnapshot, errors) {
  compareReference(backupSnapshot?.libraryItem, backupSnapshot, "ownerId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH, "Backup Snapshot libraryItem.ownerId must match ownerId.", BACKUP_SNAPSHOT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(backupSnapshot?.installReceipt, backupSnapshot, "ownerId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.OWNER_INSTALL_RECEIPT_MISMATCH, "Backup Snapshot installReceipt.ownerId must match ownerId.", BACKUP_SNAPSHOT_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(backupSnapshot?.migrationPlan, backupSnapshot, "ownerId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.OWNER_MIGRATION_PLAN_MISMATCH, "Backup Snapshot migrationPlan.ownerId must match ownerId.", BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN, errors);
  compareReference(backupSnapshot?.sourceRelease, backupSnapshot, "projectId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_RELEASE_MISMATCH, "Backup Snapshot sourceRelease.projectId must match projectId.", BACKUP_SNAPSHOT_FIELDS.SOURCE_RELEASE, errors);
  compareReference(backupSnapshot?.sourcePublish, backupSnapshot, "projectId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_PUBLISH_MISMATCH, "Backup Snapshot sourcePublish.projectId must match projectId.", BACKUP_SNAPSHOT_FIELDS.SOURCE_PUBLISH, errors);
  compareReference(backupSnapshot?.libraryItem, backupSnapshot, "projectId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_LIBRARY_ITEM_MISMATCH, "Backup Snapshot libraryItem.projectId must match projectId.", BACKUP_SNAPSHOT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(backupSnapshot?.installReceipt, backupSnapshot, "projectId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_INSTALL_RECEIPT_MISMATCH, "Backup Snapshot installReceipt.projectId must match projectId.", BACKUP_SNAPSHOT_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(backupSnapshot?.migrationPlan, backupSnapshot, "projectId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_MIGRATION_PLAN_MISMATCH, "Backup Snapshot migrationPlan.projectId must match projectId.", BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN, errors);
  compareReference(backupSnapshot?.sourcePublish, backupSnapshot?.sourceRelease, "releaseId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH, "Backup Snapshot sourcePublish.releaseId must match sourceRelease.releaseId.", BACKUP_SNAPSHOT_FIELDS.SOURCE_PUBLISH, errors);
  compareReference(backupSnapshot?.libraryItem, backupSnapshot?.sourceRelease, "releaseId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.RELEASE_LIBRARY_ITEM_MISMATCH, "Backup Snapshot libraryItem.releaseId must match sourceRelease.releaseId.", BACKUP_SNAPSHOT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(backupSnapshot?.installReceipt, backupSnapshot?.sourceRelease, "releaseId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.RELEASE_INSTALL_RECEIPT_MISMATCH, "Backup Snapshot installReceipt.releaseId must match sourceRelease.releaseId.", BACKUP_SNAPSHOT_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(backupSnapshot?.migrationPlan, backupSnapshot?.sourceRelease, "releaseId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.RELEASE_MIGRATION_PLAN_MISMATCH, "Backup Snapshot migrationPlan.releaseId must match sourceRelease.releaseId.", BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN, errors);
  compareReference(backupSnapshot?.libraryItem, backupSnapshot?.sourcePublish, "publishId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PUBLISH_LIBRARY_ITEM_MISMATCH, "Backup Snapshot libraryItem.publishId must match sourcePublish.publishId.", BACKUP_SNAPSHOT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(backupSnapshot?.installReceipt, backupSnapshot?.sourcePublish, "publishId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PUBLISH_INSTALL_RECEIPT_MISMATCH, "Backup Snapshot installReceipt.publishId must match sourcePublish.publishId.", BACKUP_SNAPSHOT_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(backupSnapshot?.migrationPlan, backupSnapshot?.sourcePublish, "publishId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PUBLISH_MIGRATION_PLAN_MISMATCH, "Backup Snapshot migrationPlan.publishId must match sourcePublish.publishId.", BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN, errors);
  compareReference(backupSnapshot?.installReceipt, backupSnapshot?.libraryItem, "libraryItemId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH, "Backup Snapshot installReceipt.libraryItemId must match libraryItem.libraryItemId.", BACKUP_SNAPSHOT_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(backupSnapshot?.migrationPlan, backupSnapshot?.libraryItem, "libraryItemId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.LIBRARY_ITEM_MIGRATION_PLAN_MISMATCH, "Backup Snapshot migrationPlan.libraryItemId must match libraryItem.libraryItemId.", BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN, errors);
  compareReference(backupSnapshot?.migrationPlan, backupSnapshot?.installReceipt, "installReceiptId", BACKUP_SNAPSHOT_CONTRACT_ERRORS.INSTALL_RECEIPT_MIGRATION_PLAN_MISMATCH, "Backup Snapshot migrationPlan.installReceiptId must match installReceipt.installReceiptId.", BACKUP_SNAPSHOT_FIELDS.MIGRATION_PLAN, errors);
}

function validateVersions(backupSnapshot, errors) {
  validateVersionField(backupSnapshot, errors, "snapshotVersion", BACKUP_SNAPSHOT_CONTRACT_ERRORS.SNAPSHOT_VERSION_REQUIRED, BACKUP_SNAPSHOT_CONTRACT_ERRORS.SNAPSHOT_VERSION_INVALID, BACKUP_SNAPSHOT_FIELDS.SNAPSHOT_VERSION);
  validateVersionField(backupSnapshot, errors, "schemaVersion", BACKUP_SNAPSHOT_CONTRACT_ERRORS.SCHEMA_VERSION_REQUIRED, BACKUP_SNAPSHOT_CONTRACT_ERRORS.SCHEMA_VERSION_INVALID, BACKUP_SNAPSHOT_FIELDS.SCHEMA_VERSION);

  if (isReferenceObject(backupSnapshot?.sourceRelease)
    && isBackupSnapshotVersion(backupSnapshot?.snapshotVersion)
    && isBackupSnapshotVersion(backupSnapshot.sourceRelease.version)
    && backupSnapshot.snapshotVersion !== backupSnapshot.sourceRelease.version) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.RELEASE_VERSION_MISMATCH,
      "Backup Snapshot snapshotVersion must match sourceRelease.version.",
      BACKUP_SNAPSHOT_FIELDS.SNAPSHOT_VERSION
    ));
  }

  if (isReferenceObject(backupSnapshot?.migrationPlan)
    && isBackupSnapshotVersion(backupSnapshot?.snapshotVersion)
    && isBackupSnapshotVersion(backupSnapshot.migrationPlan.targetVersion)
    && backupSnapshot.snapshotVersion !== backupSnapshot.migrationPlan.targetVersion) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.MIGRATION_PLAN_TARGET_VERSION_MISMATCH,
      "Backup Snapshot snapshotVersion must match migrationPlan.targetVersion.",
      BACKUP_SNAPSHOT_FIELDS.SNAPSHOT_VERSION
    ));
  }

  if (isReferenceObject(backupSnapshot?.migrationPlan)
    && isBackupSnapshotVersion(backupSnapshot?.schemaVersion)
    && isBackupSnapshotVersion(backupSnapshot.migrationPlan.schemaVersion)
    && backupSnapshot.schemaVersion !== backupSnapshot.migrationPlan.schemaVersion) {
    errors.push(createContractError(
      BACKUP_SNAPSHOT_CONTRACT_ERRORS.MIGRATION_PLAN_SCHEMA_MISMATCH,
      "Backup Snapshot schemaVersion must match migrationPlan.schemaVersion.",
      BACKUP_SNAPSHOT_FIELDS.SCHEMA_VERSION
    ));
  }
}

function validateVersionField(record, errors, fieldName, requiredError, invalidError, path) {
  if (record?.[fieldName] === undefined || record?.[fieldName] === null) {
    errors.push(createContractError(
      requiredError,
      `Backup Snapshot records require ${fieldName}.`,
      path
    ));
  } else if (!isBackupSnapshotVersion(record[fieldName])) {
    errors.push(createContractError(
      invalidError,
      `Backup Snapshot ${fieldName} must be a positive integer.`,
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

  for (const fieldName of BACKUP_SNAPSHOT_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Backup Snapshot records must not carry runtime, toolState, file bytes, auth session, installer, updater, or storage implementation details.",
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
