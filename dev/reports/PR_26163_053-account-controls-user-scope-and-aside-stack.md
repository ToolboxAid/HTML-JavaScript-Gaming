# PR_26163_053-account-controls-user-scope-and-aside-stack

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Created PR scope `PR_26163_053-account-controls-user-scope-and-aside-stack`.
- PASS - Account side nav accordions now stack top/bottom in one aside column. Evidence: `assets/theme-v2/partials/account-side-nav.html` uses `class="accordion-stack"` and `data-account-side-nav-accordion-layout="stacked"`.
- PASS - Account Pages and Account Guidance stack top/bottom. Evidence: targeted Playwright measures both accordions with matching x-position and Guidance below Pages.
- PASS - User Controls profiles created by one user are not visible or editable by another user. Evidence: targeted Playwright creates User 1 and User 2 profiles, then verifies each user sees only their own profile.
- PASS - Logout clears active user runtime state. Evidence: `account/user-controls-page.js` listens for session user/mode changes, clears capture state, reloads profiles and selected device from the active session, and clears profile UI when signed out.
- PASS - User-control profiles are stored/read by user ownership through database adapter tables. Evidence: `input-mapping-mock-repository.js` filters `player_controller_profiles` and `selected_input_devices` by the active `playerId`.
- PASS - Scope stayed limited to account side-nav layout, account/user-controls profile ownership/session behavior, targeted tests, and required reports.

## Changed Files

- `account/user-controls-page.js`
- `assets/theme-v2/partials/account-side-nav.html`
- `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `src/dev-runtime/server/mock-api-router.mjs`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_053-account-controls-user-scope-and-aside-stack.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Notes

- `account-side-nav.html` now uses the same single-column accordion stack pattern as the working Toolbox side menu pattern.
- `account/user-controls-page.js` reads the current session user, refuses profile persistence when no user is active, clears stale UI state on logout/session changes, and reloads User Controls data for the new active user.
- `input-mapping-mock-repository.js` no longer falls back to User 1 for user-owned controller profile writes. User-owned writes require an active user, while game-owned mapping/custom-action audit fields use the Forge Bot audit user when unauthenticated.
- `mock-api-router.mjs` passes the active session user as a live getter so existing repository instances resolve ownership against the current session.

## Search Evidence

- PASS - `rg -n "left-right|data-account-side-nav-accordion-layout" assets/theme-v2/partials/account-side-nav.html tests/playwright/tools/InputMappingV2Tool.spec.mjs` shows the active account side nav layout as `stacked`, with no active `left-right` account-side-nav partial usage.
- PASS - `rg -n "<style|style=|onclick=|onchange=|oninput=|onsubmit=" assets/theme-v2/partials/account-side-nav.html account/user-controls.html account/user-controls-page.js` returned no matches.
- PASS - `rg -n "Login required to save User Controls profiles|Signed out\\. User Controls profile data cleared" src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js account/user-controls-page.js` confirms signed-out profile writes and stale signed-out UI state are handled explicitly.

## Impacted Lanes

- Account/User Controls runtime lane.
- Account side-nav Theme V2 partial lane.
- Dev-runtime mock DB repository/session ownership lane.
- Targeted Playwright account and controls lane.
- Workspace V2 validation lane.

## Skipped Lanes

- Full samples smoke: SKIP. The PR does not change samples, sample JSON contracts, game runtime behavior, or sample launch paths; the user explicitly requested not to run full samples smoke.
- Engine core lane: SKIP. No `src/engine/input` or runtime engine behavior changed.
- Broad visual regression lane: SKIP. The layout change is isolated to the account side-nav partial and covered by targeted Playwright assertions.

## Validation Performed

- PASS - Branch check: `git branch --show-current` returned `main`.
- PASS - Syntax check: `node --check account/user-controls-page.js`.
- PASS - Syntax check: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`.
- PASS - Syntax check: `node --check src/dev-runtime/server/mock-api-router.mjs`.
- PASS - Syntax check: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Whitespace/static patch check: `git diff --check -- <changed files>`.
- PASS - Targeted Playwright: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls|Account navigation"` passed 3 tests.
- PASS - Workspace V2 validation: `npm run test:workspace-v2` passed 5 tests.
- PASS/WARN - Playwright V8 coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Playwright Result

- PASS - Targeted Account/User Controls and Account Navigation coverage passed.
- PASS - `npm run test:workspace-v2` passed.

## V8 Coverage

- PASS - Browser runtime coverage collected for `account/user-controls-page.js`: 93% function coverage reported.
- WARN - `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js` and `src/dev-runtime/server/mock-api-router.mjs` are Node/dev-runtime files and are not collected by browser V8 coverage. Their behavior is covered by the targeted Playwright/API flow and workspace validation.

## Manual Validation Steps

1. Open `/account/user-controls.html` as User 1.
2. Confirm Account Pages and Account Guidance appear stacked vertically in the side nav.
3. Create a User Controls profile for User 1 and save it.
4. Log out and confirm the User Controls profile UI clears.
5. Log in as User 2 and confirm User 1 profiles are absent.
6. Create a User 2 profile, save it, and switch back to User 1.
7. Confirm User 1 can see/edit only User 1 profiles and User 2 can see/edit only User 2 profiles.

## Samples Validation Decision

- SKIP - Full samples smoke was not run because this PR is scoped to account side-nav layout and User Controls ownership/session behavior, with no samples or game runtime changes.

## Completion

- PASS - Every requested item was implemented, validated, and explicitly marked PASS or documented as a safe skipped lane.
