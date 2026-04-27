# Level 10.6N Tool UI DoD Audit Report

## Summary
- Tools audited: 20 launch surfaces.
- Discovered launch surfaces: `vector-map-editor`, `vector-asset-studio`, `tile-map-editor`, `parallax-editor`, `sprite-editor`, `skin-editor`, `asset-browser`, `palette-browser`, `state-inspector`, `replay-visualizer`, `performance-profiler`, `physics-sandbox`, `asset-pipeline-tool`, `tile-model-converter`, `3d-json-payload-normalizer`, `3d-asset-viewer`, `3d-camera-path-editor`, `workspace-manager`, sample launch tiles, game launch tiles.
- Required coverage categories checked but not present as standalone tools: animation/sprite-animation tool, manifest/data-flow inspector.
- Missing required inputs found: yes.
- Missing controls found: yes.
- Controls using default/demo data: yes.
- Palette contract violations: yes.
- Recommended next PR: add explicit `[tool-ui:control-ready]` diagnostics and required-control gates, starting with Sprite Editor, Palette Browser, and Workspace Manager launch surfaces.

## Cross-Tool Findings
- `[tool-load:*]` diagnostics exist broadly, but `[tool-ui:control-ready]` diagnostics were not found in active tool runtime files.
- `tools/shared/toolLoadDiagnostics.js` defines explicit expected contract blocks only for `sprite-editor` and `palette-browser`; other tools rely on generic classification.
- Sample/game tile surfaces validate route resolution, not downstream required-input readiness per tool.
- Several tools can show usable/default UI without proving sample-launched required input consumption.

## Tool: Sprite Editor (`sprite-editor`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| `palettePath` | sample metadata roundtrip mapping | Yes | Yes | Yes | Enforced to canonical `*.palette.json`. |
| `spriteProject` | preset payload | Yes | Yes | Partial | Accepts wrapper aliases (`config.spriteProject`, `project`). |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| Palette grid (`#paletteButtons`) | loaded palette swatches | Yes | Medium | No | Uses `state.project.palette`. |
| Active color (`#activeColorSwatch`, `#colorPicker`) | loaded palette | Yes | Medium | No | Uses `state.project.activeColor`. |
| Sprite canvas (`#editorCanvas`) | loaded project + active color | Yes | Medium | No | Draw/fill reads `state.project.activeColor`. |
| Frame controls/list | loaded frame data | Yes | Low | No | Bound to `state.project.frames`. |
| Color 1 selector | palette | No | High | No | Not present as a dedicated control. |
| Color 2 selector | palette | No | High | No | Not present as a dedicated control. |

### Missing DoD fields or controls
- Missing dedicated `Color 1`/`Color 2` selectors.
- Missing control-ready diagnostics for palette grid, active color, canvas, frame list, and save/export controls.

### Contract violations
- Sprite preset extraction is lenient (accepts wrapper aliases), which can hide wrong-shape payloads.

### Recommended fix scope
- Smallest next PR: add explicit Color 1/Color 2 readiness model (or update DoD to single active-color model) and emit `[tool-ui:control-ready]` records.

### Explicit Sprite-Editor Palette Binding Verdict
- Palette grid populated from loaded palette: **Yes**.
- Color 1 selector present and bound: **No dedicated control found**.
- Color 2 selector present and bound: **No dedicated control found**.
- Active drawing color bound to loaded palette: **Yes**.
- Sprite canvas uses loaded active color/palette context: **Yes**.

## Tool: Palette Browser (`palette-browser`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| canonical palette payload | preset JSON | Yes | Yes | Partial | Canonical top-level supported; wrappers still accepted. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| title (`#paletteTitle`) | `palette.name` | Yes | Low | No | |
| swatch grid (`#paletteSwatches`) | `palette.swatches` | Yes | Low | No | |
| detail/selection text | selected swatch/palette | Yes | Low | No | |
| copy/export/use controls | selected loaded palette | Yes | Medium | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics for title/grid/detail/action controls.

