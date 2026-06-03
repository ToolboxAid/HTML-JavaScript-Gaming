# PR_26126_113 Asset Manager Integration Notes

## Workspace Bridge
- `WorkspaceBridge` now accepts production session context only from Workspace Manager V2.
- Legacy Workspace V2-style context is rejected before Asset Manager V2 enters workspace mode.
- Palette swatches are read from Workspace Manager V2 `activePalette`, not from fallback query parameters.
- Preview context now carries `workspaceAssetsPath`, `workspaceGameId`, and `workspaceGameRoot`.

## Preview Path Integration
- Asset Manager V2 preview helpers resolve asset-backed preview URLs through the Workspace Manager-owned `assetsPath`.
- Workspace preview paths resolve under `/games/<game>/assets/...` when a valid session context is active.
- Missing or invalid Workspace Manager V2 preview context logs a visible Status failure.

## Asset Insert Integration
- Workspace insert continues to target the Workspace V2 asset schema location inside the active manifest payload.
- Insert success/failure messages are routed through Status and now identify the Workspace Manager V2 session path.
- The temporary `?workspace=UAT` path is unchanged and remains isolated for UAT-only testing.

## Scope
- Deprecated `toolbox/workspace-v2/` was not modified.
- Sample JSON was not modified.
- No samples/tools workspace roots were added.

