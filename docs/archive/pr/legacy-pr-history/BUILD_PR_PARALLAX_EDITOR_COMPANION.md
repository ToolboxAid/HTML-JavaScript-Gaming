# BUILD_PR_PARALLAX_EDITOR_COMPANION

## Goal
Build a Parallax Editor as a separate companion tool to the Tile Map Editor.

## Implemented Scope
Build the Parallax Editor with:
- parallax layer list
- image assignment per layer
- depth / draw order
- scroll factor controls
- repeat / wrap controls
- preview against the same project/level format used by the Tile Map Editor
- load/save for parallax-only data

## Data Compatibility
- accepts `toolbox.tilemap/1` and extracts `map` + `parallax.layers`
- accepts/saves `toolbox.parallax/1` as parallax-only payload
- exports a tilemap-compatible parallax patch payload for easy merge into map data

## Integration Constraints
- use the same project/level data model
- do not merge parallax controls into the Tile Map Editor UI
- do not modify engine core APIs

## Boundaries
- Tile Map Editor owns map authoring
- Parallax Editor owns background/depth authoring
- Shared project format allowed
- Separate tool UI required

## Output
A focused Parallax Editor companion tool that stays cleanly separated from the Tile Map Editor.
