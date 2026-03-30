# BUILD_PR_TOOL_THEME_AND_SHARED_SWATCH_WORKFLOW

## Goal
Standardize visual theme usage across all tools, clarify SVG palette selection, and add the used-color swatch concept to the Sprite Editor.

## Scope
- all tools must use the shared theme system
- SVG Background Editor palette selection flow must be explicit
- Sprite Editor gets the same fast used-color swatch strip concept
- no engine core API changes

## Tools in Scope
- tools/Tile Map Editor/
- tools/Parallax Editor/
- tools/SVG Background Editor/
- tools/SpriteEditor/ or equivalent sprite editor path in repo

## Output
One shared UX rule set for theme + palette/swatch behavior across tools.
