# PR_26126_094 Asset Manager V2 Palette Swatch Notes

## Sort Labels
- Palette sort labels were shortened to `Hue`, `Sat`, `Bri`, `Nam`, and `Tag`.

## Swatches
- Palette swatches now render side-by-side as compact swatch buttons.
- Visible swatch names were removed from the picker surface.
- Swatch size increased from 20px to 35px.
- Hover tooltips contain the swatch details: name, hex, symbol, source, and tags.

## Color Mode
- When Type is Color, the Pick Asset fieldset and button are hidden.
- Palette Colors replaces Pick Asset for Color type selection.
- Non-Color types continue to show Pick Asset and hide Palette Colors.

## Validation
- Playwright validates labels, tooltip-only swatch details, 35px swatch sizing, and hidden Pick Asset behavior for Color.
