Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_OVERLAY_OPERATOR_COMMANDS.md

# PLAN_PR_OVERLAY_OPERATOR_COMMANDS

## Goal
Define a sample-level, debug-only operator command surface for overlay panel control via Dev Console registry commands.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Scope
In scope:
- `overlay.*` command namespace and behavior contract
- public overlay/registry API usage only
- deterministic operator-readable command outputs
- safe failure handling for missing/invalid panel IDs
- sample-level validation target: `MultiSystemDemoScene.js`

Out of scope:
- engine core changes
- production runtime command surfaces
- direct console-to-overlay-internals coupling

## Boundary Contract
- Dev Console owns command/control.
- Debug Overlay owns passive telemetry/HUD rendering.
- Operator commands may query/toggle overlay panel state only through public runtime/registry APIs.

## Required Command Set
- `overlay.help`
- `overlay.list`
- `overlay.status`
- `overlay.show <panelId>`
- `overlay.hide <panelId>`
- `overlay.toggle <panelId>`
- `overlay.showAll`
- `overlay.hideAll`
- `overlay.order`

## Output Contract
- key-value and deterministic list rows
- stable ordering for panel lists (`order`, then `id`)
- explicit status/code for success and failure paths

## Validation Targets
- commands register under Dev Console command registry
- all required commands execute
- invalid panel IDs fail safely
- outputs remain deterministic
- no engine core changes
