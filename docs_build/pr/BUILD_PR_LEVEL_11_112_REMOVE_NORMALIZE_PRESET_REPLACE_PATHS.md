# BUILD_PR_LEVEL_11_112_REMOVE_NORMALIZE_PRESET_REPLACE_PATHS

## Purpose
Continue simplifying the tool pipeline by removing shared/tool compatibility code that normalizes, builds presets, tries preset fallback loading, or replaces input data before render.

## Scope
- testable cleanup PR
- direct JSON contract enforcement
- schema-only validation enforcement
- no schema lock yet
- no feature expansion
- no broad renderer rewrite
- no fallback/default/preset restoration
- no unrelated refactor

## Architecture Rule

JSON file -> schema validation -> tool render

No middle layer.

## Targeted Removal

Search focused shared/tool input/loading code for these patterns:

- `normalize*`
- `tryLoadPreset*`
- `buildPreset*`
- `replace*`

Remove the smallest safe set that affects:
- tool JSON input loading
- tool payload/source loading
- sample tool reference loading
- workspace manifest tool loading
- preset fallback paths
- compatibility remapping paths
- runtime data replacement/mutation paths

## Required Deletions / Replacements

### 1. `normalize*`

Remove code that normalizes:
- tool ids
- schema ids
- asset kinds
- source paths
- payload shape
- manifest keys
- legacy aliases

Do not replace with another normalizer.

If canonical data is needed, the JSON/schema must already contain it.

### 2. `tryLoadPreset*`

Remove preset fallback loading.

Tools must not:
- try a preset when JSON is missing
- try a preset when JSON is invalid
- try a preset to fill missing fields
- use preset as compatibility bridge

If JSON input is missing/invalid, show an on-screen error.

### 3. `buildPreset*`

Remove runtime preset-building code from tool loading.

Tools must not:
- build input data from defaults
- build data from partial JSON
- build hidden config objects
- build compatibility payloads

If a tool needs data, it must be present in the JSON and schema-valid.

### 4. `replace*`

Remove replacement helpers when used to:
- rewrite JSON shape
- substitute missing data
- mutate source data before render
- replace legacy keys
- replace aliases
- patch invalid payloads

Keep only unrelated string/path replacement utilities if they are not part of tool input mutation.
Any kept `replace*` must be documented in the report with reason.

## Error Contract

If input cannot be loaded or validated:
- show visible on-screen error
- include file path when available
- include schema path when available
- include schema error path when available
- do not fallback
- do not repair

## Allowed Pre-Schema Checks

Only:
- file exists
- JSON parses

Everything else belongs in schema.

## Preserve Existing Rules

- compact primitive-array formatting stays applied
- canonical names stay applied:
  - `palette-browser`
  - `3d-json-payload`
  - `asset-pipeline`
- no aliases
- no wildcard asset kind
- no default/demo/sample data injection

## Validation

Run targeted validation only.

Required:
- changed JSON parses
- changed manifests validate
- affected tool input paths validate schema-only behavior
- invalid input shows visible error
- removed helpers are not referenced
- no preset fallback path remains in affected loading code

## Full Samples Smoke Test

Skipped.

Reason:
- targeted shared/tool input cleanup
- do not run full 20-minute samples smoke test unless shared sample loader/framework behavior is broadly changed

## Reports

Codex must write:

- `docs_build/dev/reports/normalize_path_removal_11_112.txt`
- `docs_build/dev/reports/preset_path_removal_11_112.txt`
- `docs_build/dev/reports/replace_path_review_11_112.txt`
- `docs_build/dev/reports/direct_json_validation_11_112.txt`

Reports must list:
- removed functions
- removed imports
- remaining matching names and why they are allowed
- targeted validation result
- exact files changed

## Acceptance

- More shared/tool input spaghetti is removed.
- No preset fallback remains in affected tool loading.
- No runtime normalization/replacement is used to make invalid JSON work.
- Tools continue direct JSON -> schema validation -> render/error.
