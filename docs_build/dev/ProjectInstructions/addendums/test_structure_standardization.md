# Test Structure Standardization

## Purpose

Standardize testing locations and ensure independent tool validation.

## Canonical Test Structure

Page-level Playwright tests:
- tests/playwright/{runtime-page-path}/index.spec.mjs

Tool tests:
- tests/toolbox/{tool-name}/

Engine tests:
- tests/engine/{feature-name}/

API tests:
- tests/api/{feature-name}/

Server tests:
- tests/server/{feature-name}/

Shared JavaScript tests:
- tests/js/shared/

Regression tests:
- tests/regression/

## Rules

- Every tool must be independently testable.
- Regression tests do not replace tool tests.
- Tool tests validate tool functionality.
- Regression tests validate platform behavior.
- New tests follow the canonical structure.
- Every user-accessible page must have at least one page-level Playwright test.
- Runtime page path determines the page-level Playwright test path.
- Primary page-level Playwright test file should be `index.spec.mjs`.
- Do not organize new page-level Playwright tests only by feature nickname or technology bucket when a page path exists.
- Legacy broad tests may remain while migration is planned; document migration/deprecation instead of moving broad legacy tests unless the PR scope requires it.

## Page-Level Playwright Examples

- `/admin/index.html` -> `tests/playwright/admin/index/index.spec.mjs`
- `/toolbox/sprites/index.html` -> `tests/playwright/toolbox/sprites/index.spec.mjs`
- `/toolbox/game-hub/index.html` -> `tests/playwright/toolbox/game-hub/index.spec.mjs`
- `/toolbox/messages/index.html` -> `tests/playwright/toolbox/messages/index.spec.mjs`
- `/toolbox/game-configuration/index.html` -> `tests/playwright/toolbox/game-configuration/index.spec.mjs`

## Minimum Page-Level Playwright Coverage

Minimum page-level test:

- route loads
- page renders
- navigation works
- no visible placeholder-only state for completed/testable pages
- no runtime console errors when feasible

Additional scenario files may use:

- `create.spec.mjs`
- `edit.spec.mjs`
- `delete.spec.mjs`
- `archive.spec.mjs`
- `navigation.spec.mjs`
- `permissions.spec.mjs`
- `validation.spec.mjs`
