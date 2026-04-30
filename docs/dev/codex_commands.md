# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_113_CODEX_REPAIR_OR_REPORT_ENFORCEMENT

## Execute

This PR exists because the previous run applied no changes and left reports empty.

### Mandatory Rule

Do not finish with empty reports.

For every requested item, do one:
1. Fix it.
2. Prove no fix is needed with file/path evidence.
3. Report a precise blocker with file/path/line evidence and the next required action.

### Repair Loop

For each issue:
1. Search.
2. Record search scope and pattern.
3. If found, fix if in scope.
4. Re-run targeted validation.
5. If not fixed, report exact blocker.
6. Repeat until fixed or explicitly blocked.

### Revisit all active cleanup requests

1. Direct JSON only:
   - no presets
   - no normalizers
   - no transformers
   - no converters
   - no default/demo/fallback data

2. Schema-only validation:
   - allowed pre-schema checks: file exists, JSON parse
   - all other validation belongs in schema
   - invalid input renders visible screen error

3. Move test-only schema files:
   - tools/palette-editor/tool.schema.json
   - tools/vector-asset-studio/tool.schema.json
   - tools/vector-map-editor/tool.schema.json
   into:
   - tests/fixtures/tool-schemas/<tool-id>/tool.schema.json
   Remove runtime duplicates.

4. Remove/report shared/tool input code:
   - infer*
   - normalize*
   - tryLoadPreset*
   - buildPreset*
   - input-mutation replace*
   - legacy remappers
   - alias acceptance
   - fallback/default data injection

5. Enforce canonical names:
   - palette-browser
   - 3d-json-payload
   - asset-pipeline

6. Remove stale names:
   - palette as a tool key/name
   - palette-editor
   - 3d-json-payload-normalizer
   - Asset Pipeline Tool
   - asset-pipeline-tool

7. Enforce sample/tool truthfulness:
   - if sample cannot load in aligned tool, remove the tool reference
   - do not add fake data

8. Restore compact primitive arrays:
   - primitive arrays must be compact grouped
   - do not expand simple arrays one value per line

### Validation

Run targeted validation and include command/result in reports:
- changed JSON parses
- changed manifests validate
- helper references removed or justified
- moved files exist
- old files removed
- invalid input shows visible screen error if affected path changed

### Reports

Write populated reports:
- docs/dev/reports/repair_or_report_summary_11_113.txt
- docs/dev/reports/json_schema_repair_loop_11_113.txt
- docs/dev/reports/shared_code_cleanup_11_113.txt
- docs/dev/reports/tool_binding_truthfulness_11_113.txt
- docs/dev/reports/blockers_11_113.txt

Each report must include:
- files searched
- matches found
- files changed
- skipped items
- exact reason skipped
- validation command used
- validation result
- remaining blockers

If zero matches:
- report the exact search pattern
- report the scope searched
- state that zero matches were found

### Roadmap

- status-only update if execution-backed
- do not rewrite roadmap text
- do not delete roadmap text

### Output

Package Codex output ZIP at:
tmp/PR_11_113_CODEX_REPAIR_OR_REPORT_ENFORCEMENT.zip
