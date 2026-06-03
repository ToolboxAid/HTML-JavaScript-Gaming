# Codex Commands

Task: PR_26154_006-theme-v2-asset-ownership-normalization

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `Get-Content`, `rg`, `Get-ChildItem`, and `git diff` reads for Theme V2 image ownership, `tool-display-mode.js`, affected pages/templates/tools, and report state.
- Node migration script to copy the engine-owned Theme V2 image tree to `assets/theme/v2/images/`, verify file parity, remove the former source image folder, and remove the temporary nested public image folder.
- Node rewrite script to update active text references to `assets/theme/v2/images/` while excluding protected `start_of_day/`, deprecated sample/game folders, generated review artifacts, and `tmp/`.
- `node --check src/engine/theme/v2/assets/js/tool-display-mode.js`
- Targeted public asset checks for:
  - `assets/theme/v2/images/badges/index.png`
  - `assets/theme/v2/images/characters/index.png`
- Targeted reference checks for the former engine-owned image folder, the temporary nested public image folder, and the canonical public image root.
- Static validation for changed HTML, JS, CSS, and Markdown files.
- Local browser validation of `tools/_templates-v2/index.html` with request status capture for both display-mode image requests.
- `git diff --check`
- `npm run codex:review-artifacts`
- Python ZIP packaging for `tmp/PR_26154_006-theme-v2-asset-ownership-normalization_delta.zip`

Validation summary:

- PASS `node --check src/engine/theme/v2/assets/js/tool-display-mode.js`.
- PASS public asset checks for `badges/index.png` and `characters/index.png`.
- PASS zero-reference checks for the former engine-owned image folder and temporary nested public image folder, excluding protected/generated paths.
- PASS canonical public image root exists with 111 files.
- PASS local browser validation: `/assets/theme/v2/images/badges/index.png` and `/assets/theme/v2/images/characters/index.png` both returned `200`.
- PASS static validation for changed HTML, JS, CSS, and Markdown files.
- PASS `git diff --check`.
- SKIPPED `npm run test:workspace-v2`; image ownership/pathing changed, tool launch/navigation behavior did not.
- SKIPPED old_games, old_samples, and full samples smoke validation per request.
