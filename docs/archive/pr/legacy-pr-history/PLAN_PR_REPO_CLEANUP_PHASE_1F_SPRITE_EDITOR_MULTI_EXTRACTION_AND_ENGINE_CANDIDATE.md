Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_REPO_CLEANUP_PHASE_1F_SPRITE_EDITOR_MULTI_EXTRACTION_AND_ENGINE_CANDIDATE.md

# PLAN_PR — Repo Cleanup Phase 1F

## Title
Repo Cleanup Phase 1F — Controlled Multi-Helper Extraction and Engine Candidate Evaluation

## Purpose
Expand from Phase 1E single-helper extraction into controlled multi-helper extraction while introducing the first formal evaluation of engine promotion candidates.

## Scope
- tools/SpriteEditor_old_keep/modules/
- tools/SpriteEditor_old_keep/shared/
- docs/pr
- docs/dev

## Out of Scope
- src/engine/ (no direct modification yet)
- games/
- samples/
- feature changes
- refactors outside extraction scope

## Objectives
1. Extract up to 3 additional helpers (max)
2. Validate reuse patterns across helpers
3. Identify potential engine candidates (NO promotion yet)
4. Maintain strict behavior preservation

## Extraction Rules
- Only extract helpers classified as “Future Extraction Candidate”
- Must meet Phase 1D gate criteria
- Extract individually (no bulk moves)
- Maintain identical behavior
- No renaming unless required
- No API redesign

## Engine Candidate Evaluation
For each extracted helper, evaluate:
- Is it used across multiple tools? (future potential)
- Is it UI-independent?
- Is it free of tool-specific state?
- Would moving to engine reduce duplication?

Mark as:
- Not Candidate
- Candidate (Needs More Proof)
- Strong Candidate (ready for future promotion phase)

## Deliverables
- Up to 3 extracted helpers
- Updated import references
- Helper inventory update
- Extraction validation notes
- Engine candidate evaluation table

## Acceptance Criteria
- No behavior changes
- Max 3 helpers extracted
- No engine changes
- No cross-tool coupling introduced
- Clear engine candidate classification

## Risks
- Over-extraction
- Hidden coupling across helpers
- Premature engine consideration

## Next Step
Phase 1G:
- Engine promotion plan (only for Strong Candidates)
- OR continue extraction if needed
