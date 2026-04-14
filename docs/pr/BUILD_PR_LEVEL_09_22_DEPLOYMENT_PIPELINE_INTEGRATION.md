# BUILD_PR — LEVEL 09_22 — DEPLOYMENT PIPELINE INTEGRATION

## Objective
Integrate deployment scripting and correct script organization, including relocating and renaming miscategorized scripts.

## Key Updates
- Move `New-CodexTemplateGame.ps1` from `scripts/PS/codex/` to `scripts/PS/`
- Rename script to reflect actual purpose (template game creation, not codex-specific)
- Maintain:
  - scripts/PS/codex/ → codex-only scripts
  - scripts/PS/deploy/ → deployment scripts
  - scripts/PS/ → general scripts

## Scope
- correct script placement
- enforce naming clarity
- align with repo script structure conventions

## Out of Scope
- no runtime changes
- no tool UI changes

## Roadmap Instruction
- Update roadmap status only
- Maintain previously added roadmap items
