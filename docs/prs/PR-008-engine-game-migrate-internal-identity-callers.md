# PR-008: engine/game migrate internal identity callers

## Title

engine/game: migrate internal identity callers to GameObjectIdentityUtils

## Scope

This PR performs the first small internal adoption pass after PR-007.

Primary source files:
- `engine/game/gameObjectRegistry.js`
- `engine/game/gameObjectSystem.js`

Support files:
- `CODEX_COMMANDS.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why these callers were chosen first

`gameObjectRegistry.js` and `gameObjectSystem.js` are the safest first migration targets because:
- both are heavily identity-oriented
- both are internal engine/game coordination files
- both align naturally with the extracted identity boundary
- both benefit immediately from reduced reliance on the GameObjectUtils compatibility bridge

## What changed

### gameObjectRegistry.js
- replaced identity helper usage with direct `GameObjectIdentityUtils` imports
- uses direct ID validation and object ID access from the extracted utility

### gameObjectSystem.js
- replaced object validation usage with direct `GameObjectIdentityUtils` imports
- retains all orchestration behavior unchanged

## What did not change

- `GameObjectUtils` compatibility bridge remains intact
- no public API removals
- no import/export breaks
- no file moves
- no renames
- no intentional logic changes beyond import target replacement

## Compatibility

This PR preserves compatibility by migrating only internal callers while keeping the old compatibility surface available.

## Deferred to later PRs

- evaluating `gameObjectManager.js` as a next migration target
- gameplay-facing utility split from `gameUtils.js`
- broader GameBase-aligned utility cleanup
