Toolbox Aid
David Quesenberry
04/04/2026
README.md

# Parallax Scene Studio

Standalone companion tool for parallax depth and background authoring.

## Included
- Parallax layer management
- Image assignment per layer
- Draw order, scroll factor, repeat, and wrap controls
- Parallax preview with camera offset sliders
- Load from `toolbox.tilemap/1` or `toolbox.parallax/1`
- Save parallax-only JSON
- Export tilemap parallax patch JSON
- Top-level project actions for new/load/sample/save/simulate/package
- Direct sample loading from `tools/Parallax Scene Studio/samples/`

## Boundaries
- This tool edits only parallax data.
- It does not include tile/collision/data map editing.
- It does not modify engine core APIs.

## Project asset registry
- Supports loading and saving `project.assets.json`.
- Parallax saves additively register shared `images` and `parallaxSources`.
- Parallax layers support optional `parallaxSourceId` references.
- Legacy parallax/tilemap documents with no registry references remain supported.

## Entry
- `tools/Parallax Scene Studio/index.html`

## Samples
- Manifest: `tools/Parallax Scene Studio/samples/sample-manifest.json`
- Samples and images use paths relative to `tools/Parallax Scene Studio/`
