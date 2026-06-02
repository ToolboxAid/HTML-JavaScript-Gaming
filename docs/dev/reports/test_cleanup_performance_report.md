# Test Cleanup Performance Report

Generated: 2026-06-02T20:52:58.656Z
Status: PASS

## Cost Summary

Total measured lane elapsed time: 0ms
Actual browser launch count: 0
Scheduled browser launch count: 1
Baseline browser launch count: 1
Skipped lanes: 0
Reused manifests: 0
Reused snapshots: 0
Cached validations reused: 18
Prevented broad execution: 2
Prevented reruns: 0
Prevented redundant browser launches: 0
Prevented graph rebuilds: 0
Prevented redundant dependency traversal: 0

## Lane Elapsed Time

| Lane | Status | Elapsed | Browser Launches | Reason |
| --- | --- | --- | --- | --- |
| none | SKIP | 0ms | 0 | Zero-browser validation only; runtime lanes were not launched. |

## Slowest Tests

| Lane | Duration | Test | Command |
| --- | --- | --- | --- |
| none | 0ms | No Playwright test-duration lines were emitted for this run. | none |

## Prevented Broad Execution

- Full samples smoke stayed skipped/on-request.
- Unselected lane directories stayed outside targeted discovery.

## Runtime Savings Observations

- Performance reporting is generated from the targeted lane runner without launching additional broad suites.
- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.
- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.
- Full samples smoke remains skipped unless an explicit samples scope is active.
