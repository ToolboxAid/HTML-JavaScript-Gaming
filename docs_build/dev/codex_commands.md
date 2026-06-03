# Codex Commands

Task: PR_26154_004-root-structure-samples-tools-theme-license

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `rg`, `Get-Content`, `Select-String`, and `git diff` reads for root surfaces, games, samples, tools, Theme V2, license, docs_build references, and engine-v2 evidence.
- Node/path move work for:
  - `samples/` to `old_samples/`
  - `arcade/` to `games/arcade/`
  - `cloud/` to `tools/cloud/`
  - confirmed legacy `tools/old*`, `tools/_templates-v2_deprecated/`, `tools/codex/`, and `tools/common/` to `old-tools/`
- Targeted path rewrites for `old_samples/`, `games/`, `tools/cloud/`, `old-tools/`, Theme V2 route map/partials, tool accordions, old sample helpers, and validation routing.
- Targeted path validation for required moved paths, obsolete source folders, active HTML references, Theme V2 routes, and partial assets.
- `node --check scripts/write-codex-review-artifacts.mjs`
- `node --check scripts/skip-deprecated-sample-tests.mjs`
- `node tools/dev/checkSharedExtractionGuard.mjs`
- `node tools/dev/checkStyleSystemGuard.mjs`
- `npm run test:workspace-v2`
- `npm run test:lane:samples`
- Active changed-file static validation with `node --check`, JSON parsing, and HTML/Markdown readability checks.
- Targeted reference validation for `docs_build/`, `old_samples/`, `games/`, `tools/`, `old-tools/`, `assets/theme/v1/`, `LICENSE`, and `engine-v2`.
- `git diff --check`
- `npm run codex:review-artifacts`
- Python ZIP packaging for `tmp/PR_26154_004-root-structure-samples-tools-theme-license_delta.zip`

Validation summary:

- PASS targeted path validation for moved pages, required/obsolete folders, Theme V2 route map targets, and partial assets.
- PASS active changed-file static validation - 32 JS/MJS files syntax-checked, 4 JSON files parsed, 16 active HTML files read, and 4 Markdown files read.
- PASS `node tools/dev/checkSharedExtractionGuard.mjs`.
- PASS `node tools/dev/checkStyleSystemGuard.mjs`.
- PASS `npm run test:workspace-v2` - 2 Playwright checks passed for root tools future-state links and Tool Template V2 root Theme V2 loading.
- PASS `npm run test:lane:samples` - samples lane compiled with no targets, no commands, zero browser launches, and deprecated `old_samples` excluded from active automated validation.
- PASS targeted reference checks for active `docs_build/`, `old_samples/`, `games/`, `tools/`, `old-tools/`, `assets/theme/v1/`, `LICENSE`, and `engine-v2` surfaces.
- SKIPPED full samples smoke test per request.
- SKIPPED full samples/game smoke against `old_samples` and `old_games` per request.
- WARN historical docs, protected `start_of_day`, retired tests, and deprecated `old-tools/` content still contain old path text as preserved reference material.
