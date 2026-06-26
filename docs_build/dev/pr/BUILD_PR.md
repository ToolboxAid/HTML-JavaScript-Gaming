# PR_26177_OWNER_007-project-instructions-single-source-eod-lock

## Purpose

Make `docs_build/dev/ProjectInstructions/` the only active Project Instructions source and add EOD main lock plus next-day reset governance.

## Source Of Truth

This `docs_build/dev/pr/BUILD_PR.md`, `docs_build/dev/pr/PLAN_PR.md`, and the user request are the source of truth for `PR_26177_OWNER_007-project-instructions-single-source-eod-lock`.

## Exact Scope

- Audit repo for ProjectInstructions / project instructions duplicates.
- Establish `docs_build/dev/ProjectInstructions/` as the only active source.
- Remove duplicate active instruction files from `docs_build/dev/` root.
- Remove stale one-off PR/restart files from `docs_build/dev/` root.
- Move PR-specific docs from `docs_build/dev/` root into `docs_build/dev/pr/`.
- Move active governance/contract docs from `docs_build/dev/` root into `docs_build/dev/ProjectInstructions/addendums/`.
- Move audit outputs from `docs_build/dev/` root into `docs_build/dev/reports/audits/`.
- Delete stale one-off bundle metadata from `docs_build/dev/` root.
- Add Tool MVP Stacked PR Standard under `docs_build/dev/ProjectInstructions/`.
- Update PR planning/template and report requirements for tool MVP PRs.
- Keep preserved historical ProjectInstructions material reference-only.
- Keep `project-instructions/` out of this PR except for a tiny deprecated pointer.
- Update active team start/governance docs to reference only `docs_build/dev/ProjectInstructions/`.
- Add EOD main lock, next-day reset governance, and canonical START / WORK / END branch lifecycle rules.
- Add required reports under `docs_build/dev/reports/`.

## Exact Targets

- `docs_build/dev/pr/PLAN_PR.md`
- `docs_build/dev/pr/BUILD_PR.md`
- `docs_build/dev/pr/*.md`
- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md`
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/addendums/*.md`
- `docs_build/dev/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md`
- `docs_build/dev/reports/audits/*.md`
- `project-instructions/README.md` (tiny deprecated pointer only)
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` (delete)
- `docs_build/dev/PROJECT_MULTI_PC.txt` (delete)
- `docs_build/dev/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md` (delete)
- `docs_build/dev/PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md` (delete)
- `docs_build/dev/codex_commands.md` (delete)
- `docs_build/dev/codex_rules.md` (delete)
- `docs_build/dev/commit_comment.txt` (delete)
- `docs_build/dev/next_command.txt` (delete if present)
- `docs_build/dev/NEXT_RESTART.md` (delete)
- `docs_build/dev/restart_notes_11_105.md` (delete)
- `docs_build/dev/restart_notes_11_110.md` (delete)
- `docs_build/dev/restart_notes_11_111.md` (delete)
- `docs_build/dev/restart_notes_11_112.md` (delete)
- `docs_build/dev/restart_notes_11_116.md` (delete)
- `docs_build/dev/restart_notes_11_118.md` (delete)
- `docs_build/dev/restart_notes_11_119.md` (delete)
- `docs_build/dev/restart_notes_11_120.md` (delete)
- `docs_build/dev/restart_notes_11_121.md` (delete)
- `docs_build/dev/restart_notes_11_122.md` (delete)
- `docs_build/dev/restart_notes_11_123.md` (delete)
- `docs_build/dev/bundle_readme.md` (delete)
- `docs_build/dev/validation_checklist.txt` (delete)
- `docs_build/dev/reports/PR_26177_OWNER_007-project-instructions-single-source-eod-lock*.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No product/runtime changes.
- No feature work.
- No `start_of_day` changes.
- No legacy SQLite file changes.

## Validation

Run:

```powershell
Test-Path docs_build/dev/PROJECT_INSTRUCTIONS.md
Test-Path docs_build/dev/PROJECT_MULTI_PC.txt
Test-Path docs_build/dev/BUILD_PR.md
Test-Path docs_build/dev/PLAN_PR.md
Test-Path docs_build/dev/workspace_v2_playwright_gate.md
Test-Path docs_build/dev/samples2tools_adapter_guidance.md
Test-Path docs_build/dev/security-audit.md
Test-Path docs_build/dev/component-audit.md
Test-Path docs_build/dev/css-audit.md
Test-Path docs_build/dev/bundle_readme.md
Test-Path docs_build/dev/validation_checklist.txt
rg -n 'only active Project Instructions source|docs_build/dev/ProjectInstructions/' docs_build/dev/ProjectInstructions
rg -n 'Tool MVP Stacked PR Standard|Creator-testable outcome|What can Mr\\. Q test after applying this ZIP|What Playwright tests|What Mr\\. Q should manually test|Previous PR dependency|Next PR dependency' docs_build/dev/ProjectInstructions
rg -n 'docs_build/dev/PROJECT_INSTRUCTIONS.md.*source of truth|Codex must always read `docs_build/dev/PROJECT_INSTRUCTIONS.md`|Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`' docs_build/dev/ProjectInstructions project-instructions
git diff --name-status $(git merge-base HEAD origin/main) -- project-instructions
git diff --name-status $(git merge-base HEAD origin/main) -- docs_build/dev/pr docs_build/dev/ProjectInstructions/addendums docs_build/dev/reports/audits
rg -n "Branch Lifecycle \\(Canonical\\)|Every PR follows exactly three phases|^START$|^WORK$|^END$|Mandatory Hard Stops|tomorrow's official baseline|No commits on main|Never checkout main|Only after ALL four pass" docs_build/dev/ProjectInstructions
git diff --name-only -- src assets toolbox games api serverside package.json package-lock.json docs_build/dev/start_of_day
git diff --check
```
