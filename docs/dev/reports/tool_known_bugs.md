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
| Tools Index / Registry validation surface | PASS for runtime smoke; FAIL for legacy validators | TB-001, TB-002 |

## Bug Register
| ID | Tool Surface | Title | Severity | Reproduction Steps | Observed Behavior | Expected Behavior | Owner / Resolution Path | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TB-001 | Tools Index / Registry validation surface | `validate-tool-registry` reports false positives against utility folders and preserved legacy entries | Medium | 1. Run `node ./scripts/validate-tool-registry.mjs`.<br>2. Observe output for `tools/Tool Host`, `tools/codex`, `tools/dev`, `tools/preview`, `tools/templates`, and `sprite-editor-old-keep`. | Script fails with `TOOL_REGISTRY_INVALID` despite tools launch smoke passing and active tools loading. | Validator should scope checks to active product-tool surfaces and valid legacy rules. | Tools validation lane: update validator scope/filter rules and legacy handling contract. | Open |
| TB-002 | Tools Index / Registry validation surface | `validate-active-tools-surface` hard-fails on missing historical PR doc | High | 1. Run `node ./scripts/validate-active-tools-surface.mjs`.<br>2. Observe `ENOENT` for `docs/pr/BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL.md`. | Script aborts before completing active surface checks. | Validator should not hard-depend on removed historical PR docs or should gate optional docs gracefully. | Tools validation lane: remove hard dependency and keep validator contract tied to active tool surfaces only. | Open |
