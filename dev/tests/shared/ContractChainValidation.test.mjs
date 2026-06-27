/*
Toolbox Aid
David Quesenberry
06/02/2026
ContractChainValidation.test.mjs
*/
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
  validateAuditEventContract,
} from "../../../src/shared/contracts/auditEventContract.js";
import {
  validateBackupSnapshotContract,
} from "../../../src/shared/contracts/backupSnapshotContract.js";
import {
  validateCollaborationRoleContract,
} from "../../../src/shared/contracts/collaborationRoleContract.js";
import {
  validateCreatorProfileContract,
} from "../../../src/shared/contracts/creatorProfileContract.js";
import {
  validateDownloadGrantContract,
} from "../../../src/shared/contracts/downloadGrantContract.js";
import {
  validateEntitlementContract,
} from "../../../src/shared/contracts/entitlementContract.js";
import {
  validateInstallReceiptContract,
} from "../../../src/shared/contracts/installReceiptContract.js";
import {
  validateLibraryItemContract,
} from "../../../src/shared/contracts/libraryItemContract.js";
import {
  validateMarketplaceListingContract,
} from "../../../src/shared/contracts/marketplaceListingContract.js";
import {
  validateMarketplaceTransactionBoundaryContract,
} from "../../../src/shared/contracts/marketplaceTransactionBoundaryContract.js";
import {
  validateMigrationPlanContract,
} from "../../../src/shared/contracts/migrationPlanContract.js";
import {
  validateModerationQueueContract,
} from "../../../src/shared/contracts/moderationQueueContract.js";
import {
  validateNotificationContract,
} from "../../../src/shared/contracts/notificationContract.js";
import {
  validateOrganizationContract,
} from "../../../src/shared/contracts/organizationContract.js";
import {
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  validatePublishContract,
} from "../../../src/shared/contracts/publishContract.js";
import {
  validateReleaseContract,
} from "../../../src/shared/contracts/releaseContract.js";
import {
  validateRestoreSnapshotContract,
} from "../../../src/shared/contracts/restoreSnapshotContract.js";
import {
  validateReviewRatingContract,
} from "../../../src/shared/contracts/reviewRatingContract.js";
import {
  validateUpdateChannelContract,
} from "../../../src/shared/contracts/updateChannelContract.js";
import {
  validateVersionCompatibilityContract,
} from "../../../src/shared/contracts/versionCompatibilityContract.js";

