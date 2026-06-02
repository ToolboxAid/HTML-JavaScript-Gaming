/*
Toolbox Aid
David Quesenberry
06/02/2026
ReviewRatingContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  REVIEW_RATING_CONTRACT_ERRORS,
  REVIEW_RATING_CONTRACT_ID,
  REVIEW_RATING_CONTRACT_VERSION,
  REVIEW_RATING_FIELD_LIST,
  REVIEW_RATING_FORBIDDEN_FIELDS,
  REVIEW_RATING_STATUS_LIST,
  canActorAccessReviewRating,
  isReviewRatingMarketplaceListing,
  isReviewRatingStatus,
  isReviewRatingValue,
  isReviewRatingVisibility,
  isReviewRatingVisibleToActor,
  validateReviewRatingContract,
} from "../../src/shared/contracts/reviewRatingContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/review-ratings/review-rating-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(REVIEW_RATING_CONTRACT_ID, "gamefoundrystudio.review.rating.contract");
  assert.equal(REVIEW_RATING_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(REVIEW_RATING_FIELD_LIST, [
    "reviewRatingId",
    "ownerId",
    "projectId",
    "marketplaceListing",
    "rating",
    "reviewText",
    "visibility",
    "reviewStatus",
    "createdAt",
    "reviewNotes",
  ]);
  assert.deepEqual(REVIEW_RATING_STATUS_LIST, ["active", "hidden", "removed"]);
  assert.equal(REVIEW_RATING_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(REVIEW_RATING_FORBIDDEN_FIELDS.includes("moderationDecision"), true);
  assertUnique(REVIEW_RATING_FORBIDDEN_FIELDS);

  assert.equal(isReviewRatingValue(5), true);
  assert.equal(isReviewRatingValue(6), false);
  assert.equal(isReviewRatingStatus("active"), true);
  assert.equal(isReviewRatingStatus("queued"), false);
  assert.equal(isReviewRatingVisibility("marketplace"), true);
  assert.equal(isReviewRatingVisibility("team"), false);

  for (const scenario of scenarios.validReviewRatings) {
    const reviewRating = buildScenario(scenarios.baseReviewRating, scenario);
    const validation = validateReviewRatingContract(reviewRating);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidReviewRatings) {
    const reviewRating = buildScenario(scenarios.baseReviewRating, scenario);
    const validation = validateReviewRatingContract(reviewRating);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", REVIEW_RATING_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing marketplace listing", REVIEW_RATING_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED);
  assertErrorForScenario(scenarios, "listing project mismatch", REVIEW_RATING_CONTRACT_ERRORS.LISTING_PROJECT_MISMATCH);
  assertErrorForScenario(scenarios, "invalid rating", REVIEW_RATING_CONTRACT_ERRORS.RATING_INVALID);
  assertErrorForScenario(scenarios, "invalid visibility", REVIEW_RATING_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "invalid status", REVIEW_RATING_CONTRACT_ERRORS.REVIEW_STATUS_INVALID);
  assertErrorForScenario(scenarios, "runtime state leakage", REVIEW_RATING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "moderation decision leakage", REVIEW_RATING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const reviewRating = buildScenario(scenarios.baseReviewRating, scenarios.validReviewRatings[0]);
  assert.equal(isReviewRatingMarketplaceListing(reviewRating.marketplaceListing), true);
  assert.equal(isReviewRatingVisibleToActor({ actorId: "public.viewer", reviewRating }), true);
  assert.equal(canActorAccessReviewRating({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    reviewRating,
  }), true);
  assert.equal(canActorAccessReviewRating({
    actorId: "platform.moderator",
    role: IDENTITY_ROLES.MODERATOR,
    permission: IDENTITY_PERMISSIONS.MODERATE,
    reviewRating,
  }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidReviewRatings.find((item) => item.name === name);
  const reviewRating = buildScenario(scenarios.baseReviewRating, scenario);
  const validation = validateReviewRatingContract(reviewRating);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function buildScenario(base, scenario) {
  const result = clone(base);
  mergeObject(result, scenario.overrides ?? {});
  for (const fieldPath of scenario.removeFields ?? []) {
    removeField(result, fieldPath);
  }
  return result;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeObject(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      mergeObject(target[key], value);
    } else {
      target[key] = clone(value);
    }
  }
}

function removeField(target, fieldPath) {
  const parts = fieldPath.split(".");
  const lastPart = parts.pop();
  const parent = parts.reduce((object, key) => object?.[key], target);
  if (parent && Object.hasOwn(parent, lastPart)) {
    delete parent[lastPart];
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}
