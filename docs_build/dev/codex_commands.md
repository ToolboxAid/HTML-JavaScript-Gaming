# Codex Commands

Task:

- `PR_26154_029-theme-v2-root-rename`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Confirmed PR_26154_026-028 convergence baseline was clean enough to proceed.
- Renamed the public Theme V2 asset root to `assets/theme-v2/`.
- Updated active public/root page references to `assets/theme-v2`.
- Updated active toolbox page references to `assets/theme-v2`.
- Updated `_page_template_v2.html` and `toolbox/_tool_template-v2/index.html`.
- Updated Theme V2 JS, partial, and toolbox index helper references.
- Updated Theme V2 docs/governance references.
- Adjusted moved Theme V2 CSS image URLs so checked `url(...)` targets resolve.
- Did not modify `old-tools/`, `old_games/`, `old_samples/`, or `start_of_day/`.

Validation:

- Ran targeted reference checks for the retired Theme V2 root path and `assets/theme-v2`.
- Ran Theme V2 CSS import and `url(...)` target validation.
- Ran template consistency audit after the rename.
- Ran static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- Ran `npm run test:workspace-v2`.
- Ran `git diff --check`.
- Ran `npm run codex:review-artifacts`.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_029-theme-v2-root-rename_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/theme_v2_root_rename_report.md`
- `docs_build/dev/reports/template_consistency_after_theme_rename_report.md`

Validation summary:

- PASS baseline convergence audit before rename: public/root pages `43/43`, active toolbox pages `20/20`.
- PASS post-rename template audit: public/root pages `43/43`, active toolbox pages `20/20`.
- PASS `assets/theme-v2/` exists.
- PASS the retired Theme V2 root path does not exist.
- PASS zero active references remain to the retired Theme V2 root path.
- PASS active references resolve to `assets/theme-v2`.
- PASS Theme V2 CSS import and image URL targets resolve.
- PASS `npm run test:workspace-v2`.
- PASS `git diff --check`.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples/` per request.
- SKIPPED full samples smoke test per request.
