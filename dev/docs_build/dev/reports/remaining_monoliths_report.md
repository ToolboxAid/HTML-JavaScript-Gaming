# PR_26146_042 Remaining Monoliths Report

## Remaining Accepted Wrappers

| File or command | Classification | Reason | Action |
| --- | --- | --- | --- |
| `npm run test:workspace-v2` | Keep as compatibility wrapper | Routes through `node ./scripts/run-targeted-test-lanes.mjs --lane workspace-contract`. | Keep. |
| `npm run test:lane:*` | Already lane-safe | Explicit targeted lane entry points. | Keep. |
| `npm run test:lanes:preflight` and `npm run test:playwright:zero-browser` | Already lane-safe | Zero-browser preflight entry points. | Keep. |
| `npm run test:audit:locations` and `npm run test:playwright:structure` | Keep as compatibility wrappers | Broad static audits are zero-browser and intentionally diagnostic. | Keep. |

## Remaining Intentional Monoliths

| File | Classification | Reason | Required follow-up |
| --- | --- | --- | --- |
| `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` | Split required, high-risk coupling | PR_26146_041 identified a large mixed contract/runtime surface. It was not split here because safe separation requires a dedicated Workspace contract PR. | Yes: split Workspace contract, tool handoff, and unrelated runtime assertions in a dedicated PR. |
| `scripts/run-targeted-test-lanes.mjs` | Split required, high-risk coupling | This PR only updated lane definitions needed by the test split. Splitting the runner/report builders would be broader infrastructure work. | Yes: separate runner core, reporting builders, manifest/snapshot utilities, and CLI parsing in a dedicated PR. |
| `tests/playwright/tools/CollisionInspectorV2.spec.mjs` | Requires follow-up investigation | Audit noted possible game-fixture coupling, but current tool-runtime lane uses it as an explicit targeted tool fixture. | Optional: split only if a future audit finds cross-domain assertions. |
| `scripts/audit-playwright-test-locations.mjs` | Requires follow-up investigation | It intentionally owns broad zero-browser structural checks. No runtime broad execution occurs. | Optional: split report writing from ownership detection later. |
| `tests/playwright/integration/GameIndexPreviewManifestBroadScan.spec.mjs` | Intentional broad integration spec | The all-game thumbnail scan is now isolated from default targeted integration routing. | Optional: expose as explicit on-request lane if product owners want a named broad integration command. |

## Follow-Up Candidates

| Proposed PR | Scope |
| --- | --- |
| `workspace-v2-contract-spec-split` | Split `WorkspaceManagerV2.spec.mjs` into contract lifecycle, manifest handoff, toolState save/open, and true integration specs. |
| `targeted-runner-module-split` | Split `scripts/run-targeted-test-lanes.mjs` into lane definitions, validation cache, manifest/snapshot generation, execution, and report writers. |
| `structure-audit-module-split` | Split `scripts/audit-playwright-test-locations.mjs` into ownership detection, fixture detection, scoped discovery reporting, and filesystem scan reporting. |

## Accepted Scope Boundary

No stable compatibility wrapper was removed. No low-value cosmetic monolith was split. No game-specific behavior was moved into tool lanes, and no sample JSON was touched.