export function run() {
  const chain = buildContractChain();
  const validationResults = [
    ["Project", validateProjectContract(chain.project)],
    ["Release", validateReleaseContract(chain.release)],
    ["Publish", validatePublishContract(chain.publish)],
    ["MarketplaceListing", validateMarketplaceListingContract(chain.marketplaceListing)],
    ["Entitlement", validateEntitlementContract(chain.entitlement)],
    ["DownloadGrant", validateDownloadGrantContract(chain.downloadGrant, { now: "2026-06-02T18:00:00.000Z" })],
    ["LibraryItem", validateLibraryItemContract(chain.libraryItem)],
    ["InstallReceipt", validateInstallReceiptContract(chain.installReceipt)],
    ["UpdateChannel", validateUpdateChannelContract(chain.updateChannel)],
    ["VersionCompatibility", validateVersionCompatibilityContract(chain.versionCompatibility)],
    ["MigrationPlan", validateMigrationPlanContract(chain.migrationPlan)],
    ["BackupSnapshot", validateBackupSnapshotContract(chain.backupSnapshot)],
    ["RestoreSnapshot", validateRestoreSnapshotContract(chain.restoreSnapshot)],
    ["CreatorProfile", validateCreatorProfileContract(chain.creatorProfile)],
    ["Organization", validateOrganizationContract(chain.organization)],
    ["CollaborationRole", validateCollaborationRoleContract(chain.collaborationRole)],
    ["ReviewRating", validateReviewRatingContract(chain.reviewRating)],
    ["ModerationQueue", validateModerationQueueContract(chain.moderationQueue)],
    ["AuditEvent", validateAuditEventContract(chain.auditEvent)],
    ["Notification", validateNotificationContract(chain.notification)],
    ["MarketplaceTransactionBoundary", validateMarketplaceTransactionBoundaryContract(chain.marketplaceTransactionBoundary)],
  ];

  for (const [label, validation] of validationResults) {
    assert.equal(validation.valid, true, `${label}: ${JSON.stringify(validation.errors)}`);
    assert.deepEqual(validation.errors, [], label);
  }

  assert.equal(chain.release.projectId, chain.project.id);
  assert.equal(chain.publish.sourceRelease.releaseId, chain.release.releaseId);
  assert.equal(chain.marketplaceListing.sourceRelease.releaseId, chain.release.releaseId);
  assert.equal(chain.marketplaceListing.sourcePublish.publishId, chain.publish.publishId);
  assert.equal(chain.entitlement.marketplaceListing.listingId, chain.marketplaceListing.listingId);
  assert.equal(chain.downloadGrant.entitlement.entitlementId, chain.entitlement.entitlementId);
  assert.equal(chain.libraryItem.entitlement.entitlementId, chain.entitlement.entitlementId);
  assert.equal(chain.installReceipt.libraryItem.libraryItemId, chain.libraryItem.libraryItemId);
  assert.equal(chain.updateChannel.libraryItem.libraryItemId, chain.libraryItem.libraryItemId);
  assert.equal(chain.versionCompatibility.updateChannel.updateChannelId, chain.updateChannel.updateChannelId);
  assert.equal(chain.migrationPlan.versionCompatibility.versionCompatibilityId, chain.versionCompatibility.versionCompatibilityId);
  assert.equal(chain.backupSnapshot.migrationPlan.migrationPlanId, chain.migrationPlan.migrationPlanId);
  assert.equal(chain.restoreSnapshot.backupSnapshot.backupSnapshotId, chain.backupSnapshot.backupSnapshotId);
  assert.equal(chain.collaborationRole.projectId, chain.project.id);
  assert.equal(chain.reviewRating.marketplaceListing.listingId, chain.marketplaceListing.listingId);
  assert.equal(chain.moderationQueue.subjectId, chain.reviewRating.reviewRatingId);
  assert.equal(chain.auditEvent.targetId, chain.restoreSnapshot.restoreSnapshotId);
  assert.equal(chain.notification.recipientId, chain.entitlement.ownerId);
  assert.equal(chain.marketplaceTransactionBoundary.entitlement.entitlementId, chain.entitlement.entitlementId);
}

