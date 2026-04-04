# Vector Asset Studio

Vector Asset Studio is a standalone authoring tool for SVG-first vector art assets.

## Scope
- Create new SVG files
- Load existing SVG files
- Save authored SVG files
- Load local learning samples from `./samples/`
- Draw and edit vector primitives
- Manage fill and stroke style
- Select, move, resize, delete, and reorder elements
- Zoom and pan the canvas

## Boundary
- This tool is for vector art authoring only.
- Tile map gameplay structure remains in `tools/Tilemap Studio/`.
- Parallax depth and motion composition remains in `tools/Parallax Scene Studio/`.
- No engine core API changes are required for this tool.

## Handoff to Parallax Scene Studio
1. Author and save an SVG in this editor.
2. In Parallax Scene Studio, assign the saved SVG as a layer image source.
3. Tune draw order, scroll factors, repeat/wrap, and foreground/background placement there.
