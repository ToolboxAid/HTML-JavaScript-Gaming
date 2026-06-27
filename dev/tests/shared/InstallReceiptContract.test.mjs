/*
Toolbox Aid
David Quesenberry
06/02/2026
InstallReceiptContract.test.mjs
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
  INSTALL_RECEIPT_CONTRACT_ERRORS,
  INSTALL_RECEIPT_CONTRACT_ID,
  INSTALL_RECEIPT_CONTRACT_VERSION,
  INSTALL_RECEIPT_FIELD_LIST,
  INSTALL_RECEIPT_FIELDS,
  INSTALL_RECEIPT_FORBIDDEN_FIELDS,
  INSTALL_RECEIPT_RULES,
  INSTALL_RECEIPT_STATUS,
  INSTALL_RECEIPT_STATUS_LIST,
  canActorAccessInstallReceipt,
  isInstallReceiptEntitlement,
  isInstallReceiptFailed,
  isInstallReceiptInstalled,
  isInstallReceiptLibraryItem,
  isInstallReceiptMarketplaceListing,
  isInstallReceiptRemoved,
  isInstallReceiptSourcePublish,
  isInstallReceiptSourceRelease,
  isInstallReceiptStatus,
  isInstallReceiptSuperseded,
  isInstallReceiptVisibleToActor,
  validateInstallReceiptContract,
} from "../../../src/shared/contracts/installReceiptContract.js";
import {
  LIBRARY_ITEM_STATUS,
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
  new URL("../fixtures/install-receipts/install-receipt-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(INSTALL_RECEIPT_CONTRACT_ID, "gamefoundrystudio.install.receipt.contract");
  assert.equal(INSTALL_RECEIPT_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(INSTALL_RECEIPT_FIELD_LIST, [
    "installReceiptId",
    "ownerId",
    "projectId",
    "libraryItem",
    "entitlement",
    "marketplaceListing",
    "sourceRelease",
    "sourcePublish",
    "receiptStatus",
    "installedAt",
    "removedAt",
    "failedAt",
    "supersededAt",
    "receiptNotes",
  ]);
  assert.deepEqual(INSTALL_RECEIPT_FIELDS, {
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
  assert.deepEqual(INSTALL_RECEIPT_STATUS_LIST, ["installed", "removed", "failed", "superseded"]);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_OWNER, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_PROJECT, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LIBRARY_ITEM, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_ENTITLEMENT, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_MARKETPLACE_LISTING, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_SOURCE_PUBLISH, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_VALID_RECEIPT_STATUS, true);
  assert.equal(INSTALL_RECEIPT_RULES.INSTALLED_RECEIPTS_REQUIRE_INSTALLED_AT, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_OWNER_ENTITLEMENT_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_PROJECT_ENTITLEMENT_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LIBRARY_ITEM_ENTITLEMENT_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LIBRARY_ITEM_LISTING_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LIBRARY_ITEM_RELEASE_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LIBRARY_ITEM_PUBLISH_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_ENTITLEMENT_LISTING_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_ENTITLEMENT_RELEASE_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_ENTITLEMENT_PUBLISH_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LISTING_PROJECT_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LISTING_RELEASE_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_LISTING_PUBLISH_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(INSTALL_RECEIPT_RULES.NO_PAYMENT_STATE, true);
  assert.equal(INSTALL_RECEIPT_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(INSTALL_RECEIPT_RULES.NO_RUNTIME_STATE, true);
  assert.equal(INSTALL_RECEIPT_RULES.NO_TOOL_STATE, true);
  assert.equal(INSTALL_RECEIPT_RULES.NO_FILE_BYTES, true);
  assert.equal(INSTALL_RECEIPT_RULES.NO_CDN_DETAILS, true);
  assert.equal(INSTALL_RECEIPT_RULES.NO_INSTALLER_IMPLEMENTATION_DETAILS, true);
  assert.equal(INSTALL_RECEIPT_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assert.equal(INSTALL_RECEIPT_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(INSTALL_RECEIPT_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(INSTALL_RECEIPT_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(INSTALL_RECEIPT_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(INSTALL_RECEIPT_FORBIDDEN_FIELDS.includes("cdnUrl"), true);
  assert.equal(INSTALL_RECEIPT_FORBIDDEN_FIELDS.includes("installerState"), true);
  assertUnique(INSTALL_RECEIPT_STATUS_LIST);
  assertUnique(INSTALL_RECEIPT_FORBIDDEN_FIELDS);

  assert.equal(isInstallReceiptStatus(INSTALL_RECEIPT_STATUS.INSTALLED), true);
  assert.equal(isInstallReceiptStatus(INSTALL_RECEIPT_STATUS.REMOVED), true);
  assert.equal(isInstallReceiptStatus(INSTALL_RECEIPT_STATUS.FAILED), true);
  assert.equal(isInstallReceiptStatus(INSTALL_RECEIPT_STATUS.SUPERSEDED), true);
  assert.equal(isInstallReceiptStatus("queued"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validInstallReceipts) {
    const validation = validateInstallReceiptContract(scenario.installReceipt);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidInstallReceipts) {
    const validation = validateInstallReceiptContract(scenario.installReceipt);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", INSTALL_RECEIPT_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing library item", INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED);
  assertErrorForScenario(scenarios, "missing entitlement", INSTALL_RECEIPT_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED);
  assertErrorForScenario(scenarios, "missing marketplace listing", INSTALL_RECEIPT_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", INSTALL_RECEIPT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing source publish", INSTALL_RECEIPT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "invalid receipt status", INSTALL_RECEIPT_CONTRACT_ERRORS.RECEIPT_STATUS_INVALID);
  assertErrorForScenario(scenarios, "installed without installed timestamp", INSTALL_RECEIPT_CONTRACT_ERRORS.INSTALLED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "owner library item mismatch", INSTALL_RECEIPT_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH);
  assertErrorForScenario(scenarios, "library item entitlement mismatch", INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_ENTITLEMENT_MISMATCH);
  assertErrorForScenario(scenarios, "library item listing mismatch", INSTALL_RECEIPT_CONTRACT_ERRORS.LIBRARY_ITEM_LISTING_MISMATCH);
  assertErrorForScenario(scenarios, "listing release mismatch", INSTALL_RECEIPT_CONTRACT_ERRORS.LISTING_RELEASE_MISMATCH);
  assertErrorForScenario(scenarios, "release publish mismatch", INSTALL_RECEIPT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "payment state leakage", INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session state leakage", INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "cdn details leakage", INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "installer implementation leakage", INSTALL_RECEIPT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

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
    releaseNotes: "Release linked by install receipt contract.",
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
    publishNotes: "Publish linked by install receipt contract.",
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
  const libraryItem = {
    libraryItemId: "library-item.alpha.available.1",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    entitlement: {
      entitlementId: entitlement.entitlementId,
      ownerId: entitlement.ownerId,
      projectId: entitlement.projectId,
      listingId: listing.listingId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      entitlementType: entitlement.entitlementType,
    },
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
    libraryStatus: LIBRARY_ITEM_STATUS.AVAILABLE,
    addedAt: "2026-06-02T18:15:00.000Z",
  };
  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(release).valid, true);
  assert.equal(validatePublishContract(publish).valid, true);
  assert.equal(validateMarketplaceListingContract(listing).valid, true);
  assert.equal(validateEntitlementContract(entitlement).valid, true);
  assert.equal(validateLibraryItemContract(libraryItem).valid, true);

  const installedReceipt = scenarios.validInstallReceipts.find((scenario) => scenario.name === "installed install receipt").installReceipt;
  const removedReceipt = scenarios.validInstallReceipts.find((scenario) => scenario.name === "removed install receipt").installReceipt;
  const failedReceipt = scenarios.validInstallReceipts.find((scenario) => scenario.name === "failed install receipt").installReceipt;
  const supersededReceipt = scenarios.validInstallReceipts.find((scenario) => scenario.name === "superseded install receipt").installReceipt;
  assert.equal(isInstallReceiptLibraryItem(installedReceipt.libraryItem), true);
  assert.equal(isInstallReceiptLibraryItem({
    ...installedReceipt.libraryItem,
    libraryStatus: "installed",
  }), false);
  assert.equal(isInstallReceiptEntitlement(installedReceipt.entitlement), true);
  assert.equal(isInstallReceiptEntitlement({
    ...installedReceipt.entitlement,
    entitlementType: "trial",
  }), false);
  assert.equal(isInstallReceiptMarketplaceListing(installedReceipt.marketplaceListing), true);
  assert.equal(isInstallReceiptMarketplaceListing({
    ...installedReceipt.marketplaceListing,
    status: "draft",
  }), false);
  assert.equal(isInstallReceiptSourceRelease(installedReceipt.sourceRelease), true);
  assert.equal(isInstallReceiptSourceRelease({
    releaseId: "release.game.alpha.1",
    version: 0,
    status: RELEASE_STATUS.PUBLISHED,
  }), false);
  assert.equal(isInstallReceiptSourcePublish(installedReceipt.sourcePublish), true);
  assert.equal(isInstallReceiptSourcePublish({
    publishId: "publish.game.alpha.1",
    releaseId: "release.game.alpha.1",
    status: PUBLISH_STATUS.READY,
  }), false);
  assert.equal(isInstallReceiptInstalled(installedReceipt), true);
  assert.equal(isInstallReceiptRemoved(removedReceipt), true);
  assert.equal(isInstallReceiptFailed(failedReceipt), true);
  assert.equal(isInstallReceiptSuperseded(supersededReceipt), true);

  assert.equal(isInstallReceiptVisibleToActor({
    actorId: "user.buyer",
    installReceipt: installedReceipt,
  }), true);
  assert.equal(isInstallReceiptVisibleToActor({
    actorId: "user.other",
    installReceipt: installedReceipt,
  }), false);
  assert.equal(canActorAccessInstallReceipt({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    installReceipt: installedReceipt,
  }), true, "install receipt owner can view receipt");
  assert.equal(canActorAccessInstallReceipt({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    installReceipt: installedReceipt,
  }), false, "guest cannot view private install receipt");
  assert.equal(canActorAccessInstallReceipt({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    installReceipt: installedReceipt,
  }), true, "platform admin can administer install receipt record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidInstallReceipts.find((item) => item.name === name);
  const validation = validateInstallReceiptContract(scenario.installReceipt);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
