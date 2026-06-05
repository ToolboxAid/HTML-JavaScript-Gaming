# Lane Runtime Optimization Report

Generated: 2026-06-05T21:27:53.718Z
Status: PASS

## Runtime Cost Summary

Reused runtime sessions: 0
Reused lane snapshots: 0
Reused warm-start lanes: 0
Reused dependency hydration: 0
Prevented graph rebuilds: 0
Prevented redundant initialization: 0
Prevented redundant browser launches: 0
Prevented redundant lane execution: 15
Baseline Playwright/browser launches: 0
Scheduled Playwright/browser launches: 0

## Scheduled Lane Order

No runtime lanes are eligible for scheduling.

## Scheduling Blockers

No zero-browser, compilation, or dependency blockers were found.

## Lane Plans

| Lane | Snapshot | Warm Start | Hydration | Baseline Browser Launches | Scheduled Browser Launches | Commands | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | SKIP | SKIP | SKIP | 0 | 0 | none | No dependency-eligible targeted lanes were scheduled. |

## Runtime Savings Observations

- Zero-browser preflight, lane compilation, and dependency validation run once per targeted runner invocation.
- Reused lane snapshots avoid rebuilding identical targeted execution graphs.
- Validated warm-start lanes reuse deterministic initialization state when manifest and dependency hashes are unchanged.
- Reused dependency hydration avoids repeated helper resolution and fixture ownership traversal for compatible targeted runs.
- Compatible Playwright specs with matching options are kept in shared CLI invocations to avoid redundant browser startup.
- Unselected lanes are not scheduled after isolated targeted lane failures.
- Workspace V2 and samples lanes are not escalated unless explicitly selected.
