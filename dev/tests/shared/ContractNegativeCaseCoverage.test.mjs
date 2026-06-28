/*
Toolbox Aid
David Quesenberry
06/02/2026
ContractNegativeCaseCoverage.test.mjs
*/
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const COVERAGE_REQUIREMENTS = Object.freeze([
  requirement("Audit Event", "dev/tests/fixtures/audit-events/audit-event-scenarios.json", "invalidAuditEvents", ["AUDIT_EVENT_OWNER_REQUIRED"], ["AUDIT_EVENT_ACTION_INVALID", "AUDIT_EVENT_TARGET_TYPE_INVALID", "AUDIT_EVENT_SEVERITY_INVALID"], true),
  requirement("Backup Snapshot", "dev/tests/fixtures/backup-snapshots/backup-snapshot-scenarios.json", "invalidBackupSnapshots", ["BACKUP_SNAPSHOT_OWNER_REQUIRED", "BACKUP_SNAPSHOT_PROJECT_REQUIRED"], ["BACKUP_SNAPSHOT_VERSION_INVALID", "BACKUP_SNAPSHOT_SCHEMA_VERSION_INVALID"], true),
  requirement("Collaboration Role", "dev/tests/fixtures/collaboration-roles/collaboration-role-scenarios.json", "invalidCollaborationRoles", ["COLLABORATION_ROLE_OWNER_REQUIRED", "COLLABORATION_ROLE_PROJECT_REQUIRED"], ["COLLABORATION_ROLE_INVALID", "COLLABORATION_ROLE_VISIBILITY_INVALID", "COLLABORATION_ROLE_SUBJECT_TYPE_INVALID"], true),
  requirement("Creator Profile", "dev/tests/fixtures/creator-profiles/creator-profile-scenarios.json", "invalidCreatorProfiles", ["CREATOR_PROFILE_OWNER_REQUIRED", "CREATOR_PROFILE_DISPLAY_NAME_REQUIRED"], ["CREATOR_PROFILE_VISIBILITY_INVALID", "CREATOR_PROFILE_STATUS_INVALID"], true),
  requirement("Download Grant", "dev/tests/fixtures/download-grants/download-grant-scenarios.json", "invalidDownloadGrants", ["DOWNLOAD_GRANT_OWNER_REQUIRED", "DOWNLOAD_GRANT_ENTITLEMENT_REQUIRED"], ["DOWNLOAD_GRANT_STATUS_INVALID"], true),
  requirement("Entitlement", "dev/tests/fixtures/entitlements/entitlement-scenarios.json", "invalidEntitlements", ["ENTITLEMENT_OWNER_REQUIRED", "ENTITLEMENT_PROJECT_REQUIRED"], ["ENTITLEMENT_TYPE_INVALID"], true),
  requirement("Identity Permissions", "dev/tests/fixtures/identity-permissions/permission-scenarios.json", "invalidObjects", ["OWNER_REQUIRED", "VISIBILITY_REQUIRED", "PERMISSIONS_REQUIRED"], ["VISIBILITY_INVALID", "PERMISSION_INVALID"], false),
  requirement("Install Receipt", "dev/tests/fixtures/install-receipts/install-receipt-scenarios.json", "invalidInstallReceipts", ["INSTALL_RECEIPT_OWNER_REQUIRED", "INSTALL_RECEIPT_LIBRARY_ITEM_REQUIRED"], ["INSTALL_RECEIPT_STATUS_INVALID"], true),
  requirement("Library Item", "dev/tests/fixtures/library-items/library-item-scenarios.json", "invalidLibraryItems", ["LIBRARY_ITEM_OWNER_REQUIRED", "LIBRARY_ITEM_ENTITLEMENT_REQUIRED"], ["LIBRARY_ITEM_STATUS_INVALID"], true),
  requirement("Game Manifest", "dev/tests/fixtures/manifests/manifest-scenarios.json", "invalidManifests", ["GAME_MANIFEST_OWNER_REQUIRED", "GAME_MANIFEST_PROJECT_REQUIRED", "GAME_MANIFEST_PROJECT_TYPE_REQUIRED"], ["GAME_MANIFEST_PROJECT_TYPE_INVALID", "GAME_MANIFEST_VISIBILITY_INVALID", "GAME_MANIFEST_VERSION_INVALID", "GAME_MANIFEST_STATUS_INVALID", "GAME_MANIFEST_EXPORT_FORMAT_INVALID"], false),
  requirement("Marketplace Listing", "dev/tests/fixtures/marketplace-listings/marketplace-listing-scenarios.json", "invalidListings", ["MARKETPLACE_LISTING_OWNER_REQUIRED", "MARKETPLACE_LISTING_PROJECT_REQUIRED"], ["MARKETPLACE_LISTING_VISIBILITY_INVALID", "MARKETPLACE_LISTING_STATUS_INVALID"], true),
  requirement("Marketplace Transaction Boundary", "dev/tests/fixtures/marketplace-transaction-boundaries/marketplace-transaction-boundary-scenarios.json", "invalidMarketplaceTransactionBoundaries", ["MARKETPLACE_TRANSACTION_BOUNDARY_OWNER_REQUIRED", "MARKETPLACE_TRANSACTION_BOUNDARY_LISTING_REQUIRED"], ["MARKETPLACE_TRANSACTION_BOUNDARY_TYPE_INVALID", "MARKETPLACE_TRANSACTION_BOUNDARY_STATUS_INVALID"], true),
  requirement("Migration Plan", "dev/tests/fixtures/migration-plans/migration-plan-scenarios.json", "invalidMigrationPlans", ["MIGRATION_PLAN_OWNER_REQUIRED", "MIGRATION_PLAN_PROJECT_REQUIRED"], ["MIGRATION_PLAN_SOURCE_VERSION_INVALID", "MIGRATION_PLAN_TARGET_VERSION_INVALID", "MIGRATION_PLAN_STATE_INVALID"], true),
  requirement("Moderation Queue", "dev/tests/fixtures/moderation-queues/moderation-queue-scenarios.json", "invalidModerationQueues", ["MODERATION_QUEUE_OWNER_REQUIRED", "MODERATION_QUEUE_PROJECT_REQUIRED"], ["MODERATION_QUEUE_SUBJECT_TYPE_INVALID", "MODERATION_QUEUE_STATUS_INVALID", "MODERATION_QUEUE_VISIBILITY_INVALID"], true),
  requirement("Notification", "dev/tests/fixtures/notifications/notification-scenarios.json", "invalidNotifications", ["NOTIFICATION_OWNER_REQUIRED", "NOTIFICATION_RECIPIENT_REQUIRED"], ["NOTIFICATION_TYPE_INVALID", "NOTIFICATION_CHANNEL_INVALID", "NOTIFICATION_DELIVERY_STATUS_INVALID"], true),
  requirement("Organization", "dev/tests/fixtures/organizations/organization-scenarios.json", "invalidOrganizations", ["ORGANIZATION_OWNER_REQUIRED", "ORGANIZATION_DISPLAY_NAME_REQUIRED"], ["ORGANIZATION_VISIBILITY_INVALID", "ORGANIZATION_STATUS_INVALID"], true),
  requirement("ProjectWorkspace Runtime", "dev/tests/fixtures/project-workspaces/project-workspace-runtime-scenarios.json", "invalidProjectWorkspaces", ["PROJECT_WORKSPACE_RUNTIME_RECOVERY_TOOL_STATE_REQUIRED"], ["PROJECT_WORKSPACE_RUNTIME_FLOW_STATE_INVALID"], true),
  requirement("Project", "dev/tests/fixtures/projects/project-scenarios.json", "invalidProjects", ["PROJECT_OWNER_REQUIRED", "PROJECT_TYPE_REQUIRED", "PROJECT_VISIBILITY_REQUIRED"], ["PROJECT_TYPE_INVALID", "PROJECT_VISIBILITY_INVALID", "PROJECT_STATE_INVALID", "PROJECT_ROLE_INVALID"], false),
  requirement("Publish", "dev/tests/fixtures/publish/publish-scenarios.json", "invalidPublishes", ["PUBLISH_OWNER_REQUIRED", "PUBLISH_PROJECT_REQUIRED", "PUBLISH_SOURCE_RELEASE_REQUIRED"], ["PUBLISH_SOURCE_RELEASE_INVALID", "PUBLISH_VISIBILITY_INVALID", "PUBLISH_STATUS_INVALID"], true),
  requirement("Release", "dev/tests/fixtures/releases/release-scenarios.json", "invalidReleases", ["RELEASE_OWNER_REQUIRED", "RELEASE_PROJECT_REQUIRED", "RELEASE_SOURCE_MANIFEST_REQUIRED"], ["RELEASE_SOURCE_MANIFEST_INVALID", "RELEASE_VERSION_INVALID", "RELEASE_VISIBILITY_INVALID", "RELEASE_STATUS_INVALID"], false),
  requirement("Restore Snapshot", "dev/tests/fixtures/restore-snapshots/restore-snapshot-scenarios.json", "invalidRestoreSnapshots", ["RESTORE_SNAPSHOT_OWNER_REQUIRED", "RESTORE_SNAPSHOT_PROJECT_REQUIRED"], ["RESTORE_SNAPSHOT_BACKUP_SNAPSHOT_INVALID", "RESTORE_SNAPSHOT_TARGET_RELEASE_INVALID", "RESTORE_SNAPSHOT_VERSION_COMPATIBILITY_INVALID"], true),
  requirement("Review Rating", "dev/tests/fixtures/review-ratings/review-rating-scenarios.json", "invalidReviewRatings", ["REVIEW_RATING_OWNER_REQUIRED", "REVIEW_RATING_MARKETPLACE_LISTING_REQUIRED"], ["REVIEW_RATING_RATING_INVALID", "REVIEW_RATING_VISIBILITY_INVALID", "REVIEW_RATING_STATUS_INVALID"], true),
  requirement("Tool State", "dev/tests/fixtures/tool-states/tool-state-scenarios.json", "invalidToolStates", ["TOOL_STATE_OWNER_REQUIRED", "TOOL_STATE_PROJECT_REQUIRED", "TOOL_TYPE_REQUIRED"], ["TOOL_STATE_VISIBILITY_INVALID", "TOOL_STATE_VERSION_INVALID", "TOOL_STATE_STATUS_INVALID"], false),
  requirement("Update Channel", "dev/tests/fixtures/update-channels/update-channel-scenarios.json", "invalidUpdateChannels", ["UPDATE_CHANNEL_OWNER_REQUIRED", "UPDATE_CHANNEL_ASSIGNED_RELEASE_REQUIRED"], ["UPDATE_CHANNEL_TYPE_INVALID"], true),
  requirement("Version Compatibility", "dev/tests/fixtures/version-compatibility/version-compatibility-scenarios.json", "invalidVersionCompatibilities", ["VERSION_COMPATIBILITY_OWNER_REQUIRED", "VERSION_COMPATIBILITY_PROJECT_REQUIRED"], ["VERSION_COMPATIBILITY_MINIMUM_VERSION_INVALID", "VERSION_COMPATIBILITY_TARGET_VERSION_INVALID", "VERSION_COMPATIBILITY_STATE_INVALID"], true),
]);

