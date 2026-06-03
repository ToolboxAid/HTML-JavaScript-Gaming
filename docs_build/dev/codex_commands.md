# Codex Commands

Task: PR_26154_008-theme-v2-public-asset-teardown

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `Get-Content`, `rg`, and `Get-ChildItem` reads for the remaining Theme V2 public asset source surface and existing `assets/theme/v2/` destination.
- Node copy/verify/delete move script for:
  - `assets/theme/v2/css/`
  - `assets/theme/v2/js/`
  - `assets/theme/v2/partials/`
  - `assets/theme/v2/images/image-missing.svg`
- Node reference rewrite script to update old public Theme V2 asset-root references to `assets/theme/v2/`.
- Node cleanup script to normalize placeholder image references to `assets/theme/v2/images/image-missing.svg`.
- Targeted reference checks for the former source folder string and public destination folders.
- Static validation for changed HTML, JS, CSS, and Markdown files.
- Root template/tool template browser checks for public CSS, JS, partial, and placeholder image loading.
- `git diff --check`
- `npm run codex:review-artifacts`
- Python ZIP packaging for `tmp/PR_26154_008-theme-v2-public-asset-teardown_delta.zip`

Validation summary:

- PASS public CSS, JS, partial, and placeholder image destinations exist.
- PASS former Theme V2 source folder removed after the move.
- PASS zero-reference checks for the former Theme V2 source folder string, excluding protected/generated paths.
- PASS static validation for changed HTML, JS, CSS, and Markdown files.
- PASS root template/tool template browser checks.
- PASS `git diff --check`.
- SKIPPED `npm run test:workspace-v2`; public asset paths changed, active tool launch/navigation behavior did not.
- SKIPPED old_games, old_samples, and full samples smoke validation per request.
