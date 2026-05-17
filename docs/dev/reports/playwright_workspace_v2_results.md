# Playwright Workspace V2 Results

PR: PR_26133_091-transform-origin-grouping-and-layout-polish

Command: `npm run test:workspace-v2`

Result: PASS

Summary:
- 54/54 Playwright tests passed.
- Final full run completed in 5.5 minutes.
- Origin controls now render as `Origin X [input] Y [input] [Apply] [Auto]` for Object Transform and Shape Transform.
- Object Transform is focused on origin, rotate, scale, and resize; object-level Move was removed from the panel.
- Tools and Shapes are split into separate right-column accordions, with Palette, Tools, Shapes, Shape Geometry, Shape Transform, JSON Details, Dependency Details, and Status Log in the requested order.
- Grouped shape body selection remains single-shape; clicking the group icon selects the full group and updates the preview/list selection state.
- Shape Geometry and Shape Transform disable during multi-select.
- Existing console/page error assertions remained clean in the covered flows.

Targeted verification notes:
- Updated Playwright assertions cover origin row button ordering, Object/Shape Transform Snap Angle rotate controls, grouped-shape icon selection, multi-select disabled states, right-column accordion order, and Dependency Details wording.
- Numeric display normalization is covered through the Object Vector Studio V2 field rendering paths and transform/geometry input helpers.
