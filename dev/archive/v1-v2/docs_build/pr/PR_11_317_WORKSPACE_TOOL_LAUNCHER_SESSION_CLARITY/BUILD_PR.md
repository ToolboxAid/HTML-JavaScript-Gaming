# BUILD_PR_11_317

## Implementation
- Updated Workspace V2 tools launcher button text to start in explicit no-session mode:
  - `Open Asset Manager V2 (no session)`
- Extended `computeWorkspaceSessionUiStateModel()` in `toolbox/workspace-v2/index.js` with:
  - `assetManagerLaunchReady`
  - `assetManagerLaunchLabel`
- Updated `renderWorkspaceSessionUiStateModel(model)` to:
  - disable launch when no valid active session payload is available
  - relabel button dynamically:
    - `Open Asset Manager V2 (active session)` when launch is session-routed
    - `Open Asset Manager V2 (no session)` when launch is blocked
- Preserved existing session-based launch path in `openAssetManagerFromWorkspace()` and did not alter producer/recent-session flows.

## Validation
- `node --check toolbox/workspace-v2/index.js`
- `node tests/runtime/V2WorkspaceAssetManagerLaunch.test.mjs`
