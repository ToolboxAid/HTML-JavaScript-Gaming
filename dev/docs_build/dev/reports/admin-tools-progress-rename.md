# Admin Tools Progress Rename

PR: PR_26155_090-admin-tools-progress-rename

## Summary
- Added Admin navigation entry `Tools Progress`.
- Added `admin/tools-progress.html` as a Theme V2 Admin planning page.
- Added `admin-tools-progress` to shared route rewriting in `assets/theme-v2/js/gamefoundry-partials.js`.
- No `Admin -> Project Progress` navigation exists in the affected shared header.

## Purpose
- Tools Progress is platform-development progress only.
- Tools Progress answers: `What should I build next for the platform?`
- Project completion remains separate under Project Build Path.

## Validation Notes
- Targeted Admin navigation checks are covered by `tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`.
- `npm run test:workspace-v2` passed because shared header navigation changed.
- Manual test notes: open `admin/tools-progress.html`, confirm the page loads, header Admin submenu includes Tools Progress, and Project Progress is absent from Admin navigation.
- No page-local CSS, tool-local CSS, inline styles, style blocks, or inline event handlers were added.
- Theme V2 gap findings: none.
