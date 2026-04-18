# BUILD_PR_LEVEL_21_5_TOOL_LAYOUT_DOCKING_AND_CONTROL_NORMALIZATION_LAYOUT_SPACING_AUDIT

## Baseline Inputs Used
- `docs/dev/reports/BUILD_PR_LEVEL_21_2_TOOL_TESTING_DOCUMENTATION_AND_REPORT_STANDARDIZATION_TOOL_INVENTORY.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_AUTOMATION_MATRIX.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE_HEADER_REAL_ESTATE_AUDIT.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE_TOOL_ALIGNMENT_MATRIX.md`

## Shared Normalization Layer
- Added shared layout/control/docking contract in `tools/shared/platformShell.css`:
  - `.tools-platform-layout-grid`
  - `.tools-platform-control-cluster*`
  - `.tools-platform-control-row`
  - `.tools-platform-resize-panel`
  - `.tools-platform-dock-panel`

## Layout + Spacing Audit (Primary In-Scope Set)
| Tool | Prior Spacing/Layout Condition | Normalization Applied | Evidence |
| --- | --- | --- | --- |
| Asset Browser | Three-column layout had tool-local spacing only; panel spacing behavior diverged from shared shell conventions. | Opted into shared layout grid and shared resize-panel classes for left/right panels; action rows normalized to shared control-row spacing. | `tools/Asset Browser/index.html` |
| Palette Browser | Three-column layout and action-row spacing differed from shared shell conventions. | Opted into shared layout grid and resize-panel classes; action rows normalized with shared control-row convention. | `tools/Palette Browser/index.html` |
| Parallax Scene Studio | Toolbar groups existed but lacked shared placement semantics; workspace spacing was tool-local only. | Toolbar groups normalized with shared control-cluster roles (`primary/workflow/preview`); workspace opted into shared layout grid. | `tools/Parallax Scene Studio/index.html` |
| Sprite Editor | Toolbar grouping existed but lacked shared placement semantics; workspace spacing was tool-local only. | Toolbar groups normalized with shared control-cluster roles; workspace opted into shared layout grid. | `tools/Sprite Editor/index.html` |
| Tilemap Studio | Toolbar groups and workspace spacing were tool-local only. | Toolbar groups normalized with shared control-cluster roles; workspace opted into shared layout grid. | `tools/Tilemap Studio/index.html` |
| Vector Asset Studio | Toolbar grouping and workspace spacing were tool-local only. | Toolbar groups normalized with shared control-cluster roles; workspace opted into shared layout grid. | `tools/Vector Asset Studio/index.html` |
| Vector Map Editor | Toolbar groups lacked shared placement semantics in mixed toolbar set. | Toolbar groups normalized with shared control-cluster roles. | `tools/Vector Map Editor/index.html` |
| Tool Host | Control rows and hosted surface container spacing were ad hoc. | Tool Host control rows normalized to shared control-row spacing; hosted mount surface aligned to shared dock-panel behavior and reduced default min-height. | `tools/Tool Host/index.html` |

## Additional Shared-Shell Consumers
- The shared contract is non-breaking for other `tools-platform-surface` pages and remains opt-in for layout/docking classes.
