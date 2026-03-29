Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md

# PLAN_PR — Repo Cleanup Phase 1H

## Title
Repo Cleanup Phase 1H — Engine Consolidation and Controlled Expansion

## Purpose
Expand engine promotion from Phase 1G and consolidate promoted helpers into proper engine subsystems.

## Scope
- engine/
- tools/SpriteEditor/shared/
- docs/pr
- docs/dev

## Out of Scope
- games/
- samples/
- feature changes
- unrelated refactors

## Objectives
1. Promote up to 2 additional Strong Candidates
2. Consolidate promoted helpers into correct engine domains
3. Eliminate duplication between engine and SpriteEditor/shared
4. Preserve strict architecture boundaries

## Promotion Rules
- Only Strong Candidates from Phase 1F
- Must pass extraction gate
- No UI or tool coupling
- No behavior changes

## Consolidation Rules
- Group helpers into correct engine modules:
  - renderer/
  - input/
  - ecs/
  - utils (only if truly generic)
- Avoid generic dumping
- Prefer domain placement

## Execution Rules
- Max 2 promotions
- Update imports only where needed
- Remove duplicate shared helpers AFTER promotion
- No API redesign

## Deliverables
- Promoted helpers (≤2)
- Engine placement justification
- Updated imports
- Duplicate removal list
- Updated helper inventory

## Acceptance Criteria
- No behavior change
- No architecture violations
- Engine structure improved (not diluted)
- No duplicate helpers remain

## Risks
- Over-generalization
- Wrong engine placement
- Hidden dependencies

## Next Step
Phase 2:
- Engine reuse across tools/games
