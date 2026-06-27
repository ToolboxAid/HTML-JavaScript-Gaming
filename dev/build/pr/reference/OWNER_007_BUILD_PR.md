# PR_26177_OWNER_007-project-instructions-single-source-eod-lock

## Purpose

Make `dev/build/ProjectInstructions/` the only active Project Instructions source and add EOD main lock plus next-day reset governance.

## Source Of Truth

This `dev/build/dev/pr/BUILD_PR.md`, `dev/build/dev/pr/PLAN_PR.md`, and the user request are the source of truth for `PR_26177_OWNER_007-project-instructions-single-source-eod-lock`.

## Exact Scope

- Audit repo for ProjectInstructions / project instructions duplicates.
- Establish `dev/build/ProjectInstructions/` as the only active source.
- Remove duplicate active instruction files from `dev/build/dev/` root.
- Remove stale one-off PR/restart files from `dev/build/dev/` root.
- Move PR-specific docs from `dev/build/dev/` root into `dev/build/dev/pr/`.
- Move active governance/contract docs from `dev/build/dev/` root into `dev/build/ProjectInstructions/addendums/`.
- Move audit outputs from `dev/build/dev/` root into `dev/reports/audits/`.
- Delete stale one-off bundle metadata from `dev/build/dev/` root.
- Add Tool MVP Stacked PR Standard under `dev/build/ProjectInstructions/`.
- Update PR planning/template and report requirements for tool MVP PRs.
- Add No Mock Repository Runtime Source governance under `dev/build/ProjectInstructions/`.
- Update Creator-testable stacked MVP standard to reject mock/page-array/JSON/browser-storage/tmp completion states.
- Move verified old/superseded DoD and roadmap docs to the existing root `dev/archive/` tree.
- Use the existing root `dev/archive/` tree instead of creating `dev/build/dev/archive/` or new `dev/build/ProjectInstructions/dev/archive/` paths.
- Keep preserved historical ProjectInstructions material reference-only.
- Keep `dev/build/ProjectInstructions/` out of this PR except for a tiny deprecated pointer.
- Update active team start/governance docs to reference only `dev/build/ProjectInstructions/`.
- Add EOD main lock, next-day reset governance, and canonical START / WORK / END branch lifecycle rules.
- Add required reports under `dev/reports/`.

## Exact Targets

- `dev/build/dev/pr/PLAN_PR.md`
- `dev/build/dev/pr/BUILD_PR.md`
- `dev/build/dev/pr/*.md`
- `dev/build/ProjectInstructions/README.txt`
- `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `dev/build/ProjectInstructions/TEAM_START_COMMANDS.md`
- `dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `dev/build/ProjectInstructions/addendums/*.md`
- `dev/build/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md`
- `dev/build/ProjectInstructions/addendums/no_mock_repository_runtime_source.md`
- `dev/build/ProjectInstructions/addendums/preservation.md`
- `dev/reports/audits/*.md`
- `dev/archive/docs_build/dev/dod/*.md`
- `dev/archive/docs_build/dev/roadmaps/*.md`
- `dev/build/ProjectInstructions/README.md` (tiny deprecated pointer only)
- `dev/build/dev/PROJECT_INSTRUCTIONS.md` (delete)
- `dev/build/dev/PROJECT_MULTI_PC.txt` (delete)
- `dev/build/dev/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md` (delete)
- `dev/build/dev/PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md` (delete)
- `dev/build/dev/codex_commands.md` (delete)
- `dev/build/dev/codex_rules.md` (delete)
- `dev/build/dev/commit_comment.txt` (delete)
- `dev/build/dev/next_command.txt` (delete if present)
- `dev/build/dev/NEXT_RESTART.md` (delete)
- `dev/build/dev/restart_notes_11_105.md` (delete)
- `dev/build/dev/restart_notes_11_110.md` (delete)
- `dev/build/dev/restart_notes_11_111.md` (delete)
- `dev/build/dev/restart_notes_11_112.md` (delete)
- `dev/build/dev/restart_notes_11_116.md` (delete)
- `dev/build/dev/restart_notes_11_118.md` (delete)
- `dev/build/dev/restart_notes_11_119.md` (delete)
- `dev/build/dev/restart_notes_11_120.md` (delete)
- `dev/build/dev/restart_notes_11_121.md` (delete)
- `dev/build/dev/restart_notes_11_122.md` (delete)
- `dev/build/dev/restart_notes_11_123.md` (delete)
- `dev/build/dev/bundle_readme.md` (delete)
- `dev/build/dev/validation_checklist.txt` (delete)
- `dev/build/dev/dod/tool_ui_readiness_dod.md` (move to root archive)
- `dev/build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` (move to root archive)
- `dev/build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_APPEND.md` (move to root archive)
- `dev/build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE.md` (move to root archive)
- `dev/build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE_8_19.md` (move to root archive)
- `dev/build/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md` (move to root archive)
- `dev/build/dev/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md` (move to root archive)
- `dev/build/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` (move to root archive)
- `dev/build/dev/roadmaps/MIDI_STUDIO_V2_ROADMAP.md` (move to root archive)
- `dev/build/dev/roadmaps/phases.txt` (move to root archive)
- `dev/build/dev/roadmaps/README.md` (move to root archive)
- `dev/reports/legacy-docs-archive-report.md`
- `dev/reports/PR_26177_OWNER_007-project-instructions-single-source-eod-lock*.md`
- `dev/reports/codex_review.diff`
- `dev/reports/codex_changed_files.txt`

