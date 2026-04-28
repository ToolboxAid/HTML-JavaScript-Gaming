MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Close Tools UAT only.

Do not advance King of the Iceberg work.
Do not create or modify KOTI layout/gameplay artifacts.
Do not modify sample games, runtime engine files, or start_of_day folders.

Use existing evidence:
- tmp/uat_failed_cases_rerun.json
- tmp/interactive_uat_report_4tools.json
- docs/dev/reports/PR_tool_uat_failure_fix_report.md
- any existing tool smoke/UAT reports

Create:
- docs/dev/reports/PR_tool_uat_closeout_report.md

Report must include:
1. Overall PASS/FAIL
2. PASS/FAIL per tool:
   - Vector Map Editor
   - Vector Asset Studio
   - Sprite Editor
   - State Inspector
3. Evidence files reviewed
4. Remaining issues, if any
5. Confirmation no KOTI work was advanced
6. Confirmation no start_of_day folders changed
7. Confirmation no sample game/runtime engine changes were made

Targeted validation only:
- Do not run long sample suites unless required.
- If uncertainty exists, rerun only the specific failed-case UAT checks.
- If no JavaScript files changed, node --check is not required.

Tool criteria:
- Vector Map Editor: no silent auto-load, no auto-selection, explicit no-selection state, sample 1212 remains passing.
- Vector Asset Studio: samples 0901/1204/1208 remain passing, paint/stroke selection gating works, invalid/incomplete state actionable.
- Sprite Editor: invalid-state actionable message visible, no silent fallback sprite/sample.
- State Inspector: remains passing for valid/invalid/empty JSON.

Report all remaining issues without masking them.
