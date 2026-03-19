# PR-007: engine/game first real utility split - object identity

## Title

engine/game: extract object identity helpers from gameObjectUtils with compatibility bridge

## Scope

This PR performs the first real utility split in `engine/game`.

Primary source files:
- `engine/game/gameObjectIdentityUtils.js`
- `engine/game/gameObjectUtils.js`

Support files:
- `CODEX_COMMANDS.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this split was chosen first

`gameObjectUtils.js` currently mixes:
- constructor argument validation
- metadata setup/cleanup
- object validity checks
- ID validation
- object ID access

The identity-focused subset is the smallest, safest extraction candidate because it has:
- a coherent responsibility
- low blast radius
- clear alignment with earlier registry/system boundary work

## What changed

### New file
- added `gameObjectIdentityUtils.js`
- moved object validity, ID validation, and object ID access into the extracted utility

### Compatibility bridge
- retained `validateGameObject`
- retained `validateId`
- retained `getObjectId`

These methods now delegate from `gameObjectUtils.js` to `GameObjectIdentityUtils`.

## What stayed in gameObjectUtils.js

- constructor argument validation
- metadata initialization
- metadata cleanup

## What did not change

- no public API removals
- no import/export breaks
- no file moves beyond the new file addition
- no logic changes intended beyond extraction/delegation structure

## Compatibility

This PR preserves compatibility by keeping the legacy `GameObjectUtils` surface intact while introducing the new internal identity utility.

## Deferred to later PRs

- direct migration of selected internal callers to `GameObjectIdentityUtils`
- gameplay-facing split candidates from `gameUtils.js`
- broader GameBase-aligned utility cleanup
