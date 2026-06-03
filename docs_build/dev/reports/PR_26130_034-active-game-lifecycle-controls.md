# PR_26130_034-active-game-lifecycle-controls

## Scope

- Workspace Manager V2 active game lifecycle controls.
- Preview Generator V2 workspace-launched repo/game target locking.
- Workspace V2 Playwright coverage for lifecycle control state transitions.

## Changes

- Added Active Game bottom controls: Save, Close, and Cancel.
- Locked repo destination and game selection after an active toolState opens.
- Save is enabled only when dirty toolState data exists.
- Close is enabled only when active toolState data is clean.
- Cancel warns with a confirmation dialog before discarding dirty toolState data.
- Updated touched Workspace Manager V2 lifecycle code to use active toolState terminology.
- Locked Preview Generator V2 workspace launch repo and game target controls.

## Playwright

Playwright impacted: Yes.

Validated by `npm run test:workspace-v2`.

Coverage added/updated:

- Opened-game control disabling.
- Dirty-state Save/Close enabled and disabled states.
- Close clearing clean active toolState data.
- Cancel dirty warning with dismissal and confirmation paths.
- Preview Generator V2 workspace launch repo/game target lock.

Expected pass behavior: Workspace Manager V2 and Preview Generator V2 lifecycle controls remain locked after toolState open, dirty state drives Save/Close correctly, Close only clears clean state, and Cancel requires confirmation before dirty discard.

Expected fail behavior: Playwright fails if controls remain editable after open, Save/Close dirty state is inverted, Close clears dirty data, or Cancel discards dirty data without confirmation.

## Validation

- `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js` - PASS.
- `node --check tools/workspace-manager-v2/js/controls/GameSelectorControl.js` - PASS.
- `node --check tools/preview-generator-v2/PreviewGeneratorV2App.js` - PASS.
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` - PASS.
- `npm run test:workspace-v2` - PASS, 20 passed.

Initial `npm run test:workspace-v2` run failed because the new Cancel test used a rejected palette swatch symbol fixture. The fixture was corrected and the final required validation passed.

## Coverage

Playwright V8 coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

Changed runtime JavaScript files are listed in the coverage report. Missing changed runtime JavaScript coverage is advisory and would be reported as WARN by the existing guardrail.

## Full Samples Smoke

Skipped. Reason: this PR is limited to Workspace Manager V2 / Preview Generator V2 lifecycle controls and does not modify shared sample loading, sample JSON, or broad sample runtime behavior.

## Manual Validation

1. Open Workspace Manager V2.
2. Pick the repo folder and select a game.
3. Confirm repo destination selection and game dropdown are disabled after the game/toolState opens.
4. Confirm clean state disables Save and enables Close.
5. Launch an editor tool, make a dirty change, and return.
6. Confirm dirty state enables Save and disables Close.
7. Click Cancel, dismiss the warning, and confirm the active toolState remains.
8. Click Cancel again, accept the warning, and confirm the active toolState clears.
9. Reopen a game, Save dirty data, then Close clean state and confirm the active toolState clears.

## Out Of Scope

- No start_of_day changes.
- No sample JSON changes.
- No full samples smoke test.
- No engine core changes.
