# PR_26126_111 Workspace Manager V2 Bootstrap Notes

## Scope
- Added `tools/workspace-manager-v2/` as a first-class Workspace Manager V2 surface.
- Registered Workspace Manager V2 through `tools/toolRegistry.js`; `tools/index.html` renders it from the shared registry.
- Classified Workspace Manager V2 as a utilities tool in `tools/renderToolsIndex.js`.
- Added Workspace Manager V2 Playwright launch coverage under `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
- Updated `test:workspace-v2` to include the dedicated Workspace Manager V2 Playwright spec.

## Workspace Ownership
- Workspace Manager V2 owns a games-only context:
  - active game id
  - game root under `games/<game>/`
  - assets path under `games/<game>/assets`
  - active palette swatches read from the selected game manifest
  - schema-ready `tools.asset-browser.assets` registry context
- The bootstrap context does not include sample or tools workspace roots.
- Asset registry context starts as an empty schema-ready Asset Manager V2 registry so old Workspace V2 and legacy manifest asset records are not patched or remapped in this PR.

## Asset Manager V2 Launch
- Production launch uses sessionStorage host context only:
  - `launch=workspace`
  - `fromTool=workspace-manager-v2`
  - `hostContextId=<session key>`
- Workspace Manager V2 does not generate or support `?workspace=prod`.
- Asset Manager V2 direct `?workspace=prod` remains blocked by the launch guard overlay.
- Temporary `?workspace=UAT` behavior remains isolated to Asset Manager V2 UAT testing.

## Playwright Coverage
- Validates Workspace Manager V2 registration from `tools/index.html`.
- Validates game selection, palette summary, asset registry summary, session context output, and launch button enablement.
- Validates Asset Manager V2 launch through Workspace Manager V2 session context.
- Validates the direct `?workspace=prod` launch guard remains enforced.
