# Asset Usage Contract

## Purpose
Define the shared asset and shared palette handoff contract for first-class tools under `tools/`.

This contract keeps tools on shared references by default instead of creating hidden tool-private copies of assets or palettes.

## In-Scope Tools
- `Vector Map Editor`
- `Vector Asset Studio`
- `Tilemap Studio`
- `Parallax Scene Studio`
- `Sprite Editor`
- `Asset Browser / Import Hub`
- `Palette Browser / Manager`

## Out of Scope
- `SpriteEditor_old_keep`
- sample surfacing on `tools/index.html`
- showcase or game runtime content
- engine-core API restructuring

## Shared Action Labels
All active tools use these exact shared labels:
- `Browse Assets`
- `Import Assets`
- `Browse Palettes`
- `Manage Palettes`

These actions are rendered through the shared platform shell so labels stay normalized across tools.

## Launch Contract
Shared tool launches use query parameters on the target tool page:

- `view`
  - asset browser: `browse` or `import`
  - palette browser: `browse` or `manage`
- `sourceToolId`
  - the calling first-class tool id from `tools/toolRegistry.js`

Example:

```text
../Asset Browser/index.html?view=import&sourceToolId=tile-map-editor
../Palette Browser/index.html?view=browse&sourceToolId=sprite-editor
```

## Shared Asset Handoff
Shared asset selection is published under the browser storage key:

```text
toolboxaid.shared.assetHandoff
```

Normalized shape:

```json
{
  "assetId": "asset-vector-player",
  "assetType": "vector",
  "sourcePath": "../../games/Asteroids/platform/assets/vectors/asteroids-ship.vector.json",
  "displayName": "Asteroids Ship Vector",
  "tags": ["Vector Assets"],
  "metadata": {
    "category": "Vector Assets"
  },
  "sourceToolId": "vector-map-editor",
  "selectedAt": "2026-04-05T00:00:00.000Z"
}
```

### Rules
- `assetId` must be stable for the selected shared asset entry.
- `sourcePath` must point to the shared asset location, not a private per-tool clone.
- `assetType` must use normalized tool-facing categories such as `vector`, `sprite`, `tileset`, `background`, `palette`, or `other`.
- `metadata` may extend the shape, but must not replace the stable top-level fields.

## Shared Palette Handoff
Shared palette selection is published under the browser storage key:

```text
toolboxaid.shared.paletteHandoff
```

Normalized shape:

```json
{
  "paletteId": "builtin:crayola032",
  "displayName": "crayola032",
  "colors": [
    {
      "symbol": "!",
      "hex": "#232323",
      "name": "Black"
    }
  ],
  "metadata": {
    "source": "engine"
  },
  "sourceToolId": "sprite-editor",
  "selectedAt": "2026-04-05T00:00:00.000Z"
}
```

### Rules
- `paletteId` must be stable for built-in or custom palettes.
- built-in palettes remain shared source-of-truth references.
- custom palettes may be edited locally, but export/handoff still uses the normalized shared shape.
- tools should apply shared palette references by contract, not by hidden duplicate palette stores.

## Tool Responsibilities

### Asset Browser / Import Hub
- browse approved shared asset locations
- publish normalized shared asset handoffs
- generate non-destructive import plans into approved shared folders

### Palette Browser / Manager
- browse built-in shared palettes
- manage local editable palette copies
- publish normalized shared palette handoffs

### Active Authoring Tools
- launch shared browse/import/manage flows through the shared shell
- consume current shared handoff summaries without forking private defaults by default
- stay aligned to shared asset and palette references

## UI Contract
- engine theme remains mandatory
- shared shell remains mandatory
- the tools landing page remains tool-only
- legacy tools remain excluded from active surfacing

## Non-Goals
- direct filesystem mutation from the Asset Browser by default
- tool-local asset silos as the default integration path
- legacy sprite editor reintegration
- sample cards or showcase cards on the tools landing page
