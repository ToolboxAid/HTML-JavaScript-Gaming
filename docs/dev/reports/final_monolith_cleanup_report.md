# PR_26146_043 Final Monolith Cleanup Report

Generated: 2026-05-26
Status: PASS

## Source Of Truth

This closeout uses these reports as the source of truth:
- `docs/dev/reports/monolithic_test_code_audit.md`
- `docs/dev/reports/monolithic_test_split_candidates.md`
- `docs/dev/reports/monolith_split_execution_report.md`
- `docs/dev/reports/remaining_monoliths_report.md`

No sample JSON was modified.

## Removed Obsolete Wrappers

| Removed wrapper | Replacement | Reason |
| --- | --- | --- |
| `npm run test:asset-manager-v2` | `npm run test:lane:tool-runtime` | The direct Playwright shortcut bypassed the targeted runner, zero-browser preflight, manifest validation, warm-start reuse, and lane ownership checks. The covered Asset Manager assertions remain in the tool-runtime lane. |
| `npm run test:preview-generator-v2` | `npm run test:lane:tool-runtime` | The direct Playwright shortcut became obsolete after Preview Generator, Palette Manager, and Tool Template coverage were split into focused tool-runtime specs. |

## Removed Fallback Paths

| Area | Before | After |
| --- | --- | --- |
| Lane manifest inputs | A lane with no `discoveryTargets` could fall back to command-derived targets. | `laneDiscoveryTargets()` now returns only explicitly declared lane targets. |
| Engine/src lane | Node test inputs were inferred from the command list. | Engine/src test inputs are declared in `discoveryTargets`. |
| Samples lane | Sample test inputs were inferred from the command list when the lane was selected. | Samples test inputs are declared in `discoveryTargets`, while runtime remains gated by `--include-samples`. |
| Runner preflight | Command targets were validated for existence and lane path only. | Runner preflight now also fails if any command target is missing from the lane manifest target list. |

## Preserved Intentional Wrappers

| Preserved wrapper | Reason |
| --- | --- |
| `npm run test:workspace-v2` | Compatibility entry that routes through `workspace-contract`; it no longer launches Playwright directly. |
| `npm run test:lane:*` | Authoritative targeted lane entry points. |
| `npm run test:lanes` | Safe no-lane mode; no runtime lanes execute without an explicit lane or `--all`. |
| `npm run test:lanes:preflight` and `npm run test:playwright:zero-browser` | Zero-browser preflight entry points. |
| `npm run test:audit:locations` and `npm run test:playwright:structure` | Explicit static broad audits; zero-browser only. |
| `npm run test:lane:samples` | Explicit samples lane wrapper; still requires `--include-samples` and is not full samples smoke. |

## Final Routing Architecture

Targeted lanes are the authoritative default. Package test routing now has no direct `playwright test` shortcuts outside `test:lane:*`; browser-backed PR validation goes through `scripts/run-targeted-test-lanes.mjs`.

Static broad discovery remains available only through explicit zero-browser audit commands. Runtime broad execution remains explicit/on-request only through opt-in commands such as `--all`, the isolated broad integration spec file, or the existing runtime smoke commands.

Deterministic setup failures stop before browser/runtime startup through lane registration, runner preflight, scoped discovery, manifest input validation, warm-start validation, snapshot validation, lane compilation, and dependency gating.

## Preserved Broad/Expensive Tests

| Test or command | Status | Reason |
| --- | --- | --- |
| `tests/playwright/integration/GameIndexPreviewManifestBroadScan.spec.mjs` | Preserved, explicit/on-request | All-game thumbnail coverage is isolated from the targeted integration lane. |
| `npm run test:launch-smoke` | Preserved, explicit/on-request | Runtime launch smoke remains outside targeted Playwright lanes. |
| `npm run test:launch-smoke:games` | Preserved, explicit/on-request | Broad game runtime launch smoke remains intentional. |
| `npm run test:workspace-manager:games` | Preserved, explicit/on-request | Workspace/game runtime command remains outside default targeted validation. |
| `npm run test:manifest-payload:games` | Preserved, explicit/on-request | Game manifest payload validation remains explicit. |
| `npm run test:sample-standalone:data-flow` | Preserved, explicit/on-request | Sample-related runtime validation remains outside default samples/full smoke. |

## Before And After

| Area | Before | After |
| --- | --- | --- |
| Tool shortcuts | Two direct Playwright scripts bypassed the lane runner. | Tool runtime coverage is reached through `test:lane:tool-runtime`. |
| Manifest source of truth | Some non-Playwright lanes could infer manifest tests from command arguments. | Every lane target used for validation is explicitly declared. |
| Broad fallback | Command-derived target fallback could mask an incomplete lane manifest. | Incomplete manifests fail deterministically before runtime. |
| Direct Playwright routing | Package scripts still exposed direct single-spec Playwright shortcuts. | No direct Playwright test scripts remain outside targeted lane scripts. |

## Accepted Technical Debt

| Item | Reason retained |
| --- | --- |
| `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` | Still a large physical file, but it is isolated to the `workspace-contract` lane and was not touched by this cleanup. |
| `scripts/run-targeted-test-lanes.mjs` | Still physically monolithic; this closeout removed fallback routing behavior without performing a broader runner module split. |
| `scripts/audit-playwright-test-locations.mjs` | Broad static audit remains intentional and zero-browser. |
| `tests/playwright/tools/CollisionInspectorV2.spec.mjs` | Retained as a targeted tool-runtime fixture pending any future ownership-specific split. |
