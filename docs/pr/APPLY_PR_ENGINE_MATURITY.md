# APPLY_PR_ENGINE_MATURITY

## Purpose
Define how the later implementation PR should be applied after the maturity build slice is accepted.

## Apply Rules
- Apply only approved surfaces from the plan/build docs.
- Do not widen public APIs during apply.
- Do not modify roadmap wording or structure.
- Keep changes small, surgical, and reversible.
- Preserve docs history in `docs/pr/`.

## Apply Sequence
1. Promote approved stable debug APIs.
2. Add plugin lifecycle seams with internal isolation.
3. Attach version metadata/compatibility documentation.
4. Wire benchmark entry points or benchmark hooks if in scope.
5. Refresh docs/dev reports and active controls.

## Verification
- Public/internal boundary still matches inventory.
- Existing debug console/overlay behavior remains intact.
- No sample-level hacks are reclassified as engine contracts.
- Versioning/deprecation notes exist for promoted surfaces.
- Benchmark expectations are measurable and documented.

## Rollback Guidance
- Revert newly promoted public surfaces first.
- Remove plugin-facing exports before touching internals.
- Preserve docs/reports for post-mortem comparison.

## Done Condition
The APPLY PR is complete when the promoted maturity surfaces are implemented without breaking current debug usage and all docs/dev control files reflect the applied state.
