# Static Validation Report

Generated: 2026-05-26T21:52:45.129Z
Status: FAIL
Static only: No
Dry run: No

## Requested Lanes

- invalid-targeted-closeout-lane

## Prevented Launches

Count: 0
Reason: No deterministic static validation failure was found.

## Checks

| Check | Status | Details |
| --- | --- | --- |
| lane ownership and file placement | SKIP | No selected lane requires Playwright structure audit. |
| invalid filename detection | SKIP | Covered by Playwright structure audit. |
| missing import detection | SKIP | Covered by Playwright structure audit relative import checks. |
| missing fixture detection | PASS | No missing fixture findings. |
| targeted file manifests | SKIP | No lane manifests generated. |
| persistent lane manifests | SKIP | No persistent manifest events. |
| lane warm-start reuse | SKIP | No warm-start events. |
| dependency hydration reuse | SKIP | No hydration events. |
| lane input graph expansion | PASS | No inputs escaped manifest scope. |
| scoped discovery targets | PASS | No Playwright discovery targets selected. |
| broad scan prevention | PASS | Discovery map read 0 targeted file(s)/helper(s); lane-directory enumeration is delegated only to standalone broad audit mode. |
| invalid lane target detection | FAIL | Unknown lane invalid-targeted-closeout-lane |
| Windows quoting hazard detection | PASS | No shell-sensitive grep hazards found. |
| duplicate lane registration detection | PASS | No duplicate lane registrations found. |
| invalid grep pattern detection | PASS | No invalid grep pattern findings. |

## Fast-Fail Reasons

- Unknown lane requested: invalid-targeted-closeout-lane

## Runtime Savings Observations

- Static validation runs before browser launch.
- Structural failures stop Workspace V2, tool-runtime, integration, and sample Playwright lanes before browser startup.
- Combined lane execution can validate multiple selected lanes through one Node runner process.
- Playwright is invoked through the Node CLI entrypoint to avoid shell quoting discovery failures.
