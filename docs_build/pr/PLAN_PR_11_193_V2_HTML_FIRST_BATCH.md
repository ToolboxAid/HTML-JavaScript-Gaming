# PLAN_PR_11_193_V2_HTML_FIRST_BATCH

## Purpose
Batch the next V2 re-engineer corrections into one larger, testable PR so Codex has a clearer target and fewer rapid micro-PR handoffs.

## Scope
Apply the HTML-first V2 tool shell rule across the active V2 lane:

- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2
- Tilemap Studio V2
- Asset Browser V2

## Required Direction
This is a re-engineer lane, not a copy/paste lane.

Codex must not copy old v1 implementation blocks into the V2 tools. Use the existing behavior only as reference for expected user-visible behavior, not as source structure.

## Non-Negotiable Rules
- V2 tool names must end with `V2`.
- V2 tool ids and folders must end with `-v2`.
- `tools/<tool>-v2/index.html` owns static shell/layout/CSS links/header mount.
- `tools/<tool>-v2/index.js` owns behavior only.
- No JS-driven full body replacement.
- No JS-driven stylesheet injection.
- No dynamic header script injection from tool JS.
- Use `<div id="shared-theme-header"></div>` in every V2 `index.html`.
- Use `../../src/engine/theme/mount-shared-header.js` from every V2 `index.html`.
- No `platformShell`.
- No `tools/shared/*`.
- No Workspace Manager v1 wiring.
- No schema changes.
- No sample changes.
- No game changes.
- No legacy tool patching.

## Acceptance
- Each active V2 tool has a static `index.html` shell.
- Each active V2 `index.js` starts from existing DOM nodes and does not create the whole page shell.
- Each active V2 tool renders the shared theme header from `#shared-theme-header`.
- Empty/session/error states still work.
- Targeted syntax checks pass.
- Full samples smoke test is skipped with reason documented.
