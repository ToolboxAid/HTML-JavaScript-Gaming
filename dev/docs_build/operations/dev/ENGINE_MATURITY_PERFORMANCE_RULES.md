# Engine Maturity Performance Rules

## Benchmark Entry Points
1. command execution latency surrogate (deterministic units)
2. overlay render/update frame workload surrogate
3. provider polling/snapshot workload surrogate
4. panel show/hide/toggle workload surrogate
5. preset apply/reset workload surrogate

## Benchmark Suite Contract
All benchmark suites should define:
- `contractId`
- `contractVersion`
- `suiteId`
- `thresholds[]` (`stage`, `maxUnits`, `label`, `severity`)
- `missingStageBehavior` (`fail|skip`)

## Measurement Rules
- compare debug-disabled and debug-enabled scenarios where relevant
- measure cold-open and steady-state separately
- record environment/sample/scenario metadata
- keep benchmark signals deterministic for CI reproducibility

## Regression Rules
- threshold failures are explicit regressions
- repeated regressions block maturity promotion
- no always-on heavy polling when debug is idle
- missing expected benchmark stages fail unless explicitly marked `skip`
