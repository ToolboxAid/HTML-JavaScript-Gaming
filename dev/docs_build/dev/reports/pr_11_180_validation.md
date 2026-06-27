# PR 11.180 Validation

## Scope
Added launch and entry trace logging to prove/fix the hosted SVG launch path into `toolbox/SVG Asset Studio/main.js` and the hosted workspace shell branch.

## Files changed
- `toolbox/Workspace Manager/main.js`
- `toolbox/SVG Asset Studio/main.js`
- `docs_build/dev/reports/pr_11_180_validation.md`

## Workspace Manager launch logs
`toolbox/Workspace Manager/main.js` now logs `[WORKSPACE_TOOL_LAUNCH]` after `runtime.launch(...)` for every mounted tool using the actual returned iframe URL/source URL.

The launch log includes:
- requested tool id
- normalized mounted tool id
- iframe URL
- `hosted` URL param
- `hostToolId` URL param
- `hostContextId` URL param
- payload presence
- payload keys

For `svg-asset-studio`, Workspace Manager also logs `[SVG_LAUNCH_REQUEST]` with:
- iframe URL
- hosted URL params
- `payloadJson.vectorAssetDocument` existence
- `sourceName`
- SVG text length

## SVG entry log
`toolbox/SVG Asset Studio/main.js` now logs `[SVG_ENTRY_TOP]` at module top before hosted branch detection.

The entry log includes:
- `location.href`
- `hosted`
- `hostToolId`
- `hostContextId`

The hosted guard still requires:
- `hosted=1`
- `hostToolId=svg-asset-studio`
- non-empty `hostContextId`

When the guard matches, SVG still logs `[SVG_HOSTED_WORKSPACE_ENTRY]` and calls `initWorkspaceShell(window.location, document)`.

## Legacy path boundaries
- Shared handoff logic was not restored.
- platformShell badge writes were not restored.
- No schemas were changed.
- No sample JSON was changed.

## Validation
- PASS: `node --check "toolbox/Workspace Manager/main.js"`
- PASS: `node --check "toolbox/SVG Asset Studio/main.js"`
- PASS: `node --check toolbox/shared/workspaceShell.js`
- PASS: `node --check toolbox/shared/platformShell.js`

## Manual UAT
Not run in this terminal session. Required browser UAT remains:
- Open sample 1902.
- Click/mount SVG Asset Studio.
- Confirm logs: `[WORKSPACE_TOOL_LAUNCH]`, `[SVG_LAUNCH_REQUEST]`, `[SVG_ENTRY_TOP]`, `[SVG_HOSTED_WORKSPACE_ENTRY]`, `[WORKSPACE_SHELL_STATE]`, `[SVG_POSTMESSAGE_SEND]`, `[SVG_POSTMESSAGE_RECEIVE]`.
- Confirm SVG tile shows sourceName, not `Asset: none`.

## Full samples smoke
Skipped. Reason: targeted SVG launch path and hosted entry verification; full samples smoke takes about 20 minutes and is not required.
