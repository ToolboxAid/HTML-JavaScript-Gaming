# Codex Commands - PR_26130_001-workspace-header-save-validation

```text
codex

Changes:
Create PR_26130_001-workspace-header-save-validation.
Read docs/dev/PROJECT_INSTRUCTIONS.md first.
Remove Workspace header nav buttons that are no longer needed.
Move Save, Close, and Cancel into the Workspace header nav.
Fix Save so it writes the active game/toolState file and validates the file after write.
After Save, log saved path, file size, item/count details, and validation result.
Investigate whether repoPath is used anywhere. If used, document exact usage in the PR report. If unused, document that finding only.
Keep scope limited to Workspace Manager V2 / Preview Generator V2 lifecycle and save validation.
No unrelated files.
No start_of_day changes.

Validation:
Run npm run test:workspace-v2.
Add/update Playwright tests for header Save/Close/Cancel placement, save write verification, dirty-state button behavior, and post-save log details.
Do not run full samples smoke test; document skipped reason.

Required reports:
Create docs/dev/reports/codex_review.diff.
Create docs/dev/reports/codex_changed_files.txt.
Create docs/dev/reports/PR_26130_001-workspace-header-save-validation.md.
Update docs/dev/codex_commands.md.
Update docs/dev/commit_comment.txt.
Produce required repo-structured ZIP under tmp/.
```

## Commands Run

```powershell
Get-Content -Path "docs/dev/PROJECT_INSTRUCTIONS.md"
Get-Content -Path ".codex/skills/repo-build/SKILL.md"
git status --short
rg -n "repoPath" tools/workspace-manager-v2 tools/preview-generator-v2 tools/asset-manager-v2 tools/schemas games tests/playwright/tools/WorkspaceManagerV2.spec.mjs
rg -n "exportWorkspaceManifest|importWorkspaceManifest|onExportManifest|onImportManifest|setExportEnabled|exportManifestButton|importManifest|activeGame(Save|Close|Cancel)Button|workspace-manager-v2__active-game-controls" tools/workspace-manager-v2 tests/playwright/tools/WorkspaceManagerV2.spec.mjs
npm run test:workspace-v2
npm run test:workspace-v2
npm run test:workspace-v2
```

## Validation

`npm run test:workspace-v2` was attempted once with a 120 second command timeout and was cut off before Playwright returned a result.

`npm run test:workspace-v2` was rerun with a longer timeout and passed: 19 passed.

After removing the now-unreachable import/export app methods, `npm run test:workspace-v2` was run again and passed: 19 passed.

Full samples smoke test skipped because this PR is limited to Workspace Manager V2 / Preview Generator V2 lifecycle controls and save validation, and does not modify sample manifests broadly, shared sample loading, or runtime sample smoke behavior.

## Playwright Coverage

Updated `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` covers:

- Header Save, Close, and Cancel placement with Import/Export header actions removed.
- Opened-game disabling for repo destination selection and the game dropdown.
- Dirty-state lifecycle behavior: Save enabled and Close disabled while dirty; Save disabled and Close enabled after save.
- Save write verification against the active `game.manifest.json` toolState file.
- Post-save logs for saved path, file size, toolState item/count details, and validation result.
- Close clearing clean toolState state.
- Cancel warning before dirty toolState data is discarded.
