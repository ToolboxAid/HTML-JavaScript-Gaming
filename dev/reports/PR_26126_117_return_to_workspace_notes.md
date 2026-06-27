# PR_26126_117 Return To Workspace Notes

- Asset Manager V2 `Return to Workspace` now includes the active `hostContextId` when navigating back to Workspace Manager V2.
- Workspace Manager V2 restores the active game from sessionStorage when `hostContextId` is present.
- Restored sessions repopulate the Asteroids selector, palette summary, asset registry summary, manifest JSON output, launch button, and Save button.
- Return no longer opens an empty/default Workspace Manager V2 page after Asset Manager V2 launch.
