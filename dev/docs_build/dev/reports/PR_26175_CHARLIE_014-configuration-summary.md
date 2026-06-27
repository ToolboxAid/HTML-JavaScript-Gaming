# PR_26175_CHARLIE_014 Configuration Summary

## Scope

Team: Charlie

Purpose: Add a read-only current-environment Configuration Summary to Admin System Health Phase 2.

## Changes

- Added server-owned `configurationSummary` to the Admin System Health status API.
- Added a Configuration Summary table with current environment, hosting model, site URL, API URL, database provider/type, storage provider/folder, and auth provider/status.
- Reused existing URL redaction so credentials are masked before the browser receives display values.
- Updated API and Playwright System Health tests.

## Architecture Notes

- PASS: Summary is read-only.
- PASS: No secrets are exposed.
- PASS: Current environment only.
- PASS: Browser renders API-owned configuration state only.
- PASS: No cross-environment checks were added.

## Artifact

- `tmp/PR_26175_CHARLIE_014-configuration-summary_delta.zip`
