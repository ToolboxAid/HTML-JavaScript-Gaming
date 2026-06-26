# PR_26177_ALFA_058 Manual Validation Notes

## Reviewed
- Tags page renders as a flat Project Tags tool with no category UI.
- Add Tag opens an inline editor and saves through the API repository.
- Duplicate `hero` label is rejected after `Hero` exists.
- Usage expansion renders an empty-state row before assignment.
- Assign and Remove update the active project assignment count and inspector labels.
- Refresh preserves the assigned tag through the server-owned API repository session.
- Edit and delete update the table and counts.
- Guest write action redirects to `account/sign-in.html`.

## Not In Scope
- Applying database migrations to the developer workstation database.
- Category grouping, category filters, or category-owned seeds.
