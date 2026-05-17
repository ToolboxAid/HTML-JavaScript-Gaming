# Object vs Shape Transform Verification

PR: PR_26133_093-game-only-manifest-origin-and-transform-fixes

Result: PASS

Verified behavior:
- PASS: Object Transform scale controls apply to every shape in the selected object without requiring Select All.
- PASS: Object Transform `++` / `+` / `-` / `--` controls are wired through the object transform scale input and update all selected-object shapes.
- PASS: Shape Transform scale applies only to the single selected shape and leaves sibling shapes unchanged.
- PASS: Shape Transform remains scoped to one selected shape, while Object Transform is object-wide.
- PASS: Group click-drag moves all shapes in the selected group by the same delta and preserves relative positions.
- PASS: `objectOrigin` and `shapeOrigin` are used by schema, manifest data, loader normalization, render paths, and save/export paths.
- PASS: scale input width fits `-xx.xxx`; Shape Geometry point x/y inputs fit `xx.xxx`; point rows remain on one line after padding reductions.
- PASS: `+ Trash` point-list header text is removed; per-row `[+]` point insert remains visible and wired.

Coverage/test evidence:
- Added focused Workspace Manager V2/Object Vector Studio V2 Playwright coverage for object-vs-shape transform scope, group drag movement, origin naming, game-only manifest persistence, and input layout checks.
- `npm run test:workspace-v2` passed with 54 tests.
- All game manifests validated against the updated game-only schema.
