# PR_26177_ALFA_058-flat-project-tags Requirement Checklist

Generated: 2026-06-26 18:53:15 UTC

- PASS - Page title remains Tags and copy remains 'Manage shared Game tags for assets and tool records.'
- PASS - Flat tags only; no category table, UI, filtering, or category-owned seed data.
- PASS - Tool loads current Game Hub game context from the shared status bar/API path.
- PASS - Starter tags include current-game seed assignments for Demo Game in runtime seed state; static seed JSON keeps project assignments API-owned.
- PASS - Signed-in Creator can add a tag, assign it to the current game, remove it, refresh, reload, and see persistence.
- PASS - API/DB validation asserts project_tags and project_tag_assignments rows.
- PASS - Guest add/save/update/delete/assign/remove API actions return 401; browser guest save redirects to account/sign-in.html.
- PASS - Browser -> API -> Database path only; no browser product-data source of truth.
- PASS - No SQLite or tmp runtime dependency introduced.
- PASS - No mock-db-store expansion and no new *-mock-repository.js file added.
- PASS - DDL, DML, and seed artifacts remain under docs_build/database/ddl, dml, and seed paths.
