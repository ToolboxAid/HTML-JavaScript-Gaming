# Update Channel Contract Tests Validation

PR: `PR_26152_089-update-channel-contract-tests`

## Scope

- Added Update Channel contract definition under `src/shared/contracts`.
- Added Update Channel fixture scenarios.
- Added Update Channel targeted contract test suite.
- Added Update Channel contract specification document.
- No database, authentication, payment, installer, updater, download, UI, HTML, CSS, or runtime implementation changes.

## Commands

| Command | Result |
| --- | --- |
| `node --check src/shared/contracts/updateChannelContract.js` | PASS |
| `node --check tests/shared/UpdateChannelContract.test.mjs` | PASS |
| `node tests/shared/UpdateChannelContract.test.mjs` | PASS |
| `node tests/shared/InstallReceiptContract.test.mjs` | PASS |
| `node tests/shared/LibraryItemContract.test.mjs` | PASS |
| `node tests/shared/DownloadGrantContract.test.mjs` | PASS |
| `node tests/shared/EntitlementContract.test.mjs` | PASS |
| `node tests/shared/MarketplaceListingContract.test.mjs` | PASS |
| `node tests/shared/PublishContract.test.mjs` | PASS |
| `node tests/shared/ReleaseContract.test.mjs` | PASS |
| `node tests/shared/ProjectContract.test.mjs` | PASS |
| `node tests/shared/IdentityPermissionsContract.test.mjs` | PASS |
| `git diff --name-only -- '*.css' '*.html'` | PASS - no CSS or HTML changes |
| `git diff --check` | PASS |
| `npm run codex:review-artifacts` | PASS |

## Contract Coverage

Validated Update Channel rules:

- Update Channel requires owner.
- Update Channel requires project.
- Update Channel requires valid channel type.
- Allowed channel types are `stable`, `beta`, `alpha`, and `preview`.
- Update Channel requires assigned Release.
- Update Channel requires assigned Publish record.
- Update Channel requires Library Item linkage.
- Update Channel requires Install Receipt linkage.
- Update Channel requires `assignedAt`.
- `libraryItem.ownerId` and `installReceipt.ownerId` must match `ownerId`.
- `assignedRelease.projectId`, `assignedPublish.projectId`, `libraryItem.projectId`, and `installReceipt.projectId` must match `projectId`.
- `assignedPublish.releaseId` must match `assignedRelease.releaseId`.
- `libraryItem.releaseId` and `installReceipt.releaseId` must match `assignedRelease.releaseId`.
- `libraryItem.publishId` and `installReceipt.publishId` must match `assignedPublish.publishId`.
- `installReceipt.libraryItemId` must match `libraryItem.libraryItemId`.
- Promotion moves toward the stable channel in the order `preview` -> `alpha` -> `beta` -> `stable`.
- Promotion cannot move backward or target the same channel.
- Promotion requires `promotesFrom` and `promotedAt` together.
- Update Channel access remains owner-private unless platform administration permission applies.

Validated forbidden leakage:

- Payment state rejected.
- Auth session state rejected.
- Runtime state rejected.
- ToolState data rejected.
- Installer state rejected.
- Updater implementation details rejected.
- Download state rejected.

## Samples Decision

SKIP. This PR only changes shared contract definitions, contract fixtures, contract tests, docs/specs, and reports. Samples are not in scope.

## Playwright

Playwright impacted: No. This PR has no UI, runtime, tool behavior, rendering, or page changes.

## Manual Validation

1. Review `docs/dev/specs/UPDATE_CHANNEL_CONTRACT.md`.
2. Review `src/shared/contracts/updateChannelContract.js`.
3. Confirm Update Channel links to Project, Release, Publish, Library Item, Install Receipt, and owner records.
4. Confirm Update Channel promotion only moves from `preview` toward `stable`.
5. Confirm Update Channel does not carry payment, auth session, runtime, toolState, installer, updater, or download state.
6. Confirm `docs/dev/reports/codex_review.diff` and `docs/dev/reports/codex_changed_files.txt` exist for review.
