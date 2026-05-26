# Retry Suppression Report

Generated: 2026-05-26T21:52:45.137Z
Status: WARN

## Summary

Deterministic failures suppressed: 4
Prevented reruns: 4
Prevented browser launches: 0
Prevented broad lane escalation: 4
Prevented repeated lane hydration: 0

## Retry Decisions

| Fingerprint | Lane | Category | Retry Decision | Reason |
| --- | --- | --- | --- | --- |
| 8a34b1f6897ef32e | invalid-targeted-closeout-lane | deterministic setup failure | Suppressed | Automatic retry is suppressed because deterministic setup failures must be fixed before runtime. |
| bfa111cdb8feb351 | setup | deterministic setup failure | Suppressed | Automatic retry is suppressed because deterministic setup failures must be fixed before runtime. |
| e9a7db048b3390cb | setup | deterministic setup failure | Suppressed | Automatic retry is suppressed because deterministic setup failures must be fixed before runtime. |
| d77953343f5cb155 | setup | deterministic setup failure | Suppressed | Automatic retry is suppressed because deterministic setup failures must be fixed before runtime. |

## Enforcement Rules

- Deterministic setup failures never trigger automatic reruns.
- Deterministic targeted-lane failures never escalate into broad lanes.
- Deterministic preflight failures prevent repeated browser startup.
- Targeted retries may run only for explicitly classified runtime or flaky/transient failures.
- Targeted retries must preserve the affected lane scope and must not rerun unaffected lanes.

## Runtime Savings Observations

- Suppressed setup failures avoid repeated Playwright/browser initialization.
- Suppressed setup failures avoid repeated Workspace/global lane startup.
- Suppressed setup failures avoid repeated lane hydration after deterministic validation failure.
- Runtime failures are reported without broad fallback execution.
