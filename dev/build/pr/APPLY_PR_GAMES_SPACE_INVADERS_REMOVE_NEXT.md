# APPLY PR — Games Space Invaders Remove Next

## Purpose
Accept removal of temporary migration scaffold `games/SpaceInvaders_next/**`.

## Summary
The `_next` directory has been removed after successful canonical promotion.

## Accepted State
- `games/SpaceInvaders/**` is the canonical, running version
- `games/SpaceInvaders_next/**` no longer exists
- no preview restoration was performed (by design)

## Acceptance Criteria (Met)
- `_next` directory removed
- canonical SpaceInvaders unchanged and functional
- no unrelated changes

## Non-Goals
- no gameplay changes
- no preview restoration
- no engine/shared changes

## Result
Migration pipeline for Space Invaders is complete and cleaned.
