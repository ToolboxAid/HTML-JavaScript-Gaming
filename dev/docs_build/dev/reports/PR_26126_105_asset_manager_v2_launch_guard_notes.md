# PR_26126_105 Launch Guard Notes

## Guarded Launches
- Direct Asset Manager V2 launch without Workspace Manager context now shows the launch guard overlay before controls are mounted.
- Workspace Manager launch without an active palette now shows the same guard overlay.
- The temporary UAT-only `?palette=sample` context remains allowed and supplies the sample Asteroids game root for preview/path testing.

## Overlay Message
- The guard message states: `Asset Manager V2 is only available through Workspace Manager with a game workspace and palette.`
- The overlay also shows a reason line so direct launch, missing game context, invalid workspace payload, and missing palette cases can be distinguished during UAT.

## Path Field
- Asset Controls Path is now disabled and visibly grayed out like ID.
- Path remains generated from picker/import state and is not user-editable.

## Scope
- No sample JSON was modified.
