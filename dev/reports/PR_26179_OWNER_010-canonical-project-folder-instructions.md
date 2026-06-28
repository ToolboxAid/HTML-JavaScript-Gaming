# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T02:50:06Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No runtime code or production pages changed.

## Summary
- Fixed Start of Day baseline governance in the Codex workflow command SSoT.
- Start of Day now requires current branch `main`, clean worktree, latest `origin/main`, and local/origin main sync.
- Removed conflicting wording that Start of Day must not require `main`.
- Documented allowed Start of Day sync actions: `git fetch origin` and `git pull --ff-only origin main`.
- Documented hard-stop correction steps when Start of Day is invoked away from `main`.
- Updated bootstrap and workflow docs so SOD reports recommendations only; branch creation/use happens after SOD through PR execution phases.

## SOD Baseline Result
- Start of Day requires `main`: PASS.
- Start of Day requires clean worktree: PASS.
- Start of Day fetch/pull latest `origin/main`: PASS.
- Start of Day verifies local `main` and `origin/main` sync: PASS.
- If not on `main`, SOD HARD STOP steps documented: PASS.
- Read-only SOD preserved except allowed git sync actions: PASS.

## Changed Files
```
M	dev/build/ProjectInstructions/addendums/pr_workflow.md
M	dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md
M	dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md
M	dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md
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
- Conflict scan for `Start of Day must not require` and SOD branch-creation wording: PASS.

## Blockers
None.
