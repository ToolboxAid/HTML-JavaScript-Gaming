# BUILD_PR_LEVEL_11_174_WIRE_SVG_HOSTED_ENTRY_TO_WORKSPACE_SHELL

## Purpose
Put the SVG Workspace tile issue to bed by wiring the actual SVG Asset Studio hosted entry path into `workspaceShell.js`.

## Proven Gap
The trace bundle and console logs prove:

- `workspaceShell.js` exists.
- Workspace Manager message bridge exists.
- `platformShell.js` still renders badges.
- SVG Asset Studio hosted entry does not start `workspaceShell.js`.

Therefore the missing piece is:

`toolbox/SVG Asset Studio/main.js`

Workspace shell was created, but SVG never enters it.

## Scope
One PR purpose only:
- In SVG Asset Studio, detect hosted Workspace mode and initialize `workspaceShell.js`.

Do not rewrite Workspace Manager.
Do not modify schemas.
Do not modify sample 1902 JSON.
Do not migrate all tools.
Do not add fallback data.
Do not add new hosted behavior to `platformShell.js`.

## Platform Shell Policy
`platformShell.js` is deprecated for Workspace-hosted tools.

Allowed in this PR:
- add or preserve hosted badge-block/deprecation guard only if needed to prevent the known bad write

Not allowed:
- adding new hosted Workspace behavior
- parsing SVG contracts
- writing hosted badges
- adding shared handoff logic
- adding fallback asset labels

## Implementation Requirements

### 1. SVG hosted mode detection
In `toolbox/SVG Asset Studio/main.js`, detect hosted Workspace mode using URL params:

- `hosted=1`
- `hostToolId=svg-asset-studio`
- `hostContextId` exists

### 2. Hosted SVG entry path
When hosted SVG mode is true:

- log `[SVG_HOSTED_WORKSPACE_ENTRY]`
- initialize `src/shared/toolbox/workspaceShell.js`
- pass or allow `workspaceShell.js` to read `window.location`
- do not initialize platformShell badge rendering for this hosted SVG instance

If the SVG tool still needs non-badge shell UI, keep it local to SVG or explicitly disable platformShell badge rendering. Do not route badge state through platformShell.

### 3. workspaceShell SVG contract
Ensure `src/shared/toolbox/workspaceShell.js` supports the SVG contract:

Payload:
- `payloadJson.vectorAssetDocument`

Loaded:
- true when `vectorAssetDocument.svgText` is a non-empty string

Asset label:
1. `vectorAssetDocument.sourceName`
2. `Inline SVG` if `svgText` exists without `sourceName`
3. `none` only when not loaded

Required log:
- `[WORKSPACE_SHELL_STATE]`

Required parent message:
- type: `tools:workspace-shell-state`

Required send log:
- `[SVG_POSTMESSAGE_SEND]`

### 4. Workspace Manager receive check only
Do not rewrite Workspace Manager.

Only verify or minimally patch that it already listens for:

`tools:workspace-shell-state`

Required receive log:
- `[SVG_POSTMESSAGE_RECEIVE]`

Required tile update log:
- `[SVG_TILE_WRITE]`

### 5. Prevent the known bad writer
The known bad writer is:

`platformShell.js renderToolAssetBadge(svg-asset-studio) -> label none`

For hosted SVG only, ensure this cannot run or cannot write.

If it is attempted, it must log:

`[PLATFORM_SHELL_DEPRECATED_HOSTED_BLOCK]`

and return without writing.

### 6. No legacy source of truth
Hosted SVG must not use:
- shared asset handoff
- vector map handoff
- platformShell badge renderer
- fallback sample asset names

Hosted SVG must use:
- hosted session context
- SVG contract payload
- workspaceShell normalized state
- Workspace Manager tile update from message

## Acceptance
Manual UAT on sample 1902:

Expected console:
- `[SVG_HOSTED_WORKSPACE_ENTRY]`
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`
- `[SVG_TILE_WRITE]`

Expected UI:
- SVG Asset Studio tile/badge shows:
  - `Asset: sample-0901-ship.svg`
  - or the actual `vectorAssetDocument.sourceName`

Not allowed:
- hosted SVG final badge says `Asset: none`
- platformShell writes hosted SVG `label: none`
- shared handoff vector-map asset controls SVG badge

## Validation
Run:
- `node --check "toolbox/SVG Asset Studio/main.js"`
- `node --check src/shared/toolbox/workspaceShell.js`
- `node --check src/shared/toolbox/platformShell.js`
- `node --check "toolbox/Workspace Manager/main.js"`

Full samples smoke:
- Skip.
- Reason: targeted SVG hosted-entry wiring; full samples smoke takes about 20 minutes and is not required.

## Report
Create:

`docs_build/dev/reports/pr_11_174_validation.md`

Include:
- files changed
- hosted SVG entry detection result
- whether platformShell hosted SVG badge render was blocked
- console proof logs
- targeted validation results
- full smoke skipped reason
