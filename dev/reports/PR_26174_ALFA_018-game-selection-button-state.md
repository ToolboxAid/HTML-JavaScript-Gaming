# PR_26174_ALFA_018-game-selection-button-state

## Summary

Moved Game Hub selected-game indication to the game button only.

## Implementation

- Removed active-game markers from parent rows.
- Removed active-game markers from parent table cells.
- Replaced the left-border cell highlight with selected styling on the game button.
- Removed the `Selected {game}.` status log update when selecting a game row.
- Preserved child row behavior so Source Idea and Readiness Output follow the selected game.
- Added targeted Playwright assertions for one selected button, unchanged sibling columns, child row movement, and no selected status copy.

## Scope Control

- Preserved the existing API/service contract.
- Preserved the Game row parent structure.
- Preserved Source Idea and Readiness Output child rows/tables.
- Did not add browser-owned product data.
- Did not introduce silent fallbacks.

## ZIP

- `tmp/PR_26174_ALFA_018-game-selection-button-state_delta.zip`
