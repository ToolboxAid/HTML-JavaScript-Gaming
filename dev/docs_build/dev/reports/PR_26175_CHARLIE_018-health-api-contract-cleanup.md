# PR_26175_CHARLIE_018 Health API Contract Cleanup

## Scope

Team: Charlie

Purpose: Add explicit Admin System Health API contract metadata and UI visibility.

## Changes

- Added server-owned `apiContract` to `/api/admin/system-health/status`.
- Added contract version, data boundary, current-deployment-only rule, reference-only Environment Map rule, secret handling rule, and endpoint registry.
- Added Health API Contract table to `admin/system-health.html`.
- Updated API and Playwright tests.

## Validation

- PASS: Targeted System Health API/unit tests.
- PASS: Targeted System Health Playwright tests.
- PASS: Syntax checks.
- PASS: `git diff --check`.

## Artifact

- `tmp/PR_26175_CHARLIE_018-health-api-contract-cleanup_delta.zip`