### Contract violations
- Wrapper tolerance remains (`payload.palette`, `config.palette`), allowing non-canonical shapes in sample path.

### Recommended fix scope
- Smallest next PR: enforce canonical top-level palette shape for sample launch and add control-ready diagnostics.

### Explicit `*.palette-browser.json` Dependency Verdict
- Active metadata does **not** reference `*.palette-browser.json`.
- Active `palette-browser` roundtrip preset paths are canonical `*.palette.json`.
- Compatibility code for wrapper shapes still exists (latent contract drift risk).

## Tool: Vector Map Editor (`vector-map-editor`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns false. |
| vector map document | preset payload | Yes | Yes | Partial | Accepts multiple aliases and payload fallback. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| editor canvas | document objects/mode | Yes | Medium | No | |
| object/layer lists | loaded document data | Yes | Medium | No | |
| JSON editor panel | loaded document data | Yes | Medium | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- Lenient alias extraction can normalize wrong-shape payloads.

### Recommended fix scope
- Smallest next PR: add required-control readiness diagnostics and classify defaulted/empty document state.

## Tool: Vector Asset Studio (`vector-asset-studio`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns false. |
| vector SVG payload | preset (`svgText` or `svgPath`) | Yes | Yes | Partial | Secondary fetch when `svgPath` is provided. |
| palette/editor options | preset editorOptions | Optional | Optional | No | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| SVG preview | loaded SVG | Yes | Medium | No | |
| element list | parsed SVG elements | Yes | Medium | No | |
| palette controls | palette catalog/options | Partial | High | No | Has fallback palette path. |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- Broad preset alias extraction; no strict UI-ready shape gate.

### Recommended fix scope
- Smallest next PR: classify fallback palette/default document as `defaulted` and add control-ready logs.

## Tool: Tilemap Studio (`tile-map-editor`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| tilemap document | preset object/path | Yes | Yes | Partial | Supports direct document or document path indirection. |
| tileset/atlas data | embedded/asset refs | Optional | Optional | Partial | Can run with seeded defaults. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| map canvas | tilemap layers | Yes | Medium | No | |
| tile palette/grid | tileset/atlas | Partial | High | No | |
| layer list | tilemap layers | Yes | Medium | No | |
| save/export controls | loaded document refs | Partial | Medium | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics for map canvas, tile palette, selected tile, and layers.

### Contract violations
- No direct palette-wrapper violation observed in this tool path.

### Recommended fix scope
- Smallest next PR: add per-control readiness checks and defaulted classification.

## Tool: Parallax Scene Studio (`parallax-editor`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| parallax document | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| layer list | loaded layer data | Yes | High | No | Tool seeds default 3-layer document. |
| camera controls | map/meta data | Partial | Medium | No | |
| preview viewport | layer imagery | Partial | High | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: classify seeded/default scene state and add control-ready diagnostics.

## Tool: Replay Visualizer (`replay-visualizer`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns false. |
| `events[]` | preset payload | Yes | Yes | Partial | Hard fail when missing events. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| event list | loaded events | Yes | Low | No | |
| timeline/scrubber | loaded events | Yes | Low | No | |
| play/pause/reset controls | loaded replay state | Yes | Low | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add control-ready diagnostics for event list, timeline, and current-event state.

## Tool: State Inspector (`state-inspector`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns false. |
| inspector snapshot payload | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| input JSON | snapshot payload | Yes | Medium | No | |
| output panel | parsed snapshot | Yes | Medium | No | |
| refresh/load actions | snapshot availability | Partial | Medium | No | |

### Missing DoD fields or controls
- No control-ready diagnostics.
- No declared-paths/fetch-results/expected-vs-actual UI tables for manifest/data-flow readiness.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: expand this tool (or add a dedicated one) to satisfy data-flow inspector DoD fields.

