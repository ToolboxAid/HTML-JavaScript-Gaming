# BUILD_PR_10_23_SAMPLE_IMPORT_DESTINATION_PRESET_FIX

## Required Codex Work

### 1. Locate sample-owned presets
Search sample-owned JSON files only for:
`games/<project>/`

Focus on:
- `sample.*.asset-browser.json`
- Import Hub / Asset Browser preset JSON fields
- Samples 0204, 1413, 1505 and any other sample-owned presets with this placeholder

### 2. Replace sample destinations
For every sample-owned preset:
- Replace game destination templates with sample-local destination templates.
- Preferred pattern:
  `samples/phase-XX/NNNN/assets/`
  or a more specific sample-local subfolder such as:
  `samples/phase-XX/NNNN/config/`
  `samples/phase-XX/NNNN/assets/vectors/`
  `samples/phase-XX/NNNN/assets/imports/`

Use the smallest correct destination based on asset/category type.

### 3. Preserve catalog source data
Do not alter:
- asset IDs
- asset catalog entries
- source file paths
- schema identity
- sample preview behavior

### 4. Keep game workflow separate
Do not change files under `games/`.
Do not remove game-project placeholders from actual game workflow presets.

### 5. Validation report
Create:
docs_build/dev/reports/PR_10_23_SAMPLE_IMPORT_DESTINATION_PRESET_FIX_report.md

Report must include:
- files changed
- all replaced destinations before/after
- confirmation no sample-owned JSON still contains `games/<project>/`
- confirmation games/ files were not changed
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- No schema rewrite.
- No loader changes unless required by validation.
- No unrelated UI/data changes.
