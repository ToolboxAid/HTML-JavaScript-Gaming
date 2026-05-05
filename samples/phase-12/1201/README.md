<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 1201 - Tilemap Viewer

Sample-local contract for `samples/phase-12/1201`.

## Implementation Location

- Entrypoint: `samples/phase-12/1201/index.html`
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
- `TilemapViewerScene.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-12/1201` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-12` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-12/1201/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-12/1201/index.html
samples/phase-12/1201
1201
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

# Sample1201 - Tilemap Viewer

## Purpose
Launch a viewer-only sample that renders a stable tilemap larger than the viewport using existing engine contracts.

## Controls
- Left Arrow: pan viewer left
- Right Arrow: pan viewer right
- Up Arrow: pan viewer up
- Down Arrow: pan viewer down

## Behavior
Displays a larger world tilemap and scrolls the camera view as the viewer pans with Arrow keys. No actor, jump, collision feature behavior, or parallax is present.

## Constraints
- viewer-only scope
- no hero or gameplay systems
- no engine changes
- no reusable shared logic introduced
- fully removable sample folder
- no menus, save/load, enemies, or collectibles
