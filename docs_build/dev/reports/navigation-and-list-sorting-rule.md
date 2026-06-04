# PR_26155_034 Navigation And List Sorting Rule

## Summary

Added governance requiring navigation menus, submenus, nested submenus, and browseable user-facing lists to sort alphabetically.

Normalized safe active surfaces:
- Header top-level navigation.
- Header Games submenu.
- Header Toolbox group order.
- Header Toolbox nested tool submenus.
- Footer link lists inside each footer group.
- Toolbox grouped view rendering.
- Learn hub cards.
- Learn hub tool links.

## Sorting Exceptions

Documented intentional-order exceptions:
- Build Path remains dependency ordered: Project Workspace, Game Design, Game Configuration, Required Tool Path, Build Game, Game Testing, Publish.
- Project Progress and Publishing Progress remain progress/workflow ordered.
- Individual Learn tool page section order remains a guided documentation sequence: Overview, Quick Start, Common Tasks, Related Documentation, Related Videos, Examples.
- Header action buttons remain CTA ordered, not treated as navigation menus.

Footer group columns keep the existing product information architecture grouping, while each footer link list inside a group is alphabetically sorted.

## Manual Test Notes

- Toolbox renders with Order, Group, Progress, and Build Path controls visible.
- Group mode shows groups alphabetically: Account, Build, Content, Create, Media, Share, Test.
- Toolbox nested submenu items sort alphabetically inside each group.
- Account, Admin, and Games menus sort alphabetically.
- Learn hub browse cards and tool links sort alphabetically.
- Arcade remains absent from Toolbox.
- No duplicate Admin group appears under Toolbox.

## Validation Notes

- `node -c toolbox/tools-page-accordions.js` passed.
- `node -c toolbox/toolRegistry.js` passed.
- `node -c scripts/validate-active-tools-surface.mjs` passed.
- `node -c tests/playwright/tools/RootToolsFutureState.spec.mjs` passed.
- `node scripts/validate-active-tools-surface.mjs` passed.
- `node scripts/validate-tool-registry.mjs` passed.
- `npm run test:workspace-v2` passed: 3 Playwright tests.
- `git diff --check` passed.

## Theme V2 Gap Findings

None. No CSS was added or modified.
