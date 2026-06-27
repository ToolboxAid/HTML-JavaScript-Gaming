# PR_26164_093-sign-in-route-cleanup

## Branch Validation

PASS: current branch is `main`.

## Scope Summary

PASS: Scoped to sign-in route cleanup, active sign-in/account link updates, targeted tests, and required reports.

## Sign-In Route Reference Audit

PASS: `/login.html` existed before the cleanup and was removed.

PASS: The real active sign-in route is now `account/sign-in.html`.

Updated active route/link references:

- Moved `login.html` to `account/sign-in.html`.
- Updated shared route map from the old login route to `sign-in`.
- Updated header logout links to `data-route="sign-in"` and `account/sign-in.html`.
- Updated local API guidance from `http://127.0.0.1:5501/login.html` to `http://127.0.0.1:5501/account/sign-in.html`.
- Updated Assets guest prompt Sign In and Account links to resolve from `toolbox/assets/index.html`.
- Updated targeted Playwright references to the new sign-in path.

PASS: Active source/page/test scan found no `login.html` or `/login.html` references outside historical report/archive folders.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution | PASS | Project instructions were read before implementation. |
| Verify current branch is `main` before changes | PASS | `git branch --show-current` returned `main`. |
| Confirm `/login.html` no longer exists | PASS | `login.html` was removed; `account/sign-in.html` exists. |
| Find references to login/sign-in/auth/account entry routes | PASS | Active source/page/test roots were scanned and updated where applicable. |
| Update sign-in links/routes to current real sign-in page/path | PASS | Active sign-in route is `account/sign-in.html`; updated route map, header partials, local server output, tests, and Assets prompt. |
| Do not recreate `login.html` | PASS | No root `login.html` file remains. |
| Do not reintroduce fake login | PASS | No new fake auth mechanism was added; existing Local DB session selection moved to the Sign In route. |
| Do not reintroduce MEM DB | PASS | Diff audit found no added MEM DB/local-mem references. |
| Keep scope limited | PASS | Changes are sign-in route cleanup, copy/link alignment, targeted tests, and reports. |
| Validate updated links resolve | PASS | `account/sign-in.html` and `account/index.html` targets exist. |
| Validate no inline script/style/event handlers added | PASS | Changed HTML scan passed. |

## Validation Lane Report

Playwright impacted: Yes. Navigation/runtime JS and route tests changed.

Validation commands:

- PASS: `git diff --check`
- PASS: targeted JS syntax checks with `node --check`
- PASS: changed HTML inline script/style/event-handler audit
- PASS: updated sign-in/account link target audit
- PASS: `login.html` absence audit
- PASS: active `/login.html` reference audit
- PASS: MEM DB/local-mem added-line audit
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs --reporter=list --workers=1` -> 9 passed
- PASS: `npx playwright test tests/playwright/tools/RootToolsFutureState.spec.mjs -g "navigation" --reporter=list --workers=1` -> 1 passed
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs -g "Assets guest upload action shows account prompt" --reporter=list --workers=1` -> 1 passed
- PASS: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox index shows wireframe" --reporter=list --workers=1` -> 1 passed

Additional targeted command:

- FAIL: `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` has unrelated pre-existing failures for missing `docs_build/dev/admin-notes/README.md`, local Admin Notes menu assertions, and Admin menu expectations. The sign-in assertion in that file was updated, but this command is not a reliable route-cleanup validator in the current repo state.

## Manual Validation Notes

- Confirmed root `login.html` was removed.
- Confirmed `account/sign-in.html` is not blocked by the Account protected-page guard.
- Confirmed the Sign In page uses external scripts/styles only.
- Confirmed the Assets guest prompt Sign In target resolves to `../../account/sign-in.html`.
- Historical reports/archive references were not rewritten because they are immutable validation history, not active routes.
