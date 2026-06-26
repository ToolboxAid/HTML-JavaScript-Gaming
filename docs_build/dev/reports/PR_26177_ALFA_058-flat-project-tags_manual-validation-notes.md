# PR_26177_ALFA_058 Manual Validation Notes

- Tags page title is `Tags` and copy reads `Manage shared Game tags for assets and tool records.`
- Tags are flat labels; no category UI or grouped category filter is rendered.
- Signed-in flow was validated by Playwright: add, duplicate validation, assign to active Game Hub game, refresh, reload, remove, edit, delete.
- Guest write flow redirects to `account/sign-in.html` before save.
- API guest write flow returns 401 and does not write product data.
- Active runtime no longer imports or creates the retired Tags/Game Design/Game Configuration mock repositories.
- Design and Configuration copies now refer to API persistence, not mock/in-memory repositories, because shared router wiring for these tools was corrected as part of the no-mock stack rework.
