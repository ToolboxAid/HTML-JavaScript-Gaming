<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1206 - Trigger Zone

Sample-local contract for `samples/phase-12/1206`.

## Implementation Location

- Entrypoint: `samples/phase-12/1206/index.html`
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
- `TriggerZoneDemoScene.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-12/1206` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-12` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-12/1206/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-12/1206/index.html
samples/phase-12/1206
1206
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

# Sample 1206 - Trigger Zone

## Purpose
Provide an integrated runnable demo that preserves the proven Sample 1204/1205 movement, jump, collision, camera follow, and parallax behavior while adding one light trigger-zone interaction.

## Controls
- Left Arrow: move hero left
- Right Arrow: move hero right
- Space: jump

## Behavior
The hero traverses a larger scrolling tilemap with jump, gravity, grounded landing, collision, and layered parallax depth. Entering the visible trigger zone activates a success state/message.

## Constraints
- preserve proven movement/jump/collision/camera/parallax contract
- one light interaction system only (trigger zone success state)
- no collectible counter
- no switch/checkpoint logic
- no enemies, combat, inventory, menus, or save/load
- no engine changes
- no reusable shared logic introduced
- fully removable sample folder
