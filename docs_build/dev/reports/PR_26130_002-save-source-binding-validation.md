# PR_26130_002-save-source-binding-validation

## Summary

- Added Workspace Manager V2 save source rebinding so restored session context can bind back to the real discovered `game.manifest.json` source before Save writes.
- Save now writes through the active game manifest file handle, then re-reads the file and verifies content/timestamp change, valid JSON/schema, `root.game.workspace`, and exact saved workspace toolState.
- Save logs source binding, write validation, schema/toolState validation, and dirty/clean validation.
- Missing source binding now fails visibly with the exact active source, missing context field/source, and recovery action.

## Validation

- `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `git diff --check`
- `npm run test:workspace-v2` passed: 21 passed.
- Final rerun after source-binding recovery log hardening passed: 21 passed.

Full samples smoke test skipped because this PR is limited to Workspace Manager V2 save/source binding and does not modify shared sample loading, sample manifests, or broad runtime sample behavior.

## Playwright Coverage

Playwright impacted: Yes.

Coverage added/updated in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` validates:

- Restored session Save rebinds from `sessionStorage:*` active game source to `/games/Asteroids/game.manifest.json`.
- Save writes the actual mock repo `game.manifest.json` file and re-read validation logs file content changed.
- Re-read JSON contains `root.game.workspace` and the dirty palette payload that triggered Save.
- Save marks dirty toolState keys clean after file persistence.
- Missing file source logs the exact source binding failure and recovery action without writing browser-only fallback data.

Expected pass behavior: Save writes the real active game manifest file, re-reads and validates it, logs source/write/schema/dirty-clean validation, and leaves dirty toolState clean.

Expected fail behavior: tests fail if Save writes only session context, keeps a `sessionStorage:*` game source, omits `game.workspace`, does not change file content/timestamp, or silently falls back when the repo/file source is missing.

## Playwright V8 Coverage

- `(88%) tools/workspace-manager-v2/js/WorkspaceManagerV2App.js - executed lines 532/532; executed functions 36/41`
- `(93%) tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js - executed lines 1347/1347; executed functions 129/138`

## repoPath Usage

`repoPath` is used.

- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js:849`: `contextResultFromManifest` copies `workspaceManifest.repoPath || ""` onto active game metadata as `game.repoPath`.
- `tools/preview-generator-v2/PreviewGeneratorV2App.js:1449`: workspace launch hydration reads `manifest.repoPath` with `normalizeAbsoluteRepoPath(manifest.repoPath)` when present.
- `tools/asset-manager-v2/js/services/WorkspaceBridge.js:87`: workspace context extra-field filtering allows `repoPath` as a known root workspace field.
- `tools/schemas/workspace.manifest.schema.json:49` and `tools/schemas/game.manifest.schema.json:136`: schemas define the `repoPath` field.
- Current manifests persist `repoPath` in `games/Asteroids/game.manifest.json:27`, `games/GravityWell/game.manifest.json:27`, `games/Pong/game.manifest.json:27`, and `games/_template/workspace-manager-v2-UAT.manifest.json:12`.

## Manual Test

1. Open Workspace Manager V2.
2. Pick the repo folder and select Asteroids.
3. Launch Palette Manager V2, add a swatch, and return to Workspace Manager V2.
4. Click Save.
5. Expected: status log shows source binding to the Asteroids `game.manifest.json`, file content/timestamp validation, schema/toolState validation, and dirty/clean validation.
6. Recovery path check: if Save has no active real repo/file source, expected status log identifies the missing source and instructs the user to cancel active toolState, pick the repo folder again, reopen the game, and retry Save.

## Changed Files

- `tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26130_002-save-source-binding-validation.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
