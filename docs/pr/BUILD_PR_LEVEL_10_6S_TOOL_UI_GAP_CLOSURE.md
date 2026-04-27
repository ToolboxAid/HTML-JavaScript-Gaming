# BUILD PR 10.6S - Tool UI Gap Closure

## Purpose
Close the tool UI readiness gaps identified by PR 10.6R without expanding scope.

## Scope
One PR purpose only: make tool success depend on required inputs and required UI controls being ready.

## Codex Instructions
1. Read:
   - docs/dev/reports/PR_10_6R_tool_ui_control_inventory.md
   - docs/dev/reports/PR_10_6R_tool_ui_control_gaps.md
   - docs/dev/tool_ui_readiness_dod.md, if present
2. Fix only the gaps listed in PR 10.6R.
3. Do not rewrite roadmap text. Only update status markers if execution-backed.
4. Do not add fallback/demo/default data.
5. Do not hardcode sample paths.
6. Do not introduce palette-browser duplicate palette data.
7. For every fixed tool, ensure:
   - required inputs load from manifest-declared paths
   - required controls bind to loaded data
   - controls do not default silently
   - lifecycle/timer behavior does not reset UI state after load
   - diagnostics classify missing, wrong-path, wrong-shape, empty, defaulted, lifecycle-violation, or success

## Required Focus Areas
- Accordion lifecycle: opening an accordion must not auto-close after about one second unless user-triggered.
- Asset Browser / Import Hub: approved assets must load from explicit manifest/input data.
- Tilemap Studio: map and tile controls must prove loaded data and UI binding.
- Vector Asset Studio: palette, paint, and stroke controls must load and bind from canonical input data.
- Vector Map Editor: map data and entity/layer controls must load and bind from explicit input data.
- Sprite Editor: palette is required and must populate palette grid, Color 1, Color 2, active color, and canvas rendering from canonical palette json.

## Required Reports
Codex must write:
- docs/dev/reports/PR_10_6S_gap_closure_report.md
- docs/dev/reports/PR_10_6S_tool_ui_readiness_result.md

Each report must list:
- files changed
- gaps closed
- remaining gaps, if any
- exact test commands run
- pass/fail result
- whether UAT is ready

## Acceptance
Codex is done only when:
- no required control is missing
- no required control is unbound
- no required control uses silent default/fallback data
- no lifecycle/timer closes or resets UI without user action
- palette SSoT uses canonical `*.palette.json`
- `*.palette-browser.json` is not required as duplicated palette data
- test commands complete successfully

## Validation Commands
Run:
```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

If additional existing tool-specific tests exist, run only the smallest relevant set.

## Commit Comment
Close tool UI readiness gaps from control inventory and stabilize required input-to-control bindings - PR 10.6S
