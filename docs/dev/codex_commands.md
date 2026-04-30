# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_111_TEST_SCHEMA_RELOCATION_AND_INFER_PATH_REMOVAL

## Execute

1. Move test-only schema files out of runtime tool folders:
   - tools/palette-editor/tool.schema.json -> tests/fixtures/tool-schemas/palette-editor/tool.schema.json
   - tools/vector-asset-studio/tool.schema.json -> tests/fixtures/tool-schemas/vector-asset-studio/tool.schema.json
   - tools/vector-map-editor/tool.schema.json -> tests/fixtures/tool-schemas/vector-map-editor/tool.schema.json

2. Update any tests or scripts that referenced the old paths.

3. Do not leave duplicate runtime copies at:
   - tools/palette-editor/tool.schema.json
   - tools/vector-asset-studio/tool.schema.json
   - tools/vector-map-editor/tool.schema.json

4. Search focused tool input/loading/shared code for inference and compatibility helpers:
   - infer*
   - normalize*
   - transform*
   - convert*
   - coerce*
   - resolve*Legacy*
   - fallback*
   - default* when used as hidden input/data injection
   - alias/remap helpers

5. Remove the smallest safe set of shared inference/compatibility code that affects tool input/source/payload loading.

6. Keep only allowed pre-schema checks:
   - file exists
   - JSON parse

7. Ensure all other input validation is schema-only.

8. Ensure failures render visible screen errors:
   - missing file
   - malformed JSON
   - schema mismatch

9. Preserve direct flow:
   explicit JSON file -> schema validation -> render as-is

10. Preserve canonical names:
   - palette-browser
   - 3d-json-payload
   - asset-pipeline

11. Preserve compact primitive-array formatting.

12. Validate targeted paths:
   - moved fixture files exist
   - old runtime tool.schema.json files are gone
   - changed test/script references work
   - changed JSON parses
   - changed manifests validate
   - no removed helper references remain

13. Write reports:
   - docs/dev/reports/tool_schema_fixture_relocation_11_111.txt
   - docs/dev/reports/inference_path_removal_11_111.txt
   - docs/dev/reports/schema_only_runtime_check_11_111.txt

14. Roadmap:
   - update status markers only if execution-backed
   - do not rewrite roadmap text
   - do not delete roadmap text

15. Package Codex output ZIP at:
   tmp/PR_11_111_TEST_SCHEMA_RELOCATION_AND_INFER_PATH_REMOVAL.zip
