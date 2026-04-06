# BUILD_PR_TILEMAP_EDITOR_FOUNDATION

## Goal
Build the Tile Map Editor foundation first and keep parallax editing out of this PR.

## Decision
Parallax Editor is a separate companion tool, not part of the Tile Map Editor foundation.

## Foundation Scope
- tile painting, erase, and pick workflows on the selected layer
- layer selection plus layer add/remove/visibility controls
- tileset selection from editor-defined palette metadata
- map load/save JSON
- runtime export JSON
- collision/data layer support as first-class layer kinds
- object/spawn marker support
- saved document model that includes a reserved `parallax` block for a future companion editor

## Data Contract (Foundation)
```json
{
  "schema": "toolbox.tilemap/1",
  "version": 1,
  "map": { "name": "untitled-map", "width": 32, "height": 18, "tileSize": 24 },
  "tileset": [{ "id": 0, "name": "Empty", "color": "transparent" }],
  "layers": [
    {
      "id": "ground",
      "name": "Ground",
      "kind": "tile|collision|data",
      "visible": true,
      "locked": false,
      "data": [[0]]
    }
  ],
  "markers": [
    { "id": "marker-1", "type": "spawn|object", "name": "spawn-point", "col": 0, "row": 0, "properties": {} }
  ],
  "parallax": {
    "schema": "toolbox.parallax/1",
    "companionEditor": "ParallaxEditor",
    "layers": []
  }
}
```

## Companion Boundary
- Tile Map Editor owns map authoring in this PR.
- Parallax Editor owns parallax-only authoring in a later PR.
- Shared document format is allowed.
- Parallax controls must not be introduced into this foundation UI.

## Boundaries
- Tile Map Editor owns map authoring
- Parallax Editor owns background/depth authoring
- Shared level/project format allowed
- Do not merge parallax controls into core tile editing UI in this phase

## Output
A focused Tile Map Editor first, with a clean path for a later companion Parallax Editor.
