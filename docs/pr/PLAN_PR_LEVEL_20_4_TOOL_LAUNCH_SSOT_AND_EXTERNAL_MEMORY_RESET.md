# PLAN_PR_LEVEL_20_4_TOOL_LAUNCH_SSOT_AND_EXTERNAL_MEMORY_RESET

## Purpose
Restore controlled UAT flow for launching tools and workspaces from index tiles by moving launch data to a single source of truth and eliminating tool defaults/fallbacks.

## One PR Purpose
Normalize external launch routing:
- Samples open direct tool pages at `tools/<tool>/index.html`.
- Games open Workspace Manager at `tools/Workspace Manager/index.html`.
- External launches clear prior tool/workspace memory before loading the requested tool or workspace.
- Tool/workspace launch data comes from one SSoT with no default or fallback tool entries.

## In Scope
- Identify the current tile launch path in `samples/index.html` and `games/index.html`.
- Identify current tool/workspace launch data currently duplicated across samples, games, or tools.
- Create or update the smallest existing SSoT module/data file for launch metadata.
- Route all sample tool tiles to `tools/<tool>/index.html` using SSoT data.
- Route all game workspace tiles to `tools/Workspace Manager/index.html` using SSoT data.
- When launched externally from samples or games, clear persisted tool/workspace memory before loading the requested target.
- Remove default/fallback launch behavior for every tool; missing SSoT data must fail visibly in validation, not silently pick a fallback.
- Update roadmap status only if there is an execution-backed matching item.
- Add validation report under `docs/dev/reports/`.

## Out of Scope
- No visual redesign.
- No new tool implementation.
- No game implementation changes beyond launch routing.
- No standalone showcase tracks.
- No start_of_day changes.
- No broad repo cleanup.
- No default/fallback reintroduction.

## Acceptance
- `samples/index.html` tile launches use `tools/<tool>/index.html`.
- `games/index.html` tile launches use `tools/Workspace Manager/index.html`.
- External launch from samples clears prior tool memory before loading a tool.
- External launch from games clears prior workspace memory before loading Workspace Manager.
- Tool launch metadata is centralized in one SSoT.
- No tool uses default/fallback launch metadata.
- Existing labels and tile identities remain unchanged unless required for correct launch path.
- Validation report lists each touched launch path and the UAT click path.
