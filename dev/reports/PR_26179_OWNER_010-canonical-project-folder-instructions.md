# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T02:32:48Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No runtime code or production pages changed.

## Summary
- Standardized active Project Instructions team names to Owner, Alfa, Bravo, Charlie, Delta, and Golf.
- Removed active Alpha/Gamma wording and speculative non-canonical team lists from Project Instructions.
- Updated Start of Day examples to Owner, Alfa, Bravo, Charlie, Delta, and Golf.
- Made `PROJECT_STATE.md` repository-truth oriented by removing transient current PR/current branch/worktree-style status.
- Clarified Start of Day as read-only discovery only and separated it from PLAN_PR, BUILD_PR, and APPLY_PR execution phases.

## Team Naming Result
- Canonical active teams: Owner, Alfa, Bravo, Charlie, Delta, Golf.
- Active ProjectInstructions grep for Alpha/Gamma/non-canonical team names: PASS, no historical exceptions remain.
- OWNER remains as approval authority wording where it is not used as a team name.

## PROJECT_STATE.md Result
- Required fields present: `project_state_version`, `last_updated`, `repository_status`, `current_main_commit`, `project_instructions_version`, `repository_structure_version`, `canonical_layout_version`, `active_teams`, `latest_owner_pr`, `latest_structure_pr`, `valid_top_level_folders`, `valid_dev_folders`, `known_technical_debt`.
- Removed transient fields: `current_pr`, active branch, current worktree status, today's task, and backlog task list.

## Lifecycle Clarification Result
- Start of Day is read-only discovery only and may recommend the next phase without executing it.
- PLAN_PR, BUILD_PR, and APPLY_PR are Codex PR execution phases after Start of Day.
- Lifecycle documented as Start of Day {Team} -> PLAN_PR -> BUILD_PR -> APPLY_PR.

## Changed Files
```
M	dev/build/ProjectInstructions/PROJECT_STATE.md
M	dev/build/ProjectInstructions/TEAM_START_COMMANDS.md
M	dev/build/ProjectInstructions/addendums/branch_lock_governance.md
M	dev/build/ProjectInstructions/addendums/multi_team.md
M	dev/build/ProjectInstructions/addendums/naming_registry.md
M	dev/build/ProjectInstructions/addendums/pr_workflow.md
M	dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md
M	dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md
M	dev/build/ProjectInstructions/addendums/team_release_readiness.md
M	dev/build/ProjectInstructions/addendums/team_start_and_release.md
M	dev/build/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md
M	dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md
M	dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md
M	dev/build/ProjectInstructions/team_assignments/ACTIVE_TEAM_REGISTRY.md
M	dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md
M	dev/build/ProjectInstructions/team_assignments/team_ownership.md
M	dev/reports/codex_changed_files.txt
M	dev/reports/codex_review.diff
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions.md
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions_requirement-checklist.md
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions_validation-report.md
```

## Validation
- `git diff --check`: PASS.
- `npm run validate:canonical-structure`: PASS.
- `node ./dev/scripts/run-platform-validation-suite.mjs`: PASS, 8/8 scenarios.
- Grep ProjectInstructions for Alpha/Gamma/non-canonical team names: PASS, no historical exceptions.

## Blockers
None.
