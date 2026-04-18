# BUILD_PR — LEVEL 09_24 — SCRIPT STRUCTURE VALIDATION LAYER

## Objective
Add a dedicated PowerShell validation layer for repo script governance so script placement, naming, and folder-role rules can be enforced outside the runtime/tool test suite.

## Why This PR Exists
The recent script lane established and refined:
- `scripts/PS/`
- `scripts/PS/codex/`
- `scripts/PS/deploy/`

A follow-up question exposed the missing enforcement layer:
`Validate-ScriptStructure.ps1` should exist, but it should not live inside the JavaScript runtime/tool test suite.

This PR turns that insight into a clean repo-governance validation slice.

## Required Direction
Create a validation layer under:

- `scripts/PS/validate/`

Primary script:
- `scripts/PS/validate/Validate-ScriptStructure.ps1`

Optional companion if helpful:
- `scripts/PS/validate/Validate-All.ps1`

## Scope
- add a PowerShell validation layer for script-tree governance
- validate script placement against intended folder roles
- validate naming matches actual purpose where practical
- validate required high-value scripts exist in their expected locations
- keep this validation outside the Node/MJS runtime test suite
- document how operators should run the validation
- add focused smoke checks for the validation scripts themselves if practical

## Out of Scope
- no engine changes
- no gameplay/runtime feature changes
- no tool UI work
- no migration into the JS runtime test runner
- no auto-fix / auto-move behavior in the validator
- no broad deployment feature expansion

## Folder Ownership Rules To Enforce
- `scripts/PS/`
  - general operator scripts
  - template/game creation scripts
  - non-Codex, non-deploy shared operator scripts

- `scripts/PS/codex/`
  - Codex-only scripts
  - plan-switch / API-key / Codex workflow scripts
  - no general game/template creation scripts

- `scripts/PS/deploy/`
  - deployment scripts
  - Docker web-server deployment prep/update/cleanup scripts only

- `scripts/PS/validate/`
  - validation/governance scripts only

## Validation Behavior
The validation layer should:
1. inspect the script tree
2. fail loudly on misplaced scripts
3. report actionable messages
4. remain non-destructive
5. be easy to run manually
6. be suitable for future CI/pre-commit use

## Explicit Rule
Do not place this validation in the JavaScript test suite.
Treat it as repo governance validation, not runtime/tool contract testing.

## Commit Comment Format
- description starts on first line
- no leading blank line / no leading CR
- PR identifier goes on the last line

## Roadmap Instruction
Update roadmap status only where this PR clearly advances tracked work.
Do not change roadmap prose except for previously approved roadmap additions already in flight.

## Acceptance Criteria
- `scripts/PS/validate/Validate-ScriptStructure.ps1` exists
- validator enforces the intended script folder roles
- validator is non-destructive
- validator is documented and manually runnable
- no JS test-suite coupling is introduced
- focused checks pass
- roadmap receives status-only updates where applicable

## Deliverables
Return a repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_24_SCRIPT_STRUCTURE_VALIDATION_LAYER.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_24_SCRIPT_STRUCTURE_VALIDATION_LAYER.md
- docs/operations/dev/codex_commands.md
- docs/operations/dev/commit_comment.txt
- docs/operations/dev/next_command.txt
- docs/reports/change_summary.txt
- docs/reports/validation_checklist.txt
