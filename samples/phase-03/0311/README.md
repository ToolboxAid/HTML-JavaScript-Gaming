<!-- SAMPLE_LOCAL_CONTRACT_README -->
# sample 0311 - One-Way Platforms

Sample-local contract for `samples/phase-03/0311`.

## Implementation Location

- Entrypoint: `samples/phase-03/0311/index.html`
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
- `OneWayPlatformsScene.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-03/0311` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-03` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-03/0311/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-03/0311/index.html
samples/phase-03/0311
0311
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

Toolbox Aid
David Quesenberry
03/21/2026
README.md

# Sample 059 - One-Way Platforms

## Purpose
Demonstrates landing on platforms from above while allowing upward travel through the platform.

## Controls
A/D to move, Space to jump, Down + Space to drop through.

## Notes
This sample keeps one-way handling separate from solid walls so the behavior is easy to test in isolation.
