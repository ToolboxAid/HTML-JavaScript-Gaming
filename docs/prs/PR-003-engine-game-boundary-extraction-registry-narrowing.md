# PR-003: engine/game boundary extraction - registry narrowing

## Title

engine/game: narrow registry responsibility and clarify system orchestration boundary

## Scope

This PR performs the smallest safe engine/game narrowing pass after the runtime-neutral marker patch.

Primary source files:
- `engine/game/gameObjectRegistry.js`
- `engine/game/gameObjectSystem.js`

Support files:
- `CODEX_COMMANDS.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this candidate was chosen first

`GameObjectRegistry` already fits a low-risk boundary:
- ID registration
- ID lookup
- internal registry storage

`GameObjectSystem` already fits the orchestration boundary:
- manager + registry sequencing
- rollback when partial failure occurs
- retained collision facade for compatibility

This makes registry/system clarification the smallest safe architectural step with low blast radius.

## What changed

### Registry
- clarified as identity/lookup focused
- clarified `clear()` as storage-only
- no lifecycle or orchestration responsibility added

### System
- clarified as orchestration boundary
- clarified add/remove sequencing ownership
- clarified `clear()` as the authoritative full-system removal path

## What did not change

- no imports changed
- no exports changed
- no logic changed
- no file moves
- no renames
- no public API changes

## Compatibility

This PR is compatibility-preserving.
It is intended to be comment-only / documentation-guided narrowing with no runtime behavior change.

## Deferred to later PRs

- manager/system lifecycle tightening
- collision surface narrowing
- utility split / GameBase alignment
