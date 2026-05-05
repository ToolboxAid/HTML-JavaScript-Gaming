<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 0202 - Camera Bounds

Sample-local contract for `samples/phase-02/0202`.

## Implementation Location

- Entrypoint: `samples/phase-02/0202/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `CameraBoundsScene.js`
- `index.html`
- `main.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-02/0202` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-02` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-02/0202/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-02/0202/index.html
samples/phase-02/0202
0202
```

Phase folder:

```text
samples/phase-02
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# Sample 0202 - Camera Bounds

## Purpose
Adds camera clamping so the viewport remains inside the world.

## What it shows
- player-follow camera
- viewport edge clamping
- world-to-screen offset rendering
- scrolling stability
- world boundary behavior

## Controls
- Arrow keys: move player

## Behavior
The camera follows the player but stops at the world limits so empty space is never shown.
