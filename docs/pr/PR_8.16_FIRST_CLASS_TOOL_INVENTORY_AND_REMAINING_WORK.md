# PR 8.16 - First-Class Tool Inventory And Remaining Work

## Purpose
Provide one canonical, docs-only inventory for the repo's first-class tool set and record remaining schema alignment work.

## Sources Used
- `tools/toolRegistry.js` (`getVisibleActiveToolRegistry()` for canonical 17-tool set)
- `tools/<tool folder>/...` (folder existence)
- `tools/schemas/tools/*.schema.json` (tool schema inventory)
- `samples/**/sample.<id>.<tool>.json` (observed payload/config usage hints)

## Canonical First-Class Tool Inventory (17)

| # | Tool ID | Display Name | Folder Path | Schema Path | Palette Usage | Data Usage | Schema Count |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `vector-map-editor` | Vector Map Editor | `tools/Vector Map Editor` | `tools/schemas/tools/vector-map-editor.schema.json` | Optional/shared | `vectorMapDocument` | 1 |
| 2 | `vector-asset-studio` | Vector Asset Studio | `tools/Vector Asset Studio` | `tools/schemas/tools/vector-asset-studio.schema.json` | Optional/shared | `vectorAssetDocument` | 1 |
| 3 | `tile-map-editor` | Tilemap Studio | `tools/Tilemap Studio` | `tools/schemas/tools/tile-map-editor.schema.json` | Optional/shared | `tileMapDocumentPath`, `tilemapDocumentPath`, `parallaxDocument` | 1 |
| 4 | `parallax-editor` | Parallax Scene Studio | `tools/Parallax Scene Studio` | `tools/schemas/tools/parallax-editor.schema.json` | Optional/shared | `parallaxDocument`, `tilemapDocumentPath`, `vectorAssetSvgPath` | 1 |
| 5 | `sprite-editor` | Sprite Editor | `tools/Sprite Editor` | `tools/schemas/tools/sprite-editor.schema.json` | Yes | `spriteProject` | 1 |
| 6 | `skin-editor` | Primitive Skin Editor | `tools/Skin Editor` | `MISSING (expected: tools/schemas/tools/skin-editor.schema.json)` | Yes (color presets) | Skin preset config (no sample payload lane currently) | 0 |
| 7 | `asset-browser` | Asset Browser / Import Hub | `tools/Asset Browser` | `tools/schemas/tools/asset-browser.schema.json` | Yes (browse/reference) | `assetBrowserPreset` | 1 |
| 8 | `palette-browser` | Palette Browser / Manager | `tools/Palette Browser` | `tools/schemas/tools/palette-browser.schema.json` | Yes (primary) | Palette dataset/swatches | 1 |
| 9 | `state-inspector` | State Inspector | `tools/State Inspector` | `tools/schemas/tools/state-inspector.schema.json` | No | `snapshot` | 1 |
| 10 | `replay-visualizer` | Replay Visualizer | `tools/Replay Visualizer` | `tools/schemas/tools/replay-visualizer.schema.json` | No | `events` timeline | 1 |
| 11 | `performance-profiler` | Performance Profiler | `tools/Performance Profiler` | `tools/schemas/tools/performance-profiler.schema.json` | No | `profileSettings` | 1 |
| 12 | `physics-sandbox` | Physics Sandbox | `tools/Physics Sandbox` | `tools/schemas/tools/physics-sandbox.schema.json` | No | `physicsBody` | 1 |
| 13 | `asset-pipeline-tool` | Asset Pipeline Tool | `tools/Asset Pipeline Tool` | `tools/schemas/tools/asset-pipeline-tool.schema.json` | No direct palette payload | `pipelinePayload` | 1 |
| 14 | `tile-model-converter` | Tile Model Converter | `tools/Tile Model Converter` | `tools/schemas/tools/tile-model-converter.schema.json` | No direct palette payload | `candidate`, `conversion` | 1 |
| 15 | `3d-json-payload-normalizer` | 3D JSON Payload Normalizer | `tools/3D JSON Payload Normalizer` | `tools/schemas/tools/3d-json-payload-normalizer.schema.json` | No | `mapPayload` | 1 |
| 16 | `3d-asset-viewer` | 3D Asset Viewer | `tools/3D Asset Viewer` | `tools/schemas/tools/3d-asset-viewer.schema.json` | No | `asset3d` | 1 |
| 17 | `3d-camera-path-editor` | 3D Camera Path Editor | `tools/3D Camera Path Editor` | `tools/schemas/tools/3d-camera-path-editor.schema.json` | No | `cameraPath` | 1 |

## Verification Summary
- First-class tools listed: 17/17.
- Tool folders present: 17/17.
- Tools with exactly one `<toolId>.schema.json`: 16/17.
- Gap: `skin-editor` has no `tools/schemas/tools/skin-editor.schema.json`.

## Remaining Work Checklist (Updated)
- [x] Canonical 17-tool inventory documented.
- [x] Tool folder paths verified for all 17.
- [x] Explicit schema paths recorded per tool.
- [ ] Close schema gap for `skin-editor` by adding `tools/schemas/tools/skin-editor.schema.json`.
- [ ] Re-run first-class schema count check and confirm 17/17 have exactly one schema.

## Scope Guard
- Docs/inventory only.
- No runtime logic changes.
- No validator additions.
- No `start_of_day` changes.
