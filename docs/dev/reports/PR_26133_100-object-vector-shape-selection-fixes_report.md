# PR_26133_100 Object Vector Shape Selection Fixes

## Scope
- Read docs/dev/PROJECT_INSTRUCTIONS.md before changes.
- Preserved the existing Workspace manifest/schema contract.
- Limited implementation to Object Vector Studio V2 marker rendering and selected-shape z-order behavior, plus matching workspace-v2 coverage.
- PR_26133_099 delta reference was requested, but no matching tmp/PR_26133_099-storage-preview-workspace-followup_delta.zip was present; current integrated repo state was used as the prior baseline.

## Changes
- Shape origin/pivot marker now renders as an X and its visual span is doubled from 8px to 16px.
- Object origin/pivot marker now renders as a + and uses a doubled 16px visual span.
- Shape z-order actions in Objects > Shapes now apply to all currently selected shapes while preserving relative selection order.
- Locked shape protection, shape override remapping, and selected/direct-selected index remapping are preserved after multi-shape order changes.
- Workspace V2 Playwright coverage was updated for the new X/+ marker contract and doubled marker sizing.

## Targeted Object Vector V2 Validation
- PASS: object rotation path preserved; object origin marker is rendered separately from selected-shape pivot markers.
- PASS: shape rotation path preserved; selected shape origin marker remains tied to transformed bounds/origin and now renders as X.
- PASS: multi-selected shape z-order command moved selected rows together and preserved selection after reorder.
- PASS: marker structure and size verified in Playwright selectors: shape X span 16px, object + span 16px.

## Commands
- PASS: node --check tools/object-vector-studio-v2/js/ToolStarterApp.js
- PASS: node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
- PASS: git diff --check (CRLF advisory warnings only)
- PASS: npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "Object Vector Studio V2 layout shell|creates Object Vector Studio V2 shapes with canvas drawing"
- PASS: npm run test:workspace-v2 (56 passed)

## Notes
- Full samples smoke test was skipped per PR_26133_100 instructions.
- No workspace schema or manifest contract changes were made.
