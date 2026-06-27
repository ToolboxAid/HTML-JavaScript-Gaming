<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1205 - Multi-System Demo

Sample-local contract for `old_samples/phase-12/1205`.

## Implementation Location

- Entrypoint: `old_samples/phase-12/1205/index.html`
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
- `MultiSystemDemoScene.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-12/1205` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-12` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-12/1205/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-12/1205/index.html
old_samples/phase-12/1205
1205
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

# Sample 1205 - Multi-System Demo

## Purpose
Provide an integrated runnable demo that preserves the proven Sample 1204 movement/jump/collision/parallax behavior and adds one light interaction layer: collectibles with a counter.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
The hero traverses a larger scrolling tilemap with jump, gravity, grounded landing, collision, camera follow, and parallax depth. Collectibles disappear on touch and increment the counter.

## Constraints
- preserve Sample 1204 gameplay and camera pattern
- one light interaction system only (collectible counter)
- no trigger zone or switch/checkpoint logic
- no enemies, combat, inventory, menus, or save/load
- no engine changes
- no reusable shared logic introduced
- fully removable sample folder
