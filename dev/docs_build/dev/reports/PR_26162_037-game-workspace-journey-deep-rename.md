# PR_26162_037 Game Workspace Journey Deep Rename

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current branch is `main` before edits.
- PASS: Renamed active Project Workspace surfaces to Game Workspace.
- PASS: Renamed active Project Journey surfaces to Game Journey.
- PASS: Replaced active user-facing Project Progress copy with Game Progress.
- PASS: Replaced active user-facing Project Status copy with Game Status.
- PASS: Replaced active user-facing Project Identity copy with Game Identity.
- PASS: Replaced active user-facing Project Build Path copy with Game Build Path.
- PASS: Active folders/files use `game-workspace` and `game-journey` naming for active tools.
- PASS: Active tool metadata, routes, labels, mock repositories, variables, constants, IDs, data keys, API route names, test names, and report-facing copy use Game terminology.
- PASS: Active navigation points to Game Workspace and Game Journey paths.
- PASS: Dev/mock repository ownership is renamed to Game Workspace and Game Journey.
- PASS: A deprecated `toolbox/project-workspace` guidance route remains only for old links and is documented here.
- PASS: The old `toolbox/project-journey` route/folder is removed.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated engine runtime behavior was added.

## Search Evidence

Active scoped search used:

`rg -n "Project Workspace|Project Journey|Project Progress|Project Status|Project Identity|Project Build Path|Project Context|Project Design|Missing Project" toolbox src/dev-runtime assets/theme-v2 learn package.json scripts tests/playwright -g "!docs_build/dev/reports/**"`

Result:

- `Project Workspace`: one intentional historical/deprecated guidance hit at `toolbox/project-workspace/index.html:9`.
- `Project Journey`: no active hits.
- `Project Progress`: no active hits.
- `Project Status`: no active hits.
- `Project Identity`: no active hits.
- `Project Build Path`: no active hits.
- `Project Context`, `Project Design`, `Missing Project`: no active hits.

Slug/API search used:

`rg -n "project-workspace|project-journey|PROJECT_WORKSPACE|PROJECT_JOURNEY|ProjectWorkspace|ProjectJourney|projectWorkspace|projectJourney|data-journey-active-project" toolbox src/dev-runtime assets/theme-v2 learn package.json scripts tests/playwright -g "!docs_build/dev/reports/**"`

Result: no active content hits.

Path evidence:

- `toolbox/project-journey`: absent.
- `toolbox/game-journey`: present.
- `toolbox/project-workspace`: present only as deprecated old-link guidance.
- `toolbox/game-workspace`: present.
- `learn/project-workspace`: absent.
- `learn/game-workspace`: present.

Governed/historical leftovers:

- `toolbox/project-workspace/index.html` is intentionally retained as a deprecated guidance route for old links.
- `npm run test:workspace-v2` is intentionally retained because this PR explicitly required that command. It is a legacy command name for the Workspace V2 contract lane, not active Project Workspace UI.
- `workspace-contract` report/lane filenames are validation infrastructure terms for the broader Workspace V2 ecosystem and were not renamed.
- `src/shared/contracts/projectWorkspaceRuntimeContract.js` remains outside the active toolbox/dev-runtime rename scope and is governed shared contract history.

## Changed Files

Full changed-file inventory is generated at:

- `docs_build/dev/reports/codex_changed_files.txt`

Key changed areas:

- Active tool folders: `toolbox/game-workspace/**`, `toolbox/game-journey/**`.
- Dev-runtime repositories: `game-workspace-mock-repository.js`, `game-journey-mock-repository.js`, mock DB store, mock API router.
- Tool metadata/navigation: tool metadata inventory, header partials, toolbox registry compatibility, route maps.
- Learn pages: `learn/game-workspace/index.html`, Learn hub links, Getting Started links.
- Playwright specs: renamed Game Workspace/Game Journey specs plus route/navigation/image/workspace-contract expectations.
- Required reports and coverage outputs under `docs_build/dev/reports`.

## Impacted Lanes

- workspace-contract
- game-workspace
- game-journey
- tool-navigation
- tool-display-mode
- tool-images
- dev-runtime boundary

## Validation

- PASS: Changed-file syntax checks for changed `.js`/`.mjs` files with `node --check`.
- PASS: `git diff --check` exited 0.
- PASS: `node tests/dev-runtime/DevRuntimeBoundary.test.mjs` passed 3/3.
- PASS: `npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs tests/playwright/tools/GameJourneyTool.spec.mjs --workers=1 --reporter=line` passed 20/20.
- PASS: `npx playwright test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs tests/playwright/tools/ToolImageRegistry.spec.mjs --workers=1 --reporter=line` passed 15/15.
- PASS: `npm run test:workspace-v2` passed 5/5 after updating the lane runner from the unsupported Playwright `--game=playwright` flag to `--project=playwright`.

## Playwright Result

Playwright impacted: Yes.

Validated outcomes:

- Game Workspace opens from active navigation and active toolbox routes.
- Game Journey opens from active navigation and active toolbox routes.
- Tool metadata/navigation resolves renamed Game paths.
- Game Configuration multi-target navigation preserves the registry group route.
- Mock DB/dev-runtime routes resolve the renamed Game repositories.
- Tests/spec filenames and names use Game terminology.
- No active imports from `project-workspace` or `project-journey` remain.

## V8 Coverage

- V8 coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Result: advisory coverage generated by current Playwright runs.
- Noted warnings are advisory for server/dev-runtime modules that are not browser-collected by V8 coverage.

## Review Artifacts And Package

- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Repo-structured ZIP: `tmp/PR_26162_037-game-workspace-journey-deep-rename_delta.zip`

## Manual Validation Steps

1. Open `/toolbox/index.html`.
2. Confirm Game Workspace and Game Journey cards/links are visible and point to `/toolbox/game-workspace/index.html` and `/toolbox/game-journey/index.html`.
3. Open Game Workspace and confirm user-facing copy uses Game Workspace, Game Identity, Game Status, Game Progress, and Game Build Path language.
4. Open Game Journey and confirm active route/query uses `game` terminology.
5. Open `/learn/game-workspace/index.html` and confirm the Learn page uses Game Workspace copy.
6. Open `/toolbox/project-workspace/index.html` only to confirm it is deprecated old-link guidance, not active navigation.

## Skipped Lanes

- Full samples validation: skipped. This PR changes active creator workflow naming, toolbox/dev-runtime metadata, mock repository names, tests, Learn links, and validation artifacts. It does not change sample JSON alignment or production sample runtime behavior.
- Full all-Playwright smoke: skipped. Targeted Playwright lanes covered renamed Game Workspace route, Game Journey route, metadata/navigation route resolution, image registry route assets, and workspace-contract behavior requested by this PR.

## Samples Decision

Samples validation was skipped and is safe to skip because no sample JSON, sample runtime, or production game engine behavior changed.

## Runtime Engine Behavior

Confirmed: no production game engine runtime behavior changed. Changes are scoped to toolbox UI, Learn links, dev-runtime/mock repository naming, active metadata/navigation, tests, and required reports.
