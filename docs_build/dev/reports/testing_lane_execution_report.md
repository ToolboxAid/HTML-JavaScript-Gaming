# Testing Lane Execution Report

Generated: 2026-06-03T17:55:20.082Z
Dry run: No

## Summary

PASS: 1
WARN: 0
FAIL: 0
SKIP: 5
Total lane elapsed time: 0ms
Actual browser launches: 0

## Full Samples Smoke

Status: SKIP
Reason: Targeted samples lane may run, but full samples smoke remains skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: SKIP
Reason: No selected lane requires Playwright test-location preflight.
Command: not run
Details: none

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: samples
Reused runtime sessions: 0
Reused lane snapshots: 0
Reused warm-start lanes: 0
Reused dependency hydration: 0
Prevented graph rebuilds: 0
Prevented redundant initialization: 0
Prevented redundant browser launches: 0
Prevented redundant lane execution: 5

## Validation Cache

Cached validations reused: 16
Validation computations: 9

## Failure Fingerprints

Status: PASS
Deterministic setup failures: 0
Runtime failures: 0
Flaky/transient failures: 0
Infrastructure failures: 0
Prevented reruns: 0
Prevented browser launches: 0
Prevented broad lane escalation: 0

## Discovery Scope

Status: PASS
Target files: none
Required shared helpers: none
Required fixtures: none
Targeted file/helper reads: 0
Cached discovery reuse: Yes
Prevented fallback expansion: Yes; no ownership or scope blocker widened into broad discovery.

## Targeted File Manifests

Status: PASS
Generated manifests: samples:PASS
Prevented discovery expansion: Yes
Prevented redundant scans: 0
Persistent manifest events: samples:GENERATED

## Warm-Start Reuse

Status: PASS
Warm-start events: samples:SKIP
Dependency hydration events: samples:SKIP
Prevented redundant initialization: 0
Prevented helper resolution passes: 0
Prevented fixture ownership traversal: 0

## Lane Snapshots

Status: PASS
Snapshot events: samples:SKIP
Reused snapshots: 0
Invalidated snapshots: 0
Prevented graph rebuilds: 0
Prevented redundant dependency traversal: 0
Prevented fixture/helper graph assembly: 0

## Lane Deduplication

Prevented duplicate lane executions: 0
Prevented browser launches from duplicate lane requests: 0
Prevented Workspace lane reruns: 0

## Lanes

| Lane | Status | Elapsed | Browser Launches | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Root tools future-state navigation and Tool Template V2 contract | repo-served root tools page; Tool Template V2 future-state page; Theme V2 shared partials and assets |
| tool-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | First-class tool runtime behavior | tool-specific mocked repo/file picker inputs; explicit manifest/toolState launch contexts |
| game-runtime | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Deprecated old_games reference coverage |  |
| integration | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | Workspace, tool, game index, and manifest handoff behavior | repo game manifests; manifest preview asset roles; repo-served browser pages |
| engine-src | SKIP | 0ms | 0 | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | PASS | 0ms | 0 | old_samples are deprecated playable references and are excluded from active automated validation. | Deprecated old_samples reference coverage |  |

## Slowest Tests

| Lane | Duration | Test |
| --- | --- | --- |
| none | 0ms | No Playwright test-duration lines were emitted for this run. |

## Commands

### workspace-contract
- SKIP

### tool-runtime
- SKIP

### game-runtime
- SKIP

### integration
- SKIP

### engine-src
- SKIP

### samples
- SKIP
