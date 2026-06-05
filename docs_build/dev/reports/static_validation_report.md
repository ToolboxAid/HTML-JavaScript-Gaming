# Static Validation Report

Generated: 2026-06-05T12:42:54.998Z
Status: PASS
Static only: No
Dry run: No

## Requested Lanes

- build-path

## Prevented Launches

Count: 0
Reason: No deterministic static validation failure was found.

## Checks

| Check | Status | Details |
| --- | --- | --- |
| lane ownership and file placement | PASS | Playwright structure audit passed. |
| invalid filename detection | PASS | Covered by Playwright structure audit. |
| missing import detection | PASS | Covered by Playwright structure audit relative import checks. |
| missing fixture detection | PASS | No missing fixture findings. |
| targeted file manifests | PASS | build-path:e55c4b6606b057c8 |
| persistent lane manifests | PASS | build-path:INVALIDATED |
| lane warm-start reuse | PASS | build-path:INVALIDATED |
| dependency hydration reuse | PASS | build-path:INVALIDATED |
| lane input graph expansion | PASS | No inputs escaped manifest scope. |
| scoped discovery targets | PASS | tests/playwright/tools/BuildPathProgressSimplification.spec.mjs |
| broad scan prevention | PASS | Discovery map read 5 targeted file(s)/helper(s); lane-directory enumeration is delegated only to standalone broad audit mode. |
| invalid lane target detection | PASS | No invalid lane target findings. |
| Windows quoting hazard detection | PASS | No shell-sensitive grep hazards found. |
| duplicate lane registration detection | PASS | No duplicate lane registrations found. |
| invalid grep pattern detection | PASS | No invalid grep pattern findings. |

## Fast-Fail Reasons

No fast-fail reasons. Playwright lanes may proceed when selected.

## Runtime Savings Observations

- Static validation runs before browser launch.
- Structural failures stop Workspace V2, tool-runtime, integration, and sample Playwright lanes before browser startup.
- Combined lane execution can validate multiple selected lanes through one Node runner process.
- Playwright is invoked through the Node CLI entrypoint to avoid shell quoting discovery failures.
