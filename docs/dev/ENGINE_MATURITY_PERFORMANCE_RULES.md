# Engine Maturity Performance Rules

## Benchmark Entry Points
1. command execution latency
2. overlay render/update frame cost
3. provider polling/snapshot overhead
4. panel show/hide/toggle cost
5. preset apply/reset latency

## Measurement Rules
- compare debug-disabled and debug-enabled modes
- measure cold-open and steady-state separately
- record environment/sample/scenario metadata

## Regression Rules
- repeated regressions block maturity promotion
- no always-on heavy polling when debug is idle
