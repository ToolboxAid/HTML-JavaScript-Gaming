# BUILD_PR_LEVEL_11_176_GUT_HOSTED_PLATFORM_BADGE_ROW

## Purpose
Remove the visible legacy hosted badge row that renders:

Vector Assets
SVG Asset Studio
Asset: none

This PR stops the user-visible bad state immediately while the Workspace-hosted contract shell migration continues.

## Proven Evidence
Console still shows:

- `platformShell.js renderToolAssetBadge`
- `toolId: 'svg-asset-studio'`
- `label: 'none'`

Console still does not show:
- `[SVG_HOSTED_WORKSPACE_ENTRY]`
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`

Therefore the current active bad UI is still produced by legacy platformShell badge rendering.

## Decision
For hosted Workspace Manager tools, `platformShell.js` must not render the legacy asset/palette badge row at all.

Do not try to fix the row.
Do not try to relabel the row.
Remove/gate the row for hosted Workspace tools.

## Scope
One PR purpose only:
- Hide/remove legacy platformShell asset badge row for hosted Workspace Manager tools.

Do not modify schemas.
Do not modify sample 1902 JSON.
Do not add fallback data.
Do not rewrite Workspace Manager.
Do not migrate all tools.
Do not add new hosted behavior to platformShell.

## Implementation Requirements

### 1. Hosted Workspace detection
In `tools/shared/platformShell.js`, detect hosted Workspace mode from URL params:

- `hosted=1`
- `hostContextId` exists
- `hostToolId` exists

### 2. Gut legacy badge row in hosted mode
When hosted Workspace mode is true:

- Do not render the asset badge row.
- Do not render `Asset: none`.
- Do not call/write badge text for hosted tools.
- Do not call shared asset/palette handoff reads for the badge row.
- Log once:
  `[PLATFORM_SHELL_HOSTED_BADGE_ROW_REMOVED]`

### 3. Preserve standalone/direct-open
When not hosted:
- preserve existing platformShell behavior.

### 4. Keep workspaceShell direction
Do not remove `workspaceShell.js`.
Do not connect platformShell and workspaceShell.
Do not import one into the other.

### 5. SVG-specific acceptance
For hosted SVG, the bad visible block must be gone:

Not allowed:
```
Vector Assets
SVG Asset Studio
Asset: none
```

Allowed temporary state:
- no legacy asset badge row
- Workspace Manager tile/card remains available
- SVG tool still loads or shows its own body

## Acceptance
Manual UAT on sample 1902:

- Open Workspace Manager.
- Mount SVG Asset Studio.
- The visible legacy platformShell badge row does not show `Asset: none`.
- Console does not show platformShell writing hosted `svg-asset-studio` badge label `none`.
- If platformShell detects hosted mode, it logs:
  `[PLATFORM_SHELL_HOSTED_BADGE_ROW_REMOVED]`
- Vector Map Editor still works.
- No new console errors.

## Validation
Run:
- `node --check tools/shared/platformShell.js`
- `node --check "tools/Workspace Manager/main.js"`
- `node --check "tools/SVG Asset Studio/main.js"`

Full samples smoke:
- Skip.
- Reason: targeted hosted platformShell badge-row removal; full samples smoke takes about 20 minutes and is not required.

## Report
Create:

`docs/dev/reports/pr_11_176_validation.md`

Include:
- files changed
- whether hosted badge row was removed
- whether standalone mode preserved
- targeted validation results
- full samples smoke skipped reason
