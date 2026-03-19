# PR-017: engine/game split GameUtils turn-flow helpers

## Title

engine/game: extract turn-flow helpers from GameUtils with compatibility bridge

## Scope

This PR performs the next real gameplay-state utility split in `engine/game`.

Primary source files:
- `engine/game/gameTurnFlowUtils.js`
- `engine/game/gameUtils.js`

Support files:
- `docs/prs/PR-017-engine-game-split-gameutils-turn-flow-helpers.md`
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this split was chosen next

After the player-selection split, the clearest remaining seam in `GameUtils` was the turn-flow/state helper cluster:
- tracked-player elimination checks
- next-active-player selection
- swap/game-over progression

This cluster is cohesive and separate from player-selection behavior.

## What changed

### New file
- added `gameTurnFlowUtils.js`
- moved turn-flow/state helpers into the new utility

### Moved into GameTurnFlowUtils
- `areTrackedPlayersOut`
- `findNextActivePlayer`
- `swapPlayer`

### Compatibility bridge in GameUtils
- retained the same public static method names on `GameUtils`
- those methods now delegate to `GameTurnFlowUtils`

### Left in GameUtils
- player-selection delegation to `GamePlayerSelectionUtils`
- constructor / compatibility facade role

## What did not change

- no public API removals
- no import/export breaks
- no file moves outside the approved new utility addition
- no intended gameplay behavior changes

## Compatibility

This PR preserves compatibility by keeping `GameUtils` as a bridge for existing callers while extracting the turn-flow/state helpers into a focused gameplay utility.

## Deferred to later PRs

- direct caller migration to `GameTurnFlowUtils`
- further tightening of GameUtils as a thin compatibility facade
- GameBase-aligned gameplay utility cleanup
