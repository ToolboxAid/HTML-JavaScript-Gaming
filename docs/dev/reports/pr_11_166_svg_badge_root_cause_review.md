# PR 11.166 Review Report — SVG Badge Failure Root Cause

## Reviewed from repo dump
- `tools/shared/platformShell.js`
- `tools/Workspace Manager/main.js`
- `tools/shared/toolHostRuntime.js`
- `tools/shared/assetUsageIntegration.js`
- `tools/shared/toolHostSharedContext.js`

## Root cause
This is not an SVG data problem, not a schema problem, and not a sample 1902 problem.

The failure is a launch timing / ownership bug:
1. Workspace Manager reads the manifest tool payload.
2. Workspace Manager sees `vectorAssetDocument.svgText` and `vectorAssetDocument.sourceName`.
3. Workspace Manager writes a shared asset handoff for SVG Asset Studio.
4. Workspace Manager launches SVG Asset Studio in an iframe.
5. The iframe initializes `platformShell.js`.
6. `platformShell.js` treats the hosted iframe as a new launch and clears shared asset/palette handoffs.
7. The iframe then renders the badge and reads no shared asset.
8. Badge shows `Asset: none`.

## Keep / Delete / Wrong Owner

### KEEP
- Workspace Manager manifest payload discovery.
- Direct payload label derivation for `vectorAssetDocument.sourceName`.
- ToolHostRuntime explicit `payloadJson` launch contract.
- Hosted context storage with `hostContextId`.

### WRONG OWNER
- Hosted tool shell clearing shared bindings that were written by Workspace Manager for the hosted launch.

### INVESTIGATE AFTER PASS
- Prior probe logic that tries to re-derive SVG labels in multiple places. Do not delete broadly in this PR.

## Fix direction
Stop clearing shared handoffs from inside hosted iframe launches. Cleanup should remain for standalone/new top-level launches only.
