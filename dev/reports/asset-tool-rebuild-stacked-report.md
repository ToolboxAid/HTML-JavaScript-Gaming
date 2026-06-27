# PR_26156_136-141 Asset Tool Rebuild Stacked Report

## Scope

Executed stacked bundle:
- `PR_26156_136-asset-tool-reference-audit`
- `PR_26156_137-asset-tool-data-contract`
- `PR_26156_138-asset-tool-shell-runtime`
- `PR_26156_139-asset-tool-db-backed-library`
- `PR_26156_140-asset-tool-import-preview`
- `PR_26156_141-asset-tool-validation-playwright`

Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.

Did not modify:
- `archive/v1-v2/`
- `start_of_day/`
- sample smoke surfaces

No new CSS was added.

## PR_26156_136 - Reference Audit

Archived reference reviewed:

`archive/v1-v2/tools/old_asset-manager-v2/index.html`

Reference-only functionality expectations identified:
- launch guard / required project context
- asset type selection
- role/usage/path fields
- import controls
- asset library list
- selected asset detail and preview
- output/status/validation surfaces
- import/export style data ownership

The active rebuild did not copy archive code, local CSS, archive scripts, or archive class naming. The archive remains reference material only.

Asset Tool V2 active scope for this stack:
- first-class Theme V2 Toolbox shell
- Game Configuration readiness handoff
- SQL-shaped mock asset repository
- path-based asset records
- import/preview workflow
- visible validation errors
- targeted Playwright lane

Out of scope:
- real database
- auth
- cloud upload
- binary persistence
- export packaging
- Asset work outside `toolbox/assets/`

## PR_26156_137 - Data Contract

Added `toolbox/assets/assets-mock-repository.js`.

Repository tables:
- `asset_library_items`
- `asset_import_events`
- `asset_validation_items`

Owned by Asset Tool:
- asset name
- type
- role
- project-relative path
- source file name
- MIME type
- file size
- preview kind
- asset status
- import event records
- validation rows

Owned by upstream tools:
- Project Workspace owns project identity and ownership.
- Game Design owns design intent.
- Game Configuration owns playable configuration readiness.

Persistence boundary:
- mock repository only
- no real DB
- no localStorage/sessionStorage contract
- no cloud
- no binary file persistence
- no image data URL contract

## PR_26156_138 - Shell Runtime

Rebuilt `toolbox/assets/index.html` as a first-class Theme V2 tool page using:
- shared header/footer partials
- Tool Display Mode host
- wide tool workspace
- left setup/import panel
- center library/preview panel
- right output/validation/table/status inspector
- existing Theme V2 `tool-form-table` pattern

Updated `toolbox/toolRegistry.js`:
- Assets now requires Game Configuration.
- Assets status is `Ready` because this stack adds a testable mock-runtime library/import slice.
- Assets remains in the Content Toolbox group and Design color group.

## PR_26156_139 - DB-Backed Library

Added SQL-shaped mock asset library behavior:
- seeded Demo Player Sprite record
- import event records
- table counts
- selected asset state
- readable library status
- readiness handoff from Game Configuration

The implementation uses in-memory module state only.

## PR_26156_140 - Import Preview

Added testable import and preview workflow:
- file input derives file name/path defaults when empty
- form submit imports path-based asset records
- preview text shows type-specific preview, path, and source file name
- visible validation blocks invalid project-relative paths
- missing Game Configuration handoff shows a visible requirements overlay

No page-local CSS, inline styles, style blocks, script blocks, or inline event handlers were added.

## PR_26156_141 - Targeted Playwright

Added `tests/playwright/tools/AssetToolMockRepository.spec.mjs`.

Coverage:
- SQL-shaped table ownership
- absence of embedded image data URL persistence
- Assets page load
- ready Game Configuration handoff
- seeded asset library
- import workflow
- preview output
- validation error display
- missing handoff overlay
- no console errors or failed requests

Added `asset-tool` to `scripts/run-targeted-test-lanes.mjs` as the narrow Asset Tool lane.

## Validation

Impacted lanes:
- `asset-tool`
- `build-path`
- `tools-progress`
- `tool-runtime`
- `project-workspace`

Why these lanes ran:
- `asset-tool`: new Asset repository/page/runtime/test lane.
- `build-path`: Assets status changed to Ready and Build Path consumes registry status.
- `tools-progress`: Admin Tools Progress consumes registry metadata.
- `tool-runtime`: Toolbox normal-user visibility changed because Assets is now Ready.
- `project-workspace`: existing Project Workspace Playwright assertions cover Toolbox role filters affected by Ready-tool count.

Commands run:
- `node --check toolbox/assets/assets-mock-repository.js`
- `node --check toolbox/assets/assets.js`
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `node --check scripts/run-targeted-test-lanes.mjs`
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `node --check toolbox/toolRegistry.js`
- Existing changed JavaScript/MJS syntax check using `node --check`
- `node ./scripts/run-targeted-test-lanes.mjs --lane asset-tool --lane tools-progress --lane tool-runtime --lane build-path --lane project-workspace`
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`
- `git diff --check`

Targeted lane result: PASS. See `docs_build/dev/reports/testing_lane_execution_report.md`.

Skipped lanes:
- `workspace-contract`
- `game-design`
- `game-configuration`
- `tool-navigation`
- `tool-display-mode`
- `tool-images`
- `game-runtime`
- `integration`
- `engine-src`
- `samples`

Skipped-lane rationale:
- Game Design and Game Configuration runtime behavior was not changed.
- Tool navigation, Tool Display Mode layout, image registry, engine source, games, samples, and archive surfaces were not modified.
- Full samples smoke was skipped because this stack does not modify samples, sample JSON, sample loader behavior, or sample runtime framework behavior.
