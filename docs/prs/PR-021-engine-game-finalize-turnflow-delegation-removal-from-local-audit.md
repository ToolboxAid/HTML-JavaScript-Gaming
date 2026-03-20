# PR-021: engine/game finalize turn-flow delegation removal from local audit

## Title

engine/game: finalize GameUtils turn-flow delegation removal from audited caller set

## Scope

This PR uses the completed caller audit to remove turn-flow delegation from `GameUtils` after migrating all identified meaningful callers.

Primary source files:
- `engine/game/gameUtils.js`
- `games/Asteroids/runtime/session.js`
- `games/Box Drop/game.js`
- `games/Frogger/game.js`
- `samples/engine/2D side scroll tile map/sideScrollStateHandlers.js`
- `samples/engine/Game Engine/gameStates.js`
- `tests/engine/game/gameUtilsTest.js`

Support files:
- `docs/prs/PR-021-engine-game-finalize-turnflow-delegation-removal-from-local-audit.md`
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Audited caller result

Meaningful callers were identified in:
- production:
  - `games/Asteroids/runtime/session.js`
  - `games/Box Drop/game.js`
  - `games/Frogger/game.js`
- samples:
  - `samples/engine/2D side scroll tile map/sideScrollStateHandlers.js`
  - `samples/engine/Game Engine/gameStates.js`
- tests:
  - `tests/engine/game/gameUtilsTest.js`

## What changed

- migrated all identified meaningful callers from `GameUtils.swapPlayer(...)` to `GameTurnFlowUtils.swapPlayer(...)`
- removed turn-flow delegation methods from `engine/game/gameUtils.js`:
  - `areTrackedPlayersOut`
  - `findNextActivePlayer`
  - `swapPlayer`
- kept player-selection delegation in `GameUtils` intact

## What did not change

- no player-selection behavior changes
- no import/export renames outside the intended migration
- no unrelated cleanup

## Compatibility

This PR intentionally removes the `GameUtils` turn-flow compatibility bridge after audited caller migration. `GameTurnFlowUtils` is now the sole owner of turn-flow/state helpers.
