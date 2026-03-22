Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_96.md

# PLAN_PR — Sample96 - Performance Metrics Panel

## Capability
Performance Metrics Panel

## Goal
Add a reusable performance metrics panel so runtime timing and system-level diagnostics can be observed during samples.

## Engine Scope
- Implement reusable metrics collection and presentation hooks in engine/debug paths
- Expose core runtime measurements without scene-owned instrumentation
- Keep the panel optional and non-invasive

## Sample Scope
- Demonstrate visible runtime metrics in a sample panel
- Show useful measurements such as frame timing or system counts where available
- Follow Sample01 structure exactly

## Acceptance Targets
- Metrics panel displays useful runtime information
- Instrumentation is engine-owned and reusable
- Sample remains proof-only with no rule violations

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
