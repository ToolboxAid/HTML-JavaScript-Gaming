# PLAN PR — Games Pacman Migration

## Purpose
Plan migration of Pacman using the proven template → _next → migration → promotion pipeline.

## Selected Game
- games/Pacman/**

## Strategy
Replicate validated SpaceInvaders/Asteroids pipeline:

_template
→ Pacman_next (baseline)
→ gameplay migration
→ canonical promotion
→ cleanup

## Phases
1. BUILD_PR_GAMES_PACMAN_NEXT_TEMPLATE_BASELINE
2. APPLY
3. BUILD_PR_GAMES_PACMAN_GAMEPLAY_MIGRATION_TO_NEXT
4. APPLY
5. BUILD_PR_GAMES_PACMAN_CLEAR_DESTINATION
6. BUILD_PR_GAMES_PACMAN_COPY_FROM_NEXT
7. APPLY
8. BUILD_PR_GAMES_PACMAN_REMOVE_NEXT
9. APPLY

## Rules
- no direct edits to canonical until promotion
- no gameplay during baseline step
- no guessing files
- fail fast on ambiguity
- docs-first always

## Output Requirement
Codex must follow BUILD sequence exactly per phase.
