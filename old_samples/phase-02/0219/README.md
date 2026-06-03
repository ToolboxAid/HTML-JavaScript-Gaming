<!-- SAMPLE_LOCAL_CONTRACT_README -->
# Sample 0219 - Sprite Atlas + Image Rendering

Sample-local contract for `old_samples/phase-02/0219`.

## Implementation Location

- Entrypoint: `old_samples/phase-02/0219/index.html`
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
- `SpriteAtlasImageRenderingScene.js`

## Discovery Contract

- This sample is valid because the physical folder `old_samples/phase-02/0219` exists and contains `index.html`.
- Preview Generator V2 discovers samples by enumerating directories under `old_samples/phase-02` and keeping only four-digit child folders that contain `index.html`.
- Do not infer this sample from numeric ranges, phase counts, metadata-only references, or planned IDs.
- If this folder or its `index.html` is missing, tooling must log `SKIP`, not `FAIL`.
- Use `FAIL` only after an existing discovered sample cannot be launched, rendered, captured, or written.

## Assets

- Preview and image assets belong under `old_samples/phase-02/0219/assets/images`.
- Asset folder status: present.

## Preview Generator V2 Inputs

Single sample:

```text
old_samples/phase-02/0219/index.html
old_samples/phase-02/0219
0219
```

Phase folder:

```text
old_samples/phase-02
```

Games target examples:

```text
games/<gamename>/index.html
<gamename>
```

Games are separate targets and are not discovered from the samples tree.

## Existing Notes Preserved

# Sample 0219 - Sprite Atlas + Image Rendering

## Purpose
Introduces sprite atlas frame lookup and image-loader-ready rendering.

## What it shows
- sprite atlas
- frame lookup
- image loader stub
- atlas/frame render contract
- sprite-ready entity references

## Behavior
This is a static atlas/frame showcase sample, not an animation playback sample.
Entities render using atlas + frame references with safe color-frame proxies.
