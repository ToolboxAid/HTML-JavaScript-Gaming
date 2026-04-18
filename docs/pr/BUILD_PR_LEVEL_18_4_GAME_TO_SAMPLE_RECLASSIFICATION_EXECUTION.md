# BUILD_PR_LEVEL_18_4_GAME_TO_SAMPLE_RECLASSIFICATION_EXECUTION

## Purpose
Complete the Level 18 game-to-sample reclassification lane by executing the approved move recommendations from the prior review.

## Explicit Exclusion
- `games/PacmanLite` must be left alone in this PR.

## In-Scope Candidates
Execute only the approved reclassification work for the reviewed set, excluding PacmanLite:
- `games/Bouncing-ball`
- `games/Gravity`
- `games/Thruster`
- `games/ProjectileLab`
- `games/Orbit`
- `games/PaddleIntercept`
- `games/MultiBallChaos`

## Scope
- one PR purpose only
- execute approved game-to-sample reclassification work
- docs-first bundle
- no implementation code authored by ChatGPT
- PacmanLite excluded
- roadmap update must be performed in place by Codex under roadmap guard rules

## Codex Responsibilities
1. Read the prior recommendation outputs and user-approved direction.
2. Reclassify only the approved entries from `games/` to their recommended `samples/phase-xx` targets.
3. Leave `games/PacmanLite` untouched.
4. Preserve repo structure consistency and fix only the exact references required by these moves.
5. Keep scope tightly limited to the approved reclassification set.
6. Write execution-backed reports under `docs/dev/reports`.
7. Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` in place:
   - preserve existing text
   - do not delete content
   - do not rewrite text
   - update status markers only when execution-backed
   - append only if explicitly required by this PR

## Acceptance
- approved reclassification moves are executed
- `games/PacmanLite` remains unchanged
- exact path/reference updates required by the moves are completed
- reports are written under `docs/dev/reports`
- roadmap is updated in place under guard rules
