# LEVEL_SVG_PALETTE_SELECTION_FLOW

## How palette selection should work in SVG Background Editor

1. Open or create an SVG document
2. Select whether you are setting Paint or Stroke
3. Click a palette color (or used-color swatch)
4. That color becomes the stored active Paint or Stroke color
5. Draw a new shape or apply the color to the selected shape
6. The chosen Paint/Stroke stays active until intentionally changed

## Important Rules
- Paint and Stroke use the same palette selection system
- clicking a swatch or palette color is the selection action
- the selected Paint/Stroke color is stored and locked until changed by the user
- selecting a shape must not silently replace the stored active colors
- disabled controls remain disabled until the required element or color selection exists

## Minimum UI Labels
- Active Paint
- Active Stroke
- Used Colors
- Palette
