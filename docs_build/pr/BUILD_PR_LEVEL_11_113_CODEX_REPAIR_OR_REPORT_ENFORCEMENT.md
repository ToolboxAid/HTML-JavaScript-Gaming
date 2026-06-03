# BUILD_PR_LEVEL_11_113_CODEX_REPAIR_OR_REPORT_ENFORCEMENT

## Purpose
Fix the previous no-op behavior by requiring Codex to actively repair all previously requested JSON/schema/tool-input issues or report exact blockers with evidence.

## Scope
- testable cleanup PR
- enforcement wrapper for the current direct-JSON/schema-only cleanup lane
- no schema lock yet
- no silent no-op reports
- no fallback/default/preset restoration

## Required Execution Rule

Codex must not finish with empty reports.

For every requested cleanup item, Codex must do exactly one of these:

1. Apply a fix.
2. Prove no fix is needed with file/path evidence.
3. Report an exact blocker with file/path/line evidence and next required action.

## Required Repair Loop

For each issue found:

1. Identify the file.
2. Identify the exact invalid JSON/schema/tool-input problem.
3. Repair it if it is within scope.
4. Re-run targeted validation.
5. If still failing, report exact failure.
6. Repeat until:
   - fixed, or
   - blocked with specific evidence.

## Must Re-Process Prior Requests

Codex must revisit and repair/report all prior lane items:

### Direct JSON Contract
- tools load explicit JSON only
- no presets
- no normalizers
- no transformers
- no converters
- no hidden fallback/demo/default data

### Schema-Only Validation
- file exists and JSON parse are the only pre-schema checks
- all other validation belongs in schema
- invalid schema input shows visible screen error

### Test Schema Relocation
Move or prove already moved:
- `toolbox/palette-editor/tool.schema.json`
- `toolbox/vector-asset-studio/tool.schema.json`
- `toolbox/vector-map-editor/tool.schema.json`

Destination:
- `tests/fixtures/tool-schemas/<tool-id>/tool.schema.json`

### Remove Shared/Tool Input Code
Actively search and remove/report:
- `infer*`
- `normalize*`
- `tryLoadPreset*`
- `buildPreset*`
- input-mutation `replace*`
- legacy remappers
- alias acceptance
- fallback/default data injection

### Canonical Names
Ensure no stale names remain:
- `palette`
- `palette-editor`
- `3d-json-payload-normalizer`
- `Asset Pipeline Tool`
- `asset-pipeline-tool`

Canonical only:
- `palette-browser`
- `3d-json-payload`
- `asset-pipeline`

### Sample/Tool Binding Truthfulness
If a sample cannot load in the aligned tool:
- remove the tool reference
- do not create fake placeholder data

### Compact Primitive Arrays
Restore and enforce compact primitive arrays.

## Mandatory Report Content

Every report must include:

- files searched
- matches found
- files changed
- skipped items
- exact reason skipped
- validation command used
- validation result
- remaining blockers

Empty reports are invalid.

If there are zero matches, report:
- the exact search command/pattern
- scope searched
- statement that no matches were found

## Required Reports

Codex must write populated reports:

- `docs_build/dev/reports/repair_or_report_summary_11_113.txt`
- `docs_build/dev/reports/json_schema_repair_loop_11_113.txt`
- `docs_build/dev/reports/shared_code_cleanup_11_113.txt`
- `docs_build/dev/reports/tool_binding_truthfulness_11_113.txt`
- `docs_build/dev/reports/blockers_11_113.txt`

## Validation

Targeted validation only.

Required:
- reports are non-empty and evidence-based
- no no-op finish
- changed JSON parses
- changed manifests validate
- removed helper references do not remain
- invalid input still shows visible screen error
- old runtime `tool.schema.json` files are gone or explicitly reported with blocker evidence

## Full Samples Smoke Test

Skipped.

Reason:
- targeted cleanup and validation-report enforcement
- full samples smoke test takes approximately 20 minutes
- run targeted checks only unless shared loader/framework behavior broadly changes

## Acceptance

- Codex either fixes or reports every requested cleanup item.
- No empty reports.
- No silent no-op.
- Remaining blockers are exact and actionable.
- Direct JSON/schema-only/tool-truthfulness path continues.
