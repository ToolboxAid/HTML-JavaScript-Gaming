# PR_26177_OWNER_007-project-instructions-single-source-eod-lock

## Purpose

Make `dev/docs_build/dev/ProjectInstructions/` the only active Project Instructions source and add EOD main lock plus next-day reset governance.

## Source Of Truth

This `dev/docs_build/dev/pr/BUILD_PR.md`, `dev/docs_build/dev/pr/PLAN_PR.md`, and the user request are the source of truth for `PR_26177_OWNER_007-project-instructions-single-source-eod-lock`.

## Exact Scope

- Audit repo for ProjectInstructions / project instructions duplicates.
- Establish `dev/docs_build/dev/ProjectInstructions/` as the only active source.
- Remove duplicate active instruction files from `dev/docs_build/dev/` root.
- Remove stale one-off PR/restart files from `dev/docs_build/dev/` root.
- Move PR-specific docs from `dev/docs_build/dev/` root into `dev/docs_build/dev/pr/`.
- Move active governance/contract docs from `dev/docs_build/dev/` root into `dev/docs_build/dev/ProjectInstructions/addendums/`.
- Move audit outputs from `dev/docs_build/dev/` root into `dev/docs_build/dev/reports/audits/`.
- Delete stale one-off bundle metadata from `dev/docs_build/dev/` root.
- Add Tool MVP Stacked PR Standard under `dev/docs_build/dev/ProjectInstructions/`.
- Update PR planning/template and report requirements for tool MVP PRs.
- Add No Mock Repository Runtime Source governance under `dev/docs_build/dev/ProjectInstructions/`.
- Update Creator-testable stacked MVP standard to reject mock/page-array/JSON/browser-storage/tmp completion states.
- Move verified old/superseded DoD and roadmap docs to the existing root `dev/archive/` tree.
- Use the existing root `dev/archive/` tree instead of creating `dev/docs_build/dev/archive/` or new `dev/docs_build/dev/ProjectInstructions/dev/archive/` paths.
- Keep preserved historical ProjectInstructions material reference-only.
- Keep `dev/project-instructions/` out of this PR except for a tiny deprecated pointer.
- Update active team start/governance docs to reference only `dev/docs_build/dev/ProjectInstructions/`.
- Add EOD main lock, next-day reset governance, and canonical START / WORK / END branch lifecycle rules.
- Add required reports under `dev/docs_build/dev/reports/`.

## Exact Targets