export function run() {
  assert.equal(COVERAGE_REQUIREMENTS.length, 25, "active platform contract negative coverage count");

  for (const coverageRequirement of COVERAGE_REQUIREMENTS) {
    const fixture = readFixture(coverageRequirement.fixturePath);
    const invalidScenarios = fixture[coverageRequirement.invalidCollection];

    assert.equal(Array.isArray(invalidScenarios), true, `${coverageRequirement.name} has invalid scenario collection`);
    assert.ok(invalidScenarios.length > 0, `${coverageRequirement.name} has invalid payload rejection coverage`);

    const errorCodes = collectExpectedErrorCodes(invalidScenarios, coverageRequirement);
    assertExpectedCodes(errorCodes, coverageRequirement.requiredErrorCodes, `${coverageRequirement.name} required-field coverage`);
    assertExpectedCodes(errorCodes, coverageRequirement.enumErrorCodes, `${coverageRequirement.name} invalid enum/status/type/visibility coverage`);

    if (coverageRequirement.forbiddenFieldCoverageRequired) {
      assert.ok(
        errorCodes.some((code) => code.endsWith("_FIELD_NOT_ALLOWED")),
        `${coverageRequirement.name} rejects forbidden runtime/auth/payment/download/install leakage fields`
      );
    }
  }
}

