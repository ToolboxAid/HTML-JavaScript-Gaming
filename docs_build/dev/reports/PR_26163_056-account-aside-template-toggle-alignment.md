# PR_26163_056-account-aside-template-toggle-alignment

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Created PR scope `PR_26163_056-account-aside-template-toggle-alignment`.
- PASS - Inspected `toolbox/_tool_template-v2/index.html` and current Toolbox left column behavior.
- PASS - Mirrored the Toolbox left column collapse pattern for `account/user-controls.html` through the shared account side-nav partial wiring.
- PASS - Added the missing right-side header toggle button beside the Account left-column heading.
- PASS - Toggle collapses and expands the Account left column using the existing `horizontal-accordion-toggle`, `is-collapsed`, and `is-left-collapsed` class pattern.
- PASS - Account Pages and Account Guidance remain stacked top/bottom in one vertical accordion stack.
- PASS - Center column uses the remaining available width when the left column is expanded and when collapsed.
- PASS - Existing Theme V2/tool accordion classes and shared partial behavior are reused.
- PASS - No new accordion system was created.
- PASS - No page-local CSS or inline styles were added.

## Changed Files

- `assets/theme-v2/css/layout.css`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_056-account-aside-template-toggle-alignment.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Notes

- `toolbox/_tool_template-v2/index.html` uses `tool-workspace`, `tool-column`, `tool-column-header`, and `accordion-stack` for side columns.
- Toolbox collapse behavior is injected by `assets/theme-v2/js/tool-display-mode.js` with `horizontal-accordion-toggle`, `is-collapsed`, and workspace `is-left-collapsed` classes.
- Account pages do not host ToolDisplayMode, so the account side-nav partial is wired by `assets/theme-v2/js/gamefoundry-partials.js` using the same toggle class names, aria states, text indicators, and collapse classes.
- `assets/theme-v2/css/layout.css` now includes `.account-panel.is-left-collapsed` so the account center card expands into the available space when the Account side column collapses.
- The existing `assets/theme-v2/partials/account-side-nav.html` stacked left-column structure remains the account side-nav source of truth.

## Impacted Lanes

- Account/User Controls layout lane.
- Theme V2 shared partial runtime lane.
- Theme V2 account-panel layout lane.
- Targeted Playwright account navigation lane.
- Workspace V2 validation lane.

## Skipped Lanes

- Full samples smoke: SKIP. This PR does not change samples, sample JSON contracts, game runtime behavior, or sample launch paths; the user explicitly requested not to run full samples smoke.
- Engine lane: SKIP. No engine or input runtime behavior changed.
- Database/auth lane: SKIP. No DB, auth, or account persistence contracts changed.

## Validation Performed

- PASS - Branch check: `git branch --show-current` returned `main`.
- PASS - Syntax check: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Syntax check: `node --check assets/theme-v2/js/gamefoundry-partials.js`.
- PASS - Static patch check: `git diff --check -- assets/theme-v2/js/gamefoundry-partials.js assets/theme-v2/css/layout.css tests/playwright/tools/InputMappingV2Tool.spec.mjs assets/theme-v2/partials/account-side-nav.html`.
- PASS - Targeted Playwright: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Account navigation"` passed 1 test.
- PASS - Workspace V2 validation: `npm run test:workspace-v2` passed 5 tests.
- PASS - Final targeted Playwright rerun generated changed-runtime-JS V8 coverage.

## Playwright Result

- PASS - Account left column mirrors Toolbox template side-column structure.
- PASS - Account left column header includes the right-side collapse/expand toggle button.
- PASS - Toggle collapses and expands the Account left column.
- PASS - Account Pages appears above Account Guidance.
- PASS - Center column fills remaining available width in expanded state.
- PASS - Center column fills remaining available width in collapsed state.

## Coverage

- PASS - Playwright V8 coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- PASS - Changed runtime JS coverage collected for `assets/theme-v2/js/gamefoundry-partials.js`: 63% function coverage, with no low-coverage changed runtime JS warning.

## Search Evidence

- PASS - `rg -n "horizontal-accordion-toggle|is-left-collapsed|tool-column-header|tool-workspace" toolbox/_tool_template-v2/index.html assets/theme-v2/js/tool-display-mode.js assets/theme-v2/css/layout.css assets/theme-v2/css/accordion.css assets/theme-v2/css/panels.css` confirms the existing Toolbox/template collapse class pattern.
- PASS - `rg -n "wireAccountSideNavigationCollapse|accountSideNavCollapse|is-left-collapsed|horizontal-accordion-toggle|tool-column-header|data-account-side-nav-accordion-layout|style=|<style|onclick=" assets/theme-v2/js/gamefoundry-partials.js assets/theme-v2/css/layout.css assets/theme-v2/partials/account-side-nav.html account/user-controls.html tests/playwright/tools/InputMappingV2Tool.spec.mjs` confirms the account wiring uses existing Theme V2 classes and no page-local style or inline handler additions.

## Manual Validation Steps

1. Open `/account/user-controls.html`.
2. Confirm the left Account side column shows the Account heading with a collapse toggle button to the right.
3. Confirm Account Pages appears above Account Guidance in the left accordion stack.
4. Click the Account toggle and confirm the left column collapses.
5. Confirm the User Controls center card fills the remaining available width.
6. Click the Account toggle again and confirm the left column expands.
7. Collapse/reopen Account Pages and Account Guidance to confirm accordion behavior still works.

## Samples Validation Decision

- SKIP - Full samples smoke was not run because this PR is scoped to account layout/partial toggle wiring and shared Theme V2 runtime, with no samples or game runtime changes.

## Completion

- PASS - Every requested item was implemented, validated, and explicitly marked PASS or documented as skipped where applicable.
