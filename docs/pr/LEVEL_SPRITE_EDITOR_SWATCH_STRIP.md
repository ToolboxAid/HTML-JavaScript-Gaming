# LEVEL_SPRITE_EDITOR_SWATCH_STRIP

## Requirement
Add the same used-color swatch strip concept to the Sprite Editor.

## Behavior
- all colors used in the current sprite/document appear as swatches above the main palette
- clicking a swatch sets the active drawing color through the normal palette-selection flow
- duplicates are collapsed
- ordering should favor recency or stable first-use order
- swatches update as new colors are introduced or removed

## UX Intent
The Sprite Editor should support fast re-selection of colors already in use without hunting through the full palette.

## Consistency Rule
The swatch-strip behavior should feel aligned between:
- SVG Background Editor
- Sprite Editor
