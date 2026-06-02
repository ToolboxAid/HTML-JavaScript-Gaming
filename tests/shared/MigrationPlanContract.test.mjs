/*
Toolbox Aid
David Quesenberry
06/02/2026
MigrationPlanContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  isIdentityPermission,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  ENTITLEMENT_TYPES,
  validateEntitlementContract,
} from "../../src/shared/contracts/entitlementContract.js";
import {
  INSTALL_RECEIPT_STATUS,
  validateInstallReceiptContract,
} from "../../src/shared/contracts/installReceiptContract.js";
import {
  LIBRARY_ITEM_STATUS,
  validateLibraryItemContract,
} from "../../src/shared/contracts/libraryItemContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
  validateMarketplaceListingContract,
} from "../../src/shared/contracts/marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
  validatePublishContract,
} from "../../src/shared/contracts/publishContract.js";
import {
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../src/shared/contracts/projectContract.js";
import {
  RELEASE_STATUS,
  validateReleaseContract,
} from "../../src/shared/contracts/releaseContract.js";
import {
  UPDATE_CHANNEL_TYPES,
  validateUpdateChannelContract,
} from "../../src/shared/contracts/updateChannelContract.js";
import {
  VERSION_COMPATIBILITY_STATES,
  validateVersionCompatibilityContract,
} from "../../src/shared/contracts/versionCompatibilityContract.js";
import {
  MIGRATION_PLAN_CONTRACT_ERRORS,
  MIGRATION_PLAN_CONTRACT_ID,
  MIGRATION_PLAN_CONTRACT_VERSION,
  MIGRATION_PLAN_FIELD_LIST,
  MIGRATION_PLAN_FIELDS,
  MIGRATION_PLAN_FORBIDDEN_FIELDS,
  MIGRATION_PLAN_RULES,
  MIGRATION_PLAN_STATE_LIST,
  MIGRATION_PLAN_STATES,
  canActorAccessMigrationPlan,
  isMigrationPlanBlocked,
  isMigrationPlanCompleted,
  isMigrationPlanInstallReceipt,
  isMigrationPlanLibraryItem,
  isMigrationPlanNotRequired,
  isMigrationPlanRequired,
  isMigrationPlanState,
  isMigrationPlanTargetRelease,
  isMigrationPlanUpdateChannel,
  isMigrationPlanVersion,
  isMigrationPlanVersionCompatibility,
  isMigrationPlanVisibleToActor,
  validateMigrationPlanContract,
} from "../../src/shared/contracts/migrationPlanContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/migration-plans/migration-plan-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(MIGRATION_PLAN_CONTRACT_ID, "gamefoundrystudio.migration.plan.contract");
  assert.equal(MIGRATION_PLAN_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(MIGRATION_PLAN_FIELD_LIST, [
    "migrationPlanId",
    "ownerId",
    "projectId",
    "targetRelease",
    "versionCompatibility",
    "updateChannel",
    "libraryItem",
    "installReceipt",
    "sourceVersion",
    "targetVersion",
    "schemaVersion",
    "migrationState",
    "plannedAt",
    "completedAt",
    "migrationNotes",
  ]);
  assert.deepEqual(MIGRATION_PLAN_FIELDS, {
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
  assert.deepEqual(MIGRATION_PLAN_STATE_LIST, ["notRequired", "required", "blocked", "completed"]);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_OWNER, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_PROJECT, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_TARGET_RELEASE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_VERSION_COMPATIBILITY, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_UPDATE_CHANNEL, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_LIBRARY_ITEM, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_INSTALL_RECEIPT, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_SOURCE_VERSION, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_TARGET_VERSION, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_SCHEMA_VERSION, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_VALID_MIGRATION_STATE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_PLANNED_AT, true);
  assert.equal(MIGRATION_PLAN_RULES.COMPLETED_MIGRATIONS_REQUIRE_COMPLETED_AT, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_OWNER_COMPATIBILITY_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_OWNER_UPDATE_CHANNEL_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_PROJECT_RELEASE_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_PROJECT_COMPATIBILITY_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_PROJECT_UPDATE_CHANNEL_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_RELEASE_COMPATIBILITY_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_RELEASE_UPDATE_CHANNEL_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_COMPATIBILITY_UPDATE_CHANNEL_PUBLISH_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_COMPATIBILITY_LIBRARY_ITEM_PUBLISH_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_COMPATIBILITY_INSTALL_RECEIPT_PUBLISH_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(MIGRATION_PLAN_RULES.TARGET_VERSION_MUST_MATCH_RELEASE_VERSION, true);
  assert.equal(MIGRATION_PLAN_RULES.TARGET_VERSION_MUST_MATCH_COMPATIBILITY_TARGET, true);
  assert.equal(MIGRATION_PLAN_RULES.SCHEMA_VERSION_MUST_MATCH_COMPATIBILITY_SCHEMA, true);
  assert.equal(MIGRATION_PLAN_RULES.NOT_REQUIRED_REQUIRES_EQUAL_SOURCE_TARGET_VERSION, true);
  assert.equal(MIGRATION_PLAN_RULES.REQUIRED_OR_COMPLETED_REQUIRES_NEWER_TARGET_VERSION, true);
  assert.equal(MIGRATION_PLAN_RULES.BLOCKED_OR_INCOMPATIBLE_COMPATIBILITY_REQUIRES_BLOCKED_PLAN, true);
  assert.equal(MIGRATION_PLAN_RULES.NO_RUNTIME_STATE, true);
  assert.equal(MIGRATION_PLAN_RULES.NO_TOOL_STATE, true);
  assert.equal(MIGRATION_PLAN_RULES.NO_INSTALLER_STATE, true);
  assert.equal(MIGRATION_PLAN_RULES.NO_UPDATER_IMPLEMENTATION_DETAILS, true);
  assert.equal(MIGRATION_PLAN_RULES.NO_MIGRATION_IMPLEMENTATION_CODE, true);
  assert.equal(MIGRATION_PLAN_RULES.NO_FILE_BYTES, true);
  assert.equal(MIGRATION_PLAN_RULES.NO_DOWNLOAD_STATE, true);
  assert.equal(MIGRATION_PLAN_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(MIGRATION_PLAN_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(MIGRATION_PLAN_FORBIDDEN_FIELDS.includes("installerState"), true);
  assert.equal(MIGRATION_PLAN_FORBIDDEN_FIELDS.includes("updaterImplementation"), true);
  assert.equal(MIGRATION_PLAN_FORBIDDEN_FIELDS.includes("migrationCode"), true);
  assert.equal(MIGRATION_PLAN_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(MIGRATION_PLAN_FORBIDDEN_FIELDS.includes("downloadState"), true);
  assertUnique(MIGRATION_PLAN_STATE_LIST);
  assertUnique(MIGRATION_PLAN_FORBIDDEN_FIELDS);

  assert.equal(isMigrationPlanState(MIGRATION_PLAN_STATES.NOT_REQUIRED), true);
  assert.equal(isMigrationPlanState(MIGRATION_PLAN_STATES.REQUIRED), true);
  assert.equal(isMigrationPlanState(MIGRATION_PLAN_STATES.BLOCKED), true);
  assert.equal(isMigrationPlanState(MIGRATION_PLAN_STATES.COMPLETED), true);
  assert.equal(isMigrationPlanState("running"), false);
  assert.equal(isMigrationPlanVersion(1), true);
  assert.equal(isMigrationPlanVersion(0), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validMigrationPlans) {
    const migrationPlan = buildMigrationPlan(scenarios.baseMigrationPlan, scenario);
    const validation = validateMigrationPlanContract(migrationPlan);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidMigrationPlans) {
    const migrationPlan = buildMigrationPlan(scenarios.baseMigrationPlan, scenario);
    const validation = validateMigrationPlanContract(migrationPlan);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", MIGRATION_PLAN_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", MIGRATION_PLAN_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing target release", MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing version compatibility", MIGRATION_PLAN_CONTRACT_ERRORS.VERSION_COMPATIBILITY_REQUIRED);
  assertErrorForScenario(scenarios, "missing update channel", MIGRATION_PLAN_CONTRACT_ERRORS.UPDATE_CHANNEL_REQUIRED);
  assertErrorForScenario(scenarios, "missing library item", MIGRATION_PLAN_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED);
  assertErrorForScenario(scenarios, "missing install receipt", MIGRATION_PLAN_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED);
  assertErrorForScenario(scenarios, "invalid source version", MIGRATION_PLAN_CONTRACT_ERRORS.SOURCE_VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid target version", MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid schema version", MIGRATION_PLAN_CONTRACT_ERRORS.SCHEMA_VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid migration state", MIGRATION_PLAN_CONTRACT_ERRORS.MIGRATION_STATE_INVALID);
  assertErrorForScenario(scenarios, "target release version mismatch", MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_RELEASE_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "version compatibility target mismatch", MIGRATION_PLAN_CONTRACT_ERRORS.VERSION_COMPATIBILITY_TARGET_MISMATCH);
  assertErrorForScenario(scenarios, "schema version mismatch", MIGRATION_PLAN_CONTRACT_ERRORS.SCHEMA_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "not required version mismatch", MIGRATION_PLAN_CONTRACT_ERRORS.NOT_REQUIRED_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "required target version not newer", MIGRATION_PLAN_CONTRACT_ERRORS.TARGET_VERSION_NOT_NEWER);
  assertErrorForScenario(scenarios, "blocked compatibility with required migration", MIGRATION_PLAN_CONTRACT_ERRORS.COMPATIBILITY_GATE_BLOCKED);
  assertErrorForScenario(scenarios, "completed without timestamp", MIGRATION_PLAN_CONTRACT_ERRORS.COMPLETED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "release update channel mismatch", MIGRATION_PLAN_CONTRACT_ERRORS.RELEASE_UPDATE_CHANNEL_MISMATCH);
  assertErrorForScenario(scenarios, "publish update channel mismatch", MIGRATION_PLAN_CONTRACT_ERRORS.PUBLISH_COMPATIBILITY_UPDATE_CHANNEL_MISMATCH);
  assertErrorForScenario(scenarios, "library item install receipt mismatch", MIGRATION_PLAN_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH);
  assertErrorForScenario(scenarios, "runtime state leakage", MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "installer state leakage", MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "updater implementation leakage", MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "migration implementation code leakage", MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "download state leakage", MIGRATION_PLAN_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const project = {
    id: "project.game.alpha",
    ownerId: "user.creator",
    projectType: PROJECT_TYPES.GAME,
    state: "marketplace",
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const release = {
    releaseId: "release.game.alpha.2",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceManifest: {
      manifestId: "manifest.game.alpha",
      version: 2,
      exportFormat: "game-manifest-json",
    },
    version: 2,
    status: RELEASE_STATUS.PUBLISHED,
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    publishedAt: "2026-06-02T19:00:00.000Z",
    releaseNotes: "Release linked by migration plan contract.",
  };
  const publish = {
    publishId: "publish.game.alpha.2",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    status: PUBLISH_STATUS.PUBLISHED,
    publishedAt: "2026-06-02T19:30:00.000Z",
    publishNotes: "Publish linked by migration plan contract.",
  };
  const listing = {
    listingId: "listing.game.alpha.2",
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
    listedAt: "2026-06-02T20:00:00.000Z",
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
    grantedAt: "2026-06-02T20:30:00.000Z",
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
    addedAt: "2026-06-02T21:00:00.000Z",
  };
  const installReceipt = {
    installReceiptId: "install-receipt.alpha.installed.2",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    libraryItem: {
      libraryItemId: libraryItem.libraryItemId,
      ownerId: libraryItem.ownerId,
      projectId: libraryItem.projectId,
      entitlementId: entitlement.entitlementId,
      listingId: listing.listingId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      libraryStatus: libraryItem.libraryStatus,
    },
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
    receiptStatus: INSTALL_RECEIPT_STATUS.INSTALLED,
    installedAt: "2026-06-02T21:30:00.000Z",
  };
  const updateChannel = {
    updateChannelId: "update-channel.alpha.stable",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    channelType: UPDATE_CHANNEL_TYPES.STABLE,
    assignedRelease: {
      releaseId: release.releaseId,
      projectId: release.projectId,
      version: release.version,
      status: release.status,
    },
    assignedPublish: {
      publishId: publish.publishId,
      projectId: publish.projectId,
      releaseId: release.releaseId,
      status: publish.status,
    },
    libraryItem: {
      libraryItemId: libraryItem.libraryItemId,
      ownerId: libraryItem.ownerId,
      projectId: libraryItem.projectId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      libraryStatus: libraryItem.libraryStatus,
    },
    installReceipt: {
      installReceiptId: installReceipt.installReceiptId,
      ownerId: installReceipt.ownerId,
      projectId: installReceipt.projectId,
      libraryItemId: libraryItem.libraryItemId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      receiptStatus: installReceipt.receiptStatus,
    },
    assignedAt: "2026-06-02T22:00:00.000Z",
  };
  const versionCompatibility = {
    versionCompatibilityId: "version-compatibility.alpha.compatible",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: release.releaseId,
      projectId: release.projectId,
      version: release.version,
      status: release.status,
    },
    sourcePublish: {
      publishId: publish.publishId,
      projectId: publish.projectId,
      releaseId: release.releaseId,
      status: publish.status,
    },
    updateChannel: {
      updateChannelId: updateChannel.updateChannelId,
      ownerId: updateChannel.ownerId,
      projectId: updateChannel.projectId,
      channelType: updateChannel.channelType,
      releaseId: release.releaseId,
      publishId: publish.publishId,
    },
    libraryItem: {
      libraryItemId: libraryItem.libraryItemId,
      ownerId: libraryItem.ownerId,
      projectId: libraryItem.projectId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      libraryStatus: libraryItem.libraryStatus,
    },
    installReceipt: {
      installReceiptId: installReceipt.installReceiptId,
      ownerId: installReceipt.ownerId,
      projectId: installReceipt.projectId,
      libraryItemId: libraryItem.libraryItemId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      receiptStatus: installReceipt.receiptStatus,
    },
    minimumVersion: 1,
    maximumVersion: 3,
    targetVersion: 2,
    supportedSchemaVersion: 1,
    compatibilityState: VERSION_COMPATIBILITY_STATES.COMPATIBLE,
    evaluatedAt: "2026-06-02T23:00:00.000Z",
  };
  const migrationPlan = buildMigrationPlan(scenarios.baseMigrationPlan, scenarios.validMigrationPlans[0]);

  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(release).valid, true);
  assert.equal(validatePublishContract(publish).valid, true);
  assert.equal(validateMarketplaceListingContract(listing).valid, true);
  assert.equal(validateEntitlementContract(entitlement).valid, true);
  assert.equal(validateLibraryItemContract(libraryItem).valid, true);
  assert.equal(validateInstallReceiptContract(installReceipt).valid, true);
  assert.equal(validateUpdateChannelContract(updateChannel).valid, true);
  assert.equal(validateVersionCompatibilityContract(versionCompatibility).valid, true);
  assert.equal(validateMigrationPlanContract(migrationPlan).valid, true);

  assert.equal(isMigrationPlanTargetRelease(migrationPlan.targetRelease), true);
  assert.equal(isMigrationPlanTargetRelease({
    releaseId: "release.game.alpha.2",
    projectId: "project.game.alpha",
    version: 0,
    status: RELEASE_STATUS.PUBLISHED,
  }), false);
  assert.equal(isMigrationPlanVersionCompatibility(migrationPlan.versionCompatibility), true);
  assert.equal(isMigrationPlanVersionCompatibility({
    ...migrationPlan.versionCompatibility,
    compatibilityState: "unknown",
  }), false);
  assert.equal(isMigrationPlanUpdateChannel(migrationPlan.updateChannel), true);
  assert.equal(isMigrationPlanUpdateChannel({
    ...migrationPlan.updateChannel,
    channelType: "canary",
  }), false);
  assert.equal(isMigrationPlanLibraryItem(migrationPlan.libraryItem), true);
  assert.equal(isMigrationPlanLibraryItem({
    ...migrationPlan.libraryItem,
    libraryStatus: "installed",
  }), false);
  assert.equal(isMigrationPlanInstallReceipt(migrationPlan.installReceipt), true);
  assert.equal(isMigrationPlanInstallReceipt({
    ...migrationPlan.installReceipt,
    receiptStatus: "queued",
  }), false);

  const notRequiredPlan = buildMigrationPlan(
    scenarios.baseMigrationPlan,
    scenarios.validMigrationPlans.find((scenario) => scenario.name === "not required migration plan")
  );
  const blockedPlan = buildMigrationPlan(
    scenarios.baseMigrationPlan,
    scenarios.validMigrationPlans.find((scenario) => scenario.name === "blocked migration plan")
  );
  const completedPlan = buildMigrationPlan(
    scenarios.baseMigrationPlan,
    scenarios.validMigrationPlans.find((scenario) => scenario.name === "completed migration plan")
  );
  assert.equal(isMigrationPlanRequired(migrationPlan), true);
  assert.equal(isMigrationPlanNotRequired(notRequiredPlan), true);
  assert.equal(isMigrationPlanBlocked(blockedPlan), true);
  assert.equal(isMigrationPlanCompleted(completedPlan), true);

  assert.equal(isMigrationPlanVisibleToActor({
    actorId: "user.buyer",
    migrationPlan,
  }), true);
  assert.equal(isMigrationPlanVisibleToActor({
    actorId: "public.viewer",
    migrationPlan,
  }), false);
  assert.equal(canActorAccessMigrationPlan({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    migrationPlan,
  }), true, "migration plan owner can view record");
  assert.equal(canActorAccessMigrationPlan({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    migrationPlan,
  }), false, "guest cannot view private migration plan");
  assert.equal(canActorAccessMigrationPlan({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    migrationPlan,
  }), true, "platform admin can administer migration plan record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidMigrationPlans.find((item) => item.name === name);
  const migrationPlan = buildMigrationPlan(scenarios.baseMigrationPlan, scenario);
  const validation = validateMigrationPlanContract(migrationPlan);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function buildMigrationPlan(baseMigrationPlan, scenario) {
  const migrationPlan = clone(baseMigrationPlan);
  mergeObject(migrationPlan, scenario.overrides ?? {});

  for (const fieldPath of scenario.removeFields ?? []) {
    removeField(migrationPlan, fieldPath);
  }

  return migrationPlan;
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

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
