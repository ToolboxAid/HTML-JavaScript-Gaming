# Tool Payload / Palette Boundary Rules

## Tool Payload
A tool payload file is the same format as an item in workspace/game manifest `tools[]`.

Allowed top-level fields are defined by that tool's schema only.

Do not add:
- `palette`
- `palettePath`
- `paletteRef`
- sample wrapper fields

## Palette Object
Palette data lives in a separate JSON file:

`sample.palette.json`

The launcher/workspace layer is responsible for passing the palette object alongside the tool payload.

## Why
This keeps tool schemas consistent across:
- samples
- games
- workspace manifests
- direct tool launch
