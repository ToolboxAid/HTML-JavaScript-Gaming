/*
Toolbox Aid
David Quesenberry
06/02/2026
installReceiptContract.js
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
  ENTITLEMENT_TYPES,
} from "./entitlementContract.js";
import {
  LIBRARY_ITEM_STATUS,
} from "./libraryItemContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
} from "./marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
} from "./publishContract.js";
import {
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";

export const INSTALL_RECEIPT_CONTRACT_ID = "gamefoundrystudio.install.receipt.contract";
export const INSTALL_RECEIPT_CONTRACT_VERSION = "1.0.0";

export const INSTALL_RECEIPT_FIELDS = Object.freeze({
  INSTALL_RECEIPT_ID: "installReceiptId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  LIBRARY_ITEM: "libraryItem",
  ENTITLEMENT: "entitlement",
  MARKETPLACE_LISTING: "marketplaceListing",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  RECEIPT_STATUS: "receiptStatus",
  INSTALLED_AT: "installedAt",
  REMOVED_AT: "removedAt",
  FAILED_AT: "failedAt",
  SUPERSEDED_AT: "supersededAt",
  RECEIPT_NOTES: "receiptNotes",
});

export const INSTALL_RECEIPT_FIELD_LIST = Object.freeze([
  INSTALL_RECEIPT_FIELDS.INSTALL_RECEIPT_ID,
  INSTALL_RECEIPT_FIELDS.OWNER,
  INSTALL_RECEIPT_FIELDS.PROJECT,
  INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM,
  INSTALL_RECEIPT_FIELDS.ENTITLEMENT,
  INSTALL_RECEIPT_FIELDS.MARKETPLACE_LISTING,
  INSTALL_RECEIPT_FIELDS.SOURCE_RELEASE,
  INSTALL_RECEIPT_FIELDS.SOURCE_PUBLISH,
  INSTALL_RECEIPT_FIELDS.RECEIPT_STATUS,
  INSTALL_RECEIPT_FIELDS.INSTALLED_AT,
  INSTALL_RECEIPT_FIELDS.REMOVED_AT,
  INSTALL_RECEIPT_FIELDS.FAILED_AT,
  INSTALL_RECEIPT_FIELDS.SUPERSEDED_AT,
  INSTALL_RECEIPT_FIELDS.RECEIPT_NOTES,
]);

export const INSTALL_RECEIPT_STATUS = Object.freeze({
  INSTALLED: "installed",
  REMOVED: "removed",
  FAILED: "failed",
  SUPERSEDED: "superseded",
});

export const INSTALL_RECEIPT_STATUS_LIST = Object.freeze([
  INSTALL_RECEIPT_STATUS.INSTALLED,
  INSTALL_RECEIPT_STATUS.REMOVED,
  INSTALL_RECEIPT_STATUS.FAILED,
  INSTALL_RECEIPT_STATUS.SUPERSEDED,
]);

export const INSTALL_RECEIPT_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_LIBRARY_ITEM: true,
  REQUIRES_ENTITLEMENT: true,
  REQUIRES_MARKETPLACE_LISTING: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_VALID_RECEIPT_STATUS: true,
  INSTALLED_RECEIPTS_REQUIRE_INSTALLED_AT: true,
  REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_OWNER_ENTITLEMENT_LINKAGE: true,
  REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE: true,
  REQUIRES_PROJECT_ENTITLEMENT_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_ENTITLEMENT_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_LISTING_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_RELEASE_LINKAGE: true,
  REQUIRES_LIBRARY_ITEM_PUBLISH_LINKAGE: true,
  REQUIRES_ENTITLEMENT_LISTING_LINKAGE: true,
  REQUIRES_ENTITLEMENT_RELEASE_LINKAGE: true,
  REQUIRES_ENTITLEMENT_PUBLISH_LINKAGE: true,
  REQUIRES_LISTING_PROJECT_LINKAGE: true,
  REQUIRES_LISTING_RELEASE_LINKAGE: true,
  REQUIRES_LISTING_PUBLISH_LINKAGE: true,
  REQUIRES_RELEASE_PUBLISH_LINKAGE: true,
  NO_PAYMENT_STATE: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_FILE_BYTES: true,
  NO_CDN_DETAILS: true,
  NO_INSTALLER_IMPLEMENTATION_DETAILS: true,
});

export const INSTALL_RECEIPT_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "arrayBuffer",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "base64",
  "binary",
  "blob",
  "buffer",
  "bytes",
  "cdnKey",
  "cdnProvider",
  "cdnUrl",
  "checkoutSession",
  "content",
  "credentials",
  "dirty",
  "executablePath",
  "fileBytes",
  "fileData",
  "identityProvider",
  "installLog",
  "installPath",
  "installPlan",
  "installSession",
  "installState",
  "installSteps",
  "installToken",
  "installationId",
  "installedFiles",
  "installerImplementation",
  "installerState",
  "invoice",
  "launcherInstallState",
  "localInstallPath",
  "localStorage",
  "manifestInstallState",
  "packageManager",
  "paymentIntent",
  "paymentMethod",
  "paymentProvider",
  "paymentState",
  "paymentStatus",
  "payload",
  "payloadJson",
  "receipt",
  "recoveryAvailable",
  "registryKey",
  "session",
  "sessionStorage",
  "signedUrl",
  "sourceToolStates",
  "stripeSession",
  "token",
  "toolState",
  "toolStateId",
  "toolStates",
  "transactionId",
  "workspace",
  "workspaceState",
]);

export const INSTALL_RECEIPT_CONTRACT_ERRORS = Object.freeze({
  INSTALL_RECEIPT_ID_REQUIRED: "INSTALL_RECEIPT_ID_REQUIRED",
  OWNER_REQUIRED: "INSTALL_RECEIPT_OWNER_REQUIRED",
  PROJECT_REQUIRED: "INSTALL_RECEIPT_PROJECT_REQUIRED",
  LIBRARY_ITEM_REQUIRED: "INSTALL_RECEIPT_LIBRARY_ITEM_REQUIRED",
  LIBRARY_ITEM_INVALID: "INSTALL_RECEIPT_LIBRARY_ITEM_INVALID",
  ENTITLEMENT_REQUIRED: "INSTALL_RECEIPT_ENTITLEMENT_REQUIRED",
  ENTITLEMENT_INVALID: "INSTALL_RECEIPT_ENTITLEMENT_INVALID",
  MARKETPLACE_LISTING_REQUIRED: "INSTALL_RECEIPT_MARKETPLACE_LISTING_REQUIRED",
  MARKETPLACE_LISTING_INVALID: "INSTALL_RECEIPT_MARKETPLACE_LISTING_INVALID",
  SOURCE_RELEASE_REQUIRED: "INSTALL_RECEIPT_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "INSTALL_RECEIPT_SOURCE_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "INSTALL_RECEIPT_SOURCE_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "INSTALL_RECEIPT_SOURCE_PUBLISH_INVALID",
  OWNER_LIBRARY_ITEM_MISMATCH: "INSTALL_RECEIPT_OWNER_LIBRARY_ITEM_MISMATCH",
  OWNER_ENTITLEMENT_MISMATCH: "INSTALL_RECEIPT_OWNER_ENTITLEMENT_MISMATCH",
  PROJECT_LIBRARY_ITEM_MISMATCH: "INSTALL_RECEIPT_PROJECT_LIBRARY_ITEM_MISMATCH",
  PROJECT_ENTITLEMENT_MISMATCH: "INSTALL_RECEIPT_PROJECT_ENTITLEMENT_MISMATCH",
  LIBRARY_ITEM_ENTITLEMENT_MISMATCH: "INSTALL_RECEIPT_LIBRARY_ITEM_ENTITLEMENT_MISMATCH",
  LIBRARY_ITEM_LISTING_MISMATCH: "INSTALL_RECEIPT_LIBRARY_ITEM_LISTING_MISMATCH",
  LIBRARY_ITEM_RELEASE_MISMATCH: "INSTALL_RECEIPT_LIBRARY_ITEM_RELEASE_MISMATCH",
  LIBRARY_ITEM_PUBLISH_MISMATCH: "INSTALL_RECEIPT_LIBRARY_ITEM_PUBLISH_MISMATCH",
  ENTITLEMENT_LISTING_MISMATCH: "INSTALL_RECEIPT_ENTITLEMENT_LISTING_MISMATCH",
  ENTITLEMENT_RELEASE_MISMATCH: "INSTALL_RECEIPT_ENTITLEMENT_RELEASE_MISMATCH",
  ENTITLEMENT_PUBLISH_MISMATCH: "INSTALL_RECEIPT_ENTITLEMENT_PUBLISH_MISMATCH",
  LISTING_PROJECT_MISMATCH: "INSTALL_RECEIPT_LISTING_PROJECT_MISMATCH",
  LISTING_RELEASE_MISMATCH: "INSTALL_RECEIPT_LISTING_RELEASE_MISMATCH",
  LISTING_PUBLISH_MISMATCH: "INSTALL_RECEIPT_LISTING_PUBLISH_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "INSTALL_RECEIPT_RELEASE_PUBLISH_MISMATCH",
  RECEIPT_STATUS_REQUIRED: "INSTALL_RECEIPT_STATUS_REQUIRED",
  RECEIPT_STATUS_INVALID: "INSTALL_RECEIPT_STATUS_INVALID",
  INSTALLED_AT_REQUIRED: "INSTALL_RECEIPT_INSTALLED_AT_REQUIRED",
  INSTALLED_AT_INVALID: "INSTALL_RECEIPT_INSTALLED_AT_INVALID",
  REMOVED_AT_INVALID: "INSTALL_RECEIPT_REMOVED_AT_INVALID",
  FAILED_AT_INVALID: "INSTALL_RECEIPT_FAILED_AT_INVALID",
  SUPERSEDED_AT_INVALID: "INSTALL_RECEIPT_SUPERSEDED_AT_INVALID",
  RECEIPT_NOTES_INVALID: "INSTALL_RECEIPT_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "INSTALL_RECEIPT_FIELD_NOT_ALLOWED",
});

export function isInstallReceiptStatus(value) {
  return INSTALL_RECEIPT_STATUS_LIST.includes(value);
}

export function isInstallReceiptLibraryItem(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.libraryItemId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.entitlementId)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.libraryStatus === undefined || Object.values(LIBRARY_ITEM_STATUS).includes(value.libraryStatus));
}

export function isInstallReceiptEntitlement(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.entitlementId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.entitlementType === undefined || Object.values(ENTITLEMENT_TYPES).includes(value.entitlementType));
}

export function isInstallReceiptMarketplaceListing(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.status === undefined || value.status === MARKETPLACE_LISTING_STATUS.LISTED || value.status === MARKETPLACE_LISTING_STATUS.RETIRED);
}

export function isInstallReceiptSourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isInstallReceiptSourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function validateInstallReceiptContract(installReceipt) {
  const errors = [];

  collectForbiddenFieldErrors(installReceipt, errors);

  if (!hasNonEmptyString(installReceipt?.installReceiptId)) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.INSTALL_RECEIPT_ID_REQUIRED,
      "Install Receipt records require installReceiptId.",
      INSTALL_RECEIPT_FIELDS.INSTALL_RECEIPT_ID
    ));
  }

  if (!hasNonEmptyString(installReceipt?.ownerId)) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Install Receipt records require ownerId.",
      INSTALL_RECEIPT_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(installReceipt?.projectId)) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Install Receipt records require projectId.",
      INSTALL_RECEIPT_FIELDS.PROJECT
    ));
  }

  if (installReceipt?.libraryItem === undefined || installReceipt?.libraryItem === null) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED,
      "Install Receipt records require libraryItem.",
      INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM
    ));
  } else {
    collectForbiddenFieldErrors(installReceipt.libraryItem, errors, INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM);

    if (!isInstallReceiptLibraryItem(installReceipt.libraryItem)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_INVALID,
        "Install Receipt libraryItem must reference a Library Item.",
        INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM
      ));
    }
  }

  if (installReceipt?.entitlement === undefined || installReceipt?.entitlement === null) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED,
      "Install Receipt records require entitlement.",
      INSTALL_RECEIPT_FIELDS.ENTITLEMENT
    ));
  } else {
    collectForbiddenFieldErrors(installReceipt.entitlement, errors, INSTALL_RECEIPT_FIELDS.ENTITLEMENT);

    if (!isInstallReceiptEntitlement(installReceipt.entitlement)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.ENTITLEMENT_INVALID,
        "Install Receipt entitlement must reference an Entitlement.",
        INSTALL_RECEIPT_FIELDS.ENTITLEMENT
      ));
    }
  }

  if (installReceipt?.marketplaceListing === undefined || installReceipt?.marketplaceListing === null) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED,
      "Install Receipt records require marketplaceListing.",
      INSTALL_RECEIPT_FIELDS.MARKETPLACE_LISTING
    ));
  } else {
    collectForbiddenFieldErrors(installReceipt.marketplaceListing, errors, INSTALL_RECEIPT_FIELDS.MARKETPLACE_LISTING);

    if (!isInstallReceiptMarketplaceListing(installReceipt.marketplaceListing)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.MARKETPLACE_LISTING_INVALID,
        "Install Receipt marketplaceListing must reference a listed or retired Marketplace Listing.",
        INSTALL_RECEIPT_FIELDS.MARKETPLACE_LISTING
      ));
    }
  }

  if (installReceipt?.sourceRelease === undefined || installReceipt?.sourceRelease === null) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED,
      "Install Receipt records require sourceRelease.",
      INSTALL_RECEIPT_FIELDS.SOURCE_RELEASE
    ));
  } else {
    collectForbiddenFieldErrors(installReceipt.sourceRelease, errors, INSTALL_RECEIPT_FIELDS.SOURCE_RELEASE);

    if (!isInstallReceiptSourceRelease(installReceipt.sourceRelease)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID,
        "Install Receipt sourceRelease must reference a published or retired Release.",
        INSTALL_RECEIPT_FIELDS.SOURCE_RELEASE
      ));
    }
  }

  if (installReceipt?.sourcePublish === undefined || installReceipt?.sourcePublish === null) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED,
      "Install Receipt records require sourcePublish.",
      INSTALL_RECEIPT_FIELDS.SOURCE_PUBLISH
    ));
  } else {
    collectForbiddenFieldErrors(installReceipt.sourcePublish, errors, INSTALL_RECEIPT_FIELDS.SOURCE_PUBLISH);

    if (!isInstallReceiptSourcePublish(installReceipt.sourcePublish)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID,
        "Install Receipt sourcePublish must reference a published or retired Publish record.",
        INSTALL_RECEIPT_FIELDS.SOURCE_PUBLISH
      ));
    }
  }

  collectLinkageErrors(installReceipt, errors);

  if (!hasNonEmptyString(installReceipt?.receiptStatus)) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.RECEIPT_STATUS_REQUIRED,
      "Install Receipt records require receiptStatus.",
      INSTALL_RECEIPT_FIELDS.RECEIPT_STATUS
    ));
  } else if (!isInstallReceiptStatus(installReceipt.receiptStatus)) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.RECEIPT_STATUS_INVALID,
      "Install Receipt status must be installed, removed, failed, or superseded.",
      INSTALL_RECEIPT_FIELDS.RECEIPT_STATUS
    ));
  }

  if (installReceipt?.receiptStatus === INSTALL_RECEIPT_STATUS.INSTALLED) {
    if (!hasNonEmptyString(installReceipt?.installedAt)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.INSTALLED_AT_REQUIRED,
        "Installed Install Receipt records require installedAt.",
        INSTALL_RECEIPT_FIELDS.INSTALLED_AT
      ));
    } else if (!isTimestamp(installReceipt.installedAt)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.INSTALLED_AT_INVALID,
        "Install Receipt installedAt must be a valid timestamp.",
        INSTALL_RECEIPT_FIELDS.INSTALLED_AT
      ));
    }
  } else if (installReceipt?.installedAt !== undefined && installReceipt.installedAt !== null && !isTimestamp(installReceipt.installedAt)) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.INSTALLED_AT_INVALID,
      "Install Receipt installedAt must be a valid timestamp when provided.",
      INSTALL_RECEIPT_FIELDS.INSTALLED_AT
    ));
  }

  validateOptionalTimestamp(installReceipt, errors, "removedAt", INSTALL_RECEIPT_CONTRACT_ERRORS.REMOVED_AT_INVALID, INSTALL_RECEIPT_FIELDS.REMOVED_AT);
  validateOptionalTimestamp(installReceipt, errors, "failedAt", INSTALL_RECEIPT_CONTRACT_ERRORS.FAILED_AT_INVALID, INSTALL_RECEIPT_FIELDS.FAILED_AT);
  validateOptionalTimestamp(installReceipt, errors, "supersededAt", INSTALL_RECEIPT_CONTRACT_ERRORS.SUPERSEDED_AT_INVALID, INSTALL_RECEIPT_FIELDS.SUPERSEDED_AT);

  if (installReceipt?.receiptNotes !== undefined && installReceipt.receiptNotes !== null && typeof installReceipt.receiptNotes !== "string") {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.RECEIPT_NOTES_INVALID,
      "Install Receipt receiptNotes must be a string when provided.",
      INSTALL_RECEIPT_FIELDS.RECEIPT_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isInstallReceiptInstalled(installReceipt) {
  return installReceipt?.receiptStatus === INSTALL_RECEIPT_STATUS.INSTALLED
    && isTimestamp(installReceipt.installedAt);
}

export function isInstallReceiptRemoved(installReceipt) {
  return installReceipt?.receiptStatus === INSTALL_RECEIPT_STATUS.REMOVED;
}

export function isInstallReceiptFailed(installReceipt) {
  return installReceipt?.receiptStatus === INSTALL_RECEIPT_STATUS.FAILED;
}

export function isInstallReceiptSuperseded(installReceipt) {
  return installReceipt?.receiptStatus === INSTALL_RECEIPT_STATUS.SUPERSEDED;
}

export function isInstallReceiptVisibleToActor({
  actorId,
  installReceipt,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === installReceipt?.ownerId;
}

export function canActorAccessInstallReceipt({
  actorId,
  role,
  permission,
  installReceipt,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === installReceipt?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: installReceipt.ownerId,
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
        ownerId: installReceipt?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function collectLinkageErrors(installReceipt, errors) {
  compareReference(installReceipt?.libraryItem, installReceipt, "ownerId", INSTALL_RECEIPT_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH, "Install Receipt libraryItem.ownerId must match ownerId.", INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(installReceipt?.entitlement, installReceipt, "ownerId", INSTALL_RECEIPT_CONTRACT_ERRORS.OWNER_ENTITLEMENT_MISMATCH, "Install Receipt entitlement.ownerId must match ownerId.", INSTALL_RECEIPT_FIELDS.ENTITLEMENT, errors);
  compareReference(installReceipt?.libraryItem, installReceipt, "projectId", INSTALL_RECEIPT_CONTRACT_ERRORS.PROJECT_LIBRARY_ITEM_MISMATCH, "Install Receipt libraryItem.projectId must match projectId.", INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(installReceipt?.entitlement, installReceipt, "projectId", INSTALL_RECEIPT_CONTRACT_ERRORS.PROJECT_ENTITLEMENT_MISMATCH, "Install Receipt entitlement.projectId must match projectId.", INSTALL_RECEIPT_FIELDS.ENTITLEMENT, errors);
  compareReference(installReceipt?.libraryItem, installReceipt?.entitlement, "entitlementId", INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_ENTITLEMENT_MISMATCH, "Install Receipt libraryItem.entitlementId must match entitlement.entitlementId.", INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(installReceipt?.libraryItem, installReceipt?.marketplaceListing, "listingId", INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_LISTING_MISMATCH, "Install Receipt libraryItem.listingId must match marketplaceListing.listingId.", INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(installReceipt?.libraryItem, installReceipt?.sourceRelease, "releaseId", INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_RELEASE_MISMATCH, "Install Receipt libraryItem.releaseId must match sourceRelease.releaseId.", INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(installReceipt?.libraryItem, installReceipt?.sourcePublish, "publishId", INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_PUBLISH_MISMATCH, "Install Receipt libraryItem.publishId must match sourcePublish.publishId.", INSTALL_RECEIPT_FIELDS.LIBRARY_ITEM, errors);
  compareReference(installReceipt?.entitlement, installReceipt?.marketplaceListing, "listingId", INSTALL_RECEIPT_CONTRACT_ERRORS.ENTITLEMENT_LISTING_MISMATCH, "Install Receipt entitlement.listingId must match marketplaceListing.listingId.", INSTALL_RECEIPT_FIELDS.ENTITLEMENT, errors);
  compareReference(installReceipt?.entitlement, installReceipt?.sourceRelease, "releaseId", INSTALL_RECEIPT_CONTRACT_ERRORS.ENTITLEMENT_RELEASE_MISMATCH, "Install Receipt entitlement.releaseId must match sourceRelease.releaseId.", INSTALL_RECEIPT_FIELDS.ENTITLEMENT, errors);
  compareReference(installReceipt?.entitlement, installReceipt?.sourcePublish, "publishId", INSTALL_RECEIPT_CONTRACT_ERRORS.ENTITLEMENT_PUBLISH_MISMATCH, "Install Receipt entitlement.publishId must match sourcePublish.publishId.", INSTALL_RECEIPT_FIELDS.ENTITLEMENT, errors);
  compareReference(installReceipt?.marketplaceListing, installReceipt, "projectId", INSTALL_RECEIPT_CONTRACT_ERRORS.LISTING_PROJECT_MISMATCH, "Install Receipt marketplaceListing.projectId must match projectId.", INSTALL_RECEIPT_FIELDS.MARKETPLACE_LISTING, errors);
  compareReference(installReceipt?.marketplaceListing, installReceipt?.sourceRelease, "releaseId", INSTALL_RECEIPT_CONTRACT_ERRORS.LISTING_RELEASE_MISMATCH, "Install Receipt marketplaceListing.releaseId must match sourceRelease.releaseId.", INSTALL_RECEIPT_FIELDS.MARKETPLACE_LISTING, errors);
  compareReference(installReceipt?.marketplaceListing, installReceipt?.sourcePublish, "publishId", INSTALL_RECEIPT_CONTRACT_ERRORS.LISTING_PUBLISH_MISMATCH, "Install Receipt marketplaceListing.publishId must match sourcePublish.publishId.", INSTALL_RECEIPT_FIELDS.MARKETPLACE_LISTING, errors);

  if (isReferenceObject(installReceipt?.sourceRelease)
    && isReferenceObject(installReceipt?.sourcePublish)
    && hasNonEmptyString(installReceipt.sourceRelease.releaseId)
    && hasNonEmptyString(installReceipt.sourcePublish.releaseId)
    && installReceipt.sourceRelease.releaseId !== installReceipt.sourcePublish.releaseId) {
    errors.push(createContractError(
      INSTALL_RECEIPT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH,
      "Install Receipt sourcePublish.releaseId must match sourceRelease.releaseId.",
      INSTALL_RECEIPT_FIELDS.SOURCE_PUBLISH
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

function validateOptionalTimestamp(installReceipt, errors, timestampField, errorCode, path) {
  if (installReceipt?.[timestampField] !== undefined && installReceipt[timestampField] !== null && !isTimestamp(installReceipt[timestampField])) {
    errors.push(createContractError(
      errorCode,
      `Install Receipt ${timestampField} must be a valid timestamp when provided.`,
      path
    ));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of INSTALL_RECEIPT_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Install Receipt records must not carry payment, auth session, runtime, toolState, file bytes, CDN, or installer implementation details.",
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
