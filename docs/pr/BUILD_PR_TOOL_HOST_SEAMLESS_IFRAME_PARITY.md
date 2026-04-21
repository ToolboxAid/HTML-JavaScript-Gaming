# BUILD_PR_TOOL_HOST_SEAMLESS_IFRAME_PARITY

## Purpose
Refactor Tool Host so hosted tool presentation is nearly identical to direct-launch presentation, with host-only controls/help contained inside the collapsible imported section.

## Scope
- Keep Tool Host HTML minimal.
- Move host-specific controls into the collapsible imported section.
- Remove host chrome wrappers around hosted iframe workspace.
- Keep hosted tool workspace full-width/full-height in normal page flow.
- Preserve `Open In Host` and direct launch behavior.
- Enforce no inline styles, no embedded style blocks, and no JS style-string injection.

## Exact Targets
- `tools/Tool Host/index.html`
- `tools/Tool Host/main.js`
- `tools/Tool Host/toolHost.css` (new)
- `tools/shared/toolHostRuntime.js`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/reports/validation_checklist.txt`

## Implementation Status (Execution-Backed)
- `[x]` Host controls moved into collapsible imported section in `tools/Tool Host/index.html`.
- `[x]` Host workspace simplified to iframe mount surface with no panel wrapper chrome.
- `[x]` Runtime iframe style injection removed from `tools/shared/toolHostRuntime.js`.
- `[x]` Link disabled state moved from JS inline styles to CSS class in `tools/Tool Host/main.js` + `tools/Tool Host/toolHost.css`.
- `[x]` No inline style attributes in Tool Host HTML target file.

## Validation Executed
1. `rg -n "style\." "tools/Tool Host/main.js" "tools/shared/toolHostRuntime.js"`
   - Result: no matches.
2. `rg -n "<style|style=" "tools/Tool Host/index.html"`
   - Result: no matches.
3. `rg -n "data-tool-host-(select|state-input|mount|prev|next|unmount|standalone|switch-meta|status|current-label|mount-container)" "tools/Tool Host/index.html"`
   - Result: expected host control and mount selectors present.

## Notes
- No color/token changes were introduced.
- No per-tool hacks were introduced.
- Tool Host-specific UI remains inside the collapsible section; collapsing it leaves a near-direct hosted surface.
