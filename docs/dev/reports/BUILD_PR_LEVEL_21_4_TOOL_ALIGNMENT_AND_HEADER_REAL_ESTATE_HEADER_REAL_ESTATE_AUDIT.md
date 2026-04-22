# BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE_HEADER_REAL_ESTATE_AUDIT

## Baseline Inputs Used
- `docs/dev/reports/BUILD_PR_LEVEL_21_2_TOOL_TESTING_DOCUMENTATION_AND_REPORT_STANDARDIZATION_TOOL_INVENTORY.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_AUTOMATION_MATRIX.md`
- `docs/dev/reports/tool_known_bugs.md`
- `docs/dev/reports/tool_missing_functionality.md`

## Prioritization Rationale
- Highest-value lane from 21.3: shared cross-tool shell alignment and compacting header chrome.
- Single shared shell (`tools/shared/platformShell.js` + `tools/shared/platformShell.css`) applies to all primary tools and yields the largest bounded reduction in vertical waste without per-tool feature rewrites.

## In-Scope Tool Surfaces
- Asset Browser
- Palette Browser
- Parallax Scene Studio
- Sprite Editor
- Tilemap Studio
- Vector Asset Studio
- Vector Map Editor
- Tool Host
- Additional shared-shell consumers: 3D Asset Viewer, 3D Camera Path Editor, 3D JSON Payload Normalizer, Performance Profiler, Physics Sandbox, Replay Visualizer, State Inspector, Tile Model Converter, Asset Pipeline Tool, Tools Index

## Header Real-Estate Changes (Shared Shell)
| Surface | Before | After | Result |
| --- | --- | --- | --- |
| Header container spacing | host margin `16px auto` | host margin `10px auto` | Reduced top/bottom chrome footprint |
| Header frame padding | `18px 20px` | `12px 14px` | Reduced vertical and horizontal overhead |
| Header mode | always-open details pattern | collapsible accordion with persisted state (`toolboxaid.toolsPlatform.headerExpanded`) | Tool pages default compact; full controls still accessible |
| Header controls row | large-pill minimum heights (`36px` / `34px`) | compact-pill minimum heights (`30px` / `28px`) | Reduced action row height and wrap pressure |
| Header metadata text | larger text (`0.95rem`) | compact text (`0.85rem`) | Less vertical crowding while preserving readability |
| Status bar spacing | `12px 16px` padding | `8px 12px` padding | Lower baseline chrome height |

## Structure Audit (Before -> After)
| Area | Before | After |
| --- | --- | --- |
| Accordion class contract | mixed, tool-specific class leakage (`palette-browser__accordion`) | shared shell-only class contract (`tools-platform-frame__accordion*`) |
| Accordion icon rendering | mojibake glyph in shared shell markup | explicit entity (`&#9662;`) with rotation state class |
| Header summary | less informative compact row | summary includes active title + shell label + compact meta |
| Tool Host label in shared shell | generic fallback labels | explicit `data-tool-title="Tool Host"` consumed by shell |

## Usability Guard
- Controls were not removed; they are compacted and collapsible.
- Full nav/actions/project controls remain in the expanded panel.
- Tools launch smoke confirms no blocking load regressions after compaction/alignment.
