# LEVEL_SVG_EDITOR_USED_COLOR_SWATCHES

## Requirement
All colors that have been used in the current document should appear as a swatch strip above the main palette.

## Swatch Rules
- derived from colors actually used in the current SVG/document
- shown above the regular palette for fast re-selection
- clicking a used-color swatch sets the active Paint or Stroke through the same palette-selection flow
- duplicates should be collapsed
- order should favor recency or stable first-use order
- swatches update when colors are newly introduced into the document

## UX Intent
Recently/commonly used colors should be faster to find than hunting through the full palette every time.
