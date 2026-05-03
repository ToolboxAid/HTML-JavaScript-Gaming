# PLAN_PR_11_313

## Purpose
Enable explicit Workspace V2 tool launching and rename Asset Browser V2 to Asset Manager V2 in user-facing UI while preserving `asset-browser-v2` contract IDs and payload/session rules.

## Scope
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`
- `tools/asset-browser-v2/index.html`
- `tools/asset-browser-v2/index.js`
- `tools/index.html`
- `tests/runtime/V2WorkspaceAssetManagerLaunch.test.mjs`
- PR docs/reports for this change

## Steps
1. Add an explicit Workspace V2 tools section/menu with a direct Asset Manager V2 launch control.
2. Wire direct launch from Workspace V2 to `asset-browser-v2` using active `payloadJson` without changing tool/session contracts.
3. Update user-facing labels from Asset Browser V2 to Asset Manager V2 (UI text/title only).
4. Keep `toolId` and `data-tool-id` as `asset-browser-v2`.
5. Add targeted runtime validation for launcher wiring and user-facing label/contract checks.
6. Run syntax checks and targeted workspace launch test only.
