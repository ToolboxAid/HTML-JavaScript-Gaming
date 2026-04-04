Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md

# PLAN_PR — Repo Cleanup Phase 1D

## Title
Repo Cleanup Phase 1D — Sprite Editor Post-Normalization Extraction Gate

## Purpose
Define extraction decision rules after Phase 1C ownership normalization. This is a docs-only classification pass.

## Scope
- tools/SpriteEditor_old_keep/modules/ analysis only
- docs/pr and docs/dev outputs only

## Out of Scope
- engine/
- games/
- samples/
- runtime code

## Helper Classification
Each helper must be classified:
- Local Forever
- Monitor
- Future Extraction Candidate

## Extraction Gate Criteria
A helper can only be extracted if:
- Used in 2+ real locations
- Behavior is identical
- No UI coupling
- No hidden dependencies
- Reduces duplication safely

## Deliverables
- Helper inventory table
- Classification buckets
- Extraction criteria
- Risks
- Acceptance criteria
- Next BUILD guidance

## Acceptance Criteria
- Docs-only
- No behavior change
- No shared helpers created
- Clear classification
