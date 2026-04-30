# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: low

## PR
BUILD_PR_LEVEL_11_104_SCHEMA_FILENAME_CANONICALIZATION_AND_ARRAY_RULE_RESTORE

## Execute

1. Rename schema files:
   - tools/schemas/tools/3d-json-payload.schema.json -> tools/schemas/tools/3d-json-payload.schema.json
   - tools/schemas/tools/asset-pipeline.schema.json -> tools/schemas/tools/asset-pipeline.schema.json

2. Update every repo reference to the renamed schema files:
   - `$ref`
   - schema ids
   - validation scripts
   - docs
   - tool/sample/game JSON

3. Validate all JSON against strict schemas.

4. Fix JSON/schema mismatches only:
   - stale schema references
   - stale tool ids
   - invalid/unknown properties
   - missing required fields
   - wrong canonical names

5. Restore the Project Instructions compact primitive-array formatting rule if it is missing or changed:
   - simple primitive arrays must use compact grouped form:
     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
   - do not apply to arrays of objects, nested arrays, or complex structures

6. Normalize repo JSON primitive arrays to match the rule.

7. Confirm no old names remain:
   - 3d-json-payload.schema.json
   - asset-pipeline.schema.json
   - palette
   - palette-browser

8. Write reports:
   - docs/dev/reports/schema_filename_canonicalization_11_104.txt
   - docs/dev/reports/json_schema_alignment_11_104.txt
   - docs/dev/reports/array_formatting_rule_11_104.txt

9. Roadmap:
   - only update status markers if execution-backed
   - do not rewrite roadmap text
   - do not delete roadmap text

## Constraints

- Do not loosen schemas.
- Do not add aliases.
- Do not add fallback/default asset data.
- Do not write implementation code unless required only to update validation/reference paths.
- Do not run full samples smoke test unless validation proves shared sample loader/framework was changed.
