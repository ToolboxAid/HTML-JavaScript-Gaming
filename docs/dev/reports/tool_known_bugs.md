# Tool Known Bugs

## Primary Tool Coverage
| Tool Surface | Automated Smoke Result | Known Bug IDs |
| --- | --- | --- |
| 3D Asset Viewer | PASS | none in this pass |
| 3D Camera Path Editor | PASS | none in this pass |
| 3D Map Editor | PASS | none in this pass |
| Asset Browser / Import Hub | PASS | none in this pass |
| Asset Pipeline Tool | PASS | none in this pass |
| Palette Browser / Manager | PASS | none in this pass |
| Parallax Scene Studio | PASS | none in this pass |
| Performance Profiler | PASS | none in this pass |
| Physics Sandbox | PASS | none in this pass |
| Replay Visualizer | PASS | none in this pass |
| Sprite Editor | PASS | none in this pass |
| State Inspector | PASS | none in this pass |
| Tile Model Converter | PASS | none in this pass |
| Tilemap Studio | PASS | none in this pass |
| Tool Host | PASS | none in this pass |
| Vector Asset Studio | PASS | none in this pass |
| Vector Map Editor | PASS | none in this pass |
| Tools Index / Registry validation surface | PASS for runtime smoke; PASS for validator scripts | none in this pass |

## Bug Register
| ID | Tool Surface | Title | Severity | Reproduction Steps | Observed Behavior | Expected Behavior | Owner / Resolution Path | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TB-001 | Tools Index / Registry validation surface | `validate-tool-registry` reported false positives against utility folders and preserved legacy entries | Medium | 1. Run `node ./scripts/validate-tool-registry.mjs`. | Validator now returns `TOOL_REGISTRY_VALID` for the active contract. | Validator scopes checks to active product-tool surfaces and valid legacy rules. | Resolved via validator scope/filter hardening in `scripts/validate-tool-registry.mjs`; regression-covered in tools validation suite. | Resolved |
| TB-002 | Tools Index / Registry validation surface | `validate-active-tools-surface` hard-failed on missing historical PR doc | High | 1. Run `node ./scripts/validate-active-tools-surface.mjs`. | Validator now returns `ACTIVE_TOOLS_SURFACE_VALID` without hard failure on optional historical docs. | Validator no longer hard-depends on removed historical PR docs and remains tied to active tool surfaces. | Resolved via optional-target handling + active-registry-driven checks in `scripts/validate-active-tools-surface.mjs`; regression-covered in tools validation suite. | Resolved |
