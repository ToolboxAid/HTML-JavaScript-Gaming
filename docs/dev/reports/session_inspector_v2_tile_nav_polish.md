# PR_26128_015 Session Inspector V2 Tile Nav Polish

## Summary
Session Inspector V2 storage tiles now show metadata only, and Return to Workspace now follows the workspace-launch nav pattern.

## Changes
- Removed raw JSON/value preview text from storage tiles.
- Kept tile metadata: storage key/name, storage type, value type, and byte size.
- Increased fixed tile height from 148px to 198px.
- Allowed long storage key names to wrap within the fixed tile.
- Moved `Return to Workspace` into a Session Inspector V2 workspace-only nav:
  - `class="session-inspector-v2__workspace-menu"`
  - `aria-label="Workspace actions"`
  - `data-launch-mode-nav="workspace"`
  - `button id="returnToWorkspaceButton"`
- Hid the workspace nav unless Session Inspector V2 is launched by Workspace Manager V2.
- Preserved fullscreen shell layout behavior from PR_014.
- Preserved per-tile Delete and Delete All behavior.

## Boundaries
- No cross-tool communication was added.
- Preview Generator V2 behavior was not changed.
- No sample JSON was modified.
- Roadmap content was not modified.

## Validation
- `npm run test:workspace-v2`: PASS, 14 tests passed.
- Verified storage tiles do not show raw JSON/value contents.
- Verified tile height is 198px, 50px taller than the prior 148px fixed tile.
- Verified long storage key names wrap inside the tile.
- Verified `Return to Workspace` appears in the workspace-only nav when launched from Workspace Manager V2.
- Verified `Return to Workspace` is hidden when Session Inspector V2 is launched standalone.
- Verified `Return to Workspace` returns to Workspace Manager V2 with launch context.
- Verified fullscreen still works.
- Verified per-tile Delete and Delete All still work.

## Skipped
Full samples smoke test was skipped as requested. This PR is scoped to Session Inspector V2 tile content, tile sizing, and workspace-launch navigation; sample runtime behavior is outside the changed surface.
