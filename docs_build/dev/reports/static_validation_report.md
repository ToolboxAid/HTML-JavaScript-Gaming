# Static Validation Report

Generated: 2026-06-05T00:18:28.227Z
Status: PASS
Static only: No
Dry run: No

## Requested Lanes

- game-design

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
| targeted file manifests | PASS | game-design:c91e3e832a8647ab |
| persistent lane manifests | PASS | game-design:GENERATED |
| lane warm-start reuse | PASS | game-design:GENERATED |
| dependency hydration reuse | PASS | game-design:GENERATED |
| lane input graph expansion | PASS | No inputs escaped manifest scope. |
| scoped discovery targets | PASS | tests/playwright/tools/GameDesignMockRepository.spec.mjs |
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
