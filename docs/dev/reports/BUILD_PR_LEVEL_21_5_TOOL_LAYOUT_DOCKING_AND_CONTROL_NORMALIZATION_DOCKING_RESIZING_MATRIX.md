# BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION_DOCKING_RESIZING_MATRIX

## Shared Rule
- Desktop (`min-width: 1201px`): `.tools-platform-resize-panel` enables horizontal panel resizing with bounded widths.
- Mobile/tablet (`max-width: 1200px`): resizing is disabled for stability and readability.
- `.tools-platform-dock-panel` provides vertical resize + bounded dock height for dock-like surfaces.

## Docking / Resizing Matrix
| Tool | Left/Right Panel Resize | Dock Resize | Applicability | Changes Applied |
| --- | --- | --- | --- | --- |
| Asset Browser | Yes (left + right panels) | N/A | Applicable: side panels in 3-column layout | Added `tools-platform-resize-panel` with side markers. |
| Palette Browser | Yes (left + right panels) | N/A | Applicable: side panels in 3-column layout | Added `tools-platform-resize-panel` with side markers. |
| Parallax Scene Studio | Yes (left + right sidebars) | Yes (preview panel) | Applicable: sidebars + central preview panel | Added `tools-platform-resize-panel` and `tools-platform-dock-panel`. |
| Sprite Editor | Yes (left + right panels) | N/A | Applicable: left/right authored panel rails | Added `tools-platform-resize-panel` classes. |
| Tilemap Studio | Yes (left + right sidebars) | N/A | Applicable: sidebars in workspace grid | Added `tools-platform-resize-panel` classes. |
| Vector Asset Studio | Yes (left + right sidebars) | Yes (canvas panel) | Applicable: dual sidebars + central panel | Added `tools-platform-resize-panel` and `tools-platform-dock-panel`. |
| Vector Map Editor | Yes (left + right side rails) | Yes (JSON dock) | Applicable: side rails and existing dock surface | Added `tools-platform-resize-panel`; dock normalized with `tools-platform-dock-panel`. |
| Tool Host | N/A (no dual side rails) | Yes (mount container) | Applicable: hosted runtime mount surface behaves as dock-like panel | Added `tools-platform-dock-panel` and lowered initial min-height for better default fit. |

## Guardrails
- No docking/resizing engine/runtime feature logic was changed.
- Changes are CSS + class opt-ins only, bounded to tools UX polish layer.
