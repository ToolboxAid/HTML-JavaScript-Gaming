# PR_26175_DELTA_008-replay-clone-service-tests

## Summary

Team Delta moved `ReplayTimeline` clone operations onto the shared runtime clone helper and added replay service tests for the no-`structuredClone` fallback path.

The replay model and replay system already used `cloneRuntimeValue(...)`; this PR finishes the timeline surface so replay snapshots, returned entries, and replacement frames use the same shared clone behavior.

## Scope

- Team: Delta
- Branch: `PR_26175_DELTA_008-replay-clone-service-tests`
- Runtime file changed: `src/engine/replay/ReplayTimeline.js`
- Test file changed: `tests/replay/ReplayTimeline.test.mjs`
- Service test command added: `npm run test:service:replay-clone`
- Site-wide command preserved: `npm test`

## Runtime Impact

PASS - Replay timeline cloning remains backward compatible and now works when `structuredClone` is unavailable.

## Requirement Checklist

| Requirement | Status | Notes |
|---|---|---|
| One PR purpose only | PASS | Replay clone service testability only. |
| Team Delta ownership only | PASS | Replay runtime and shared runtime test coverage are Delta-owned. |
| No team-specific test runner | PASS | No Delta-named runner or command added. |
| No `scripts/run-delta-runtime-validation.mjs` | PASS | File was not added. |
| No `test:delta-runtime` | PASS | Script was not added. |
| Testing organized by service/page level | PASS | Added `test:service:replay-clone`. |
| Keep `npm test` as site-wide command | PASS | Existing `npm test` is unchanged. |
| No UI changes | PASS | No UI files changed. |
| No browser-owned product data | PASS | Replay tests use in-memory runtime snapshots only. |
| No silent fallbacks or hidden defaults | PASS | Fallback clone path is explicit through `cloneRuntimeValue(...)`. |

## Validation Lane Report

| Command | Status | Notes |
|---|---|---|
| `node --check src/engine/replay/ReplayTimeline.js` | PASS | Replay timeline syntax valid. |
| `node --check tests/replay/ReplayTimeline.test.mjs` | PASS | Replay test syntax valid. |
| `npm run test:service:replay-clone` | PASS | 2 targeted replay test files passed. |
| `git diff --check` | PASS | No whitespace errors before report generation. |
| `npm run codex:review-artifacts` | PASS | Regenerated `codex_review.diff` and `codex_changed_files.txt`. |

## Manual Validation Notes

- Confirmed `ReplayTimeline` no longer calls `structuredClone` directly.
- Confirmed returned timeline entries are cloned and cannot mutate stored snapshots.
- Confirmed replacement snapshots are cloned before storage.
- Playwright was not run; this is Node replay service coverage.

## ZIP

Expected repo-structured delta ZIP:

`tmp/PR_26175_DELTA_008-replay-clone-service-tests_delta.zip`

