# PR 11.176 Evidence

## Latest console evidence
The latest console log still shows legacy badge rendering for SVG:

- `platformShell.js`
- `renderToolAssetBadge`
- `toolId: 'svg-asset-studio'`
- `label: 'none'`

The log does not show hosted workspace-shell entry markers.

## Conclusion
The bad visible UI is still owned by `platformShell.js`.

## Correct short-term fix
Gut the hosted platformShell badge row for Workspace-hosted tools.

This avoids continuing to patch a deprecated UI row and removes the visible bad state while the workspace shell migration proceeds tool-by-tool.
