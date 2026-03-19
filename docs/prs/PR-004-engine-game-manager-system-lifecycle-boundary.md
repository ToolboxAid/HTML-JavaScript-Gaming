# PR-004: engine/game manager vs system lifecycle boundary

## Title

engine/game: tighten manager vs system lifecycle ownership

## Scope

This PR performs the next small boundary pass in `engine/game` after PR-003.

Primary source files:
- `engine/game/gameObjectManager.js`
- `engine/game/gameObjectSystem.js`

Support files:
- `CODEX_COMMANDS.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this boundary is next

PR-003 clarified:
- registry = identity/lookup
- system = orchestration

The next smallest safe narrowing step is lifecycle ownership between manager and system:
- manager = active membership
- system = authoritative full-system lifecycle orchestration

## What changed

### Manager
- clarified as the internal active-membership boundary
- clarified `removeGameObject()` as manager-scoped active teardown support
- clarified `destroy()` as manager-scoped teardown, not full object-system authority

### System
- clarified as the authoritative full-system lifecycle boundary
- clarified `removeGameObject()` as the coordinated full-system removal path
- clarified `clear()` / `destroy()` as top-level object-system lifecycle entry points

## What did not change

- no imports changed
- no exports changed
- no logic changed
- no file moves
- no renames
- no public API changes

## Compatibility

This PR is compatibility-preserving and is intended to remain comment-only / documentation-guided lifecycle narrowing.

## Deferred to later PRs

- collision facade narrowing
- utility split / GameBase alignment
- deeper lifecycle extraction beyond comment-level clarification
