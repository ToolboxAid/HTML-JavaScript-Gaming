# BUILD_PR_REMAINING_ROADMAP_VALIDATE_OR_CLOSEOUT_COMBINED Report

## Validate-First Classification

### Tooling Strategy By Need
- `2D tool stabilization before 3D tool expansion`
  - classification: already complete
  - evidence:
    - 2D/active tool cluster present: `tools/Tilemap Studio`, `tools/Parallax Scene Studio`, `tools/Vector Map Editor`, `tools/Vector Asset Studio`, `tools/Physics Sandbox`, `tools/State Inspector`, `tools/Replay Visualizer`, `tools/Performance Profiler`, `tools/Asset Pipeline Tool`, `tools/Tile Model Converter`
    - 3D expansion tools present as a separate follow-on cluster: `tools/3D Map Editor`, `tools/3D Asset Viewer`, `tools/3D Camera Path Editor`
    - prior docs lane sequencing confirms 2D normalization cluster and then 3D residue add-on (`docs/pr/BUILD_PR_LEVEL_09_TOOLS_NORMALIZATION_AND_REQUIRED_TOOLS_COMBINED_PASS.md`, `docs/pr/BUILD_PR_LEVEL_09_TOOLS_RESIDUE_ONLY.md`)

### Next Planning / Normalization Lanes
- `Apply master roadmap baseline`
  - classification: already complete
  - evidence:
    - active-roadmap location/rule in `docs/dev/roadmaps/README.md`
    - active master roadmap maintained at `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- `Normalize samples phase structure`
  - classification: already complete
  - evidence:
    - canonical phase directories exist: `samples/phase-01` through `samples/phase-15`
    - `samples/index.html` phase sections and links are in canonical `phase-XX/<id>/index.html` format
    - `samples/metadata/samples.index.metadata.json` tracks phases `01..15`

### Repo Operator + Asset Conversion Scripting Lanes
- `Existing games asset folders updated so existing images / vectors / related runtime assets can be transformed into tool-editable data objects, with corresponding project JSON updates`
  - classification: partially complete
  - evidence:
    - Asteroids is converted (`games/Asteroids/assets/tools.manifest.json` + `sprites/tilemaps/parallax/vectors/data`)
    - broader game set is not fully converted (inspection found only 1/19 games with full data-contract shape)
  - blocker:
    - full closure requires dependency-ordered, multi-game conversion and per-game JSON/manifest alignment; this is broader than a residue-only marker pass

### Later Capability Lanes
- `FEATURE: Fullscreen Bezel Overlay System ...`
  - classification: already complete
  - evidence:
    - runtime modules: `src/engine/runtime/fullscreenBezel.js`, `src/engine/runtime/backgroundImage.js`
    - engine integration: `src/engine/core/Engine.js`
    - focused tests: `tests/core/BackgroundImageAndFullscreenBezel.test.mjs`, `tests/games/FullscreenBezelOverlay.test.mjs`
    - focused test run in this PR: `node tests/core/BackgroundImageAndFullscreenBezel.test.mjs` PASS

### Final Cleanup Lane
- `Reduce legacy footprint after replacements are proven`
  - classification: partially complete
  - evidence:
    - policy/inventory work is complete (Section 15 markers are complete)
    - retained legacy surfaces still exist by design (`docs/archive/tools/SpriteEditor_old_keep`, docs-only placeholder policy artifacts)
  - blocker:
    - final reduction requires an explicit replacement-proven cleanup execution lane, not only status reconciliation

## Roadmap Status Updates Applied (Markers Only)
- closed (`[x]`):
  - `2D tool stabilization before 3D tool expansion`
  - `Apply master roadmap baseline`
  - `Normalize samples phase structure`
  - `FEATURE: Fullscreen Bezel Overlay System ...`
- left open by truth:
  - `Existing games asset folders updated ...` (remains partial)
  - `Reduce legacy footprint after replacements are proven` (remains open)

## Completed In This PR vs Already Complete
- already complete and marker-closed in this PR:
  - 2D tool stabilization before 3D tool expansion
  - Apply master roadmap baseline
  - Normalize samples phase structure
  - Fullscreen Bezel Overlay System
- partially complete and left open:
  - Existing games asset folders conversion lane
  - Final legacy-footprint reduction lane

## Remaining Open Items + Exact Blockers
1. `Existing games asset folders updated ... data objects ... project JSON updates`
   - blocker: conversion currently complete for Asteroids, not for the full existing-games set.
2. `Reduce legacy footprint after replacements are proven`
   - blocker: final cleanup execution remains pending after replacement-proof gating.
