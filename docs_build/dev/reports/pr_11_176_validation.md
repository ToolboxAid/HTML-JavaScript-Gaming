# PR 11.176 Validation

## Scope
Removed the legacy platformShell asset/palette badge row for Workspace-hosted tool iframes.

## Files changed
- `toolbox/shared/platformShell.js`
- `docs_build/dev/reports/pr_11_176_validation.md`

## Hosted badge row removal
`toolbox/shared/platformShell.js` now detects hosted Workspace mode with URL params:
- `hosted=1`
- non-empty `hostToolId`
- non-empty `hostContextId`

When hosted mode is detected in `renderToolAssetBadge(...)`:
- the badge row returns an empty string
- shared asset/palette handoff readers are not called for that row
- `Asset: none` is not written by the badge row
- `[PLATFORM_SHELL_HOSTED_BADGE_ROW_REMOVED]` is logged once per platformShell instance

## Standalone/direct-open behavior
Standalone and direct-open tools do not match the hosted Workspace detection gate, so the existing platformShell asset/palette badge rendering path is preserved for those flows.

## Architecture boundaries
- No schema changes.
- No sample 1902 JSON changes.
- No fallback labels added.
- No import between `platformShell.js` and `workspaceShell.js`.
- Workspace Manager was not rewritten.

## Validation
- PASS: `node --check toolbox/shared/platformShell.js`
- PASS: `node --check "toolbox/Workspace Manager/main.js"`
- PASS: `node --check "toolbox/SVG Asset Studio/main.js"`

## Manual UAT
Not run in this terminal session. Required browser UAT remains:
- Open sample 1902.
- Mount SVG Asset Studio.
- Confirm the legacy `Asset: none` badge row is gone.
- Confirm no platformShell hosted SVG badge write to `none`.
- Confirm Vector Map Editor still works.

## Full samples smoke
Skipped. Reason: targeted hosted platformShell badge-row removal; full samples smoke takes about 20 minutes and is not required.
