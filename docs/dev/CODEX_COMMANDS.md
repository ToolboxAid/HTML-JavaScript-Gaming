# MODEL
GPT-5.4

# REASONING
high

# COMMAND
Create BUILD_PR_LEVEL_09_23_SCRIPT_STRUCTURE_FINALIZATION as a docs-first, surgical PR.

## Mission
Finalize the PowerShell script tree after the recent move/rename work so each script location clearly matches its purpose and all references are aligned.

## Required scope
- finalize and enforce folder roles:
  - `scripts/PS/` for general operator scripts
  - `scripts/PS/codex/` for Codex-only scripts
  - `scripts/PS/deploy/` for deployment scripts
- update references after the moved/renamed template game creation script
- normalize naming where touched so names match actual purpose
- add focused validation that script placement matches responsibility
- document the final structure expectations

## Hard rules
- do not change engine code
- do not add gameplay/runtime features
- do not redesign tools
- do not expand deployment capability beyond structure/finalization
- keep the PR surgical and purpose-specific

## Commit comment format
- description starts on first line
- no leading blank line / no leading CR
- PR identifier goes on the last line

## Roadmap instruction
Update roadmap status only where this PR clearly advances tracked work.
Do not change roadmap prose except for previously approved additions already in flight.

## Deliverables
Return a single repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_23_SCRIPT_STRUCTURE_FINALIZATION.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_23_SCRIPT_STRUCTURE_FINALIZATION.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/next_command.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt

## Validation
Run focused checks only:
- PowerShell parse/readiness checks on touched scripts
- focused reference/path checks
- focused structure checks ensuring scripts live in the correct folders

## Success definition
- general scripts live in `scripts/PS/`
- Codex-only scripts live in `scripts/PS/codex/`
- deployment scripts live in `scripts/PS/deploy/`
- references and names align with actual purpose
- roadmap gets status-only updates where applicable
- final output is one ZIP in `<project folder>/tmp/`
