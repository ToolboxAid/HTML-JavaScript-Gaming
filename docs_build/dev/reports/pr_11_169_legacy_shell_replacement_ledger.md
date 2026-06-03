# PR 11.169 Legacy Shell Replacement Ledger

## Result
Added `tools/shared/workspaceShell.js` as the contract-first hosted Workspace shell state reader.

The hosted Workspace shell is parallel to `platformShell.js`:

- `workspaceShell.js` does not import `platformShell.js`.
- `platformShell.js` does not import `workspaceShell.js`.
- Mutable shell state is not shared between the two shell modules.

## Hosted Shell Contract
`workspaceShell.js` reads hosted session context with:

- `readToolHostSharedContextFromLocation(window.location)`

It normalizes:

- `hosted`
- `toolId`
- `hostContextId`
- `payloadJson`
- `paletteJson`
- `loaded`
- `assetLabel`
- `paletteLabel`
- `statusLabel`
- `contractType`
- `errors`

## SVG Asset Studio Contract
Only `svg-asset-studio` is wired through the new hosted path in this PR.

Payload contract:

- `payloadJson.vectorAssetDocument`

Loaded proof:

- non-empty `vectorAssetDocument.svgText`

Asset label:

- `vectorAssetDocument.sourceName`
- `Inline SVG` when `sourceName` is missing but `svgText` exists
- `none` when hosted data is missing or not loaded

## Platform Shell Wiring
`tools/SVG Asset Studio/index.html` now selects the shell script at page load:

For hosted SVG Asset Studio:

- `workspaceShell.js` is imported
- `platformShell.js` is not imported
- shared asset handoff is not read
- legacy platformShell badge readers are not used
- badge active state is set only after hosted payload data is loaded

Standalone and non-hosted flows keep the existing shared handoff behavior.

## Files Changed
- `tools/shared/workspaceShell.js`
- `tools/shared/platformShell.js`
- `tools/SVG Asset Studio/index.html`
- `docs_build/dev/reports/pr_11_169_legacy_shell_replacement_ledger.md`

## Validation
- `node --check tools/shared/workspaceShell.js` - PASS
- `node --check tools/shared/platformShell.js` - PASS
- `node --check "tools/Workspace Manager/main.js"` - PASS
- `node --check "tools/SVG Asset Studio/main.js"` - PASS

## Manual UAT
Required browser check:

- Open sample 1902.
- Launch Workspace Manager.
- Mount SVG Asset Studio.
- Confirm SVG tile/badge shows the vector asset source name instead of `Asset: none`.

## Full Samples Smoke
Skipped.

Reason: targeted new workspace shell proof for one hosted tool; full samples smoke takes about 20 minutes and is not required.
