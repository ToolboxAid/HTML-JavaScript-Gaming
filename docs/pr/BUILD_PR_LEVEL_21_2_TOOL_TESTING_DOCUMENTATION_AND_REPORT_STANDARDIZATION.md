# BUILD_PR_LEVEL_21_2_TOOL_TESTING_DOCUMENTATION_AND_REPORT_STANDARDIZATION

## Purpose
Execute the first Tools roadmap testing lane by completing the documentation and reporting work that can be finished cleanly in one PR:

- create full testing documentation for each tool
- define manual test cases per tool
- standardize validation reports under `docs/dev/reports`

This PR does **not** attempt to complete automated validation. That remains the next lane.

## Roadmap intent
This PR may advance the following items only if fully executed and validated:

- `create full testing documentation for each tool` `[ ] -> [x]`
- `define manual test cases per tool` `[ ] -> [x]`
- `standardize validation reports under docs/dev/reports` `[ ] -> [x]`

Do **not** advance:
- `add automated validation where possible`

unless that work is actually completed in this same PR.

## Scope
Included:
- inventory active tools
- create or normalize a full testing document for each active tool
- add manual test cases per tool
- standardize validation report structure under `docs/dev/reports`
- add a reusable report template for tool validation
- update tool doc navigation where needed
- preserve unrelated working-tree changes

Excluded:
- no feature work
- no runtime changes unless strictly required for test harness discovery
- no broad repo cleanup
- no roadmap rewrites
- no `start_of_day` changes
- no speculative automation work beyond documenting automation opportunities

## Active tools baseline
Ensure the tools set explicitly includes current active tool surfaces, including:
- Tile Map Editor
- Parallax Editor
- Vector Map Editor
- Vector Asset Studio

If additional active tools are present in the repo and are clearly in-scope, include them in the testing-doc set and record them in the inventory.

## Required outputs
Codex must create/update:

- `docs/dev/reports/BUILD_PR_LEVEL_21_2_TOOL_TESTING_DOCUMENTATION_AND_REPORT_STANDARDIZATION_TOOL_INVENTORY.md`
- `docs/dev/reports/BUILD_PR_LEVEL_21_2_TOOL_TESTING_DOCUMENTATION_AND_REPORT_STANDARDIZATION_VALIDATION.md`
- `docs/dev/reports/tool_validation_report_template.md`

Per-tool testing docs under a consistent location, for example:
- `docs/tools/<tool-name>/testing.md`
or the current tool-doc structure if already established and coherent

Each per-tool testing doc must contain:
- purpose of testing
- prerequisites
- setup steps
- smoke tests
- core workflow tests
- edge case tests
- regression checks
- known limitations / non-goals
- expected validation artifacts

## Manual test-case requirements
Each active tool must have explicit manual test cases covering:
- launch / boot
- open/load workflow
- create/edit workflow
- save/export workflow if applicable
- invalid input / error handling
- UI persistence or state restoration if applicable
- integration handoff to repo/runtime where applicable

## Validation report standardization requirements
Create or normalize a common validation report shape that includes:
- tool name
- date / run context
- environment
- cases executed
- pass/fail per case
- blockers
- screenshots or artifact references if applicable
- summary / recommendation

## Acceptance
- every active tool has a testing document
- every active tool has manual test cases
- validation reporting format is standardized under `docs/dev/reports`
- tool inventory is explicit and current
- no unrelated repo churn
- roadmap updates are status-only and execution-backed

## Validation requirements
Validation must confirm:
- active tools inventory is complete
- testing doc exists for every active tool
- manual cases exist for every active tool
- validation template exists and is reusable
- no `start_of_day` changes
- unrelated working-tree changes preserved

## Roadmap update rules
Only update status markers in:
- `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md`

Allowed transitions only if fully executed and validated:
- `create full testing documentation for each tool` `[ ] -> [x]`
- `define manual test cases per tool` `[ ] -> [x]`
- `standardize validation reports under docs/dev/reports` `[ ] -> [x]`

Do not update:
- `add automated validation where possible`
