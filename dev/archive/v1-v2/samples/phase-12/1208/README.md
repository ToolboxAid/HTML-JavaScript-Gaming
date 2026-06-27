<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1208 - Tool Formatted Tiles Parallax

Sample-local contract for `old_samples/phase-12/1208`.

## Implementation Location

- Entrypoint: `old_samples/phase-12/1208/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/old_samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `index.html`
- `main.js`
- `ToolFormattedTilesParallaxScene.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-12/1208` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-12` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-12/1208/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-12/1208/index.html
old_samples/phase-12/1208
1208
```

Phase folder:

```text
old_samples/phase-12
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# Sample 1208 - Tool Formatted Tiles Parallax

## Purpose
Provide a runnable authoring-pipeline validation demo that preserves the proven Phase 12 hero movement/jump/collision/camera/parallax behavior while using sample-local content shaped like tool exports.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
The demo loads tilemap layer data and tileset references shaped like Tile Map Editor export output, plus parallax layer data shaped like Parallax Editor export output. Rendering uses a real PNG tileset atlas (source-rect drawImage) and real SVG parallax layers rendered onto canvas in a larger-than-viewport world. Hero traversal uses left/right movement, jump, gravity, grounded behavior, collision, and stable camera follow with visible scrolling.

## Constraints
- preserve proven movement/jump/gravity/collision/camera/parallax contract
- keep scope focused on authoring-pipeline shaped content usage
- render tiles from atlas image frames (no colored tile-rect fallback in normal mode)
- no extra interaction or progression systems
- no engine changes
- no tools/tests/games changes
- fully removable sample folder
