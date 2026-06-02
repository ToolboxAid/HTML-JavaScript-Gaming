# Entitlement Contract Tests Validation

PR: `PR_26152_085-entitlement-contract-tests`

## Scope

- Added Entitlement contract definition under `src/shared/contracts`.
- Added Entitlement fixture scenarios.
- Added Entitlement targeted contract test suite.
- Added Entitlement contract specification document.
- No database, authentication, payment, download, UI, HTML, CSS, or runtime implementation changes.

## Commands

| Command | Result |
| --- | --- |
| `node --check src/shared/contracts/entitlementContract.js` | PASS |
| `node --check tests/shared/EntitlementContract.test.mjs` | PASS |
| `node tests/shared/EntitlementContract.test.mjs` | PASS |
| `node tests/shared/MarketplaceListingContract.test.mjs` | PASS |
| `node tests/shared/PublishContract.test.mjs` | PASS |
| `node tests/shared/ReleaseContract.test.mjs` | PASS |
| `node tests/shared/ProjectContract.test.mjs` | PASS |
| `node tests/shared/IdentityPermissionsContract.test.mjs` | PASS |
| `git diff --name-only -- '*.css' '*.html'` | PASS - no CSS or HTML changes |
| `git diff --check` | PASS |

## Contract Coverage

Validated Entitlement rules:

- Entitlement requires owner.
- Entitlement requires project.
- Entitlement requires marketplace listing linkage.
- Entitlement requires source Release linkage.
- Entitlement requires source Publish linkage.
- `marketplaceListing.projectId` must match `projectId`.
- `marketplaceListing.releaseId` must match `sourceRelease.releaseId`.
- `marketplaceListing.publishId` must match `sourcePublish.publishId`.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.
- Entitlement types are limited to `owned`, `licensed`, `granted`, and `revoked`.
- Active entitlement types require `grantedAt`.
- Revoked entitlements require `revokedAt`.
- Entitlement access remains owner-private unless platform administration permission applies.

Validated forbidden leakage:

- Payment state rejected.
- Auth session state rejected.
- Runtime state rejected.
- ToolState data rejected.
- Download state rejected.

## Samples Decision

SKIP. This PR only changes shared contract definitions, contract fixtures, contract tests, docs/specs, and reports. Samples are not in scope.

## Playwright

Playwright impacted: No. This PR has no UI, runtime, tool behavior, rendering, or page changes.

## Manual Validation

1. Review `docs/dev/specs/ENTITLEMENT_CONTRACT.md`.
2. Review `src/shared/contracts/entitlementContract.js`.
3. Confirm Entitlement links to Marketplace Listing, Project, Release, and Publish records without carrying payment, auth session, runtime, toolState, or download state.
4. Confirm `docs/dev/reports/codex_review.diff` and `docs/dev/reports/codex_changed_files.txt` exist for review.
