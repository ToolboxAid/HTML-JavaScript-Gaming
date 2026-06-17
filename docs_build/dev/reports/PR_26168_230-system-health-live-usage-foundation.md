# PR_26168_230-system-health-live-usage-foundation

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`

## Summary

Added a service-contract foundation that separates configured limits, current usage, and pressure calculation for future System Health usage reporting.

## Requirement Checklist

- PASS - Configured limits are represented separately from current usage.
- PASS - Current usage is represented separately and may be `NOT AVAILABLE`.
- PASS - Current usage contract can also carry numeric usage when a provider integration supplies it later.
- PASS - Pressure calculation is represented separately from limits and usage.
- PASS - Pressure is calculated only when both a configured numeric limit and numeric usage exist.
- PASS - Cloudflare billing integration is not required.
- PASS - Provider-specific future integration points are documented in `docs_build/codex/decisions/system-health-usage-reporting.md`.
- PASS - PR222-228 behavior remains intact.

## Validation Lane Report

PASS

- `node --check src/dev-runtime/server/local-api-router.mjs`
- `node --check assets/theme-v2/js/admin-system-health.js`
- `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- Static System Health contract validation for `configuredLimit`, `currentUsage`, and `pressureCalculation` separation.
- Targeted Playwright System Health validation through `AdminPlatformToolsWireframes.spec.mjs`.

## Manual Validation Notes

PASS

- Confirmed the API payload includes separate `configuredLimit`, `currentUsage`, and `pressureCalculation` objects for each limit row.
- Confirmed the documentation names R2 and Local DB future telemetry integration points.
- Confirmed no Cloudflare billing dependency or credential exposure was added.

## Full Samples Decision

SKIP

Full samples smoke was not run because this PR only adds Admin System Health usage-reporting contract structure and documentation. Sample JSON, game samples, and `start_of_day` folders were not touched.

## Artifact Output

PASS

- Repo-structured delta ZIP: `tmp/PR_26168_230-system-health-live-usage-foundation_delta.zip`
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
