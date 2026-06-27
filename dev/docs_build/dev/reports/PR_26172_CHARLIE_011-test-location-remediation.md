# PR_26172_CHARLIE_011 Test Location Remediation

## Purpose

Apply PR_035 Test Structure Standardization to remaining obvious non-canonical test locations.

## Selected Move Set

Moved only low-risk engine-core unit tests with obvious canonical destinations:

| Old Path | New Path | Reason |
| --- | --- | --- |
| `tests/core/FrameClock.test.mjs` | `tests/engine/core/FrameClock.test.mjs` | Engine core unit test for `src/engine/core/FrameClock.js`. |
| `tests/core/FixedTicker.test.mjs` | `tests/engine/core/FixedTicker.test.mjs` | Engine core unit test for `src/engine/core/FixedTicker.js`. |
| `tests/core/RuntimeMetrics.test.mjs` | `tests/engine/core/RuntimeMetrics.test.mjs` | Engine core unit test for `src/engine/core/RuntimeMetrics.js`. |

Ambiguous tests were not moved.

## Scope

| File | Change |
| --- | --- |
| `tests/engine/core/FrameClock.test.mjs` | Moved from `tests/core/` and updated import path. |
| `tests/engine/core/FixedTicker.test.mjs` | Moved from `tests/core/` and updated import path. |
| `tests/engine/core/RuntimeMetrics.test.mjs` | Moved from `tests/core/` and updated import path. |
| `tests/run-tests.mjs` | Updated explicit runner imports to new canonical paths. |
| `scripts/run-targeted-test-lanes.mjs` | Updated engine-src lane target paths to new canonical paths. |
| `docs_build/dev/reports/PR_26172_CHARLIE_011-test-location-remediation.md` | Added this PR report. |
| `docs_build/dev/reports/codex_review.diff` | Refreshed Codex review diff. |
| `docs_build/dev/reports/codex_changed_files.txt` | Refreshed changed-file list. |

## Validation

| Validation | Status | Result |
| --- | --- | --- |
| `node scripts/run-node-test-files.mjs tests/engine/core/FrameClock.test.mjs tests/engine/core/FixedTicker.test.mjs tests/engine/core/RuntimeMetrics.test.mjs` | PASS | 3/3 targeted node test files passed. |
| `npm run validate:canonical-structure` | PASS | Guardrail passed; approved legacy exceptions dropped from 498 to 495 after the three moves. |
| `rg -n 'tests/core/(FrameClock\|FixedTicker\|RuntimeMetrics)\\.test\\.mjs' scripts tests package.json` | PASS | No old active path references remain. |
| `rg -n '\\./core/(FrameClock\|FixedTicker\|RuntimeMetrics)\\.test\\.mjs' scripts tests package.json` | PASS | No old runner import references remain. |
| `node --check scripts/run-targeted-test-lanes.mjs` | PASS | Updated lane runner syntax is valid. |
| `node --check tests/run-tests.mjs` | PASS | Updated explicit test runner syntax is valid. |
| `node --check tests/engine/core/FrameClock.test.mjs` | PASS | Moved test syntax is valid. |
| `node --check tests/engine/core/FixedTicker.test.mjs` | PASS | Moved test syntax is valid. |
| `node --check tests/engine/core/RuntimeMetrics.test.mjs` | PASS | Moved test syntax is valid. |
| `git diff --check` | PASS | No whitespace errors. |
| ZIP artifact exists | PASS | `tmp/PR_26172_CHARLIE_011-test-location-remediation_delta.zip` generated. |

## Stop Gate

Status: NOT TRIGGERED.

Three low-risk engine-core tests had clear canonical destinations and were safe to move.

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack`. |
| Worktree clean before PR_011 edits | PASS | PR_010 was committed and pushed before this scope. |
| Local/origin sync before PR_011 edits | PASS | `0 0` after PR_010 push. |
| Main merge avoided | PASS | No merge to `main` was performed. |
| Returned to main avoided | PASS | Work remained on the Charlie stack branch. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Use prior audit findings | PASS | PR_001 listed `tests/core/` as non-canonical; PR_035 canonicalizes engine tests under `tests/engine/{feature-name}/`. |
| Move only low-risk tests | PASS | Moved three small engine core unit tests only. |
| Use obvious canonical destinations | PASS | Tests now live under `tests/engine/core/`. |
| Update references | PASS | Updated `tests/run-tests.mjs` and `scripts/run-targeted-test-lanes.mjs`. |
| Preserve behavior | PASS | Targeted moved tests passed. |
| Do not move ambiguous tests | PASS | Other `tests/core/` files were left in place. |
| Do not modify runtime source | PASS | Only tests, validation runner references, and reports changed. |
| Confirm new paths follow Project Instructions | PASS | Paths follow `tests/engine/{feature-name}/`. |
| ZIP artifact exists | PASS | ZIP generated under `tmp/`. |

## Manual Validation Notes

- Historical report references under `docs_build/` were not rewritten.
- `tests/core/` still contains other legacy tests that require separate impact review before moving.
- This PR intentionally avoids broad test-tree restructuring.
