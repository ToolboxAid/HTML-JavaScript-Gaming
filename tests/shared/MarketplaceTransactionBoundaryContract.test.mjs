/*
Toolbox Aid
David Quesenberry
06/02/2026
MarketplaceTransactionBoundaryContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  ENTITLEMENT_TYPES,
} from "../../src/shared/contracts/entitlementContract.js";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
} from "../../src/shared/contracts/marketplaceListingContract.js";
import {
  MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS,
  MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ID,
  MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_VERSION,
  MARKETPLACE_TRANSACTION_BOUNDARY_FIELD_LIST,
  MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS,
  MARKETPLACE_TRANSACTION_BOUNDARY_STATUS_LIST,
  MARKETPLACE_TRANSACTION_BOUNDARY_TYPE_LIST,
  canActorAccessMarketplaceTransactionBoundary,
  isMarketplaceTransactionBoundaryEntitlement,
  isMarketplaceTransactionBoundaryListing,
  isMarketplaceTransactionBoundaryOwner,
  isMarketplaceTransactionBoundarySourcePublish,
  isMarketplaceTransactionBoundarySourceRelease,
  isMarketplaceTransactionBoundaryStatus,
  isMarketplaceTransactionBoundaryType,
  validateMarketplaceTransactionBoundaryContract,
} from "../../src/shared/contracts/marketplaceTransactionBoundaryContract.js";
import {
  PUBLISH_STATUS,
} from "../../src/shared/contracts/publishContract.js";
import {
  RELEASE_STATUS,
} from "../../src/shared/contracts/releaseContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/marketplace-transaction-boundaries/marketplace-transaction-boundary-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ID, "gamefoundrystudio.marketplace.transaction.boundary.contract");
  assert.equal(MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(MARKETPLACE_TRANSACTION_BOUNDARY_FIELD_LIST, [
    "marketplaceTransactionBoundaryId",
    "ownerId",
    "projectId",
    "marketplaceListing",
    "entitlement",
    "sourceRelease",
    "sourcePublish",
    "boundaryType",
    "boundaryStatus",
    "createdAt",
    "boundaryNotes",
  ]);
  assert.deepEqual(MARKETPLACE_TRANSACTION_BOUNDARY_TYPE_LIST, ["purchaseIntent", "licenseGrant", "entitlementChange", "refundBoundary"]);
  assert.deepEqual(MARKETPLACE_TRANSACTION_BOUNDARY_STATUS_LIST, ["opened", "recorded", "voided", "closed"]);
  assert.equal(MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assert.equal(MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS.includes("providerResponse"), true);
  assert.equal(MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS.includes("toolState"), true);
  assertUnique(MARKETPLACE_TRANSACTION_BOUNDARY_FORBIDDEN_FIELDS);

  assert.equal(isMarketplaceTransactionBoundaryType("licenseGrant"), true);
  assert.equal(isMarketplaceTransactionBoundaryType("paymentCapture"), false);
  assert.equal(isMarketplaceTransactionBoundaryStatus("recorded"), true);
  assert.equal(isMarketplaceTransactionBoundaryStatus("settled"), false);

  for (const scenario of scenarios.validMarketplaceTransactionBoundaries) {
    const boundary = buildScenario(scenarios.baseMarketplaceTransactionBoundary, scenario);
    const validation = validateMarketplaceTransactionBoundaryContract(boundary);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidMarketplaceTransactionBoundaries) {
    const boundary = buildScenario(scenarios.baseMarketplaceTransactionBoundary, scenario);
    const validation = validateMarketplaceTransactionBoundaryContract(boundary);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing marketplace listing", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED);
  assertErrorForScenario(scenarios, "missing entitlement", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED);
  assertErrorForScenario(scenarios, "owner entitlement mismatch", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.OWNER_ENTITLEMENT_MISMATCH);
  assertErrorForScenario(scenarios, "project linkage mismatch", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.PROJECT_LINKAGE_MISMATCH);
  assertErrorForScenario(scenarios, "release linkage mismatch", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.RELEASE_LINKAGE_MISMATCH);
  assertErrorForScenario(scenarios, "publish linkage mismatch", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.PUBLISH_LINKAGE_MISMATCH);
  assertErrorForScenario(scenarios, "release publish mismatch", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "invalid boundary type", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_TYPE_INVALID);
  assertErrorForScenario(scenarios, "invalid boundary status", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.BOUNDARY_STATUS_INVALID);
  assertErrorForScenario(scenarios, "missing created at", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.CREATED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "payment state leakage", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "provider implementation leakage", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const boundary = buildScenario(scenarios.baseMarketplaceTransactionBoundary, scenarios.validMarketplaceTransactionBoundaries[0]);
  assert.equal(isMarketplaceTransactionBoundaryListing(boundary.marketplaceListing), true);
  assert.equal(isMarketplaceTransactionBoundaryListing({
    ...boundary.marketplaceListing,
    status: MARKETPLACE_LISTING_STATUS.DRAFT,
  }), false);
  assert.equal(isMarketplaceTransactionBoundaryEntitlement(boundary.entitlement), true);
  assert.equal(isMarketplaceTransactionBoundaryEntitlement({
    ...boundary.entitlement,
    entitlementType: "trial",
  }), false);
  assert.equal(isMarketplaceTransactionBoundarySourceRelease(boundary.sourceRelease), true);
  assert.equal(isMarketplaceTransactionBoundarySourceRelease({
    releaseId: "release.game.alpha.1",
    version: 1,
    status: RELEASE_STATUS.DRAFT,
  }), false);
  assert.equal(isMarketplaceTransactionBoundarySourcePublish(boundary.sourcePublish), true);
  assert.equal(isMarketplaceTransactionBoundarySourcePublish({
    publishId: "publish.game.alpha.1",
    releaseId: "release.game.alpha.1",
    status: PUBLISH_STATUS.DRAFT,
  }), false);
  assert.equal(isMarketplaceTransactionBoundaryEntitlement({
    ...boundary.entitlement,
    entitlementType: ENTITLEMENT_TYPES.GRANTED,
  }), true);

  assert.equal(isMarketplaceTransactionBoundaryOwner({
    actorId: "user.buyer",
    boundary,
  }), true);
  assert.equal(canActorAccessMarketplaceTransactionBoundary({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    boundary,
  }), true);
  assert.equal(canActorAccessMarketplaceTransactionBoundary({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    boundary,
  }), true);
  assert.equal(canActorAccessMarketplaceTransactionBoundary({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    boundary,
  }), false);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidMarketplaceTransactionBoundaries.find((item) => item.name === name);
  const boundary = buildScenario(scenarios.baseMarketplaceTransactionBoundary, scenario);
  const validation = validateMarketplaceTransactionBoundaryContract(boundary);
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
