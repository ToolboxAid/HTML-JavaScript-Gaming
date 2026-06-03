<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 0124 - Data Driven World

Sample-local contract for `old_samples/phase-01/0124`.

## Implementation Location

- Entrypoint: `old_samples/phase-01/0124/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/old_samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `DataDrivenWorldScene.js`
- `index.html`
- `main.js`
- `worldData.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-01/0124` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-01` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-01/0124/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-01/0124/index.html
old_samples/phase-01/0124
0124
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

# Sample 0124 - Data-Driven World

## Purpose
Introduces declarative scene setup by building the world from config data.

## What it shows
- world config module
- entity creation from data
- tagged entity definitions
- collision-ready setup
- reduced constructor hard-coding

## Controls
- Arrow keys: move player

## Behavior
The player and world objects are created from data definitions instead of being manually assembled in the scene constructor.
