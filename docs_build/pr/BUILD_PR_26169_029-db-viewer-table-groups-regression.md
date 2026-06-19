# BUILD PR_26169_029 DB Viewer Table Groups Regression

## Purpose

Fix the DB Viewer regression so the Admin DB Viewer renders table groups, configured table lists, schemas, relationships, and diagnostics from the shared DB adapter/source of truth instead of showing only a generic configured-data placeholder.

## Scope

- Restore DB Viewer initialization.
- Restore table group rendering.
- Restore configured table listing.
- Restore table schema, relationship, and diagnostic display where previously available.
- Keep DB Viewer under Admin.
- Do not move DB Viewer to Owner.
- Do not turn DB Viewer into a generic configured-data placeholder.
- Do not hardcode table lists as page-local source of truth.
- DB Viewer must read from the shared DB adapter/source of truth already used by the Mock DB / configured data system.
- Missing DB adapter/source must show visible actionable diagnostics.
- Empty DB source must render table headers/groups where schema is known, not a blank generic page.
- Preserve Admin/Owner navigation SSoT from PR_26169_023.
- Do not change unrelated Admin/Owner menu items.
- Do not change memberships, marketplace, AI credits, legal, notes, or storage behavior.

## Investigation Requirements

- Inspect DB Viewer route/page/script before editing.
- Inspect changes from PR_26169_023 and PR_26169_027/028 that may have replaced or bypassed DB Viewer initialization.
- Identify whether the regression is caused by:
  - wrong route/path
  - missing script import
  - wrong API client path
  - generic page shell replacing DB Viewer content
  - missing shared DB adapter call
  - navigation pointing to the wrong page
- Document the root cause in the PR report.

## Validation

- Verify current branch is `main`.
- Run `node --check` for all touched JavaScript files.
- Run targeted DB Viewer validation:
  - DB Viewer route resolves.
  - DB Viewer shows table groups.
  - DB Viewer shows table list.
  - DB Viewer shows known schemas or diagnostics.
  - Missing DB source shows visible diagnostic.
  - Empty DB source shows meaningful empty state.
- Run targeted Admin navigation validation if navigation is touched.
- Run Playwright if DB Viewer UI behavior changes.
- Do not run full samples smoke.
- Stop on failure.

## Required Reports

- `docs_build/pr/BUILD_PR_26169_029-db-viewer-table-groups-regression.md`
- `docs_build/dev/reports/PR_26169_029-db-viewer-table-groups-regression.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- Repo-structured ZIP artifact in `tmp/`.
