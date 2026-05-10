# PR_26130_004-workspace-return-tool-enable-regression

## Summary

- Fixed normal Return to Workspace navigation so it preserves Workspace Manager V2 active repo/game/toolState state instead of reopening as a missing-handle restore.
- Workspace Manager V2 now stamps the active hostContextId into history before tool launch and records an explicit return marker.
- Workspace-launched tools use the return marker to prefer browser history return, preserving the live page state when available.
- If the browser reloads Workspace Manager on return, the active repo handle is restored from the explicit repo handle cache only for marked return navigation.
- Direct sessionStorage restores without a return marker still remain read-only until the user picks the repo folder.
- Return-state logging now reports repo selected, game selected, source binding status, and enabled tool count.

## Validation

- `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `node --check tools/asset-manager-v2/js/AssetManagerV2App.js`
- `node --check tools/asset-manager-v2/js/services/WorkspaceBridge.js`
- `node --check tools/palette-manager-v2/main.js`
- `node --check tools/preview-generator-v2/PreviewGeneratorV2ShellControl.js`
- `node --check tools/session-inspector-v2/js/SessionInspectorV2App.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- Focused return-regression rerun passed: 3 passed.
- `git diff --check`
- `npm run test:workspace-v2` passed: 22 passed.

Full samples smoke test skipped because this PR is limited to Workspace Manager V2 return state/tool enablement and does not modify shared sample loading, sample manifests, or broad sample runtime behavior.

## Playwright Coverage

Playwright impacted: Yes.

Coverage added/updated in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` validates:

- Opening a game, launching Session Inspector V2, and returning keeps Workspace Manager V2 tools enabled.
- Returning after clean toolState keeps Save disabled and Close enabled.
- Returning after dirty Palette Manager V2 or Asset Manager V2 changes keeps Save enabled and Close disabled.
- Returning after Preview Generator V2 preserves the active repo/game/source binding and enabled tool list.
- Gravity Well and Pong return paths keep their selected game bindings and tools enabled.
- Direct sessionStorage restore without a return marker still requires repo folder selection before Save/tool launch.

Expected pass behavior: normal Return to Workspace restores the active repo, game, source binding, enabled tool count, and refreshed dirty toolState data without requiring Pick Repo Folder.

Expected fail behavior: tests fail if return navigation drops the live repo handle, grays out tools, enables Save without a live binding, disables Save while dirty after a valid return, or omits return-state log lines.

## Playwright V8 Coverage

- `(63%) tools/asset-manager-v2/js/AssetManagerV2App.js - executed lines 643/643; executed functions 36/57`
- `(76%) tools/preview-generator-v2/PreviewGeneratorV2ShellControl.js - executed lines 166/166; executed functions 13/17`
- `(83%) tools/palette-manager-v2/main.js - executed lines 227/227; executed functions 15/18`
- `(87%) tools/workspace-manager-v2/js/WorkspaceManagerV2App.js - executed lines 710/710; executed functions 39/45`
- `(90%) tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js - executed lines 1458/1458; executed functions 136/151`
- `(93%) tools/asset-manager-v2/js/services/WorkspaceBridge.js - executed lines 305/305; executed functions 25/27`
- `(93%) tools/session-inspector-v2/js/SessionInspectorV2App.js - executed lines 309/309; executed functions 41/44`

`tests/playwright/tools/WorkspaceManagerV2.spec.mjs` is a changed test file and is not collected as browser runtime coverage.

## Manual Test

1. Open Workspace Manager V2.
2. Pick the repo folder and select Asteroids.
3. Launch Session Inspector V2 and click Return to Workspace.
4. Expected: Asteroids remains selected, Pick Repo Folder remains disabled, workspace tools remain enabled, Save remains disabled, Close remains enabled, and the status log includes return-state repo/game/source/enabled-count lines.
5. Launch Palette Manager V2, add a swatch, and click Return to Workspace.
6. Expected: workspace tools remain enabled, Save is enabled, Close is disabled, and the dirty Palette Manager V2 toolState is reflected in the tiles.
7. Refresh Workspace Manager V2 directly with a hostContextId but without selecting a repo folder.
8. Expected: Save remains disabled and Workspace Manager V2 requires Pick Repo Folder before Save/tool launch.

## Changed Files

- `tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tools/asset-manager-v2/js/AssetManagerV2App.js`
- `tools/asset-manager-v2/js/services/WorkspaceBridge.js`
- `tools/palette-manager-v2/main.js`
- `tools/preview-generator-v2/PreviewGeneratorV2ShellControl.js`
- `tools/session-inspector-v2/js/SessionInspectorV2App.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/reports/PR_26130_004-workspace-return-tool-enable-regression.md`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
