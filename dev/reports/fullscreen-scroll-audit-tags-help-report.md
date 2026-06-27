# PR_26159_052 Fullscreen Scroll, Audit Fallback, And Tags Help Report

## Branch Guard

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is `main` before build | PASS | `git branch --show-current` returned `main`. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before edits and before branch validation. |
| Hard stop if current branch is not `main` | PASS | Branch was `main`; build continued. |
| Fix fullscreen center-column scrollbar overflow globally | PASS | `assets/theme-v2/css/layout.css` now lets the center panel use its assigned grid-row height instead of a full viewport height. |
| Apply fullscreen fix as shared Theme V2/tool shell behavior | PASS | Only shared `layout.css` changed for fullscreen layout; no per-tool fullscreen patch. |
| Center column stays within viewport in fullscreen | PASS | `ToolCenterFullscreenAccordion.spec.mjs` and `ToolDisplayModeNavigation.spec.mjs` assert center bottom is within `window.innerHeight`. |
| Left, center, and right columns scroll inside available viewport area | PASS | Fullscreen Playwright assertions check left/center/right overflow behavior and viewport bounds. |
| No page body overflow required in fullscreen | PASS | Fullscreen Playwright assertions check `body` overflow is hidden and document overflow is within tolerance. |
| Preserve H2/description hidden behavior from PR_26159_051 | PASS | `ToolDisplayModeNavigation.spec.mjs` still asserts center H2/description hide in fullscreen and restore on exit. |
| Investigate seed-only audit fallback startup messages | PASS | Root cause identified in `mock-db-store.js` fallback normalization plus server snapshot rows missing explicit audit fields. |
| Remove silent audit fallback behavior | PASS | Removed `allowSeedAuditFallback`, `seedFallbackContext`, and `seed-only audit fallback` handling from active dev-runtime source. |
| Seed/snapshot records have explicit valid audit ownership | PASS | `palette-source-mock-db.js` now emits audit fields; `mock-api-router.mjs` maps workspace/design/config snapshots with explicit `createdBy`/`updatedBy`. |
| Missing audit ownership fails visibly/actionably | PASS | `AdminDbViewer.spec.mjs` asserts missing audit ownership throws `Add explicit createdBy and updatedBy values...`; invalid persisted audit users still show DB Viewer diagnostics. |
| Fix listed startup warnings | PASS | Listed tables now normalize without fallback warnings: `palette_source_swatches`, `workspace_projects`, `workspace_progress`, `game_design_documents`, `game_configuration_validation_items`, `game_configuration_records`. |
| Add Colors `?` help control beside Tags input | PASS | `toolbox/colors/index.html` adds a Theme V2 `details` help control beside `paletteTagsInput`. |
| Help control shows full `SUGGESTED_TAGS` list | PASS | `colors.js` renders `SUGGESTED_TAGS` into `[data-palette-tags-help-list]`; Playwright asserts 64 suggestions including `UI` and `16-Bit`. |
| Suggested tags are not activated unless selected/added | PASS | Playwright opens help and asserts tag filter count is unchanged before explicit tag input. |
| Preserve typeahead behavior | PASS | Existing typeahead assertion for `Player` still passes in `PaletteToolMockRepository.spec.mjs`. |
| No inline style/script/event handlers added | PASS | `rg --pcre2` scan for inline script/style/event handlers returned no matches in changed active files. |
| No console errors | PASS | Targeted Playwright lanes collect browser console errors and passed. |
| Playwright impacted | PASS | Targeted Colors, Admin DB Viewer, Tool Display Mode, and Tool Center Fullscreen lanes passed. |

## Fallback Root Cause

`src/dev-runtime/persistence/mock-db-store.js` still supported a seed-only fallback path that silently replaced missing or invalid `createdBy`/`updatedBy` values with `forge-bot` when callers passed `allowSeedAuditFallback`. Server snapshot adapters in `src/dev-runtime/server/mock-api-router.mjs` were using that option because several translated tool tables did not provide explicit audit fields.

The noisy startup warnings were the visible symptom:

- `palette_source_swatches createdBy/updatedBy`: palette source seed rows lacked audit ownership before DB normalization.
- `workspace_projects createdBy/updatedBy`: workspace snapshot rows were mapped from project repository records without audit ownership.
- `workspace_progress createdBy/updatedBy`: generated progress snapshot row lacked audit ownership.
- `game_design_documents createdBy/updatedBy`: game design document snapshots relied on fallback ownership.
- `game_configuration_validation_items createdBy/updatedBy`: generated validation rows lacked audit ownership.
- `game_configuration_records createdBy/updatedBy`: configuration snapshot rows relied on fallback ownership.

Fixes:

- Removed the fallback branch from `normalizeUserKey` so missing audit ownership throws an actionable error.
- Removed fallback options from seed and server snapshot normalization.
- Added explicit forge-bot audit fields to palette source seed rows.
- Added explicit user/forge-bot ownership when server snapshots translate workspace, game design, game configuration, and invalid palette source diagnostic rows.

## Validation Evidence

| Lane | Status | Evidence |
| --- | --- | --- |
| Changed JS syntax | PASS | `node --check` passed for changed runtime/test JS files. |
| Audit smoke | PASS | Node API/repository smoke printed `audit-smoke-pass`; no `seed-only audit fallback` output. |
| Fullscreen tool shell | PASS | `npx playwright test tests/playwright/tools/ToolCenterFullscreenAccordion.spec.mjs tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs` -> 6 passed. |
| Colors runtime/tags | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs -g "Colors adds\|Palette Tool batch tags"` -> 2 passed. |
| DB Viewer audit normalization | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs -g "Local Mem DB audit normalization\|Palette and Asset raw Local Mem DB tables"` -> 2 passed. |
| DB Viewer live Local Mem snapshot | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs -g "Admin DB Viewer shows current read-only Local Mem"` -> 1 passed. |
| DB Viewer invalid audit diagnostic | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs -g "invalid persisted audit users"` -> 1 passed. |
| Combined impacted Playwright pass | PASS | `npx playwright test tests/playwright/tools/ToolCenterFullscreenAccordion.spec.mjs tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs tests/playwright/tools/PaletteToolMockRepository.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs` -> 22 passed. |
| Playwright V8 coverage | PASS | `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes `toolbox/colors/colors.js` at 86%; dev-runtime server files are server-side and reported as advisory browser coverage warnings. |
| Static fallback string check | PASS | `rg` for `seed-only audit fallback`, `allowSeedAuditFallback`, and `seedFallbackContext` returned no matches in active source/tests. |
| Static inline check | PASS | `rg --pcre2` inline script/style/event handler scan returned no matches in changed active files. |
| Diff whitespace | PASS | `git diff --check` passed with line-ending warnings only. |

## Skipped Lanes

- Full samples validation: skipped per request.
- Broad repo-wide Playwright: skipped because this PR touched shared tool fullscreen CSS, Colors tag UI, and dev-runtime audit normalization; targeted lanes covered those exact surfaces.
