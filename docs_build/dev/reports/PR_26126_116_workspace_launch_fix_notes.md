# PR_26126_116 Workspace Launch Fix Notes

- Workspace Manager V2 now builds a schema-valid workspace manifest as the launch context.
- Asset Manager V2 production launch receives the manifest through sessionStorage using `hostContextId`; no `?workspace=prod` path is supported.
- Asset Manager V2 launch validation now requires:
  - root workspace manifest shape
  - games-only `gameRoot`
  - matching `assetsPath`
  - `tools.palette-manager-v2.swatches`
  - `tools.asset-manager-v2.assets`
- Workspace nav in Asset Manager V2 now shows only `Return to Workspace`.
- `Return to Workspace` navigates back to `tools/workspace-manager-v2/index.html`.
- Direct launch and `?workspace=prod` remain blocked by the launch guard overlay.
