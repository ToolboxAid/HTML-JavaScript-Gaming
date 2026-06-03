# Codex Commands

Task: PR_26154_007-theme-v2-template-cleanup

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `Get-Content`, `rg`, and `Get-ChildItem` reads for the Theme V2 templates, template references, and remaining Theme V2 asset surface.
- Node file operation script to move the page template to `/_page_template_v2.html`, remove the retired tool template, and delete the empty template folder.
- Node reference cleanup script for historical report references to the old template folder and retired tool template.
- Root template browser/HTTP validation found the header logo still resolving through the old partial-local image convention; patched `src/engine/theme/v2/assets/partials/header-nav.html` to use the public Theme V2 image root.
- Targeted reference checks for the old template folder, the retired tool template filename, and the root page template filename.
- Static validation for changed HTML, JS, CSS, and Markdown files.
- `git diff --check`
- `npm run codex:review-artifacts`
- Python ZIP packaging for `tmp/PR_26154_007-theme-v2-template-cleanup_delta.zip`

Validation summary:

- PASS root page template exists at `/_page_template_v2.html`.
- PASS root page template browser/HTTP check: page, Theme V2 CSS modules, partials, placeholder image, and logo all returned `200`.
- PASS old template folder was removed.
- PASS retired tool template file was removed.
- PASS zero-reference checks for the old template folder and retired tool template filename, excluding protected/generated paths.
- PASS static validation for changed HTML, JS, CSS, and Markdown files.
- PASS `git diff --check`.
- SKIPPED `npm run test:workspace-v2`; template location/report cleanup changed, active tool launch/navigation behavior did not.
- SKIPPED old_games, old_samples, and full samples smoke validation per request.
