# BUILD_PR_LEVEL_18_3_GAME_TO_SAMPLE_RECLASSIFICATION_RECOMMENDATIONS

## Purpose
Advance Level 18 by identifying game entries that are actually sample/demo candidates and recommending the correct `phase-xx` move target for each.

## Requested Candidates
- `games/Bouncing-ball`
- `games/Gravity`
- `games/Thruster`
- `games/ProjectileLab`
- `games/Orbit`
- `games/PaddleIntercept`
- `games/MultiBallChaos`
- `games/PacmanLite`

## Scope
- one PR purpose only
- classification + recommendation only
- docs-first bundle
- no implementation code authored by ChatGPT
- no moves in this PR unless Codex determines a tiny execution-backed move is required to keep the PR testable and roadmap-improving
- roadmap must be updated in place as part of this bundle if execution-backed

## Codex Responsibilities
1. Inspect each listed game entry.
2. Determine whether it is:
   - a true game that should remain in `games/`
   - a sample/demo that should move to `samples/`
3. For each item classified as a sample/demo, recommend the best-fit `phase-xx` target and explain why.
4. Produce a concise classification matrix in `docs/dev/reports`.
5. Update `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` in place as part of this bundle:
   - preserve all existing roadmap text
   - do not delete content
   - do not rewrite existing roadmap wording
   - only update status markers in place when execution-backed
   - only append additive roadmap content when explicitly required by this PR
6. Keep the change tightly scoped to classification and roadmap update behavior.

## Acceptance
- all listed entries are classified
- each sample/demo candidate has a recommended `phase-xx` target
- rationale is documented
- roadmap is updated in place by Codex under the guard rules when execution-backed
- reports are written under `docs/dev/reports`
