MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Create the King of the Iceberg layout contract document from the validated tool workflow output.

Do not implement gameplay.
Do not modify runtime engine code.
Do not modify sample games.
Do not modify start_of_day folders.
Do not run long samples tests unless directly required.

Use these inputs:
- tmp/uat_exports/king_of_the_iceberg_layout_snapshot.json
- tmp/uat_tool_layout_workflow_results.json
- docs/dev/reports/PR_tool_layout_workflow_baseline_report.md

Create:
- docs/dev/koti_layout_contract.md

The contract must include:
1. Purpose
2. Source artifacts used
3. Minimal layout object shape
4. Platform object requirements
5. Required roles
6. Optional fields
7. Validation rules
8. Example minimal layout JSON
9. Out-of-scope items

Required roles:
- platform
- top-control-platform
- water-zone
- visual-background
- visual-midground

Validation rules:
- layout/map id is required
- at least one top-control-platform is required
- one water-zone is required
- MVP layout has 3 to 5 platform objects
- roles must be explicit
- hidden fallback objects are not allowed
- missing required fields produce actionable errors

Testing:
- Docs-only targeted validation.
- Do not run full samples suite.
- If no JavaScript changed, node --check is not required.
- Report what was validated.

Report:
Create or update docs/dev/reports/PR_koti_layout_contract_report.md with:
- PASS/FAIL
- changed files
- source artifacts reviewed
- validation performed
- remaining issues
