/*
Toolbox Aid
David Quesenberry
06/02/2026
reviewRatingContract.js
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
  MARKETPLACE_LISTING_STATUS,
} from "./marketplaceListingContract.js";

export const REVIEW_RATING_CONTRACT_ID = "gamefoundrystudio.review.rating.contract";
export const REVIEW_RATING_CONTRACT_VERSION = "1.0.0";

export const REVIEW_RATING_FIELDS = Object.freeze({
  REVIEW_RATING_ID: "reviewRatingId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  MARKETPLACE_LISTING: "marketplaceListing",
  RATING: "rating",
  REVIEW_TEXT: "reviewText",
  VISIBILITY: "visibility",
  REVIEW_STATUS: "reviewStatus",
  CREATED_AT: "createdAt",
  REVIEW_NOTES: "reviewNotes",
});

export const REVIEW_RATING_FIELD_LIST = Object.freeze([
  REVIEW_RATING_FIELDS.REVIEW_RATING_ID,
  REVIEW_RATING_FIELDS.OWNER,
  REVIEW_RATING_FIELDS.PROJECT,
  REVIEW_RATING_FIELDS.MARKETPLACE_LISTING,
  REVIEW_RATING_FIELDS.RATING,
  REVIEW_RATING_FIELDS.REVIEW_TEXT,
  REVIEW_RATING_FIELDS.VISIBILITY,
  REVIEW_RATING_FIELDS.REVIEW_STATUS,
  REVIEW_RATING_FIELDS.CREATED_AT,
  REVIEW_RATING_FIELDS.REVIEW_NOTES,
]);

export const REVIEW_RATING_STATUS = Object.freeze({
  ACTIVE: "active",
  HIDDEN: "hidden",
  REMOVED: "removed",
});

export const REVIEW_RATING_STATUS_LIST = Object.freeze([
  REVIEW_RATING_STATUS.ACTIVE,
  REVIEW_RATING_STATUS.HIDDEN,
  REVIEW_RATING_STATUS.REMOVED,
]);

export const REVIEW_RATING_VISIBILITY_LIST = Object.freeze([
  IDENTITY_VISIBILITY_STATES.PRIVATE,
  IDENTITY_VISIBILITY_STATES.PUBLIC,
  IDENTITY_VISIBILITY_STATES.MARKETPLACE,
]);

export const REVIEW_RATING_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_MARKETPLACE_LISTING: true,
  REQUIRES_RATING: true,
  REQUIRES_VISIBILITY: true,
  REQUIRES_VALID_STATUS: true,
  REQUIRES_CREATED_AT: true,
  REQUIRES_LISTING_PROJECT_LINKAGE: true,
  NO_PAYMENT_STATE: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_MODERATION_DECISION_STATE: true,
});

export const REVIEW_RATING_FORBIDDEN_FIELDS = Object.freeze([
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
  "moderationDecision",
  "moderationState",
  "moderatorId",
  "paymentIntent",
  "paymentProvider",
  "paymentState",
  "payload",
  "payloadJson",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "toolState",
  "toolStateId",
  "toolStates",
  "workspace",
  "workspaceState",
]);

export const REVIEW_RATING_CONTRACT_ERRORS = Object.freeze({
  REVIEW_RATING_ID_REQUIRED: "REVIEW_RATING_ID_REQUIRED",
  OWNER_REQUIRED: "REVIEW_RATING_OWNER_REQUIRED",
  PROJECT_REQUIRED: "REVIEW_RATING_PROJECT_REQUIRED",
  MARKETPLACE_LISTING_REQUIRED: "REVIEW_RATING_MARKETPLACE_LISTING_REQUIRED",
  MARKETPLACE_LISTING_INVALID: "REVIEW_RATING_MARKETPLACE_LISTING_INVALID",
  LISTING_PROJECT_MISMATCH: "REVIEW_RATING_LISTING_PROJECT_MISMATCH",
  RATING_REQUIRED: "REVIEW_RATING_RATING_REQUIRED",
  RATING_INVALID: "REVIEW_RATING_RATING_INVALID",
  REVIEW_TEXT_INVALID: "REVIEW_RATING_TEXT_INVALID",
  VISIBILITY_REQUIRED: "REVIEW_RATING_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "REVIEW_RATING_VISIBILITY_INVALID",
  REVIEW_STATUS_REQUIRED: "REVIEW_RATING_STATUS_REQUIRED",
  REVIEW_STATUS_INVALID: "REVIEW_RATING_STATUS_INVALID",
  CREATED_AT_REQUIRED: "REVIEW_RATING_CREATED_AT_REQUIRED",
  CREATED_AT_INVALID: "REVIEW_RATING_CREATED_AT_INVALID",
  REVIEW_NOTES_INVALID: "REVIEW_RATING_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "REVIEW_RATING_FIELD_NOT_ALLOWED",
});

export function isReviewRatingStatus(value) {
  return REVIEW_RATING_STATUS_LIST.includes(value);
}

export function isReviewRatingVisibility(value) {
  return REVIEW_RATING_VISIBILITY_LIST.includes(value);
}

export function isReviewRatingValue(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function isReviewRatingMarketplaceListing(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.status === undefined || value.status === MARKETPLACE_LISTING_STATUS.LISTED || value.status === MARKETPLACE_LISTING_STATUS.RETIRED);
}

export function validateReviewRatingContract(reviewRating) {
  const errors = [];

  collectForbiddenFieldErrors(reviewRating, errors);

  if (!hasNonEmptyString(reviewRating?.reviewRatingId)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.REVIEW_RATING_ID_REQUIRED, "Review Rating records require reviewRatingId.", REVIEW_RATING_FIELDS.REVIEW_RATING_ID));
  }

  if (!hasNonEmptyString(reviewRating?.ownerId)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.OWNER_REQUIRED, "Review Rating records require ownerId.", REVIEW_RATING_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(reviewRating?.projectId)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.PROJECT_REQUIRED, "Review Rating records require projectId.", REVIEW_RATING_FIELDS.PROJECT));
  }

  if (reviewRating?.marketplaceListing === undefined || reviewRating?.marketplaceListing === null) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED, "Review Rating records require marketplaceListing.", REVIEW_RATING_FIELDS.MARKETPLACE_LISTING));
  } else {
    collectForbiddenFieldErrors(reviewRating.marketplaceListing, errors, REVIEW_RATING_FIELDS.MARKETPLACE_LISTING);

    if (!isReviewRatingMarketplaceListing(reviewRating.marketplaceListing)) {
      errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.MARKETPLACE_LISTING_INVALID, "Review Rating marketplaceListing must reference a listed or retired Marketplace Listing.", REVIEW_RATING_FIELDS.MARKETPLACE_LISTING));
    }
  }

  if (isReferenceObject(reviewRating?.marketplaceListing)
    && hasNonEmptyString(reviewRating?.projectId)
    && hasNonEmptyString(reviewRating.marketplaceListing.projectId)
    && reviewRating.marketplaceListing.projectId !== reviewRating.projectId) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.LISTING_PROJECT_MISMATCH, "Review Rating marketplaceListing.projectId must match projectId.", REVIEW_RATING_FIELDS.MARKETPLACE_LISTING));
  }

  if (reviewRating?.rating === undefined || reviewRating?.rating === null) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.RATING_REQUIRED, "Review Rating records require rating.", REVIEW_RATING_FIELDS.RATING));
  } else if (!isReviewRatingValue(reviewRating.rating)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.RATING_INVALID, "Review Rating rating must be an integer from 1 to 5.", REVIEW_RATING_FIELDS.RATING));
  }

  if (reviewRating?.reviewText !== undefined && reviewRating.reviewText !== null && typeof reviewRating.reviewText !== "string") {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.REVIEW_TEXT_INVALID, "Review Rating reviewText must be a string when provided.", REVIEW_RATING_FIELDS.REVIEW_TEXT));
  }

  if (!hasNonEmptyString(reviewRating?.visibility)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.VISIBILITY_REQUIRED, "Review Rating records require visibility.", REVIEW_RATING_FIELDS.VISIBILITY));
  } else if (!isReviewRatingVisibility(reviewRating.visibility)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.VISIBILITY_INVALID, "Review Rating visibility must be private, public, or marketplace.", REVIEW_RATING_FIELDS.VISIBILITY));
  }

  if (!hasNonEmptyString(reviewRating?.reviewStatus)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.REVIEW_STATUS_REQUIRED, "Review Rating records require reviewStatus.", REVIEW_RATING_FIELDS.REVIEW_STATUS));
  } else if (!isReviewRatingStatus(reviewRating.reviewStatus)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.REVIEW_STATUS_INVALID, "Review Rating status must be active, hidden, or removed.", REVIEW_RATING_FIELDS.REVIEW_STATUS));
  }

  if (!hasNonEmptyString(reviewRating?.createdAt)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.CREATED_AT_REQUIRED, "Review Rating records require createdAt.", REVIEW_RATING_FIELDS.CREATED_AT));
  } else if (!isTimestamp(reviewRating.createdAt)) {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.CREATED_AT_INVALID, "Review Rating createdAt must be a valid timestamp.", REVIEW_RATING_FIELDS.CREATED_AT));
  }

  if (reviewRating?.reviewNotes !== undefined && reviewRating.reviewNotes !== null && typeof reviewRating.reviewNotes !== "string") {
    errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.REVIEW_NOTES_INVALID, "Review Rating reviewNotes must be a string when provided.", REVIEW_RATING_FIELDS.REVIEW_NOTES));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isReviewRatingVisibleToActor({
  actorId,
  reviewRating,
} = {}) {
  if (!hasNonEmptyString(actorId) || !reviewRating) {
    return false;
  }

  return actorId === reviewRating.ownerId
    || reviewRating.visibility === IDENTITY_VISIBILITY_STATES.PUBLIC
    || reviewRating.visibility === IDENTITY_VISIBILITY_STATES.MARKETPLACE;
}

export function canActorAccessReviewRating({
  actorId,
  role,
  permission,
  reviewRating,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission) || !isReviewRatingVisibleToActor({ actorId, reviewRating })) {
    return false;
  }

  if (actorId === reviewRating?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: reviewRating.ownerId,
        visibility: reviewRating.visibility,
      },
    });
  }

  if (permission === IDENTITY_PERMISSIONS.ADMINISTER || permission === IDENTITY_PERMISSIONS.MODERATE) {
    return canActorPerformPermission({
      actorId,
      role,
      permission,
      scope: permission === IDENTITY_PERMISSIONS.MODERATE
        ? IDENTITY_PERMISSION_SCOPES.MARKETPLACE
        : IDENTITY_PERMISSION_SCOPES.PLATFORM,
      grantedScopes,
      object: {
        ownerId: reviewRating?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return permission === IDENTITY_PERMISSIONS.VIEW;
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of REVIEW_RATING_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(REVIEW_RATING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Review Rating records must not carry payment, auth session, runtime, toolState, or moderation decision state.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
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
