# PR_26168_237-admin-ia-cleanup

## Branch Validation
- PASS: current branch verified as `main`.
- Expected branch: `main`.

## Summary
- Removed duplicated storage-connectivity status/actions from `admin/infrastructure.html`.
- Kept Admin ownership clear: Infrastructure is architecture/reference, System Health owns status/connectivity, Operations owns actions.
- Removed obsolete Admin status route aliases for `admin-site-setup`, `admin-environments`, and `admin-game-migration` from the shared route resolver.

## Requirement Checklist
- PASS: Remove/hide obsolete Admin/Owner status pages now replaced by System Health.
- PASS: Verify navigation consistency; Admin menu still exposes Infrastructure, Operations, Platform Settings, System Health, Tool Votes, Users.
- PASS: Remove duplicate health/status ownership from Infrastructure.
- PASS: Keep PR222-236 behavior intact; System Health retains storage connectivity startup/manual actions.
- PASS: No sample JSON or `start_of_day` changes.

## Validation Lane Report
- PASS: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs ... --workers=1 --reporter=line` targeted Admin/IA/System Health/Operations subset, 12/12 combined targeted tests passed.
- PASS: `node --check assets/theme-v2/js/admin-infrastructure.js`.
- PASS: `node --check assets/theme-v2/js/gamefoundry-partials.js`.
- PASS: static HTML guard found no inline scripts/styles/event handlers in touched pages.
- PASS: `npm run validate:browser-env-agnostic`.
- PASS/WARN: Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`; server-side files report advisory WARN when not browser-collected.

## Manual Validation Notes
- Infrastructure still displays only `assets/GFS-Infrastructure v1-3.png`.
- Infrastructure path status remains visible for `/dev/projects/`, `/ist/projects/`, `/uat/projects/`, `/prd/projects/`.
- Storage connectivity controls are visible on Admin System Health only.

## Full Samples Decision
- SKIP: no sample JSON or sample launch/runtime surface was changed.
