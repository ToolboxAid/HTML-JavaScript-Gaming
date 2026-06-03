# PR 11.46 Cleanup Batch 3

## Scope Source
- `docs_build/dev/reports/sample_json_js_reference_audit.csv`
- `scripts/PS/audit-sample-json-js-references.ps1`
- Prior context: `docs_build/dev/reports/PR_11_41_sample_json_ownership_audit.md`, `docs_build/dev/reports/PR_11_43_cleanup_batch_1.md`, `docs_build/dev/reports/PR_11_43_validation.txt`, `docs_build/dev/reports/PR_11_44_cleanup_batch_2.md`

## Intentional Exclusions
- Palette JSON: excluded by PR scope.
- Tile-map-editor-document JSON: excluded by PR scope.
- Sample 1902: excluded (workspace exemption).

## Selected JSON Files (High-Confidence Non-Palette / Non-Tile-Document Batch)
1. `samples/phase-02/0221/sample.0221.3d-json-payload-normalizer.json`
2. `samples/phase-05/0510/sample.0510.asset-pipeline-tool.json`
3. `samples/phase-05/0512/sample.0512.performance-profiler.json`
4. `samples/phase-07/0708/sample.0708.replay-visualizer.json`

## Classification / Action
| JSON file | Classification | Action taken | Rationale |
|---|---|---|---|
| `samples/phase-02/0221/sample.0221.3d-json-payload-normalizer.json` | KEEP + WIRE | No code/data move. Verified explicit sample metadata wiring remains valid. | Sample metadata already includes `toolHints: 3d-json-payload-normalizer` and roundtrip preset path to this JSON; ownership is sample-local and tool-aligned. |
| `samples/phase-05/0510/sample.0510.asset-pipeline-tool.json` | KEEP + WIRE | No code/data move. Verified explicit sample metadata wiring remains valid. | Sample metadata already maps `asset-pipeline-tool` to this JSON preset; payload shape matches tool schema intent. |
| `samples/phase-05/0512/sample.0512.performance-profiler.json` | KEEP + WIRE | No code/data move. Verified explicit sample metadata wiring remains valid. | Sample metadata already maps `performance-profiler` to this JSON preset; sample-local ownership is clear. |
| `samples/phase-07/0708/sample.0708.replay-visualizer.json` | KEEP + WIRE | No code/data move. Verified explicit sample metadata wiring remains valid. | Sample metadata already maps `replay-visualizer` to this JSON preset; sample-local ownership is clear. |

## Files Changed
- `docs_build/dev/reports/PR_11_46_cleanup_batch_3.md`
- `docs_build/dev/reports/PR_11_46_validation.txt`
- `docs_build/dev/reports/sample_json_js_reference_audit.pr11_46.csv`

## Coverage Preserved Statement
- Coverage preserved.
- No selected JSON file was moved or deleted.
- No sample-to-tool/use-case path was removed.
- This batch confirms that selected non-palette, non-tile-document payloads are already correctly owned and wired in sample metadata-driven launch contracts.

## Deferred Items And Reasons
- `samples/phase-02/0221/sample.0221.tile-model-converter.json` (not in this PR scope batch; batch intentionally kept to preferred non-palette/non-tile-document set).
- Any palette JSON deferred items (explicitly excluded by this PR scope).
- Any tile-map-editor-document deferred items (explicitly excluded by this PR scope).
- Sample 1902 workspace JSON (explicitly exempt as workspace aggregation sample).