# PR_26124_018-clarify-tools-vs-toolstate-ux

## Scope
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`
- `tests/playwright/workspace-v2.validation.spec.js`
- `tests/ui/workspace-v2.asset-manager.spec.js`

## Changes
- Producer area clarity updates:
  - Added `Create Direct Tools Entry` action.
  - Added copy clarifying `tools.<toolId>` vs `activeToolState`.
- Added direct publish behavior:
  - validates selected producer toolState payload
  - writes payload directly to `tools.<toolId>`
  - does not create `activeToolState`
  - does not create `savedToolStates` entry
- Active toolState area clarity updates:
  - renamed output section to `Active Workspace Tool State`
  - added publish status line with explicit states:
    - `Active in Workspace only`
    - `Promoted to tools.<toolId>`
- Tool State Library:
  - kept per-card `Promote to Tools` action as explicit promotion path.
- Published tools visibility:
  - `Published Tools` list shown in Import/Export section
  - excludes `workspace-v2`
  - includes `palette-browser` and promoted tool entries.
- Playwright assertions updated for the new `Published Tools` semantics and direct publish status.

## Validation
- `node --check tools/workspace-v2/index.js` -> pass
- `node --check tests/playwright/workspace-v2.validation.spec.js` -> pass
- `node --check tests/ui/workspace-v2.asset-manager.spec.js` -> pass
- `npm run test:workspace-v2` -> pass (`20 passed`, `0 failed`)

## Notes
- Full samples smoke test was skipped because this PR is limited to Workspace V2 UI/UX clarification and Playwright coverage in the Workspace V2 lane.
