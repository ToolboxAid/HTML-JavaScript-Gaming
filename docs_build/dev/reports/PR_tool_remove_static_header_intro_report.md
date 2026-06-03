# PR Tool Remove Static Header Intro Report

- Generated: 2026-04-28T17:37:33.767Z
- PASS/FAIL: PASS

## Root Cause
- Shared-shell tool pages still rendered a static `<summary>` label (`Header and Intro`) in each tool `index.html`.
- Fullscreen summary text previously depended on CSS pseudo-content and an engine-side text-equality hook, so the shell was not the true source of truth.

## Changed Files
- tools/3D Asset Viewer/index.html
- tools/3D Camera Path Editor/index.html
- tools/3D JSON Payload Normalizer/index.html
- tools/Asset Browser/index.html
- tools/Asset Pipeline Tool/index.html
- tools/Palette Browser/index.html
- tools/Parallax Scene Studio/index.html
- tools/Performance Profiler/index.html
- tools/Physics Sandbox/index.html
- tools/Replay Visualizer/index.html
- tools/Skin Editor/index.html
- tools/Sprite Editor/index.html
- tools/State Inspector/index.html
- tools/Tile Model Converter/index.html
- tools/Tilemap Studio/index.html
- tools/Vector Asset Studio/index.html
- tools/Vector Map Editor/index.html
- tools/shared/platformShell.js
- tools/shared/platformShell.css
- docs_build/dev/reports/PR_tool_remove_static_header_intro_report.md
- tmp/pr_tool_remove_static_header_intro_validation.json

## Updated index.html Files
- tools/3D Asset Viewer/index.html
- tools/3D Camera Path Editor/index.html
- tools/3D JSON Payload Normalizer/index.html
- tools/Asset Browser/index.html
- tools/Asset Pipeline Tool/index.html
- tools/Palette Browser/index.html
- tools/Parallax Scene Studio/index.html
- tools/Performance Profiler/index.html
- tools/Physics Sandbox/index.html
- tools/Replay Visualizer/index.html
- tools/Skin Editor/index.html
- tools/Sprite Editor/index.html
- tools/State Inspector/index.html
- tools/Tile Model Converter/index.html
- tools/Tilemap Studio/index.html
- tools/Vector Asset Studio/index.html
- tools/Vector Map Editor/index.html

## Fullscreen DOM Path Fixed
- Fixed path: tool page `<details class="is-collapsible">` summary element (`.is-collapsible__summary[data-tools-platform-summary]`) is now shell-rendered from `tools/shared/platformShell.js` using real DOM text nodes.
- Fullscreen/collapse behavior is now bound in `tools/shared/platformShell.js` (no static summary-text dependency).

## Visible Header/Intro By Tool
### Vector Map Editor
- Normal header: Vector Map Editor — Map layout and collision authoring
- Fullscreen header: Vector Map Editor — Map layout and collision authoring
- Normal intro: Vector Map Editor: Vector geometry authoring tool for map layout, collision review, and runtime export workflows.
- Fullscreen intro: Vector Map Editor: Vector geometry authoring tool for map layout, collision review, and runtime export workflows.
- PASS: YES

### Vector Asset Studio
- Normal header: Vector Asset Studio — SVG asset authoring and export
- Fullscreen header: Vector Asset Studio — SVG asset authoring and export
- Normal intro: Vector Asset Studio: Vector authoring studio for SVG-first asset work and first-class vector output for the platform.
- Fullscreen intro: Vector Asset Studio: Vector authoring studio for SVG-first asset work and first-class vector output for the platform.
- PASS: YES

### Sprite Editor
- Normal header: Sprite Editor — Palette-locked sprite and frame editing
- Fullscreen header: Sprite Editor — Palette-locked sprite and frame editing
- Normal intro: Sprite Editor: Pixel-art authoring workspace for palette-locked sprite sheets, animation frames, and registry-aware sprite projects.
- Fullscreen intro: Sprite Editor: Pixel-art authoring workspace for palette-locked sprite sheets, animation frames, and registry-aware sprite projects.
- PASS: YES

### State Inspector
- Normal header: State Inspector — Host/runtime state snapshot inspection
- Fullscreen header: State Inspector — Host/runtime state snapshot inspection
- Normal intro: State Inspector: Read-only state visibility tool for host context, storage snapshots, and structured runtime payload inspection.
- Fullscreen intro: State Inspector: Read-only state visibility tool for host context, storage snapshots, and structured runtime payload inspection.
- PASS: YES

### Asset Browser
- Normal header: Asset Browser / Import Hub — Approved asset browse and import planning
- Fullscreen header: Asset Browser / Import Hub — Approved asset browse and import planning
- Normal intro: Asset Browser / Import Hub: Approved asset browsing and non-destructive import planning surface for vectors, palettes, parallax, tilemaps, and sprite workflow assets.
- Fullscreen intro: Asset Browser / Import Hub: Approved asset browsing and non-destructive import planning surface for vectors, palettes, parallax, tilemaps, and sprite workflow assets.
- PASS: YES

## Static Label Check
- Any visible/static "Header and Intro" remains: NO

## Validation Performed
- node --check tools/shared/platformShell.js
- node --check tools/toolRegistry.js
- npm run test:launch-smoke -- --tools
- Targeted browser validation script for Vector Map Editor, Vector Asset Studio, Sprite Editor, State Inspector, and Asset Browser
- Evidence JSON: tmp/pr_tool_remove_static_header_intro_validation.json

## Remaining Issues
- None identified in this scoped validation.
