# PR_26179_ALFA_011 Manual Validation Notes

## Recommended Owner Checks

1. Start the local API/site using the approved developer command.
2. Open `toolbox/objects/index.html`.
3. Confirm Objects loads the Object Builder table.
4. Sign in as a Creator.
5. Add a Hero object and save.
6. Refresh the page and confirm the Hero remains.
7. Edit the object, save, refresh, and confirm the edit remains.
8. Delete the object, refresh, and confirm the table is empty.
9. Click Seed Starter Objects and confirm Hero, Projectile, and Wall appear.
10. Sign out, attempt a save, and confirm redirect to `account/sign-in.html`.

## Notes

- No fallback test lane was required because targeted validation passed.
- No runtime data is owned by the browser page.
