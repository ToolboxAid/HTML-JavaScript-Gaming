# PR_26175_CHARLIE_015 Manual Health Actions

## Scope

Team: Charlie

Purpose: Add manual current-environment health action controls to Admin System Health Phase 2.

## Changes

- Added `/api/admin/system-health/action` for Refresh, Run Runtime Check, Run Database Check, Run Storage Check, and Run Full Health Check.
- Added manual action buttons and an action result table to `admin/system-health.html`.
- Added client API support for manual health actions.
- Updated the controller so action results render only from server responses.
- Updated API and Playwright System Health tests.

## Architecture Notes

- PASS: Actions call API/service contracts.
- PASS: Browser does not fake successful health.
- PASS: Storage action runs bucket connectivity, list, upload, read, and delete through the current deployment API.
- PASS: Current environment only.
- PASS: No cross-environment checks were added.

## Artifact

- `tmp/PR_26175_CHARLIE_015-manual-health-actions_delta.zip`
