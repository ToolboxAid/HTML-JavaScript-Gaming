/*
Toolbox Aid
David Quesenberry
06/02/2026
LibraryItemContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  isIdentityPermission,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  ENTITLEMENT_TYPES,
  validateEntitlementContract,
} from "../../../src/shared/contracts/entitlementContract.js";
import {
  LIBRARY_ITEM_CONTRACT_ERRORS,
  LIBRARY_ITEM_CONTRACT_ID,
  LIBRARY_ITEM_CONTRACT_VERSION,
  LIBRARY_ITEM_FIELD_LIST,
  LIBRARY_ITEM_FIELDS,
  LIBRARY_ITEM_FORBIDDEN_FIELDS,
  LIBRARY_ITEM_RULES,
  LIBRARY_ITEM_STATUS,
  LIBRARY_ITEM_STATUS_LIST,
  canActorAccessLibraryItem,
  isLibraryItemArchived,
  isLibraryItemAvailable,
  isLibraryItemEntitlement,
  isLibraryItemHidden,
  isLibraryItemMarketplaceListing,
  isLibraryItemRevoked,
  isLibraryItemSourcePublish,
  isLibraryItemSourceRelease,
  isLibraryItemStatus,
  isLibraryItemVisibleToActor,
  validateLibraryItemContract,
} from "../../../src/shared/contracts/libraryItemContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
  validateMarketplaceListingContract,
} from "../../../src/shared/contracts/marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
  validatePublishContract,
} from "../../../src/shared/contracts/publishContract.js";
import {
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  RELEASE_STATUS,
  validateReleaseContract,
} from "../../../src/shared/contracts/releaseContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/library-items/library-item-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(LIBRARY_ITEM_CONTRACT_ID, "gamefoundrystudio.library.item.contract");
  assert.equal(LIBRARY_ITEM_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(LIBRARY_ITEM_FIELD_LIST, [
    "libraryItemId",
    "ownerId",
    "projectId",
    "entitlement",
    "marketplaceListing",
    "sourceRelease",
    "sourcePublish",
    "libraryStatus",
    "addedAt",
    "hiddenAt",
    "revokedAt",
    "archivedAt",
    "libraryNotes",
  ]);
  assert.deepEqual(LIBRARY_ITEM_FIELDS, {
    LIBRARY_ITEM_ID: "libraryItemId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    ENTITLEMENT: "entitlement",
    MARKETPLACE_LISTING: "marketplaceListing",
    SOURCE_RELEASE: "sourceRelease",
    SOURCE_PUBLISH: "sourcePublish",
    LIBRARY_STATUS: "libraryStatus",
    ADDED_AT: "addedAt",
    HIDDEN_AT: "hiddenAt",
    REVOKED_AT: "revokedAt",
    ARCHIVED_AT: "archivedAt",
    LIBRARY_NOTES: "libraryNotes",
  });
  assert.deepEqual(LIBRARY_ITEM_STATUS_LIST, ["available", "hidden", "revoked", "archived"]);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_OWNER, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_PROJECT, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_ENTITLEMENT, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_MARKETPLACE_LISTING, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_SOURCE_PUBLISH, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_VALID_LIBRARY_STATUS, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_ADDED_AT, true);
  assert.equal(LIBRARY_ITEM_RULES.HIDDEN_ITEMS_REQUIRE_HIDDEN_AT, true);
  assert.equal(LIBRARY_ITEM_RULES.REVOKED_ITEMS_REQUIRE_REVOKED_AT, true);
  assert.equal(LIBRARY_ITEM_RULES.ARCHIVED_ITEMS_REQUIRE_ARCHIVED_AT, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_OWNER_ENTITLEMENT_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_PROJECT_ENTITLEMENT_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_ENTITLEMENT_LISTING_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_ENTITLEMENT_RELEASE_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_ENTITLEMENT_PUBLISH_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_LISTING_PROJECT_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_LISTING_RELEASE_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_LISTING_PUBLISH_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(LIBRARY_ITEM_RULES.NO_PAYMENT_STATE, true);
  assert.equal(LIBRARY_ITEM_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(LIBRARY_ITEM_RULES.NO_RUNTIME_STATE, true);
  assert.equal(LIBRARY_ITEM_RULES.NO_TOOL_STATE, true);
  assert.equal(LIBRARY_ITEM_RULES.NO_FILE_BYTES, true);
  assert.equal(LIBRARY_ITEM_RULES.NO_CDN_DETAILS, true);
  assert.equal(LIBRARY_ITEM_RULES.NO_INSTALL_STATE, true);
  assert.equal(LIBRARY_ITEM_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assert.equal(LIBRARY_ITEM_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(LIBRARY_ITEM_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(LIBRARY_ITEM_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(LIBRARY_ITEM_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(LIBRARY_ITEM_FORBIDDEN_FIELDS.includes("cdnUrl"), true);
  assert.equal(LIBRARY_ITEM_FORBIDDEN_FIELDS.includes("installState"), true);
  assertUnique(LIBRARY_ITEM_STATUS_LIST);
  assertUnique(LIBRARY_ITEM_FORBIDDEN_FIELDS);

  assert.equal(isLibraryItemStatus(LIBRARY_ITEM_STATUS.AVAILABLE), true);
  assert.equal(isLibraryItemStatus(LIBRARY_ITEM_STATUS.HIDDEN), true);
  assert.equal(isLibraryItemStatus(LIBRARY_ITEM_STATUS.REVOKED), true);
  assert.equal(isLibraryItemStatus(LIBRARY_ITEM_STATUS.ARCHIVED), true);
  assert.equal(isLibraryItemStatus("installed"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validLibraryItems) {
    const validation = validateLibraryItemContract(scenario.libraryItem);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidLibraryItems) {
    const validation = validateLibraryItemContract(scenario.libraryItem);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", LIBRARY_ITEM_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing entitlement", LIBRARY_ITEM_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED);
  assertErrorForScenario(scenarios, "missing marketplace listing", LIBRARY_ITEM_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", LIBRARY_ITEM_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing source publish", LIBRARY_ITEM_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "invalid library status", LIBRARY_ITEM_CONTRACT_ERRORS.LIBRARY_STATUS_INVALID);
  assertErrorForScenario(scenarios, "owner entitlement mismatch", LIBRARY_ITEM_CONTRACT_ERRORS.OWNER_ENTITLEMENT_MISMATCH);
  assertErrorForScenario(scenarios, "entitlement listing mismatch", LIBRARY_ITEM_CONTRACT_ERRORS.ENTITLEMENT_LISTING_MISMATCH);
  assertErrorForScenario(scenarios, "listing release mismatch", LIBRARY_ITEM_CONTRACT_ERRORS.LISTING_RELEASE_MISMATCH);
  assertErrorForScenario(scenarios, "release publish mismatch", LIBRARY_ITEM_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "hidden without timestamp", LIBRARY_ITEM_CONTRACT_ERRORS.HIDDEN_AT_REQUIRED);
  assertErrorForScenario(scenarios, "revoked without timestamp", LIBRARY_ITEM_CONTRACT_ERRORS.REVOKED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "archived without timestamp", LIBRARY_ITEM_CONTRACT_ERRORS.ARCHIVED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "payment state leakage", LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session state leakage", LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "cdn details leakage", LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "install state leakage", LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const project = {
    id: "project.game.alpha",
    ownerId: "user.creator",
    projectType: PROJECT_TYPES.GAME,
    state: "marketplace",
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const release = {
    releaseId: "release.game.alpha.1",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceManifest: {
      manifestId: "manifest.game.alpha",
      version: 1,
      exportFormat: "game-manifest-json",
    },
    version: 1,
    status: RELEASE_STATUS.PUBLISHED,
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    publishedAt: "2026-06-02T14:00:00.000Z",
    releaseNotes: "Release linked by library item contract.",
  };
  const publish = {
    publishId: "publish.game.alpha.1",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    status: PUBLISH_STATUS.PUBLISHED,
    publishedAt: "2026-06-02T15:00:00.000Z",
    publishNotes: "Publish linked by library item contract.",
  };
  const listing = {
    listingId: "listing.game.alpha.1",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    sourcePublish: {
      publishId: publish.publishId,
      releaseId: release.releaseId,
      status: publish.status,
    },
    visibility: "marketplace",
    status: MARKETPLACE_LISTING_STATUS.LISTED,
    listedAt: "2026-06-02T16:00:00.000Z",
    listingTitle: "Alpha Quest",
  };
  const entitlement = {
    entitlementId: "entitlement.alpha.owner.1",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    marketplaceListing: {
      listingId: listing.listingId,
      projectId: listing.projectId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      status: listing.status,
    },
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    sourcePublish: {
      publishId: publish.publishId,
      releaseId: release.releaseId,
      status: publish.status,
    },
    entitlementType: ENTITLEMENT_TYPES.OWNED,
    grantedAt: "2026-06-02T17:00:00.000Z",
  };
  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(release).valid, true);
  assert.equal(validatePublishContract(publish).valid, true);
  assert.equal(validateMarketplaceListingContract(listing).valid, true);
  assert.equal(validateEntitlementContract(entitlement).valid, true);

  const availableItem = scenarios.validLibraryItems.find((scenario) => scenario.name === "available library item").libraryItem;
  const hiddenItem = scenarios.validLibraryItems.find((scenario) => scenario.name === "hidden library item").libraryItem;
  const revokedItem = scenarios.validLibraryItems.find((scenario) => scenario.name === "revoked library item").libraryItem;
  const archivedItem = scenarios.validLibraryItems.find((scenario) => scenario.name === "archived library item").libraryItem;
  assert.equal(isLibraryItemEntitlement(availableItem.entitlement), true);
  assert.equal(isLibraryItemEntitlement({
    ...availableItem.entitlement,
    entitlementType: "trial",
  }), false);
  assert.equal(isLibraryItemMarketplaceListing(availableItem.marketplaceListing), true);
  assert.equal(isLibraryItemMarketplaceListing({
    ...availableItem.marketplaceListing,
    status: "draft",
  }), false);
  assert.equal(isLibraryItemSourceRelease(availableItem.sourceRelease), true);
  assert.equal(isLibraryItemSourceRelease({
    releaseId: "release.game.alpha.1",
    version: 0,
    status: RELEASE_STATUS.PUBLISHED,
  }), false);
  assert.equal(isLibraryItemSourcePublish(availableItem.sourcePublish), true);
  assert.equal(isLibraryItemSourcePublish({
    publishId: "publish.game.alpha.1",
    releaseId: "release.game.alpha.1",
    status: PUBLISH_STATUS.READY,
  }), false);
  assert.equal(isLibraryItemAvailable(availableItem), true);
  assert.equal(isLibraryItemHidden(hiddenItem), true);
  assert.equal(isLibraryItemRevoked(revokedItem), true);
  assert.equal(isLibraryItemArchived(archivedItem), true);

  assert.equal(isLibraryItemVisibleToActor({
    actorId: "user.buyer",
    libraryItem: availableItem,
  }), true);
  assert.equal(isLibraryItemVisibleToActor({
    actorId: "user.other",
    libraryItem: availableItem,
  }), false);
  assert.equal(canActorAccessLibraryItem({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    libraryItem: availableItem,
  }), true, "library item owner can view item");
  assert.equal(canActorAccessLibraryItem({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    libraryItem: availableItem,
  }), false, "guest cannot view private library item");
  assert.equal(canActorAccessLibraryItem({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    libraryItem: availableItem,
  }), true, "platform admin can administer library item record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidLibraryItems.find((item) => item.name === name);
  const validation = validateLibraryItemContract(scenario.libraryItem);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
