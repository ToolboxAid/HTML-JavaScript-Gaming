# Codex Commands

Task: PR_26154_003-deprecated-games-docs-tools-normalize

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short`
- Targeted `rg`, `Get-Content`, and `git diff` reads for moved game, docs, tools, Theme V2, test-runner, and report surfaces.
- Node/path move work for:
  - `games/` to `old_games/`
  - `docs/design/` to `docs_build/design/`
  - `docs/reference/` to `docs_build/reference/`
  - `docs/release/` to `docs_build/release/`
  - `docs/tools/` to `docs_build/tools/`
  - `tools/schemas/docs/` to `docs_build/schemas/docs/`
  - root tool HTML pages to `tools/<toolname>/index.html`
- Targeted path rewrites for public tool routes, Theme V2 partial routes, workspace/tool launch registration, deprecated game path helpers, and validation routing.
- `npm run test:workspace-v2`
- `npm run test:workspace-manager:games`
- Active changed-file static validation with `node --check`, JSON parsing, HTML policy checks, and local path checks.
- `node tools/dev/checkSharedExtractionGuard.mjs`
- Targeted reference validation for `games/`, `old_games/`, `docs/`, `docs_build/`, schema-doc, and tool route paths.
- `git diff --check`
- Review artifact generation for `docs_build/dev/reports/codex_review.diff`.
- Changed-file artifact generation for `docs_build/dev/reports/codex_changed_files.txt`.
- Python ZIP packaging for `tmp/PR_26154_003-deprecated-games-docs-tools-normalize_delta.zip`.

Validation summary:

- PASS `npm run test:workspace-v2` - 2 Playwright checks passed for root tools future-state links and Tool Template V2 root Theme V2 loading.
- PASS `npm run test:workspace-manager:games` - deprecated old_games validation command reports SKIP by design.
- PASS active changed-file static validation - 49 JS/MJS files syntax-checked, 10 JSON files parsed, 25 active HTML files checked, old_games runtime execution skipped.
- PASS `node tools/dev/checkSharedExtractionGuard.mjs`.
- PASS targeted reference validation for moved folders, public docs-only shape, tool folder indexes, route rewrites, start_of_day status, and deprecated game test exclusion.
- PASS `git diff --check`.
- WARN remaining `games/` strings exist only in historical generated reports, retired game tests, deprecated `tools/old_*` folders, and legacy PowerShell helper assumptions; they are documented in the PR report and excluded from active validation.
- SKIPPED full samples smoke test per request.
