# Account Achievements Tab Sidebar Fix Report

PR: `PR_26155_003-account-achievements-tab-sidebar-fix`

## Scope
- Keep the Achievements default mode on Build.
- Ensure default visible content is Build / Created games only.
- Ensure Played games and shared content are hidden until their buttons are selected.
- Sort the short Account sidebar and shared Account menus alphabetically.
- Do not add CSS, inline styles, script blocks, or inline event handlers.

## Changes
- Added explicit `aria-controls` on Build, Play and Share buttons.
- Added explicit panel IDs and `aria-hidden` state to each Achievements panel.
- Updated the external tab script to keep `hidden` and `aria-hidden` in sync.
- Sorted Account sidebar links as:
  - Account Home
  - Achievements
  - Preferences
  - Profile
  - Security
- Sorted the shared header and footer Account menus to match the same order.
- Updated the targeted Achievements Playwright spec to verify:
  - Build is the default selected view.
  - Created games is visible by default.
  - Played games and Games I shared are hidden by default.
  - Clicking Play hides Build and Share content.
  - Clicking Share hides Build and Play content.
  - Sidebar links remain alphabetized.
  - Header and footer Account menus remain alphabetized.

## Validation
- PASS: `node --check assets/theme-v2/js/account-achievements.js`
- PASS: `node --check tests/playwright/account/AchievementsPage.spec.mjs`
- PASS: no inline script/style/event handlers in `account/achievements.html`
- PASS: no CSS files changed.
- PASS: `npx playwright test tests/playwright/account/AchievementsPage.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS: `git diff --check`

## Manual Test Notes
- Open `account/achievements.html`.
- Confirm Build is selected by default.
- Confirm only Build / Created games content is visible at load.
- Click Play and confirm only Played games content is visible.
- Click Share and confirm only Creator share analytics / Games I shared content is visible.
- Click Build again and confirm only Created games content is visible.
- Confirm the Account sidebar and header Account menu are alphabetized.
