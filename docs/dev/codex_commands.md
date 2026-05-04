# Codex Commands - PR_26124_064-palette-manager-source-pin-scroll-preserve

## Workflow
- Read `docs/dev/PROJECT_INSTRUCTIONS.md`.
- Used `.codex/skills/repo-build/SKILL.md`.
- Checked git status before implementation.
- Created `docs/pr/PR_26124_064-palette-manager-source-pin-scroll-preserve/PLAN_PR.md`.
- Created `docs/pr/PR_26124_064-palette-manager-source-pin-scroll-preserve/BUILD_PR.md`.
- Read the active BUILD doc before changing runtime files.
- Updated only `tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`.
- Created `docs/pr/PR_26124_064-palette-manager-source-pin-scroll-preserve/APPLY_PR.md`.

## Validation Commands
- `node --check tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`
- Targeted served-browser Palette Manager V2 individual source pin/unpin scroll preservation validation using Playwright from Node.
- `git diff --check`
- `npm run test:workspace-v2`
- `git diff --cached --check`
- `npm run codex:review-artifacts`
- Python `zipfile` packaging for `tmp/PR_26124_064-palette-manager-source-pin-scroll-preserve_delta.zip`

## Validation Outcome
- JavaScript syntax check: PASS.
- Targeted served-browser Palette Manager V2 individual source pin/unpin scroll preservation validation: PASS.
- `git diff --check`: PASS with Git LF-to-CRLF warning for generated review artifact.
- `git diff --cached --check`: PASS.
- `npm run test:workspace-v2`: FAILED because the script is missing from `package.json`.
- Review artifacts: generated.
- Repo-structured delta ZIP: generated.
- Full samples smoke test: skipped by instruction.
