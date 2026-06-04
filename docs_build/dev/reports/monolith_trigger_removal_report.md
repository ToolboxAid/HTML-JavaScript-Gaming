# Monolith Trigger Removal Report

Generated: 2026-06-04T01:23:26.760Z
Status: PASS

## Removed Broad Execution Triggers

| Trigger | Status | Before | After |
| --- | --- | --- | --- |
| run-targeted-test-lanes.mjs with no --lane/--lanes/--all | REMOVED | no lane arguments selected all runtime lanes by default | safe no-lane mode; no runtime lanes execute |
| npm run test:workspace-v2 | REDIRECTED | direct deprecated Workspace Manager V2 Playwright spec | node ./scripts/run-targeted-test-lanes.mjs --lane workspace-contract |
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
| none | none | PASS | none | No direct Playwright scripts remain outside targeted lane scripts. |

## Execution Safeguards

No-argument safe mode active for this invocation: No
Scheduled runtime lanes: workspace-contract
Executed lanes: workspace-contract
Skipped lanes: tool-runtime, game-runtime, integration, engine-src, samples
Full samples smoke: SKIP - Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.
Unaffected lane execution blocked: Yes

## Findings

No accidental Playwright-wide startup or broad lane escalation triggers remain in the targeted lane path.

## Enforcement Notes

- Broad execution requires explicit --all or an explicitly named static audit command.
- Deterministic setup failures still stop before runtime launch.
- Unaffected lanes stay skipped unless selected by --lane or --lanes.
- Remaining direct Playwright scripts are explicit single-tool specs, not Playwright-wide discovery.
