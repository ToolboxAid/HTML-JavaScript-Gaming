# PR_26177_ALFA_059-game-crew-foundation Requirement Checklist

Generated: 2026-06-26 18:44:40 UTC

- PASS - Game Crew is a human-testable tool, not a landing page.
- PASS - Tool shows the current Game Hub game context and matches the status bar selected game.
- PASS - Tool shows project owner and active member list.
- PASS - Signed-in Creator can add a Member through the API/DB path.
- PASS - Signed-in Creator can remove a Member through the API/DB path, and refresh/reload preserves removal.
- PASS - Roles remain limited to Owner and Member; invitations and permissions are not implemented.
- PASS - Guest add and remove actions redirect to account/sign-in.html in browser tests.
- PASS - Guest add and remove API writes return 401.
- PASS - project_members DDL uses users.key ownership/audit references.
- PASS - No SQLite, tmp runtime dependency, JSON source of truth, mock-db-store expansion, or new mock repository file was added.
