# Codex Commands - PR_26130_003-session-restore-file-handle-guard

```text
codex

Changes:
Create PR_26130_003-session-restore-file-handle-guard.
Read docs/dev/PROJECT_INSTRUCTIONS.md first.
Fix Workspace Manager V2 restore behavior when no active repo folder handle exists.
Do not restore/open an active game from sessionStorage as save-capable unless a live repo folder handle is present.
If sessionStorage has active game context but no live repo folder handle:
- show restored game details as read-only context only, or clear active game state
- keep Save disabled
- require repo folder selection before opening a save-capable game
- log exact reason and required action
After repo folder is picked, rebind active game to the real game.manifest.json source.
Ensure Save writes to the actual file and validates by re-reading after write.
Keep scope limited to Workspace Manager V2 restore/save binding.
No unrelated files.
No start_of_day changes.

Validation:
Run npm run test:workspace-v2.
Add/update Playwright tests for sessionStorage restore without file handle, Save disabled until repo folder is selected, repo rebind after folder pick, and successful post-save validation.
Do not run full samples smoke test; document skipped reason.

Required reports:
Create docs/dev/reports/codex_review.diff.
Create docs/dev/reports/codex_changed_files.txt.
Create docs/dev/reports/PR_26130_003-session-restore-file-handle-guard.md.
Update docs/dev/codex_commands.md.
Update docs/dev/commit_comment.txt.
Produce required repo-structured ZIP under tmp/.
```

## Commands Run

```powershell
Get-Content -Path "docs/dev/PROJECT_INSTRUCTIONS.md"
Get-Content -Path ".codex/skills/repo-build/SKILL.md"
git status --short --untracked-files=all
rg -n "restoreWorkspaceFromSession|contextForSave|writeActiveGameToolStateFile|gameManifestPath|manifestPath|repoPath|manifestWrites|saveWorkspaceSession|dirtyPaletteToolState|Save" tools/workspace-manager-v2/js tests/playwright/tools/WorkspaceManagerV2.spec.mjs tools/preview-generator-v2/PreviewGeneratorV2App.js tools/asset-manager-v2/js/services/WorkspaceBridge.js tools/schemas games/Asteroids/game.manifest.json games/GravityWell/game.manifest.json games/Pong/game.manifest.json games/_template/workspace-manager-v2-UAT.manifest.json
rg --files "tools/workspace-manager-v2/js" | rg "Menu|menu|Repo|Selector|ToolTiles"
rg -n "expectWorkspaceReturnRehydrated|returnToWorkspaceButton|saveWorkspaceButton|closeWorkspaceButton|cancelWorkspaceButton|pickRepoBtn|activeGameSelect" tests/playwright/tools/WorkspaceManagerV2.spec.mjs
rg -n "bindGameManifestSourceForSave|writeActiveGameToolStateFile|restorePersistedContextById|restorePersistedContext" tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js
npm run test:workspace-v2
node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js
node --check tools/workspace-manager-v2/js/controls/ToolTilesControl.js
node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
git diff --check
git status --short --untracked-files=all
git diff --stat
git diff -- tools/workspace-manager-v2/js/WorkspaceManagerV2App.js tools/workspace-manager-v2/js/controls/ToolTilesControl.js tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js tests/playwright/tools/WorkspaceManagerV2.spec.mjs
```

## Validation

`npm run test:workspace-v2` passed: 22 passed.

Syntax checks passed for:

- `tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `tools/workspace-manager-v2/js/controls/ToolTilesControl.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

`git diff --check` passed.

Full samples smoke test skipped because this PR is limited to Workspace Manager V2 restore/save binding and does not modify shared sample loading, sample manifests, or broad sample runtime behavior.

## Playwright Impact

Playwright impacted: Yes.

Workspace Manager V2 Playwright now validates sessionStorage restore without a live repo folder handle, Save disabled until a repo folder is selected, active game dropdown locked while restored read-only context is shown, repo rebind after folder pick, successful post-save write/read-back validation, and missing-handle Save recovery logging.

Expected pass behavior: restored sessionStorage toolState is read-only until repo selection, Save stays disabled without a live repo handle, repo selection rebinds the active game to `/games/<game>/game.manifest.json`, and Save writes/re-reads the actual manifest file before marking dirty toolState clean.

Expected fail behavior: tests fail if restored sessionStorage context becomes save-capable without a live handle, Save writes only browser/session context, repo rebinding is skipped, tool launch is allowed before rebind, or post-save file validation/dirty-clean logging is missing.

## Coverage

Playwright V8 coverage report generated by `npm run test:workspace-v2`:

- `(88%) tools/workspace-manager-v2/js/WorkspaceManagerV2App.js - executed lines 598/598; executed functions 36/41`
- `(93%) tools/workspace-manager-v2/js/controls/ToolTilesControl.js - changed JS file with browser V8 coverage`
- `(93%) tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js - changed JS file with browser V8 coverage`

`tests/playwright/tools/WorkspaceManagerV2.spec.mjs` is a changed test file and is not collected as browser runtime coverage.
