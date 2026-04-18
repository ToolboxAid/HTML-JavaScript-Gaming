# BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE

## Purpose
Execute the next **combined** safe tools lane by using one validation-backed pass to do all of the following together:

- add automated validation where possible
- document known bugs per tool
- identify missing functionality per tool
- create a prioritized tool-quality baseline for follow-on implementation

This combines adjacent roadmap work that naturally comes from the same inspection/execution pass, while remaining one capability-focused PR.

## Combined roadmap intent
This PR may advance the following items only if fully executed and validated:

### Testing & Validation
- `add automated validation where possible` `[ ] -> [x]`

### Known Bugs
- `document all known bugs per tool` `[ ] -> [x]`
- `classify by severity (low / medium / high)` `[ ] -> [x]`
- `track reproduction steps` `[ ] -> [x]`
- `ensure each bug has an owner or resolution path` `[ ] -> [x]`

### Missing Functionality
- `identify gaps in each tool` `[ ] -> [x]`
- `define expected vs current behavior` `[ ] -> [x]`
- `prioritize missing features` `[ ] -> [x]`

Do **not** advance:
- `align functionality across tools where applicable`

unless that work is actually completed in this PR.

## Scope
Included:
- create automated validation coverage for tool boot / load / registry / basic smoke paths where feasible
- produce a tool automation matrix showing what is and is not automatable yet
- execute the automated validation pass
- create a known-bugs register per primary tool
- classify each bug by severity
- add reproduction steps
- assign owner or resolution path for each bug
- create a missing-functionality matrix per primary tool
- document expected vs current behavior
- prioritize gaps
- preserve unrelated working-tree changes

Excluded:
- no feature implementation beyond validation wiring
- no broad UI redesign
- no roadmap rewrites
- no `start_of_day` changes
- no speculative fixes for bugs found in this PR
- no cross-tool functionality alignment work unless already fully achieved and validated

## Baseline tool set
Use the primary tool inventory established in the UAT standardization lane, including:
- 3D Asset Viewer
- 3D Camera Path Editor
- 3D Map Editor
- Asset Browser
- Asset Pipeline Tool
- Palette Browser
- Parallax Scene Studio
- Performance Profiler
- Physics Sandbox
- Replay Visualizer
- Sprite Editor
- State Inspector
- Tile Model Converter
- Tilemap Studio
- Tool Host
- Vector Asset Studio
- Vector Map Editor
- Tools Index / Registry validation surface

## Required outputs
Codex must create/update:

### Automation
- `docs/dev/reports/BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_AUTOMATION_MATRIX.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_AUTOMATION_RESULTS.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_3_TOOL_AUTOMATION_AND_TOOL_QUALITY_BASELINE_VALIDATION.md`

### Known bugs
- `docs/dev/reports/tool_known_bugs.md`

### Missing functionality
- `docs/dev/reports/tool_missing_functionality.md`

### Optional supporting artifacts
If needed to make automation executable and repeatable:
- minimal validation scripts under an existing repo-appropriate scripts/tools validation location
- minimal run instructions linked from the reports

## Automation requirements
Automate where possible, at minimum covering:
- tool entry-point existence
- basic boot/load validation
- tools index / registry consistency
- presence of expected primary assets or samples where required for boot
- no blocking failure on initial load path where automation is feasible

For tools that cannot yet be automated cleanly, record:
- why not
- what blocker exists
- what the smallest next automation step would be

## Known bug register requirements
For each bug recorded:
- tool name
- short title
- severity: low / medium / high
- reproduction steps
- observed behavior
- expected behavior
- owner or resolution path
- status (open / deferred / blocked)

## Missing functionality matrix requirements
For each tool gap recorded:
- tool name
- capability area
- expected behavior
- current behavior
- gap summary
- priority: low / medium / high
- recommended next implementation lane

## Acceptance
- automation exists where feasible and has been run
- automation gaps are explicitly recorded where not feasible
- known bugs are documented per tool
- each bug has severity + reproduction + owner/resolution path
- missing functionality is documented per tool
- expected vs current behavior is explicit
- gaps are prioritized
- unrelated working-tree changes are preserved
- roadmap updates are status-only and execution-backed

## Validation requirements
Validation must confirm:
- automation pass executed
- automation coverage and blockers recorded
- known bugs register exists and covers the primary tool set where applicable
- missing functionality matrix exists and covers the primary tool set
- no `start_of_day` changes
- unrelated working-tree changes preserved

## Roadmap update rules
Only update status markers in:
- `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md`

Allowed transitions only if fully executed and validated:
- `add automated validation where possible` `[ ] -> [x]`
- `document all known bugs per tool` `[ ] -> [x]`
- `classify by severity (low / medium / high)` `[ ] -> [x]`
- `track reproduction steps` `[ ] -> [x]`
- `ensure each bug has an owner or resolution path` `[ ] -> [x]`
- `identify gaps in each tool` `[ ] -> [x]`
- `define expected vs current behavior` `[ ] -> [x]`
- `prioritize missing features` `[ ] -> [x]`

Do not update:
- `align functionality across tools where applicable`
