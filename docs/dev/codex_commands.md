# Codex Commands - PR_26130_034-active-game-lifecycle-controls

```text
codex

Changes:
Create PR_26130_034-active-game-lifecycle-controls.
Read docs/dev/PROJECT_INSTRUCTIONS.md first.
Limit scope to Workspace Manager V2 / Preview Generator V2 lifecycle controls.
Once a game/tool state is opened, disable repo destination selection and game dropdown.
In Active Game bottom controls, add Save, Close, and Cancel buttons.
Save button must be disabled when dirty is false and enabled when dirty is true.
Close button must be disabled when dirty is true and enabled when dirty is false.
Close clears the active session/toolState variable only when allowed.
Cancel must warn the user that information will be lost when dirty is true, then clear the active session/toolState only after confirmation.
Use toolState terminology in code/docs where applicable.
No silent fallback.
No unrelated files.
No start_of_day changes.

Validation:
Run npm run test:workspace-v2.
Add/update Playwright coverage for opened-game control disabling, dirty-state Save/Close state, Close clearing clean state, and Cancel dirty warning.
Do not run full samples smoke test; document skipped reason.

Required reports:
Create docs/dev/reports/codex_review.diff.
Create docs/dev/reports/codex_changed_files.txt.
Create docs/dev/reports/PR_26130_034-active-game-lifecycle-controls.md.
Update docs/dev/codex_commands.md.
Update docs/dev/commit_comment.txt.
Produce required repo-structured ZIP under tmp/.
```

## Validation Commands

```powershell
Get-Content -Path "docs/dev/PROJECT_INSTRUCTIONS.md"
node --check "tools/workspace-manager-v2/js/WorkspaceManagerV2App.js"
node --check "tools/workspace-manager-v2/js/controls/GameSelectorControl.js"
node --check "tools/preview-generator-v2/PreviewGeneratorV2App.js"
node --check "tests/playwright/tools/WorkspaceManagerV2.spec.mjs"
npm run test:workspace-v2
npm run codex:review-artifacts
```

## Playwright

Playwright impacted: Yes.

`npm run test:workspace-v2` validates that opened Workspace Manager V2 game toolState locks repo destination and game selection, Preview Generator V2 workspace launch locks repo/game target controls, dirty toolState enables Save and disables Close, clean toolState disables Save and enables Close, Close clears clean active toolState data, and Cancel warns before discarding dirty toolState data.

Expected pass behavior: all Workspace Manager V2 Playwright tests pass with no page errors and the lifecycle buttons match dirty state.

Expected fail behavior: the test fails if repo/game controls remain editable after opening a toolState, Save/Close invert dirty behavior, Close clears dirty data, or Cancel clears dirty data without confirmation.

## Test Notes

`npm run test:workspace-v2` passed: 20 passed.

Full samples smoke test skipped because this PR is limited to Workspace Manager V2 / Preview Generator V2 lifecycle controls and does not modify shared sample loading, sample JSON, or broadly impacted sample runtime behavior.

## Manual Test

1. Open Workspace Manager V2.
2. Pick the repo folder and select Asteroids.
3. Confirm Pick Repo Folder and the game selector are disabled, Save is disabled, Close is enabled, and Cancel is enabled.
4. Launch Palette Manager V2, make a palette edit, and return to Workspace Manager V2.
5. Confirm Save is enabled, Close is disabled, and Cancel warns before discarding dirty toolState data.
6. Save, then confirm Save is disabled and Close is enabled.
7. Close and confirm the active game/toolState clears and repo/game selection can start over.
