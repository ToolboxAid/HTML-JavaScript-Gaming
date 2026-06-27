# Tools Progress Targeted MSJ Tests

PR bundle:
- PR_26155_095-tools-progress-targeted-msj-tests

## Added Coverage

Added `tests/playwright/tools/ToolsProgressHydration.spec.mjs`.

Registered targeted lane:
- `npm run test:lane:tools-progress`

Runner lane:
- `tools-progress`

Coverage verifies:
- Admin Tools Progress contains every active/planned registry tool.
- Admin Tools Progress order matches the registry build sequence.
- Admin Tools Progress renders `Status` and `Complete` columns for every row.
- Group colors match the restored model.
- Toolbox Group view uses AI, Audio, Build/Create, Design, Marketplace, Platform, and Play.
- Project Build Path remains workflow-order and project-specific.
- Publish never renders as `N/A`.
- Project -> Progress and Admin -> Project Progress remain absent.
- No duplicate Admin appears under Toolbox.
- Arcade remains absent from Toolbox.
- No forbidden `Studio` wording appears on the checked active surfaces except `GameFoundryStudio`.
- No console errors or failed requests occur in the checked pages.

## Validation Commands Run

- `npm run test:lane:tools-progress`
- `npm run test:lane:build-path`
- `npm run test:workspace-v2`
- `node --check admin/tools-progress.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check scripts/run-targeted-test-lanes.mjs`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `node --check tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`
- `git diff --check`

`npm run test:workspace-v2` is the legacy command name for the current Project Workspace/workspace-contract compatibility lane. User-facing naming remains Project Workspace.

## Impacted Lanes

- `tools-progress`
- `build-path`
- `workspace-contract` via legacy command `npm run test:workspace-v2`

## Skipped Lanes

- `project-workspace`
- `game-design`
- `game-configuration`
- `tool-runtime`
- `game-runtime`
- `integration`
- `engine-src`
- `samples`

## Skipped-Lane Rationale

Skipped lanes were safe to skip because the implementation changed Admin Tools Progress hydration, Toolbox registry/group metadata, Theme V2 color class mapping, and Toolbox Group view expectations. It did not change Project Workspace repository behavior, Game Design/Game Configuration repositories, engine/runtime code, samples, or unrelated tool implementations.

Full samples smoke test was skipped because no sample JSON or sample runtime behavior changed.

## Manual Test Notes

1. Open `admin/tools-progress.html`.
2. Confirm all planned/active tools are listed in platform build sequence.
3. Confirm each row has a group swatch, status, and complete value.
4. Open `toolbox/index.html?role=admin`.
5. Click `Group` and confirm restored group labels and tile outlines.
6. Click `Build Path` and confirm the project workflow table remains ordered top-to-bottom and left-to-right.
7. Confirm Project -> Progress is absent and Admin -> Tools Progress remains available.
