# BUILD_PR_LEVEL_21_4_TOOL_ALIGNMENT_AND_HEADER_REAL_ESTATE_TOOL_ALIGNMENT_MATRIX

## Alignment Capability Matrix
| Capability | Tools Affected | Previous Inconsistency | New Aligned Behavior | Evidence |
| --- | --- | --- | --- | --- |
| Shared compact header behavior | All shared-shell tools (primary set + shared-shell consumers) | Header chrome consumed high vertical space and remained expanded by default in tool pages. | Shared shell now supports compact accordion mode with persisted open/closed state; tool pages default to compact and can expand on demand. | `tools/shared/platformShell.js`, `tools/shared/platformShell.css`, `tests/tools/PlatformShellHeaderAlignment.test.mjs` |
| Shared shell class contract | All shared-shell tools | Shell markup leaked tool-specific accordion classes (`palette-browser__accordion`). | Shell uses only `tools-platform-frame__accordion*` classes, eliminating tool-specific coupling in shared chrome. | `tools/shared/platformShell.js`, `tools/shared/platformShell.css` |
| Shared action availability in non-landing tools | Tool Host + all existing tool-id pages | Shared action links required a tool id, so Tool Host had no aligned shared action row. | Non-landing surfaces now render shared action links with fallback source id (`tool-host`) when a tool id is unavailable. | `tools/shared/platformShell.js` (`renderSharedActionLinks`) |
| Shared shell labeling for Tool Host | Tool Host | Generic fallback shell labels (not explicit tool surface label). | Tool Host now provides `data-tool-title="Tool Host"` and shell consumes it for title/status consistency. | `tools/Tool Host/index.html`, `tools/shared/platformShell.js` |

## Primary Tool Set Coverage
| Tool | Shared Compact Header | Shared Action Row Alignment | Tool Label Alignment |
| --- | --- | --- | --- |
| Asset Browser | Yes | Yes | Via registry tool label |
| Palette Browser | Yes | Yes | Via registry tool label |
| Parallax Scene Studio | Yes | Yes | Via registry tool label |
| Sprite Editor | Yes | Yes | Via registry tool label |
| Tilemap Studio | Yes | Yes | Via registry tool label |
| Vector Asset Studio | Yes | Yes | Via registry tool label |
| Vector Map Editor | Yes | Yes | Via registry tool label |
| Tool Host | Yes | Yes (fallback source id) | Yes (`data-tool-title`) |

## Notes
- This PR intentionally does not claim panel docking/resizing completion.
- This PR intentionally does not claim full repo-wide control placement normalization outside shared shell scope.
