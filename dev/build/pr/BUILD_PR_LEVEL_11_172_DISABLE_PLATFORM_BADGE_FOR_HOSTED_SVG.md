# BUILD_PR_LEVEL_11_172_DISABLE_PLATFORM_BADGE_FOR_HOSTED_SVG

## Purpose
Put the SVG Workspace tile issue to bed by removing the active bad writer from the hosted SVG path.

## Proven Failure
PR 11.171 logs prove the final active writer is:

`platformShell.js:1507 renderToolAssetBadge(svg-asset-studio) -> label none`

The logs also prove the new workspace path is not active:
- no `[WORKSPACE_SHELL_STATE]`
- no `[SVG_POSTMESSAGE_SEND]`
- no `[SVG_POSTMESSAGE_RECEIVE]`

Therefore, the fix is not another label resolver. The fix is to stop hosted SVG from using the platform-shell badge path at all.

## Correct Fix
For `svg-asset-studio` when launched as a Workspace Manager hosted iframe:

1. Do not initialize platform-shell badge rendering.
2. Initialize `workspaceShell.js` directly from the SVG tool entry path.
3. `workspaceShell.js` reads hosted session context.
4. `workspaceShell.js` creates normalized contract state.
5. Hosted SVG iframe posts that state to parent Workspace Manager.
6. Workspace Manager updates the SVG tile/badge from that message.
7. `platformShell.js` must not write `Asset: none` for hosted SVG.

## Hard Architecture Rule
`workspaceShell.js` and `platformShell.js` remain independent.

Codex must not:
- import `platformShell.js` into `workspaceShell.js`
- import `workspaceShell.js` into `platformShell.js`
- copy code between them
- share mutable state between them
- export platform shell helpers for workspace shell use
- route hosted SVG Workspace tile/badge state through platform shell
- use shared asset handoff as the hosted SVG source of truth

## Scope
One PR purpose only:
- Fix hosted SVG Workspace tile/badge by activating workspaceShell and disabling platformShell badge writes for hosted SVG.

Do not migrate all 17 tools in this PR.
Do not modify schemas.
Do not modify sample 1902 JSON.
Do not rewrite fullscreen/nav/header behavior.
Do not delete legacy code broadly.

## Implementation Requirements

### 1. SVG hosted-mode gate
In SVG Asset Studio entry/init file, detect hosted Workspace mode:

- `new URLSearchParams(window.location.search).get("hosted") === "1"`
- `hostToolId === "svg-asset-studio"`
- `hostContextId` exists

When true:
- initialize `workspaceShell.js`
- do not initialize platform-shell badge rendering for this hosted SVG instance

If platformShell must still initialize for non-badge UI, add an explicit option/flag so badge rendering is disabled for hosted SVG only.

Required effect:
- `renderToolAssetBadge(svg-asset-studio)` must not run for hosted SVG.
- The console must not show `platformShell.js ... renderToolAssetBadge ... toolId: 'svg-asset-studio', label: 'none'` for hosted SVG.

### 2. workspaceShell active path
Ensure `src/shared/toolbox/workspaceShell.js` is loaded and called by hosted SVG.

It must log or report:
- `[WORKSPACE_SHELL_STATE]`
- `toolId: "svg-asset-studio"`
- `contractType: "vectorAssetDocument"`
- `loaded: true`
- `assetLabel: sourceName`

### 3. SVG contract extraction
For hosted SVG:

Payload:
- `payloadJson.vectorAssetDocument`

Loaded:
- true only when `vectorAssetDocument.svgText` is a non-empty string

Asset label:
1. `vectorAssetDocument.sourceName`
2. else `Inline SVG`
3. else `none` only when not loaded

### 4. Parent message
Hosted SVG must post exactly one clear state message after normalized state is created:

Message type:
- `tools:workspace-shell-state`

Payload:
- normalized workspace state
- includes `toolId`
- includes `hostContextId`
- includes `loaded`
- includes `assetLabel`
- includes `contractType`

### 5. Workspace Manager tile update
In `toolbox/Workspace Manager/main.js`:
- listen for `tools:workspace-shell-state`
- accept only trusted/same-window child messages as currently appropriate for this app
- match by:
  - `toolId === "svg-asset-studio"`
  - `hostContextId`
- update only the SVG tile/badge
- set tile asset badge to `assetLabel` when `loaded=true`
- never replace this loaded label with `Asset: none` from legacy shared handoff

### 6. Prevent overwrite
After a loaded SVG workspace-shell state is applied:
- legacy platform-shell/shared handoff paths must not overwrite the SVG tile label
- if a legacy render tries to set `svg-asset-studio` to `none`, skip it in hosted Workspace mode and log:
  `[SVG_TILE_WRITE_BLOCKED_LEGACY]`

### 7. Trace proof
Keep or add concise proof logs for this PR only:
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`
- `[SVG_TILE_WRITE]`
- `[SVG_TILE_WRITE_BLOCKED_LEGACY]`

## Acceptance
Manual UAT on sample 1902:
- Workspace Manager loads accepted tools.
- Mount SVG Asset Studio.
- Console includes `[WORKSPACE_SHELL_STATE]` for `svg-asset-studio`.
- Console includes `[SVG_POSTMESSAGE_SEND]`.
- Console includes `[SVG_POSTMESSAGE_RECEIVE]`.
- SVG tile/badge shows `Asset: sample-0901-ship.svg` or the actual `sourceName`.
- Console does not show platformShell writing `svg-asset-studio` label `none` after loaded workspace state.
- If a legacy write attempts this, it is blocked and logged.
- Vector Map Editor still works.
- No new console errors.

## Validation
Run:
- `node --check src/shared/toolbox/workspaceShell.js`
- `node --check src/shared/toolbox/platformShell.js`
- `node --check "toolbox/Workspace Manager/main.js"`
- `node --check "toolbox/SVG Asset Studio/main.js"`

Full samples smoke:
- Skip by default.
- Document reason: targeted hosted SVG shell/tile source-of-truth fix; full samples smoke takes about 20 minutes and is not required.
