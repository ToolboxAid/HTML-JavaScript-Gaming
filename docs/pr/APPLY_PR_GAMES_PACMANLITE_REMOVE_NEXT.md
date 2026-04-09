# APPLY PR — Games PacmanLite Remove Next

## Purpose
Accept removal of temporary migration scaffold `games/PacmanLite_next/**`.

## Summary
The `_next` directory has been removed after successful canonical promotion.

## Accepted State
- `games/PacmanLite/**` is the canonical, running version
- `games/PacmanLite_next/**` no longer exists
- no unrelated changes were included

## Acceptance Criteria (Met)
- `_next` directory removed
- canonical PacmanLite unchanged and functional
- no unrelated changes

## Non-Goals
- no gameplay changes
- no engine/shared changes
- no new migration work

## Result
Migration pipeline for PacmanLite is complete and cleaned.
