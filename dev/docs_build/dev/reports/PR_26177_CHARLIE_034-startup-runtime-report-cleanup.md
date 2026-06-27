# PR_26177_CHARLIE_034-startup-runtime-report-cleanup

Team: Charlie
Branch: pr/26177-CHARLIE-034-startup-runtime-report-cleanup
Base: pr/26177-CHARLIE-032-runtime-health-json-endpoints
Lifecycle: Build / Validation
Repair: Rebased onto repaired PR_26177_CHARLIE_032 branch on 2026-06-25.

## Scope
- Polished Local API startup diagnostics with explicit Local API URL, local site URL, local site URL port, database mode, and storage status.
- Kept runtime environment variable output deterministic and alphabetized.
- Confirmed secret-like environment keys containing PASSWORD, SECRET, TOKEN, KEY, SERVICE_ROLE, or JWT remain masked.
- Mirrored the safe diagnostics through the System Health API payload so the browser renders service-owned status.

## Changed Files
- scripts/start-local-api-server.mjs
- src/dev-runtime/server/local-api-router.mjs
- tests/dev-runtime/LocalApiStartupLogging.test.mjs
- tests/dev-runtime/AdminHealthOperations.test.mjs
- tests/api/admin-system-health/contract.test.mjs
- tests/playwright/tools/AdminHealthOperationsPage.spec.mjs
- docs_build/dev/reports/coverage_changed_js_guardrail.txt
- docs_build/dev/reports/playwright_v8_coverage_report.txt

## Validation
- PASS: node --check scripts/start-local-api-server.mjs
- PASS: node --check src/dev-runtime/server/local-api-router.mjs
- PASS: node --test tests/dev-runtime/LocalApiStartupLogging.test.mjs
- PASS: node --test tests/api/admin-system-health/contract.test.mjs
- PASS: node --test tests/dev-runtime/AdminHealthOperations.test.mjs
- PASS: npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs --workers=1 --reporter=line
- PASS: git diff --check

## ZIP
- Generated after repair: C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming\tmp\PR_26177_CHARLIE_034-startup-runtime-report-cleanup_delta.zip
