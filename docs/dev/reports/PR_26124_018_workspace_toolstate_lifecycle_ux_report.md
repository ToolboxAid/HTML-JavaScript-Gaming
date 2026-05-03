# PR_26124_018-workspace-toolstate-lifecycle-ux

## Scope
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`
- `tests/playwright/workspace-v2.validation.spec.js`
- `tests/ui/workspace-v2.asset-manager.spec.js`

## Implementation Summary
- Moved Tool State Library UI into the Producer panel so Producer owns:
  - tool selector
  - toolState ID input
  - load/create/open/direct/promote actions
  - saved Tool State Library list
- Enforced named toolState lifecycle for Producer actions:
  - `Load Tool State` now requires a valid toolState ID, loads fixture payload, saves/overwrites `savedToolStates[toolStateId]`, sets it active, and opens the selected tool.
  - `Create & Open Tool State` now requires a valid toolState ID, saves a new `savedToolStates[toolStateId]` from active payload, sets it active, and opens the selected tool.
  - Added seeded generated toolState ID when the input is empty to support "provide or accept generated" workflow.
- Active promotion lifecycle:
  - `Promote Active Tool State to Tools` publishes to `tools.<toolId>`,
  - removes matching saved draft if present,
  - clears active workspace toolState after publish.
- Saved card promotion lifecycle:
  - each card `Promote to Tools` publishes to `tools.<toolId>` and removes the saved draft entry.
- Published Tools visibility:
  - kept visible `Published Tools` output,
  - excludes `workspace-v2`,
  - includes `palette-browser` and published non-palette tools,
  - added `Copy to Tool State` on each published non-palette tool to create a new saved draft without removing the published tool.
- Preserved constraints:
  - no `palette-manager-v2` toolState producer option,
  - no palette-manager promotion path,
  - no session wording reintroduced,
  - no sample JSON changes.

## Validation
- `node --check tools/workspace-v2/index.js` -> pass
- `node --check tests/playwright/workspace-v2.validation.spec.js` -> pass
- `node --check tests/ui/workspace-v2.asset-manager.spec.js` -> pass
- `npm run test:workspace-v2` -> pass (`20 passed`, `0 failed`)

## Full Samples Smoke
- Skipped intentionally. This PR is Workspace V2 + targeted Playwright coverage only and does not modify shared sample framework paths.
