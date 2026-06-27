# PR_26126_094 Asset Manager V2 Selected Asset Detail Notes

## Layout
- Selected Asset Detail remains a dedicated collapsible control under Assets.
- `assetPreview` now lives inside Selected Asset Detail at the bottom of that control.
- The preview card no longer owns the selected asset metadata rows.

## Fields
- The first detail line shows `ID`, combined `type/kind`, and `Role`.
- The second detail line shows `Path`.
- Separate `Type` and `Kind` rows were removed.
- `Final ID` was removed entirely.
- The selected asset ID is the single ID source shown in the detail control.

## Validation
- Playwright validates the one-line `ID type/kind Role` layout.
- Playwright validates the `Path` line.
- Playwright validates `assetPreview` is nested under `selectedAssetDetailsContent`.
- Playwright validates `Final ID` is not present.
