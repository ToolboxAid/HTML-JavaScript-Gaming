# PR_26130_001-workspace-header-save-validation

## Summary

- Moved Workspace Manager V2 lifecycle actions into the header nav as Save, Close, and Cancel.
- Removed the now-obsolete Import Manifest and Export Manifest header buttons, and removed the old Active Game bottom lifecycle controls.
- Save now refreshes active toolState from normalized workspace tool sessions, writes it into the active game `game.manifest.json` under `game.workspace`, reads the file back, and validates both the game manifest and workspace toolState after write.
- Save logs the saved path, file size, toolState item/count details, and validation result.
- Close remains allowed only for clean toolState; Cancel warns before discarding dirty or unknown toolState.

## Validation

- `npm run test:workspace-v2`
  - First attempt timed out at the command wrapper's 120 second limit before a Playwright result was returned.
  - Rerun with a longer timeout passed: 19 passed.
  - Final rerun after removing unreachable import/export app methods passed: 19 passed.

Full samples smoke test skipped because this PR is limited to Workspace Manager V2 / Preview Generator V2 lifecycle controls and save validation, and does not modify shared sample loading or broad sample runtime behavior.

## repoPath Usage

`repoPath` is used.

- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js:849`: `contextResultFromManifest` copies `workspaceManifest.repoPath || ""` onto the active game metadata as `game.repoPath`.
- `tools/preview-generator-v2/PreviewGeneratorV2App.js:1449`: workspace launch hydration calls `normalizeAbsoluteRepoPath(manifest.repoPath)` to derive the workspace repo root path when present.
- `tools/asset-manager-v2/js/services/WorkspaceBridge.js:87`: workspace context extra-field filtering treats `repoPath` as an allowed root field.
- `tools/schemas/workspace.manifest.schema.json:49` and `tools/schemas/game.manifest.schema.json:136`: schemas define `repoPath`.
- Current game/workspace manifests persist `repoPath` in `games/Asteroids/game.manifest.json:27`, `games/GravityWell/game.manifest.json:27`, `games/Pong/game.manifest.json:27`, and `games/_template/workspace-manager-v2-UAT.manifest.json:12`.
- Workspace Manager V2 Playwright coverage asserts `repoPath` is preserved in active contexts and not used as a silent Preview Generator V2 fallback when the required workspace repo session reference is missing.

## Changed Files

- `tools/workspace-manager-v2/index.html`
- `tools/workspace-manager-v2/js/bootstrap.js`
- `tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `tools/workspace-manager-v2/js/controls/GameSelectorControl.js`
- `tools/workspace-manager-v2/js/controls/ManifestMenuControl.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tools/workspace-manager-v2/styles/workspaceManagerV2.css`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26130_001-workspace-header-save-validation.md`

## Notes

- Save has no silent fallback: it requires the active writable repo folder handle and the active `game.manifest.json` source.
- Preview Generator V2 lifecycle coverage remains in the targeted Workspace Manager V2 Playwright suite, including workspace launch repo/game control disabling and missing repo session handling.
