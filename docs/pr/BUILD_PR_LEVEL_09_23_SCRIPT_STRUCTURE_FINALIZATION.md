# BUILD_PR — LEVEL 09_23 — SCRIPT STRUCTURE FINALIZATION

## Objective
Finalize the PowerShell script structure after the recent script relocation and renaming work so the repo has a clear, stable, long-term script layout.

## Dependency Context
This PR follows:
- 09_18 Codex plan switch and API key scripting
- 09_19 template game creation scripting
- 09_20 website repo prep scripting
- 09_21 script validation and safety
- 09_22 deployment pipeline integration

09_22 corrected script placement for the template game creation script and reinforced the intended folder roles.
09_23 now finalizes the structure, references, naming expectations, and ownership rules for the script tree.

## Structure Rules To Finalize
- `scripts/PS/`
  - general repo/operator scripts
  - game/template creation scripts
  - non-Codex, non-deploy shared operator utilities

- `scripts/PS/codex/`
  - Codex-only scripts
  - plan-switch / API-key / Codex workflow helpers
  - Codex-specific repo automation surfaces only

- `scripts/PS/deploy/`
  - deployment scripts
  - Docker web-server deployment preparation/update/cleanup
  - website/deployment-only script surfaces

## In Scope
- finalize script folder ownership rules
- update references after the recent move/rename work
- normalize script naming patterns where touched
- document the intended script tree and operator expectations
- add focused validation that script locations match their responsibilities
- ensure no general script remains stranded in the Codex folder
- ensure deployment scripts remain under `scripts/PS/deploy/`

## Out of Scope
- no engine changes
- no gameplay/runtime feature changes
- no tool UI work
- no broad deployment feature expansion
- no unrelated repo cleanup

## Required Checks
- general template/game creation script lives in `scripts/PS/`
- Codex-only scripts live in `scripts/PS/codex/`
- deployment scripts live in `scripts/PS/deploy/`
- references/docs/scripts point to the updated paths
- naming reflects real purpose rather than old history

## Roadmap Instruction
Update roadmap status only where this PR clearly advances tracked work.
Do not change roadmap prose except for previously approved roadmap additions already in flight.

## Acceptance Criteria
- script tree roles are finalized and documented
- misplaced scripts are corrected where touched
- script references are updated consistently
- naming is purpose-driven
- focused checks pass
- roadmap receives status-only updates where applicable

## Deliverables
Return a repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_23_SCRIPT_STRUCTURE_FINALIZATION.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_23_SCRIPT_STRUCTURE_FINALIZATION.md
- docs/operations/dev/codex_commands.md
- docs/operations/dev/commit_comment.txt
- docs/operations/dev/next_command.txt
- docs/reports/change_summary.txt
- docs/reports/validation_checklist.txt
