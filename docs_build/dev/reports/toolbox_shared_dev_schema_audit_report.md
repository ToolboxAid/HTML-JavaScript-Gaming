# PR_26154_038 Toolbox Shared Dev Schema Audit

## Scope

Audited:

- `toolbox/shared/`
- `toolbox/dev/`
- `toolbox/schemas/`

No toolbox shared/dev/schema files were moved in this PR because the audit found active references, validation ownership, or ambiguous ownership. No active reusable behavior was moved to `src/` because no file had clear, isolated ownership suitable for a surgical move.

## Inventory

| Area | Files | Non-doc referencing files | Classification |
| --- | ---: | ---: | --- |
| `toolbox/shared/` | 99 | 55 | Active/ambiguous shared tool behavior. |
| `toolbox/dev/` | 44 | 8 | Active/ambiguous development guard and debug tooling. |
| `toolbox/schemas/` | 26 | 34 | Active/ambiguous schema contracts. |

## `toolbox/shared/`

Active or ambiguous examples:

- `toolbox/shared/platformShell.js` and `toolbox/shared/platformShell.css` remain active toolbox shell support.
- `toolbox/shared/toolLaunchSSoT.js` and `toolbox/shared/toolLaunchSSoTData.js` remain active launch contract support.
- `toolbox/shared/pipeline/*` and vector/runtime asset helpers are imported by active tests and scripts.
- `toolbox/shared/samples/project-asset-registry-demo/*` is referenced by asset ownership validation, so it was not archived.

Recommended follow-up:

- Promote stable reusable runtime, manifest, asset, and validation behavior into `src/` only through a dedicated ownership PR with import rewiring and tests.
- Split active toolbox shell support from legacy registry/sample bridge support before archiving more of `toolbox/shared/`.

## `toolbox/dev/`

Active or ambiguous examples:

- Guard scripts are referenced by package scripts, tests, or other guard files.
- `checkInternalBarrelGuard.mjs` and `checkIntentionalAliasLedgerGuard.mjs` were updated only to ignore `archive/v1-v2/docs_build/archive/` and `tmp/test-results/`.
- Baseline JSON files still encode historical paths and should not be moved without changing the guard contract.

Recommended follow-up:

- Move durable governance/guard baselines into `docs_build/` only after the active guard scripts are updated to read from the new location.
- Keep active executable guard scripts under `toolbox/dev/` until a broader tooling-layout PR rehomes them.

## `toolbox/schemas/`

Active or ambiguous examples:

- `toolbox/schemas/game.manifest.schema.json` is referenced by validation scripts and schema tests.
- `toolbox/schemas/tools/*.schema.json` still supports active and historical tool contract checks.
- `src/engine/rendering/ObjectVectorRuntimeAssetService.js` references `toolbox/schemas/tools/object-vector-studio-v2.schema.json`, so schema ownership needs a runtime/schema PR before relocation.

Recommended follow-up:

- Decide whether active schemas should live under `src/shared/contracts`, `docs_build/`, or an active toolbox schema package.
- Do not archive schemas until active validation and runtime references have moved.

## Archive Actions

- Archived no `toolbox/shared/`, `toolbox/dev/`, or `toolbox/schemas/` files in this PR.
- Created no new `archive/v1-v2/tools/shared/` content in this PR because no file met the clear legacy-only threshold.

## Validation

- Ran targeted reference checks for `toolbox/shared`, `toolbox/dev`, and `toolbox/schemas`.
- Ran static validation for changed JS/config/doc files.
- Did not run tests against `archive/v1-v2/`.
