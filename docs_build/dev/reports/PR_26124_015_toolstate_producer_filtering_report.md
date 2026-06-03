# PR_26124_015

## Scope
- `tools/workspace-v2/index.js`

## Changes
- Added `ensureSelectedToolStateProducerToolId()` to keep producer selection pinned to toolState-capable tools only.
- Updated producer actions to resolve tool ID through that guard:
  - `loadSelectedToolState()`
  - `createToolStateAndLaunch()`
- Added explicit fixture guard for missing `toolStateContext`.
- Removed asset-manager-only restriction when restoring by `hostContextId` URL so valid non-palette tool states restore correctly.
- Added producer fallback selection after workspace import when imported `activeToolId` is not selectable.
- Added launch-time `toolStateContext` validation before activation.

## Validation
- `node --check tools/workspace-v2/index.js` -> pass
- `npm run test:workspace-v2` -> pass (17 passed, 0 failed)

## Notes
- Targeted Workspace V2 validation was used.
- Full samples smoke test was skipped because this PR only changes Workspace V2 producer/filtering behavior and does not change shared sample framework code.
