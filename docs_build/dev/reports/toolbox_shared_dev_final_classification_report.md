# Toolbox Shared Dev Final Classification Report

Task: `PR_26154_040-toolbox-shared-dev-final-classification`

## Summary

The active `toolbox/` tree now contains end-user tool folders and the first-class tool template only. Shared reusable code moved to `src/shared/toolbox/`, shared schemas moved to `src/shared/schemas/`, and development-only guard/debug tooling moved to `docs_build/dev/toolbox/`.

## Classification

| Previous Path | File Count | Classification | New Path | Action |
| --- | ---: | --- | --- | --- |
| `toolbox/shared/` | 99 | MOVE TO src | `src/shared/toolbox/` | Moved active reusable shared behavior, shared CSS, fixtures, pipeline helpers, runtime helpers, vector helpers, and tool host utilities. |
| `toolbox/schemas/` | 26 | MOVE TO src | `src/shared/schemas/` | Moved shared JSON schema contracts under source-owned shared contracts. |
| `toolbox/dev/` | 44 | MOVE TO docs_build | `docs_build/dev/toolbox/` | Moved development guards, debug command packs, debug console helpers, presets, plugins, and dev docs to build/dev ownership. |

## Path Rewiring

- Updated active imports and paths from `toolbox/shared/` to `src/shared/toolbox/`.
- Updated schema references from `toolbox/schemas/` to `src/shared/schemas/`.
- Updated development guard references from `toolbox/dev/` to `docs_build/dev/toolbox/`.
- Updated package scripts for shared extraction, phase 24 closeout, style-system, alias-ledger, and internal-barrel guards.
- Updated current docs_build references to the new ownership paths.
- Removed the UTF-8 BOM from `src/shared/schemas/tools/text2speech-V2.schema.json` so changed-file JSON parsing passes.

## Remaining Items

KEEP ACTIVE:

- `toolbox/tools-page-accordions.js` remains active because it renders the current Toolbox index grouping.
- `toolbox/_tool_template-v2/` remains active as the required first-class tool template source.

AMBIGUOUS, not moved in this stack:

- `toolbox/toolRegistry.js` and `toolbox/renderToolsIndex.js` remain because active source/tests still reference the registry-era metadata and renderer. They are not exposed as current Toolbox index UI, but moving them requires a separate registry/runtime reconciliation PR.

DELETE:

- No shared/dev/schema file was deleted solely because it moved. Deprecated-only Game Builder test material was archived with the builder reference bundle.

## Validation Notes

- `npm run check:shared-extraction-guard` passed after fixing the moved Object Vector schema URL to stay inside the `src` boundary.
- Changed-file JS syntax and JSON parsing passed for active changed files outside archive.
- A legacy asset ownership validator still targets retired `old_games/Asteroids`; it was not used as an active validation gate because this stack must not validate archived/deprecated games.
- Tests against `archive/v1-v2/` were not run.
- Full samples smoke test was skipped.
