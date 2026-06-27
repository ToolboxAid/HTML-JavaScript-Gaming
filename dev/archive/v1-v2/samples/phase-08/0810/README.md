<!-- SAMPLE_LOCAL_CONTRACT_README -->
# sample 0810 - Logging + Error System

Sample-local contract for `old_samples/phase-08/0810`.

## Implementation Location

- Entrypoint: `old_samples/phase-08/0810/index.html`
- Sample implementation lives in this physical sample folder and its local subdirectories.
- `index.html` is the only discovery and launch entrypoint for tooling. It may load local modules, shared sample helpers, or engine modules, but Preview Generator V2 should launch this sample through `index.html` rather than assuming another file.
- If `index.html` redirects, forwards, or bypasses into other code, that behavior must remain explicit in `index.html` so folder enumeration still has one stable launch point.

Current `index.html` script launches:
- `/old_samples/shared/sampleDetailPageEnhancement.js`
- `./main.js`
- `../../../src/engine/theme/mount-shared-header.js`

Local implementation files currently present outside `assets/images`:
- `index.html`
- `index.js`
- `LoggingErrorSystemScene.js`
- `main.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-08/0810` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-08` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-08/0810/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-08/0810/index.html
old_samples/phase-08/0810
0810
```

Phase folder:

```text
old_samples/phase-08
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.
