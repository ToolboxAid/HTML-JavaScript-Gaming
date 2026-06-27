# Project Journey Key Search Add Item Polish Report

PR: PR_26157_008-project-journey-key-search-additem-polish

## Summary
- Migrated Project Journey mock DB records to use `key` as the only ULID primary key SSoT.
- Updated note, item, template, type, activity, and repository relationships to use `projectKey`, `ownerKey`, `noteKey`, `typeKey`, and `templateKey`.
- Updated the Admin DB Viewer to display actual table field names, shorten ULID values to their first 10 characters, and expose the full key through hover/title text.
- Added Project Journey search across note names, note types, item titles, item details, system guidance, status labels/icons, linked tool contexts, and suggested tool text.
- Polished Add Item so user-created items can be titled before creation, default to Not Started unless a different status is selected, become selected immediately, and never create disabled system-owned blank rows.

## Validation Notes
- DB Viewer relationship checks now report key-based relationships and continue to show no missing-link or table-bleed diagnostics for valid seed data.
- Search filters the Summary Table and the selected Note Tree where applicable, and visible Statistics counts are recomputed from the filtered item set.
- Search clear restores the prior navigation/filter state, including a navigation-click state where no Summary Table row was selected.
- System-created titles and template guidance remain protected; system-created items remain non-deletable.
- User-created titles and Item Details remain editable, and user-created delete confirmation behavior is preserved.

## Constraints Checked
- No page-local CSS, tool-local CSS, inline styles, style blocks, inline script blocks, or inline event handlers were added.
- No archived V1/V2 files were modified.
- No `start_of_day` folders were modified.
- Full samples smoke was not run.
