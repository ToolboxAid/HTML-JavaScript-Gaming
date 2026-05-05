<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 0110 - Collision Response

Sample-local contract for `samples/phase-01/0110`.

## Implementation Location

- Entrypoint: `samples/phase-01/0110/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `CollisionResponseScene.js`
- `index.html`
- `main.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-01/0110` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-01` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-01/0110/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-01/0110/index.html
samples/phase-01/0110
0110
```

Phase folder:

```text
samples/phase-01
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# Sample 0110 - Collision Response

## Purpose
Turns collision from detection into gameplay by preventing the player from moving through a blocking obstacle.

## What it shows
- keyboard-controlled movement
- one solid block
- AABB overlap test
- movement revert as simple collision response
- themed debug rendering

## Controls
- Arrow keys: move player

## Behavior
When the player tries to move into the block, the attempted movement is rejected and the player stays in the last valid position.
