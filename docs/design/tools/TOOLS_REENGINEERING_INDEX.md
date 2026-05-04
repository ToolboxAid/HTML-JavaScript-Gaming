# Tools Reengineering Index

Task: PR_26124_024

This index separates rebuild anchors from transitional references and support folders. All source paths are exact folders under `tools/*`.

| Tool ID | Exact Source Folder | Classification | Core Roadmap Priority | Publish Target | Notes |
|---|---|---|---|---|---|
| `palette-browser` | `tools/Palette Browser` | global tool | core-01 | tools.palette-browser | first rebuild anchor; global palette only |
| `asset-browser` | `tools/Asset Browser` | rebuildable tool | core-02 | tools.asset-browser | core rebuild lane |
| `asset-pipeline` | `tools/Asset Pipeline` | rebuildable tool | core-03 | tools.asset-pipeline | core rebuild lane |
| `svg-asset-studio` | `tools/SVG Asset Studio` | rebuildable tool | core-04 | tools.svg-asset-studio | core rebuild lane |
| `sprite-editor` | `tools/Sprite Editor` | rebuildable tool | core-05 | tools.sprite-editor | core rebuild lane |
| `skin-editor` | `tools/Skin Editor` | rebuildable tool | core-06 | tools.skin-editor | core rebuild lane |
| `tile-map-editor` | `tools/Tilemap Studio` | rebuildable tool | core-07 | tools.tile-map-editor | core rebuild lane |
| `tile-model-converter` | `tools/Tile Model Converter` | rebuildable tool | core-08 | tools.tile-model-converter | core rebuild lane |
| `parallax-editor` | `tools/Parallax Scene Studio` | rebuildable tool | core-09 | tools.parallax-editor | core rebuild lane |
| `vector-map-editor` | `tools/Vector Map Editor` | rebuildable tool | core-10 | tools.vector-map-editor | core rebuild lane |
| `3d-json-payload` | `tools/3D JSON Payload` | rebuildable tool | core-11 | tools.3d-json-payload | core rebuild lane |
| `3d-asset-viewer` | `tools/3D Asset Viewer` | rebuildable tool | core-12 | tools.3d-asset-viewer | core rebuild lane |
| `3d-camera-path-editor` | `tools/3D Camera Path Editor` | rebuildable tool | core-13 | tools.3d-camera-path-editor | core rebuild lane |
| `physics-sandbox` | `tools/Physics Sandbox` | rebuildable tool | core-14 | tools.physics-sandbox | core rebuild lane |
| `state-inspector` | `tools/State Inspector` | rebuildable tool | core-15 | tools.state-inspector | core rebuild lane |
| `replay-visualizer` | `tools/Replay Visualizer` | rebuildable tool | core-16 | tools.replay-visualizer | core rebuild lane |
| `performance-profiler` | `tools/Performance Profiler` | rebuildable tool | core-17 | tools.performance-profiler | core rebuild lane |
| `palette-manager-v2` | `tools/palette-manager-v2` | transitional/quarantine tool | deferred | reference-only | deferred transitional cleanup; not a core rebuild anchor |
| `asset-manager-v2` | `tools/asset-manager-v2` | transitional/quarantine tool | deferred | reference-only | deferred transitional cleanup; not a core rebuild anchor |
| `svg-asset-studio-v2` | `tools/svg-asset-studio-v2` | transitional/quarantine tool | deferred | reference-only | deferred transitional cleanup; not a core rebuild anchor |
| `tilemap-studio-v2` | `tools/tilemap-studio-v2` | transitional/quarantine tool | deferred | reference-only | deferred transitional cleanup; not a core rebuild anchor |
| `vector-map-editor-v2` | `tools/vector-map-editor-v2` | transitional/quarantine tool | deferred | reference-only | deferred transitional cleanup; not a core rebuild anchor |
| `workspace-v2` | `tools/workspace-v2` | transitional/quarantine tool | deferred | reference-only | deferred transitional cleanup; not a core rebuild anchor |
| `workspace-manager` | `tools/Workspace Manager` | transitional/quarantine tool | deferred | reference-only | deferred transitional cleanup; not a core rebuild anchor |
| `schemas` | `tools/schemas` | schema folder | reference-only | none | schema baseline only; no schema changes in this PR |
| `codex` | `tools/codex` | support folder | reference-only | none | reference only; no normal rebuild doc |
| `common` | `tools/common` | support folder | reference-only | none | reference only; no normal rebuild doc |
| `dev` | `tools/dev` | support folder | reference-only | none | reference only; no normal rebuild doc |
| `preview` | `tools/preview` | support folder | reference-only | none | reference only; no normal rebuild doc |
| `shared` | `tools/shared` | support folder | reference-only | none | reference only; no normal rebuild doc |
| `templates` | `tools/templates` | support folder | reference-only | none | reference only; no normal rebuild doc |

## Classification Definitions
- `global tool`: a launchable global surface. Palette Browser is the only core rebuild anchor in this group.
- `rebuildable tool`: non-transitional launchable tool with an owned JSON contract and `tools.<toolId>` publish target.
- `transitional/quarantine tool`: deferred reference folder retained only for later cleanup.
- `support folder`: shared/reference infrastructure only; it is not a normal tool rebuild target and has no `REENGINEERING_DESIGN.md`.
- `schema folder`: current contract baseline only; no schema changes are part of this PR.
