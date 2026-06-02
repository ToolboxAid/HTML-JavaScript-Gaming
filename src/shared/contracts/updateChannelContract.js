/*
Toolbox Aid
David Quesenberry
06/02/2026
updateChannelContract.js
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

export const UPDATE_CHANNEL_CONTRACT_ID = "gamefoundrystudio.update.channel.contract";
export const UPDATE_CHANNEL_CONTRACT_VERSION = "1.0.0";

export const UPDATE_CHANNEL_FIELDS = Object.freeze({
  UPDATE_CHANNEL_ID: "updateChannelId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  CHANNEL_TYPE: "channelType",
  ASSIGNED_RELEASE: "assignedRelease",
  ASSIGNED_PUBLISH: "assignedPublish",
  LIBRARY_ITEM: "libraryItem",
  INSTALL_RECEIPT: "installReceipt",
  ASSIGNED_AT: "assignedAt",
  PROMOTES_FROM: "promotesFrom",
  PROMOTED_AT: "promotedAt",
  CHANNEL_NOTES: "channelNotes",
});

export const UPDATE_CHANNEL_FIELD_LIST = Object.freeze([
  UPDATE_CHANNEL_FIELDS.UPDATE_CHANNEL_ID,
  UPDATE_CHANNEL_FIELDS.OWNER,
  UPDATE_CHANNEL_FIELDS.PROJECT,
  UPDATE_CHANNEL_FIELDS.CHANNEL_TYPE,
  UPDATE_CHANNEL_FIELDS.ASSIGNED_RELEASE,
  UPDATE_CHANNEL_FIELDS.ASSIGNED_PUBLISH,
  UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM,
  UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT,
  UPDATE_CHANNEL_FIELDS.ASSIGNED_AT,
  UPDATE_CHANNEL_FIELDS.PROMOTES_FROM,
  UPDATE_CHANNEL_FIELDS.PROMOTED_AT,
  UPDATE_CHANNEL_FIELDS.CHANNEL_NOTES,
]);

export const UPDATE_CHANNEL_TYPES = Object.freeze({
  STABLE: "stable",
  BETA: "beta",
  ALPHA: "alpha",
  PREVIEW: "preview",
});

export const UPDATE_CHANNEL_TYPE_LIST = Object.freeze([
  UPDATE_CHANNEL_TYPES.STABLE,
  UPDATE_CHANNEL_TYPES.BETA,
  UPDATE_CHANNEL_TYPES.ALPHA,
  UPDATE_CHANNEL_TYPES.PREVIEW,
]);

export const UPDATE_CHANNEL_PROMOTION_ORDER = Object.freeze([
  UPDATE_CHANNEL_TYPES.PREVIEW,
  UPDATE_CHANNEL_TYPES.ALPHA,
  UPDATE_CHANNEL_TYPES.BETA,
  UPDATE_CHANNEL_TYPES.STABLE,
]);

export const UPDATE_CHANNEL_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_VALID_CHANNEL_TYPE: true,
  REQUIRES_ASSIGNED_RELEASE: true,
  REQUIRES_ASSIGNED_PUBLISH: true,
  REQUIRES_LIBRARY_ITEM: true,
  REQUIRES_INSTALL_RECEIPT: true,
  REQUIRES_ASSIGNED_AT: true,
  REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_PROJECT_RELEASE_LINKAGE: true,
  REQUIRES_PROJECT_PUBLISH_LINKAGE: true,
  REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_RELEASE_PUBLISH_LINKAGE: true,
  REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_PUBLISH_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PUBLISH_INSTALL_RECEIPT_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE: true,
  PROMOTION_MUST_MOVE_TOWARD_STABLE_CHANNEL: true,
  PROMOTION_REQUIRES_PROMOTED_AT: true,
  NO_PAYMENT_STATE: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_INSTALLER_STATE: true,
  NO_UPDATER_IMPLEMENTATION_DETAILS: true,
  NO_DOWNLOAD_STATE: true,
});

export const UPDATE_CHANNEL_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "checkoutSession",
  "credentials",
  "dirty",
  "downloadGrant",
  "downloadGrantId",
  "downloadSession",
  "downloadState",
  "downloadToken",
  "downloadUrl",
  "downloadedAt",
  "downloads",
  "identityProvider",
  "installPlan",
  "installSession",
  "installState",
  "installSteps",
  "installerImplementation",
  "installerState",
  "invoice",
  "localStorage",
  "paymentIntent",
  "paymentMethod",
  "paymentProvider",
  "paymentState",
  "paymentStatus",
  "payload",
  "payloadJson",
  "patchBytes",
  "patchUrl",
  "receipt",
  "recoveryAvailable",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "stripeSession",
  "token",
  "toolState",
  "toolStateId",
  "toolStates",
  "transactionId",
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

export const UPDATE_CHANNEL_CONTRACT_ERRORS = Object.freeze({
  UPDATE_CHANNEL_ID_REQUIRED: "UPDATE_CHANNEL_ID_REQUIRED",
  OWNER_REQUIRED: "UPDATE_CHANNEL_OWNER_REQUIRED",
  PROJECT_REQUIRED: "UPDATE_CHANNEL_PROJECT_REQUIRED",
  CHANNEL_TYPE_REQUIRED: "UPDATE_CHANNEL_TYPE_REQUIRED",
  CHANNEL_TYPE_INVALID: "UPDATE_CHANNEL_TYPE_INVALID",
  ASSIGNED_RELEASE_REQUIRED: "UPDATE_CHANNEL_ASSIGNED_RELEASE_REQUIRED",
  ASSIGNED_RELEASE_INVALID: "UPDATE_CHANNEL_ASSIGNED_RELEASE_INVALID",
  ASSIGNED_PUBLISH_REQUIRED: "UPDATE_CHANNEL_ASSIGNED_PUBLISH_REQUIRED",
  ASSIGNED_PUBLISH_INVALID: "UPDATE_CHANNEL_ASSIGNED_PUBLISH_INVALID",
  LIBRARY_ITEM_REQUIRED: "UPDATE_CHANNEL_LIBRARY_ITEM_REQUIRED",
  LIBRARY_ITEM_INVALID: "UPDATE_CHANNEL_LIBRARY_ITEM_INVALID",
  INSTALL_RECEIPT_REQUIRED: "UPDATE_CHANNEL_INSTALL_RECEIPT_REQUIRED",
  INSTALL_RECEIPT_INVALID: "UPDATE_CHANNEL_INSTALL_RECEIPT_INVALID",
  ASSIGNED_AT_REQUIRED: "UPDATE_CHANNEL_ASSIGNED_AT_REQUIRED",
  ASSIGNED_AT_INVALID: "UPDATE_CHANNEL_ASSIGNED_AT_INVALID",
  PROMOTES_FROM_REQUIRED: "UPDATE_CHANNEL_PROMOTES_FROM_REQUIRED",
  PROMOTES_FROM_INVALID: "UPDATE_CHANNEL_PROMOTES_FROM_INVALID",
  PROMOTION_ORDER_INVALID: "UPDATE_CHANNEL_PROMOTION_ORDER_INVALID",
  PROMOTED_AT_REQUIRED: "UPDATE_CHANNEL_PROMOTED_AT_REQUIRED",
  PROMOTED_AT_INVALID: "UPDATE_CHANNEL_PROMOTED_AT_INVALID",
  CHANNEL_NOTES_INVALID: "UPDATE_CHANNEL_NOTES_INVALID",
  OWNER_LIBRARY_ITEM_MISMATCH: "UPDATE_CHANNEL_OWNER_LIBRARY_ITEM_MISMATCH",
  OWNER_INSTALL_RECEIPT_MISMATCH: "UPDATE_CHANNEL_OWNER_INSTALL_RECEIPT_MISMATCH",
  PROJECT_RELEASE_MISMATCH: "UPDATE_CHANNEL_PROJECT_RELEASE_MISMATCH",
  PROJECT_PUBLISH_MISMATCH: "UPDATE_CHANNEL_PROJECT_PUBLISH_MISMATCH",
  PROJECT_LIBRARY_ITEM_MISMATCH: "UPDATE_CHANNEL_PROJECT_LIBRARY_ITEM_MISMATCH",
  PROJECT_INSTALL_RECEIPT_MISMATCH: "UPDATE_CHANNEL_PROJECT_INSTALL_RECEIPT_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "UPDATE_CHANNEL_RELEASE_PUBLISH_MISMATCH",
  RELEASE_LIBRARY_ITEM_MISMATCH: "UPDATE_CHANNEL_RELEASE_LIBRARY_ITEM_MISMATCH",
  RELEASE_INSTALL_RECEIPT_MISMATCH: "UPDATE_CHANNEL_RELEASE_INSTALL_RECEIPT_MISMATCH",
  PUBLISH_LIBRARY_ITEM_MISMATCH: "UPDATE_CHANNEL_PUBLISH_LIBRARY_ITEM_MISMATCH",
  PUBLISH_INSTALL_RECEIPT_MISMATCH: "UPDATE_CHANNEL_PUBLISH_INSTALL_RECEIPT_MISMATCH",
  LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH: "UPDATE_CHANNEL_LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH",
  FIELD_NOT_ALLOWED: "UPDATE_CHANNEL_FIELD_NOT_ALLOWED",
});

export function isUpdateChannelType(value) {
  return UPDATE_CHANNEL_TYPE_LIST.includes(value);
}

export function canPromoteUpdateChannel({
  fromChannelType,
  toChannelType,
} = {}) {
  if (!isUpdateChannelType(fromChannelType) || !isUpdateChannelType(toChannelType)) {
    return false;
  }

  return UPDATE_CHANNEL_PROMOTION_ORDER.indexOf(toChannelType) > UPDATE_CHANNEL_PROMOTION_ORDER.indexOf(fromChannelType);
}

export function isUpdateChannelAssignedRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.projectId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isUpdateChannelAssignedPublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function isUpdateChannelLibraryItem(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.libraryStatus === undefined || Object.values(LIBRARY_ITEM_STATUS).includes(value.libraryStatus));
}

export function isUpdateChannelInstallReceipt(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.installReceiptId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.receiptStatus === undefined || Object.values(INSTALL_RECEIPT_STATUS).includes(value.receiptStatus));
}

export function validateUpdateChannelContract(updateChannel) {
  const errors = [];

  collectForbiddenFieldErrors(updateChannel, errors);

  if (!hasNonEmptyString(updateChannel?.updateChannelId)) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.UPDATE_CHANNEL_ID_REQUIRED,
      "Update Channel records require updateChannelId.",
      UPDATE_CHANNEL_FIELDS.UPDATE_CHANNEL_ID
    ));
  }

  if (!hasNonEmptyString(updateChannel?.ownerId)) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Update Channel records require ownerId.",
      UPDATE_CHANNEL_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(updateChannel?.projectId)) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Update Channel records require projectId.",
      UPDATE_CHANNEL_FIELDS.PROJECT
    ));
  }

  if (!hasNonEmptyString(updateChannel?.channelType)) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.CHANNEL_TYPE_REQUIRED,
      "Update Channel records require channelType.",
      UPDATE_CHANNEL_FIELDS.CHANNEL_TYPE
    ));
  } else if (!isUpdateChannelType(updateChannel.channelType)) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.CHANNEL_TYPE_INVALID,
      "Update Channel type must be stable, beta, alpha, or preview.",
      UPDATE_CHANNEL_FIELDS.CHANNEL_TYPE
    ));
  }

  if (updateChannel?.assignedRelease === undefined || updateChannel?.assignedRelease === null) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_RELEASE_REQUIRED,
      "Update Channel records require assignedRelease.",
      UPDATE_CHANNEL_FIELDS.ASSIGNED_RELEASE
    ));
  } else {
    collectForbiddenFieldErrors(updateChannel.assignedRelease, errors, UPDATE_CHANNEL_FIELDS.ASSIGNED_RELEASE);

    if (!isUpdateChannelAssignedRelease(updateChannel.assignedRelease)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_RELEASE_INVALID,
        "Update Channel assignedRelease must reference a published or retired Release.",
        UPDATE_CHANNEL_FIELDS.ASSIGNED_RELEASE
      ));
    }
  }

  if (updateChannel?.assignedPublish === undefined || updateChannel?.assignedPublish === null) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_PUBLISH_REQUIRED,
      "Update Channel records require assignedPublish.",
      UPDATE_CHANNEL_FIELDS.ASSIGNED_PUBLISH
    ));
  } else {
    collectForbiddenFieldErrors(updateChannel.assignedPublish, errors, UPDATE_CHANNEL_FIELDS.ASSIGNED_PUBLISH);

    if (!isUpdateChannelAssignedPublish(updateChannel.assignedPublish)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_PUBLISH_INVALID,
        "Update Channel assignedPublish must reference a published or retired Publish record.",
        UPDATE_CHANNEL_FIELDS.ASSIGNED_PUBLISH
      ));
    }
  }

  if (updateChannel?.libraryItem === undefined || updateChannel?.libraryItem === null) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED,
      "Update Channel records require libraryItem.",
      UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM
    ));
  } else {
    collectForbiddenFieldErrors(updateChannel.libraryItem, errors, UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM);

    if (!isUpdateChannelLibraryItem(updateChannel.libraryItem)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.LIBRARY_ITEM_INVALID,
        "Update Channel libraryItem must reference a Library Item.",
        UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM
      ));
    }
  }

  if (updateChannel?.installReceipt === undefined || updateChannel?.installReceipt === null) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED,
      "Update Channel records require installReceipt.",
      UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT
    ));
  } else {
    collectForbiddenFieldErrors(updateChannel.installReceipt, errors, UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT);

    if (!isUpdateChannelInstallReceipt(updateChannel.installReceipt)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.INSTALL_RECEIPT_INVALID,
        "Update Channel installReceipt must reference an Install Receipt.",
        UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT
      ));
    }
  }

  collectLinkageErrors(updateChannel, errors);
  validateAssignmentAndPromotion(updateChannel, errors);

  if (updateChannel?.channelNotes !== undefined && updateChannel.channelNotes !== null && typeof updateChannel.channelNotes !== "string") {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.CHANNEL_NOTES_INVALID,
      "Update Channel channelNotes must be a string when provided.",
      UPDATE_CHANNEL_FIELDS.CHANNEL_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isUpdateChannelVisibleToActor({
  actorId,
  updateChannel,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === updateChannel?.ownerId;
}

export function canActorAccessUpdateChannel({
  actorId,
  role,
  permission,
  updateChannel,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === updateChannel?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: updateChannel.ownerId,
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
        ownerId: updateChannel?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function collectLinkageErrors(updateChannel, errors) {
  compareReference(updateChannel?.libraryItem, updateChannel, "ownerId", UPDATE_CHANNEL_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH, "Update Channel libraryItem.ownerId must match ownerId.", UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM, errors);
  compareReference(updateChannel?.installReceipt, updateChannel, "ownerId", UPDATE_CHANNEL_CONTRACT_ERRORS.OWNER_INSTALL_RECEIPT_MISMATCH, "Update Channel installReceipt.ownerId must match ownerId.", UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(updateChannel?.assignedRelease, updateChannel, "projectId", UPDATE_CHANNEL_CONTRACT_ERRORS.PROJECT_RELEASE_MISMATCH, "Update Channel assignedRelease.projectId must match projectId.", UPDATE_CHANNEL_FIELDS.ASSIGNED_RELEASE, errors);
  compareReference(updateChannel?.assignedPublish, updateChannel, "projectId", UPDATE_CHANNEL_CONTRACT_ERRORS.PROJECT_PUBLISH_MISMATCH, "Update Channel assignedPublish.projectId must match projectId.", UPDATE_CHANNEL_FIELDS.ASSIGNED_PUBLISH, errors);
  compareReference(updateChannel?.libraryItem, updateChannel, "projectId", UPDATE_CHANNEL_CONTRACT_ERRORS.PROJECT_LIBRARY_ITEM_MISMATCH, "Update Channel libraryItem.projectId must match projectId.", UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM, errors);
  compareReference(updateChannel?.installReceipt, updateChannel, "projectId", UPDATE_CHANNEL_CONTRACT_ERRORS.PROJECT_INSTALL_RECEIPT_MISMATCH, "Update Channel installReceipt.projectId must match projectId.", UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(updateChannel?.assignedPublish, updateChannel?.assignedRelease, "releaseId", UPDATE_CHANNEL_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH, "Update Channel assignedPublish.releaseId must match assignedRelease.releaseId.", UPDATE_CHANNEL_FIELDS.ASSIGNED_PUBLISH, errors);
  compareReference(updateChannel?.libraryItem, updateChannel?.assignedRelease, "releaseId", UPDATE_CHANNEL_CONTRACT_ERRORS.RELEASE_LIBRARY_ITEM_MISMATCH, "Update Channel libraryItem.releaseId must match assignedRelease.releaseId.", UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM, errors);
  compareReference(updateChannel?.installReceipt, updateChannel?.assignedRelease, "releaseId", UPDATE_CHANNEL_CONTRACT_ERRORS.RELEASE_INSTALL_RECEIPT_MISMATCH, "Update Channel installReceipt.releaseId must match assignedRelease.releaseId.", UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(updateChannel?.libraryItem, updateChannel?.assignedPublish, "publishId", UPDATE_CHANNEL_CONTRACT_ERRORS.PUBLISH_LIBRARY_ITEM_MISMATCH, "Update Channel libraryItem.publishId must match assignedPublish.publishId.", UPDATE_CHANNEL_FIELDS.LIBRARY_ITEM, errors);
  compareReference(updateChannel?.installReceipt, updateChannel?.assignedPublish, "publishId", UPDATE_CHANNEL_CONTRACT_ERRORS.PUBLISH_INSTALL_RECEIPT_MISMATCH, "Update Channel installReceipt.publishId must match assignedPublish.publishId.", UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT, errors);
  compareReference(updateChannel?.installReceipt, updateChannel?.libraryItem, "libraryItemId", UPDATE_CHANNEL_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH, "Update Channel installReceipt.libraryItemId must match libraryItem.libraryItemId.", UPDATE_CHANNEL_FIELDS.INSTALL_RECEIPT, errors);
}

function validateAssignmentAndPromotion(updateChannel, errors) {
  if (!hasNonEmptyString(updateChannel?.assignedAt)) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_AT_REQUIRED,
      "Update Channel records require assignedAt.",
      UPDATE_CHANNEL_FIELDS.ASSIGNED_AT
    ));
  } else if (!isTimestamp(updateChannel.assignedAt)) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_AT_INVALID,
      "Update Channel assignedAt must be a valid timestamp.",
      UPDATE_CHANNEL_FIELDS.ASSIGNED_AT
    ));
  }

  if (updateChannel?.promotesFrom !== undefined && updateChannel.promotesFrom !== null) {
    if (!hasNonEmptyString(updateChannel.promotesFrom) || !isUpdateChannelType(updateChannel.promotesFrom)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTES_FROM_INVALID,
        "Update Channel promotesFrom must be a valid channel type when provided.",
        UPDATE_CHANNEL_FIELDS.PROMOTES_FROM
      ));
    } else if (isUpdateChannelType(updateChannel?.channelType) && !canPromoteUpdateChannel({
      fromChannelType: updateChannel.promotesFrom,
      toChannelType: updateChannel.channelType,
    })) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTION_ORDER_INVALID,
        "Update Channel promotion must move from preview toward stable.",
        UPDATE_CHANNEL_FIELDS.PROMOTES_FROM
      ));
    }

    if (!hasNonEmptyString(updateChannel?.promotedAt)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTED_AT_REQUIRED,
        "Update Channel records with promotesFrom require promotedAt.",
        UPDATE_CHANNEL_FIELDS.PROMOTED_AT
      ));
    } else if (!isTimestamp(updateChannel.promotedAt)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTED_AT_INVALID,
        "Update Channel promotedAt must be a valid timestamp.",
        UPDATE_CHANNEL_FIELDS.PROMOTED_AT
      ));
    }
  } else if (updateChannel?.promotedAt !== undefined && updateChannel.promotedAt !== null) {
    errors.push(createContractError(
      UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTES_FROM_REQUIRED,
      "Update Channel records with promotedAt require promotesFrom.",
      UPDATE_CHANNEL_FIELDS.PROMOTES_FROM
    ));

    if (!isTimestamp(updateChannel.promotedAt)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTED_AT_INVALID,
        "Update Channel promotedAt must be a valid timestamp.",
        UPDATE_CHANNEL_FIELDS.PROMOTED_AT
      ));
    }
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

  for (const fieldName of UPDATE_CHANNEL_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Update Channel records must not carry payment, auth session, runtime, toolState, installer, updater implementation, or download state.",
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