function buildContractChain() {
  const creatorId = "user.creator";
  const buyerId = "user.buyer";
  const projectId = "project.game.alpha";
  const releaseId = "release.game.alpha.2";
  const publishId = "publish.game.alpha.2";
  const listingId = "listing.game.alpha.2";
  const entitlementId = "entitlement.alpha.owner.2";
  const libraryItemId = "library-item.alpha.available.2";
  const installReceiptId = "install-receipt.alpha.installed.2";

  const project = {
    id: projectId,
    ownerId: creatorId,
    projectType: "game",
    state: "marketplace",
    visibility: "public",
  };
  const release = {
    releaseId,
    ownerId: creatorId,
    projectId,
    sourceManifest: {
      manifestId: "manifest.game.alpha",
      version: 2,
      exportFormat: "game-manifest-json",
    },
    version: 2,
    status: "published",
    visibility: "public",
    publishedAt: "2026-06-02T14:00:00.000Z",
    releaseNotes: "Release linked by contract chain validation.",
  };
  const publish = {
    publishId,
    ownerId: creatorId,
    projectId,
    sourceRelease: {
      releaseId,
      version: release.version,
      status: release.status,
    },
    visibility: "public",
    status: "published",
    publishedAt: "2026-06-02T15:00:00.000Z",
    publishNotes: "Publish linked by contract chain validation.",
  };
  const marketplaceListing = {
    listingId,
    ownerId: creatorId,
    projectId,
    sourceRelease: {
      releaseId,
      version: release.version,
      status: release.status,
    },
    sourcePublish: {
      publishId,
      releaseId,
      status: publish.status,
    },
    visibility: "marketplace",
    status: "listed",
    listedAt: "2026-06-02T16:00:00.000Z",
    listingTitle: "Alpha Quest",
    listingSummary: "Marketplace listing linked by contract chain validation.",
  };
  const marketplaceListingReference = {
    listingId,
    projectId,
    releaseId,
    publishId,
    status: marketplaceListing.status,
  };
  const sourceRelease = {
    releaseId,
    version: release.version,
    status: release.status,
  };
  const sourceReleaseWithProject = {
    ...sourceRelease,
    projectId,
  };
  const sourcePublish = {
    publishId,
    releaseId,
    status: publish.status,
  };
  const sourcePublishWithProject = {
    ...sourcePublish,
    projectId,
  };
  const entitlementReference = {
    entitlementId,
    ownerId: buyerId,
    projectId,
    listingId,
    releaseId,
    publishId,
    entitlementType: "owned",
  };
  const entitlement = {
    ...entitlementReference,
    marketplaceListing: marketplaceListingReference,
    sourceRelease,
    sourcePublish,
    grantedAt: "2026-06-02T17:00:00.000Z",
    entitlementNotes: "Entitlement linked by contract chain validation.",
  };
  const downloadGrant = {
    downloadGrantId: "download-grant.alpha.active.2",
    ownerId: buyerId,
    projectId,
    entitlement: entitlementReference,
    marketplaceListing: marketplaceListingReference,
    sourceRelease,
    sourcePublish,
    grantStatus: "active",
    grantedAt: "2026-06-02T17:05:00.000Z",
    expiresAt: "2026-12-31T23:59:59.000Z",
    grantNotes: "Download grant linked by contract chain validation.",
  };
  const libraryItem = {
    libraryItemId,
    ownerId: buyerId,
    projectId,
    entitlement: entitlementReference,
    marketplaceListing: marketplaceListingReference,
    sourceRelease,
    sourcePublish,
    libraryStatus: "available",
    addedAt: "2026-06-02T18:15:00.000Z",
    libraryNotes: "Library item linked by contract chain validation.",
  };
  const libraryItemReference = {
    libraryItemId,
    ownerId: buyerId,
    projectId,
    entitlementId,
    listingId,
    releaseId,
    publishId,
    libraryStatus: libraryItem.libraryStatus,
  };
  const updateLibraryItemReference = {
    libraryItemId,
    ownerId: buyerId,
    projectId,
    releaseId,
    publishId,
    libraryStatus: libraryItem.libraryStatus,
  };
  const installReceipt = {
    installReceiptId,
    ownerId: buyerId,
    projectId,
    libraryItem: libraryItemReference,
    entitlement: entitlementReference,
    marketplaceListing: marketplaceListingReference,
    sourceRelease,
    sourcePublish,
    receiptStatus: "installed",
    installedAt: "2026-06-02T20:00:00.000Z",
    receiptNotes: "Install receipt linked by contract chain validation.",
  };
  const installReceiptReference = {
    installReceiptId,
    ownerId: buyerId,
    projectId,
    libraryItemId,
    releaseId,
    publishId,
    receiptStatus: installReceipt.receiptStatus,
  };
  const updateChannel = {
    updateChannelId: "update-channel.alpha.stable",
    ownerId: buyerId,
    projectId,
    channelType: "stable",
    assignedRelease: sourceReleaseWithProject,
    assignedPublish: sourcePublishWithProject,
    libraryItem: updateLibraryItemReference,
    installReceipt: installReceiptReference,
    assignedAt: "2026-06-02T22:00:00.000Z",
    promotesFrom: "beta",
    promotedAt: "2026-06-02T22:05:00.000Z",
    channelNotes: "Update channel linked by contract chain validation.",
  };
  const updateChannelReference = {
    updateChannelId: updateChannel.updateChannelId,
    ownerId: buyerId,
    projectId,
    channelType: updateChannel.channelType,
    releaseId,
    publishId,
  };
  const versionCompatibility = {
    versionCompatibilityId: "version-compatibility.alpha.compatible",
    ownerId: buyerId,
    projectId,
    sourceRelease: sourceReleaseWithProject,
    sourcePublish: sourcePublishWithProject,
    updateChannel: updateChannelReference,
    libraryItem: updateLibraryItemReference,
    installReceipt: installReceiptReference,
    minimumVersion: 1,
    maximumVersion: 3,
    targetVersion: release.version,
    supportedSchemaVersion: 1,
    compatibilityState: "compatible",
    evaluatedAt: "2026-06-02T23:00:00.000Z",
    compatibilityNotes: "Version compatibility linked by contract chain validation.",
  };
  const versionCompatibilityReference = {
    versionCompatibilityId: versionCompatibility.versionCompatibilityId,
    ownerId: buyerId,
    projectId,
    releaseId,
    publishId,
    targetVersion: versionCompatibility.targetVersion,
    supportedSchemaVersion: versionCompatibility.supportedSchemaVersion,
    compatibilityState: versionCompatibility.compatibilityState,
  };
  const migrationPlan = {
    migrationPlanId: "migration-plan.alpha.required",
    ownerId: buyerId,
    projectId,
    targetRelease: sourceReleaseWithProject,
    versionCompatibility: versionCompatibilityReference,
    updateChannel: updateChannelReference,
    libraryItem: updateLibraryItemReference,
    installReceipt: installReceiptReference,
    sourceVersion: 1,
    targetVersion: release.version,
    schemaVersion: 1,
    migrationState: "required",
    plannedAt: "2026-06-02T23:30:00.000Z",
    migrationNotes: "Migration plan linked by contract chain validation.",
  };
  const migrationPlanReference = {
    migrationPlanId: migrationPlan.migrationPlanId,
    ownerId: buyerId,
    projectId,
    releaseId,
    publishId,
    libraryItemId,
    installReceiptId,
    targetVersion: migrationPlan.targetVersion,
    schemaVersion: migrationPlan.schemaVersion,
    migrationState: migrationPlan.migrationState,
  };
  const backupSnapshot = {
    backupSnapshotId: "backup-snapshot.alpha.2",
    ownerId: buyerId,
    projectId,
    sourceRelease: sourceReleaseWithProject,
    sourcePublish: sourcePublishWithProject,
    libraryItem: updateLibraryItemReference,
    installReceipt: installReceiptReference,
    migrationPlan: migrationPlanReference,
    snapshotVersion: release.version,
    schemaVersion: migrationPlan.schemaVersion,
    createdAt: "2026-06-02T23:50:00.000Z",
    backupNotes: "Backup snapshot linked by contract chain validation.",
  };
  const backupSnapshotReference = {
    backupSnapshotId: backupSnapshot.backupSnapshotId,
    ownerId: buyerId,
    projectId,
    releaseId,
    publishId,
    snapshotVersion: backupSnapshot.snapshotVersion,
    schemaVersion: backupSnapshot.schemaVersion,
  };
  const restoreSnapshot = {
    restoreSnapshotId: "restore-snapshot.alpha.2",
    ownerId: buyerId,
    projectId,
    backupSnapshot: backupSnapshotReference,
    targetRelease: sourceReleaseWithProject,
    versionCompatibility: versionCompatibilityReference,
    restoredAt: "2026-06-02T23:55:00.000Z",
    restoreNotes: "Restore snapshot linked by contract chain validation.",
  };
  const creatorProfile = {
    creatorProfileId: "creator-profile.user.creator",
    ownerId: creatorId,
    displayName: "Ari Creator",
    handle: "ari-creator",
    visibility: "public",
    profileStatus: "active",
    createdAt: "2026-06-02T15:10:00.000Z",
    profileNotes: "Creator profile linked by contract chain validation.",
  };
  const organization = {
    organizationId: "organization.foundry-team",
    ownerId: creatorId,
    displayName: "Foundry Team",
    handle: "foundry-team",
    visibility: "public",
    organizationStatus: "active",
    createdAt: "2026-06-02T15:15:00.000Z",
    organizationNotes: "Organization linked by contract chain validation.",
  };
  const collaborationRole = {
    collaborationRoleId: "collaboration-role.project.alpha.collaborator",
    ownerId: creatorId,
    projectId,
    subjectType: "creatorProfile",
    subjectId: "creator-profile.user.collaborator",
    role: "collaborator",
    permissions: ["view", "edit"],
    visibility: "project",
    grantedAt: "2026-06-02T15:20:00.000Z",
    roleNotes: "Collaboration role linked by contract chain validation.",
  };
  const reviewRating = {
    reviewRatingId: "review-rating.alpha.2",
    ownerId: buyerId,
    projectId,
    marketplaceListing: marketplaceListingReference,
    rating: 5,
    reviewText: "Validated chain listing.",
    visibility: "marketplace",
    reviewStatus: "active",
    createdAt: "2026-06-02T18:45:00.000Z",
    reviewNotes: "Review rating linked by contract chain validation.",
  };
  const moderationQueue = {
    moderationQueueId: "moderation-queue.review.alpha.2",
    ownerId: "platform.moderation",
    projectId,
    subjectType: "reviewRating",
    subjectId: reviewRating.reviewRatingId,
    reportReason: "chain-validation-review",
    queueStatus: "open",
    visibility: "admin-only",
    createdAt: "2026-06-02T19:10:00.000Z",
    moderationNotes: "Moderation queue linked by contract chain validation.",
  };
  const auditEvent = {
    auditEventId: "audit-event.restore.alpha.2",
    ownerId: "platform.audit",
    actorId: "platform.admin",
    action: "administer",
    targetType: "restoreSnapshot",
    targetId: restoreSnapshot.restoreSnapshotId,
    severity: "security",
    occurredAt: "2026-06-02T23:56:00.000Z",
    auditNotes: "Audit event linked by contract chain validation.",
  };
  const notification = {
    notificationId: "notification.marketplace.alpha.2",
    ownerId: "platform.notifications",
    recipientId: buyerId,
    notificationType: "marketplace",
    channel: "inApp",
    deliveryStatus: "sent",
    createdAt: "2026-06-02T23:57:00.000Z",
    notificationText: "Marketplace library item is available.",
  };
  const marketplaceTransactionBoundary = {
    marketplaceTransactionBoundaryId: "marketplace-transaction-boundary.alpha.2",
    ownerId: buyerId,
    projectId,
    marketplaceListing: marketplaceListingReference,
    entitlement: entitlementReference,
    sourceRelease,
    sourcePublish,
    boundaryType: "licenseGrant",
    boundaryStatus: "recorded",
    createdAt: "2026-06-02T17:02:00.000Z",
    boundaryNotes: "Marketplace transaction boundary linked by contract chain validation.",
  };

  return {
    project,
    release,
    publish,
    marketplaceListing,
    entitlement,
    downloadGrant,
    libraryItem,
    installReceipt,
    updateChannel,
    versionCompatibility,
    migrationPlan,
    backupSnapshot,
    restoreSnapshot,
    creatorProfile,
    organization,
    collaborationRole,
    reviewRating,
    moderationQueue,
    auditEvent,
    notification,
    marketplaceTransactionBoundary,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}
