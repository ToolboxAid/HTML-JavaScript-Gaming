# PR-011: engine/game first gameUtils player-selection split

## Title

engine/game: extract player-selection helpers from gameUtils with compatibility bridge

## Scope

This PR performs the first real gameplay-facing utility split in `engine/game`.

Primary source files:
- `engine/game/gamePlayerSelectionUtils.js`
- `engine/game/gameUtils.js`

Support files:
- `docs/prs/PR-011-engine-game-first-gameutils-player-selection-split.md`
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this split was chosen first

PR-010 established that the player-selection helper cluster is the strongest first gameplay-facing extraction candidate because it is:
- cohesive
- gameplay-facing
- close to future GameBase-facing usage
- compatible with a low-risk delegation bridge

## What changed

### New file
- added `gamePlayerSelectionUtils.js`
- moved the player-selection helper cluster into the new gameplay-facing utility

### Moved into GamePlayerSelectionUtils
- `CONTROLLER_PLAYER_SELECT_BUTTONS`
- `DEFAULT_PLAYER_SELECT_CONFIG`
- `getPlayerSelectConfig`
- `buildPlayerSelectionResult`
- `getKeyboardPlayerSelection`
- `getControllerPlayerSelection`
- `warnAboutControllerLimit`
- `resolvePlayerSelection`

### Compatibility bridge in GameUtils
- retained the extracted method names on `GameUtils`
- those methods now delegate to `GamePlayerSelectionUtils`

### Left in GameUtils for later
- `areTrackedPlayersOut`
- `findNextActivePlayer`
- `swapPlayer`

## What did not change

- no public API removals
- no import/export breaks
- no file moves outside the approved new utility addition
- no intended gameplay behavior changes
- no turn-flow helper changes

## Compatibility

This PR preserves compatibility by keeping `GameUtils` as the bridge for existing callers while extracting the player-selection cluster into a focused gameplay-facing utility.

## Deferred to later PRs

- direct caller migration to `GamePlayerSelectionUtils`
- extraction of turn-flow helpers from `GameUtils`
- tighter GameBase-aligned gameplay utility boundaries
