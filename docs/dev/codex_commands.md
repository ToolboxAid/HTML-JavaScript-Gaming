MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Remove future/advisory import hint fields that are not required for current tool operation.

User decision:
If it is not required now, remove it. Do not keep future intent fields like importDestination/importName that point to non-existing files/folders.

Target fields:
- importDestination
- importName
- destinationFolder
- future-only import plan defaults
- fields only used to prefill advisory/manual import plans

Scope:
- Asset Browser metadata
- Import Hub metadata
- tool launch presets
- sample tool manifests
- active-project manifest tool sections
- docs explaining these fields as expected behavior

Do not modify:
- KOTI gameplay
- runtime game engine files
- start_of_day folders

Rules:
- Remove fields if not required for current load/display/edit/validate/export.
- Do not replace with another future hint.
- Do not introduce fallback data.
- If a destination/name is required for an actual import action, require it at action time with validation.
- Asset Browser 0204 and 1505 must still show clear empty/missing/invalid state.

Validation:
- rg "importDestination|importName|destinationFolder" tools samples docs
- Explain remaining hits.
- node --check changed JS files only.
- Target browser validation for Asset Browser 0204 and 1505.
- Do not run full sample suite.

Create report:
docs/dev/reports/PR_tool_remove_future_import_hints_report.md

Report must include:
- PASS/FAIL
- changed files
- fields removed
- remaining search hits and why they remain
- validation commands/results
- confirmation no start_of_day changes
- confirmation no runtime engine changes
