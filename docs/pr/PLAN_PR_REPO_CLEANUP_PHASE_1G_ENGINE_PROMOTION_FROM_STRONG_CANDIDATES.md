Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md

# PLAN_PR — Repo Cleanup Phase 1G

## Title
Repo Cleanup Phase 1G — Engine Promotion (Strong Candidates Only)

## Purpose
Promote only “Strong Candidate” helpers (identified in Phase 1F) into engine/ as reusable, engine-owned utilities.

## Scope
- Source: tools/SpriteEditor_old_keep/shared/
- Target: engine/
- docs/pr
- docs/dev

## Out of Scope
- games/
- samples/
- non-strong candidates
- feature changes
- refactors beyond promotion

## Promotion Rules
A helper can move to engine ONLY if:
- Classified “Strong Candidate” in Phase 1F
- Zero UI coupling
- No Sprite Editor state dependency
- Behavior identical across usages
- Proven reuse

## Execution Rules
- Promote ONE helper only (first pass)
- Place in appropriate engine module (not generic dump)
- Update imports in SpriteEditor only
- Do not rename unless required
- No API redesign

## Deliverables
- Promoted helper in engine/
- Updated imports
- Engine placement justification
- Before/after ownership table

## Acceptance Criteria
- Behavior unchanged
- Only one helper promoted
- No engine coupling violations
- No sample/game changes
- Engine structure respected

## Risks
- Premature promotion
- Hidden UI dependency
- Incorrect engine placement

## Next Step
Phase 1H:
- Additional promotions OR
- consolidation into engine subsystems
