# PR_26126_090 Asset Manager V2 Tile Layout Notes

Date: 2026-05-06

## Tile Layout

- Asset tiles now use a fixed `88px` height sized for the type/role line plus a two-line ID area.
- The X delete control remains inside the tile button and is positioned at the top-right corner.
- Visible asset identity text is left-aligned.
- The `type:role` line uses stronger weight than the ID.
- The asset ID uses a smaller font size and lighter weight than `type:role`.
- The vertical gap between `type:role` and ID is reduced to `2px`.
- Long IDs clamp to the two-line ID area while full details remain available in the tile tooltip.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates X placement, left-aligned text, fixed tile height, reduced row gap, smaller/lighter ID text, and continued tile wrapping.