## Out Of Scope

- No product/runtime changes.
- No feature work.
- No `start_of_day` changes.
- No legacy SQLite file changes.

## Validation

Run:

```powershell
Test-Path dev/build/dev/PROJECT_INSTRUCTIONS.md
Test-Path dev/build/dev/PROJECT_MULTI_PC.txt
Test-Path dev/build/dev/BUILD_PR.md
Test-Path dev/build/dev/PLAN_PR.md
Test-Path dev/build/dev/workspace_v2_playwright_gate.md
Test-Path dev/build/dev/samples2tools_adapter_guidance.md
Test-Path dev/build/dev/security-audit.md
Test-Path dev/build/dev/component-audit.md
Test-Path dev/build/dev/css-audit.md
Test-Path dev/build/dev/bundle_readme.md
Test-Path dev/build/dev/validation_checklist.txt
rg -n 'only active Project Instructions source|dev/build/ProjectInstructions/' dev/build/ProjectInstructions
rg -n 'Tool MVP Stacked PR Standard|Creator-testable outcome|What can Mr\\. Q test after applying this ZIP|What Playwright tests|What Mr\\. Q should manually test|Previous PR dependency|Next PR dependency' dev/build/ProjectInstructions
rg -n 'No Mock Repository Runtime Source|Browser → API → Database|Mock repositories are 100% technical debt|Game Configuration mock repository ready|Seeded demo data is fine only when it is stored in the database and read back through the API' dev/build/ProjectInstructions
rg -n 'dev/archive/docs_build/dev/ProjectInstructions/history|dev/archive/docs_build/dev/dod|dev/archive/docs_build/dev/roadmaps' dev/build/ProjectInstructions dev/reports/legacy-docs-archive-report.md
Test-Path dev/build/dev/archive
Test-Path dev/build/dev/dod
Test-Path dev/build/dev/dod/tool_ui_readiness_dod.md
Test-Path dev/build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
rg -n 'dev/build/dev/PROJECT_INSTRUCTIONS.md.*source of truth|Codex must always read `dev/build/dev/PROJECT_INSTRUCTIONS.md`|Read `dev/build/dev/PROJECT_INSTRUCTIONS.md`' dev/build/ProjectInstructions project-instructions
git diff --name-status $(git merge-base HEAD origin/main) -- project-instructions
git diff --name-status $(git merge-base HEAD origin/main) -- dev/build/dev/pr dev/build/ProjectInstructions/addendums dev/reports/audits
rg -n "Branch Lifecycle \\(Canonical\\)|Every PR follows exactly three phases|^START$|^WORK$|^END$|Mandatory Hard Stops|tomorrow's official baseline|No commits on main|Never checkout main|Only after ALL four pass" dev/build/ProjectInstructions
git diff --name-only -- src assets toolbox games api serverside package.json package-lock.json dev/build/dev/start_of_day
git diff --check
```
