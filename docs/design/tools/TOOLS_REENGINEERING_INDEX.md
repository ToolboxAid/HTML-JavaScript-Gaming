# Tools Reengineering Index

This index is generated from current repo tool registry entries, Workspace V2 lane tools, and Workspace Manager entry points.

| Tool ID | Display Name | Global-Only | ToolState-Capable | Published Output Capable | Status |
|---|---|---|---|---|---|
| `3d-asset-viewer` | 3D Asset Viewer | no | no | yes | Needs additional schema/contract alignment |
| `3d-camera-path-editor` | 3D Camera Path Editor | no | no | yes | Needs additional schema/contract alignment |
| `3d-json-payload` | 3D JSON Payload | no | no | yes | Needs additional schema/contract alignment |
| `asset-browser` | Asset Browser / Import Hub | no | no | yes | Needs additional schema/contract alignment |
| `asset-manager-v2` | asset-manager-v2 | no | yes | yes | In active lane |
| `asset-pipeline` | Asset Pipeline | no | no | yes | Needs additional schema/contract alignment |
| `palette-browser` | Palette Browser / Manager | yes | no | yes | In active lane |
| `palette-manager-v2` | palette-manager-v2 | yes | no | no | Needs additional schema/contract alignment |
| `parallax-editor` | Parallax Scene Studio | no | no | yes | Needs additional schema/contract alignment |
| `performance-profiler` | Performance Profiler | no | no | yes | Needs additional schema/contract alignment |
| `physics-sandbox` | Physics Sandbox | no | no | yes | Needs additional schema/contract alignment |
| `replay-visualizer` | Replay Visualizer | no | no | yes | Needs additional schema/contract alignment |
| `skin-editor` | Primitive Skin Editor | no | no | yes | Needs additional schema/contract alignment |
| `sprite-editor` | Sprite Editor | no | no | yes | Needs additional schema/contract alignment |
| `state-inspector` | State Inspector | no | no | yes | Needs additional schema/contract alignment |
| `svg-asset-studio` | SVG Asset Studio | no | no | yes | Needs additional schema/contract alignment |
| `svg-asset-studio-v2` | svg-asset-studio-v2 | no | yes | yes | In active lane |
| `tile-map-editor` | Tilemap Studio | no | no | yes | Needs additional schema/contract alignment |
| `tile-model-converter` | Tile Model Converter | no | no | yes | Needs additional schema/contract alignment |
| `tilemap-studio-v2` | tilemap-studio-v2 | no | yes | yes | In active lane |
| `vector-map-editor` | Vector Map Editor | no | no | yes | Needs additional schema/contract alignment |
| `vector-map-editor-v2` | vector-map-editor-v2 | no | yes | yes | In active lane |
| `workspace-manager` | Workspace Manager | yes | no | no | Needs additional schema/contract alignment |
| `workspace-v2` | workspace-v2 | yes | no | no | In active lane |

## Classification Notes
- Global-only means the tool/state is workspace-wide and should not be treated as a draft toolState library entry.
- ToolState-capable means Workspace V2 producer and hostContext launch path currently supports the tool.
- Published output capable means the tool payload is an intended `tools.<toolId>` manifest output target.
- "Needs additional schema/contract alignment" means current runtime exists but full Workspace V2 contract + schema ownership is not complete in this lane.

## Sample Alignment Note
- Sample alignment remains a separate phase. These design docs do not require sample JSON changes.
