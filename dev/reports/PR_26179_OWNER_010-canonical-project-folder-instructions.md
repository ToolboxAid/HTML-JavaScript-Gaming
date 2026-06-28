# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T02:17:01Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No runtime code or production pages changed.

## Summary
- Added official Codex workflow command governance.
- Documented valid Start of Day command format for Owner, Alpha, Bravo, Charlie, and Gamma.
- Documented Start of Day as read-only and not requiring the current branch to be main.
- Documented PLAN_PR, BUILD_PR, and APPLY_PR execution phase rules and hard stops.
- Documented invalid command behavior: HARD STOP, return correct format, do not guess, do not partially execute.
- Updated Project Instructions pointers/load graph so command behavior resolves through the command SSoT.
- Replaced duplicate command/mode guidance with pointers.

## SSoT Decision
- Manual entry point SSoT: `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md`.
- Command governance SSoT: `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`.
- Bootstrap architecture SSoT remains `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md`.
- PR lifecycle governance remains `dev/build/ProjectInstructions/addendums/pr_workflow.md`.
- Retired command pointers: `dev/build/ProjectInstructions/chatGPT_command.txt` and `dev/build/ProjectInstructions/addendums/assistant_execution_modes.md`.

## Changed Files
```
M	dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
M	dev/build/ProjectInstructions/PROJECT_STATE.md
M	dev/build/ProjectInstructions/TEAM_START_COMMANDS.md
M	dev/build/ProjectInstructions/addendums/assistant_execution_modes.md
M	dev/build/ProjectInstructions/addendums/pr_workflow.md
M	dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md
M	dev/build/ProjectInstructions/chatGPT_command.txt
A	dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md
M	dev/reports/codex_changed_files.txt
M	dev/reports/codex_review.diff
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions.md
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions_requirement-checklist.md
M	dev/reports/PR_26179_OWNER_010-canonical-project-folder-instructions_validation-report.md
```

## Duplicate Guidance Review
- Full Start of Day command formats exist only in `standards/CODEX_WORKFLOW_COMMANDS.md`: PASS.
- Full PLAN_PR, BUILD_PR, APPLY_PR, and invalid command behavior exists only in `standards/CODEX_WORKFLOW_COMMANDS.md`: PASS.
- Other active docs contain pointers or lifecycle-specific context only: PASS.

## Validation
- `git diff --check`: PASS.
- `npm run validate:canonical-structure`: PASS.
- `node ./dev/scripts/run-platform-validation-suite.mjs`: PASS, 8/8 scenarios.

## Blockers
None.
