# Lane Deduplication Report

Generated: 2026-06-05T19:46:03.265Z
Status: PASS

## Summary

Raw lane requests: asset-tool
Unique scheduled lanes: asset-tool
Prevented duplicate lane executions: 0
Prevented browser launches: 0
Prevented Workspace lane reruns: 0

## Duplicate Requests

| Lane | Request Count | Duplicate Executions Prevented | Browser Launches Prevented | Status |
| --- | --- | --- | --- | --- |
| none | 0 | 0 | 0 | No duplicate lane requests in this run. |

## Enforcement Notes

- Duplicate lane requests are collapsed before validation and runtime scheduling.
- Already validated targeted lanes are not executed again in the same run.
- Duplicate Workspace V2 lane requests are counted and suppressed before npm invocation.
- Duplicate dependency chains cannot cause repeated Playwright/browser startup for the same targeted lane.
