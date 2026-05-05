<!-- SAMPLE_LOCAL_CONTRACT_README -->
# sample 0306 - NES-Style Zones + Parallax

Sample-local contract for `samples/phase-03/0306`.

## Implementation Location

- Entrypoint: `samples/phase-03/0306/index.html`
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
- `NESStyleZonesParallaxScene.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-03/0306` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-03` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-03/0306/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-03/0306/index.html
samples/phase-03/0306
0306
```

Phase folder:

```text
samples/phase-03
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# sample 0306 - NES-Style Zones + Parallax

## Purpose
Adds deliberate section-based camera behavior and depth layers.

## What it shows
- zone-based camera movement
- classic side-scroller style section transitions
- simple parallax background bands
- image-backed player sprite still in use
- tilemap foreground remaining on the main world layer

## Controls
- Arrow keys or A/D: move actor left and right

## Behavior
The camera stays constrained to the active world zone while darker background bands scroll more slowly than the foreground to create a simple parallax effect.
