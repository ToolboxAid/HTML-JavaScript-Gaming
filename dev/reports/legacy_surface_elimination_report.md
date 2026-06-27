# PR_26154_028 Legacy Surface Elimination

Baseline used: `PR_26154_025-cloud-template-styles-cleanup`.

## Scope

- Reviewed active `toolbox/` for legacy remnants.
- Reviewed `scripts/` for legacy/V1 remnants.
- Removed only a confirmed obsolete test surface.
- Reported ambiguous legacy candidates instead of moving or deleting active support files.

## Removed

- Deleted `tests/theme.test.js`.
- Removed the bare `./theme.test.js` import from `tests/run-tests.mjs`.

Reason: `tests/theme.test.js` imported `src/engine/theme/Theme.js` and `src/engine/theme/ThemeTokens.js`, but `src/engine/theme/` no longer exists in the working tree. The test represented obsolete V1/engine-theme coverage and was only retained through the aggregate node test runner import.

## Kept

The following files remain because active references or ambiguous ownership still exist:

- `toolbox/toolRegistry.js`: legacy-heavy registry with many `archive/v1-v2/tools/` entries, but still imported by `toolbox/shared/toolLaunchSSoTData.js` and tests.
- `toolbox/renderToolsIndex.js`: not used by the current `toolbox/index.html`, but still referenced by docs/tests and depends on `toolbox/toolRegistry.js`.
- `toolbox/shared/`: still imported by active tests and shared tool-support modules.
- `toolbox/dev/`: still wired from root package scripts such as `pretest` and guard commands.
- `scripts/run-targeted-test-lanes.mjs`: active package script dependency.
- `scripts/run-node-tests.mjs`: active package script dependency.
- `scripts/validate-*.mjs`: validation/support scripts remain active or ambiguous.
- PowerShell scripts under `scripts/PS/`: left untouched because no script was proven deprecated-only in this PR.

## Stale Or Legacy Test Candidates

Reported, not removed:

- `tests/playwright/tools/ToolTemplateV2Baseline.spec.mjs`: still asserts retired `src/engine/theme` and old `tool-starter__*` template details. It is part of the broader `tool-runtime` lane and needs a dedicated active-template test alignment PR.
- `tests/runtime/V2ToolSmoke.test.mjs`: still checks old `toolbox/*-v2` directory conventions and old shared theme imports. It is not part of the current `workspace-contract` lane and needs a dedicated runtime smoke test ownership decision.
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`: contains historical string assertions for `src/engine/theme` references. Those assertions were not in the targeted `workspace-contract` lane for this stack.
- `tests/validation/samples.shared.boundaries.report.json`: generated/historical report still contains `/src/engine/theme/index.js`; left untouched as report data.

## Scripts Audit

No scripts were deleted. The tracked scripts under `dev/scripts/` are either wired through `package.json`, validation workflows, deployment helpers, or ambiguous historical utilities. Untracked personal files under `dev/scripts/untracked/` were not modified.

## Active Vs Legacy Inventory

Active:

- Active public/root pages.
- Active `toolbox/[toolname]/index.html` pages.
- `assets/theme/v2/css/theme.css`.
- `assets/theme/v2/js/gamefoundry-partials.js`.
- `assets/theme/v2/js/tool-display-mode.js`.
- `assets/theme/v2/partials/header-nav.html`.
- `assets/theme/v2/partials/footer.html`.
- `scripts/run-targeted-test-lanes.mjs`.
- `scripts/run-node-tests.mjs`.

Legacy or deprecated:

- `archive/v1-v2/tools/`.
- `archive/v1-v2/games/`.
- `archive/v1-v2/samples/`.
- Deprecated-only references to `assets/theme/v2/css/styles.css`.
- Historical docs/reports mentioning `src/engine/theme`.

Ambiguous cleanup candidates:

- `toolbox/toolRegistry.js`.
- `toolbox/renderToolsIndex.js`.
- `toolbox/shared/preview/`.
- `toolbox/shared/samples/`.
- `tests/playwright/tools/ToolTemplateV2Baseline.spec.mjs`.
- `tests/runtime/V2ToolSmoke.test.mjs`.
