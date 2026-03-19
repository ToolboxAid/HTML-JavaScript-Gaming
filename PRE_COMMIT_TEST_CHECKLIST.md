# Pre-Commit Test Checklist

## Tests to run
- tests/engine/game/gameUtilsTest.js

## Validation goals
- drawPlayerSelection uses the corrected `(config, gameControllers)` signature
- overlay/background assertion is meaningful again
- test remains harness-compatible
- production files remain untouched

## Optional runtime sanity
- quick player-selection UI smoke check
