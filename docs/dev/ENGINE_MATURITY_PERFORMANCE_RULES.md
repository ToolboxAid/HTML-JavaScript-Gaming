# Engine Maturity Performance Rules

## Purpose
Define benchmark entry points and rules for debug-surface maturity.

## Benchmark Entry Points
1. command execution latency
2. overlay render/update frame cost
3. provider snapshot/poll overhead
4. panel show/hide/toggle cost
5. preset apply/reset latency

## Measurement Rules
- compare debug-disabled vs debug-enabled modes
- measure cold-open and steady-state separately
- capture environment/sample/scenario metadata
- use consistent sample scenes for trend comparison

## Regression Rules
- repeated regressions block maturity promotion
- regressions require mitigation notes before apply closeout
- avoid always-on heavy polling when debug surfaces are idle

## Acceptance
- no user-visible debug latency regressions in normal workflows
- no persistent high-cost background work when debug is disabled
