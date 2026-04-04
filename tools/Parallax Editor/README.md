Toolbox Aid
David Quesenberry
03/30/2026
README.md

# Parallax Editor Companion

Standalone companion tool for parallax depth/background authoring.

## Included
- Parallax layer management
- Image assignment per layer (path/URL or local image file)
- Draw order controls
- Scroll factor controls
- Repeat and wrap controls
- Parallax preview with camera offset sliders
- Load from `toolbox.tilemap/1` or `toolbox.parallax/1`
- Save parallax-only JSON
- Export tilemap parallax patch JSON
- Top-level project actions: New Project, Load Project, Load Sample, Save Project, Simulate, Exit Simulation
- Simulation mode with camera-relative parallax motion preview
- Direct sample loading from `tools/Parallax Editor/samples/` via in-editor sample selector

## Boundaries
- This tool edits only parallax data.
- It does not include tile/collision/data map editing.
- It does not modify engine core APIs.

## Project Asset Registry
- Supports loading and saving `project.assets.json` from top-level project controls.
- Parallax saves additively register shared `images` and `parallaxSources`.
- Parallax layers support optional `parallaxSourceId` references.
- Parallax JSON includes optional `assetRefs.parallaxSourceIds` for cross-tool lookup.
- Legacy parallax/tilemap documents with no registry references remain supported.

## Entry
- `tools/Parallax Editor/index.html`

## Samples
- Manifest: `tools/Parallax Editor/samples/sample-manifest.json`
- Samples and images use paths relative to `tools/Parallax Editor/`
