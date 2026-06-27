# PR_26175_BRAVO_011 Idea Board Guest Save Auth Redirect

Date: 2026-06-24

## Scope

Require an authenticated API session before Idea Board save or persist actions. Guests may still browse the Idea Board, expand rows, and inspect notes. Guests are redirected to `account/sign-in.html` before any save/persist mutation.

## Review Findings

- PASS: ProjectInstructions and governance documents were reviewed before implementation.
- PASS: Initial branch was `main`, worktree was clean, and `main`/`origin/main` were synced at `dd7a3732e4225e42fe1033d37090abe179e6d5a5` before the PR branch was created.
- PASS: `toolbox/idea-board/index.html` delegates runtime behavior to `assets/toolbox/idea-board/js/index.js`.
- PASS: Existing auth/session helper is `getSessionCurrent()` from `src/api/session-api-client.js`, backed by the API session contract.
- PASS: Existing sign-in route pattern uses `account/sign-in.html`.
- PASS: Persisting Idea Board actions identified: idea save, idea delete, note save, note delete, create project, archive, and restore.
- PASS: Browse-only actions identified: loading the board, expanding/collapsing notes, filtering, starting/canceling edit rows, and opening existing project links.

## Implementation Summary

- Added one shared Idea Board write guard, `requireAuthenticatedWrite(root)`, using the existing API session helper.
- Applied the guard before every Idea Board mutation/write path: idea save, note save, idea delete, note delete, create project, archive, and restore.
- Preserved guest browsing by leaving load, filter, expand/collapse, and non-persist UI actions unauthenticated.
- Expanded Playwright coverage so guest add/edit/delete idea, add/edit/delete note, create project, archive, and restore actions redirect to sign-in before writes.
- Kept the implementation on the existing API contract; no browser product-data SSoT, fake login, localStorage/sessionStorage product data, or environment-specific branch was introduced.

## Affected Files

- `assets/toolbox/idea-board/js/index.js`
- `tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## Validation Summary

- PASS: Targeted node guardrail passed.
- PASS: Runtime grep found no `localStorage` or `sessionStorage` use in Idea Board runtime HTML/JS.
- PASS: Runtime grep found no inline script/style/event-handler additions in Idea Board runtime HTML/JS.
- PASS: Focused Playwright guest redirect test passed.
- PASS: Focused Playwright Toolbox-to-Idea-Board launch test passed after filtering unrelated selected-game status polling from the no-write assertion.
- PASS: Playwright V8 coverage report includes `assets/toolbox/idea-board/js/index.js`.
- WARN: Bundled Playwright Chromium was missing and `npx playwright install chromium` stalled with a partial install; focused browser validation used installed Google Chrome through a temporary config that was removed after validation.
- WARN: Full legacy Playwright files still have unrelated expectation drift documented in the validation lane report.

## Recommended Next PR

Create a follow-up validation cleanup PR for existing Toolbox/Game Hub drift:

- Refresh `ToolboxRoutePages` expected tool counts, Game Hub route alias expectations, failed module-load assertions, and local dev port guard expectation.
- Refresh or repair the Game Hub expanded child-row summary expectation in `IdeaBoardTableNotes`.
