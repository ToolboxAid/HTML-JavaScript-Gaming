/*
Toolbox Aid
David Quesenberry
06/02/2026
marketplaceTransactionBoundaryContract.js
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
  isEntitlementType,
} from "./entitlementContract.js";
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

export const MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ID = "gamefoundrystudio.marketplace.transaction.boundary.contract";
export const MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_VERSION = "1.0.0";

export const MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS = Object.freeze({
  BOUNDARY_ID: "marketplaceTransactionBoundaryId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  MARKETPLACE_LISTING: "marketplaceListing",
  ENTITLEMENT: "entitlement",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  BOUNDARY_TYPE: "boundaryType",
  BOUNDARY_STATUS: "boundaryStatus",
  CREATED_AT: "createdAt",
  BOUNDARY_NOTES: "boundaryNotes",
});

export const MARKETPLACE_TRANSACTION_BOUNDARY_FIELD_LIST = Object.freeze([
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_ID,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.OWNER,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.PROJECT,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.MARKETPLACE_LISTING,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.ENTITLEMENT,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_RELEASE,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_PUBLISH,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_TYPE,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_STATUS,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.CREATED_AT,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_NOTES,
]);

export const MARKETPLACE_TRANSACTION_BOUNDARY_TYPES = Object.freeze({
  PURCHASE_INTENT: "purchaseIntent",
  LICENSE_GRANT: "licenseGrant",
  ENTITLEMENT_CHANGE: "entitlementChange",
  REFUND_BOUNDARY: "refundBoundary",
});

export const MARKETPLACE_TRANSACTION_BOUNDARY_TYPE_LIST = Object.freeze([
  MARKETPLACE_TRANSACTION_BOUNDARY_TYPES.PURCHASE_INTENT,
  MARKETPLACE_TRANSACTION_BOUNDARY_TYPES.LICENSE_GRANT,
  MARKETPLACE_TRANSACTION_BOUNDARY_TYPES.ENTITLEMENT_CHANGE,
  MARKETPLACE_TRANSACTION_BOUNDARY_TYPES.REFUND_BOUNDARY,
]);

export const MARKETPLACE_TRANSACTION_BOUNDARY_STATUS = Object.freeze({
  OPENED: "opened",
  RECORDED: "recorded",
  VOIDED: "voided",
  CLOSED: "closed",
});

export const MARKETPLACE_TRANSACTION_BOUNDARY_STATUS_LIST = Object.freeze([
  MARKETPLACE_TRANSACTION_BOUNDARY_STATUS.OPENED,
  MARKETPLACE_TRANSACTION_BOUNDARY_STATUS.RECORDED,
  MARKETPLACE_TRANSACTION_BOUNDARY_STATUS.VOIDED,
  MARKETPLACE_TRANSACTION_BOUNDARY_STATUS.CLOSED,
]);

export const MARKETPLACE_TRANSACTION_BOUNDARY_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_MARKETPLACE_LISTING: true,
  REQUIRES_ENTITLEMENT: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_OWNER_ENTITLEMENT_LINKAGE: true,
  REQUIRES_PROJECT_RELEASE_PUBLISH_LINKAGE: true,
  REQUIRES_VALID_BOUNDARY_TYPE: true,
  REQUIRES_VALID_BOUNDARY_STATUS: true,
  NO_PAYMENT_IMPLEMENTATION: true,
  NO_PROVIDER_IMPLEMENTATION: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
});

export const MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS = Object.freeze([
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
  "invoice",
  "paymentIntent",
  "paymentMethod",
  "paymentProvider",
  "paymentState",
  "paymentStatus",
  "payload",
  "payloadJson",
  "processorState",
  "providerResponse",
  "providerTransactionId",
  "receipt",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "stripeSession",
  "toolState",
  "toolStateId",
  "toolStates",
  "transactionId",
  "workspace",
  "workspaceState",
]);

export const MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS = Object.freeze({
  BOUNDARY_ID_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_ID_REQUIRED",
  OWNER_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_OWNER_REQUIRED",
  PROJECT_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_PROJECT_REQUIRED",
  MARKETPLACE_LISTING_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_LISTING_REQUIRED",
  MARKETPLACE_LISTING_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_LISTING_INVALID",
  ENTITLEMENT_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_ENTITLEMENT_REQUIRED",
  ENTITLEMENT_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_ENTITLEMENT_INVALID",
  SOURCE_RELEASE_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_PUBLISH_INVALID",
  OWNER_ENTITLEMENT_MISMATCH: "MARKETPLACE_TRANSACTION_BOUNDARY_OWNER_ENTITLEMENT_MISMATCH",
  PROJECT_LINKAGE_MISMATCH: "MARKETPLACE_TRANSACTION_BOUNDARY_PROJECT_LINKAGE_MISMATCH",
  RELEASE_LINKAGE_MISMATCH: "MARKETPLACE_TRANSACTION_BOUNDARY_RELEASE_LINKAGE_MISMATCH",
  PUBLISH_LINKAGE_MISMATCH: "MARKETPLACE_TRANSACTION_BOUNDARY_PUBLISH_LINKAGE_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "MARKETPLACE_TRANSACTION_BOUNDARY_RELEASE_PUBLISH_MISMATCH",
  BOUNDARY_TYPE_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_TYPE_REQUIRED",
  BOUNDARY_TYPE_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_TYPE_INVALID",
  BOUNDARY_STATUS_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_STATUS_REQUIRED",
  BOUNDARY_STATUS_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_STATUS_INVALID",
  CREATED_AT_REQUIRED: "MARKETPLACE_TRANSACTION_BOUNDARY_CREATED_AT_REQUIRED",
  CREATED_AT_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_CREATED_AT_INVALID",
  BOUNDARY_NOTES_INVALID: "MARKETPLACE_TRANSACTION_BOUNDARY_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "MARKETPLACE_TRANSACTION_BOUNDARY_FIELD_NOT_ALLOWED",
});

export function isMarketplaceTransactionBoundaryType(value) {
  return MARKETPLACE_TRANSACTION_BOUNDARY_TYPE_LIST.includes(value);
}

export function isMarketplaceTransactionBoundaryStatus(value) {
  return MARKETPLACE_TRANSACTION_BOUNDARY_STATUS_LIST.includes(value);
}

export function isMarketplaceTransactionBoundaryListing(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.status === undefined || value.status === MARKETPLACE_LISTING_STATUS.LISTED || value.status === MARKETPLACE_LISTING_STATUS.RETIRED);
}

export function isMarketplaceTransactionBoundaryEntitlement(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.entitlementId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && isEntitlementType(value.entitlementType);
}

export function isMarketplaceTransactionBoundarySourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isMarketplaceTransactionBoundarySourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function validateMarketplaceTransactionBoundaryContract(boundary) {
  const errors = [];

  collectForbiddenFieldErrors(boundary, errors);

  if (!hasNonEmptyString(boundary?.marketplaceTransactionBoundaryId)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_ID_REQUIRED, "Marketplace Transaction Boundary records require marketplaceTransactionBoundaryId.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_ID));
  }

  if (!hasNonEmptyString(boundary?.ownerId)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.OWNER_REQUIRED, "Marketplace Transaction Boundary records require ownerId.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(boundary?.projectId)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.PROJECT_REQUIRED, "Marketplace Transaction Boundary records require projectId.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.PROJECT));
  }

  if (boundary?.marketplaceListing === undefined || boundary?.marketplaceListing === null) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED, "Marketplace Transaction Boundary records require marketplaceListing.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.MARKETPLACE_LISTING));
  } else {
    collectForbiddenFieldErrors(boundary.marketplaceListing, errors, MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.MARKETPLACE_LISTING);

    if (!isMarketplaceTransactionBoundaryListing(boundary.marketplaceListing)) {
      errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.MARKETPLACE_LISTING_INVALID, "Marketplace Transaction Boundary marketplaceListing must reference a listed or retired Marketplace Listing.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.MARKETPLACE_LISTING));
    }
  }

  if (boundary?.entitlement === undefined || boundary?.entitlement === null) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED, "Marketplace Transaction Boundary records require entitlement.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.ENTITLEMENT));
  } else {
    collectForbiddenFieldErrors(boundary.entitlement, errors, MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.ENTITLEMENT);

    if (!isMarketplaceTransactionBoundaryEntitlement(boundary.entitlement)) {
      errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.ENTITLEMENT_INVALID, "Marketplace Transaction Boundary entitlement must reference an Entitlement record.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.ENTITLEMENT));
    }
  }

  if (boundary?.sourceRelease === undefined || boundary?.sourceRelease === null) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED, "Marketplace Transaction Boundary records require sourceRelease.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_RELEASE));
  } else {
    collectForbiddenFieldErrors(boundary.sourceRelease, errors, MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_RELEASE);

    if (!isMarketplaceTransactionBoundarySourceRelease(boundary.sourceRelease)) {
      errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID, "Marketplace Transaction Boundary sourceRelease must reference a published or retired Release.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_RELEASE));
    }
  }

  if (boundary?.sourcePublish === undefined || boundary?.sourcePublish === null) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED, "Marketplace Transaction Boundary records require sourcePublish.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_PUBLISH));
  } else {
    collectForbiddenFieldErrors(boundary.sourcePublish, errors, MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_PUBLISH);

    if (!isMarketplaceTransactionBoundarySourcePublish(boundary.sourcePublish)) {
      errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID, "Marketplace Transaction Boundary sourcePublish must reference a published or retired Publish record.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_PUBLISH));
    }
  }

  collectLinkageErrors(boundary, errors);

  if (!hasNonEmptyString(boundary?.boundaryType)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_TYPE_REQUIRED, "Marketplace Transaction Boundary records require boundaryType.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_TYPE));
  } else if (!isMarketplaceTransactionBoundaryType(boundary.boundaryType)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_TYPE_INVALID, "Marketplace Transaction Boundary type must be an allowed boundary type.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_TYPE));
  }

  if (!hasNonEmptyString(boundary?.boundaryStatus)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_STATUS_REQUIRED, "Marketplace Transaction Boundary records require boundaryStatus.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_STATUS));
  } else if (!isMarketplaceTransactionBoundaryStatus(boundary.boundaryStatus)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_STATUS_INVALID, "Marketplace Transaction Boundary status must be opened, recorded, voided, or closed.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_STATUS));
  }

  if (!hasNonEmptyString(boundary?.createdAt)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.CREATED_AT_REQUIRED, "Marketplace Transaction Boundary records require createdAt.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.CREATED_AT));
  } else if (!isTimestamp(boundary.createdAt)) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.CREATED_AT_INVALID, "Marketplace Transaction Boundary createdAt must be a valid timestamp.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.CREATED_AT));
  }

  if (boundary?.boundaryNotes !== undefined && boundary.boundaryNotes !== null && typeof boundary.boundaryNotes !== "string") {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_NOTES_INVALID, "Marketplace Transaction Boundary boundaryNotes must be a string when provided.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.BOUNDARY_NOTES));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isMarketplaceTransactionBoundaryOwner({
  actorId,
  boundary,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === boundary?.ownerId;
}

export function canActorAccessMarketplaceTransactionBoundary({
  actorId,
  role,
  permission,
  boundary,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (isMarketplaceTransactionBoundaryOwner({ actorId, boundary })) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: boundary.ownerId,
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
        ownerId: boundary?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function collectLinkageErrors(boundary, errors) {
  if (isReferenceObject(boundary?.entitlement)
    && hasNonEmptyString(boundary?.ownerId)
    && hasNonEmptyString(boundary.entitlement.ownerId)
    && boundary.entitlement.ownerId !== boundary.ownerId) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.OWNER_ENTITLEMENT_MISMATCH, "Marketplace Transaction Boundary ownerId must match entitlement.ownerId.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.ENTITLEMENT));
  }

  const projectReferences = [
    boundary?.marketplaceListing,
    boundary?.entitlement,
  ];
  for (const reference of projectReferences) {
    if (isReferenceObject(reference)
      && hasNonEmptyString(boundary?.projectId)
      && hasNonEmptyString(reference.projectId)
      && reference.projectId !== boundary.projectId) {
      errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.PROJECT_LINKAGE_MISMATCH, "Marketplace Transaction Boundary project references must match projectId.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.PROJECT));
      break;
    }
  }

  const releaseIds = [
    boundary?.marketplaceListing?.releaseId,
    boundary?.entitlement?.releaseId,
    boundary?.sourceRelease?.releaseId,
  ].filter(hasNonEmptyString);
  if (new Set(releaseIds).size > 1) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.RELEASE_LINKAGE_MISMATCH, "Marketplace Transaction Boundary release references must match.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_RELEASE));
  }

  const publishIds = [
    boundary?.marketplaceListing?.publishId,
    boundary?.entitlement?.publishId,
    boundary?.sourcePublish?.publishId,
  ].filter(hasNonEmptyString);
  if (new Set(publishIds).size > 1) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.PUBLISH_LINKAGE_MISMATCH, "Marketplace Transaction Boundary publish references must match.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_PUBLISH));
  }

  if (isReferenceObject(boundary?.sourceRelease)
    && isReferenceObject(boundary?.sourcePublish)
    && hasNonEmptyString(boundary.sourceRelease.releaseId)
    && hasNonEmptyString(boundary.sourcePublish.releaseId)
    && boundary.sourceRelease.releaseId !== boundary.sourcePublish.releaseId) {
    errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH, "Marketplace Transaction Boundary sourcePublish.releaseId must match sourceRelease.releaseId.", MARKETPLACE_TRANSACTION_BOUNDARY_FIELDS.SOURCE_PUBLISH));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Marketplace Transaction Boundary records must not carry payment, provider, auth session, runtime, or toolState details.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
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
