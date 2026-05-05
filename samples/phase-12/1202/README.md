<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1202 - Tilemap Hero Movement

Sample-local contract for `samples/phase-12/1202`.

## Implementation Location

- Entrypoint: `samples/phase-12/1202/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `index.html`
- `main.js`
- `TilemapHeroMovementScene.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-12/1202` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-12` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-12/1202/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-12/1202/index.html
samples/phase-12/1202
1202
```

Phase folder:

```text
samples/phase-12
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# Sample1202 - Tilemap Hero Movement

## Purpose
Launch a runnable sample with a visible hero that traverses left/right across a large tilemap while the camera follows horizontally.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right

## Behavior
The hero moves only on the horizontal axis. The tilemap is wider than the viewport, so normal traversal produces clear scrolling as the camera follows the hero horizontally.

## Constraints
- movement scope is left/right only
- no jump or other actions
- no gravity/platforming behavior
- no collision as a featured mechanic
- no parallax
- no enemies, collectibles, scoring, menus, or save/load
- no engine changes
- no reusable shared logic introduced
- fully removable sample folder
