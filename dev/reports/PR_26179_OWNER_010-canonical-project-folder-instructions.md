# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T02:44:56Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No runtime code or production pages changed.

## Summary
- Added the Codex Completion Contract to the artifact/reporting standard.
- Defined canonical ZIP location as `dev/workspace/zips/`.
- Defined outcome suffixes: `_delta.zip`, `_REVIEW.zip`, `_FAILED.zip`, and `_HARD_STOP.zip`.
- Clarified one ZIP per attempted PR, with at least one repository-structured ZIP for every Codex execution.
- Added stacked PR ZIP handling and failure/hard-stop ZIP content requirements.
- Updated Start of Day, PLAN_PR, BUILD_PR, APPLY_PR, and PR workflow references to the completion contract.

## Completion Contract Result
- SSoT: `dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md`.
- Every Codex execution must produce at least one repository-structured ZIP.
- Each PR attempted by Codex must produce exactly one final outcome ZIP.
- Missing ZIP means the Codex run did not complete correctly.
- Grep for conflicting `exactly one repository-structured ZIP` wording: PASS, no conflicting wording found.

## Changed Files
```
M	dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
M	dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md
M	dev/build/ProjectInstructions/addendums/pr_workflow.md
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
- Grep for `exactly one repository-structured ZIP`: PASS, no replacement needed beyond SSoT wording.

## Blockers
None.
