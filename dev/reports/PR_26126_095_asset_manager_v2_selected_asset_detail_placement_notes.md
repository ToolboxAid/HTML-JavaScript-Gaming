# PR_26126_095 Asset Manager V2 Selected Asset Detail Placement Notes

## Placement
- Selected Asset Detail moved out of the Assets control.
- Selected Asset Detail is now a direct bottom-screen control inside the Asset Manager V2 app shell.
- The Assets control owns only the asset count and asset tile list.
- The asset preview remains inside Selected Asset Detail.

## Layout
- The Asset Manager V2 shell now reserves a bottom row for Selected Asset Detail.
- The bottom detail control spans the full app width.
- The center asset panel can continue to size independently from the bottom detail control.
- Selected Asset Detail content scrolls when its metadata and preview exceed the reserved bottom area.

## Validation
- Playwright validates `selectedAssetDetailsContent` is not inside `assetsContent`.
- Playwright validates the Selected Asset Detail panel is parented by the app shell.
- Playwright validates `assetPreview` remains inside Selected Asset Detail.
- Playwright validates Selected Asset Detail is positioned below the Assets panel.
