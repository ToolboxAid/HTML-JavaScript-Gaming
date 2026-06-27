# BUILD_PR — LEVEL 09_21 — SCRIPT VALIDATION AND SAFETY

## Objective
Add validation, safety checks, and guardrails across all PowerShell scripting introduced so far.

## Key Updates
- 09_20 deploy scripts must reside in: scripts/PS/deploy/
- Target deployment: Docker-based web servers
- Codex scripts remain in: scripts/PS/codex/
- Commit format: description first line, no leading CR, PR name last

## Scope
- validate all script inputs
- add dry-run / safe execution modes
- prevent destructive actions without confirmation
- enforce correct script locations

## Out of Scope
- no runtime changes
- no tool UI changes

## Roadmap Instruction
- Update roadmap status only
- Maintain previously added roadmap items
