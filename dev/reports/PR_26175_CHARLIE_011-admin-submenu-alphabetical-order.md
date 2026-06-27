# PR_26175_CHARLIE_011 Admin Submenu Alphabetical Order

## Scope

Team: Charlie

Purpose: Alphabetize the Admin submenu by visible menu labels only.

## Branch

- Continuation branch: `pr/26175-CHARLIE-010-system-health-history-and-closeout`
- Start gate: PASS
  - Current branch matched the expected Charlie continuation branch.
  - Worktree was clean before implementation.

## Changes

- Moved `Creators` into its alphabetical position in `src/api/admin-owner-navigation.js`.
- Preserved each Admin menu item label, path, route id, disabled state, and renderer behavior.
- Updated affected navigation tests that pin visible Admin menu label order.
- Added Playwright coverage of:
  - alphabetical visible label order
  - duplicate detection
  - duplicate href detection
  - each Admin submenu href opening with an HTTP status below 400

## Non-Changes

- No page files were renamed.
- No folders were renamed.
- No page content was modified.
- No routes, URLs, permissions, icons, IDs, CSS classes, Theme V2 styling, or event handlers were changed.
- No menu outside the Admin submenu was reordered.

## Validation Summary

- PASS: Admin labels are alphabetical.
- PASS: No duplicate Admin labels.
- PASS: No duplicate Admin hrefs.
- PASS: Every active Admin submenu item points to an existing page path.
- PASS: Every Admin submenu href opened with an HTTP status below 400 in the targeted Playwright navigation test.
- PASS: Targeted unit tests passed.
- PASS: Targeted Playwright navigation tests passed.

## Artifact

- `tmp/PR_26175_CHARLIE_011-admin-submenu-alphabetical-order_delta.zip`
