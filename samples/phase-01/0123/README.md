<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 0123 - Debug Stats

Sample-local contract for `samples/phase-01/0123`.

## Implementation Location

- Entrypoint: `samples/phase-01/0123/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `DebugStatsScene.js`
- `index.html`
- `main.js`

## Discovery Contract

- This sample is valid because the physical folder `samples/phase-01/0123` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `samples/phase-01` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `samples/phase-01/0123/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
samples/phase-01/0123/index.html
samples/phase-01/0123
0123
```

Phase folder:

```text
samples/phase-01
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# Sample 0123 - Debug Stats

## Purpose
Adds a reusable stats overlay for engine-style visibility into runtime behavior.

## What it shows
- FPS sampling
- entity counts
- mover counts
- debug toggle
- overlay-driven diagnostics

## Controls
- KeyD: toggle stats overlay

## Behavior
The sample displays moving entities while a stats panel reports live runtime information.