## Tool: Workspace Manager (`workspace-manager`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `gameId` when `mount=game` | query | Yes | Indirect | Partial | Missing/invalid gameId handled via status/diagnostic panel. |
| games metadata | `/games/metadata/games.index.metadata.json` | Yes | Yes | Partial | |
| forwarded tool inputs | query forwarding | Optional | N/A | No | Forwarded, not validated against selected tool contract before launch. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| tool pager (`prev/next`) | active tool list | Yes | Medium | Partial | |
| mount container | selected tool/game frame | Yes | Medium | Partial | |
| status/diagnostic panel | mount outcomes | Yes | Low | Partial | Not in `[tool-load:*]`/`[tool-ui:*]` schema. |

### Missing DoD fields or controls
- Missing required input summary for selected tool before launch.
- Missing launch-time per-tool readiness indicator.
- Missing structured tool-load/tool-ui diagnostics in Workspace Manager layer.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add pre-launch required-input table + readiness badge + structured diagnostics.

## Tool: Asset Browser (`asset-browser`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| `assetBrowserPreset` fields | preset payload/config/direct | Yes | Yes | Partial | Multiple shape aliases accepted. |
| workspace catalog | context/manifests | Optional | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| asset list | catalog entries | Yes | Medium | No | |
| preview panel | selected asset fetch | Yes | Medium | No | |
| import plan controls | preset/catalog state | Partial | Medium | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- Preset alias tolerance can hide wrong-shape payloads.

### Recommended fix scope
- Smallest next PR: add control-ready checks for list/preview/import controls.

## Tool: Asset Pipeline Tool (`asset-pipeline-tool`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing-path UI error only when explicit report flag path is used. |
| pipeline options payload | preset/workspace/file | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| input JSON | pipeline options | Yes | Low | No | |
| run button | valid parsed options | Yes | Medium | No | |
| output/status | run results | Yes | Low | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add control-ready diagnostics for input validation/run enablement/output binding.

## Tool: Performance Profiler (`performance-profiler`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| `profileSettings` | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| settings inputs | loaded profile settings | Partial | High | No | Default values allow runs without loaded preset. |
| run/stop controls | parsed settings | Yes | Medium | No | |
| output/status | run results | Yes | Medium | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics and defaulted classification.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: classify defaulted settings and add control-ready logs.

## Tool: Physics Sandbox (`physics-sandbox`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| `physicsBody` | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| body input | loaded body object | Partial | High | No | Seeded default body if input is empty. |
| run step button | valid parsed body | Yes | Medium | No | |
| output/status | run result | Yes | Medium | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics and defaulted classification.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: classify seeded body as defaulted for sample launch readiness.

## Tool: Tile Model Converter (`tile-model-converter`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| `candidate` + `conversion` | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| input JSON | loaded candidate/conversion | Yes | Low | No | |
| run button | valid parsed input | Yes | Medium | No | |
| output/status | conversion result | Yes | Low | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add control-ready diagnostics for input/run/output.

## Tool: 3D JSON Payload Normalizer (`3d-json-payload-normalizer`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| map payload (`points`, `segments`) | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| input JSON | loaded map payload | Yes | Low | No | |
| normalize action | valid parsed map payload | Yes | Medium | No | |
| output/status | normalized payload | Yes | Low | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add per-control readiness diagnostics.

## Tool: 3D Asset Viewer (`3d-asset-viewer`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| 3D asset payload (`vertices`) | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| input JSON | loaded 3D asset | Yes | Low | No | |
| inspect action | valid parsed payload | Yes | Medium | No | |
| output/status | inspection results | Yes | Low | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add per-control readiness diagnostics.

## Tool: 3D Camera Path Editor (`3d-camera-path-editor`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `samplePresetPath` | query | Yes | Yes | Partial | Missing path logs warning and returns. |
| camera path (`waypoints`) | preset payload | Yes | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| input JSON | loaded camera path | Yes | Low | No | |
| add/normalize actions | parsed path data | Yes | Medium | No | |
| output/status | path output | Yes | Low | No | |

### Missing DoD fields or controls
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add per-control readiness diagnostics.

