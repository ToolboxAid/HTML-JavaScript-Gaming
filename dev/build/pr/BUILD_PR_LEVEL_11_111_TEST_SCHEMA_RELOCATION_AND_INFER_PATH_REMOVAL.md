# BUILD_PR_LEVEL_11_111_TEST_SCHEMA_RELOCATION_AND_INFER_PATH_REMOVAL

## Purpose
Continue the direct-JSON/schema-only path until samples, games, and tools work together by relocating test-only tool schemas and removing more inference/compatibility shared code.

## Scope
- testable cleanup PR
- direct JSON contract enforcement
- schema-only validation enforcement
- no schema lock yet
- no fallback/default/preset restoration
- no broad renderer rewrite
- no unrelated refactor

## Required Changes

### 1. Move test-only `tool.schema.json`

`tool.schema.json` appears to be a local/test schema fixture, not a runtime tool schema.

Move these files out of runtime tool folders:

- `toolbox/palette-editor/tool.schema.json`
- `toolbox/vector-asset-studio/tool.schema.json`
- `toolbox/vector-map-editor/tool.schema.json`

Use this destination:

- `tests/fixtures/tool-schemas/<tool-id>/tool.schema.json`

Examples:

- `toolbox/palette-editor/tool.schema.json`
  -> `tests/fixtures/tool-schemas/palette-editor/tool.schema.json`

- `toolbox/vector-asset-studio/tool.schema.json`
  -> `tests/fixtures/tool-schemas/vector-asset-studio/tool.schema.json`

- `toolbox/vector-map-editor/tool.schema.json`
  -> `tests/fixtures/tool-schemas/vector-map-editor/tool.schema.json`

Update any test references to the new paths.

Do not keep duplicate runtime copies.

### 2. Remove more shared inference paths

The architecture is now:

JSON file -> schema validation -> tool render

No inference layer.

Codex must search focused shared/tool input code for:

- `infer*`
- `normalize*`
- `transform*`
- `convert*`
- `coerce*`
- `resolve*Legacy*`
- `fallback*`
- `default*` when used as hidden data injection
- alias/remap helpers

Remove the smallest safe set that affects tool input/source/payload loading.

Especially target code that:
- infers missing source paths
- infers schema names
- infers asset kinds
- infers tool ids
- converts old payload shapes
- maps aliases
- injects default payloads
- creates demo data when JSON is missing

### 3. Keep allowed checks only

Allowed before schema validation:
- file exists
- JSON parses

Everything else belongs in the schema.

### 4. On-screen errors remain mandatory

If file is missing, JSON parse fails, or schema validation fails:
- show visible screen error
- do not repair
- do not infer
- do not fallback

### 5. Preserve canonical names

Keep these canonical names only:

- `palette-browser`
- `3d-json-payload`
- `asset-pipeline`

Do not reintroduce:
- `palette`
- `palette-editor`
- `3d-json-payload-normalizer`
- `Asset Pipeline Tool`
- `asset-pipeline-tool`

### 6. Preserve compact primitive arrays

Primitive arrays must stay compact grouped:

```json
[
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
]
```

Do not expand primitive arrays one item per line.

## Validation

Run targeted validation only.

Required:
- moved schema fixture files exist under `tests/fixtures/tool-schemas`
- old runtime `toolbox/*/tool.schema.json` files no longer exist
- test references updated
- JSON parses
- changed schemas validate
- changed tool input paths use schema-only validation
- invalid input renders visible error
- no removed inference path is still referenced

## Full Samples Smoke Test

Skipped.

Reason:
- targeted tool/schema cleanup
- do not run full 20-minute samples smoke test unless shared sample loader/framework behavior is changed broadly

## Reports

Codex must write:

- `docs_build/dev/reports/tool_schema_fixture_relocation_11_111.txt`
- `docs_build/dev/reports/inference_path_removal_11_111.txt`
- `docs_build/dev/reports/schema_only_runtime_check_11_111.txt`

Reports must list:
- files moved
- references updated
- inference/normalization paths removed
- inference/normalization paths still remaining and why
- targeted validation result

## Acceptance

- test-only `tool.schema.json` files are no longer in runtime tool folders
- fixture schemas live under `tests/fixtures/tool-schemas`
- more shared inference/compatibility code is removed
- tools still follow direct JSON -> schema -> render
- invalid input shows visible on-screen errors
- no fallback/default/demo data is restored
