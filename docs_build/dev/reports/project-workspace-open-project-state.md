# Project Workspace Open Project State

Stack item: PR_26155_052-project-workspace-open-project-state

## Summary
- Removed the separate `Open` status label that appeared beside the active project row.
- Highlighted the currently open project button with the existing Theme V2 `btn primary` classes.
- Added `aria-current="true"` and `data-project-active="true"` to the active project button.
- Updated button text to include `(Active)` for the currently open project.

## Validation Notes
- Impacted lane: `project-workspace`.
- PASS: `npm run test:lane:project-workspace`.
- PASS: `git diff --check`.
- No DB, auth, cloud, persistence, or new CSS behavior was added.

## Manual Test Notes
- Verified `Open Demo Project` no longer has a separate `Open` label.
- Verified the active/open project is indicated directly on the button.
- Verified create, open, and delete project behavior still works.