## Tool: Skin Editor (`skin-editor`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| `gameId` | query/workspace context | Yes | Indirect | Partial | Missing context blocks loading. |
| shared palette handoff | workspace shared context | Yes | Indirect | Partial | Missing palette shows explicit status error. |
| `samplePresetPath` skin payload | query (optional) | Optional | Yes | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| object workbench controls | loaded skin document | Yes | Medium | No | |
| palette list | shared palette + document colors | Partial | Medium | No | |
| preview canvas | loaded/edited objects | Yes | Medium | No | |

### Missing DoD fields or controls
- Missing structured tool-load diagnostics.
- Missing control-ready diagnostics.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add structured load + control readiness diagnostics for game/palette/preview dependencies.

## Tool: Animation / Sprite Animation Tool (standalone)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| N/A | N/A | N/A | N/A | N/A | No standalone animation tool id discovered in launch registry/metadata. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| N/A | N/A | N/A | N/A | N/A | Sprite animation preview controls exist inside Sprite Editor, not as a separate launched tool. |

### Missing DoD fields or controls
- Required DoD category exists, standalone tool surface not present.

### Contract violations
- None.

### Recommended fix scope
- Smallest next PR: either add standalone animation tool readiness surface or explicitly scope this DoD item to Sprite Editor preview controls.

## Tool: Manifest / Data Flow Inspector (standalone)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| N/A | N/A | N/A | N/A | N/A | No standalone manifest/data-flow inspector tool id discovered in launch registry/metadata. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| N/A | N/A | N/A | N/A | N/A | State Inspector is closest, but lacks required DoD tables for declared paths/fetch/expected-vs-actual. |

### Missing DoD fields or controls
- Standalone inspector surface with required DoD tables is missing.

### Contract violations
- None.

### Recommended fix scope
- Smallest next PR: create/extend inspector surface to include DoD-required contract and readiness tables.

## Tool: Sample Launch Tiles (`samples/index.render.js`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| samples metadata | `./metadata/samples.index.metadata.json` | Yes | Yes | Partial | |
| tool launch params (`sampleId`, `sampleTitle`, `samplePresetPath`) | metadata + launch SSoT | Yes | N/A | Partial | Route resolution validated, not downstream input-readiness. |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| tool launch links | resolved launch href | Yes | Medium | Partial | Launch validation section reports routing errors only. |
| tile title/description/status | sample metadata | Yes | Low | No | |
| filter controls | metadata facets | Yes | Low | No | |

### Missing DoD fields or controls
- Missing tile-level readiness indicator for required downstream tool inputs and controls.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add tile readiness badges powered by required-input/control-ready diagnostics.

## Tool: Game Launch Tiles (`games/index.render.js`)

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |
|---|---|---:|---:|---:|---|
| games metadata | `./metadata/games.index.metadata.json` | Yes | Yes | Partial | |
| workspace launch params (`gameId`, `mount=game`) | launch SSoT | Yes | N/A | Partial | |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |
|---|---|---:|---:|---:|---|
| workspace launch link | resolved workspace href | Yes | Medium | Partial | Reports launch href errors, not downstream tool readiness. |
| game status/tool chips | metadata | Yes | Low | No | |

### Missing DoD fields or controls
- Missing pre-launch validation indicator for required downstream tool inputs/controls.

### Contract violations
- None observed.

### Recommended fix scope
- Smallest next PR: add pre-launch readiness indicator and propagate downstream required-input classifications.

## Files Inspected
- `docs/pr/BUILD_PR_LEVEL_10_6N_TOOL_UI_DOD_AUDIT.md`
- `docs/pr/BUILD_PR_LEVEL_10_6M_TOOL_UI_READINESS_DOD.md`
- `tools/toolRegistry.js`
- `tools/shared/toolLaunchSSoT.js`
- `tools/shared/toolLaunchSSoTData.js`
- `tools/shared/toolLoadDiagnostics.js`
- `samples/index.render.js`
- `games/index.render.js`
- `samples/index.html`
- `games/index.html`
- Active tool runtime files under `tools/**` for all discovered launch surfaces.
- `samples/metadata/samples.index.metadata.json`
- `games/metadata/games.index.metadata.json`

## No Implementation Changes
- This BUILD is docs/report only.
