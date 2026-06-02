# Library Item Contract Tests Validation

PR: `PR_26152_087-library-item-contract-tests`

## Scope

- Added Library Item contract definition under `src/shared/contracts`.
- Added Library Item fixture scenarios.
- Added Library Item targeted contract test suite.
- Added Library Item contract specification document.
- No database, authentication, payment, CDN, install, file delivery, UI, HTML, CSS, or runtime implementation changes.

## Commands

| Command | Result |
| --- | --- |
| `node --check src/shared/contracts/libraryItemContract.js` | PASS |
| `node --check tests/shared/LibraryItemContract.test.mjs` | PASS |
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

## Contract Coverage

Validated Library Item rules:

- Library Item requires owner.
- Library Item requires project.
- Library Item requires Entitlement linkage.
- Library Item requires Marketplace Listing linkage.
- Library Item requires source Release linkage.
- Library Item requires source Publish linkage.
- `entitlement.ownerId` must match `ownerId`.
- `entitlement.projectId` must match `projectId`.
- `entitlement.listingId` must match `marketplaceListing.listingId`.
- `entitlement.releaseId` must match `sourceRelease.releaseId`.
- `entitlement.publishId` must match `sourcePublish.publishId`.
- `marketplaceListing.projectId` must match `projectId`.
- `marketplaceListing.releaseId` must match `sourceRelease.releaseId`.
- `marketplaceListing.publishId` must match `sourcePublish.publishId`.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.
- Library status is limited to `available`, `hidden`, `revoked`, and `archived`.
- All Library Items require `addedAt`.
- Hidden Library Items require `hiddenAt`.
- Revoked Library Items require `revokedAt`.
- Archived Library Items require `archivedAt`.
- Library Item access remains owner-private unless platform administration permission applies.

Validated forbidden leakage:

- Payment state rejected.
- Auth session state rejected.
- Runtime state rejected.
- ToolState data rejected.
- File bytes rejected.
- CDN details rejected.
- Install state rejected.

## Samples Decision

SKIP. This PR only changes shared contract definitions, contract fixtures, contract tests, docs/specs, and reports. Samples are not in scope.

## Playwright

Playwright impacted: No. This PR has no UI, runtime, tool behavior, rendering, or page changes.

## Manual Validation

1. Review `docs/dev/specs/LIBRARY_ITEM_CONTRACT.md`.
2. Review `src/shared/contracts/libraryItemContract.js`.
3. Confirm Library Item links to Entitlement, Marketplace Listing, Project, Release, Publish, and owner records.
4. Confirm Library Item does not carry payment, auth session, runtime, toolState, file bytes, CDN details, or install state.
5. Confirm `docs/dev/reports/codex_review.diff` and `docs/dev/reports/codex_changed_files.txt` exist for review.