- `dev/docs_build/dev/pr/PLAN_PR.md`
- `dev/docs_build/dev/pr/BUILD_PR.md`
- `dev/docs_build/dev/pr/*.md`
- `dev/docs_build/dev/ProjectInstructions/README.txt`
- `dev/docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `dev/docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md`
- `dev/docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `dev/docs_build/dev/ProjectInstructions/addendums/*.md`
- `dev/docs_build/dev/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md`
- `dev/docs_build/dev/ProjectInstructions/addendums/no_mock_repository_runtime_source.md`
- `dev/docs_build/dev/ProjectInstructions/addendums/preservation.md`
- `dev/docs_build/dev/reports/audits/*.md`
- `dev/archive/docs_build/dev/dod/*.md`
- `dev/archive/docs_build/dev/roadmaps/*.md`
- `dev/project-instructions/README.md` (tiny deprecated pointer only)
- `dev/docs_build/dev/PROJECT_INSTRUCTIONS.md` (delete)
- `dev/docs_build/dev/PROJECT_MULTI_PC.txt` (delete)
- `dev/docs_build/dev/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md` (delete)
- `dev/docs_build/dev/PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md` (delete)
- `dev/docs_build/dev/codex_commands.md` (delete)
- `dev/docs_build/dev/codex_rules.md` (delete)
- `dev/docs_build/dev/commit_comment.txt` (delete)
- `dev/docs_build/dev/next_command.txt` (delete if present)
- `dev/docs_build/dev/NEXT_RESTART.md` (delete)
- `dev/docs_build/dev/restart_notes_11_105.md` (delete)
- `dev/docs_build/dev/restart_notes_11_110.md` (delete)
- `dev/docs_build/dev/restart_notes_11_111.md` (delete)
- `dev/docs_build/dev/restart_notes_11_112.md` (delete)
- `dev/docs_build/dev/restart_notes_11_116.md` (delete)
- `dev/docs_build/dev/restart_notes_11_118.md` (delete)
- `dev/docs_build/dev/restart_notes_11_119.md` (delete)
- `dev/docs_build/dev/restart_notes_11_120.md` (delete)
- `dev/docs_build/dev/restart_notes_11_121.md` (delete)
- `dev/docs_build/dev/restart_notes_11_122.md` (delete)
- `dev/docs_build/dev/restart_notes_11_123.md` (delete)
- `dev/docs_build/dev/bundle_readme.md` (delete)
- `dev/docs_build/dev/validation_checklist.txt` (delete)
- `dev/docs_build/dev/dod/tool_ui_readiness_dod.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_APPEND.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE_8_19.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/MIDI_STUDIO_V2_ROADMAP.md` (move to root archive)
- `dev/docs_build/dev/roadmaps/phases.txt` (move to root archive)
- `dev/docs_build/dev/roadmaps/README.md` (move to root archive)
- `dev/docs_build/dev/reports/legacy-docs-archive-report.md`
- `dev/docs_build/dev/reports/PR_26177_OWNER_007-project-instructions-single-source-eod-lock*.md`
- `dev/docs_build/dev/reports/codex_review.diff`
- `dev/docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No product/runtime changes.
- No feature work.
- No `start_of_day` changes.
- No legacy SQLite file changes.

## Validation

Run:

```powershell
Test-Path dev/docs_build/dev/PROJECT_INSTRUCTIONS.md
Test-Path dev/docs_build/dev/PROJECT_MULTI_PC.txt
Test-Path dev/docs_build/dev/BUILD_PR.md
Test-Path dev/docs_build/dev/PLAN_PR.md
Test-Path dev/docs_build/dev/workspace_v2_playwright_gate.md
Test-Path dev/docs_build/dev/samples2tools_adapter_guidance.md
Test-Path dev/docs_build/dev/security-audit.md
Test-Path dev/docs_build/dev/component-audit.md
Test-Path dev/docs_build/dev/css-audit.md
Test-Path dev/docs_build/dev/bundle_readme.md
Test-Path dev/docs_build/dev/validation_checklist.txt
rg -n 'only active Project Instructions source|dev/docs_build/dev/ProjectInstructions/' dev/docs_build/dev/ProjectInstructions
rg -n 'Tool MVP Stacked PR Standard|Creator-testable outcome|What can Mr\\. Q test after applying this ZIP|What Playwright tests|What Mr\\. Q should manually test|Previous PR dependency|Next PR dependency' dev/docs_build/dev/ProjectInstructions
rg -n 'No Mock Repository Runtime Source|Browser → API → Database|Mock repositories are 100% technical debt|Game Configuration mock repository ready|Seeded demo data is fine only when it is stored in the database and read back through the API' dev/docs_build/dev/ProjectInstructions
rg -n 'dev/archive/docs_build/dev/ProjectInstructions/history|dev/archive/docs_build/dev/dod|dev/archive/docs_build/dev/roadmaps' dev/docs_build/dev/ProjectInstructions dev/docs_build/dev/reports/legacy-docs-archive-report.md
Test-Path dev/docs_build/dev/archive
Test-Path dev/docs_build/dev/dod
Test-Path dev/docs_build/dev/dod/tool_ui_readiness_dod.md
Test-Path dev/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
rg -n 'dev/docs_build/dev/PROJECT_INSTRUCTIONS.md.*source of truth|Codex must always read `dev/docs_build/dev/PROJECT_INSTRUCTIONS.md`|Read `dev/docs_build/dev/PROJECT_INSTRUCTIONS.md`' dev/docs_build/dev/ProjectInstructions project-instructions
git diff --name-status $(git merge-base HEAD origin/main) -- project-instructions
git diff --name-status $(git merge-base HEAD origin/main) -- dev/docs_build/dev/pr dev/docs_build/dev/ProjectInstructions/addendums dev/docs_build/dev/reports/audits
rg -n "Branch Lifecycle \\(Canonical\\)|Every PR follows exactly three phases|^START$|^WORK$|^END$|Mandatory Hard Stops|tomorrow's official baseline|No commits on main|Never checkout main|Only after ALL four pass" dev/docs_build/dev/ProjectInstructions
git diff --name-only -- src assets toolbox games api serverside package.json package-lock.json dev/docs_build/dev/start_of_day
git diff --check
```
