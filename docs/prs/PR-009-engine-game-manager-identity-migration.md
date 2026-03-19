# PR-009: engine/game manager identity migration

## Title

engine/game: migrate GameObjectManager to GameObjectIdentityUtils

## Scope

This PR performs the next small internal identity-boundary migration after PR-008.

Primary source file:
- `engine/game/gameObjectManager.js`

Support files:
- `docs/prs/PR-009-engine-game-manager-identity-migration.md`
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why manager was chosen next

PR-007 extracted `GameObjectIdentityUtils`.
PR-008 migrated registry and system to the extracted utility.

`GameObjectManager.js` is the next safest internal migration target because:
- it still performs identity-oriented object validation
- it is an internal engine/game file
- it has low blast radius
- the migration is a direct import and call-target replacement

## What changed

### gameObjectManager.js
- replaced `GameObjectUtils.validateGameObject(...)` usage with direct `GameObjectIdentityUtils.validateGameObject(...)`
- removed dependence on the compatibility bridge inside manager code

## What did not change

- no public API removals
- no import/export breaks
- no file moves
- no renames
- no lifecycle or logic rewrites
- no intended behavior changes

## Compatibility

This PR preserves compatibility by keeping the `GameObjectUtils` bridge intact for deferred callers while migrating the manager directly to the extracted identity utility.

## Deferred to later PRs

- gameplay-facing utility split from `gameUtils.js`
- broader GameBase-aligned utility cleanup
- any eventual bridge-reduction planning after migrations are complete
