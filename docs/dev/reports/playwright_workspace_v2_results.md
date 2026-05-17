# Playwright Workspace V2 Results

PR: PR_26133_087-grid-off-color-and-auto-center-balance

Command: `npm run test:workspace-v2`

Result: PASS

Summary:
- 54/54 Playwright tests passed.
- Final run completed in 6.1 minutes.
- Object Vector Studio V2 Grid-off state now asserts that only the Grid icon uses the disabled red Snap color while button text stays default.
- Auto Center coverage verifies the selected shape pivot moves to the visible object geometry bounds center, geometry JSON is unchanged, rendered bounds do not move, and workspace dirty state is set.
- Existing Object Vector Studio V2 console/page error assertions remained clean in the covered flows.

Manual/targeted verification notes:
- Grid off icon color matches disabled Snap Angle icon color.
- Auto Center uses visible object bounds, supports asymmetric geometry center balancing, and logs an OK status after successful pivot update.
- Auto Center changes transform origin/pivot only; geometry points are not modified and visible bounds remain stable.
