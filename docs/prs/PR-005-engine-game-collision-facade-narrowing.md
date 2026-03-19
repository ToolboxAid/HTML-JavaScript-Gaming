# PR-005: engine/game collision facade narrowing

## Title

engine/game: narrow collision facade exposure from GameObjectSystem

## Scope

This PR performs the next small boundary pass in `engine/game` after PR-004.

Primary source files:
- `engine/game/gameCollision.js`
- `engine/game/gameObjectSystem.js`

Support files:
- `CODEX_COMMANDS.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this boundary is next

PR-003 clarified:
- registry = identity/lookup
- system = orchestration

PR-004 clarified:
- manager = active membership
- system = authoritative lifecycle boundary

The next smallest safe narrowing step is collision exposure:
- GameCollision = canonical collision/bounds boundary
- GameObjectSystem = transitional compatibility facade for collision passthroughs

## What changed

### GameCollision
- clarified as the collision-focused utility boundary
- clarified as the canonical collision/bounds surface for engine/game compatibility

### GameObjectSystem
- clarified `this.collision = GameCollision` as retained compatibility wiring
- clarified collision passthrough methods as transitional compatibility facades
- clarified that collision ownership remains outside the system boundary

## What did not change

- no imports changed
- no exports changed
- no logic changed
- no file moves
- no renames
- no public API changes

## Compatibility

This PR is compatibility-preserving and remains comment/documentation-only.

## Deferred to later PRs

- utility split / GameBase alignment
- any future reduction or deprecation planning for transitional facades
- any collision API reshaping
