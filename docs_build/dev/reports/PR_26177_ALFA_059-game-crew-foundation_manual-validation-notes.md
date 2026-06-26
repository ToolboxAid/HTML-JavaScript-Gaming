# PR_26177_ALFA_059 Manual Validation Notes

- Game Crew remains a testable foundation tool: it loads the active game context, owner, and member list.
- Add/remove member actions use API/DB behavior and persist across refresh in the focused validation.
- Guest member actions redirect to `account/sign-in.html`; direct API writes return 401.
- Tags support add, assign to current game, remove from current game, refresh/reload persistence, edit, delete, and guest redirect on this branch.
- Active runtime no longer imports retired Tags/Game Design/Game Configuration mock repository files.
- The PR no longer changes `mock-db-store.js` or Admin DB viewer table wiring for the new Alfa tools.
