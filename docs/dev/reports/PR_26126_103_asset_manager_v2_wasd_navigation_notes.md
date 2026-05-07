# PR_26126_103 WASD Navigation Notes

## Behavior
- Asset tile keyboard selection now handles only W, A, S, and D.
- A selects the previous asset in sorted tile order.
- D selects the next asset in sorted tile order.
- W moves to the previous row using the current rendered grid column count.
- S moves to the next row using the current rendered grid column count.

## Focus And Sync
- WASD works when focus is on the Assets list or on the currently selected asset tile/button.
- Handled WASD key events call `preventDefault()`.
- Selection updates continue to flow through the existing Asset Manager V2 select callback, keeping the selected tile, Selected Asset Detail, and preview synchronized.

## Removed Navigation
- Asset tile navigation no longer handles ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Home, End, PageUp, PageDown, or Enter.
- Accordion Enter/Space handling remains unchanged because it is unrelated to asset tile navigation.
