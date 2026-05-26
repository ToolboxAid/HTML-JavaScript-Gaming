# Monolith Trigger Removal Report

Generated: 2026-05-26T21:52:45.186Z
Status: PASS

## Removed Broad Execution Triggers

| Trigger | Status | Before | After |
| --- | --- | --- | --- |
| run-targeted-test-lanes.mjs with no --lane/--lanes/--all | REMOVED | no lane arguments selected all runtime lanes by default | safe no-lane mode; no runtime lanes execute |
| npm run test:workspace-v2 | REDIRECTED | direct playwright test WorkspaceManagerV2.spec.mjs | node ./scripts/run-targeted-test-lanes.mjs --lane workspace-contract |
| nested Workspace lane startup | REMOVED | workspace-contract invoked npm run test:workspace-v2 | workspace-contract command uses the Node Playwright CLI directly |

## Remaining Broad Discovery Callers

| Caller | Status | Reason |
| --- | --- | --- |
| npm run test:audit:locations | EXPLICIT_STATIC | Standalone ownership audit may inspect all Playwright buckets but does not launch browsers. |
| npm run test:playwright:structure | EXPLICIT_STATIC | Standalone structure audit may inspect all Playwright buckets but remains zero-browser. |
| --all | EXPLICIT_OPT_IN | All-lane execution remains available only through explicit CLI opt-in. |

## Remaining Direct Playwright Scripts

| Script | Risk | Status | Command | Reason |
| --- | --- | --- | --- | --- |
| test:asset-manager-v2 | LOW | INFO | playwright test tests/playwright/tools/AssetManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list | Script names explicit spec files and is not a Playwright-wide startup trigger. |
| test:preview-generator-v2 | LOW | INFO | playwright test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs --project=playwright --workers=1 --reporter=list | Script names explicit spec files and is not a Playwright-wide startup trigger. |

## Execution Safeguards

No-argument safe mode active for this invocation: No
Scheduled runtime lanes: none
Executed lanes: none
Skipped lanes: workspace-contract, tool-runtime, game-runtime, integration, engine-src, samples
Full samples smoke: SKIP - Skipped because runner preflight failed before any samples lane decision could execute.
Unaffected lane execution blocked: Yes

## Findings

No accidental Playwright-wide startup or broad lane escalation triggers remain in the targeted lane path.

## Enforcement Notes

- Broad execution requires explicit --all or an explicitly named static audit command.
- Deterministic setup failures still stop before runtime launch.
- Unaffected lanes stay skipped unless selected by --lane or --lanes.
- Remaining direct Playwright scripts are explicit single-tool specs, not Playwright-wide discovery.
