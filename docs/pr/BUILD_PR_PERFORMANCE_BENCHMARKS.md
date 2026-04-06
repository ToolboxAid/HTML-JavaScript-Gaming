Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_PERFORMANCE_BENCHMARKS.md

# BUILD_PR_PERFORMANCE_BENCHMARKS

## Purpose
Build and implement the approved performance-benchmarks slice with deterministic thresholds and explicit regression reporting.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Implemented Build Scope
- Added `tools/shared/performanceBenchmarks.js`:
  - benchmark suite contract creation
  - default benchmark suite definition
  - threshold evaluation against profiler samples
  - structured benchmark reports and summary text
- Added `tests/tools/PerformanceBenchmarks.test.mjs`:
  - suite metadata validation
  - pass/fail threshold validation
  - missing-stage fail behavior
  - missing-stage skip behavior
- Integrated benchmark test into `tests/run-tests.mjs`
- Updated maturity docs and reports for benchmark ownership and validation

## Deterministic Benchmark Rules
- benchmark execution evaluates normalized sample units
- regressions are explicit threshold failures
- missing stages are policy-driven (`fail` by default, optional `skip`)
- result contract is structured for CI/debug ingestion

## Guardrails
- no engine core API changes
- no gameplay/runtime feature expansion
- no destructive changes
- no unrelated refactors

## Validation Targets
- syntax checks pass for touched JS files
- benchmark tests and profiler regression tests pass
- roadmap bracket update is bracket-only

## Apply Handoff
`APPLY_PR_PERFORMANCE_BENCHMARKS` should package only benchmark-scope files and reports.
