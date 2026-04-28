MODEL: GPT-5.3-codex
REASONING: low

PR purpose:
Validate the tool workflow for creating a basic King of the Iceberg layout.

Do not implement gameplay.
Do not add new features unless a tiny test-only artifact is required to validate existing workflow.
Do not modify start_of_day folders.
Do not modify sample games or runtime engine files.

Main workflow:
1. Launch Vector Map Editor.
2. Confirm no hidden/default map loads.
3. Create or load an explicit baseline layout.
4. Represent 3 to 5 fragmented horizontal ice platforms.
5. Confirm each platform is independently selectable.
6. Confirm clearing selection shows explicit no-selection state.
7. Save/export the layout state.
8. Inspect exported state in State Inspector.
9. Sanity-check Vector Asset Studio paint/stroke controls.
10. Sanity-check Sprite Editor launch/header/no-fallback behavior.

Required report:
Create docs/dev/reports/PR_tool_layout_workflow_baseline_report.md

Report must include:
- PASS/FAIL
- Changed files, if any
- Validation steps performed
- Export/save path
- Any blockers
- Remaining issues without masking them

Hard rules:
- No silent fallback data.
- No hidden sample auto-load.
- Missing/invalid input must produce actionable messages.
- Do not add King of the Iceberg runtime code.
- Do not build tileset breakout yet.

Validation:
- Run node --check on any changed JavaScript files.
- Run npm run test:launch-smoke -- --tools.
- If an exported JSON/layout file is produced, verify it with State Inspector.
