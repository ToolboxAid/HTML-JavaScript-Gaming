# PR_26175_CHARLIE_016 Scheduled Health Monitoring

## Scope

Team: Charlie

Purpose: Add the Scheduled Health Monitoring foundation to Admin System Health Phase 2.

## Changes

- Added server-owned `scheduledMonitoring` to the Admin System Health status API.
- Added Scheduled Health Monitoring table for last scheduled run, next scheduled run, duration, recent result, and failures/warnings.
- Returned production-safe Not Configured values because no scheduler contract is implemented.
- Updated API and Playwright System Health tests.

## Architecture Notes

- PASS: Scheduler success is not faked.
- PASS: Not Configured state is explicit and safe.
- PASS: Current environment only.
- PASS: Browser renders API-owned state only.
- PASS: No cross-environment checks were added.

## Artifact

- `tmp/PR_26175_CHARLIE_016-scheduled-health-monitoring_delta.zip`
