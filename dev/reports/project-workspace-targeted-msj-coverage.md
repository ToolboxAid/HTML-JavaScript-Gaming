# Project Workspace Targeted MSJ Coverage

Stacked PR:
- PR_26155_066-project-workspace-targeted-msj-coverage

## Impacted Lane

Impacted lane:
- `project-workspace`

Additional affected lane run because Toolbox role rendering changed:
- `workspace-contract` through the legacy command name `npm run test:workspace-v2`

## Coverage Added

Extended `tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs` to cover:
- Project Purpose options and active display.
- Project Member Role options and active display.
- Editing Project Purpose.
- Editing Current User Role.
- Capability Demo seed projects.
- Project create/open/delete behavior after the model changes.
- Reset/seed/clear mock data actions.
- Role-focused Toolbox filtering for Owner, Designer, Audio Creator, Viewer, and Admin views.

## Skipped Lanes

Skipped:
- Full suite
- Samples lane
- Archive/deprecated lanes

Rationale:
- No samples, archived content, engine runtime, parser, or real persistence behavior changed.
- Validation stayed on the directly affected Project Workspace and Toolbox contract lanes.

## Commands Run

- `node --check toolbox/project-workspace/project-workspace-mock-repository.js`
- `node --check toolbox/project-workspace/project-workspace.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `npm run test:lane:project-workspace`
- `npm run test:workspace-v2`
- `git diff --check`

Results:
- Project Workspace lane passed: 8 tests.
- Workspace-contract lane passed: 4 tests.
- `git diff --check` passed.
