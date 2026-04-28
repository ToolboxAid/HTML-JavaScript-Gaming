# BUILD_PR_10_19_SAMPLES_0204_1413_1505_JSON_SSOT_FIX

## Required Codex Work

### 1. Inspect only affected samples
Limit inspection and edits to:
- Sample 0204 files and its related tool JSON files
- Sample 1413 files and its related tool JSON files
- Sample 1505 files and its related tool JSON files
- Shared tool/sample handoff code only if required to connect explicit JSON input

### 2. Enforce JSON SSoT
For each affected sample:
- identify any canonical data currently defined in JS/classes
- move/normalize that canonical data into explicit JSON
- update sample runtime code to consume JSON
- update tool handoff so the matching tool reads the same JSON

### 3. Sample 0204 requirements
- Asset registry entries must be canonical in JSON.
- `AssetRegistryScene.js` must not own the canonical asset list.
- Asset Browser / Import Hub must display the same JSON-backed asset entries.

### 4. Sample 1413 requirements
- Any tool/sample data needed by its paired tool must be canonical in JSON.
- Remove or demote code-local canonical sample data to JSON consumption.
- Tool output/preview must match the sample-visible data source.

### 5. Sample 1505 requirements
- Any tool/sample data needed by its paired tool must be canonical in JSON.
- Remove or demote code-local canonical sample data to JSON consumption.
- Tool output/preview must match the sample-visible data source.

### 6. Preserve no-fallback rule
Do not:
- add hidden defaults
- hardcode sample paths as fallback data
- scrape JS source
- create duplicate JSON files with conflicting canonical data
- change start_of_day folders

### 7. Validation report
Create:
docs/dev/reports/PR_10_19_SAMPLES_0204_1413_1505_JSON_SSOT_FIX_report.md

Report must include:
- files changed grouped by sample
- old source-of-truth location per sample
- new JSON source-of-truth location per sample
- validation for 0204 sample preview + Asset Browser / Import Hub
- validation for 1413 sample preview + paired tool
- validation for 1505 sample preview + paired tool
- confirmation empty state still works when explicit JSON is absent
- confirmation no fallback data and no start_of_day changes

## Constraints
- One PR purpose: JSON SSoT for samples 0204, 1413, 1505.
- Smallest scoped valid change.
- No unrelated polish.
- No repo-wide scanning.
