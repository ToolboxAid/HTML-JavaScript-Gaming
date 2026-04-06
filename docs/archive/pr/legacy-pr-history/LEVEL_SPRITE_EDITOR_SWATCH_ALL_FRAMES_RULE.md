# LEVEL_SPRITE_EDITOR_SWATCH_ALL_FRAMES_RULE

## Rule
The Sprite Editor used-color swatch strip must be built from all frame colors in the current sprite/document.

## Required Behavior
- scan every frame
- collapse duplicates
- show combined used colors above the main palette
- clicking a swatch sets the active drawing color through the normal palette-selection flow
- swatches update when any frame adds or removes a color
