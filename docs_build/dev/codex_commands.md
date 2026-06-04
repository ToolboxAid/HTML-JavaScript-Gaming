# Codex Commands

Task:

- `PR_26154_045-active-toolbox-reduction`
- `PR_26154_046-archive-v1-v2-finalization`
- `PR_26154_047-toolbox-endstate-inventory`

Changes:

- Read `.codex/skills/repo-build/SKILL.md`.
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used `PR_26154_042-044-toolbox-route-archive-template-gate` as baseline.
- Audited active Toolbox folders and classified requested candidates.
- Moved `toolbox/configuration-admin/` to `archive/v1-v2/tools/toolbox-reduction-reference/configuration-admin/`.
- Moved `toolbox/creator/` to `archive/v1-v2/tools/toolbox-reduction-reference/tool-creator/`.
- Removed Configuration Admin and Tool Creator from active header navigation, route aliases, and Toolbox index grouping.
- Updated active surface validation to reject the retired Toolbox folders if they return.
- Rewired hidden legacy registry/sample references from removed `old-tools` and `old_samples` roots to `archive/v1-v2`.
- Updated docs_build guard scripts and selected validation utilities for archive path ownership.
- Produced active Toolbox and archive end-state reports.
- Did not modify `start_of_day/`.
- Did not run tests against `archive/v1-v2/`.
- Did not run the full samples smoke test.

Validation:

- Ran targeted active route scans for retired Configuration Admin and Tool Creator paths.
- Ran targeted archive path checks for `archive/v1-v2/tools`, `archive/v1-v2/games`, and `archive/v1-v2/samples`.
- Ran active Toolbox template consistency audit: 16 active pages, 10 markers, 0 mismatches.
- Ran `node scripts/validate-active-tools-surface.mjs`.
- Ran `node docs_build/dev/toolbox/checkSharedExtractionGuard.mjs`.
- Ran changed-file JavaScript syntax checks with `node --check`.
- Ran changed JSON parse checks.
- Ran `python -m py_compile scripts/engine_usage_audit.py`.
- Ran `npm run test:workspace-v2`.
- Ran `git diff --check`.
- Regenerated required Codex review artifacts.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_045-047-toolbox-reduction-archive-endstate_delta.zip`

Required reports:

- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/active_toolbox_reduction_report.md`
- `docs_build/dev/reports/archive_v1_v2_finalization_report.md`
- `docs_build/dev/reports/toolbox_endstate_inventory_report.md`

Validation summary:

- PASS: active Toolbox surface reduced to 16 active pages.
- PASS: retired tool routes removed from active nav/index/route aliases.
- PASS: active Toolbox template audit.
- PASS: Workspace V2 lane, 2 Playwright tests passed.
- PASS: static syntax/JSON validation for changed files.
- PASS: `git diff --check`.
- INFO: optional Phase 24 guard now resolves archive paths from repo root, but its existing roadmap hash lock is stale and was not used as this PR's gate.
- SKIPPED: tests against `archive/v1-v2/`.
- SKIPPED: full samples smoke test.
