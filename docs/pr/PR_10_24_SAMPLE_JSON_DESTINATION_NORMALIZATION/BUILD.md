# BUILD_PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION

## Required Codex Work

### 1. Search sample JSON only
Search all `*.json` files under:
`samples/`

Find destination-like fields/values including:
- `importDestination`
- `exportDestination`
- `destination`
- `suggestedDestination`
- `outputPath`
- any displayed "Suggested destination" value
- any string containing `games/<project>/`
- any string ending in `/config/` or containing `/config/`

### 2. Normalize destinations
For sample-owned JSON:
- replace `games/<project>/...` with sample-local paths
- do not use `config/` unless the specific sample actually has/uses a config folder
- prefer existing real folders when present
- otherwise prefer a clear sample-local generated/import folder such as:
  - `samples/phase-XX/NNNN/assets/`
  - `samples/phase-XX/NNNN/assets/imports/`
  - `samples/phase-XX/NNNN/data/`
  - `samples/phase-XX/NNNN/imports/`

Use the smallest path that matches the asset/category purpose.

### 3. Specific required fix
For sample 1413:
- `sample.1413.asset-browser.json`
- row/category: `Workflow JSON`
- current suggested destination: `games/<project>/config/`
- must become a sample-local destination.
- Do not create or reference `config/` unless it is intentionally added and justified. Prefer an existing or clearly sample-owned folder.

### 4. Preserve data ownership
Do not alter:
- asset catalog IDs
- asset source paths
- schema references
- tool identity
- selected asset IDs unless required because the destination field was the only issue

### 5. Validation
Create:
docs/dev/reports/PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION_report.md

Report must include:
- scan scope
- every matched issue
- every changed file
- before/after destination values
- confirmation no `samples/**/*.json` contains `games/<project>/`
- confirmation no invalid sample `config/` destination remains
- confirmation no `games/` files changed
- confirmation no start_of_day changes

## Constraints
- Samples JSON destination normalization only.
- No tool implementation changes unless a display-only label is incorrectly hardcoded.
- No schema rewrite.
- No sample runtime code changes.
