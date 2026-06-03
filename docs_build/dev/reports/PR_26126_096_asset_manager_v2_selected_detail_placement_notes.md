# PR_26126_096 Asset Manager V2 Selected Detail Placement Notes

## Placement
- Selected Asset Detail moved into the Asset Manager V2 center panel.
- Selected Asset Detail is no longer a full-width bottom control spanning left-to-right across the app shell.
- The Assets list remains separate inside the Assets accordion.
- `assetPreview` remains embedded inside Selected Asset Detail.

## Height
- Selected Asset Detail now reserves 220px in the center panel.
- This increases the previous 120px bottom-screen allocation by 100px.
- The center panel keeps Assets as the fill area and Selected Asset Detail as a fixed-height detail/preview area.

## Validation
- Playwright validates Selected Asset Detail is not inside `assetsContent`.
- Playwright validates Selected Asset Detail is parented by the center panel.
- Playwright validates the detail control stays inside the center panel and does not span the full app width.
- Playwright validates the detail height is at least 220px.
- Playwright validates `assetPreview` remains inside Selected Asset Detail.
