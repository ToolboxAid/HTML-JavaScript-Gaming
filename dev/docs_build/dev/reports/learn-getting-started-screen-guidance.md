# Learn Getting Started Screen Guidance

Stack item: PR_26155_055-learn-getting-started-screen-guidance

## Summary
- Added `learn/getting-started/index.html` as a Theme V2 wireframe page.
- Updated `learn/index.html` with a Getting Started card and link.
- Updated Learn future-state Playwright coverage to include the new page.

## Guidance Added
- Tools are built for 1440px and larger.
- 1440px is the minimum comfortable desktop width.
- 1920px is the ideal desktop width.
- Smaller screens may use stacked or collapsed panels later.

## Validation Notes
- Playwright impacted: Yes.
- Impacted lane: `project-workspace` plus legacy workspace-contract coverage for Learn future-state assertions.
- PASS: `npm run test:lane:project-workspace`.
- PASS: `npm run test:workspace-v2`; command name is legacy, user-facing language remains Project Workspace.
- PASS: `git diff --check`.
- Full samples smoke test: skipped because no samples or sample runtime behavior changed.

## Manual Test Notes
- Verified `learn/index.html` links to `learn/getting-started/index.html`.
- Verified `learn/getting-started/index.html` loads with shared Theme V2 header/footer structure.
- Verified the page includes the 1440px and 1920px guidance.
- Verified no video embeds, inline scripts, inline styles, or page-local CSS were added.
