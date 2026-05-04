# Tools Reengineering Index

Task: PR_26124_021-tool-folder-design-reset

This index is based on the current `tools/*` folders and the completed schema baseline under `tools/schemas`. It is intentionally tool-only: no runtime rollback, schema mutation, sample edit, game edit, or tool deletion is part of this reset.

| Tool ID | Folder | Global-Only | Launchable Tool | Published-Output-Capable | Needs Schema Alignment | Needs Controls Cleanup | Rebuild Priority |
|---|---|---:|---:|---:|---:|---:|---:|
| `palette-browser` | `tools/Palette Browser` | yes | yes | yes | no | yes | P01 |
| `palette-manager-v2` | `tools/palette-manager-v2` | yes | yes | no | yes | yes | P02 |
| `asset-browser` | `tools/Asset Browser` | no | yes | yes | no | yes | P03 |
| `asset-pipeline` | `tools/Asset Pipeline` | no | yes | yes | no | yes | P04 |
| `asset-manager-v2` | `tools/asset-manager-v2` | no | yes | yes | yes | yes | P05 |
| `svg-asset-studio` | `tools/SVG Asset Studio` | no | yes | yes | no | yes | P06 |
| `svg-asset-studio-v2` | `tools/svg-asset-studio-v2` | no | yes | yes | yes | yes | P07 |
| `sprite-editor` | `tools/Sprite Editor` | no | yes | yes | no | yes | P08 |
| `skin-editor` | `tools/Skin Editor` | no | yes | yes | no | yes | P09 |
| `tile-map-editor` | `tools/Tilemap Studio` | no | yes | yes | no | yes | P10 |
| `tilemap-studio-v2` | `tools/tilemap-studio-v2` | no | yes | yes | yes | yes | P11 |
| `tile-model-converter` | `tools/Tile Model Converter` | no | yes | yes | no | yes | P12 |
| `parallax-editor` | `tools/Parallax Scene Studio` | no | yes | yes | no | yes | P13 |
| `vector-map-editor` | `tools/Vector Map Editor` | no | yes | yes | no | yes | P14 |
| `vector-map-editor-v2` | `tools/vector-map-editor-v2` | no | yes | yes | yes | yes | P15 |
| `3d-json-payload` | `tools/3D JSON Payload` | no | yes | yes | no | yes | P16 |
| `3d-asset-viewer` | `tools/3D Asset Viewer` | no | yes | yes | no | yes | P17 |
| `3d-camera-path-editor` | `tools/3D Camera Path Editor` | no | yes | yes | no | yes | P18 |
| `physics-sandbox` | `tools/Physics Sandbox` | no | yes | yes | no | yes | P19 |
| `state-inspector` | `tools/State Inspector` | no | yes | yes | no | yes | P20 |
| `replay-visualizer` | `tools/Replay Visualizer` | no | yes | yes | no | yes | P21 |
| `performance-profiler` | `tools/Performance Profiler` | no | yes | yes | no | yes | P22 |
| `workspace-manager` | `tools/Workspace Manager` | yes | yes | no | no | yes | P23 |
| `workspace-v2` | `tools/workspace-v2` | yes | yes | no | no | yes | P24 |
| `schemas` | `tools/schemas` | yes | no | no | no | no | P25 |
| `common` | `tools/common` | yes | no | no | no | no | P26 |
| `shared` | `tools/shared` | yes | no | no | no | no | P27 |
| `dev` | `tools/dev` | yes | no | no | no | no | P28 |
| `preview` | `tools/preview` | yes | no | no | no | no | P29 |
| `codex` | `tools/codex` | yes | no | no | no | no | P30 |
| `templates` | `tools/templates` | yes | no | no | no | no | P31 |

## Classification Notes
- Global-only means the folder is workspace-wide/supporting infrastructure or global project state, not a per-tool JSON editor by itself.
- Launchable tool means the folder has its own `index.html` entry point.
- Published-output-capable means the folder is expected to own a `tools.<toolId>` payload for games/samples when rebuilt.
- Needs schema alignment means the current contract is code-only or not yet represented by a dedicated completed schema baseline.
- Needs controls cleanup means the current UI exposes controls/panels that should be rebuilt into explicit import/load, validate, edit/process, export/save, and publish actions.
