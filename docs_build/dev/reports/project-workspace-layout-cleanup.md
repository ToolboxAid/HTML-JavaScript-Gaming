# Project Workspace Layout Cleanup

Stacked PR:
- PR_26155_059-project-workspace-layout-cleanup

## Summary

Reviewed Project Workspace after the wide layout rollout and kept the existing wide left/center/right tool shell intact.

No layout CSS was added or modified.

The center panel remains dominant through the existing approved Theme V2 wide layout classes:
- `container--tool-wide`
- `tool-workspace--wide`

## User-Facing Copy Cleanup

Reduced prominent implementation wording in user-facing areas:
- Replaced the meta description with plain Project Workspace purpose text.
- Replaced the page lede with project action/readiness copy.
- Replaced the overview paragraph with local project list copy.
- Renamed the project list aria label from `Mock projects` to `Projects`.
- Removed the left-column `Mock Repository Contract` accordion from the setup/workflow area.
- Replaced prominent `Mock` status/kicker/caption wording with plain project/readiness wording.
- Kept technical table/status information in the center output/report area, including `Repository Tables`.

Kept technical mock repository terminology in implementation/test-facing names where it is still accurate:
- `project-workspace-mock-repository.js`
- Project Workspace test lane/spec names

## Validation

Impacted lane:
- `project-workspace`

Skipped lanes:
- `workspace-contract` / `npm run test:workspace-v2` skipped because shared launch/layout wiring did not change.
- Full samples smoke test skipped because no games/samples changed.

Commands run:
- `node --check toolbox/project-workspace/project-workspace.js`
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `npm run test:lane:project-workspace`
- `git diff --check`

Results:
- Targeted Project Workspace lane passed: 6 tests.
- `git diff --check` passed.

Manual notes:
- Project Workspace still loads without console errors.
- Create, open, and delete behavior still works.
- Technical project table details remain available in the output/report area.
- No new CSS, page-local CSS, inline styles, or tool-local CSS were added.
