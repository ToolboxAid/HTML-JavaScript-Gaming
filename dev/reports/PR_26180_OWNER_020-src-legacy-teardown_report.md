# PR_26180_OWNER_020-src-legacy-teardown Report

## Executive Summary

PR_26180_OWNER_020 continues the root `src/` retirement work by removing legacy files that no longer have active runtime, API, dev script, validation, or test references. The PR preserves active root `src/shared/contracts/**`, `src/shared/projectDataStore/**`, and active schema files because they are still used by current dev validation/tests and require separate follow-up ownership moves.

No browser, API, database, or product behavior changes are introduced.

## Source Of Truth

- Base branch: `PR_26180_OWNER_019b-move-browser-shared-schemas-to-www`
- Workstream: Repository Architecture Simplification
- Audit source: PR017 src destination audit and PR019a contracts/schemas obsolescence audit
- Project Instructions version updated to `2026.06.28.020`

## Deleted Legacy Files

| File | Decision | Reason |
|------|----------|--------|
| `src/dev-runtime/admin/.gitkeep` | Deleted | Obsolete placeholder. Admin compatibility runtime now lives under `www/src/dev-runtime/admin/`. |
| `src/engine/README.md` | Deleted | Legacy empty-engine-era note, not an active architecture source. |
| `src/shared/debug/config.js` | Deleted | Old debug helper referenced only by archived v1-v2 material. No active runtime/test/script references. |
| `src/shared/debug/network.js` | Deleted | Old debug helper referenced only by archived v1-v2 material. No active runtime/test/script references. |
| `src/shared/debug/noopDevConsoleIntegration.js` | Deleted | Old debug helper referenced only by archived v1-v2 material. No active runtime/test/script references. |
| `src/shared/schemas/README.md` | Deleted | Legacy schema README superseded by active Project Instructions/governance. |
| `src/shared/schemas/tools/README.md` | Deleted | Legacy tool schema README superseded by active Project Instructions/governance. |

## Preserved Root src Files

| Path | Decision | Reason |
|------|----------|--------|
| `src/shared/contracts/**` | Preserved | Still actively imported by `dev/tests/shared/**` contract validation. |
| `src/shared/projectDataStore/**` | Preserved | Still actively imported by current project data store validation tests. |
| `src/shared/schemas/game.manifest.schema.json` | Preserved | Still actively referenced by current validation/tests. |
| `src/shared/schemas/samples/sample.tool-payload.schema.json` | Preserved | Still actively referenced by current validation/tests. |

## Legacy Pattern Audit

| Pattern | Result |
|---------|--------|
| `src/shared/debug/*` active references | PASS: no active references outside archive/report/workspace folders. |
| `src/engine/README` active references | PASS: no active references outside archive/report/workspace folders. |
| `src/shared/schemas/README` active references | PASS: no active references outside archive/report/workspace folders. |
| `src/dev-runtime/admin/.gitkeep` active references | PASS: no active references outside archive/report/workspace folders. |
| `www/src/tools/**` | Not present in this PR scope. |
| Protected dev workspace paths | PASS: no protected `dev/workspace/generated`, `zips`, or `tmp` files moved. |

Archive-only v1-v2 references to the removed debug helpers remain under `dev/archive/v1-v2/**`. They are historical reference material, not active runtime or validation dependencies.

## Shared Extraction Guard

`dev/tools/toolbox-dev/checkSharedExtractionGuard.baseline.json` was updated by removing the single baseline entry for deleted file `src/shared/debug/network.js`. No broad baseline regeneration was committed.

## Owner Recommendation

Proceed with this teardown PR. Remaining root `src/` files require follow-up PRs because active validation currently depends on them.
