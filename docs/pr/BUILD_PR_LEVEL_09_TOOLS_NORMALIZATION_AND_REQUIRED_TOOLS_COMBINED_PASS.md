# BUILD_PR_LEVEL_09_TOOLS_NORMALIZATION_AND_REQUIRED_TOOLS_COMBINED_PASS

## Purpose
Close the remaining Section-9 tools normalization and required-tool dependency items in one coherent pass with minimal, truth-based implementation deltas.

## Implemented Scope

### Existing tools normalization cluster
Confirmed and validated launch/boundary normalization coverage for:
- TileMapEditor
- ParallaxEditor
- VectorMapEditor
- VectorAssetStudio

### Required tools stabilization cluster
Delivered first-class, launchable surfaces for missing required tools:
- PhysicsSandboxTool
- AssetPipelineTool
- Tile/Model Converter Tool

Confirmed existing first-class required tools remain normalized:
- StateInspectorTool
- ReplayVisualizerTool
- PerformanceProfilerTool

### Shared shell/boundary consistency
- All new required tools use the shared shell contract:
  - `data-tool-id` body contract
  - `../shared/platformShell.js`
  - `registerToolBootContract(...)`
- New tool logic consumes shared pipeline/converter/runtime helpers instead of cross-tool imports.

## File Changes

### Added
- `tools/Physics Sandbox/index.html`
- `tools/Physics Sandbox/main.js`
- `tools/Asset Pipeline Tool/index.html`
- `tools/Asset Pipeline Tool/main.js`
- `tools/Tile Model Converter/index.html`
- `tools/Tile Model Converter/main.js`
- `tests/tools/RequiredToolsBaseline.test.mjs`

### Updated
- `tools/toolRegistry.js`
- `tests/tools/ToolEntryLaunchContract.test.mjs`
- `tests/tools/ToolBoundaryEnforcement.test.mjs`
- `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

## Validation

Focused checks run:
- `node --check` on touched tool and test files
- `tests/tools/ToolBoundaryEnforcement.test.mjs`
- `tests/tools/ToolEntryLaunchContract.test.mjs`
- `tests/tools/RequiredToolsBaseline.test.mjs`
- existing required-tool non-regression check:
  - `tests/tools/AssetPipelineTooling.test.mjs`

Attempted additional check:
- `tests/tools/PerformanceProfiler.test.mjs` currently fails due a pre-existing module-resolution issue in shared runtime loader dependencies (`tools/shared/runtimeAssetLoader.js` importing `C:/src/engine/assets/AssetRegistry.js`).

## Roadmap Status

Status markers only were updated for Section 9:
- Existing tools cluster marked complete.
- Required tools cluster marked complete for:
  - PhysicsSandboxTool
  - StateInspectorTool
  - ReplayVisualizerTool
  - PerformanceProfilerTool
  - AssetPipelineTool
  - Tile/Model Converter Tool

No roadmap text rewrite was performed.

## Residue / Blockers

Remaining open Section-9 items are outside this PR target:
- 3DMapEditor
- 3DAssetViewer
- 3DCameraPathEditor
- strategy/UI note items that were not part of this implementation slice

No blocker found for the targeted normalization + required-tool items in this PR.
