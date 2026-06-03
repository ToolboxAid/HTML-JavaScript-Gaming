<!-- SAMPLE_LOCAL_CONTRACT_README -->
# sample 0302 - Animation System

Sample-local contract for `old_samples/phase-03/0302`.

## Implementation Location

- Entrypoint: `old_samples/phase-03/0302/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/old_samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `AnimationSystemScene.js`
- `index.html`
- `main.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-03/0302` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-03` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-03/0302/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-03/0302/index.html
old_samples/phase-03/0302
0302
```

Phase folder:

```text
old_samples/phase-03
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# sample 0302 - Animation System

## Purpose
Adds timing, loop control, and transition behavior on top of sample 0301.

## What it shows
- stable frame timing
- idle and move loops
- non-looping action animation
- transition back to idle or move after completion
- image-backed sprite rendering retained from sample 0301

## Controls
- Arrow keys or WASD: move actor
- Space: play one-shot action animation

## Behavior
The actor transitions cleanly between idle, move, and action states without flicker, frame spam, or repeated restart problems.
