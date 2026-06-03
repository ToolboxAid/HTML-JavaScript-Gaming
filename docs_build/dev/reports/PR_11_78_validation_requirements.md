# PR 11.78 validation requirements

- Record baseline count of remaining `src/shared/utils/` and `/src/shared/utils/` references.
- Rewrite all runtime/source references to shared utils.
- Re-run reference search and confirm zero remaining runtime/source hits.
- Open Workspace Manager and confirm no 404 for `src/shared/utils/invariant.js` or other moved utility files.
