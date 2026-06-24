# PR_26175_CHARLIE_020 Admin API Registry

## Scope

Team: Charlie

Purpose: Add a read-only Admin API Registry to System Health.

## Changes

- Added server-owned `adminApiRegistry` to the System Health status API.
- Added Admin API Registry table to `admin/system-health.html`.
- Listed System Health, Infrastructure, Operations, and Admin navigation routes used by the admin health surface.
- Updated API and Playwright tests.

## Validation

- PASS: Targeted System Health API/unit tests.
- PASS: Targeted System Health Playwright tests.
- PASS: Syntax checks.
- PASS: `git diff --check`.

## Artifact

- `tmp/PR_26175_CHARLIE_020-admin-api-registry_delta.zip`
