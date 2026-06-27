# BUILD_PR_10_17_ASSET_BROWSER_IMPORT_HUB_SAMPLE_0204_LOAD_FIX

## Required Codex Work

### 1. Trace explicit input path
Inspect only the files needed to trace sample 0204 asset input into Asset Browser / Import Hub:
- sample 0204 files
- the sample manifest/input handoff
- Asset Browser / Import Hub loader
- shared platform launch/context code only if required

### 2. Fix ingestion/mapping
Fix the smallest bug causing valid `sample.0204.3d-asset-viewer.json` data not to appear in Asset Browser / Import Hub.

Likely categories:
- input context not passed to tool
- wrong manifest property read
- wrong JSON key mapped
- loader expects a different top-level collection
- tool treats sample input as absent

### 3. Preserve architecture rules
- Do not add fallback/demo/default data.
- Do not hardcode hidden asset paths.
- Do not rewrite schema.
- Do not modify the data just to satisfy the tool.
- Tool must require explicit manifest/input data and show empty state only when that data is truly absent or empty.

### 4. Selection behavior
When assets load:
- first asset auto-selects
- visible selection highlight appears
- controls enable only with selection

### 5. Validation report
Create:
docs_build/dev/reports/PR_10_17_ASSET_BROWSER_IMPORT_HUB_SAMPLE_0204_LOAD_FIX_report.md

Report must include:
- files changed
- root cause
- source JSON path used
- before/after behavior
- validation steps for sample 0204
- validation that empty state still works when no explicit data exists
- confirmation no data/schema/start_of_day changes

## Constraints
- One PR purpose only.
- Smallest scoped valid change.
- No repo-wide scanning.
- No unrelated UI polish.
- No data fixes.
