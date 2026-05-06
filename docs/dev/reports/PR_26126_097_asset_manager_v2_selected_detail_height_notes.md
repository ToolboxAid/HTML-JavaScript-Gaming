# PR_26126_097 Asset Manager V2 Selected Detail Height Notes

## Height Behavior
- Selected Asset Detail no longer uses a fixed flex basis.
- Selected Asset Detail no longer declares a fixed minimum height.
- The control now uses `flex: 0 1 auto` and `min-height: 0`.
- Rendered height is controlled by the selected detail content and center-panel layout rather than a hard-coded 300px or 220px value.

## Layout Preservation
- Selected Asset Detail remains in the center panel.
- Selected Asset Detail remains separate from the Assets list.
- `assetPreview` remains inside Selected Asset Detail.
- The control still does not span the full app width.

## Validation
- Playwright validates the computed flex basis is `auto`.
- Playwright validates the computed minimum height is `0px`.
- Playwright validates the rendered height is not the fixed 300px value.
- Playwright validates the detail control stays within the center panel.
