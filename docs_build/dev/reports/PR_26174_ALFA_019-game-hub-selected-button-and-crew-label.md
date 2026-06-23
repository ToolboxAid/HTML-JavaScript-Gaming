# PR_26174_ALFA_019-game-hub-selected-button-and-crew-label

## Summary

Updated Game Hub so the selected game button uses the same style and scale as row Save buttons.

## Implementation

- Selected game buttons now use `btn btn--compact primary`.
- Removed the custom selected-game table CSS selector from Theme V2 tables.
- Preserved button-only selected state; parent rows and cells remain unhighlighted.
- Confirmed Game Crew accordion text is `Game Crew`, not `game-hub/Game Crew`.
- Updated targeted Playwright coverage for selected button styling and crew label expectations.

## Scope Control

- Preserved parent table columns: Game, Purpose, Status, Actions.
- Preserved Source Idea and Readiness Output child rows.
- Preserved existing API/service contract.
- No browser-owned product data changes.
- No unrelated cleanup.

## ZIP

- `tmp/PR_26174_ALFA_019-game-hub-selected-button-and-crew-label_delta.zip`
