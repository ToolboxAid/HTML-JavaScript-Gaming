# BUILD_PR_LEVEL_11_116_REMOVE_KNOWN_BAD_SAMPLES2TOOLS_ENTRIES

## Purpose
Before broader tool/sample validation, remove known-bad `samples2tools` "Open <tool>" entries that have nothing to do with the sample.

## Scope
- testable cleanup
- direct JSON contract path
- no schema lock
- no fallback/default/preset data
- no broad validation sweep before the requested removals
- remove only the listed bad sample/tool launcher entries

## Required First Action

Remove the following `samples2tools` "Open <tool>" entries before any broader PR work.

Each item below is one explicit removal target.

### Remove all unrelated "Open <tool>" entries for these samples

- 0201
- 0202
- 0204
- 0210
- 0220
- 0226
- 0227
- 0303
- 1319

### Remove specific bad tool entries

- 0221
  - remove `3D JSON Payload Normalizer`
  - if canonical name already changed, remove matching `3D JSON Payload` / `3d-json-payload` launcher entry for this sample

- 0305
  - remove `3D JSON Payload Normalizer`
  - if canonical name already changed, remove matching `3D JSON Payload` / `3d-json-payload` launcher entry for this sample

- 0901
  - remove `Vector Map Editor`

- 1204
  - remove `SVG Asset Studio`

- 1205
  - remove `Vector Map Editor`

- 1208
  - remove `3D Asset Viewer`
  - remove `SVG Asset Studio`

## Important

For sample-wide removals:
- only remove `samples2tools` "Open <tool>" launcher entries that have nothing to do with the sample
- do not delete the sample
- do not delete the real sample runtime files
- do not add replacement/fake tool inputs

For specific removals:
- remove only the named bad tool launcher entry for that sample
- leave other valid tool entries intact if they are genuinely related and valid

## Preserve Rules

- JSON file -> schema validation -> tool render
- schema-only validation
- invalid input shows visible screen error
- no normalization
- no transformation
- no conversion
- no preset fallback
- no inferred source data
- compact primitive arrays stay compact

## Validation

Targeted validation only.

Required:
- changed JSON parses
- changed sample/tool manifest files validate
- listed bad launcher entries are gone
- no unrelated sample files deleted
- no placeholder/default input added

## Reports

Codex must write:

- `docs_build/dev/reports/samples2tools_known_bad_removals_11_116.txt`
- `docs_build/dev/reports/samples2tools_remaining_entries_11_116.txt`
- `docs_build/dev/reports/validation_after_11_116.txt`

Reports must include:
- file(s) edited
- exact entries removed
- entries intentionally kept
- validation command/result
- blockers if any target entry cannot be located

## Full Samples Smoke Test

Skipped.

Reason:
- targeted launcher-entry cleanup only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- all listed known-bad `samples2tools` "Open <tool>" entries are removed
- JSON remains valid
- no fake replacement data is added
- package is ready for the next broader end-to-end tool/sample validation PR
