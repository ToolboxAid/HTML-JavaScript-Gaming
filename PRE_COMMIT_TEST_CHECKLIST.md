# Pre-Commit Test Checklist

## Tests to run
- tests/engine/game/gameUtilsTest.js
- targeted player-selection equivalence probe if available

## Runtime sanity
- quick player-selection UI smoke check
- attract/start menu flow if convenient

## Validation goals
- test now matches GamePlayerSelectUi.drawPlayerSelection(config, gameControllers)
- production behavior remains unchanged
- overlay assertion intent is still represented correctly
