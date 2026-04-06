# BUILD_PR_SVG_BACKGROUND_EDITOR_FOUNDATION

## Goal
Add an SVG Background Editor as the next tool so backgrounds can be drawn directly inside the project.

## Why This Is the Right Next Tool
The current tooling now covers:
- Tile Map Editor for gameplay structure
- Parallax Editor for visual depth and motion
- simulation for both editors

What is missing is a way to author the background art itself. An SVG editor fills that gap cleanly.

## Scope
Build a separate SVG Background Editor tool focused on authoring reusable background art for parallax layers and scene backdrops.

## In Scope
- create/edit SVG background art
- basic vector primitives:
  - rectangle
  - ellipse/circle
  - line
  - polyline/path
- fill and stroke controls
- layer list for SVG art elements
- selection / move / resize
- save/load SVG files
- export files usable by the Parallax Editor
- local samples for learning
- no engine core API changes

## Out of Scope
- full illustration-suite complexity
- gameplay map editing
- tile painting
- merging with Tile Map Editor or Parallax Editor
- animation authoring in this first PR

## Boundaries
- SVG Background Editor creates art assets
- Parallax Editor places and configures those assets in depth layers
- Tile Map Editor remains responsible for gameplay structure only

## Recommended Output Location
- tool: `tools/Vector Asset Studio/`
- local samples: `tools/Vector Asset Studio/samples/`

## Result
A dedicated background-art tool that completes the content pipeline:
draw art → place in parallax → preview in simulation
