# Builder Consolidation Report

Task: `PR_26154_039-builder-consolidation`

Baseline: `PR_26154_038-docs-archive-test-output-cleanup`

## Summary

`toolbox/game-design/` is the authoritative active builder/planning surface. The duplicate active builder surfaces were removed from active Toolbox ownership and preserved under archive reference material.

## Classification

| Source | Classification | Action |
| --- | --- | --- |
| `toolbox/game-design/` | Belongs in game-design | Kept active as the single game planning/build design surface. |
| `toolbox/builder/` | Archive-only | Moved to `archive/v1-v2/tools/game-builder-reference/tool-builder/`. |
| `toolbox/game-builder/` | Archive-only | Moved to `archive/v1-v2/tools/game-builder-reference/game-builder/`. |
| `src/shared/contracts/tools/gameBuilderContract.js` | Archive-only builder contract | Moved to `archive/v1-v2/tools/game-builder-reference/contracts/gameBuilderContract.js`. |
| `tests/shared/tools/GameBuilderToolContract.test.mjs` | Deprecated-only builder contract test | Moved to `archive/v1-v2/tools/game-builder-reference/tests/GameBuilderToolContract.test.mjs`. |

## Active Wiring Updates

- Removed `game-builder` and `tool-builder` routes from `assets/theme-v2/js/gamefoundry-partials.js`.
- Removed Tool Builder and Game Builder from `assets/theme-v2/partials/header-nav.html`.
- Removed Tool Builder and Game Builder cards from `toolbox/tools-page-accordions.js`.
- Updated current references that described Game Builder as the downstream path:
  - `docs/faq.html`
  - `toolbox/game-design/index.html`
  - `admin/grouping-colors.html`
- Removed Game Builder from active Wave 3 contract/test fixtures:
  - `src/shared/contracts/tools/toolContractsIndex.js`
  - `tests/shared/Wave3ToolContractBaselineValidation.test.mjs`
  - `tests/fixtures/project-workspaces/projectworkspace-migration-governance-scenarios.json`
  - `tests/fixtures/project-workspaces/wave-3-tool-migration-scenarios.json`

## Reference Checks

PASS: active references to `toolbox/builder`, `toolbox/game-builder`, `tool-builder`, `game-builder`, `Tool Builder`, and `Game Builder` were removed outside archive/history/report paths.

PASS: no third builder concept was introduced.

PASS: reference material was preserved under `archive/v1-v2/tools/game-builder-reference/`.

## Validation Notes

- `node scripts/validate-active-tools-surface.mjs` passed after updating the validator to the current root Toolbox contract.
- `npm run test:workspace-v2` passed because active Toolbox navigation changed.
- Tests against `archive/v1-v2/` were not run.
- Full samples smoke test was skipped.
