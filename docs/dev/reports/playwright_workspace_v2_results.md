# Playwright Workspace V2 Results

PR: PR_26133_092-object-vector-layout-transform-and-origin-schema-fixes

Command: `npm run test:workspace-v2`

Result: PASS

Summary:
- 54/54 Playwright tests passed.
- Final full run completed in 6.7 minutes.
- Duplicate inner Object Transform and Shape Transform panel titles are removed.
- Tools now contains only Snap Grid, Snap Angle, Grid, and Words; Shapes contains only select/creation tools.
- Selected object shape lists and shape ordering/group controls render back under Objects > selected Object > shapes.
- Object-level origin persists through schema, manifest, loader normalization, Object Transform Apply, and Auto controls while shape-level origin remains separate.
- Grid on/off icons use nf-md-grid and nf-md-grid_off, with the off icon using the disabled red icon color only.
- Object Transform summary no longer shows mixed x/y move values when object Move is not supported.
- Existing console/page error assertions remained clean in the covered flows.

Targeted verification notes:
- Updated Playwright assertions cover Tools/Shapes accordion membership, shape list placement under selected object tiles, restored shape action controls, object-level origin schema/default support, grid icon state, Object Transform summary wording, and Object/Shape Transform duplicate-title removal.
- Focused reruns were used while repairing stale selectors, then the full workspace-v2 suite passed.
