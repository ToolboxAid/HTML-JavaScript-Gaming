# PR_26126_110 Workspace Launch Guard Notes

## Production Access
- Asset Manager V2 production access remains session/context based through Workspace Manager.
- The valid Workspace Manager session path is still covered by the Asset Manager V2 Playwright suite.
- Direct `toolbox/asset-manager-v2/index.html?workspace=prod` launch is treated as invalid.

## Temporary Access
- `?workspace=UAT` remains the only temporary URL-based Asset Manager V2 access path.
- The UAT path remains covered by the Asset Manager V2 Playwright suite.

## Validation
- Playwright validates `?workspace=prod` hard-fails to the launch guard overlay with `Temporary workspace prod is not supported.`
- Playwright validates valid Workspace Manager launch still opens Asset Manager V2 through session-backed context.
- No sample JSON was modified.
