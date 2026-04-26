# BUILD_PR_LEVEL_20_4_TOOL_LAUNCH_SSOT_AND_EXTERNAL_MEMORY_RESET

## Build Goal
Implement the smallest valid routing and launch-state cleanup change needed for UAT:
- all sample tool launches go to `tools/<tool>/index.html`
- all game launches go to `tools/Workspace Manager/index.html`
- external launches clear previous tool/workspace memory
- launch metadata is one SSoT
- no defaults/fallbacks remain for tools

## Required Codex Behavior
Codex must read and follow `docs/dev/codex_rules.md` before editing.

## Required File Discovery
Inspect only the minimum files needed:
1. `samples/index.html`
2. `games/index.html`
3. `tools/Workspace Manager/index.html`
4. Existing tool registry / manifest / launch helper files referenced by those pages
5. Existing roadmap file only if updating status markers

Do not scan the whole repo unless a referenced file requires following imports.

## Implementation Requirements
1. Find the current tile click handlers or launch metadata used by `samples/index.html`.
2. Find the current tile click handlers or launch metadata used by `games/index.html`.
3. Move duplicated launch target data into the smallest existing SSoT location if one exists.
4. If no SSoT exists, create one small repo-consistent launch metadata file in the existing tools/index/navigation area.
5. Ensure sample tool launches resolve to exact direct pages:
   - `tools/<tool>/index.html`
6. Ensure game launches resolve only through:
   - `tools/Workspace Manager/index.html`
7. Ensure external launches from samples or games clear prior persisted tool/workspace memory before loading the requested tool or workspace.
8. Remove every default/fallback tool launch path.
9. Missing tool/workspace launch metadata must fail visibly during validation and must not silently load another tool.
10. Preserve existing tile labels, order, and IDs unless a change is required for correct routing.
11. Update roadmap status only with `[ ] -> [.]` or `[.] -> [x]` if this PR maps to an existing roadmap line.
12. Write a validation report at:
    - `docs/dev/reports/tool_launch_ssot_external_memory_reset_validation.md`

## Anti-Pattern Requirements
Do not introduce:
- alias variables
- pass-through variables
- duplicate launch metadata
- duplicate state
- hidden fallback behavior
- route aliases
- duplicate event listeners
- broad truthy/falsy launch checks
- new frameworks or dependencies

## UAT Test Path Required In Report
The validation report must include these manual UAT paths:
1. Open `samples/index.html`.
2. Click at least one tool tile.
3. Confirm browser opens `tools/<tool>/index.html`.
4. Confirm previous tool/workspace launch memory is cleared first.
5. Return to `games/index.html`.
6. Click a game tile.
7. Confirm browser opens `tools/Workspace Manager/index.html`.
8. Confirm previous workspace memory is cleared first.
9. Confirm the requested game/workspace then loads from SSoT data.
10. Confirm no tool silently loads through a default/fallback.

## Completion Output
Codex must create a ZIP at:
`tmp/BUILD_PR_LEVEL_20_4_TOOL_LAUNCH_SSOT_AND_EXTERNAL_MEMORY_RESET.zip`

The ZIP must include all changed repo-relative files and no extra root folder.
