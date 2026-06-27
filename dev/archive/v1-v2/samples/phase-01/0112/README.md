<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 0112 - Axis-Separated Collision

Sample-local contract for `old_samples/phase-01/0112`.

## Implementation Location

- Entrypoint: `old_samples/phase-01/0112/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/old_samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `AxisSeparatedCollisionScene.js`
- `index.html`
- `main.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-01/0112` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-01` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-01/0112/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-01/0112/index.html
old_samples/phase-01/0112
0112
```

Phase folder:

```text
old_samples/phase-01
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# Sample 0112 - Axis-Separated Collision

## Purpose
Improves collision response by resolving horizontal and vertical motion separately.

## What it shows
- independent X and Y movement resolution
- sliding along walls
- multiple blocking solids
- debug status text for axis hits
- themed renderer consistency

## Controls
- Arrow keys: move player

## Behavior
The player can move along open space on one axis even when blocked on the other axis.
