# Download Grant Contract Tests Validation

PR: `PR_26152_086-download-grant-contract-tests`

## Scope

- Added Download Grant contract definition under `src/shared/contracts`.
- Added Download Grant fixture scenarios.
- Added Download Grant targeted contract test suite.
- Added Download Grant contract specification document.
- No database, authentication, payment, CDN, storage, file delivery, UI, HTML, CSS, or runtime implementation changes.

## Commands

| Command | Result |
| --- | --- |
| `node --check src/shared/contracts/downloadGrantContract.js` | PASS |
| `node --check tests/shared/DownloadGrantContract.test.mjs` | PASS |
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

Validated Download Grant rules:

- Download Grant requires owner.
- Download Grant requires project.
- Download Grant requires Entitlement linkage.
- Download Grant requires Marketplace Listing linkage.
- Download Grant requires source Release linkage.
- Download Grant requires source Publish linkage.
- `entitlement.ownerId` must match `ownerId`.
- `entitlement.projectId` must match `projectId`.
- `entitlement.listingId` must match `marketplaceListing.listingId`.
- `entitlement.releaseId` must match `sourceRelease.releaseId`.
- `entitlement.publishId` must match `sourcePublish.publishId`.
- `marketplaceListing.projectId` must match `projectId`.
- `marketplaceListing.releaseId` must match `sourceRelease.releaseId`.
- `marketplaceListing.publishId` must match `sourcePublish.publishId`.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.
- Grant status is limited to `active`, `expired`, `revoked`, and `consumed`.
- Active grants require future `expiresAt`.
- Expired grants require expired `expiresAt`.
- Revoked grants require `revokedAt`.
- Consumed grants require `consumedAt`.
- Download Grant access remains owner-private unless platform administration permission applies.

Validated forbidden leakage:

- Payment state rejected.
- Auth session state rejected.
- Runtime state rejected.
- ToolState data rejected.
- File bytes rejected.
- CDN implementation details rejected.
- Storage implementation details rejected.

## Samples Decision

SKIP. This PR only changes shared contract definitions, contract fixtures, contract tests, docs/specs, and reports. Samples are not in scope.

## Playwright

Playwright impacted: No. This PR has no UI, runtime, tool behavior, rendering, or page changes.

## Manual Validation

1. Review `docs/dev/specs/DOWNLOAD_GRANT_CONTRACT.md`.
2. Review `src/shared/contracts/downloadGrantContract.js`.
3. Confirm Download Grant links to Entitlement, Marketplace Listing, owner, Project, Release, and Publish records.
4. Confirm Download Grant does not carry payment, auth session, runtime, toolState, file bytes, CDN implementation, or storage implementation state.
5. Confirm `docs/dev/reports/codex_review.diff` and `docs/dev/reports/codex_changed_files.txt` exist for review.
## Lanes Executed

- contract - targeted shared contract validation for this report's contract surface.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no handoff behavior changed.
- engine - no engine code changed.
- samples - no sample JSON or sample runtime changed.
- recovery/UAT - no Workspace V2 runtime behavior changed.

## Samples Decision

SKIP because contract validation reports do not touch samples or sample fixtures.

## Playwright

Playwright impacted: No

No Playwright impact. This report covers contract validation evidence only.

## Blocker Scope

Targeted contract lane validation only.

## Manual Validation

- Confirm the report remains scoped to contract validation evidence.
- Confirm no runtime, UI, CSS, HTML, JavaScript, storage, auth, payment, installer, downloader, or sample behavior changed.

## Expected PASS Behavior

The targeted contract validation command for this report passes.

## Expected WARN Behavior

Warnings are limited to skipped non-contract lanes or unrelated pre-existing repository state.
