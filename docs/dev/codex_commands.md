# Codex Commands - PR_26124_061-palette-manager-tag-clear-undo-location-and-pin-scroll

## Workflow
- Read `docs/dev/PROJECT_INSTRUCTIONS.md`.
- Used `.codex/skills/repo-build/SKILL.md`.
- Checked git status before implementation.
- Created `docs/pr/PR_26124_061-palette-manager-tag-clear-undo-location-and-pin-scroll/PLAN_PR.md`.
- Created `docs/pr/PR_26124_061-palette-manager-tag-clear-undo-location-and-pin-scroll/BUILD_PR.md`.
- Read the active BUILD doc before changing runtime files.
- Updated Palette Manager V2 only.
- Created `docs/pr/PR_26124_061-palette-manager-tag-clear-undo-location-and-pin-scroll/APPLY_PR.md`.

## Validation Commands
- `node --check tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `node --check tools/palette-manager-v2/controls/PaletteEditorControl.js`
- `node --check tools/palette-manager-v2/controls/UserPaletteControl.js`
- `node --check tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`
- Targeted served-browser Palette Manager V2 selection clear, heading action placement, tag add, and source scroll preservation validation using Playwright from Node.
- `git diff --check`
- `npm run test:workspace-v2`
- `git diff --cached --check`
- `npm run codex:review-artifacts`
- Python `zipfile` packaging for `tmp/PR_26124_061-palette-manager-tag-clear-undo-location-and-pin-scroll_delta.zip`

## Validation Outcome
- JavaScript syntax checks: PASS.
- Targeted served-browser Palette Manager V2 selection clear, heading action placement, tag add, and source scroll preservation check: PASS.
- `git diff --check`: PASS with Git LF-to-CRLF warnings for changed Palette Manager files.
- `git diff --cached --check`: PASS.
- `npm run test:workspace-v2`: FAILED because the script is missing from `package.json`.
- Review artifacts: generated.
- Repo-structured delta ZIP: generated.
- Full samples smoke test: skipped by instruction.
