# Project Workspace Panel Layout Polish

Stack item: PR_26155_051-project-workspace-panel-layout-polish

## Summary
- Moved `Readiness Output`, `Repository Tables`, and `Project Members` out of the right Inspector column.
- Placed those three output accordions in the center panel between `Static Overlay Wireframe` and `Missing Requirements`.
- Kept the left panel for setup/input, the center panel for primary project work and outputs, and the right panel for inspector status/logging.

## Validation Notes
- Impacted lane: `project-workspace`.
- PASS: `npm run test:lane:project-workspace`.
- PASS: `node --check toolbox/project-workspace/project-workspace.js`.
- PASS: `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`.
- PASS: `git diff --check`.

## Manual Test Notes
- Verified the center panel order is:
  - `Static Overlay Wireframe`
  - `Readiness Output`, `Repository Tables`, `Project Members`
  - `Missing Requirements`
- Verified the right column no longer contains the moved output accordions.
- Verified no console errors in the targeted Project Workspace lane.
