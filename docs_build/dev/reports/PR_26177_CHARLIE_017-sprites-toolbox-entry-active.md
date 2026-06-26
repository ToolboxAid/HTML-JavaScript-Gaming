# PR_26177_CHARLIE_017-sprites-toolbox-entry-active

## Summary

Team Charlie activated the Sprites entry on the Toolbox landing page.

This PR keeps the change scoped to Toolbox entry state and targeted coverage:

- Sprites now publishes the source-controlled Toolbox release channel as `wireframe`.
- The Local API Toolbox metadata sync now treats Sprites as source-controlled so the API-backed landing page receives the active state.
- Toolbox landing coverage verifies Sprites is visible, not planned, and links to `/toolbox/sprites/index.html`.
- Toolbox route coverage verifies the Sprites card opens the Sprites route.
- No Sprites API, database, CRUD, import, preview, palette, tags, or reference behavior changed.

## Changed Files

- `src/dev-runtime/server/local-api-router.mjs`
- `src/shared/toolbox/tool-metadata-inventory.js`
- `tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26177_CHARLIE_017-sprites-toolbox-entry-active.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_017-sprites-toolbox-entry-active_branch-validation.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_017-sprites-toolbox-entry-active_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_017-sprites-toolbox-entry-active_requirements-checklist.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_017-sprites-toolbox-entry-active_validation-lane.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Implementation Notes

- `/toolbox/index.html` required no direct markup edit because the landing page renders cards from the API-backed Toolbox registry contract.
- Added `releaseChannel: "wireframe"` to the Sprites registry entry so it is active/clickable while still labeled as a wireframe.
- Added Sprites to the Local API source-controlled Toolbox metadata set so stale persisted metadata rows cannot keep the card in the planned bucket.
- Preserved existing Toolbox card order, routes, Theme V2 rendering, and Sprites route behavior.

## Validation

- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check src/shared/toolbox/tool-metadata-inventory.js`
- PASS: `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- PASS: `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs -g "Toolbox card names link" --workers=1 --reporter=list`
- PASS: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox index|toolbox status kickers|Build Path status" --workers=1 --reporter=list`
- PASS: direct Local API `/api/toolbox/registry/snapshot` probe confirmed Sprites route `toolbox/sprites/index.html` and release channel `wireframe`.
- PASS: `git diff --check`
- PASS: no `start_of_day` files changed.

## Validation Note

- BLOCKED unrelated adjacent check: `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs -g "share the same DB-backed metadata" --workers=1 --reporter=list` fails before Toolbox assertions because `GET /api/local-db/snapshot` returns `Unknown API route`. The failure is outside this PR's Sprites Toolbox entry scope.

## ZIP

- `tmp/PR_26177_CHARLIE_017-sprites-toolbox-entry-active_delta.zip`
