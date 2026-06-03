# PR_26130_003-session-restore-file-handle-guard

## Summary

- Workspace Manager V2 now marks restored sessionStorage toolState context as read-only when no live repo folder handle exists.
- Save stays disabled and tool launch is blocked until the user picks a repo folder.
- Picking the repo folder while restored context is active rebinds the active game to the real discovered `game.manifest.json` source.
- Save continues to write the actual game manifest file and validate by re-reading the file after write.
- Missing live-handle Save attempts log the active source, context game fields, and required recovery action.

## Validation

- `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `node --check tools/workspace-manager-v2/js/controls/ToolTilesControl.js`
- `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `git diff --check`
- `npm run test:workspace-v2` passed: 22 passed.

Full samples smoke test skipped because this PR is limited to Workspace Manager V2 restore/save binding and does not modify shared sample loading, sample manifests, or broad sample runtime behavior.

## Playwright Coverage

Playwright impacted: Yes.

Coverage added/updated in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` validates:

- Restoring active game/toolState context from sessionStorage without a live repo folder handle.
- Save remains disabled until repo folder selection supplies a live handle.
- Repo destination selection remains enabled and active game selection remains locked for restored read-only context.
- Tool tiles remain blocked before rebind and show the required repo folder state.
- Repo folder selection rebinds the restored active game to `/games/Asteroids/game.manifest.json`.
- Save after rebind writes the actual mock repo `game.manifest.json`, re-reads it, validates `root.game.workspace`, and marks dirty toolState clean.
- Missing-handle Save attempts log the exact missing handle/source and required action without writing browser-only fallback data.

Expected pass behavior: restored sessionStorage toolState is read-only until repo selection, Save stays disabled without a live handle, repo selection rebinds the active game to the real manifest source, and Save writes/re-reads the manifest file before clearing dirty state.

Expected fail behavior: tests fail if restored sessionStorage context becomes save-capable without a live repo handle, Save writes only persisted browser/session context, repo rebinding is skipped, tool launch is allowed before rebind, or post-save file validation/dirty-clean logging is missing.

## Playwright V8 Coverage

- `(88%) tools/workspace-manager-v2/js/WorkspaceManagerV2App.js - executed lines 598/598; executed functions 36/41`
- `(93%) tools/workspace-manager-v2/js/controls/ToolTilesControl.js - changed JS file with browser V8 coverage`
- `(93%) tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js - changed JS file with browser V8 coverage`

`tests/playwright/tools/WorkspaceManagerV2.spec.mjs` is a changed test file and is not collected as browser runtime coverage.

## Manual Test

1. Open Workspace Manager V2.
2. Pick the repo folder and select Asteroids.
3. Launch Palette Manager V2, add a swatch, and return to Workspace Manager V2.
4. Expected: Workspace Manager V2 restores the Asteroids toolState as read-only, Save is disabled, Pick Repo Folder is enabled, and the status log explains that a live repo folder handle is required.
5. Pick the repo folder again.
6. Expected: the status log reports the restored toolState was rebound to `/games/Asteroids/game.manifest.json`; Save is enabled because the toolState is dirty.
7. Click Save.
8. Expected: status log shows source binding, saved path, file content/timestamp validation, schema/toolState validation, and dirty/clean validation.

## Changed Files

- `tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `tools/workspace-manager-v2/js/controls/ToolTilesControl.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26130_003-session-restore-file-handle-guard.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
