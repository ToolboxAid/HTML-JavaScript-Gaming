# Codex Commands - PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards

## Workflow
- Read `docs/dev/PROJECT_INSTRUCTIONS.md`.
- Used `.codex/skills/repo-build/SKILL.md`.
- Created `docs/pr/PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards/PLAN_PR.md`.
- Created `docs/pr/PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards/BUILD_PR.md`.
- Updated Palette Manager V2 only.
- Created `docs/pr/PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards/APPLY_PR.md`.

## Validation Commands
- `node --check tools/palette-manager-v2/controls/PaletteEditorControl.js`
- `node --check tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `node --check tools/palette-manager-v2/modules/paletteUtils.js`
- Targeted served-browser Palette Manager V2 tag normalization, duplicate guard, and selected-tag removal check using Playwright from Node.
- `git diff --check`
- `git diff --cached --check`
- `npm run test:workspace-v2`
- `npm run codex:review-artifacts`
- Python `zipfile` packaging for `tmp/PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards_delta.zip`

## Validation Outcome
- JavaScript syntax checks: PASS.
- Targeted served-browser Palette Manager V2 behavior check: PASS.
- `git diff --check`: PASS.
- `git diff --cached --check`: PASS.
- `npm run test:workspace-v2`: FAILED because the script is missing from `package.json`.
- Review artifacts: generated.
- Repo-structured delta ZIP: generated.
- Full samples smoke test: skipped by instruction.
