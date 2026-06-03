# PLAN PR — Games PacmanLite Migration

## Purpose
Plan migration of `games/PacmanLite/**` using the validated template → _next → migration → promotion → cleanup pipeline.

## Selected Game
- `games/PacmanLite/**`

## Why PacmanLite
- lower-risk next migration than `PacmanFullAI`
- better fit for the now-proven migration pipeline
- keeps scope controlled while extending the standard to another real game

## Validated Pipeline To Reuse
`games/_template`
→ `games/PacmanLite_next` baseline
→ gameplay migration into `_next`
→ clear canonical destination
→ copy `_next` to canonical
→ remove `_next`

## Planned Sequence
1. `BUILD_PR_GAMES_PACMANLITE_NEXT_TEMPLATE_BASELINE`
2. `APPLY_PR_GAMES_PACMANLITE_NEXT_TEMPLATE_BASELINE`
3. `BUILD_PR_GAMES_PACMANLITE_GAMEPLAY_MIGRATION_TO_NEXT`
4. `APPLY_PR_GAMES_PACMANLITE_GAMEPLAY_MIGRATION_TO_NEXT`
5. `BUILD_PR_GAMES_PACMANLITE_CLEAR_DESTINATION`
6. `BUILD_PR_GAMES_PACMANLITE_COPY_FROM_NEXT`
7. `APPLY_PR_GAMES_PACMANLITE_COPY_FROM_NEXT`
8. `BUILD_PR_GAMES_PACMANLITE_REMOVE_NEXT`
9. `APPLY_PR_GAMES_PACMANLITE_REMOVE_NEXT`

## Rules
- no direct edits to canonical until promotion
- no gameplay during baseline step
- no guessing missing files
- fail fast on ambiguity
- docs-first always
- keep one PR purpose per step

## Output Requirement
Follow the BUILD/APPLY sequence exactly as listed.
