# PR_26177_ALFA_058-flat-project-tags Report

## Summary
- Built flat project tags as reusable project labels with no category table, category UI, grouped category filtering, or category-owned seed data.
- Added DB documentation artifacts for `project_tags` and `project_tag_assignments` under `docs_build/database/ddl`, `docs_build/database/dml`, `docs_build/database/seed`, and `docs_build/database/tags`.
- Updated the Tags tool to use the API repository only for tag CRUD and project assignment.
- Added duplicate prevention, assign/remove behavior, refresh persistence within the API-owned repository session, and guest write redirect to `account/sign-in.html`.

## Changed Areas
- Tags tool UI: `toolbox/tags/index.html`, `assets/toolbox/tags/js/index.js`.
- API/dev-runtime service contract: tags repository, server router repository mapping, mock DB schemas, provider contract table list.
- Database docs and seed: flat `project_tags` and `project_tag_assignments`.
- Targeted Playwright coverage for Tags and Admin DB table naming.

## Validation
- PASS: `node --check` on changed JS/MJS test/runtime files.
- PASS: `git diff --check`.
- PASS: `npx playwright test tests/playwright/tools/TagsTool.spec.mjs --workers=1 --reporter=line` (`3 passed`).

## Notes
- Product/runtime wording in the Tags UI uses `API`.
- No browser product-data source of truth was added.
- The Playwright Tags spec pins browser public config to the same-origin test API so workstation `.env` values cannot redirect the focused lane to an unrelated listener.
