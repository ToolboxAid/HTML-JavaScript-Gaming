# PR_26155_038 Primary Navigation Order

## Summary

Set the primary top-level header navigation order exactly:
- Games
- Toolbox
- Marketplace
- Learn
- Account
- Admin

This order is now documented in `docs_build/dev/PROJECT_INSTRUCTIONS.md` as an explicit product information architecture exception to the alphabetical navigation rule.

## Sorting Rule Impact

Alphabetical sorting still applies to:
- Header submenus.
- Toolbox nested submenus.
- Account menu links.
- Admin menu links.
- Games menu links.
- Footer link lists.
- Browseable Learn lists.
- Browseable Toolbox group mode.

Documented intentional-order exceptions:
- Primary top-level header navigation.
- Workflow paths.
- Build Path.
- Dependency paths.
- Project Progress.
- Publishing Progress.
- Guided creator steps.

## Additional Text Cleanup

The common header validation found old standalone brand-suffix copy on the exact active pages under test. These labels were updated to `GameFoundryStudio` or current creator-facing names:
- `index.html`
- `games/index.html`
- `marketplace/index.html`
- `account/index.html`
- `admin/site-settings.html`

## Manual Test Notes

- Header order is Games, Toolbox, Marketplace, Learn, Account, Admin.
- Toolbox submenu groups remain alphabetical.
- Toolbox nested menu items remain alphabetical.
- Account, Admin, and Games submenu links remain alphabetical.
- Admin is not duplicated under Toolbox.
- Arcade remains a Games menu item only and is absent from Toolbox.

## Validation Notes

- `npm run test:workspace-v2` passed with 4 Playwright tests.
- `git diff --check` passed.
- No CSS was added or modified.
