<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1207 - Switch Checkpoint Marker

Sample-local contract for `old_samples/phase-12/1207`.

## Implementation Location

- Entrypoint: `old_samples/phase-12/1207/index.html`
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
- `SwitchCheckpointDemoScene.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-12/1207` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-12` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-12/1207/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-12/1207/index.html
old_samples/phase-12/1207
1207
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

# Sample 1207 - Switch Checkpoint Marker

## Purpose
Provide an integrated runnable demo that preserves the proven Sample 1206 movement, jump, collision, camera follow, and parallax behavior while adding one switch/checkpoint marker interaction.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
The hero traverses a larger scrolling tilemap with jump, gravity, grounded landing, collision, and layered parallax depth. Touching the single activator toggles checkpoint state and causes a visible marker/state change.

## Constraints
- preserve proven movement/jump/collision/camera/parallax contract
- one light interaction system only (switch/checkpoint marker toggle)
- no collectible counter
- no trigger-zone success system
- no enemies or progression systems
- no engine changes
- no reusable shared logic introduced
- fully removable sample folder
