# PR_26127_003-workspace-manager-v2-layout-space-fix

## Scope
- Updated Workspace Manager V2 layout only.
- Kept Tools above Workspace Context.
- Kept tool grouping labels: Editors, Utilities, Viewers.
- Kept tile action labels: How To Use, Read Me, Samples (x).
- Did not modify deprecated `tools/workspace-v2`.
- Did not modify sample JSON.
- Did not add fallback behavior.

## Layout Notes
- Tools is now a compact accordion that sizes to the listed tool tiles instead of consuming extra panel height.
- Workspace Context is now a compact accordion containing only the active palette, asset registry, and launch context summary tiles.
- Workspace JSON is now a separate accordion that owns `#workspaceContextOutput` and can use the remaining center-panel space.
- The Workspace Context summary tiles keep consistent height while the JSON output is isolated from the summary control.

## Validation
- PASS: `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS: `npm run test:workspace-v2` completed with 24 passed tests.
- PASS: Scope check found no diffs under deprecated `tools/workspace-v2` or sample schema paths.
- SKIPPED: Full samples smoke test, per PR instructions. This PR is Workspace Manager V2 layout scoped.

## Manual Validation Notes
- Verified the center panel order is Tools, Workspace Context, then Workspace JSON.
- Verified Tools and Workspace Context do not use the shared open-accordion fill behavior.
- Verified Workspace Context JSON moved out of the Workspace Context accordion and into its own accordion section.
- Verified Workspace Manager V2 launch, import/export, UAT, and tool tile flows remain covered by `npm run test:workspace-v2`.
