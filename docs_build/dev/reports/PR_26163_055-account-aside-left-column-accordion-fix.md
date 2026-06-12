# PR_26163_055-account-aside-left-column-accordion-fix

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Created PR scope `PR_26163_055-account-aside-left-column-accordion-fix`.
- PASS - Account Pages / Account Guidance accordion is present and visible in the account left column.
- PASS - Aside remains on the left through `.account-panel > .side-menu` Theme V2 layout wiring.
- PASS - Center content column fills the remaining available space beside the left aside through `.account-panel > .card` Theme V2 layout wiring.
- PASS - Account Pages appears above Account Guidance as one stacked vertical accordion column.
- PASS - Existing Theme V2/tool accordion classes are reused: `tool-column`, `tool-column-header`, `accordion-stack`, and `vertical-accordion`.
- PASS - No new accordion system was created.
- PASS - No page-local CSS, inline styles, script blocks, or inline event handlers were added.
- PASS - Scope stayed limited to account side-nav partial/layout wiring, approved Theme V2 layout CSS, targeted tests, and required reports.

## Changed Files

- `assets/theme-v2/css/layout.css`
- `assets/theme-v2/partials/account-side-nav.html`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/PR_26163_055-account-aside-left-column-accordion-fix.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Notes

- `account/user-controls.html` already loads the shared account side-nav with `<div data-partial="account-side-nav" data-partial-replace></div>`.
- The fix was applied to the loaded side-nav partial so Account/User Controls and other account pages receive the same left-column accordion structure.
- `assets/theme-v2/partials/account-side-nav.html` now uses the Toolbox-style left column container pattern: `side-menu tool-column tool-group-platform`, a `tool-column-header`, and a stacked `accordion-stack`.
- `assets/theme-v2/css/layout.css` adds account-panel-specific grid placement so `.side-menu` stays in column 1 and the `.card` center content stays in column 2 on desktop, while preserving the existing mobile single-column stack.
- The layout CSS is needed because a standalone account `<aside>` with `tool-column` otherwise matches both generic `tool-column:first-of-type` and `tool-column:last-of-type` rules.

## Impacted Lanes

- Account/User Controls layout lane.
- Theme V2 account-panel layout lane.
- Targeted Playwright account navigation lane.
- Workspace V2 validation lane.

## Skipped Lanes

- Full samples smoke: SKIP. This PR does not change samples, sample JSON contracts, game runtime behavior, or sample launch paths; the user explicitly requested not to run full samples smoke.
- Engine lane: SKIP. No engine or runtime input behavior changed.
- Runtime JavaScript V8 coverage: SKIP/N/A. No runtime JavaScript files changed in this PR.

## Validation Performed

- PASS - Branch check: `git branch --show-current` returned `main`.
- PASS - Syntax check: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Static patch check: `git diff --check -- assets/theme-v2/partials/account-side-nav.html assets/theme-v2/css/layout.css tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Targeted Playwright: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Account navigation"` passed 1 test.
- PASS - Workspace V2 validation: `npm run test:workspace-v2` passed 5 tests.

## Playwright Result

- PASS - Account side accordion is present.
- PASS - Account side accordion is positioned in the left column.
- PASS - Account Pages appears above Account Guidance.
- PASS - Accordion expand/collapse works.
- PASS - Center column fills the remaining available width beside the left aside.

## Coverage

- PASS/N/A - No runtime JavaScript changed, so no changed-runtime-JS Playwright V8 coverage report was required.

## Search Evidence

- PASS - `rg -n "tool-column|tool-column-header|account-panel>|stacked|left-right|style=|<style|onclick=" assets/theme-v2/css/layout.css assets/theme-v2/partials/account-side-nav.html account/user-controls.html tests/playwright/tools/InputMappingV2Tool.spec.mjs` shows the shared Theme V2 column/accordion classes and no page-local style or inline handler additions.
- PASS - `git diff -- assets/theme-v2/css/layout.css assets/theme-v2/partials/account-side-nav.html tests/playwright/tools/InputMappingV2Tool.spec.mjs` shows only account panel layout, account side-nav partial, and targeted Playwright coverage changes.

## Manual Validation Steps

1. Open `/account/user-controls.html`.
2. Confirm the Account left aside appears to the left of the User Controls content.
3. Confirm the left aside shows the Account header, Account Pages accordion, and Account Guidance accordion.
4. Confirm Account Pages is stacked above Account Guidance.
5. Collapse and reopen Account Pages.
6. Open and close Account Guidance.
7. Confirm the User Controls card fills the remaining width to the right of the aside.

## Samples Validation Decision

- SKIP - Full samples smoke was not run because this PR is scoped to account layout and account side-nav wiring only.

## Completion

- PASS - Every requested item was implemented, validated, and explicitly marked PASS or documented as N/A/skipped where applicable.
