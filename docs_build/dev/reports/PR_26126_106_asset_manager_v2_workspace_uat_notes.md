# PR_26126_106 Workspace UAT Notes

## Launch Modes
- Asset Manager V2 now allows only Workspace Manager session launches or temporary `?workspace=UAT`.
- Direct launch without Workspace Manager session context hard-fails to the launch guard overlay.
- `?workspace=PROD` hard-fails to the launch guard overlay; production launch is only supported through Workspace Manager session state.

## Temporary UAT Context
- `?workspace=UAT` seeds the temporary Asset Manager V2 UAT session with `gameRoot = games/Asteroids/`.
- `?workspace=UAT` seeds `assetsPath = games/Asteroids/assets`.
- `?workspace=UAT` seeds the temporary UAT sample palette for Color asset validation and palette-only picking.
- Preview paths under UAT continue to resolve through `/games/Asteroids/assets/...`.

## Retired Query
- Removed the old sample-palette query source helper path, messages, tests, and report references.
- The isolated helper is now `TemporaryUatWorkspace.js`.
- No sample JSON was modified.
