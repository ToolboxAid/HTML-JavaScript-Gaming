# PR_26170_008-workflow-order-governance

## Branch Validation

PASS - Current branch verified as `main`.

## Requirement Checklist

- PASS - Renamed the previous Toolbox-specific governance title to `Workflow Ordering Governance` in current governance and owner notes.
- PASS - Updated governance language so creator workflow surfaces order by likely next action, not alphabetically.
- PASS - Documented workflow ordering as an approved exception to alphabetical ordering.
- PASS - Documented applicability to Toolbox, Project Workspace, Create, Publish, Progress, and future guided workflows.
- PASS - Updated Create group order to `Game Workspace`, `Project Team`, `Game Configuration`, `Tags`.
- PASS - Updated Owner grouping notes and Owner Notes source content to the new governance name and Create order.
- PASS - Updated related historical PR documentation references so the old governance name/order does not remain as an active doc reference.
- PASS - Did not move Game Journey. Toolbox mapping still keeps `game-journey` in `Progression`.
- PASS - Did not modify unrelated groups.

## Validation

- PASS - `git branch --show-current` returned `main`.
- PASS - `node --check toolbox/tools-page-accordions.js`
- PASS - `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- PASS - `git diff --check` completed with no whitespace errors; only Windows line-ending warnings were reported.
- PASS - Targeted Node documentation/static validation confirmed:
  - `PROJECT_INSTRUCTIONS.md` uses `Workflow Ordering Governance`.
  - likely-next-action and alphabetical-exception rules are present.
  - applicability to Toolbox, Project Workspace, Create, Publish, Progress, and future guided workflows is present.
  - `PROJECT_INSTRUCTIONS.md`, Owner Notes, Owner grouping notes, Toolbox renderer, and Playwright expectation all use `Game Workspace`, `Project Team`, `Game Configuration`, `Tags`.
  - old governance title and old Create order do not remain in searched docs/source targets.
- PASS - Targeted Toolbox Playwright validation:
  - `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --grep "toolbox grouped view renders Game Journey order" --workers=1 --reporter=list`
  - Result: 1 passed.

## Playwright Coverage Note

- Targeted Playwright refreshed advisory V8 coverage reports:
  - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
  - `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- The browser run exercised `toolbox/tools-page-accordions.js`.

## Skipped Lanes

- SKIP - Full samples validation was skipped per request.
- SKIP - Broad workspace/runtime suites were skipped because this PR changes governance docs and a targeted Toolbox Create-order renderer mapping only.
- SKIP - Database, persistence, auth, engine, and unrelated tool lanes were skipped because no behavior in those areas changed.

## Manual Notes

- Owner grouping colors now lists Create as `Game Workspace`, `Project Team`, `Game Configuration`, `Tags`.
- Owner Notes source now lists Project Team before Game Configuration in Create.
- Toolbox grouped view keeps Game Journey in `Progression`; only Create tile order changed.
