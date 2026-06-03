Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_PILOT.md

# PLAN_PR — Repo Cleanup Phase 1E

## Title
Repo Cleanup Phase 1E — Sprite Editor Extraction Pilot (First Controlled Extraction)

## Purpose
Execute the first safe, minimal extraction based on Phase 1D classification rules.

This is a tightly controlled pilot to validate extraction rules without introducing architectural drift.

## Scope
- One (1) helper ONLY from “Future Extraction Candidate”
- Source: tools/SpriteEditor_old_keep/modules/
- Target: tools/SpriteEditor_old_keep/shared/ (NOT engine)

## Out of Scope
- src/engine/
- games/
- samples/
- multi-helper extraction
- refactors
- behavior changes

## Selection Criteria
Helper must:
- Have 2+ usage points
- Be behavior-identical across uses
- Have zero UI wording dependency
- Have no panel-specific coupling

## Extraction Rules
- Move helper to: tools/SpriteEditor_old_keep/shared/<helperName>.js
- Update imports ONLY where used
- No API redesign
- No renaming unless required for clarity
- No bundling with other helpers

## Validation Requirements
- Behavior identical before/after
- No new dependencies
- No circular imports
- Module boundaries remain clear

## Deliverables
- Extracted helper file
- Updated import locations
- BUILD_PR doc
- Helper before/after ownership table
- Risk notes

## Acceptance Criteria
- Only one helper extracted
- No behavior change
- No scope expansion
- No engine promotion
- Clear justification for extraction

## Risks
- Hidden coupling
- Premature abstraction
- Accidental multi-helper extraction

## Next Step
If successful:
- Phase 1F → Controlled multi-helper extraction OR engine candidate review
