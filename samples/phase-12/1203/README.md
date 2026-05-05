<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1203 - Tilemap Hero Jump Collision

Sample-local contract for `samples/phase-12/1203`.

## Implementation Location

- Entrypoint: `samples/phase-12/1203/index.html`
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
- `TilemapHeroJumpCollisionScene.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-12/1203` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-12` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-12/1203/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-12/1203/index.html
samples/phase-12/1203
1203
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

# Sample1203 - Tilemap Hero Jump Collision

## Purpose
Launch a runnable platform-interaction sample with left/right movement, Space-to-jump, gravity, grounded behavior, and tile collision.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
The hero traverses a scrolling tilemap, jumps with Space, falls under gravity, and lands on solid tiles. Collision prevents normal pass-through during horizontal and vertical movement.

## Constraints
- focused scope: movement, jump, gravity, grounded, and collision only
- no wall jump, double jump, dash, climb, or combat/actions
- no crouch/down gameplay
- no parallax
- no enemies, collectibles, score systems, menus, or save/load
- no engine changes
- no reusable shared logic introduced
- fully removable sample folder
