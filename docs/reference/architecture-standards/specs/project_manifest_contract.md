# Project Manifest Contract

## Purpose and scope
`html-js-gaming.project` is the shared project root for active first-class tools under `tools/`. It gives the platform one save/open/close contract, one migration entry point, and one place to carry shared asset and palette references across tools.

## Version
- Schema: `html-js-gaming.project`
- Initial version: `1`
- Migration rule: future versions must load through explicit migration functions, not ad hoc tool-local mutation

## Canonical shape
```json
{
  "schema": "html-js-gaming.project",
  "version": 1,
  "id": "project-20260405-abcdef",
  "name": "Untitled Project",
  "createdAt": "2026-04-05T12:00:00.000Z",
  "updatedAt": "2026-04-05T12:00:00.000Z",
  "activeToolId": "vector-map-editor",
  "dirty": false,
  "sharedReferences": {
    "asset": null,
    "palette": null
  },
  "tools": {
    "vector-map-editor": {},
    "vector-asset-studio": {},
    "tile-map-editor": {},
    "parallax-editor": {},
    "sprite-editor": {},
    "asset-browser": {},
    "palette-browser": {}
  },
  "workspace": {
    "lastOpenTool": "vector-map-editor",
    "notes": ""
  },
  "migration": {
    "sourceVersion": 1,
    "applied": []
  }
}
```

## Shared reference rules
- Shared assets and shared palettes live in `sharedReferences`
- Tools consume those references and may mirror ids inside their own documents, but the manifest stays the canonical cross-tool handoff root
- Consumers should prefer ids and source paths over duplicating shared asset or palette payloads

## Tool-state rules
- `tools.<toolId>` stores only that tool's persistence payload
- Tool payloads may include tool-native document state
- Tool payloads must be serializable JSON
- Unknown tool keys are tolerated for forward compatibility

## Serializer requirements
- Produce stable pretty-printed JSON
- Preserve `id`, `createdAt`, and supported tool payloads
- Update `updatedAt` on capture/save
- Keep `sharedReferences` synchronized with the latest shared asset/palette handoff state

## Validator requirements
- Confirm schema id
- Confirm supported or migratable version
- Confirm required root fields exist
- Confirm `tools` is an object
- Emit warnings, not silent drops, for incomplete shared references

## Migration entry point
- `migrateProjectManifest(rawManifest)` is the only accepted migration entry
- Migration must preserve data when safe
- Migration metadata must record source version and applied migration labels

## Active tool coverage
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor
- Asset Browser / Import Hub
- Palette Browser / Manager

## Explicit non-goals
- No legacy `SpriteEditor_old_keep` participation
- No samples or showcase content embedded in manifest roots
- No per-tool isolated project roots as the primary save format
