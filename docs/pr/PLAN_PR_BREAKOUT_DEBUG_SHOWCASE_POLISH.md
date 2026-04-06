Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_BREAKOUT_DEBUG_SHOWCASE_POLISH.md

# PLAN_PR_BREAKOUT_DEBUG_SHOWCASE_POLISH

## Goal
Execute a small, Breakout-only polish slice that presents Breakout as a debug showcase while keeping gameplay behavior stable.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- `games/index.html`
  - Add `Debug Showcase` to the Breakout card header area.
  - Apply a unique color treatment for the Breakout showcase label.
- `games/Breakout/index.html`
  - Add visible `Debug: ON/OFF` badge.
  - Add `Open Debug Panel` button.
  - Add 1-2 lines of inline mini help.
- `games/Breakout/main.js`
  - Add debug ON/OFF UI state wiring.
  - Add default preset auto-load behavior when debug is enabled.
- `games/Breakout/game/BreakoutScene.js`
  - Render debug surface integration safely on top of game rendering.

## Out of Scope
- Engine core API changes.
- Non-Breakout gameplay refactors.
- Unrelated games hub entry edits.

## Behavior Contract
1. Breakout listing shows `Debug Showcase` in the header/tag region with a unique badge color.
2. Breakout page shows `Debug: OFF` by default unless debug is explicitly enabled.
3. Enabling debug (`?debug=1`) sets badge to `Debug: ON`, enables the button, and auto-applies the default preset.
4. Overlay remains hidden by default even after preset load; user opens it explicitly via button or key combo.
5. Inline help remains concise and focused on activation/opening instructions.

## Validation Targets
- Breakout card updated in `games/index.html` only.
- Unique showcase color is visible and readable.
- Debug badge and button present on Breakout page.
- Default preset auto-load executes only when debug is enabled.
- Open Debug Panel button opens overlay only when debug is enabled.
- No unrelated runtime refactors.