# Lane Deduplication Report

Generated: 2026-05-26T19:12:03.837Z
Status: PASS

## Summary

Raw lane requests: tool-runtime, tool-runtime, integration, integration
Unique scheduled lanes: tool-runtime, integration
Prevented duplicate lane executions: 2
Prevented browser launches: 4
Prevented Workspace lane reruns: 0

## Duplicate Requests

| Lane | Request Count | Duplicate Executions Prevented | Browser Launches Prevented | Status |
| --- | --- | --- | --- | --- |
| tool-runtime | 2 | 1 | 3 | DEDUPED |
| integration | 2 | 1 | 1 | DEDUPED |

## Enforcement Notes

- Duplicate lane requests are collapsed before validation and runtime scheduling.
- Already validated targeted lanes are not executed again in the same run.
- Duplicate Workspace V2 lane requests are counted and suppressed before npm invocation.
- Duplicate dependency chains cannot cause repeated Playwright/browser startup for the same targeted lane.
