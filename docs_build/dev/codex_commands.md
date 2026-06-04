# Codex Commands

Task:

- `PR_26154_042-toolbox-route-reference-hygiene`
- `PR_26154_043-docs-build-archive-consolidation`
- `PR_26154_044-final-active-toolbox-template-gate`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used `PR_26154_039-041-builder-shared-active-closeout` as baseline.
- Audited active route references for removed builder surfaces.
- Confirmed `toolbox/game-design/` is the only active game design/build planning surface.
- Moved 46 historical builder/route reports from `docs_build/dev/reports/` to `archive/v1-v2/docs_build/dev/reports/toolbox-builder-route-history/`.
- Moved existing `docs_build/dev/archive/object-vector-studio-v2/starter-project-template/` material to `archive/v1-v2/docs_build/dev/archive/object-vector-studio-v2/starter-project-template/`.
- Updated docs_build references to moved archive material.
- Ran the final active Toolbox template gate across all active tool pages.
- Did not modify `start_of_day/`.
- Did not run tests against `archive/v1-v2/`.
- Did not run the full samples smoke test.

Validation:

- Ran targeted active route scans for retired builder paths.
- Ran targeted docs_build archive reference checks.
- Ran final active Toolbox template consistency audit with counts.
- Ran `node scripts/validate-active-tools-surface.mjs`.
- Ran changed-file static validation for HTML, JS, CSS, JSON, and Markdown files.
- Ran `git diff --check`.
- Skipped `npm run test:workspace-v2` because active Toolbox navigation and template wiring were not changed.
- Regenerated required Codex review artifacts.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_042-044-toolbox-route-archive-template-gate_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/toolbox_route_reference_hygiene_report.md`
- `docs_build/dev/reports/docs_build_archive_consolidation_report.md`
- `docs_build/dev/reports/final_active_toolbox_template_gate_report.md`

Validation summary:

- PASS: active builder route hygiene.
- PASS: docs_build archive consolidation.
- PASS: active Toolbox template gate, 18 of 18 pages passing.
- PASS: static validation.
- PASS: `git diff --check`.
- SKIPPED: Workspace V2 Playwright because no active nav/template behavior changed.
- SKIPPED: archive tests and full samples smoke test.
