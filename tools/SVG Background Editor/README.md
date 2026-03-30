# SVG Background Editor

The SVG Background Editor is a standalone authoring tool for background art assets.

## Scope

- Create new SVG background files
- Load existing SVG files
- Save authored SVG files
- Load local learning samples from `./samples/`
- Draw vector primitives:
  - rectangle
  - ellipse/circle
  - line
  - polyline
  - path
- Edit fill + stroke style
- Select, move, resize, delete elements
- Manage element order with an element list
- Zoom and pan the canvas

## Boundary

- This tool is for background art authoring only.
- Tile map gameplay structure remains in `tools/Tile Map Editor/`.
- Parallax depth/motion composition remains in `tools/Parallax Editor/`.
- No engine core API changes are required for this tool.

## Handoff to Parallax Editor

1. Author and save an SVG in this editor.
2. In Parallax Editor, assign the saved SVG as a layer image source.
3. Tune draw order, scroll factors, repeat/wrap, and foreground/background placement there.
