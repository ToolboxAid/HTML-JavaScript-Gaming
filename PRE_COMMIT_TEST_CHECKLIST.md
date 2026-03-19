# Focused Investigation Checklist

## Baseline / comparison
- run the exact failing test on pre-PR-011 baseline
- run the exact failing test on PR-011 applied state
- compare assertion output and call counts

## Source / test tracing
- inspect GamePlayerSelectUi.drawPlayerSelection call path
- inspect gameUtilsTest setup and spies/mocks
- inspect any UI render helper used by the failing assertion

## Static/shared state checks
- reset GameUtils.hasWarnedAboutControllerLimit if present
- reset GamePlayerSelectionUtils.hasWarnedAboutControllerLimit if present
- verify whether test order changes result

## Runtime sanity
- run attract/start menu flow
- run player-count selection flow
- verify overlay/background rendering visually if possible

## Decision output
- classify as pre-existing
- or classify as test-only issue
- or classify as production regression
