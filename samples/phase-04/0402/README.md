<!-- SAMPLE_LOCAL_CONTRACT_README -->
# sample 0402- Camera Look Ahead

Sample-local contract for `samples/phase-04/0402`.

## Implementation Location

- Entrypoint: `samples/phase-04/0402/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `CameraLookAheadScene.js`
- `index.html`
- `index.js`
- `main.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-04/0402` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-04` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-04/0402/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-04/0402/index.html
samples/phase-04/0402
0402
```

Phase folder:

```text
samples/phase-04
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

Toolbox Aid
David Quesenberry
03/21/2026
README.md

# sample 0402- Camera Look Ahead

## Purpose
Demonstrates look-ahead camera movement that anticipates actor direction.

## Notes
This version follows the same file layout pattern used by sample01:
- index.html
- index.js
- main.js
- scene file
