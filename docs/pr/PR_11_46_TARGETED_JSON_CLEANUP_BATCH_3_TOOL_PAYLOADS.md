# PR 11.46 — Targeted JSON Cleanup Batch 3: Tool Payloads

## Purpose
Continue the sample JSON ownership cleanup using the audit output from `scripts/PS/audit-sample-json-js-references.ps1`.

## Source Finding
The audit reported:

- JSON files scanned: 98
- Referenced: 39
- Missing reference: 59

This PR must not attempt to fix all 59.

## Batch Focus
Select a small, high-confidence batch of tool-specific JSON files from the missing-reference list.

Preferred candidates:
- `samples/phase-02/0221/sample.0221.3d-json-payload-normalizer.json`
- `samples/phase-05/0510/sample.0510.asset-pipeline-tool.json`
- `samples/phase-05/0512/sample.0512.performance-profiler.json`
- `samples/phase-07/0708/sample.0708.replay-visualizer.json`

## Required Rule
Each selected JSON file must be classified and handled as one of:

- KEEP + WIRE: belongs to the current sample and should visibly drive it
- MOVE / REHOME: belongs to another sample/tool
- DELETE: stale/obsolete and coverage exists elsewhere
- CREATE / UPDATE CORRECT SAMPLE: needed to preserve coverage
- DEFER: ownership is not clear enough

## Hard Rules
- Do not touch palette JSON files in this PR.
- Do not touch tile-map-editor-document JSON files in this PR.
- Do not touch sample 1902.
- Do not blindly force JSON into a sample.
- Do not create hidden/default fallback data.
- Do not run the full samples smoke test by default.
- Preserve useful tool/sample coverage.

## Acceptance
- 2–4 high-confidence non-palette JSON ownership items are resolved or explicitly deferred after inspection.
- Report documents why each selected item was handled that way.
- Targeted validation only.
- Full sample suite is skipped unless shared launch infrastructure changes.
