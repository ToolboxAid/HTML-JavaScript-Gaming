# BUILD PR_26170_011-friendly-metadata-vars

## Purpose

Rename safe metadata-adjacent helper names and implementation variables to match the approved friendly naming audit while preserving runtime behavior.

## Scope

- Rename Admin Invites browser API helper exports and imports from `Invitation` terminology to `Invite` terminology.
- Rename Admin Invites controller, methods, and local helper/test names to `Invite` terminology.
- Rename Account Creators/Responsibilities renderer helper names where the DOM contracts and database table names remain unchanged.
- Preserve existing routes, folders, API paths, table names, DOM data attributes, and persisted data keys.
- Do not introduce aliases, compatibility pass-through functions, or chained remapping variables.

## Out Of Scope

- Route or folder renames.
- Database schema/table/key renames.
- User-facing copy changes beyond names already applied in PR_26170_010.
- Navigation behavior changes.
- Full samples validation.

## Validation

- Verify current branch is `main`.
- Run `node --check` for touched JavaScript files.
- Run targeted static search to confirm old implementation helper names were removed.
- Run targeted Admin Invites Playwright validation because browser API helper names are imported by runtime page JavaScript.
- Do not run full samples.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26170_011-friendly-metadata-vars.md`
- `tmp/PR_26170_011-friendly-metadata-vars_delta.zip`
