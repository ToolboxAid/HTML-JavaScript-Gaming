# PR_26155_016 Toolbox Final Name Cleanup

## Scope

- Applied final active Toolbox labels:
  - Palette / Colors
  - Storage
  - Audio
  - Input Mapping
- Updated active registry ids/routes where safe:
  - `palette`
  - `storage`
- Updated shared header navigation, route map, tool display slugs, Toolbox index cards, progress model keys, and Build Path references.
- Kept `GameFoundryStudio` as the only allowed product token containing the protected naming word.

## Validation Notes

- PASS: `node scripts/validate-active-tools-surface.mjs`.
- PASS: `node scripts/validate-tool-registry.mjs`.
- PASS: focused active Toolbox scan for final labels and ids.
- PASS: `npm run test:workspace-v2` using the legacy command name for the Project Workspace test lane.
- PASS: targeted browser page sweep for the Toolbox index and renamed pages.
- PASS: no CSS files appear in `git diff --name-only -- '*.css'`.
- PASS: `git diff --check`.

## Manual Notes

- Toolbox cards show the final labels.
- Header Toolbox navigation shows the final labels.
- No Arcade tile appears in the Toolbox surface.
- No database, persistence, save/load, or real tool behavior was added.
