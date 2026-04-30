# BUILD_PR_LEVEL_11_118_SAMPLE_TILE_LINK_SSOT_ENFORCEMENT

## Purpose
Establish the actual sample tile tool-link file as the only SSoT, delete stale/bad duplicate sources, and remove known-bad "Open <tool>" links from the real source.

## Scope
- replaces PR 11.117
- testable cleanup
- sample tile/tool-link SSoT enforcement
- no schema lock
- no fallback/default/preset data
- no broad end-to-end validation before this cleanup
- no fake replacement inputs

## Core Rule

There must be exactly ONE source of truth for sample tile "Open <tool>" links.

If a bad link still appears on a sample tile, Codex must find the file that supplies it, make that file the SSoT, and delete/disable stale duplicate sources.

## Required First Action

Trace sample tile "Open <tool>" links to their actual source file(s).

Candidate sources include:
- samples index files
- generated sample registry files
- `samples/index.html`
- sample tile JS data/config
- `samples2tools` files
- sample manifests
- per-sample metadata JSON
- generated static metadata consumed by the samples page

Do not assume the first match is the source.

## SSoT Enforcement

After tracing:

1. Identify the one file that actually drives visible sample tile "Open <tool>" links.
2. Mark/document that file as the only SSoT.
3. Delete stale duplicate sample-tool link data if it is not used.
4. If deletion is unsafe, remove it from runtime loading and report why.
5. Update any loader/index code so it reads from only the SSoT.
6. Remove conflicting/generated/stale bad links from non-SSoT files.
7. Do not leave two active files that can define sample tile tool links.

## Delete Bad Stuff

Delete or disable stale/bad duplicated launcher data that:
- reintroduces removed tool links
- conflicts with the SSoT
- causes sample tiles to show tools unrelated to the sample
- contains stale names like `3D JSON Payload Normalizer`

Do not delete actual sample runtime data unless it is only stale launcher metadata and not used by the sample.

## Known-Bad Links to Remove

### Remove all unrelated "Open <tool>" links for these samples

- 0201
- 0202
- 0204
- 0210
- 0220
- 0226
- 0227
- 0303
- 1319

### Remove specific bad tool links

- 0221
  - remove `3D JSON Payload Normalizer`
  - remove canonical equivalent if present: `3D JSON Payload` / `3d-json-payload`

- 0305
  - remove `3D JSON Payload Normalizer`
  - remove canonical equivalent if present: `3D JSON Payload` / `3d-json-payload`

- 0901
  - remove `Vector Map Editor`

- 1204
  - remove `SVG Asset Studio`

- 1205
  - remove `Vector Map Editor`

- 1208
  - remove `3D Asset Viewer`
  - remove `SVG Asset Studio`

## Required Verification

Codex must verify:
- the listed bad links no longer appear in the active SSoT
- the listed bad links no longer appear in any active runtime-loaded duplicate file
- stale duplicate files are deleted or not loaded
- there is no second active source of sample tile tool links

## Preserve Rules

- JSON file -> schema validation -> tool render
- schema-only validation
- visible error on schema mismatch
- no normalization
- no transformation
- no conversion
- no preset fallback
- no inferred source data
- compact primitive arrays stay compact

## Reports

Codex must write populated reports:

- `docs/dev/reports/sample_tile_link_ssot_11_118.txt`
- `docs/dev/reports/sample_tile_bad_links_removed_11_118.txt`
- `docs/dev/reports/stale_launcher_sources_deleted_11_118.txt`
- `docs/dev/reports/validation_after_11_118.txt`

Reports must include:
- all candidate files searched
- the chosen SSoT file
- why it is the SSoT
- stale/duplicate files deleted or disabled
- exact bad entries removed
- entries not found
- active loader/index files checked
- validation command/result
- remaining blockers

No empty reports allowed.

## Validation

Targeted validation only.

Required:
- changed JSON parses
- changed JS/HTML/index files are syntactically valid where practical
- sample tile loader uses only the SSoT
- listed bad links are gone from active source data
- no samples deleted
- no fake inputs added

## Full Samples Smoke Test

Skipped.

Reason:
- targeted sample tile link SSoT cleanup
- full samples smoke test takes approximately 20 minutes

## Acceptance

- sample tile tool links have exactly one SSoT
- stale duplicate launcher sources are deleted or disabled
- known-bad links are removed from the SSoT
- bad links cannot reappear from generated/stale duplicate data
- reports prove where the visible links came from
