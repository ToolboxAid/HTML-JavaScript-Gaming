# Codex Commands

Task: PR_26154_002-docs-build-separation-teardown

Commands run:

- Read the project instructions before relocation, now at `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- `Get-Content .codex/skills/repo-build/SKILL.md`
- `git status --short --untracked-files=all`
- Targeted `Get-ChildItem`, `rg`, and `Get-Content` reads for public docs, build docs, the legacy public folder, and old tool references.
- Node move script for the former development docs folder to `docs_build/dev`, the former PR docs folder to `docs_build/pr`, and build-only docs buckets to `docs_build/`.
- Node removal script for the legacy public folder after relocation checks.
- Node path-rewrite scripts for `docs_build/dev`, `docs_build/pr`, and moved build-doc buckets.
- Encoding-aware Node path rewrite for UTF-16LE generated report files.
- Targeted `apply_patch` updates for active governance docs and `tools/old_localization-studio/index.html` root asset paths.
- Targeted reference validation for legacy docs paths, the legacy public folder path, and `docs_build/`.
- Targeted active changed-file validation: `node --check` and static HTML asset path resolution.
- `git diff --check`
- Temporary-index review diff generation for `docs_build/dev/reports/codex_review.diff`.
- `git status --short --untracked-files=all` and diff/stat commands for `docs_build/dev/reports/codex_changed_files.txt`.
- Node ZIP packaging command for `tmp/PR_26154_002-docs-build-separation-teardown_delta.zip`.

Validation summary:

- PASS legacy development and PR docs references are absent outside protected `docs_build/dev/start_of_day`.
- PASS legacy public-folder references are limited to historical reports, protected docs, or guard assertions.
- PASS legacy public, development-doc, and PR-doc folders are absent; required `docs_build/` folders are present.
- PASS `node --check` for 18 changed active JS/MJS/CJS files.
- PASS static HTML path validation for 4 changed active HTML files.
- PASS `git diff --check`.
- SKIPPED `npm run test:workspace-v2` because Workspace V2 launch/navigation behavior was not changed.
- SKIPPED full samples smoke test per request.
