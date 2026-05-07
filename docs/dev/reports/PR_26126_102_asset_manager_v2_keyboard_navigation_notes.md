# PR_26126_102 Asset Manager V2 Keyboard Navigation Notes

## Navigation Model
- The Assets list is focusable.
- The selected asset tile container is focusable.
- Tile buttons remain focusable and clickable.
- All handled keyboard navigation prevents default scrolling.

## Keys
- ArrowLeft and ArrowUp select the previous rendered tile.
- ArrowRight and ArrowDown select the next rendered tile.
- PageUp selects the previous rendered tile.
- PageDown selects the next rendered tile.
- Home selects the first rendered tile.
- End selects the last rendered tile.
- Enter focuses/selects the current selected tile when the Assets list is focused.

## Selection Updates
- Keyboard selection uses the same render path as mouse selection.
- Selected tile styling, Selected Asset Detail, preview, and focus update together.

## Validation
- Playwright validates arrow navigation from a tile button and from the Assets list.
- Playwright validates Home from the selected tile container.
- Playwright validates PageUp/PageDown prevent page scroll while changing selection.
- Playwright validates Enter from the Assets list restores focus to the selected tile.
