# Pre-Commit Test Checklist

- verify no remaining meaningful references to:
  - GameUtils.areTrackedPlayersOut
  - GameUtils.findNextActivePlayer
  - GameUtils.swapPlayer
- run targeted tests for:
  - tests/engine/game/gameUtilsTest.js
- sanity-check:
  - Asteroids player death flow
  - Box Drop collision/life loss flow
  - Frogger frog death / player swap flow
  - sample game-over and player swap flow
