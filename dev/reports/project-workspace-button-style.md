# Project Workspace Button Style

Stacked PR:
- PR_26155_058-project-workspace-button-style

## Summary

Updated the Project Workspace `Project Setup` action buttons so `Create Project` and `Delete Open Project` use the same existing Theme V2 button style.

Changed:
- `Create Project`: `class="btn primary"` to `class="btn"`
- `Delete Open Project`: unchanged, already `class="btn"`

No create/delete behavior changed.

## Validation

Impacted lane:
- `project-workspace`

Skipped lanes:
- `workspace-contract` / `npm run test:workspace-v2` skipped because no shared launch, navigation, or layout wiring changed.
- Full suite skipped because this bundle changed one Project Workspace page, its narrow script copy, and targeted Project Workspace assertions only.

Commands run:
- `node --check toolbox/project-workspace/project-workspace.js`
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `npm run test:lane:project-workspace`
- `git diff --check`

Results:
- Targeted Project Workspace lane passed: 6 tests.
- `git diff --check` passed.

Manual notes:
- Verified `Create Project` and `Delete Open Project` both use `btn`.
- Verified create/open/delete behavior through the targeted Playwright lane.
- Verified no inline styles or new CSS were introduced.
