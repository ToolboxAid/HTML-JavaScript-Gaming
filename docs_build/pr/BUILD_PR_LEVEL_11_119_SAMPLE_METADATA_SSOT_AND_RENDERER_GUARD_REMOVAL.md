# BUILD_PR_LEVEL_11_119_SAMPLE_METADATA_SSOT_AND_RENDERER_GUARD_REMOVAL

## Purpose
Make `samples/metadata/samples.index.metadata.json` the single SSoT for sample tile tool roundtrip links and remove renderer/fallback paths that can recreate bad links.

## Problem Evidence

A bad link is still visible in rendered sample tile HTML:

```html
<section class="sample-tool-roundtrip">
  <h4>Tool Roundtrip Links</h4>
  <p>Use these to validate tool to sample and sample back to tool workflows.</p>
  <ul>
    <li><a data-tool-launch-href="/toolbox/3D%20Camera%20Path%20Editor/index.html?sampleId=0201&amp;sampleTitle=Camera+Follow" href="/toolbox/3D%20Camera%20Path%20Editor/index.html?sampleId=0201&amp;sampleTitle=Camera+Follow">Open 3D Camera Path Editor</a></li>
  </ul>
</section>
```

Codex identified this as coming from:
- `samples/index.render.js`

and tied to runtime sample row `toolHints`.

Current metadata reportedly has:
- `samples/metadata/samples.index.metadata.json`
- sample `0201` with `toolHints: []`
- sample `0201` with `roundtripToolPresets: []`

Therefore, if the link still renders, renderer/runtime is reading another source, using stale generated data, or deriving tool hints outside the SSoT.

## Scope
- testable cleanup
- sample tile renderer SSoT enforcement
- no schema lock
- no fake replacement data
- no fallback/default/preset behavior
- no hardcoded permanent denylist as the primary fix
- remove root cause, not just hide the link

## Required SSoT Rule

The only allowed source for sample tile roundtrip links is:

- `samples/metadata/samples.index.metadata.json`

Specifically:
- `toolHints`
- `roundtripToolPresets`

No other file/code may generate, infer, restore, or fallback sample tile "Open <tool>" links.

## Required Code Cleanup

### 1. Renderer must not infer tool links

In `samples/index.render.js` and any related sample hub renderer files:

Remove logic that:
- infers tool links from sample id
- infers tool links from sample path
- infers tool links from sample title
- infers tool links from JSON files present in the sample folder
- maps sample ids to tools outside metadata
- uses generated/static defaults if metadata has empty arrays
- uses fallback `toolHints`
- uses fallback `roundtripToolPresets`
- uses stale runtime row values not sourced from metadata

### 2. Metadata must be loaded from one source

Ensure sample hub runtime loads sample metadata from:

- `samples/metadata/samples.index.metadata.json`

Do not load:
- duplicate generated toolhint files
- samples2tools data
- old preset maps
- embedded fallback arrays
- stale index-generated tool hint data

### 3. Empty arrays mean no links

If metadata says:

```json
"toolHints": [],
"roundtripToolPresets": []
```

then renderer must render no `sample-tool-roundtrip` section for that sample.

Do not render an empty section.

### 4. Delete stale duplicate source data

Delete or disable any file that can reintroduce sample tile tool links outside the metadata SSoT.

If deletion is unsafe:
- remove it from runtime loading
- report why it remains

### 5. Remove known-bad links from SSoT and active runtime

Ensure these do not render:

- 0201: 3D Camera Path Editor or unrelated Open Tool links
- 0202: unrelated Open Tool links
- 0204: unrelated Open Tool links
- 0210: unrelated Open Tool links
- 0220: unrelated Open Tool links
- 0221: 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
- 0226: unrelated Open Tool links
- 0227: unrelated Open Tool links
- 0303: unrelated Open Tool links
- 0305: 3D JSON Payload Normalizer / 3D JSON Payload / 3d-json-payload
- 0901: Vector Map Editor
- 1204: SVG Asset Studio
- 1205: Vector Map Editor
- 1208: 3D Asset Viewer and SVG Asset Studio
- 1319: unrelated Open Tool links

## Guard Policy

A temporary test guard may be added only as a validation assertion, not as runtime behavior.

Do not add a runtime hardcoded blocklist as the final fix.

The fix must be:
- one SSoT metadata source
- no inference/fallback
- renderer honors empty metadata arrays

## Validation

Targeted validation only.

Required checks:
1. Inspect `samples/index.render.js`.
2. Confirm rendered roundtrip section is created only from metadata SSoT arrays.
3. Confirm `0201` with empty `toolHints`/`roundtripToolPresets` renders no roundtrip section.
4. Confirm known-bad links are absent from active runtime-loaded source.
5. Confirm stale duplicate sources are deleted or disabled.
6. Confirm changed JS syntax is valid.
7. Confirm changed JSON parses.

## Reports

Codex must write populated reports:

- `docs_build/dev/reports/sample_metadata_ssot_11_119.txt`
- `docs_build/dev/reports/renderer_toolhint_cleanup_11_119.txt`
- `docs_build/dev/reports/stale_roundtrip_sources_11_119.txt`
- `docs_build/dev/reports/known_bad_links_validation_11_119.txt`

Reports must include:
- files searched
- files changed
- SSoT file confirmed
- renderer paths removed
- stale sources deleted/disabled
- exact validation evidence for 0201
- remaining blockers, if any

No empty reports allowed.

## Full Samples Smoke Test

Skipped.

Reason:
- targeted sample hub renderer/metadata cleanup
- full samples smoke test takes approximately 20 minutes

## Acceptance

- sample tile roundtrip links have exactly one SSoT: `samples/metadata/samples.index.metadata.json`
- renderer does not infer/fallback/restore tool links
- empty metadata arrays produce no roundtrip section
- known-bad links cannot render from stale sources
- 0201 no longer shows Open 3D Camera Path Editor
