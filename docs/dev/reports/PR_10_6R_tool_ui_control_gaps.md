# PR 10.6R Tool UI Control Gaps

## Scope
- Docs-only gap analysis for Tool UI control readiness.
- No runtime implementation changes in this PR.
- Every unknown or missing readiness point found during inventory is explicitly listed below.

## Coverage Baseline
- Active visible launchable tools discovered: 17
- Additional required launch surfaces audited: 3 (`workspace-manager`, sample launch tiles, game launch tiles)
- Total audited surfaces: 20

## Missing Controls
- `sprite-editor`: dedicated `Color 1 selector` control id is not observed as a distinct runtime control.
- `sprite-editor`: dedicated `Color 2 selector` control id is not observed as a distinct runtime control.
- `manifest/data-flow inspector`: no standalone launchable tool id discovered in current registry/metadata.

## Controls Without Required Data Mapping
- `workspace-manager`: no explicit pre-launch required-input contract table per selected tool; forwarded query exists but readiness summary is not surfaced as a formal required-input/control matrix.
- `samples-launch-tiles`: launch links validate route resolution but do not expose full downstream required dependency keys per tool in tile UI.
- `games-launch-tiles`: launch links validate workspace route generation but do not expose downstream required tool dependency readiness.
- `state-inspector`: missing explicit expected-vs-actual required-input and required-control count output fields.

## Controls Using Defaults/Fallbacks (No-Default Rule Gaps)
- `vector-asset-studio`: fallback palette/default classification paths exist and can classify required controls as `defaulted`.
- `tile-map-editor`: document/atlas sanitizers include fallback value paths that can populate controls when required data is incomplete.
- `parallax-editor`: default/seeded layer-document paths exist for map/layer state.
- `performance-profiler`: integer readers accept fallback values when loaded settings are invalid/missing.
- `3d-json-payload-normalizer`: numeric sanitizer includes fallback path.
- `3d-camera-path-editor`: numeric sanitizer includes fallback path.

## Lifecycle/Timer Risk Gaps
- `replay-visualizer`: playback loop uses interval-driven updates; requires explicit lifecycle stability proof to avoid stale/reset overwrite.
- `tile-map-editor`: requestAnimationFrame simulation loop requires explicit lifecycle classification coverage.
- `parallax-editor`: requestAnimationFrame simulation loop requires explicit lifecycle classification coverage.
- `vector-map-editor`: animation-frame spin flow requires explicit lifecycle classification coverage.
- `palette-browser`: delayed setup with `setTimeout` requires explicit lifecycle non-reset proof.

## Controls Not Mapped To Manifest-Declared Inputs
- Sample tile flow: launch currently passes `sampleId`, `sampleTitle`, `samplePresetPath`; required downstream keys beyond preset path are not surfaced as a readiness contract at launch UI.
- Game tile flow: launch currently passes workspace `gameId`/`mount`; downstream tool required-input readiness is not surfaced pre-launch.
- Workspace Manager: forwards sanitized launch params, but does not expose per-tool required input keys, expected counts, and control-ready readiness before mount.

## Missing/Partial UI Readiness Diagnostics
- `[tool-ui:control-ready]` exists in shared diagnostics but is not emitted uniformly across all active tools.
- `[tool-ui:lifecycle]` and `[tool-ui:final-ready]` are DoD-level required events but are not consistently represented across all audited tool runtime surfaces.
- Several tools provide `[tool-load:*]` boundaries without complete control-level readiness proof for every required visible control.

## Palette Contract Gaps
- Canonical palette source target is `*.palette.json`; tools must not require duplicate palette payload files.
- Compatibility/wrapper-tolerant extraction paths still exist in some loaders and can mask wrong-shape payloads without strict failure.
- `sprite-editor` required Color1/Color2 readiness checks cannot be fully proven while dedicated controls are absent.

## Uncertain Controls/Fields (Explicitly Tracked)
- `asset-browser`: per-control readiness for every import action path is partially inferred from code flow; universal per-control diagnostics are not present.
- `skin-editor`: palette/context dependency is clear, but standardized shared load/control readiness classification coverage is incomplete.
- `workspace-manager`: required-input-summary behavior exists as status/diagnostic behavior, but no explicit structured readiness table with expected-vs-actual counts.
- `state-inspector`: acts as closest inspector surface, but required manifest-path/fetch-results/control-readiness tables are incomplete.

## Acceptance Ledger
- `0 missing controls OR every missing control listed as gap`: PASS (all discovered missing controls listed).
- `0 unknown bindings OR every unknown binding listed as gap`: PASS (all uncertain bindings listed).
- `0 default usage OR every default usage listed as gap`: PASS (default/fallback usages listed).
- `0 lifecycle violations OR every lifecycle violation listed as gap`: PASS (lifecycle/timer risks listed).

## Files Audited
- `docs/pr/BUILD_PR_LEVEL_10_6R_TOOL_UI_CONTROL_INVENTORY_COMPLETION.md`
- `tools/toolRegistry.js`
- `tools/shared/toolLaunchSSoT.js`
- `tools/shared/toolLaunchSSoTData.js`
- `tools/shared/toolLoadDiagnostics.js`
- `samples/index.render.js`
- `games/index.render.js`
- `tools/Workspace Manager/main.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `tools/Palette Browser/main.js`
- `tools/Asset Browser/main.js`
- `tools/Tilemap Studio/main.js`
- `tools/Vector Asset Studio/main.js`
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`
- `tools/Replay Visualizer/main.js`
- `tools/State Inspector/main.js`
- `tools/Performance Profiler/main.js`
- `tools/Physics Sandbox/main.js`
- `tools/Asset Pipeline Tool/main.js`
- `tools/Tile Model Converter/main.js`
- `tools/3D JSON Payload Normalizer/main.js`
- `tools/3D Asset Viewer/main.js`
- `tools/3D Camera Path Editor/main.js`
- `tools/Parallax Scene Studio/main.js`
- `tools/Skin Editor/main.js`
