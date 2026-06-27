# Guest Role View

Stack item: `PR_26155_022-guest-role-view`

## Summary

- Added Guest as the default public Toolbox role.
- Supported URL roles are `?role=guest`, `?role=user`, and `?role=admin`.
- Guest banner text is `GUEST VIEW • Preview only • Sign in to create`.
- Creator banner text is `CREATOR VIEW • Project tools enabled • Switch to Admin View`.
- Admin banner text is `ADMIN VIEW • Planned tools visible • Switch to Creator View`.
- Banner links continue to switch Guest -> Creator, Creator -> Admin, and Admin -> Creator.

## Behavior Notes

- Guest and Creator views show the same current public preview-safe tool set because the Toolbox remains a static wireframe surface with no login, database, save, or create runtime behavior.
- Admin view continues to reveal planned, hidden, and admin-only tool tiles.
- No login, auth, DB, persistence, or real save/create behavior was added.

## Validation Notes

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- Ran `node scripts/validate-active-tools-surface.mjs`: passed.
- Ran `node scripts/validate-tool-registry.mjs`: passed.
- Ran `npm run test:workspace-v2`: passed. This is a legacy command name for the Project Workspace validation lane.

## Manual Test Notes

- `/toolbox/index.html` defaults to Guest view.
- `/toolbox/index.html?role=guest` shows the Guest banner and no admin-only tiles.
- `/toolbox/index.html?role=user` shows the Creator banner and no admin-only tiles.
- `/toolbox/index.html?role=admin` shows the Admin banner and planned/admin tiles.
- No console errors were reported by the targeted Playwright coverage.
