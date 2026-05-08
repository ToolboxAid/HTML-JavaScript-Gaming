# PR_26128_014 Session Inspector V2 Shell Layout

## Summary
Session Inspector V2 now uses the shared V2 shell layout pattern for fullscreen and fixed session-entry tiles.

## Changes
- Added the shared `toolShellCommon.css` shell stylesheet.
- Reworked the tool body into a fullscreen root plus layout grid, matching the V2 shell pattern used by other tools.
- Added Session Inspector V2 shell behavior so the header/details toggle enters and exits fullscreen state.
- Pinned fullscreen side panels to the V2 shell side widths and kept the center panel stretched between them.
- Moved `Return to Workspace` into the header frame and removed it from the controls accordion.
- Changed session entries to fixed-size wrapping tiles laid out left-to-right and top-to-bottom.
- Kept each entry Delete button inside its fixed tile.
- Preserved per-entry Delete and Delete All storage behavior.

## Boundaries
- No cross-tool communication was added.
- Preview Generator V2 behavior was not changed.
- No sample JSON was modified.
- Roadmap content was not modified.

## Validation
- `npm run test:workspace-v2`: PASS, 14 tests passed.
- Verified Session Inspector V2 fullscreen shell enters and exits.
- Verified fullscreen left and right panels align to V2 side columns.
- Verified `Return to Workspace` is in the header and not duplicated in the controls accordion.
- Verified session entries render as fixed-size wrapping tiles.
- Verified each tile contains its Delete button.
- Verified per-item Delete removes the correct storage entry and refreshes the list immediately.
- Verified Delete All still clears displayed entries.
- Verified all Session Inspector V2 accordions still open and close.

## Skipped
Full samples smoke test was skipped as requested. This PR is scoped to Session Inspector V2 shell layout, fullscreen behavior, and storage tile layout; sample runtime behavior is outside the changed surface.
