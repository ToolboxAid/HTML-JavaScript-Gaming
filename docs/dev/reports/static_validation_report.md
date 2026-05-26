# Static Validation Report

Generated: 2026-05-26T19:04:26.914Z
Status: PASS
Static only: No
Dry run: No

## Requested Lanes

- tool-runtime
- integration

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
| invalid lane target detection | PASS | No invalid lane target findings. |
| Windows quoting hazard detection | PASS | Lane tool-runtime grep pattern is passed as a literal Node argv value: launch guard|temporary UAT context|rejects non-Workspace |
| duplicate lane registration detection | PASS | No duplicate lane registrations found. |
| invalid grep pattern detection | PASS | No invalid grep pattern findings. |

## Fast-Fail Reasons

No fast-fail reasons. Playwright lanes may proceed when selected.

## Runtime Savings Observations

- Static validation runs before browser launch.
- Structural failures stop Workspace V2, tool-runtime, integration, and sample Playwright lanes before browser startup.
- Combined lane execution can validate multiple selected lanes through one Node runner process.
- Playwright is invoked through the Node CLI entrypoint to avoid shell quoting discovery failures.
