# PR_26146_042 Monolith Split Execution Report

## Source Audit

Source of truth:
- `docs_build/dev/reports/monolithic_test_code_audit.md`
- `docs_build/dev/reports/monolithic_test_split_candidates.md`

Split scope stayed limited to files classified by the PR_26146_041 audit as split-required, high-risk coupling, or broad accidental execution sources. No sample JSON was modified.

## Files Split

| Source file | New focused file | Audit reason | Split outcome |
| --- | --- | --- | --- |
| `tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs` | `tests/playwright/integration/GameIndexPreviewManifestBroadScan.spec.mjs` | Broad accidental execution source | The all-game thumbnail scan moved out of the targeted Pong manifest handoff spec. |
| `tests/playwright/tools/AssetManagerV2.spec.mjs` | `tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs` | Tool runtime file contained cross-surface tools index assertions | Tools index registration coverage now runs in the integration lane, not Asset Manager runtime coverage. |
| `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs` | `tests/playwright/tools/PaletteManagerV2Coverage.spec.mjs` | Preview Generator baseline owned unrelated Palette Manager runtime checks | Palette Manager runtime smoke now has its own tool-runtime spec. |
| `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs` | `tests/playwright/tools/ToolTemplateV2Baseline.spec.mjs` | Preview Generator baseline owned unrelated template shell checks | Tool Template baseline checks now have their own tool-runtime spec. |

## Routing Updates

| File | Change | Reason |
| --- | --- | --- |
| `scripts/run-targeted-test-lanes.mjs` | Added `PaletteManagerV2Coverage.spec.mjs` and `ToolTemplateV2Baseline.spec.mjs` to the tool-runtime lane. | Preserve existing tool runtime coverage after splitting Preview Generator. |
| `scripts/run-targeted-test-lanes.mjs` | Added `ToolsIndexFirstClassToolRegistration.spec.mjs` to the integration lane. | Move cross-surface tools index registration checks out of Asset Manager runtime coverage. |
| `scripts/run-targeted-test-lanes.mjs` | Removed the integration lane `--grep "Pong"` routing dependency. | The broad all-game scan is now isolated outside default targeted integration execution. |

## Before And After

| Area | Before | After |
| --- | --- | --- |
| Game index manifest coverage | Targeted integration relied on a grep to avoid the broad all-game scan. | Targeted integration runs explicit Pong handoff plus tools index registration specs; broad scan is isolated. |
| Asset Manager runtime spec | Included tools index registration assertions. | Asset Manager spec keeps Asset Manager runtime/workspace launch assertions only. |
| Preview Generator baseline | Included Palette Manager and Tool Template coverage. | Preview Generator spec keeps Preview Generator assertions; other tool checks are separate specs. |
| Tool runtime lane | One Preview Generator command mixed three tool surfaces. | Tool-runtime lane executes focused specs for Preview, Collision, Palette, and Template surfaces. |

## Validation Evidence

| Validation | Result |
| --- | --- |
| `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only` | PASS |
| `npm run test:playwright:structure` | PASS |
| `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime` | PASS, 16 Playwright tests passed |
| `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lane integration` | PASS, 4 Playwright tests passed after updating stale moved registration assertions |
| `node --check` on changed runner/spec files | PASS |

## Notes

The moved tools index registration test exposed stale assertions that were hidden by the previous grep-gated lane routing. The assertions were updated to validate current registration behavior: live Asset Manager and Collision Inspector cards are present, and live tools are not duplicated in the planned grid.