function requirement(name, fixturePath, invalidCollection, requiredErrorCodes, enumErrorCodes, forbiddenFieldCoverageRequired) {
  return Object.freeze({
    name,
    fixturePath,
    invalidCollection,
    requiredErrorCodes: Object.freeze(requiredErrorCodes),
    enumErrorCodes: Object.freeze(enumErrorCodes),
    forbiddenFieldCoverageRequired,
  });
}

function readFixture(fixturePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, fixturePath), "utf8"));
}

function collectExpectedErrorCodes(invalidScenarios, coverageRequirement) {
  const errorCodes = [];

  for (const scenario of invalidScenarios) {
    assert.equal(typeof scenario?.name, "string", `${coverageRequirement.name} invalid scenario has a name`);
    assert.equal(Array.isArray(scenario?.expectedErrors), true, `${coverageRequirement.name} ${scenario.name} declares expected errors`);
    assert.ok(scenario.expectedErrors.length > 0, `${coverageRequirement.name} ${scenario.name} rejects at least one invalid payload condition`);
    scenario.expectedErrors.forEach((code) => {
      assert.equal(typeof code, "string", `${coverageRequirement.name} ${scenario.name} expected error code is a string`);
      errorCodes.push(code);
    });
  }

  return errorCodes;
}

function assertExpectedCodes(actualErrorCodes, expectedErrorCodes, label) {
  for (const expectedErrorCode of expectedErrorCodes) {
    assert.equal(
      actualErrorCodes.includes(expectedErrorCode),
      true,
      `${label} includes ${expectedErrorCode}`
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run();
}
