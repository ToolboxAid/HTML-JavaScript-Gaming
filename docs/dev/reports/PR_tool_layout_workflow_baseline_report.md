# PR Tool Layout Workflow Baseline Report

Date: 2026-04-28

## Overall Result
PASS

## Scope Guardrails
- No gameplay implementation changes
- No new feature work added
- No start_of_day folder changes
- No sample game or runtime engine file changes

## Changed Files
- docs/dev/reports/PR_tool_layout_workflow_baseline_report.md
- docs/dev/reports/launch_smoke_report.md (updated by test command)

## Validation Steps Performed
1. Launched Vector Map Editor at `tools/Vector Map Editor/index.html`.
2. Confirmed no hidden/default map load:
- Status: `No map loaded. Load a map preset or import a map JSON document to begin.`
- Data object count: `0`
- Note: object list shows one placeholder row for empty state (`objectListRowCount=1`).
3. Created explicit baseline layout by applying a test snapshot (non-runtime artifact) with 4 fragmented horizontal ice platforms.
4. Verified each platform is independently selectable:
- `Ice Platform 01`
- `Ice Platform 02`
- `Ice Platform 03`
- `Ice Platform 04`
5. Cleared selection and confirmed explicit no-selection state:
- `Selected: none (explicit - choose from Objects list)`
6. Executed save/export workflow in Vector Map Editor:
- Save status: `Editor document saved.`
- Export status: `Runtime document exported.`
7. Exported captured layout snapshot artifact and inspected it in State Inspector:
- State Inspector status: `Custom JSON payload loaded into inspector view.`
- Platform names present in inspected output: yes.
8. Sanity-checked Vector Asset Studio paint/stroke controls (`sampleId=0901`):
- Loaded status present
- Paint control enabled
- Stroke control enabled
- Apply Style enabled
9. Sanity-checked Sprite Editor launch/header/no-fallback behavior:
- Launch without sample input shows explicit palette-needed status
- Invalid launch input (`samplePresetPath` invalid) produces actionable error status:
  `Preset load failed: required samplePresetPath input is missing from launch query.`

## Export/Save Path
- `tmp/uat_exports/king_of_the_iceberg_layout_snapshot.json`

## Additional Evidence Artifacts
- `tmp/uat_tool_layout_workflow_results.json`

## Hard-Rule Checks
- No silent fallback data used in this validation flow
- No hidden sample auto-load in Vector Map Editor baseline launch
- Missing/invalid input produced actionable error messages in Sprite Editor invalid-launch sanity check
- No King of the Iceberg runtime code added
- No tileset breakout work performed

## Command Validation
1. `node --check` on changed JavaScript files:
- Not applicable (no JavaScript files were changed in this PR scope).

2. `npm run test:launch-smoke -- --tools`:
- PASS (`286/286`)
- Report: `docs/dev/reports/launch_smoke_report.md`

3. Exported layout verification with State Inspector:
- PASS (custom JSON loaded and platform names confirmed)

## Blockers
- None.

## Remaining Issues
1. Automated header text capture for Sprite Editor includes character-encoding artifacts (`—`) in the raw captured string; behavior is non-blocking for this workflow but worth normalizing in future automation parsing.
