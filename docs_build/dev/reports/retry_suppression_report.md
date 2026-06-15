# Retry Suppression Report

Generated: 2026-06-15T17:50:17.749Z
Status: PASS

## Summary

Deterministic failures suppressed: 0
Prevented reruns: 0
Prevented browser launches: 0
Prevented broad lane escalation: 0
Prevented repeated lane hydration: 0

## Retry Decisions

| Fingerprint | Lane | Category | Retry Decision | Reason |
| --- | --- | --- | --- | --- |
| none | none | none | No retry needed | No failures were observed. |

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
