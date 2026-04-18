# BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION_CONTROL_PLACEMENT_MATRIX

## Placement Rule Introduced
- Shared toolbar cluster ordering:
  - `tools-platform-control-cluster--primary` (open/load/save/export/project IO)
  - `tools-platform-control-cluster--workflow` (map/canvas/document/tool configuration)
  - `tools-platform-control-cluster--preview` (simulate/play/preview/view controls; right-biased on desktop)
- Shared row spacing for grouped actions via `tools-platform-control-row`.

## Control Placement Matrix (Primary In-Scope Set)
| Tool | Previous Inconsistency | Normalized Placement Rule | Evidence |
| --- | --- | --- | --- |
| Parallax Scene Studio | Toolbar groups had no shared semantic order contract. | Mapped groups to `primary`, `workflow`, `preview` control clusters. | `tools/Parallax Scene Studio/index.html` |
| Sprite Editor | Toolbar groups were tool-local and partially ad hoc (`tools-group`). | Added shared control-cluster roles while preserving existing tool button grouping. | `tools/Sprite Editor/index.html` |
| Tilemap Studio | Toolbar group order not tied to shared ordering contract. | Mapped groups to shared `primary/workflow/preview` placement rule. | `tools/Tilemap Studio/index.html` |
| Vector Asset Studio | Toolbar groups existed without shared ordering semantics. | Added shared control-cluster roles to normalize group placement. | `tools/Vector Asset Studio/index.html` |
| Vector Map Editor | Mixed toolbar controls lacked shared cluster semantics. | Mapped group rows to shared `primary/workflow/preview` clusters. | `tools/Vector Map Editor/index.html` |
| Asset Browser | Action rows used local spacing/placement only. | Normalized action rows to shared control-row spacing convention. | `tools/Asset Browser/index.html` |
| Palette Browser | Action rows used local spacing/placement only. | Normalized action rows to shared control-row spacing convention. | `tools/Palette Browser/index.html` |
| Tool Host | Mount/navigation control rows used local spacing/placement only. | Normalized host controls with shared control-row placement and spacing. | `tools/Tool Host/index.html` |

## Notes
- This PR keeps existing tool-specific capabilities intact and only normalizes shared placement semantics/spacing.
- No feature behavior changes were introduced.
